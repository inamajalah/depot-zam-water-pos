/**
 * Konfigurasi Utama Depot Zam Water v2.0
 * Data sudah ditanam langsung — tidak perlu input manual lagi.
 * Nilai tetap bisa diubah sewaktu-waktu lewat menu Pengaturan (ikon ⚙️).
 */
const CONFIG = {
  // URL Web App Google Apps Script (sudah terhubung ke Google Sheets)
  GOOGLE_SCRIPT_URL: localStorage.getItem('zam_gas_url') ||
    'https://script.google.com/macros/s/AKfycbwV4Z54ts1iVObGkh7B_RK4nTYbo4w6zaO-4r-AK0vQATFlPjcqQl8jTE-dDDTbG7da/exec',

  // Informasi Depot & Owner / Admin
  DEPOT_NAME:    localStorage.getItem('zam_depot_name')    || 'Depot Zam Water',
  DEPOT_TAGLINE: 'Air Minum Segar, Sehat & Higienis',
  DEPOT_ADDRESS: localStorage.getItem('zam_depot_address') || 'Jl. Gunung Pancar, Sumur Batu, Babakan Madang',
  DEPOT_PHONE:   localStorage.getItem('zam_depot_phone')   || '087854200275',
  ADMIN_NAME:    localStorage.getItem('zam_admin_name')    || 'Inam (Owner)',
  ADMIN_WA_NUMBER: localStorage.getItem('zam_admin_phone') || '6285174273313',

  // Rekening Bank Pembayaran (BCA)
  BANK_NAME:           localStorage.getItem('zam_bank_name')    || 'BCA',
  BANK_ACCOUNT_NUMBER: localStorage.getItem('zam_bank_account') || '7475179986',
  BANK_ACCOUNT_HOLDER: localStorage.getItem('zam_bank_holder')  || 'Muhammad Inammullah',

  // Gambar Barcode QRIS (bisa upload foto asli lewat Pengaturan)
  QRIS_IMAGE_URL: localStorage.getItem('zam_qris_image') || '',
  QRIS_NMID:      localStorage.getItem('zam_qris_nmid')  || 'ID1025368019960',

  // Shift & Kapasitas Tangki
  TANK_CAPACITY_MAX:   5000,
  CURRENT_TANK_LITERS: 3850,

  // Akun Login Default Sistem
  USERS: [
    {
      id: 'usr_admin',
      username: 'admin',
      pin: '1234',
      nama: 'Inam',
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
