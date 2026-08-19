/**
 * Bottom Navigation - JualBeliSewaRumah
 */

function initBottomNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }

    // Click animation
    item.addEventListener('click', function(e) {
      this.style.transform = 'scale(0.9)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
}

// Create bottom nav HTML if not present
function ensureBottomNav() {
  if (document.querySelector('.bottom-nav')) {
    initBottomNav();
    return;
  }

  // Only on main pages, not login/admin
  const path = window.location.pathname.split('/').pop() || '';
  if (path.includes('login') || path.includes('admin') || path.includes('tambah') || path.includes('edit') || path.includes('paket')) {
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <a href="index.html" class="nav-item">
      <i class="fas fa-house"></i>
      <span>Beranda</span>
    </a>
    <a href="kontrakan.html" class="nav-item">
      <i class="fas fa-building"></i>
      <span>Kontrakan</span>
    </a>
    <a href="jual-rumah.html" class="nav-item">
      <i class="fas fa-house-chimney"></i>
      <span>Jual Rumah</span>
    </a>
    <a href="saya.html" class="nav-item">
      <i class="fas fa-user"></i>
      <span>Saya</span>
    </a>
  `;
  document.body.appendChild(nav);
  initBottomNav();
}

document.addEventListener('DOMContentLoaded', ensureBottomNav);
