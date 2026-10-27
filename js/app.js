/**
 * Depot Zam Water - Main Application Controller
 * Mengatur interaktivitas UI, kalkulasi POS, WhatsApp generator,
 * navigasi SPA, modal, dan sinkronisasi Google Sheets.
 */

// State Aplikasi
const state = {
  currentTab: 'pos',          // 'pos' | 'stok' | 'driver' | 'payroll'
  activeCategory: 'all',
  customerSearchTerm: '',
  selectedCustomerCat: 'all',
  stockTab: 'stok',           // 'stok' | 'cust'
  cart: [
    { id: 'PROD-02', nama: 'Isi Ulang Galon RO', price: 8000, qty: 2 },
    { id: 'PROD-08', nama: 'Tisu Pembersih', price: 10000, qty: 1 }
  ],
  selectedCustomer: 'Pelanggan Walk-in',
  payMethod: 'cash',
  nominalReceived: 26000,
  activeEmployeeKey: 'budi',
  products: [],
  customers: [],
  driverReports: [],
  employees: [],
  sales: [],
  isSyncing: false
};

// Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupSettingsModal();
  setupDriverCalculations();
  await loadInitialData();
  renderPOSProducts();
  renderCart();
  renderStockView();
  renderCustomerList();
  renderDriverHistory();
  renderPayrollView();
  updateSyncIndicator();
  startQrisTimer();
});

/**
 * -------------------------------------------------------------
 * 1. Navigasi Single Page Application (SPA)
 * -------------------------------------------------------------
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('.bottom-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.dataset.tab;
      switchView(targetTab);
    });
  });

  // Dukungan deep link via Hash (#pos, #stok, #driver, #payroll)
  const initialHash = window.location.hash.replace('#', '');
  if (['pos', 'stok', 'driver', 'payroll'].includes(initialHash)) {
    switchView(initialHash);
  }
}

function switchView(tabName) {
  state.currentTab = tabName;
  window.location.hash = tabName;

  // Sembunyikan semua view
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.add('hidden');
  });

  // Tampilkan view aktif
  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update styling navigasi bawah
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    const isCurrent = item.dataset.tab === tabName;
    if (isCurrent) {
      item.classList.add('text-primary', 'font-semibold');
      item.classList.remove('text-on-surface-variant');
    } else {
      item.classList.remove('text-primary', 'font-semibold');
      item.classList.add('text-on-surface-variant');
    }
  });

  // Update header title
  const headerSubtitle = document.getElementById('header-subtitle');
  if (headerSubtitle) {
    const titles = {
      pos: 'Kasir POS',
      stok: 'Stok & Pelanggan',
      driver: 'Portal Supir',
      payroll: 'Slip & Rekap Gaji'
    };
    headerSubtitle.textContent = titles[tabName] || 'Zam Water';
  }
}

/**
 * -------------------------------------------------------------
 * 2. Memuat & Sinkronisasi Data
 * -------------------------------------------------------------
 */
async function loadInitialData() {
  state.isSyncing = true;
  updateSyncIndicator();

  const res = await API.fetchAllData();
  if (res && res.data) {
    state.products = res.data.produk || getLocalData('produk');
    state.customers = res.data.pelanggan || getLocalData('pelanggan');
    state.driverReports = res.data.laporanSupir || getLocalData('laporanSupir');
    state.employees = res.data.karyawan || getLocalData('karyawan');
    state.sales = res.data.penjualan || getLocalData('penjualan');
  }

  state.isSyncing = false;
  updateSyncIndicator(res.source);
  populateCustomerSelect();
}

function updateSyncIndicator(source) {
  const indicator = document.getElementById('sync-indicator');
  const text = document.getElementById('sync-indicator-text');
  const dot = document.getElementById('sync-indicator-dot');
  if (!indicator || !text || !dot) return;

  if (state.isSyncing) {
    text.textContent = 'Menyinkronkan...';
    dot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-spin';
    indicator.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-label-sm font-label-sm cursor-pointer border border-amber-200';
    return;
  }

  if (API.isConfigured()) {
    if (source === 'google_sheets') {
      text.textContent = 'Google Sheets Live';
      dot.className = 'w-2 h-2 rounded-full bg-primary animate-pulse';
      indicator.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-label-sm font-label-sm cursor-pointer border border-primary/20';
    } else {
      text.textContent = 'Sheets Terhubung';
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
      indicator.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-label-sm font-label-sm cursor-pointer border border-emerald-200';
    }
  } else {
    text.textContent = 'Mode Demo (Offline)';
    dot.className = 'w-2 h-2 rounded-full bg-sky-500';
    indicator.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-label-sm font-label-sm cursor-pointer border border-sky-200';
  }
}

/**
 * -------------------------------------------------------------
 * 3. Modul POS (Kasir)
 * -------------------------------------------------------------
 */
