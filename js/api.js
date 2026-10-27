/**
 * API Service untuk Depot Zam Water
 * Terhubung ke Google Apps Script (doGet & doPost)
 * Fallback cerdas ke localStorage jika offline atau URL belum diatur
 */
const API = {
  isConfigured() {
    return Boolean(CONFIG.GOOGLE_SCRIPT_URL && CONFIG.GOOGLE_SCRIPT_URL.trim().startsWith('https://script.google.com'));
  },

  /**
   * Mengambil semua data dari Google Apps Script
   */
  async fetchAllData() {
    if (!this.isConfigured()) {
      return {
        success: true,
        source: 'local',
        data: {
          produk: getLocalData('produk'),
          pelanggan: getLocalData('pelanggan'),
          penjualan: getLocalData('penjualan'),
          laporanSupir: getLocalData('laporanSupir'),
          karyawan: getLocalData('karyawan')
        }
      };
    }

    try {
      const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=getAllData&_t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      if (json.success && json.data) {
        // Simpan cache lokal
        if (json.data.produk) setLocalData('produk', json.data.produk);
        if (json.data.pelanggan) setLocalData('pelanggan', json.data.pelanggan);
        if (json.data.penjualan) setLocalData('penjualan', json.data.penjualan);
        if (json.data.laporanSupir) setLocalData('laporanSupir', json.data.laporanSupir);
        if (json.data.karyawan) setLocalData('karyawan', json.data.karyawan);
        return { success: true, source: 'google_sheets', data: json.data };
      } else {
        throw new Error(json.message || 'Format respon API tidak valid');
      }
    } catch (err) {
      console.warn('Gagal memuat dari Google Sheets, memuat data lokal:', err);
      return {
        success: true,
        source: 'local_fallback',
        error: err.message,
        data: {
          produk: getLocalData('produk'),
          pelanggan: getLocalData('pelanggan'),
          penjualan: getLocalData('penjualan'),
          laporanSupir: getLocalData('laporanSupir'),
          karyawan: getLocalData('karyawan')
        }
      };
    }
  },

  /**
   * Mengirim data ke Google Apps Script via doPost
   */
  async postAction(action, payload) {
    // 1. Selalu perbarui lokal dulu (Optimistic UI / Offline First)
    this.updateLocalOptimistic(action, payload);

    if (!this.isConfigured()) {
      return { success: true, source: 'local', message: 'Tersimpan di memori lokal (Mode Offline)' };
    }

    try {
      const bodyData = JSON.stringify({ action, payload, timestamp: new Date().toISOString() });
      const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Menghindari CORS preflight error di Apps Script
        body: bodyData
      });

      const resText = await response.text();
      let resJson;
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        resJson = { success: true, message: 'Data terkirim ke Google Sheets' };
      }
      return { success: true, source: 'google_sheets', result: resJson };
    } catch (err) {
      console.warn('Gagal sinkronisasi Google Sheets secara live, disimpan di lokal:', err);
      return { success: false, source: 'local', error: err.message, message: 'Disimpan di lokal (Gagal kirim ke Sheets)' };
    }
  },

  /**
   * Optimistic update untuk penyimpanan lokal
   */
  updateLocalOptimistic(action, payload) {
    if (action === 'addPenjualan') {
      const sales = getLocalData('penjualan');
      sales.unshift(payload);
      setLocalData('penjualan', sales);

      // Kurangi stok produk yang dibeli
      if (Array.isArray(payload.itemsList)) {
        const products = getLocalData('produk');
        payload.itemsList.forEach(item => {
          const p = products.find(prod => prod.id === item.id || prod.nama === item.nama);
          if (p && p.stok !== undefined) {
            p.stok = Math.max(0, p.stok - item.qty);
          }
        });
        setLocalData('produk', products);
      }
    } else if (action === 'addLaporanSupir') {
      const reports = getLocalData('laporanSupir');
      reports.unshift(payload);
      setLocalData('laporanSupir', reports);
    } else if (action === 'updateStok') {
      const products = getLocalData('produk');
      const p = products.find(prod => prod.id === payload.id);
      if (p) {
        p.stok = payload.stok;
        setLocalData('produk', products);
      }
    } else if (action === 'addPelanggan') {
      const customers = getLocalData('pelanggan');
      customers.push(payload);
      setLocalData('pelanggan', customers);
    } else if (action === 'updateGajiAll') {
      const employees = getLocalData('karyawan');
      employees.forEach(emp => {
        emp.statusBayar = 'Lunas Dicairkan';
      });
      setLocalData('karyawan', employees);
    }
  },

  /**
   * Tes koneksi ke URL Google Apps Script
   */
  async testConnection(url) {
    if (!url || !url.startsWith('https://script.google.com')) {
      return { success: false, message: 'URL harus diawali dengan https://script.google.com' };
    }
    try {
      const testUrl = `${url}?action=ping&_t=${Date.now()}`;
      const res = await fetch(testUrl, { method: 'GET', mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: true, message: json.message || 'Koneksi ke Google Sheets berhasil!' };
    } catch (e) {
      return { success: false, message: 'Gagal terhubung: ' + e.message };
    }
  }
};
