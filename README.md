# 💧 Depot Zam Water - Web App Operasional & POS

Aplikasi web modern, responsif, dan siap produksi untuk operasional **Depot Air Minum Isi Ulang Zam Water**. Dibangun dengan desain visual *clean*, modern, dan bernuansa hijau segar (*fresh water theme*), mengacu secara presisi pada rancangan UI/UX Stitch.

Aplikasi ini menggunakan arsitektur **Serverless Database** berbasis **Google Apps Script** yang terhubung langsung ke **Google Sheets** (tanpa biaya server bulanan / *free tier forever*), serta siap di-push ke **GitHub** dan di-deploy ke **Vercel**.

---

## 🚀 Fitur Utama

### 1. Modul Kasir (POS - Point of Sale)
* **Katalog Produk Dinamis**: Filter kategori instan (*Semua*, *Isi Ulang Galon*, *Galon Baru*, *Botol & Dus*, *Aksesoris*).
* **Keranjang Interaktif**: Tambah item, ubah kuantitas (+/-), hapus item, dan hitung subtotal & total otomatis secara *real-time*.
* **Pilihan Pelanggan**: Integrasi transaksi dengan data pelanggan tetap atau pelanggan *walk-in*.
* **Multi-Metode Pembayaran**:
  * **Tunai**: Pilihan uang pas, pecahan cepat Rp 50.000 & Rp 100.000, serta kalkulasi otomatis uang kembalian.
  * **QRIS**: Simulasi QR Code SVG interaktif, nomor NMID, dan *countdown timer* 5 menit.
  * **Transfer Bank**: Info rekening BCA Depot Zam Water lengkap dengan tombol *copy/salin* nomor rekening satu klik.
* **Cetak Struk Termal 58mm**: Modal pratinjau struk termal realistis, tombol cetak langsung ke printer, dan tombol bagikan struk via WhatsApp.

### 2. Modul Stok & Pelanggan
* **Tab Manajemen Stok**:
  * Visual kapasitas depo (*Total Galon Aktif* dan sirkulasi galon di pelanggan).
  * *Smart Warning Alert Banner*: Peringatan dini jika stok tutup segel atau filter menipis dengan tombol order ke distributor.
  * *Bento Metric Cards*: Status galon terisi, siap isi, dan aksesoris.
  * *Quick Wash Adjuster*: Update cepat penambahan galon selesai cuci (+/-) langsung ke inventaris.
  * *Real-Time Inventory Table*: Kartu status inventaris dengan tombol edit stok cepat.
* **Tab Pelanggan Tetap**:
  * Pencarian instan berdasarkan nama, nomor telepon, atau alamat.
  * Filter kategori pelanggan (*Warung & Toko*, *Perumahan*, *Kantor & Usaha*).
  * Info langganan mingguan & saldo deposit galon fisik.
  * Tombol **WhatsApp** langsung membuka chat dengan pesan pembuka otomatis.
  * Tombol **Buat Pesanan** yang langsung mengarahkan ke kasir POS dengan pelanggan otomatis terpilih.
  * Modal penambahan pelanggan baru yang langsung tersimpan ke Google Sheets.

### 3. Modul Portal Laporan Supir (Driver Portal)
* **Profil Supir & Armada**: Menampilkan status bertugas, nomor armada (*Tossa B-4921-ZAM*), dan trip berjalan.
* **Ringkasan Pengantaran**: Metrik trip selesai, total galon terkirim, dan uang setoran terkumpul.
* **Form Setoran & Laporan Pintar**:
  * Input jumlah galon keluar dan galon kosong kembali dengan tombol *stepper* (+/-).
  * **Deteksi Selisih Otomatis**: Jika ada galon kosong yang belum kembali dari pelanggan, sistem langsung menampilkan lencana peringatan selisih.
  * Input setoran tunai kasir dengan tombol jalan pintas (*Pas Muatan*).
  * Input klaim uang bensin armada.
  * Catatan kendala perjalanan & titipan pelanggan.
* **Kirim Laporan via WhatsApp**: Tombol satu klik yang memanfaatkan API `https://wa.me/` dengan format teks laporan terstruktur rapi ke WhatsApp Admin.
* **Simpan & Selesai Shift**: Mencatat laporan harian ke sheet `Laporan_Supir`.
* **Riwayat Pengantaran**: Menampilkan riwayat trip sebelumnya lengkap dengan status validasi kasir.

### 4. Modul Slip Gaji Karyawan (Payroll)
* **Ringkasan Keuangan (Bento KPI)**: Total beban gaji bulanan, jumlah karyawan aktif, dan total insentif galon terkirim.
* **Rekapitulasi Slip Pegawai**:
  * Gaji Pokok, Bonus/Insentif per galon atau target omset, dan tunjangan operasional.
* **Pratinjau Slip Gaji Digital**:
  * Modal slip gaji elegan dengan kop resmi *Depot Zam Water*, stempel & tanda tangan digital pemilik (*H. Zamroni*).
  * Rincian A (Penghasilan) dan Rincian B (Potongan).
  * Kalkulasi *Take-Home Pay* bersih.
* **Ekspor & Berbagi**: Tombol cetak PDF langsung dan tombol bagikan rincian slip via WhatsApp ke karyawan yang bersangkutan.
* **Cairkan Semua**: Tombol batch untuk mencairkan dan menandai status lunas seluruh slip.

---

## 📁 Struktur Direktori Proyek