function renderPOSProducts() {
  const container = document.getElementById('pos-product-grid');
  if (!container) return;

  const filtered = state.activeCategory === 'all'
    ? state.products
    : state.products.filter(p => p.kategori === state.activeCategory);

  container.innerHTML = filtered.map(prod => `
    <div class="product-item bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between transition-all active:scale-[0.98] border border-surface-container-high/40 hover:shadow-md">
      <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container-low mb-2">
        <img class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
             src="${prod.gambar}" 
             alt="${prod.nama}"
             onerror="this.src='https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=60';"/>
        <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full ${prod.badgeColor === 'error' ? 'bg-error text-on-error' : 'bg-surface-container-lowest/95 text-primary'} backdrop-blur-sm font-label-sm text-[11px] font-semibold shadow-xs">
          ${prod.stok !== undefined ? `Stok: ${prod.stok}` : prod.badge || 'Tersedia'}
        </span>
      </div>
      <div class="min-w-0">
        <h3 class="font-label-lg text-label-md text-on-surface truncate font-semibold">${prod.nama}</h3>
        <p class="font-body-sm text-body-sm text-outline truncate mb-2">${prod.subtext || prod.kategoriLabel || ''}</p>
        <div class="flex items-center justify-between">
          <span class="font-pos-numeral-md text-label-lg text-primary font-bold">Rp ${Number(prod.harga).toLocaleString('id-ID')}</span>
          <button class="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-sm active:scale-90 transition-transform hover:bg-secondary-fixed-dim" 
                  onclick="addToCart('${prod.id}')"
                  title="Tambah ke keranjang">
            <span class="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function setPOSCategory(cat, btn) {
  state.activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(b => {
    b.classList.remove('bg-primary', 'text-on-primary');
    b.classList.add('bg-surface-container-lowest', 'text-on-surface');
  });
  if (btn) {
    btn.classList.remove('bg-surface-container-lowest', 'text-on-surface');
    btn.classList.add('bg-primary', 'text-on-primary');
  }
  renderPOSProducts();
}

function addToCart(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  const existing = state.cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: prod.id,
      nama: prod.nama,
      price: Number(prod.harga),
      qty: 1
    });
  }
  renderCart();
  showToast(`+1 ${prod.nama} ditambahkan ke keranjang`, 'shopping_cart');
}

function updateCartQty(index, delta) {
  if (state.cart[index]) {
    state.cart[index].qty += delta;
    if (state.cart[index].qty <= 0) {
      state.cart.splice(index, 1);
    }
  }
  renderCart();
}

function removeCartItem(index) {
  if (state.cart[index]) {
    const item = state.cart[index];
    state.cart.splice(index, 1);
    renderCart();
    showToast(`${item.nama} dihapus`, 'delete');
  }
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-item-count');
  const subtotalEl = document.getElementById('label-subtotal');
  const totalEl = document.getElementById('label-total');
  const kembalianEl = document.getElementById('cash-kembalian');

  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (countBadge) countBadge.textContent = `${totalQty} Item`;
  if (subtotalEl) subtotalEl.textContent = `Rp ${totalAmount.toLocaleString('id-ID')}`;
  if (totalEl) totalEl.textContent = `Rp ${totalAmount.toLocaleString('id-ID')}`;

  // Update uang pas & kembalian
  const change = Math.max(0, state.nominalReceived - totalAmount);
  if (kembalianEl) kembalianEl.textContent = `Rp ${change.toLocaleString('id-ID')}`;

  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-outline flex flex-col items-center justify-center">
        <span class="material-symbols-outlined text-[36px] mb-2 text-outline/60">shopping_cart_off</span>
        <p class="font-body-sm">Keranjang masih kosong</p>
        <p class="text-[11px] text-outline/80">Pilih produk di atas untuk memulai transaksi</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-row flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-container/60">
      <div class="min-w-0 flex-1 pr-2">
        <p class="font-label-lg text-label-md text-on-surface font-medium truncate">${item.nama}</p>
        <p class="font-pos-numeral-md text-body-sm text-outline">@ Rp ${item.price.toLocaleString('id-ID')}</p>
      </div>
      <div class="flex items-center gap-2.5 shrink-0">
        <div class="flex items-center bg-surface-container-lowest rounded-full p-0.5 shadow-sm border border-surface-container-high/60">
          <button class="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high active:scale-90" 
                  onclick="updateCartQty(${idx}, -1)">
            <span class="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span class="w-6 text-center font-pos-numeral-md text-label-md font-semibold">${item.qty}</span>
          <button class="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high active:scale-90" 
                  onclick="updateCartQty(${idx}, 1)">
            <span class="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
        <span class="font-pos-numeral-md text-label-md text-on-surface font-bold min-w-[75px] text-right">
          Rp ${(item.price * item.qty).toLocaleString('id-ID')}
        </span>
        <button class="text-outline hover:text-error transition-colors p-1" onclick="removeCartItem(${idx})">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  `).join('');
}

function switchPayTab(type) {
  state.payMethod = type;
  document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.classList.remove('bg-primary', 'text-on-primary');
    tab.classList.add('bg-surface-container-low', 'text-on-surface');
  });

  const activeTabBtn = document.getElementById(`tab-${type}`);
  if (activeTabBtn) {
    activeTabBtn.classList.remove('bg-surface-container-low', 'text-on-surface');
    activeTabBtn.classList.add('bg-primary', 'text-on-primary');
  }

  // Toggle pane visibility
  ['cash', 'qris', 'transfer'].forEach(pane => {
    const el = document.getElementById(`content-${pane}`);
    if (el) {
      if (pane === type) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    }
  });
}

