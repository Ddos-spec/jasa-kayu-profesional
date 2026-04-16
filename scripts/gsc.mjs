#!/usr/bin/env node

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const ROOT_DIR = process.cwd();
const DEFAULT_CLIENT_FILE = process.env.GSC_OAUTH_CLIENT_FILE ?? path.join(ROOT_DIR, '.gsc', 'oauth-client.json');
const DEFAULT_TOKEN_FILE = process.env.GSC_TOKEN_FILE ?? path.join(ROOT_DIR, '.gsc', 'token.json');
const DEFAULT_PROPERTY = normalizeProperty(process.env.GSC_DEFAULT_PROPERTY ?? 'sc-domain:jasakayuprofesional.com');
const DEFAULT_DAYS = Number(process.env.GSC_SUMMARY_DAYS ?? 28);
const DEFAULT_DATA_LAG_DAYS = Number(process.env.GSC_DATA_LAG_DAYS ?? 2);

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));

  switch (command) {
    case 'login':
      await login(options);
      break;
    case 'sites':
      await listSites(options);
      break;
    case 'summary':
      await summary(options);
      break;
    case 'sitemaps':
      await listSitemaps(options);
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      break;
  }
}

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const part = rest[index];

    if (!part.startsWith('--')) {
      continue;
    }

    const [rawKey, inlineValue] = part.slice(2).split('=');
    const key = rawKey.trim();

    if (!key) {
      continue;
    }

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const nextPart = rest[index + 1];

    if (!nextPart || nextPart.startsWith('--')) {
      options[key] = true;
      continue;
    }

    options[key] = nextPart;
    index += 1;
  }

  return { command, options };
}

async function login(options) {
  const clientConfig = await loadClientConfig(options.client);
  const tokenFile = resolveTokenFile(options.token);

  await ensureParentDir(tokenFile);

  const { authClient, tokens } = await authorizeWithBrowser(clientConfig);
  const wrappedToken = {
    createdAt: new Date().toISOString(),
    scopes: SCOPES,
    tokens,
  };

  await fs.writeFile(tokenFile, `${JSON.stringify(wrappedToken, null, 2)}\n`, 'utf8');

  const webmasters = google.webmasters({ version: 'v3', auth: authClient });
  const { data } = await webmasters.sites.list();
  const sites = data.siteEntry ?? [];
  const property = normalizeProperty(options.property ?? DEFAULT_PROPERTY);
  const hasDefaultProperty = sites.some((entry) => entry.siteUrl === property);

  console.log(`Saved Search Console token to ${tokenFile}`);
  console.log(`Accessible properties: ${sites.length}`);

  if (hasDefaultProperty) {
    console.log(`Default property is reachable: ${property}`);
  } else {
    console.log(`Default property not found yet: ${property}`);
    console.log('You can still inspect available properties with `npm run gsc:sites`.');
  }
}

async function listSites(options) {
  const authClient = await loadAuthorizedClient(options);
  const webmasters = google.webmasters({ version: 'v3', auth: authClient });
  const { data } = await webmasters.sites.list();
  const sites = (data.siteEntry ?? []).sort((left, right) => left.siteUrl.localeCompare(right.siteUrl));

  if (sites.length === 0) {
    console.log('No Search Console properties are accessible for this token.');
    return;
  }

  console.log('Accessible Search Console properties:');

  for (const site of sites) {
    console.log(`- ${site.siteUrl} (${site.permissionLevel ?? 'unknown'})`);
  }
}

async function listSitemaps(options) {
  const authClient = await loadAuthorizedClient(options);
  const webmasters = google.webmasters({ version: 'v3', auth: authClient });
  const siteUrl = normalizeProperty(options.property ?? DEFAULT_PROPERTY);
  const { data } = await webmasters.sitemaps.list({ siteUrl });
  const sitemaps = data.sitemap ?? [];

  console.log(`Property: ${siteUrl}`);

  if (sitemaps.length === 0) {
    console.log('No submitted sitemaps returned by the API.');
    return;
  }

  for (const sitemap of sitemaps) {
    console.log(`- ${sitemap.path}`);
    console.log(`  last submitted: ${sitemap.lastSubmitted ?? 'unknown'}`);
    console.log(`  last downloaded: ${sitemap.lastDownloaded ?? 'unknown'}`);
    console.log(`  pending URLs: ${sitemap.pending ?? 0}`);
    console.log(`  indexed URLs: ${sitemap.contents?.[0]?.indexed ?? 'unknown'}`);
  }
}

