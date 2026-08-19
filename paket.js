/**
 * Paket page - info only (payment is offline / manual by admin)
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Update current package display
  const pkgLabel = document.getElementById('current-package');
  if (pkgLabel) {
    pkgLabel.textContent = getPackageLabel(user.package);
  }

  const count = countUserProducts(user.id);
  const slotEl = document.getElementById('current-slot');
  if (slotEl) {
    slotEl.textContent = `${count}/${user.maxProducts}`;
  }
});
