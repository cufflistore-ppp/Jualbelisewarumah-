# JualBeliSewaRumah

Marketplace jual-beli dan sewa rumah modern, responsif, dan berwarna-warni.

## Fitur Utama

- **Login** hanya dengan Google atau Facebook (simulasi)
- **Beranda** menampilkan semua rumah (grid 2 kolom di HP)
- **Halaman Kontrakan** & **Jual Rumah** dengan filter lokasi & harga
- **Detail Rumah** dengan galeri foto (min 5) + video (paket 3)
- **Tombol WhatsApp** langsung ke pemilik dengan pesan otomatis
- **Sistem Paket**:
  - Paket 1 Produk → max 1 rumah, min 5 foto
  - Paket 3 Produk → max 3 rumah, min 5 foto + video
- **Halaman Saya**: profil, status paket, daftar rumah, tambah/edit/hapus
- **Panel Admin**: kelola pengguna, berikan paket, kelola produk
- **Bottom Navigation** floating modern dengan Font Awesome

## Cara Menjalankan

1. Buka folder `JualBeliSewaRumah` di browser (atau gunakan Live Server).
2. Mulai dari `login.html` atau langsung `index.html`.
3. Gunakan akun demo di halaman login untuk testing cepat:

| Akun Demo | Provider | Paket |
|-----------|----------|-------|
| Budi Santoso | Google | Paket 3 Produk |
| Siti Rahayu | Facebook | Paket 1 Produk |
| Andi Wijaya | Google | Belum berlangganan |
| Admin | Google | Admin Panel |

## Alur Pengguna

1. Login dengan Google/Facebook
2. Cari rumah di Beranda / Kontrakan / Jual Rumah
3. Lihat Detail → galeri foto → Hubungi via WhatsApp

## Alur Pemilik Rumah

1. Login
2. Beli paket (hubungi admin via WhatsApp)
3. Admin aktifkan paket di panel admin
4. Masuk halaman Saya → Tambah Rumah
5. Upload min 5 foto + isi data → Simpan
6. Produk muncul di marketplace

## Panel Admin

Akses: login sebagai Admin → otomatis masuk `admin/`

- Dashboard statistik
- Kelola pengguna (aktifkan/nonaktifkan, berikan paket)
- Kelola produk (lihat / hapus)
- Info paket

## Struktur File

```
JualBeliSewaRumah/
├── admin-index.html
├── kontrakan.html
├── jual-rumah.html
├── detail.html
├── login.html
├── saya.html
├── tambah-rumah.html
├── edit-rumah.html
├── paket.html
├── admin/
│   ├── admin-index.html
│   ├── admin-pengguna.html
│   ├── admin-produk.html
│   └── admin-paket.html
├── css/
├── js/
└── assets/
```

## Teknologi

- HTML5 + CSS3 (modern gradient, responsive)
- Vanilla JavaScript
- Font Awesome 6 (semua icon)
- localStorage (penyimpanan data demo)
- Unsplash placeholder images

## Catatan

Ini adalah demo frontend. Login Google/Facebook disimulasikan.  
Pembayaran paket dilakukan manual (admin mengaktifkan setelah konfirmasi transfer).  
Data tersimpan di localStorage browser.
