# Jasa Kayu Profesional - Jasa Kayu Profesional
Website resmi jasa kayu profesional terpercaya di Jabodetabek. Spesialis lantai kayu, dinding kayu, tangga kayu, plafon kayu, furniture kayu, pergola & decking outdoor. Pengalaman 30+ tahun sejak 1990 dengan koneksi luas supplier kayu berkualitas Grade A.

## Layanan Utama
- Jasa pasang lantai kayu (jati, merbau, bengkirai)
- Dinding kayu & wall cladding
- Tangga kayu artistik
- Plafon kayu & ceiling
- Furniture kayu custom
- Pergola & decking outdoor

## Wilayah Layanan
Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi) dan sekitarnya

Hubungi kami: +62 812-8313-5295
Website: https://jasakayuprofesional.com/

## Search Console CLI
Repo ini sekarang punya helper lokal untuk Google Search Console supaya tidak perlu ngoprek browser tiap kali cek data.

Setup sekali:
1. Aktifkan Search Console API di Google Cloud project.
2. Buat OAuth Client ID tipe `Desktop app`.
3. Download JSON client-nya ke `.gsc/oauth-client.json`.
4. Jalankan `npm run gsc:login`.

Command utama:
- `npm run gsc:sites`
- `npm run gsc:summary`
- `npm run gsc:sitemaps`

Catatan:
- Token login disimpan lokal di `.gsc/token.json` dan sudah di-ignore dari git.
- Contoh format client file ada di `.gsc/oauth-client.example.json`.
- API Search Console tidak menyediakan seluruh report `Pages/Indexing` seperti di UI, jadi untuk angka indexed pages lengkap tetap perlu lihat Search Console browser.
