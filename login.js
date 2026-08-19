/**
 * Login page logic - Firebase Google & Facebook
 */

document.addEventListener('DOMContentLoaded', () => {
  // Jika sudah login, redirect
  const user = getCurrentUser();
  if (user) {
    if (isAdmin(user)) {
      window.location.href = 'admin/index.html';
    } else {
      window.location.href = 'index.html';
    }
    return;
  }

  // Tombol Google
  document.getElementById('btn-google')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-google');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    const success = await loginWithGoogle();

    if (success) {
      const loggedUser = getCurrentUser();
      showToast('Login berhasil! Selamat datang, ' + (loggedUser?.name || ''));
      setTimeout(() => {
        if (isAdmin(loggedUser)) {
          window.location.href = 'admin/index.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 800);
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fab fa-google"></i> Login dengan Google';
    }
  });

  // Tombol Facebook
  document.getElementById('btn-facebook')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-facebook');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    const success = await loginWithFacebook();

    if (success) {
      const loggedUser = getCurrentUser();
      showToast('Login berhasil! Selamat datang, ' + (loggedUser?.name || ''));
      setTimeout(() => {
        if (isAdmin(loggedUser)) {
          window.location.href = 'admin/index.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 800);
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fab fa-facebook-f"></i> Login dengan Facebook';
    }
  });
});
