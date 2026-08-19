/**
 * Detail page logic
 */

let currentProduct = null;
let currentPhotoIndex = 0;
let mediaList = [];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('detail-container').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Rumah Tidak Ditemukan</h3>
        <p>ID produk tidak valid.</p>
        <a href="index.html" class="btn btn-primary mt-2">Kembali ke Beranda</a>
      </div>
    `;
    return;
  }

  const products = getProducts();
  currentProduct = products.find(p => p.id === id && p.active);

  if (!currentProduct) {
    document.getElementById('detail-container').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-home"></i>
        <h3>Rumah Tidak Ditemukan</h3>
        <p>Produk mungkin sudah dihapus atau tidak aktif.</p>
        <a href="index.html" class="btn btn-primary mt-2">Kembali ke Beranda</a>
      </div>
    `;
    return;
  }

  renderDetail(currentProduct);
});

function renderDetail(product) {
  // Build media list (photos + video)
  mediaList = [...(product.photos || [])];
  if (product.video) {
    mediaList.push({ type: 'video', src: product.video });
  }

  const badgeClass = product.status === 'DIJUAL' ? 'badge-dijual' : 'badge-dikontrakkan';
  const facilities = (product.facilities || []).map(f => 
    `<span class="fasilitas-tag">${escapeHtml(f)}</span>`
  ).join('');

  const whatsappMsg = encodeURIComponent(
    'Halo, saya melihat rumah yang Anda pasang di JualBeliSewaRumah. Saya ingin bertanya mengenai rumah tersebut.'
  );
  const waLink = `https://wa.me/${product.whatsapp}?text=${whatsappMsg}`;

  document.getElementById('detail-container').innerHTML = `
    <div class="detail-gallery">
      <div class="gallery-main" id="gallery-main">
        ${renderMainMedia(0)}
      </div>
      <button class="gallery-nav gallery-prev" onclick="prevMedia()">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="gallery-nav gallery-next" onclick="nextMedia()">
        <i class="fas fa-chevron-right"></i>
      </button>
      <div class="gallery-thumbs" id="gallery-thumbs">
        ${mediaList.map((m, i) => {
          if (typeof m === 'string') {
            return `<div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="showMedia(${i})">
              <img src="${m}" alt="Foto ${i+1}" onerror="this.src='https://via.placeholder.com/100x75?text=Foto'">
            </div>`;
          } else {
            return `<div class="thumb-item video-thumb ${i === 0 ? 'active' : ''}" onclick="showMedia(${i})">
              <video src="${m.src}" muted></video>
            </div>`;
          }
        }).join('')}
      </div>
    </div>

    <div class="detail-content">
      <div class="detail-badge-row">
        <span class="badge ${badgeClass}">${product.status}</span>
      </div>
      <h1 class="detail-title">${escapeHtml(product.title)}</h1>
      <div class="detail-price">${product.priceText || formatPrice(product.price)}</div>
      
      <div class="detail-location">
        <i class="fas fa-map-marker-alt"></i>
        <span>${escapeHtml(product.address)}</span>
      </div>

      <div class="detail-specs">
        <div class="spec-item">
          <i class="fas fa-bed"></i>
          <div>
            <div class="spec-label">Kamar Tidur</div>
            <div class="spec-value">${product.bedrooms || '-'}</div>
          </div>
        </div>
        <div class="spec-item">
          <i class="fas fa-bath"></i>
          <div>
            <div class="spec-label">Kamar Mandi</div>
            <div class="spec-value">${product.bathrooms || '-'}</div>
          </div>
        </div>
        <div class="spec-item">
          <i class="fas fa-ruler-combined"></i>
          <div>
            <div class="spec-label">Luas Tanah</div>
            <div class="spec-value">${product.landArea || '-'} m²</div>
          </div>
        </div>
        <div class="spec-item">
          <i class="fas fa-home"></i>
          <div>
            <div class="spec-label">Luas Bangunan</div>
            <div class="spec-value">${product.buildingArea || '-'} m²</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3><i class="fas fa-align-left"></i> Deskripsi</h3>
        <p>${escapeHtml(product.description || 'Tidak ada deskripsi.')}</p>
      </div>

      ${facilities ? `
      <div class="detail-section">
        <h3><i class="fas fa-check-circle"></i> Fasilitas</h3>
        <div class="fasilitas-list">${facilities}</div>
      </div>
      ` : ''}

      <div class="contact-section">
        <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-whatsapp">
          <i class="fab fa-whatsapp"></i> Hubungi Pemilik via WhatsApp
        </a>
      </div>
    </div>
  `;
}

function renderMainMedia(index) {
  const media = mediaList[index];
  if (!media) return '';
  if (typeof media === 'string') {
    return `<img src="${media}" alt="Foto rumah" id="main-media" onerror="this.src='https://via.placeholder.com/800x500?text=Foto+Rumah'">`;
  } else {
    return `<video src="${media.src}" controls autoplay id="main-media" style="width:100%;height:100%;object-fit:cover;"></video>`;
  }
}

function showMedia(index) {
  currentPhotoIndex = index;
  document.getElementById('gallery-main').innerHTML = renderMainMedia(index);
  
  document.querySelectorAll('.thumb-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
}

function prevMedia() {
  currentPhotoIndex = (currentPhotoIndex - 1 + mediaList.length) % mediaList.length;
  showMedia(currentPhotoIndex);
}

function nextMedia() {
  currentPhotoIndex = (currentPhotoIndex + 1) % mediaList.length;
  showMedia(currentPhotoIndex);
}
