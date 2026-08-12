import { next, rewrite } from '@vercel/functions';

export const config = {
  matcher: '/',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const hostname = (request.headers.get('host') || url.hostname)
    .split(':')[0]
    .toLowerCase();

  if (hostname === 'deckulin.jasakayuprofesional.com') {
    url.pathname = '/deck-ulin';
    return rewrite(url);
  }

  return next();
}
