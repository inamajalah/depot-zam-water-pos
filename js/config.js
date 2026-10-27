/**
 * Konfigurasi Utama Depot Zam Water
 * Anda dapat mengubah GOOGLE_SCRIPT_URL setelah melakukan deployment Google Apps Script
 */
const CONFIG = {
  // Masukkan URL Web App Google Apps Script hasil deploy Anda di sini:
  // Contoh: 'https://script.google.com/macros/s/AKfycbx.../exec'
  GOOGLE_SCRIPT_URL: localStorage.getItem('zam_gas_url') || 'https://script.google.com/macros/s/AKfycbwV4Z54ts1iVObGkh7B_RK4nTYbo4w6zaO-4r-AK0vQATFlPjcqQl8jTE-dDDTbG7da/exec',

  // Informasi Depot Zam Water
  DEPOT_NAME: 'Depot Zam Water',
  DEPOT_TAGLINE: 'Air Minum Segar, Sehat & Higienis',
  DEPOT_ADDRESS: 'Jl. Gunung Pancar sumur batu',
  DEPOT_PHONE: '0878-5420-0275',
  ADMIN_WA_NUMBER: '6285174273313', // Format 628xxx tanpa tanda + atau spasi

  // Rekening Bank Pembayaran
  BANK_NAME: 'BCA',
  BANK_ACCOUNT_NUMBER: '7475-179-986',
  BANK_ACCOUNT_HOLDER: 'MUHAMMAD INAMMULLAH',

  // QRIS Info
  QRIS_NMID: 'ID1025368019960',

  // Informasi Shift & Kasir Default
  CASHIER_NAME: 'inam',
  SHIFT_CODE: 'Shift #01 (Pagi/Siang)',
  TANK_CAPACITY_MAX: 5000,
  CURRENT_TANK_LITERS: 3850
};
