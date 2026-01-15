# Panduan Penggunaan Gambar di Project Serasi Parket

## Struktur Direktori Gambar

```
src/
├── assets/
│   ├── images/
│   │   ├── products/           # Gambar produk (lantai kayu, tangga, dll)
│   │   ├── portfolio/          # Gambar portofolio proyek
│   │   ├── blog/               # Gambar untuk artikel blog
│   │   ├── testimonials/       # Gambar testimonial
│   │   └── general/            # Gambar umum lainnya
│   └── icons/                  # Ikon-ikon
```

## Cara Menggunakan Gambar

### 1. Menyimpan Gambar
- Simpan gambar dalam format apapun (JPG, PNG, GIF, dll) di direktori `src/assets/images/`
- Gunakan format penamaan kebab-case: `nama-gambar-deskriptif.jpg`
- Gunakan struktur folder yang sesuai dengan kategori gambar

### 2. Menggunakan Gambar di Komponen

#### A. Menggunakan Komponen `<Image>` (otomatis konversi ke WebP)

```astro
---
import { Image } from 'astro:assets';
import contohGambar from '../assets/images/products/nama-gambar.jpg';
---

<Image 
  src={contohGambar} 
  alt="Deskripsi gambar"
  format="webp"        // Secara otomatis mengonversi ke WebP
  width={800}
  height={600}
  loading="lazy"       // Untuk performa loading
  class="gambar-class"
/>
```

#### B. Menggunakan Komponen `<Picture>` (komponen kustom)

```astro
---
import Picture from '../components/common/Picture.astro';
import contohGambar from '../assets/images/products/nama-gambar.jpg';
---

<Picture
  src={contohGambar}
  alt="Deskripsi gambar"
  format="webp"        // Secara otomatis mengonversi ke WebP
  width={800}
  height={600}
  loading="lazy"
  class="gambar-class"
/>
```

#### C. Menggunakan Komponen Galeri

```astro
---
import ImageGallery from '../components/ImageGallery.astro';
import gambar1 from '../assets/images/portfolio/gambar1.jpg';
import gambar2 from '../assets/images/portfolio/gambar2.png';
import gambar3 from '../assets/images/portfolio/gambar3.jpeg';

const galleryImages = [
  { src: gambar1, alt: "Deskripsi gambar 1", caption: "Caption opsional" },
  { src: gambar2, alt: "Deskripsi gambar 2", caption: "Caption opsional" },
  { src: gambar3, alt: "Deskripsi gambar 3", caption: "Caption opsional" }
];
---

<ImageGallery 
  images={galleryImages}
  columns={3}          // Jumlah kolom (1-4)
  spacing="md"         // Spacing antar gambar (sm/md/lg)
/>
```

### 3. Format Gambar yang Didukung

Saat build, Astro akan:
- Mengonversi semua gambar ke format WebP (dan AVIF jika tersedia)
- Menghasilkan berbagai ukuran untuk responsive loading
- Mengoptimasi ukuran file secara otomatis
- Memberikan fallback ke format asli jika WebP tidak didukung

### 4. Tips Penggunaan

- **Simpan gambar dalam kualitas tinggi** di direktori `src/assets/images/`, Astro akan mengoptimasinya saat build
- **Gunakan loading="lazy"** untuk gambar yang tidak terlihat di viewport awal
- **Tentukan width dan height** untuk mencegah layout shift
- **Gunakan alt text** yang deskriptif untuk aksesibilitas dan SEO

### 5. Contoh Halaman Galeri

Lihat contoh implementasi di `src/pages/galeri.astro` untuk panduan lengkap penggunaan komponen galeri dan slider.

## Keunggulan Menggunakan Sistem Ini

1. **Konversi Otomatis**: Gambar otomatis dikonversi ke WebP saat build
2. **Optimasi Performa**: Ukuran file lebih kecil, loading lebih cepat
3. **Responsive**: Berbagai ukuran gambar dihasilkan secara otomatis
4. **Fallback**: Jika WebP tidak didukung, browser akan menggunakan format asli
5. **SEO Friendly**: Alt text dan struktur yang baik untuk SEO