async function summary(options) {
  const authClient = await loadAuthorizedClient(options);
  const webmasters = google.webmasters({ version: 'v3', auth: authClient });
  const siteUrl = normalizeProperty(options.property ?? DEFAULT_PROPERTY);
  const days = clampPositiveInteger(options.days, DEFAULT_DAYS);
  const lagDays = clampNonNegativeInteger(options['lag-days'], DEFAULT_DATA_LAG_DAYS);
  const endDate = offsetDate(new Date(), -lagDays);
  const startDate = offsetDate(endDate, -(days - 1));
  const previousEndDate = offsetDate(startDate, -1);
  const previousStartDate = offsetDate(previousEndDate, -(days - 1));

  const [currentTotals, previousTotals, topQueries, topPages] = await Promise.all([
    getTotals(webmasters, siteUrl, startDate, endDate),
    getTotals(webmasters, siteUrl, previousStartDate, previousEndDate),
    getRows(webmasters, siteUrl, startDate, endDate, 'query'),
    getRows(webmasters, siteUrl, startDate, endDate, 'page'),
  ]);

  console.log(`Property: ${siteUrl}`);
  console.log(`Window: ${startDate} to ${endDate} (${days} days, ${lagDays} day lag)`);
  console.log(`Previous: ${previousStartDate} to ${previousEndDate}`);
  console.log('');
  console.log(`Clicks: ${formatNumber(currentTotals.clicks)} (${formatDelta(currentTotals.clicks - previousTotals.clicks)})`);
  console.log(`Impressions: ${formatNumber(currentTotals.impressions)} (${formatDelta(currentTotals.impressions - previousTotals.impressions)})`);
  console.log(`CTR: ${formatPercent(currentTotals.ctr)} (${formatPercentDelta(currentTotals.ctr - previousTotals.ctr)})`);
  console.log(`Average position: ${formatDecimal(currentTotals.position)} (${formatSignedDecimal(currentTotals.position - previousTotals.position)})`);
  console.log('');
  console.log('Top queries:');
  printRows(topQueries);
  console.log('');
  console.log('Top pages:');
  printRows(topPages);
  console.log('');
  console.log('Note: Search Console API does not expose the full Pages/Indexing overview from the UI, so indexed-page counts still need the browser UI.');
}

async function getTotals(webmasters, siteUrl, startDate, endDate) {
  const { data } = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      rowLimit: 1,
    },
  });

  const row = data.rows?.[0];

  return {
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: row?.ctr ?? 0,
    position: row?.position ?? 0,
  };
}

async function getRows(webmasters, siteUrl, startDate, endDate, dimension) {
  const { data } = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: [dimension],
      rowLimit: 10,
    },
  });

  return data.rows ?? [];
}

function printRows(rows) {
  if (rows.length === 0) {
    console.log('- No data yet');
    return;
  }

  rows.forEach((row, index) => {
    const key = row.keys?.[0] ?? '(unknown)';
    console.log(`${index + 1}. ${key}`);
    console.log(`   clicks ${formatNumber(row.clicks ?? 0)} | impressions ${formatNumber(row.impressions ?? 0)} | ctr ${formatPercent(row.ctr ?? 0)} | position ${formatDecimal(row.position ?? 0)}`);
  });
}

async function loadAuthorizedClient(options = {}) {
  const clientConfig = await loadClientConfig(options.client);
  const tokenFile = resolveTokenFile(options.token);
  const tokenContents = JSON.parse(await fs.readFile(tokenFile, 'utf8'));
  const tokens = tokenContents.tokens ?? tokenContents;
  const authClient = createOAuthClient(clientConfig, pickBaseRedirectUri(clientConfig));

  authClient.setCredentials(tokens);
  await authClient.getAccessToken();

  return authClient;
}

async function loadClientConfig(explicitPath) {
  const clientFile = resolveClientFile(explicitPath);
  const rawConfig = JSON.parse(await fs.readFile(clientFile, 'utf8'));
  const clientConfig = rawConfig.installed ?? rawConfig.web;

  if (!clientConfig?.client_id || !clientConfig?.client_secret) {
    throw new Error(`Invalid OAuth client file: ${clientFile}`);
  }

  return clientConfig;
}

function resolveClientFile(explicitPath) {
  return path.resolve(ROOT_DIR, explicitPath ?? DEFAULT_CLIENT_FILE);
}

function resolveTokenFile(explicitPath) {
  return path.resolve(ROOT_DIR, explicitPath ?? DEFAULT_TOKEN_FILE);
}

async function authorizeWithBrowser(clientConfig) {
  const loopbackBase = pickLoopbackBase(clientConfig);
  const { authClient, code } = await waitForAuthorizationCode(clientConfig, loopbackBase);
  const { tokens } = await authClient.getToken(code);

  authClient.setCredentials(tokens);

  return { authClient, tokens };
}

