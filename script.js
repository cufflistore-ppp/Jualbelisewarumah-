/**
 * Main shared scripts - JualBeliSewaRumah
 */

// Format helpers already in auth.js

document.addEventListener('DOMContentLoaded', () => {
  // Protect pages that need auth (except index, kontrakan, jual-rumah, detail, login)
  const publicPages = ['index.html', 'kontrakan.html', 'jual-rumah.html', 'detail.html', 'login.html', ''];
  const path = window.location.pathname.split('/').pop() || '';
  
  // Saya, tambah, edit, paket require login
  const protectedPages = ['saya.html', 'tambah-rumah.html', 'edit-rumah.html', 'paket.html'];
  if (protectedPages.includes(path)) {
    requireAuth();
  }
});
