/**
 * Data Awal & Default Depot Zam Water
 * Data ini disinkronkan dengan Google Sheets saat URL Apps Script aktif
 */
const DEFAULT_DATA = {
  produk: [
    {
      id: 'PROD-01',
      nama: 'Isi Ulang Standar',
      subtext: 'Mineral Pure 19L',
      kategori: 'refill',
      kategoriLabel: 'Isi Ulang Galon',
      harga: 6000,
      stok: 57,
      satuan: 'Galon',
      badge: 'Tersedia',
      badgeColor: 'primary',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBanDTR1XvOMaKBN04ikZcuR6VV1g3RVPoXJE8uvo1diznGFHhxzP-T1sldxzmm825CVo_WduiqoJjD3HFkRU-z8eZFXqKo3yTjJOFfr_tw1TtlG4515PnQJbdE2CBfJAB0TfpXfXT57SzVAIoXHpGkvLBW5QrJj1kJM2gDM-eXp7PxE9IAVUtyLVxETYGooxMAR5o4ry9PYicerNkW0_pBuXYafBBH2a9spwLEsEN-xA2fM-VYu3h3hw'
    },
    {
      id: 'PROD-02',
      nama: 'Isi Ulang RO',
      subtext: 'Reverse Osmosis 19L',
      kategori: 'refill',
      kategoriLabel: 'Isi Ulang Galon',
      harga: 8000,
      stok: 85,
      satuan: 'Galon',
      badge: 'Favorit',
      badgeColor: 'tertiary-fixed',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEBathGjf_zGdjbHBpCcZYB3oDvNjZ2PPQUIEgyWMVKORNwWMArECaCAPLEuIdT3MfbHs-06RyCAUdMiC2xDg5fcvf4ziXRZMDuTqH92FHMqJkUtLnQ9xeS8rUuzlqbkZlymPTG9MDroBtJaKJSyC88zkGk2ZvLjnKi6HizEVCCtYVz9kvroFiiah0ViRICQALlkuXfYCqczxpw5K1qv7xnctR5iZqjpAyClKLYC6KLbAS9ilR7nUcdQ'
    },
    {
      id: 'PROD-03',
      nama: 'Isi Ulang Bio Alkali',
      subtext: 'Bio Energy pH 8.5+ 19L',
      kategori: 'refill',
      kategoriLabel: 'Isi Ulang Galon',
      harga: 10000,
      stok: 35,
      satuan: 'Galon',
      badge: 'pH 8.5+',
      badgeColor: 'secondary-container',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnmwTHJExnkHtHPc1Dj-jHLpwOcPc1g9J-1ByC2toWnhSE3Yr-Prcbl1zrUBzMz4aIPDxE_AQXpvn32BXud8fK_XBSFQR2jdmH56tobeEumZB6Ae7BnYuS2-_iBxKhbqvxWS15b9srwVD4vJfnYRjVW8hHL_AZBSLVxrXNJ4wkEtM2i3FVhucKT67YlW4N75Tr40yAp4ory6FZGGyPCDxnAHTPe_Y3S0-etarOdu3cX98YZSyuL3Ppdw'
    },
    {
      id: 'PROD-04',
      nama: 'Galon Baru + Air',
      subtext: 'Set Komplit 19L Polycarbonate',
      kategori: 'new-gallon',
      kategoriLabel: 'Galon Baru',
      harga: 45000,
      stok: 18,
      satuan: 'Galon',
      badge: 'Sisa 18',
      badgeColor: 'surface-container-high',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo5FefRv8H05B4I2giPSBqGfoEgJvQtrEui4E31OU-uHfz2x59cG7SaZQKpDa0g2kGEwXOcm5n50Tlydcq7Q5gg6uD8kv9fwRqLvCbymC7GYfEJWbYol4P-dYDzDTjy0Q2hACt1VSDBqFKpfQTwPEqtq4hpajcnBbJbrzjv2B_yGO2IvJQyUfj2-ehqs07-oMzM5rFxlViuSAoFmYc2v_RhMhHMY9eTdfzbaEI4V6FI22oUVsjDd43Zg'
    },
    {
      id: 'PROD-05',
      nama: 'Botol 600ml (Dus)',
      subtext: 'Isi 24 Botol',
      kategori: 'bottles',
      kategoriLabel: 'Botol & Dus',
      harga: 38000,
      stok: 40,
      satuan: 'Dus',
      badge: 'Dus (24 btl)',
      badgeColor: 'surface-container-high',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Sqx-U9XSyIHNc6c27hW8yJ5NmjMNv5Qq7ppHfCjCwD5hpoJ5hQXObBtO5gsfOE34KAHdR9FwagZ2W_QxLq3Ca7-tAMgViKqLONBUZ7khCW2gfK7Yok0eo0F1rNGxmvxyYJ_nTnHapoAsELFV9KA0ZEHHU2GYzW8-n0jeC9xtSlo9NaDwdSE63z43cJ6KqTz7r0odopK8F8b8XRSqOXzb16fGEfvVT166gNN0MM9ORpiFovWAPacJrw'
    },
    {
      id: 'PROD-06',
      nama: 'Botol 330ml Mini',
      subtext: 'Isi 24 Botol Mini',
      kategori: 'bottles',
      kategoriLabel: 'Botol & Dus',
      harga: 32000,
      stok: 25,
      satuan: 'Dus',
      badge: 'Dus (24 btl)',
      badgeColor: 'surface-container-high',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKTm7nIE3Eo2UdfyWuHXNm6GRP1AeKcJ9vzLYkKzjrdvUtIVbL_MOjEsZDX9thI6S8emXpCeiot02E4ud2WDDdGIiQfvB8OHzldU94taZEZzazvyemMjAORfIXLYtvBiz_GAWD-6BP9A_tNdFOa7cFojhAhj3y-8Vo0fcsNGdUFCWZwgGE_NBwaklQXNgbYkE3jtftnErPsKX-K4yH732nAViR2A0Z9fZCtAAFCcwWPCfmk52numN55g'
    },
    {
      id: 'PROD-07',
      nama: 'Tutup Segel Zam',
      subtext: 'Pack 50 pcs Food Grade',
      kategori: 'accessories',
      kategoriLabel: 'Aksesoris',
      harga: 15000,
      stok: 12, // Alert stok menipis
      satuan: 'Pack',
      badge: 'Stok Menipis',
      badgeColor: 'error',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe10UKt7Zs86o2tW8Qae19X_OW8cCf-AoFQK9ifDRpF2A9UdhwT1u3EQ2uPxjlBmFn9LoEnlaqACxVFOO6pyIUWRd1g5jPyLoHfhxDpM2sSExuSA4pEvdaIFTk1cYghETf-_LcPFWXAaSkKnp0Ut6UY9RgGwBS6UuRoZRus6VFUpteLQWzikqG3UHhs_jjqj2fOAUri3y8qwYu4rcdO5mIg9EMm1BVCHLEW9-yZXtnvmiN6B9uciHDRA'
    },
    {
      id: 'PROD-08',
      nama: 'Tisu Pembersih',
      subtext: 'Antiseptik 100 Sachet',
      kategori: 'accessories',
      kategoriLabel: 'Aksesoris',
      harga: 10000,
      stok: 45,
      satuan: 'Pack',
      badge: '100 Sachet',
      badgeColor: 'surface-container-high',
      gambar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa19Da9twgN9zLvT_DfnuavmgxcQQnWmrHTm5nHyX-lMu8H3xpbDTYeL8Jbdf5q8eh6Y6WsV2DNteJKNWsC68Z9-wqnEHslBQqG4t1Rvp0psGYm5M16agrDRjCa4FSIJKciy3fE3Zs1PFtBKFGXcDrYbMXoEn2zIFpj9DB98OMehATkoUNZ5URzCPBsiSfECyKXs_5uc6d6bdIGQ4aZGuIGCtSmt1vCnmRsHmFuTcUkUW4RiLEljRSjg'
    }
  ],

  pelanggan: [
    {
      id: 'CUST-001',
      nama: 'Pak Hendra',
      organisasi: 'Warung Berkah',
      kategori: 'Warung & Toko',
      telepon: '081288776655',
      alamat: 'Jl. Merpati No. 14 (Samping Toko Beras)',
      langganan: '5 Galon RO/minggu',
      depositGalon: 5,
      status: 'VIP Loyal'
    },
    {
      id: 'CUST-002',
      nama: 'Ibu Ratna',
      organisasi: 'Rumah Tangga',
      kategori: 'Perumahan',
      telepon: '085711223344',
      alamat: 'Griya Zam Indah Blok C2/08',
      langganan: '2 Galon/minggu',
      depositGalon: 2,
      status: 'Rutin Rabu'
    },
    {
      id: 'CUST-003',
      nama: 'Kantor Notaris Sutejo',
      organisasi: 'Kantor Notaris',
      kategori: 'Kantor & Usaha',
      telepon: '081399887711',
      alamat: 'Ruko Zam Commercial No. 5',
      langganan: '8 Galon RO/minggu',
      depositGalon: 8,
      status: 'Korporat'
    },
    {
      id: 'CUST-004',
      nama: 'Pak RT Bambang',
      organisasi: 'Perumahan RW 04',
      kategori: 'Perumahan',
      telepon: '081234445566',
      alamat: 'Jl. Cemara No. 8, Blok A',
      langganan: '4 Galon Mineral/minggu',
      depositGalon: 4,
      status: 'Tetap'
    }
  ],

  laporanSupir: [
    {
      id: 'TRIP-20240524-02',
      waktu: '24 Mei 2024 • 11:30 WIB',
      namaSupir: 'Budi Santoso',
      armada: 'Motor Roda 3 Tossa B-4921-ZAM',
      tujuan: 'Trip 2 - Komplek Asri & Melati',
      galonKeluar: 25,
      galonKembali: 25,
      selisih: 0,
      setoranTunai: 150000,
      klaimBensin: 0,
      catatan: 'Pengantaran lancar, semua galon tertukar aman.',
      status: 'Tervalidasi Kasir'
    },
    {
      id: 'TRIP-20240524-01',
      waktu: '24 Mei 2024 • 08:45 WIB',
      namaSupir: 'Budi Santoso',
      armada: 'Motor Roda 3 Tossa B-4921-ZAM',
      tujuan: 'Trip 1 - Gang Sejahtera & Pasar',
      galonKeluar: 20,
      galonKembali: 20,
      selisih: 0,
      setoranTunai: 120000,
      klaimBensin: 0,
      catatan: 'Pengantaran pagi toko sembako.',
      status: 'Tervalidasi Kasir'
    },
    {
      id: 'TRIP-20240523-04',
      waktu: '23 Mei 2024 • 17:00 WIB',
      namaSupir: 'Budi Santoso',
      armada: 'Motor Roda 3 Tossa B-4921-ZAM',
      tujuan: 'Total Shift Kemarin (Trip 1-4)',
      galonKeluar: 62,
      galonKembali: 62,
      selisih: 0,
      setoranTunai: 372000,
      klaimBensin: 20000,
      catatan: 'Selesai shift sore.',
      status: 'Arsip Shift'
    }
  ],

  karyawan: [
    {
      id: 'EMP-01',
      key: 'budi',
      nama: 'Budi Santoso',
      initials: 'BS',
      jabatan: 'Supir / Kurir Galon Utama',
      tipe: 'Supir',
      icon: 'local_shipping',
      gajiPokok: 2200000,
      bonusJudul: 'Insentif Antar Galon (650 x Rp 1.000)',
      bonus: 650000,
      tunjanganJudul: 'Uang Makan & Transportasi',
      tunjangan: 400000,
      potonganJudul: 'Kasbon / Pinjaman',
      potongan: 0,
      totalGaji: 3250000,
      galonTerkirim: 650,
      status: 'Aktif',
      statusBayar: 'Siap Dicairkan'
    },
    {
      id: 'EMP-02',
      key: 'siti',
      nama: 'Siti Rahmawati',
      initials: 'SR',
      jabatan: 'Kasir / Front Office',
      tipe: 'Kasir',
      icon: 'point_of_sale',
      gajiPokok: 2400000,
      bonusJudul: 'Bonus Target Penjualan Mei (104%)',
      bonus: 350000,
      tunjanganJudul: 'Tunjangan Kehadiran Penuh',
      tunjangan: 0,
      potonganJudul: 'Kasbon / Pinjaman',
      potongan: 0,
      totalGaji: 2750000,
      galonTerkirim: 0,
      status: 'Aktif',
      statusBayar: 'Siap Dicairkan'
    },
    {
      id: 'EMP-03',
      key: 'agus',
      nama: 'Agus Priyanto',
      initials: 'AP',
      jabatan: 'Supir Cadangan & Helper',
      tipe: 'Supir',
      icon: 'airport_shuttle',
      gajiPokok: 1800000,
      bonusJudul: 'Insentif Antar Galon (420 x Rp 1.000)',
      bonus: 420000,
      tunjanganJudul: 'Uang Makan & Lembur Operasional',
      tunjangan: 0,
      potonganJudul: 'Kasbon / Pinjaman',
      potongan: 0,
      totalGaji: 2220000,
      galonTerkirim: 420,
      status: 'Aktif',
      statusBayar: 'Siap Dicairkan'
    },
    {
      id: 'EMP-04',
      key: 'wahyu',
      nama: 'Wahyu Hidayat',
      initials: 'WH',
      jabatan: 'Teknisi Maintenance Filter & Ozon',
      tipe: 'Teknisi',
      icon: 'build',
      gajiPokok: 2100000,
      bonusJudul: 'Insentif Perawatan Rutin & QC Air',
      bonus: 300000,
      tunjanganJudul: 'Tunjangan Kelayakan Alat',
      tunjangan: 0,
      potonganJudul: 'Kasbon / Pinjaman',
      potongan: 0,
      totalGaji: 2400000,
      galonTerkirim: 0,
      status: 'Aktif',
      statusBayar: 'Siap Dicairkan'
    }
  ],

  penjualan: [
    {
      id: 'INV/ZAM/20240524/001',
      waktu: '2024-05-24 10:15',
      pelanggan: 'Pelanggan Walk-in',
      items: '2x Isi Ulang Galon RO, 1x Tisu Pembersih',
      totalHarga: 26000,
      metodeBayar: 'Tunai',
      status: 'Selesai',
      catatan: 'Lunas di kasir'
    }
  ]
};

// Storage manager: read or init localStorage
function getLocalData(key) {
  const stored = localStorage.getItem(`zam_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Gagal membaca localStorage, gunakan default:', key);
    }
  }
  return DEFAULT_DATA[key] || [];
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(`zam_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Gagal menulis ke localStorage:', e);
  }
}
