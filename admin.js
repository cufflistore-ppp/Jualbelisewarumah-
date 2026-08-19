/**
 * Admin Panel Logic - Firebase
 */

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || !isAdmin(user)) {
    window.location.href = '../login.html';
    return null;
  }
  return user;
}

function initAdminSidebar() {
  const path = window.location.pathname.split('/').pop() || 'admin-index.html';
  document.querySelectorAll('.admin-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'admin-index.html')) {
      a.classList.add('active');
    }
  });

  document.getElementById('admin-menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.admin-sidebar')?.classList.toggle('open');
  });
}

async function loadDashboardStats() {
  const users = (await getUsersFromFirebase()).filter(u => u.package !== 'admin');
  const products = getProducts();
  const activeProducts = products.filter(p => p.active);
  const withPackage = users.filter(u => u.package === '1' || u.package === '3');

  const el = (id) => document.getElementById(id);
  if (el('stat-users')) el('stat-users').textContent = users.length;
  if (el('stat-products')) el('stat-products').textContent = activeProducts.length;
  if (el('stat-packages')) el('stat-packages').textContent = withPackage.length;
  if (el('stat-dijual')) el('stat-dijual').textContent = activeProducts.filter(p => p.status === 'DIJUAL').length;
}

async function loadUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  const users = (await getUsersFromFirebase()).filter(u => u.package !== 'admin');
  const search = (document.getElementById('search-users')?.value || '').toLowerCase();

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search) ||
    (u.email || '').toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Tidak ada pengguna</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const count = countUserProducts(u.id);
    const pkgClass = u.package === '1' ? 'paket1' : u.package === '3' ? 'paket3' : 'none';
    return `
      <tr>
        <td>
          <div class="user-cell">
            <img src="${u.avatar || ''}" class="user-avatar" alt="" onerror="this.src='https://ui-avatars.com/api/?name=U&size=36'">
            <div>
              <div style="font-weight:600;color:white;">${escapeHtml(u.name)}</div>
              <div style="font-size:0.8rem;color:#94a3b8;">${escapeHtml(u.email)}</div>
            </div>
          </div>
        </td>
        <td><span class="admin-badge ${u.provider || 'google'}">${u.provider || '-'}</span></td>
        <td><span class="admin-badge ${pkgClass}">${getPackageLabel(u.package)}</span></td>
        <td>${count}/${u.maxProducts || 0}</td>
        <td>
          <span class="admin-badge ${u.active !== false ? 'active' : 'inactive'}">
            ${u.active !== false ? 'Aktif' : 'Nonaktif'}
          </span>
        </td>
        <td>
          <div class="admin-actions">
            <button class="admin-btn admin-btn-primary" onclick="openPackageModal('${u.id}')" title="Atur Paket">
              <i class="fas fa-box"></i>
            </button>
            <button class="admin-btn ${u.active !== false ? 'admin-btn-warning' : 'admin-btn-success'}"
                    onclick="toggleUserActive('${u.id}', ${u.active === false})" title="${u.active !== false ? 'Nonaktifkan' : 'Aktifkan'}">
              <i class="fas fa-${u.active !== false ? 'ban' : 'check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function loadProductsTable() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  const products = getProducts();
  const search = (document.getElementById('search-products')?.value || '').toLowerCase();

  const filtered = products.filter(p =>
    (p.title || '').toLowerCase().includes(search) ||
    (p.address && p.address.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Tidak ada produk</td></tr>`;
    return;
  }

  // Load users for owner names
  getUsersFromFirebase().then(users => {
    tbody.innerHTML = filtered.map(p => {
      const owner = users.find(u => u.id === p.ownerId);
      return `
        <tr>
          <td>
            <div class="user-cell">
              <img src="${p.photos?.[0] || ''}" class="user-avatar" style="border-radius:8px;" onerror="this.src='https://via.placeholder.com/36'">
              <div>
                <div style="font-weight:600;color:white;">${escapeHtml(p.title)}</div>
                <div style="font-size:0.8rem;color:#94a3b8;">${escapeHtml(p.locationShort || '')}</div>
              </div>
            </div>
          </td>
          <td><span class="admin-badge ${p.status === 'DIJUAL' ? 'paket1' : 'paket3'}">${p.status}</span></td>
          <td>${p.priceText || formatPrice(p.price)}</td>
          <td>${owner ? escapeHtml(owner.name) : '-'}</td>
          <td>
            <span class="admin-badge ${p.active ? 'active' : 'inactive'}">
              ${p.active ? 'Aktif' : 'Nonaktif'}
            </span>
          </td>
          <td>
            <div class="admin-actions">
              <button class="admin-btn admin-btn-outline" onclick="viewProductAdmin('${p.id}')" title="Lihat">
                <i class="fas fa-eye"></i>
              </button>
              <button class="admin-btn admin-btn-danger" onclick="deleteProductAdmin('${p.id}')" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  });
}

let selectedUserId = null;
let cachedUsers = [];

async function openPackageModal(userId) {
  selectedUserId = userId;
  if (cachedUsers.length === 0) {
    cachedUsers = await getUsersFromFirebase();
  }
  const user = cachedUsers.find(u => u.id === userId) || (await getUsersFromFirebase()).find(u => u.id === userId);
  if (!user) return;

  document.getElementById('modal-user-name').textContent = user.name;
  document.getElementById('modal-package').value = user.package === 'none' ? '' : (user.package || '');
  document.getElementById('package-modal').classList.add('show');
}

function closePackageModal() {
  document.getElementById('package-modal')?.classList.remove('show');
  selectedUserId = null;
}

async function savePackage() {
  if (!selectedUserId) return;
  const pkg = document.getElementById('modal-package').value;

  try {
    await updateUserPackage(selectedUserId, pkg);
    showToast('Paket berhasil diperbarui');
    closePackageModal();
    cachedUsers = [];
    loadUsersTable();
    if (document.getElementById('stat-packages')) loadDashboardStats();
  } catch (e) {
    showToast('Gagal menyimpan paket: ' + e.message, 'error');
  }
}

async function toggleUserActive(userId, setActive) {
  try {
    await toggleUserActiveStatus(userId, setActive);
    showToast(setActive ? 'Akun diaktifkan' : 'Akun dinonaktifkan');
    cachedUsers = [];
    loadUsersTable();
  } catch (e) {
    showToast('Gagal mengubah status', 'error');
  }
}

function deleteProductAdmin(productId) {
  if (!confirm('Yakin ingin menghapus produk ini?')) return;
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return;
  products[idx].active = false;
  saveProducts(products);
  showToast('Produk dihapus');
  loadProductsTable();
  if (document.getElementById('stat-products')) loadDashboardStats();
}

function viewProductAdmin(productId) {
  window.open(`../detail.html?id=${productId}`, '_blank');
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
