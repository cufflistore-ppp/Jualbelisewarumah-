/**
 * Auth System - JualBeliSewaRumah
 * Firebase Authentication (Google & Facebook only)
 * User data + packages stored in Firebase Realtime Database
 */

const AUTH_KEY = 'jbsr_current_user';
const ADMIN_EMAIL = 'raffliraffli649@gmail.com'; // Email admin

/**
 * Login dengan Google
 */
async function loginWithGoogle() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    await saveOrUpdateUser(user, 'google');
    return true;
  } catch (error) {
    console.error('Google login error:', error);
    handleAuthError(error);
    return false;
  }
}

/**
 * Login dengan Facebook
 */
async function loginWithFacebook() {
  try {
    const result = await auth.signInWithPopup(facebookProvider);
    const user = result.user;
    await saveOrUpdateUser(user, 'facebook');
    return true;
  } catch (error) {
    console.error('Facebook login error:', error);
    handleAuthError(error);
    return false;
  }
}

/**
 * Simpan / update data user di Realtime Database
 * Akun baru otomatis dibuat dengan package: none
 */
async function saveOrUpdateUser(firebaseUser, provider) {
  const userRef = database.ref('users/' + firebaseUser.uid);
  const snapshot = await userRef.once('value');

  let userData;

  if (snapshot.exists()) {
    // User sudah ada → update info login
    userData = snapshot.val();
    userData.name = firebaseUser.displayName || userData.name;
    userData.email = firebaseUser.email || userData.email;
    userData.avatar = firebaseUser.photoURL || userData.avatar;
    userData.lastLogin = new Date().toISOString();
  } else {
    // User baru → buat akun dengan paket kosong
    userData = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Pengguna',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=2563eb&color=fff&size=128`,
      provider: provider,
      package: 'none',
      maxProducts: 0,
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Jika email admin, berikan akses admin
    if (firebaseUser.email === ADMIN_EMAIL) {
      userData.package = 'admin';
      userData.maxProducts = 999;
    }
  }

  await userRef.set(userData);
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  return userData;
}

/**
 * Handle error login
 */
function handleAuthError(error) {
  let message = 'Login gagal. Coba lagi.';

  switch (error.code) {
    case 'auth/popup-closed-by-user':
      message = 'Login dibatalkan.';
      break;
    case 'auth/popup-blocked':
      message = 'Popup diblokir browser. Izinkan popup untuk login.';
      break;
    case 'auth/account-exists-with-different-credential':
      message = 'Email sudah terdaftar dengan metode login lain.';
      break;
    case 'auth/network-request-failed':
      message = 'Koneksi internet bermasalah.';
      break;
    case 'auth/unauthorized-domain':
      message = 'Domain belum diizinkan di Firebase Console. Tambahkan domain di Authentication > Settings.';
      break;
    default:
      message = error.message || message;
  }

  showToast(message, 'error');
}

/**
 * Get current user
 */
function getCurrentUser() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Refresh data user dari database
 */
async function refreshCurrentUser() {
  const current = getCurrentUser();
  if (!current || !current.id) return null;

  try {
    const snapshot = await database.ref('users/' + current.id).once('value');
    if (snapshot.exists()) {
      const userData = snapshot.val();
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      return userData;
    }
  } catch (e) {
    console.error('Refresh user error:', e);
  }
  return current;
}

/**
 * Logout
 */
async function logout() {
  try {
    await auth.signOut();
  } catch (e) {
    console.error('Logout error:', e);
  }
  localStorage.removeItem(AUTH_KEY);
  window.location.href = getBasePath() + 'login.html';
}

/**
 * Cek login, redirect jika belum
 */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = getBasePath() + 'login.html';
    return null;
  }
  return user;
}

/**
 * Cek admin
 */
function isAdmin(user) {
  return user && (user.package === 'admin' || user.email === ADMIN_EMAIL);
}

/**
 * Label paket
 */
function getPackageLabel(pkg) {
  if (pkg === '1') return 'Paket 1 Produk';
  if (pkg === '3') return 'Paket 3 Produk';
  if (pkg === 'admin') return 'Admin';
  return 'Belum Berlangganan';
}

/**
 * Hitung produk milik user
 */
function countUserProducts(userId) {
  const products = getProducts();
  return products.filter(p => p.ownerId === userId && p.active).length;
}

/**
 * Format harga
 */
function formatPrice(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Toast
 */
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/**
 * Generate ID
 */
function generateId(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

/**
 * Base path
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/admin/')) return '../';
  return '';
}

/* ========== PRODUCTS ========== */

const PRODUCTS_KEY = 'jbsr_products';

function getProducts() {
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  try {
    if (typeof database !== 'undefined') {
      database.ref('products').set(products);
    }
  } catch (e) {
    console.warn('Sync products gagal:', e);
  }
}

async function loadProductsFromFirebase() {
  try {
    const snapshot = await database.ref('products').once('value');
    if (snapshot.exists()) {
      const products = snapshot.val();
      if (Array.isArray(products)) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        return products;
      }
    }
  } catch (e) {
    console.warn('Load products gagal:', e);
  }
  return getProducts();
}

/**
 * Load semua users (admin)
 */
async function getUsersFromFirebase() {
  try {
    const snapshot = await database.ref('users').once('value');
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
  } catch (e) {
    console.error('Load users error:', e);
  }
  return [];
}

/**
 * Update paket user (admin)
 */
async function updateUserPackage(userId, packageType) {
  const updates = {};
  if (packageType === '1') {
    updates.package = '1';
    updates.maxProducts = 1;
  } else if (packageType === '3') {
    updates.package = '3';
    updates.maxProducts = 3;
  } else {
    updates.package = 'none';
    updates.maxProducts = 0;
  }

  await database.ref('users/' + userId).update(updates);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.package = updates.package;
    current.maxProducts = updates.maxProducts;
    localStorage.setItem(AUTH_KEY, JSON.stringify(current));
  }
}

/**
 * Toggle active user
 */
async function toggleUserActiveStatus(userId, active) {
  await database.ref('users/' + userId).update({ active: active });
}

/**
 * Auth state listener
 */
function initAuthListener() {
  if (typeof auth === 'undefined') return;

  auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const current = getCurrentUser();
      if (!current || current.id !== firebaseUser.uid) {
        const provider = firebaseUser.providerData[0]?.providerId?.includes('facebook')
          ? 'facebook'
          : 'google';
        await saveOrUpdateUser(firebaseUser, provider);
      } else {
        await refreshCurrentUser();
      }
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  });
}

// Init
if (typeof firebase !== 'undefined') {
  initAuthListener();
}
