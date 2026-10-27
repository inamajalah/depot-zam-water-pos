/**
 * Konfigurasi Utama Depot Zam Water v2.0
 * Nilai dapat diubah langsung dari menu Pengaturan (ikon gear) di Web App.
 */
const CONFIG = {
  // URL Web App Google Apps Script
  GOOGLE_SCRIPT_URL: localStorage.getItem('zam_gas_url') || '',

  // Informasi Depot & Owner / Admin
  DEPOT_NAME: localStorage.getItem('zam_depot_name') || 'Depot Zam Water',
  DEPOT_TAGLINE: 'Air Minum Segar, Sehat & Higienis',
  DEPOT_ADDRESS: localStorage.getItem('zam_depot_address') || 'Jl. Air Murni No. 12, Sidoarjo',
  DEPOT_PHONE: localStorage.getItem('zam_depot_phone') || '0812-3456-7890',
  ADMIN_NAME: localStorage.getItem('zam_admin_name') || 'H. Zamroni (Owner)',
  ADMIN_WA_NUMBER: localStorage.getItem('zam_admin_phone') || '6281234567890',

  // Rekening Bank Pembayaran (BCA)
  BANK_NAME: localStorage.getItem('zam_bank_name') || 'BCA',
  BANK_ACCOUNT_NUMBER: localStorage.getItem('zam_bank_account') || '8290-128-449',
  BANK_ACCOUNT_HOLDER: localStorage.getItem('zam_bank_holder') || 'Depot Zam Water Indonesia',

  // Gambar Barcode QRIS Asli (Bisa diupload gambar asli lewat Pengaturan)
  QRIS_IMAGE_URL: localStorage.getItem('zam_qris_image') || '',
  QRIS_NMID: localStorage.getItem('zam_qris_nmid') || 'ID102008892110',

  // Shift & Kapasitas Tangki
  TANK_CAPACITY_MAX: 5000,
  CURRENT_TANK_LITERS: 3850,

  // Akun Login Default Sistem
  USERS: [
    {
      id: 'usr_admin',
      username: 'admin',
      pin: '1234',
      nama: 'H. Zamroni',
      role: 'admin',
      roleLabel: 'Admin / Pemilik',
      avatarColor: 'bg-primary'
    },
    {
      id: 'usr_kasir',
      username: 'kasir',
      pin: '1234',
      nama: 'Budi Santoso',
      role: 'kasir',
      roleLabel: 'Kasir / Front Office',
      avatarColor: 'bg-secondary'
    },
    {
      id: 'usr_supir',
      username: 'supir',
      pin: '1234',
      nama: 'Agus Priyanto',
      role: 'supir',
      roleLabel: 'Supir / Kurir Armada',
      avatarColor: 'bg-tertiary'
    }
  ]
};