```text
├── index.html          # Aplikasi Single Page Application (SPA) lengkap dengan 4 modul
├── Code.gs             # Backend Google Apps Script (doGet & doPost untuk 5 sheet)
├── vercel.json         # Konfigurasi deployment & routing Vercel
├── .gitignore          # File pengecualian Git
├── README.md           # Panduan dokumentasi lengkap & langkah deployment
└── js/
    ├── config.js       # Konfigurasi URL Google Apps Script & profil depot
    ├── data.js         # Data default lokal (offline-first & initial fallback)
    ├── api.js          # API client pembungkus fetch GET & POST ke Apps Script
    └── app.js          # Logika aplikasi POS, kalkulasi driver, dan modal UI
```

---

## 🛠️ Langkah Menyiapkan Backend Google Sheets & Apps Script

Aplikasi ini menggunakan Google Sheets sebagai basis data gratis tanpa server. Ikuti 5 langkah mudah berikut:

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, contohnya: **Database Depot Zam Water**.

### Langkah 2: Buka Google Apps Script Editor
1. Pada menu atas Google Sheets, klik **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus semua kode default di editor `Code.gs`.
3. Buka file [Code.gs](Code.gs) dari proyek ini, lalu salin (*copy*) seluruh isinya dan tempel (*paste*) ke editor Apps Script.
4. Klik ikon **Save (Simpan)** atau tekan `Ctrl + S` / `Cmd + S`.

### Langkah 3: Inisialisasi Database Otomatis
1. Pada bilah atas editor Apps Script, pilih fungsi **`initDatabase`** dari dropdown pilihan fungsi (di sebelah tombol *Run*).
2. Klik tombol **Run (Jalankan)**.
3. Google akan meminta izin akses (*Review Permissions*). Berikan izin (*Allow* / Lanjutkan ke Proyek).
4. Setelah selesai dieksekusi, kembali ke tab Google Spreadsheet Anda. Anda akan melihat **5 sheet** telah otomatis dibuat lengkap dengan header kolom berwarna hijau teal dan data starter:
   * 📑 `Produk`
   * 📑 `Pelanggan`
   * 📑 `Penjualan`
   * 📑 `Laporan_Supir`
   * 📑 `Karyawan`

### Langkah 4: Deploy sebagai Web App
1. Di editor Apps Script, klik tombol biru **Deploy** di pojok kanan atas > pilih **New deployment**.
2. Klik ikon gerigi (*Select type*) di samping "Select type", pilih **Web app**.
3. Isi konfigurasi sebagai berikut:
   * **Description**: `API Depot Zam Water v1`
   * **Execute as**: `Me (email anda)`
   * **Who has access**: **`Anyone`** *(PENTING: Pilih "Anyone" agar aplikasi frontend web Anda dapat membaca dan mengirim data).*
4. Klik tombol **Deploy**.
5. Salin (**Copy**) **Web App URL** yang dihasilkan (formatnya: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Menghubungkan Backend ke Frontend Web

Anda memiliki dua opsi yang sangat mudah:

### Opsi A (Langsung dari Antarmuka Web - Direkomendasikan)
1. Buka aplikasi web di browser (buka `index.html`).
2. Klik ikon **Settings (Gerigi)** atau klik lencana status **"Mode Demo (Offline)"** di pojok kanan atas *header*.
3. Tempelkan URL Web App Google Apps Script yang telah Anda salin ke kolom input.
4. Klik **Tes Koneksi** untuk memastikan status berwarna hijau.
5. Klik **Simpan Pengaturan**. Aplikasi akan langsung terhubung ke Google Sheets Anda secara *live*!

### Opsi B (Melalui File `js/config.js`)
Buka file `js/config.js` dan ganti nilai `GOOGLE_SCRIPT_URL`:
```javascript
const CONFIG = {
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
  // ...
};
```

---

## 🐙 Cara Push ke GitHub

Pastikan Anda telah menginstal [Git](https://git-scm.com/) di komputer Anda.

1. Buka terminal di folder proyek ini:
   ```bash
   cd "/Users/macbook/Downloads/belajar buat web app"
   ```
2. Inisialisasi Git repository:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi aplikasi operasional Depot Zam Water lengkap"
   ```
3. Buat repository baru di [GitHub](https://github.com/new) (misalnya diberi nama `depot-zam-water-pos`).
4. Hubungkan remote repository dan lakukan push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/depot-zam-water-pos.git
   git push -u origin main
   ```

---

## ⚡ Cara Deploy ke Vercel

Aplikasi ini sudah dilengkapi dengan file `vercel.json` yang dioptimalkan untuk single page application.

1. Buka dashboard [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Pilih repository GitHub yang baru saja Anda push (`depot-zam-water-pos`).
4. Pada bagian **Framework Preset**, biarkan **Other** (karena menggunakan Vanilla HTML, Tailwind CDN, dan JS).
5. Klik tombol **Deploy**.
6. Dalam hitungan detik, aplikasi web Anda sudah aktif secara global di internet dengan alamat seperti `https://depot-zam-water-pos.vercel.app`!

---

## 💡 Tips Penggunaan di Lapangan
* **Mode Kasir di Toko**: Buka aplikasi di tablet Android / iPad atau laptop kasir. Transaksi langsung mengupdate pengurangan stok galon di Google Sheets.
* **Kurir / Supir di Jalan**: Supir cukup membuka link aplikasi di HP, mengisi jumlah galon yang diantar, dan menekan tombol hijau *Kirim Laporan via WhatsApp*. Seluruh rekap setoran otomatis terkirim rapi ke nomor WA bos/admin depot.
* **Offline-First**: Jika jaringan internet di depot sempat terputus, aplikasi tetap berjalan normal menggunakan memori lokal dan akan melakukan sinkronisasi saat koneksi pulih.

---
© 2024 **Depot Zam Water** - Sistem Manajemen Depot Air Minum Isi Ulang Modern.
