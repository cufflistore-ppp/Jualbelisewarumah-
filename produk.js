/**
 * Product rendering & filtering - JualBeliSewaRumah
 */

function renderProductCard(product) {
  const badgeClass = product.status === 'DIJUAL' ? 'badge-dijual' : 'badge-dikontrakkan';
  const mainPhoto = product.photos && product.photos.length > 0 
    ? product.photos[0] 
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return `
    <div class="product-card" onclick="goToDetail('${product.id}')">
      <div class="product-image">
        <img src="${mainPhoto}" alt="${product.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Rumah'">
        <span class="badge ${badgeClass}">${product.status}</span>
      </div>
      <div class="product-body">
        <h3 class="product-title">${escapeHtml(product.title)}</h3>
        <div class="product-price">${product.priceText || formatPrice(product.price)}</div>
        <div class="product-location">
          <i class="fas fa-map-marker-alt"></i>
          <span>${escapeHtml(product.locationShort || product.address)}</span>
        </div>
        <button class="btn-detail" onclick="event.stopPropagation(); goToDetail('${product.id}')">
          <i class="fas fa-eye"></i> Lihat Detail
        </button>
      </div>
    </div>
  `;
}

function goToDetail(id) {
  window.location.href = `detail.html?id=${id}`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderProductGrid(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-home"></i>
        <h3>Belum Ada Rumah</h3>
        <p>Tidak ada rumah yang tersedia saat ini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(p => renderProductCard(p)).join('');
}

function filterProducts(options = {}) {
  let products = getProducts().filter(p => p.active);

  if (options.status) {
    products = products.filter(p => p.status === options.status);
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.locationShort && p.locationShort.toLowerCase().includes(q))
    );
  }

  if (options.location) {
    const loc = options.location.toLowerCase();
    products = products.filter(p =>
      (p.locationShort && p.locationShort.toLowerCase().includes(loc)) ||
      (p.address && p.address.toLowerCase().includes(loc))
    );
  }

  if (options.minPrice !== undefined && options.minPrice !== '') {
    products = products.filter(p => p.price >= Number(options.minPrice));
  }

  if (options.maxPrice !== undefined && options.maxPrice !== '') {
    products = products.filter(p => p.price <= Number(options.maxPrice));
  }

  // Sort newest first
  products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return products;
}

function getUniqueLocations() {
  const products = getProducts().filter(p => p.active);
  const locs = new Set();
  products.forEach(p => {
    if (p.locationShort) locs.add(p.locationShort);
  });
  return Array.from(locs).sort();
}

function populateLocationFilter(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const locations = getUniqueLocations();
  locations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    select.appendChild(opt);
  });
}
