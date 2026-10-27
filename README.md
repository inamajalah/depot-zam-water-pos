# 💧 Depot Zam Water - Web App Operasional & POS (v2.0)

Aplikasi web modern, responsif, dan siap produksi untuk operasional **Depot Air Minum Isi Ulang Zam Water**. Dilengkapi sistem login multi-peran, manajemen produk & inventaris dinamis, serta kustomisasi rekening bank dan barcode QRIS toko.

---

## 🌟 Fitur Baru di Versi 2.0

### 1. Fitur Tambah, Edit & Hapus Produk
* **Tombol `+ Produk Baru`**: Tersedia di Kasir POS dan tab Stok untuk menambah produk baru kapan saja.
* **Modal Edit Lengkap**: Bisa mengubah nama produk, kategori, harga jual, stok fisik, satuan, subtext/keterangan, serta **foto produk** (bisa upload foto langsung dari HP/komputer atau tempel link URL).
* **Otomatis Sinkron**: Perubahan langsung tersimpan ke Google Sheets (Sheet `Produk`) dan otomatis terupdate di katalog kasir.

### 2. Fitur Login Multi-Peran (Admin & Staff)
* **Role-Based Access Control**:
  * 👑 **Admin / Owner**: Akses penuh ke semua modul (POS, Stok, Supir, Slip Gaji/Payroll, Pengaturan Toko & Rekening, Tambah/Edit Produk).
  * 💼 **Kasir / Staff Front Office**: Akses ke Kasir POS dan Stok Pelanggan. Dibatasi dari modul Slip Gaji dan Pengaturan Rekening Bank demi keamanan.
  * 🚚 **Supir / Driver**: Akses langsung ke Portal Laporan Supir & riwayat pengantaran armada.
* **Akun Login Bawaan**:
  * Admin: username `admin` | PIN: `1234`
  * Kasir: username `kasir` | PIN: `1234`
  * Supir: username `supir` | PIN: `1234`
* **Ganti Akun Instan**: Klik avatar profil di pojok kanan atas untuk membuka jendela login atau keluar (*logout*).

### 3. Pengaturan Rekening Bank BCA, QRIS Asli & Profil Depot
Buka menu **Pengaturan (Ikon Gerigi)** di pojok kanan atas (*Hanya dapat diakses oleh Admin*):
* **Tab BCA & QRIS**:
  * Ubah Nama Bank (BCA), Nomor Rekening, dan Atas Nama Rekening. Langsung tampil di opsi pembayaran transfer POS dengan tombol salin.
  * **Upload Gambar Barcode QRIS Asli Toko**: Anda dapat memilih foto/screenshot QRIS depot Anda langsung dari galeri HP/laptop. Gambar barcode asli Anda akan langsung muncul di layar kasir POS saat memilih metode bayar QRIS!
* **Tab Admin & Depot**:
  * Ubah Nama Admin/Owner (*H. Zamroni*).
  * Ubah Nomor WhatsApp Admin (tujuan pesan laporan harian supir & pesanan).
  * Ubah Nama & Alamat Depot yang tercetak pada Struk Belanja Termal 58mm.
* **Tab Google Sheets**:
  * Pengaturan URL Web App Google Apps Script & tombol tes koneksi.

---

## 🚀 Cara Memperbarui Kode ke GitHub & Vercel

Karena aplikasi Anda sudah terhubung ke GitHub dan Vercel:

1. Buka repository Anda di browser:
   👉 **https://github.com/inamajalah/depot-zam-water-pos**
2. Klik tombol **Add file** > **Upload files**.
3. Dari komputer Anda, seret (*drag and drop*) file-file yang baru diperbarui ini:
   * `index.html`
   * `Code.gs`
   * `vercel.json`
   * `README.md`
   * folder `js/` (berisi `app.js`, `config.js`, `api.js`, `data.js`)
4. Klik tombol hijau **Commit changes**.
5. **Vercel akan otomatis mendeteksi pembaruan dan melakukan deploy ulang dalam waktu sekitar 30 detik!** Kunjungi kembali `depot-zam-water-pos.vercel.app` untuk menikmati fitur-fitur barunya.

> **Catatan untuk Google Apps Script:**
> Buka file [Code.gs](Code.gs), salin isinya ke editor Apps Script Anda, lalu klik **Deploy > Manage deployments > Edit > New version > Deploy** agar fungsi simpan/edit produk v2.0 aktif di Google Sheets Anda.