async function waitForAuthorizationCode(clientConfig, loopbackBase) {
  let timeoutId;
  let callbackPort;

  return new Promise((resolve, reject) => {
    const server = createServer(async (request, response) => {
      try {
        const requestUrl = new URL(request.url, `http://${request.headers.host}`);
        const code = requestUrl.searchParams.get('code');
        const error = requestUrl.searchParams.get('error');

        if (error) {
          response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end(`Google OAuth returned an error: ${error}`);
          reject(new Error(`Google OAuth returned an error: ${error}`));
          return;
        }

        if (!code) {
          response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Missing OAuth code in callback.');
          return;
        }

        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end('<h1>Google Search Console login complete.</h1><p>You can close this tab and return to the terminal.</p>');

        clearTimeout(timeoutId);
        await closeServer(server);

        const redirectUri = withPort(loopbackBase, callbackPort);
        const authClient = createOAuthClient(clientConfig, redirectUri);
        resolve({ authClient, code });
      } catch (error) {
        clearTimeout(timeoutId);
        await closeServer(server);
        reject(error);
      }
    });

    server.once('error', reject);
    server.listen(0, '127.0.0.1', async () => {
      const address = server.address();
      callbackPort = address.port;
      const redirectUri = withPort(loopbackBase, callbackPort);
      const authClient = createOAuthClient(clientConfig, redirectUri);
      const authUrl = authClient.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
      });

      console.log('Opening browser for Google OAuth...');
      console.log(authUrl);
      openInBrowser(authUrl);

      timeoutId = setTimeout(async () => {
        await closeServer(server);
        reject(new Error('Timed out waiting for Google OAuth callback.'));
      }, 180_000);
    });
  });
}

function createOAuthClient(clientConfig, redirectUri) {
  return new google.auth.OAuth2(clientConfig.client_id, clientConfig.client_secret, redirectUri);
}

function pickBaseRedirectUri(clientConfig) {
  const loopbackBase = pickLoopbackBase(clientConfig);
  return withPort(loopbackBase, new URL(loopbackBase).port || undefined);
}

function pickLoopbackBase(clientConfig) {
  const redirectUris = clientConfig.redirect_uris ?? [];
  const candidate = redirectUris.find((entry) => entry.startsWith('http://localhost') || entry.startsWith('http://127.0.0.1'));
  const chosen = candidate ?? 'http://127.0.0.1/oauth2callback';
  const url = new URL(chosen);

  if (!url.pathname || url.pathname === '/') {
    url.pathname = '/oauth2callback';
  }

  url.hostname = '127.0.0.1';
  url.port = '';

  return url.toString();
}

function withPort(baseUri, port) {
  const url = new URL(baseUri);

  if (port) {
    url.port = String(port);
  }

  return url.toString();
}

function normalizeProperty(property) {
  if (!property) {
    return DEFAULT_PROPERTY;
  }

  if (property.startsWith('sc-domain:') || property.startsWith('http://') || property.startsWith('https://')) {
    return property;
  }

  return `sc-domain:${property}`;
}

function openInBrowser(url) {
  const handlers = {
    win32: ['cmd', ['/c', 'start', '', url]],
    darwin: ['open', [url]],
    linux: ['xdg-open', [url]],
  };

  const [command, args] = handlers[process.platform] ?? handlers.linux;
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();
}

async function ensureParentDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function offsetDate(dateInput, offsetDays) {
  const date = new Date(dateInput);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function clampPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function clampNonNegativeInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString('en-US');
}

function formatDecimal(value) {
  return Number(value).toFixed(2);
}

function formatSignedDecimal(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}`;
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatPercentDelta(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${(Number(value) * 100).toFixed(2)}pp`;
}

function formatDelta(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value)}`;
}

async function closeServer(server) {
  await new Promise((resolve) => server.close(resolve));
}

function printHelp() {
  console.log(`Google Search Console helper

Usage:
  node scripts/gsc.mjs login [--client .gsc/oauth-client.json] [--token .gsc/token.json]
  node scripts/gsc.mjs sites [--token .gsc/token.json]
  node scripts/gsc.mjs summary [--property sc-domain:jasakayuprofesional.com] [--days 28] [--lag-days 2]
  node scripts/gsc.mjs sitemaps [--property sc-domain:jasakayuprofesional.com]

Env overrides:
  GSC_OAUTH_CLIENT_FILE
  GSC_TOKEN_FILE
  GSC_DEFAULT_PROPERTY
  GSC_SUMMARY_DAYS
  GSC_DATA_LAG_DAYS
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
