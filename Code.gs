/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT - DEPOT ZAM WATER OPERASIONAL & POS
 * =========================================================================
 * File ini diletakkan di Google Apps Script (Extensions > Apps Script)
 * yang terhubung dengan Google Spreadsheet Anda.
 * 
 * Fitur:
 * 1. Otomatis inisialisasi 5 Sheets beserta Header & Data Awal (initDatabase)
 * 2. Endpoint doGet: Mengambil seluruh data produk, pelanggan, laporan supir, slip gaji, penjualan
 * 3. Endpoint doPost: Menyimpan transaksi POS, laporan supir, penyesuaian stok, pelanggan baru
 * 4. Mendukung CORS penuh untuk integrasi web modern
 */

// Nama-nama Sheet di Google Spreadsheet
const SHEET_NAMES = {
  PRODUK: 'Produk',
  PELANGGAN: 'Pelanggan',
  PENJUALAN: 'Penjualan',
  LAPORAN_SUPIR: 'Laporan_Supir',
  KARYAWAN: 'Karyawan'
};

/**
 * Endpoint GET: Digunakan frontend untuk membaca data
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';

    if (action === 'ping') {
      return createJsonResponse({
        success: true,
        message: 'Depot Zam Water Google Apps Script API aktif dan siap digunakan!',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'init') {
      const initResult = initDatabase();
      return createJsonResponse(initResult);
    }

    if (action === 'getAllData') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      
      // Jika sheet utama belum ada, lakukan inisialisasi otomatis
      if (!ss.getSheetByName(SHEET_NAMES.PRODUK)) {
        initDatabase();
      }

      const produk = readSheetAsJson(SHEET_NAMES.PRODUK);
      const pelanggan = readSheetAsJson(SHEET_NAMES.PELANGGAN);
      const penjualan = readSheetAsJson(SHEET_NAMES.PENJUALAN);
      const laporanSupir = readSheetAsJson(SHEET_NAMES.LAPORAN_SUPIR);
      const karyawan = readSheetAsJson(SHEET_NAMES.KARYAWAN);

      return createJsonResponse({
        success: true,
        source: 'google_sheets',
        timestamp: new Date().toISOString(),
        data: {
          produk: produk,
          pelanggan: pelanggan,
          penjualan: penjualan,
          laporanSupir: laporanSupir,
          karyawan: karyawan
        }
      });
    }

    return createJsonResponse({
      success: false,
      message: 'Aksi GET tidak dikenali: ' + action
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Endpoint POST: Digunakan frontend untuk menambah dan memperbarui data
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action;
    const payload = postData.payload || postData;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss.getSheetByName(SHEET_NAMES.PRODUK)) {
      initDatabase();
    }

    // 1. Simpan Transaksi Penjualan POS & Update Stok Otomatis
    if (action === 'addPenjualan') {
      const sheet = ss.getSheetByName(SHEET_NAMES.PENJUALAN);
      const now = new Date();
      const dateStr = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
      const invoiceId = payload.id || ('INV/ZAM/' + Utilities.formatDate(now, 'Asia/Jakarta', 'yyyyMMdd') + '/' + Math.floor(100 + Math.random() * 900));
      
      sheet.appendRow([
        invoiceId,
        dateStr,
        payload.pelanggan || 'Pelanggan Walk-in',
        payload.items || '',
        Number(payload.totalHarga || 0),
        payload.metodeBayar || 'Tunai',
        payload.status || 'Selesai',
        payload.catatan || 'Kasir POS'
      ]);

      // Kurangi stok di sheet Produk
      if (Array.isArray(payload.itemsList)) {
        const prodSheet = ss.getSheetByName(SHEET_NAMES.PRODUK);
        const prodData = prodSheet.getDataRange().getValues();
        payload.itemsList.forEach(function(cartItem) {
          for (var i = 1; i < prodData.length; i++) {
            if (prodData[i][0] === cartItem.id || prodData[i][1] === cartItem.nama) {
              var currentStok = Number(prodData[i][4]) || 0;
              var newStok = Math.max(0, currentStok - Number(cartItem.qty || 1));
              prodSheet.getRange(i + 1, 5).setValue(newStok); // Kolom 5 = Stok
              break;
            }
          }
        });
      }

      return createJsonResponse({
        success: true,
        message: 'Transaksi POS berhasil dicatat ke Google Sheets & stok diperbarui',
        invoiceId: invoiceId
      });
    }

    // 2. Simpan Laporan Setoran Driver
    if (action === 'addLaporanSupir') {
      const sheet = ss.getSheetByName(SHEET_NAMES.LAPORAN_SUPIR);
      const now = new Date();
      const reportId = payload.id || ('TRIP-' + Utilities.formatDate(now, 'Asia/Jakarta', 'yyyyMMdd-HHmm'));
      const waktu = payload.waktu || Utilities.formatDate(now, 'Asia/Jakarta', 'dd MMM yyyy • HH:mm WIB');

      sheet.appendRow([
        reportId,
        waktu,
        payload.namaSupir || 'Budi Santoso',
        payload.armada || 'Motor Roda 3 Tossa B-4921-ZAM',
        payload.tujuan || 'Pengantaran Reguler',
        Number(payload.galonKeluar || 0),
        Number(payload.galonKembali || 0),
        Number(payload.selisih || 0),
        Number(payload.setoranTunai || 0),
        Number(payload.klaimBensin || 0),
        payload.catatan || '',
        payload.status || 'Tervalidasi Kasir'
      ]);

      return createJsonResponse({
        success: true,
        message: 'Laporan supir berhasil disimpan ke Google Sheets',
        reportId: reportId
      });
    }

    // 3. Update Cepat Stok Barang
    if (action === 'updateStok') {
      const sheet = ss.getSheetByName(SHEET_NAMES.PRODUK);
      const data = sheet.getDataRange().getValues();
      let updated = false;

      for (var j = 1; j < data.length; j++) {
        if (data[j][0] === payload.id || data[j][1] === payload.nama) {
          sheet.getRange(j + 1, 5).setValue(Number(payload.stok)); // Kolom 5 = Stok
          updated = true;
          break;
        }
      }

      return createJsonResponse({
        success: updated,
        message: updated ? 'Stok produk berhasil diperbarui' : 'Produk tidak ditemukan'
      });
    }

    // 4. Tambah Pelanggan Baru
    if (action === 'addPelanggan') {
      const sheet = ss.getSheetByName(SHEET_NAMES.PELANGGAN);
      const newId = payload.id || ('CUST-' + Math.floor(100 + Math.random() * 900));
      
      sheet.appendRow([
        newId,
        payload.nama || '',
        payload.organisasi || '',
        payload.kategori || 'Perumahan',
        payload.telepon || '',
        payload.alamat || '',
        payload.langganan || '2 Galon/minggu',
        Number(payload.depositGalon || 0),
        payload.status || 'Tetap'
      ]);

      return createJsonResponse({
        success: true,
        message: 'Data pelanggan berhasil ditambahkan ke Google Sheets',
        customerId: newId
      });
    }

    // 5. Update Status Pencairan Gaji Karyawan
    if (action === 'updateGajiAll') {
      const sheet = ss.getSheetByName(SHEET_NAMES.KARYAWAN);
      const data = sheet.getDataRange().getValues();
      for (var k = 1; k < data.length; k++) {
        sheet.getRange(k + 1, 10).setValue('Lunas Dicairkan'); // Kolom 10 = Status Bayar
      }
      return createJsonResponse({
        success: true,
        message: 'Seluruh gaji karyawan ditandai Lunas Dicairkan'
      });
    }

    return createJsonResponse({
      success: false,
      message: 'Aksi POST tidak dikenali: ' + action
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Mengubah Sheet menjadi array of objects berdasarkan Header Kolom
 */