function selectNominal(nominal, btn) {
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (nominal === 'pas') {
    state.nominalReceived = totalAmount;
  } else {
    state.nominalReceived = Number(nominal);
  }

  // Visual feedback for buttons
  document.querySelectorAll('.denom-btn').forEach(b => {
    b.classList.remove('bg-secondary-fixed', 'text-on-secondary-fixed');
    b.classList.add('bg-surface-container-high', 'text-on-surface');
  });
  if (btn) {
    btn.classList.remove('bg-surface-container-high', 'text-on-surface');
    btn.classList.add('bg-secondary-fixed', 'text-on-secondary-fixed');
  }

  const kembalianEl = document.getElementById('cash-kembalian');
  const change = Math.max(0, state.nominalReceived - totalAmount);
  if (kembalianEl) {
    kembalianEl.textContent = `Rp ${change.toLocaleString('id-ID')}`;
  }
}

function copyRekening(btn) {
  const noRek = CONFIG.BANK_ACCOUNT_NUMBER.replace(/-/g, '');
  navigator.clipboard?.writeText(noRek);
  btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">done</span><span>Tersalin</span>';
  setTimeout(() => {
    btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">content_copy</span><span>Salin</span>';
  }, 2000);
  showToast('Nomor rekening disalin ke clipboard', 'content_paste');
}

function populateCustomerSelect() {
  const select = document.getElementById('pos-customer-select');
  if (!select) return;

  select.innerHTML = `
    <option value="Pelanggan Walk-in">Pelanggan Umum (Walk-in / Bawa Sendiri)</option>
    ${state.customers.map(c => `
      <option value="${c.nama}">${c.nama} - ${c.organisasi || c.kategori}</option>
    `).join('')}
  `;
}

function startQrisTimer() {
  let seconds = 300; // 5 menit
  const timerEl = document.getElementById('qris-timer');
  setInterval(() => {
    if (!timerEl) return;
    seconds = seconds <= 0 ? 300 : seconds - 1;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

/**
 * Eksekusi Bayar & Simpan Transaksi POS
 */
async function processPaymentAndOpenReceipt() {
  if (state.cart.length === 0) {
    showToast('Keranjang belanja masih kosong!', 'warning');
    return;
  }

  const customerSelect = document.getElementById('pos-customer-select');
  const customerName = customerSelect ? customerSelect.value : 'Pelanggan Walk-in';
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const now = new Date();
  const invoiceId = `INV/ZAM/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;

  const saleRecord = {
    id: invoiceId,
    waktu: now.toISOString(),
    pelanggan: customerName,
    items: state.cart.map(c => `${c.qty}x ${c.nama}`).join(', '),
    itemsList: [...state.cart],
    totalHarga: totalAmount,
    metodeBayar: state.payMethod === 'cash' ? 'Tunai' : (state.payMethod === 'qris' ? 'QRIS' : 'Transfer BCA'),
    status: 'Selesai',
    catatan: 'Kasir POS'
  };

  // Simpan via API
  showToast('Memproses transaksi...', 'sync');
  await API.postAction('addPenjualan', saleRecord);

  // Render modal thermal receipt
  populateThermalReceipt(saleRecord);
  openReceiptModal();

  // Bersihkan keranjang dan perbarui tampilan stok
  state.cart = [];
  renderCart();
  await loadInitialData();
  renderPOSProducts();
}

function populateThermalReceipt(sale) {
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const receiptDate = document.getElementById('receipt-date');
  const receiptNo = document.getElementById('receipt-no');
  const receiptCustomer = document.getElementById('receipt-customer');
  const receiptItems = document.getElementById('receipt-line-items');
  const receiptSubtotal = document.getElementById('receipt-subtotal');
  const receiptTotal = document.getElementById('receipt-total');
  const receiptPaid = document.getElementById('receipt-paid-amount');
  const receiptChange = document.getElementById('receipt-change-amount');
  const receiptMethod = document.getElementById('receipt-pay-method');

  if (receiptDate) receiptDate.textContent = dateStr;
  if (receiptNo) receiptNo.textContent = sale.id;
  if (receiptCustomer) receiptCustomer.textContent = `Cust: ${sale.pelanggan}`;
  if (receiptMethod) receiptMethod.textContent = `Bayar (${sale.metodeBayar})`;

  if (receiptItems && sale.itemsList) {
    receiptItems.innerHTML = sale.itemsList.map(item => `
      <div class="flex justify-between">
        <span class="font-medium truncate pr-2">${item.nama}</span>
        <span class="shrink-0">${item.qty}x ${item.price.toLocaleString('id-ID')}</span>
      </div>
      <div class="text-right text-[11px] text-outline">Rp ${(item.qty * item.price).toLocaleString('id-ID')}</div>
    `).join('');
  }

  if (receiptSubtotal) receiptSubtotal.textContent = `Rp ${sale.totalHarga.toLocaleString('id-ID')}`;
  if (receiptTotal) receiptTotal.textContent = `Rp ${sale.totalHarga.toLocaleString('id-ID')}`;
  
  const paidVal = state.payMethod === 'cash' ? Math.max(sale.totalHarga, state.nominalReceived) : sale.totalHarga;
  const changeVal = Math.max(0, paidVal - sale.totalHarga);
  if (receiptPaid) receiptPaid.textContent = `Rp ${paidVal.toLocaleString('id-ID')}`;
  if (receiptChange) receiptChange.textContent = `Rp ${changeVal.toLocaleString('id-ID')}`;
}

function openReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  const card = document.getElementById('receipt-card');
  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
  }
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  const card = document.getElementById('receipt-card');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
  }
}

function printThermalReceipt() {
  window.print();
  closeReceiptModal();
  showToast('Mencetak struk termal...', 'local_printshop');
}

function shareReceiptWA() {
  const total = document.getElementById('receipt-total')?.textContent || '';
  const no = document.getElementById('receipt-no')?.textContent || '';
  const msg = encodeURIComponent(`*STRUK PEMBAYARAN DEPOT ZAM WATER*\nNo: ${no}\nTotal: ${total}\nStatus: LUNAS\nTerima kasih atas kunjungan Anda!`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
  closeReceiptModal();
}

/**
 * -------------------------------------------------------------
 * 4. Modul Stok & Pelanggan
 * -------------------------------------------------------------
 */
function switchStockTab(type) {
  state.stockTab = type;
  const btnStok = document.getElementById('btn-tab-stok');
  const btnCust = document.getElementById('btn-tab-cust');
  const secStok = document.getElementById('section-stok');
  const secCust = document.getElementById('section-cust');

  if (type === 'stok') {
    btnStok?.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
    btnStok?.classList.remove('text-on-surface-variant');
    btnCust?.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
    btnCust?.classList.add('text-on-surface-variant');
    secStok?.classList.remove('hidden');
    secCust?.classList.add('hidden');
  } else {
    btnCust?.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
    btnCust?.classList.remove('text-on-surface-variant');
    btnStok?.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
    btnStok?.classList.add('text-on-surface-variant');
    secCust?.classList.remove('hidden');
    secStok?.classList.add('hidden');
  }
}

function renderStockView() {
  // Hitung total stok galon terisi
  const ro = state.products.find(p => p.id === 'PROD-02');
  const min = state.products.find(p => p.id === 'PROD-01');
  const tutup = state.products.find(p => p.id === 'PROD-07');

  const totalTerisi = (ro ? ro.stok : 85) + (min ? min.stok : 57);
  const terisiBadge = document.getElementById('metric-galon-terisi');
  if (terisiBadge) terisiBadge.textContent = totalTerisi;

  const roStockEl = document.getElementById('stock-ro-val');
  if (roStockEl && ro) roStockEl.textContent = ro.stok;

  const minStockEl = document.getElementById('stock-min-val');
  if (minStockEl && min) minStockEl.textContent = min.stok;

  const tutupStockEl = document.getElementById('stock-tutup-val');
  if (tutupStockEl && tutup) tutupStockEl.textContent = tutup.stok;
}

let quickWashVal = 5;
function adjustQuickWash(delta) {
  quickWashVal = Math.max(0, quickWashVal + delta);
  const el = document.getElementById('quick-wash-val');
  if (el) el.textContent = quickWashVal;
}

async function applyQuickWash() {
  if (quickWashVal <= 0) return;
  showToast(`Menambahkan ${quickWashVal} galon ke stok siap isi...`, 'sanitizer');
  const ro = state.products.find(p => p.id === 'PROD-02');
  if (ro) {
    ro.stok = (ro.stok || 0) + quickWashVal;
    await API.postAction('updateStok', { id: ro.id, nama: ro.nama, stok: ro.stok });
    renderStockView();
    renderPOSProducts();
  }
  quickWashVal = 5;
  adjustQuickWash(0);
}

function openEditStockModal(prodId) {
  const prod = state.products.find(p => p.id === prodId);
  if (!prod) return;

  const nameInput = document.getElementById('modal-stock-name');
  const qtyInput = document.getElementById('modal-stock-qty');
  const idInput = document.getElementById('modal-stock-id');

  if (nameInput) nameInput.value = prod.nama;
  if (qtyInput) qtyInput.value = prod.stok;
  if (idInput) idInput.value = prod.id;

  const modal = document.getElementById('stock-modal');
  modal?.classList.remove('opacity-0', 'pointer-events-none');
}

function closeEditStockModal() {
  const modal = document.getElementById('stock-modal');
  modal?.classList.add('opacity-0', 'pointer-events-none');
}

async function saveStockUpdate() {
  const idInput = document.getElementById('modal-stock-id');
  const qtyInput = document.getElementById('modal-stock-qty');
  if (!idInput || !qtyInput) return;

  const prodId = idInput.value;
  const newStok = parseInt(qtyInput.value, 10);
  if (isNaN(newStok)) return;

  showToast('Memperbarui stok...', 'sync');
  await API.postAction('updateStok', { id: prodId, stok: newStok });
  
  const prod = state.products.find(p => p.id === prodId);
  if (prod) prod.stok = newStok;

  closeEditStockModal();
  renderStockView();
  renderPOSProducts();
  showToast('Stok berhasil diperbarui!', 'check_circle');
}

function renderCustomerList() {
  const container = document.getElementById('customer-list-container');
  if (!container) return;

  let filtered = state.customers;
  if (state.selectedCustomerCat !== 'all') {
    filtered = filtered.filter(c => c.kategori.toLowerCase().includes(state.selectedCustomerCat.toLowerCase()));
  }
  if (state.customerSearchTerm) {
    const term = state.customerSearchTerm.toLowerCase();
    filtered = filtered.filter(c => 
      c.nama.toLowerCase().includes(term) ||
      (c.organisasi && c.organisasi.toLowerCase().includes(term)) ||
      (c.alamat && c.alamat.toLowerCase().includes(term)) ||
      (c.telepon && c.telepon.includes(term))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-outline bg-surface-container-lowest rounded-xl">
        <span class="material-symbols-outlined text-[32px] mb-2 text-outline/50">person_off</span>
        <p class="font-body-sm">Tidak ada pelanggan yang cocok dengan pencarian.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="customer-card p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-3 border border-surface-container-high/40 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-headline-sm text-headline-sm shrink-0 font-bold">
            ${c.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <h4 class="font-label-lg text-label-lg text-on-surface font-bold">${c.nama}</h4>
              <span class="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold">
                ${c.organisasi || c.kategori}
              </span>
            </div>
            <p class="font-body-sm text-body-sm text-outline flex items-center gap-1 mt-0.5">
              <span class="material-symbols-outlined text-[14px]">call</span>
              <span>${c.telepon || '-'}</span>
            </p>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          ${c.status || 'Aktif'}
        </span>
      </div>

      <div class="p-2.5 rounded-lg bg-surface-container-low flex flex-col space-y-1.5">
        <div class="flex items-center gap-1.5 text-on-surface-variant text-body-sm font-body-sm">
          <span class="material-symbols-outlined text-[16px] text-outline shrink-0">home_pin</span>
          <span class="truncate">${c.alamat || 'Alamat tidak tertera'}</span>
        </div>
        <div class="flex items-center justify-between pt-1 text-label-sm font-label-sm">
          <span class="text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px] text-primary">cycle</span>
            Langganan: <strong class="text-on-surface">${c.langganan || '2 Galon/minggu'}</strong>
          </span>
          <span class="text-primary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded">
            Deposit: ${c.depositGalon || 0} Galon
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <a class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-tertiary-container text-on-tertiary-container font-label-md text-label-md active:scale-98 transition-transform shadow-sm hover:brightness-105" 
           href="https://wa.me/${c.telepon?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(`Halo ${c.nama}, apakah ada jadwal pengantaran air Zam Water hari ini?`)}" 
           target="_blank">
          <span class="material-symbols-outlined text-[18px]">chat</span>
          <span>WhatsApp</span>
        </a>
        <button class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm active:translate-y-0.5 transition-transform hover:bg-primary-container" 
                onclick="createOrderForCustomer('${c.nama}')">
          <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          <span>Buat Pesanan</span>
        </button>
      </div>
    </div>
  `).join('');
}

function filterCustomers() {
  const searchInput = document.getElementById('input-search-cust');
  if (searchInput) {
    state.customerSearchTerm = searchInput.value;
  }
  renderCustomerList();
}

function filterCustCat(cat, btn) {
  state.selectedCustomerCat = cat;
  document.querySelectorAll('.cust-cat-chip').forEach(b => {
    b.classList.remove('bg-primary', 'text-on-primary');
    b.classList.add('bg-surface-container', 'text-on-surface-variant');
  });
  if (btn) {
    btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
    btn.classList.add('bg-primary', 'text-on-primary');
  }
  renderCustomerList();
}

function clearCustSearch() {
  const searchInput = document.getElementById('input-search-cust');
  if (searchInput) searchInput.value = '';
  state.customerSearchTerm = '';
  renderCustomerList();
}

function createOrderForCustomer(customerName) {
  switchView('pos');
  const select = document.getElementById('pos-customer-select');
  if (select) {
    select.value = customerName;
  }
  showToast(`Pesanan untuk ${customerName} disiapkan di POS`, 'shopping_cart');
}

function openAddCustomerModal() {
  const modal = document.getElementById('add-cust-modal');
  modal?.classList.remove('opacity-0', 'pointer-events-none');
}

function closeAddCustomerModal() {
  const modal = document.getElementById('add-cust-modal');
  modal?.classList.add('opacity-0', 'pointer-events-none');
}

async function saveNewCustomer() {
  const nama = document.getElementById('cust-new-name')?.value.trim();
  const telepon = document.getElementById('cust-new-phone')?.value.trim();
  const kategori = document.getElementById('cust-new-category')?.value;
  const alamat = document.getElementById('cust-new-address')?.value.trim();
  const langganan = document.getElementById('cust-new-plan')?.value.trim() || '2 Galon/minggu';
  const deposit = parseInt(document.getElementById('cust-new-deposit')?.value || '0', 10);

  if (!nama || !telepon) {
    showToast('Nama dan nomor HP wajib diisi!', 'error');
    return;
  }

  const newCust = {
    id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
    nama,
    telepon,
    kategori,
    organisasi: kategori,
    alamat,
    langganan,
    depositGalon: deposit,
    status: 'Tetap'
  };

  showToast('Menyimpan pelanggan ke Google Sheets...', 'sync');
  await API.postAction('addPelanggan', newCust);

  state.customers.push(newCust);
  populateCustomerSelect();
  renderCustomerList();
  closeAddCustomerModal();
  showToast('Pelanggan baru berhasil ditambahkan!', 'check_circle');
}

/**
 * -------------------------------------------------------------
 * 5. Modul Portal Laporan Supir
 * -------------------------------------------------------------
 */
function setupDriverCalculations() {
  const keluarInput = document.getElementById('galonKeluar');
  const kembaliInput = document.getElementById('galonKembali');
  const tunaiInput = document.getElementById('setoranTunai');
  const bensinInput = document.getElementById('klaimBensin');
  const catatanInput = document.getElementById('catatanKendala');

  [keluarInput, kembaliInput, tunaiInput, bensinInput, catatanInput].forEach(inp => {
    inp?.addEventListener('input', updateDriverCalculations);
  });

  updateDriverCalculations();
}

function adjustDriverCount(fieldId, delta) {
  const input = document.getElementById(fieldId);
  if (input) {
    const cur = parseInt(input.value || '0', 10);
    input.value = Math.max(0, cur + delta);
    updateDriverCalculations();
  }
}

function quickFillCash(amount) {
  const input = document.getElementById('setoranTunai');
  if (input) {
    input.value = Number(amount).toLocaleString('id-ID');
    updateDriverCalculations();
  }
}

function updateDriverCalculations() {
  const keluar = parseInt(document.getElementById('galonKeluar')?.value || '0', 10);
  const kembali = parseInt(document.getElementById('galonKembali')?.value || '0', 10);
  const tunaiRaw = document.getElementById('setoranTunai')?.value || '0';
  const bensinRaw = document.getElementById('klaimBensin')?.value || '0';
  const catatan = document.getElementById('catatanKendala')?.value || '';

  const tunaiClean = tunaiRaw.replace(/[^0-9]/g, '');
  const bensinClean = bensinRaw.replace(/[^0-9]/g, '');

  const tunai = parseInt(tunaiClean || '0', 10);
  const bensin = parseInt(bensinClean || '0', 10);

  const selisih = Math.max(0, keluar - kembali);
  const selisihBadge = document.getElementById('selisihBadge');
  const selisihInfo = document.getElementById('selisihInfo');

  if (selisihBadge) {
    if (selisih > 0) {
      selisihBadge.textContent = `Selisih: ${selisih} Galon`;
      selisihBadge.className = 'font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-error-container text-on-error-container';
    } else {
      selisihBadge.textContent = 'Cocok (0 Selisih)';
      selisihBadge.className = 'font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed';
    }
  }

  if (selisihInfo) {
    if (selisih > 0) {
      selisihInfo.innerHTML = `<span class="material-symbols-outlined text-[15px] text-error">info</span> Ada ${selisih} galon kosong belum kembali ke depot.`;
      selisihInfo.classList.remove('hidden');
    } else {
      selisihInfo.innerHTML = `<span class="material-symbols-outlined text-[15px] text-tertiary">check_circle</span> Seluruh galon berhasil ditukar kembali secara lengkap.`;
      selisihInfo.classList.remove('hidden');
    }
  }

  // Generate WA Message Template
  const now = new Date();
  const dateFormatted = `${now.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][now.getMonth()]} ${now.getFullYear()}`;
  const driverName = 'Budi Santoso (Armada 01)';
  
  const textMsg = `Halo Admin Zam Water, berikut Laporan Driver:
Nama: ${driverName}
Tanggal: ${dateFormatted}
Galon Keluar: ${keluar} | Galon Kembali: ${kembali} ${selisih > 0 ? `(Selisih: ${selisih})` : ''}
Setoran Tunai: Rp ${tunai.toLocaleString('id-ID')}
Klaim Bensin: Rp ${bensin.toLocaleString('id-ID')}
Catatan: ${catatan || '-'}`;

  const previewEl = document.getElementById('waPreviewText');
  if (previewEl) previewEl.textContent = textMsg;

  const btnWA = document.getElementById('btnKirimWhatsApp');
  if (btnWA) {
    const adminPhone = CONFIG.ADMIN_WA_NUMBER || '6281234567890';
    btnWA.href = `https://wa.me/${adminPhone}?text=${encodeURIComponent(textMsg)}`;
  }
}

function copyDriverWAPreview() {
  const text = document.getElementById('waPreviewText')?.textContent || '';
  navigator.clipboard?.writeText(text);
  showToast('Pesan laporan disalin ke clipboard', 'content_paste');
}

async function saveDriverShift() {
  const keluar = parseInt(document.getElementById('galonKeluar')?.value || '0', 10);
  const kembali = parseInt(document.getElementById('galonKembali')?.value || '0', 10);
  const tunaiRaw = document.getElementById('setoranTunai')?.value || '0';
  const bensinRaw = document.getElementById('klaimBensin')?.value || '0';
  const catatan = document.getElementById('catatanKendala')?.value || '';

  const tunai = parseInt(tunaiRaw.replace(/[^0-9]/g, '') || '0', 10);
  const bensin = parseInt(bensinRaw.replace(/[^0-9]/g, '') || '0', 10);
  const selisih = Math.max(0, keluar - kembali);

  const now = new Date();
  const report = {
    id: `TRIP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`,
    waktu: `${now.getDate()} Mei 2024 • ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`,
    namaSupir: 'Budi Santoso',
    armada: 'Motor Roda 3 Tossa B-4921-ZAM',
    tujuan: 'Trip Selesai Pengantaran',
    galonKeluar: keluar,
    galonKembali: kembali,
    selisih: selisih,
    setoranTunai: tunai,
    klaimBensin: bensin,
    catatan: catatan,
    status: 'Tervalidasi Kasir'
  };

  showToast('Menyimpan laporan shift ke Google Sheets...', 'sync');
  await API.postAction('addLaporanSupir', report);

  state.driverReports.unshift(report);
  renderDriverHistory();
  showToast('Laporan supir berhasil disimpan & shift selesai!', 'check_circle');
}

function renderDriverHistory() {
  const container = document.getElementById('driver-history-container');
  if (!container) return;

  container.innerHTML = state.driverReports.map(rep => `
    <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-2 border border-surface-container-high/40">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-space-sm">
          <div class="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <div>
            <span class="font-label-lg text-label-lg text-on-surface block leading-tight font-semibold">${rep.tujuan || rep.id}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">${rep.waktu}</span>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm font-semibold">
          <span class="material-symbols-outlined text-[14px]">verified</span>
          ${rep.status || 'Tervalidasi'}
        </span>
      </div>
      <div class="grid grid-cols-3 gap-2 py-1.5 px-2 rounded-lg bg-surface-container-low text-center">
        <div>
          <span class="font-label-sm text-label-sm text-outline block">Keluar</span>
          <span class="font-pos-numeral-md text-label-md text-on-surface font-semibold">${rep.galonKeluar} Galon</span>
        </div>
        <div>
          <span class="font-label-sm text-label-sm text-outline block">Kembali</span>
          <span class="font-pos-numeral-md text-label-md text-tertiary font-semibold">${rep.galonKembali} Galon</span>
        </div>
        <div>
          <span class="font-label-sm text-label-sm text-outline block">Setoran</span>
          <span class="font-pos-numeral-md text-label-md text-primary font-bold">Rp ${Number(rep.setoranTunai).toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * -------------------------------------------------------------
 * 6. Modul Slip Gaji Karyawan
 * -------------------------------------------------------------
 */
function renderPayrollView() {
  const container = document.getElementById('payroll-cards-container');
  if (!container) return;

  container.innerHTML = state.employees.map(emp => `
    <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/40 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between gap-space-sm">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-primary font-pos-numeral-md text-label-lg font-bold">
            ${emp.initials || emp.nama.slice(0, 2).toUpperCase()}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <h4 class="font-label-lg text-label-lg text-on-surface truncate font-semibold">${emp.nama}</h4>
              <span class="px-2 py-0.2 rounded-full ${emp.statusBayar === 'Lunas Dicairkan' ? 'bg-emerald-100 text-emerald-800' : 'bg-tertiary-fixed/40 text-on-tertiary-fixed'} text-label-sm font-label-sm shrink-0">
                ${emp.statusBayar || 'Siap Dicairkan'}
              </span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px] text-primary">${emp.icon || 'badge'}</span>
              ${emp.jabatan}
            </p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="font-label-sm text-label-sm text-outline block">Total Diterima</span>
          <span class="font-pos-numeral-md text-pos-numeral-md text-primary font-bold">Rp ${Number(emp.totalGaji).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div class="bg-surface-container-low rounded-lg p-2.5 grid grid-cols-3 gap-2 text-center">
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm text-outline">Gaji Pokok</span>
          <span class="font-label-md text-label-md text-on-surface mt-0.5 font-semibold">Rp ${Number(emp.gajiPokok).toLocaleString('id-ID')}</span>
        </div>
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm text-outline">Bonus Insentif</span>
          <span class="font-label-md text-label-md text-tertiary mt-0.5 font-semibold">+Rp ${Number(emp.bonus).toLocaleString('id-ID')}</span>
          ${emp.galonTerkirim ? `<span class="font-label-sm text-[10px] text-on-surface-variant">(${emp.galonTerkirim} galon)</span>` : ''}
        </div>
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm text-outline">Tunjangan / Lain</span>
          <span class="font-label-md text-label-md text-on-surface mt-0.5 font-semibold">Rp ${Number(emp.tunjangan || 0).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <button class="flex-1 py-2 rounded-lg bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform hover:bg-surface-container-high" 
                onclick="openSlipModal('${emp.key || emp.id}')">
          <span class="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Pratinjau Slip</span>
        </button>
        <button class="px-3.5 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 active:scale-[0.98] transition-transform hover:bg-surface-container" 
                onclick="printSingleSlip('${emp.key || emp.id}')">
          <span class="material-symbols-outlined text-[18px]">print</span>
          <span class="hidden sm:inline">Cetak</span>
        </button>
        <button class="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 active:scale-95 transition-transform hover:bg-tertiary-fixed-dim" 
                onclick="shareSlipWA('${emp.key || emp.id}')"
                title="Kirim slip via WhatsApp">
          <span class="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
    </div>
  `).join('');
}

function openSlipModal(key) {
  const emp = state.employees.find(e => e.key === key || e.id === key);
  if (!emp) return;
  state.activeEmployeeKey = key;

  document.getElementById('modal-emp-name').textContent = emp.nama;
  document.getElementById('modal-emp-role').textContent = emp.jabatan;
  document.getElementById('modal-base-pay').textContent = `Rp ${Number(emp.gajiPokok).toLocaleString('id-ID')}`;
  document.getElementById('modal-bonus-title').textContent = emp.bonusJudul || 'Bonus Insentif Kinerja';
  document.getElementById('modal-bonus-pay').textContent = `+Rp ${Number(emp.bonus).toLocaleString('id-ID')}`;
  document.getElementById('modal-allowance-title').textContent = emp.tunjanganJudul || 'Uang Makan & Transportasi';
  document.getElementById('modal-allowance-pay').textContent = `Rp ${Number(emp.tunjangan || 0).toLocaleString('id-ID')}`;
  document.getElementById('modal-total-pay').textContent = `Rp ${Number(emp.totalGaji).toLocaleString('id-ID')}`;
  document.getElementById('modal-sign-emp').textContent = emp.nama;

  const modal = document.getElementById('slip-modal');
  const card = document.getElementById('slip-card-content');
  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    card.classList.remove('translate-y-8');
    card.classList.add('translate-y-0');
  }
}

function closeSlipModal() {
  const modal = document.getElementById('slip-modal');
  const card = document.getElementById('slip-card-content');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100');
    card.classList.add('translate-y-8');
    card.classList.remove('translate-y-0');
  }
}

function shareSlipWA(key) {
  const emp = state.employees.find(e => e.key === key || e.id === key) || state.employees[0];
  const msg = encodeURIComponent(`*SLIP GAJI DIGITAL - DEPOT ZAM WATER*\nPeriode: Mei 2024\nNama: ${emp.nama}\nJabatan: ${emp.jabatan}\nGaji Pokok: Rp ${Number(emp.gajiPokok).toLocaleString('id-ID')}\nBonus: Rp ${Number(emp.bonus).toLocaleString('id-ID')}\n*Total Diterima: Rp ${Number(emp.totalGaji).toLocaleString('id-ID')}*\nStatus: ${emp.statusBayar || 'Lunas'}`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function printSingleSlip(key) {
  openSlipModal(key);
  setTimeout(() => {
    window.print();
  }, 400);
}

async function triggerBatchPayout() {
  const btn = document.getElementById('btn-batch-payout');
  if (btn) {
    btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span><span>Memproses...</span>`;
  }

  showToast('Memproses pencairan seluruh gaji ke Google Sheets...', 'sync');
  await API.postAction('updateGajiAll', {});

  state.employees.forEach(emp => {
    emp.statusBayar = 'Lunas Dicairkan';
  });

  renderPayrollView();
  if (btn) {
    btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">verified</span><span>Sudah Dicairkan</span>`;
    btn.classList.remove('bg-primary');
    btn.classList.add('bg-tertiary');
  }
  showToast('Seluruh gaji 4 karyawan berhasil dicairkan & dicatat!', 'check_circle');
}

/**
 * -------------------------------------------------------------
 * 7. Modal Pengaturan API Google Sheets
 * -------------------------------------------------------------
 */
function setupSettingsModal() {
  const inputUrl = document.getElementById('settings-gas-url');
  const inputPhone = document.getElementById('settings-admin-phone');
  if (inputUrl) inputUrl.value = CONFIG.GOOGLE_SCRIPT_URL;
  if (inputPhone) inputPhone.value = CONFIG.ADMIN_WA_NUMBER;
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  setupSettingsModal();
  modal?.classList.remove('opacity-0', 'pointer-events-none');
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal?.classList.add('opacity-0', 'pointer-events-none');
}

async function testGasConnection() {
  const inputUrl = document.getElementById('settings-gas-url')?.value.trim();
  const testStatus = document.getElementById('gas-test-result');
  if (testStatus) {
    testStatus.textContent = 'Mengetes koneksi ke Google Sheets...';
    testStatus.className = 'font-body-sm text-primary';
  }

  const result = await API.testConnection(inputUrl);
  if (testStatus) {
    testStatus.textContent = result.message;
    testStatus.className = result.success ? 'font-body-sm text-emerald-600 font-semibold' : 'font-body-sm text-error font-semibold';
  }
}

async function saveSettings() {
  const inputUrl = document.getElementById('settings-gas-url')?.value.trim();
  const inputPhone = document.getElementById('settings-admin-phone')?.value.trim();

  if (inputUrl !== undefined) {
    CONFIG.GOOGLE_SCRIPT_URL = inputUrl;
    localStorage.setItem('zam_gas_url', inputUrl);
  }
  if (inputPhone) {
    CONFIG.ADMIN_WA_NUMBER = inputPhone.replace(/[^0-9]/g, '');
    localStorage.setItem('zam_admin_phone', CONFIG.ADMIN_WA_NUMBER);
  }

  closeSettingsModal();
  showToast('Pengaturan berhasil disimpan!', 'check_circle');
  await loadInitialData();
  renderPOSProducts();
  renderStockView();
  renderCustomerList();
  renderPayrollView();
}

/**
 * -------------------------------------------------------------
 * 8. Toast Helper
 * -------------------------------------------------------------
 */
function showToast(message, icon = 'check_circle') {
  const toast = document.getElementById('global-toast');
  const text = document.getElementById('global-toast-text');
  const iconEl = document.getElementById('global-toast-icon');

  if (text) text.textContent = message;
  if (iconEl) iconEl.textContent = icon;

  if (toast) {
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2800);
  }
}