function readSheetAsJson(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = toCamelCase(headers[j]);
      obj[key] = row[j];
    }
    rows.push(obj);
  }
  return rows;
}

/**
 * Konversi nama header 'Harga_Produk' atau 'Harga Produk' ke 'hargaProduk'
 */
function toCamelCase(str) {
  if (!str) return 'col';
  return str.toString()
    .replace(/[_\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    })
    .replace(/^([A-Z])/, function(m) {
      return m.toLowerCase();
    });
}

/**
 * Inisialisasi Database: Membuat Sheet & Mengisi Header + Data Default
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet PRODUK
  createSheetWithHeadersAndData(ss, SHEET_NAMES.PRODUK, [
    ['ID', 'Nama', 'Kategori', 'Kategori Label', 'Stok', 'Satuan', 'Harga', 'Subtext', 'Badge', 'Badge Color', 'Gambar'],
    ['PROD-01', 'Isi Ulang Standar', 'refill', 'Isi Ulang Galon', 57, 'Galon', 6000, 'Mineral Pure 19L', 'Tersedia', 'primary', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBanDTR1XvOMaKBN04ikZcuR6VV1g3RVPoXJE8uvo1diznGFHhxzP-T1sldxzmm825CVo_WduiqoJjD3HFkRU-z8eZFXqKo3yTjJOFfr_tw1TtlG4515PnQJbdE2CBfJAB0TfpXfXT57SzVAIoXHpGkvLBW5QrJj1kJM2gDM-eXp7PxE9IAVUtyLVxETYGooxMAR5o4ry9PYicerNkW0_pBuXYafBBH2a9spwLEsEN-xA2fM-VYu3h3hw'],
    ['PROD-02', 'Isi Ulang RO', 'refill', 'Isi Ulang Galon', 85, 'Galon', 8000, 'Reverse Osmosis 19L', 'Favorit', 'tertiary-fixed', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEBathGjf_zGdjbHBpCcZYB3oDvNjZ2PPQUIEgyWMVKORNwWMArECaCAPLEuIdT3MfbHs-06RyCAUdMiC2xDg5fcvf4ziXRZMDuTqH92FHMqJkUtLnQ9xeS8rUuzlqbkZlymPTG9MDroBtJaKJSyC88zkGk2ZvLjnKi6HizEVCCtYVz9kvroFiiah0ViRICQALlkuXfYCqczxpw5K1qv7xnctR5iZqjpAyClKLYC6KLbAS9ilR7nUcdQ'],
    ['PROD-03', 'Isi Ulang Bio Alkali', 'refill', 'Isi Ulang Galon', 35, 'Galon', 10000, 'Bio Energy pH 8.5+ 19L', 'pH 8.5+', 'secondary-container', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnmwTHJExnkHtHPc1Dj-jHLpwOcPc1g9J-1ByC2toWnhSE3Yr-Prcbl1zrUBzMz4aIPDxE_AQXpvn32BXud8fK_XBSFQR2jdmH56tobeEumZB6Ae7BnYuS2-_iBxKhbqvxWS15b9srwVD4vJfnYRjVW8hHL_AZBSLVxrXNJ4wkEtM2i3FVhucKT67YlW4N75Tr40yAp4ory6FZGGyPCDxnAHTPe_Y3S0-etarOdu3cX98YZSyuL3Ppdw'],
    ['PROD-04', 'Galon Baru + Air', 'new-gallon', 'Galon Baru', 18, 'Galon', 45000, 'Set Komplit 19L Polycarbonate', 'Sisa 18', 'surface-container-high', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo5FefRv8H05B4I2giPSBqGfoEgJvQtrEui4E31OU-uHfz2x59cG7SaZQKpDa0g2kGEwXOcm5n50Tlydcq7Q5gg6uD8kv9fwRqLvCbymC7GYfEJWbYol4P-dYDzDTjy0Q2hACt1VSDBqFKpfQTwPEqtq4hpajcnBbJbrzjv2B_yGO2IvJQyUfj2-ehqs07-oMzM5rFxlViuSAoFmYc2v_RhMhHMY9eTdfzbaEI4V6FI22oUVsjDd43Zg'],
    ['PROD-05', 'Botol 600ml (Dus)', 'bottles', 'Botol & Dus', 40, 'Dus', 38000, 'Isi 24 Botol', 'Dus (24 btl)', 'surface-container-high', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Sqx-U9XSyIHNc6c27hW8yJ5NmjMNv5Qq7ppHfCjCwD5hpoJ5hQXObBtO5gsfOE34KAHdR9FwagZ2W_QxLq3Ca7-tAMgViKqLONBUZ7khCW2gfK7Yok0eo0F1rNGxmvxyYJ_nTnHapoAsELFV9KA0ZEHHU2GYzW8-n0jeC9xtSlo9NaDwdSE63z43cJ6KqTz7r0odopK8F8b8XRSqOXzb16fGEfvVT166gNN0MM9ORpiFovWAPacJrw'],
    ['PROD-06', 'Botol 330ml Mini', 'bottles', 'Botol & Dus', 25, 'Dus', 32000, 'Isi 24 Botol Mini', 'Dus (24 btl)', 'surface-container-high', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKTm7nIE3Eo2UdfyWuHXNm6GRP1AeKcJ9vzLYkKzjrdvUtIVbL_MOjEsZDX9thI6S8emXpCeiot02E4ud2WDDdGIiQfvB8OHzldU94taZEZzazvyemMjAORfIXLYtvBiz_GAWD-6BP9A_tNdFOa7cFojhAhj3y-8Vo0fcsNGdUFCWZwgGE_NBwaklQXNgbYkE3jtftnErPsKX-K4yH732nAViR2A0Z9fZCtAAFCcwWPCfmk52numN55g'],
    ['PROD-07', 'Tutup Segel Zam', 'accessories', 'Aksesoris', 12, 'Pack', 15000, 'Pack 50 pcs Food Grade', 'Stok Menipis', 'error', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe10UKt7Zs86o2tW8Qae19X_OW8cCf-AoFQK9ifDRpF2A9UdhwT1u3EQ2uPxjlBmFn9LoEnlaqACxVFOO6pyIUWRd1g5jPyLoHfhxDpM2sSExuSA4pEvdaIFTk1cYghETf-_LcPFWXAaSkKnp0Ut6UY9RgGwBS6UuRoZRus6VFUpteLQWzikqG3UHhs_jjqj2fOAUri3y8qwYu4rcdO5mIg9EMm1BVCHLEW9-yZXtnvmiN6B9uciHDRA'],
    ['PROD-08', 'Tisu Pembersih', 'accessories', 'Aksesoris', 45, 'Pack', 10000, 'Antiseptik 100 Sachet', '100 Sachet', 'surface-container-high', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa19Da9twgN9zLvT_DfnuavmgxcQQnWmrHTm5nHyX-lMu8H3xpbDTYeL8Jbdf5q8eh6Y6WsV2DNteJKNWsC68Z9-wqnEHslBQqG4t1Rvp0psGYm5M16agrDRjCa4FSIJKciy3fE3Zs1PFtBKFGXcDrYbMXoEn2zIFpj9DB98OMehATkoUNZ5URzCPBsiSfECyKXs_5uc6d6bdIGQ4aZGuIGCtSmt1vCnmRsHmFuTcUkUW4RiLEljRSjg']
  ]);

  // 2. Sheet PELANGGAN
  createSheetWithHeadersAndData(ss, SHEET_NAMES.PELANGGAN, [
    ['ID', 'Nama', 'Organisasi', 'Kategori', 'Telepon', 'Alamat', 'Langganan', 'Deposit Galon', 'Status'],
    ['CUST-001', 'Pak Hendra', 'Warung Berkah', 'Warung & Toko', '081288776655', 'Jl. Merpati No. 14 (Samping Toko Beras)', '5 Galon RO/minggu', 5, 'VIP Loyal'],
    ['CUST-002', 'Ibu Ratna', 'Rumah Tangga', 'Perumahan', '085711223344', 'Griya Zam Indah Blok C2/08', '2 Galon/minggu', 2, 'Rutin Rabu'],
    ['CUST-003', 'Kantor Notaris Sutejo', 'Kantor Notaris', 'Kantor & Usaha', '081399887711', 'Ruko Zam Commercial No. 5', '8 Galon RO/minggu', 8, 'Korporat'],
    ['CUST-004', 'Pak RT Bambang', 'Perumahan RW 04', 'Perumahan', '081234445566', 'Jl. Cemara No. 8, Blok A', '4 Galon Mineral/minggu', 4, 'Tetap']
  ]);

  // 3. Sheet PENJUALAN
  createSheetWithHeadersAndData(ss, SHEET_NAMES.PENJUALAN, [
    ['ID Transaksi', 'Waktu', 'Pelanggan', 'Items', 'Total Harga', 'Metode Bayar', 'Status', 'Catatan'],
    ['INV/ZAM/20240524/001', '2024-05-24 10:15:00', 'Pelanggan Walk-in', '2x Isi Ulang Galon RO, 1x Tisu Pembersih', 26000, 'Tunai', 'Selesai', 'Lunas di kasir']
  ]);

  // 4. Sheet LAPORAN_SUPIR
  createSheetWithHeadersAndData(ss, SHEET_NAMES.LAPORAN_SUPIR, [
    ['ID Laporan', 'Waktu', 'Nama Supir', 'Armada', 'Tujuan', 'Galon Keluar', 'Galon Kembali', 'Selisih', 'Setoran Tunai', 'Klaim Bensin', 'Catatan', 'Status'],
    ['TRIP-20240524-02', '24 Mei 2024 • 11:30 WIB', 'Budi Santoso', 'Motor Roda 3 Tossa B-4921-ZAM', 'Trip 2 - Komplek Asri & Melati', 25, 25, 0, 150000, 0, 'Pengantaran lancar, semua galon tertukar aman.', 'Tervalidasi Kasir'],
    ['TRIP-20240524-01', '24 Mei 2024 • 08:45 WIB', 'Budi Santoso', 'Motor Roda 3 Tossa B-4921-ZAM', 'Trip 1 - Gang Sejahtera & Pasar', 20, 20, 0, 120000, 0, 'Pengantaran pagi toko sembako.', 'Tervalidasi Kasir'],
    ['TRIP-20240523-04', '23 Mei 2024 • 17:00 WIB', 'Budi Santoso', 'Motor Roda 3 Tossa B-4921-ZAM', 'Total Shift Kemarin (Trip 1-4)', 62, 62, 0, 372000, 20000, 'Selesai shift sore.', 'Arsip Shift']
  ]);

  // 5. Sheet KARYAWAN
  createSheetWithHeadersAndData(ss, SHEET_NAMES.KARYAWAN, [
    ['ID', 'Key', 'Nama', 'Jabatan', 'Gaji Pokok', 'Bonus Insentif', 'Tunjangan', 'Potongan', 'Total Gaji', 'Status Bayar'],
    ['EMP-01', 'budi', 'Budi Santoso', 'Supir / Kurir Galon Utama', 2200000, 650000, 400000, 0, 3250000, 'Siap Dicairkan'],
    ['EMP-02', 'siti', 'Siti Rahmawati', 'Kasir / Front Office', 2400000, 350000, 0, 0, 2750000, 'Siap Dicairkan'],
    ['EMP-03', 'agus', 'Agus Priyanto', 'Supir Cadangan & Helper', 1800000, 420000, 0, 0, 2220000, 'Siap Dicairkan'],
    ['EMP-04', 'wahyu', 'Wahyu Hidayat', 'Teknisi Maintenance Filter & Ozon', 2100000, 300000, 0, 0, 2400000, 'Siap Dicairkan']
  ]);

  return {
    success: true,
    message: 'Database Depot Zam Water berhasil diinisialisasi dengan 5 sheet lengkap!'
  };
}

/**
 * Helper membuat sheet dan memberi styling header
 */
function createSheetWithHeadersAndData(ss, sheetName, dataRows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  if (dataRows && dataRows.length > 0) {
    const range = sheet.getRange(1, 1, dataRows.length, dataRows[0].length);
    range.setValues(dataRows);

    // Styling Header
    const headerRange = sheet.getRange(1, 1, 1, dataRows[0].length);
    headerRange.setBackground('#00685f');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, dataRows[0].length);
  }
}

/**
 * Output helper untuk JSON response dengan header MIME yang tepat
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
