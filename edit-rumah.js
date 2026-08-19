/**
 * Edit Rumah form logic
 */

let uploadedPhotos = [];
let uploadedVideo = null;
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  editingId = params.get('id');

  if (!editingId) {
    showToast('ID produk tidak valid', 'error');
    setTimeout(() => window.location.href = 'saya.html', 1000);
    return;
  }

  const products = getProducts();
  const product = products.find(p => p.id === editingId);

  if (!product || product.ownerId !== user.id) {
    showToast('Produk tidak ditemukan atau bukan milik Anda', 'error');
    setTimeout(() => window.location.href = 'saya.html', 1000);
    return;
  }

  // Fill form
  document.getElementById('title').value = product.title || '';
  document.getElementById('status').value = product.status || 'DIJUAL';
  document.getElementById('price').value = product.price || '';
  document.getElementById('address').value = product.address || '';
  document.getElementById('locationShort').value = product.locationShort || '';
  document.getElementById('description').value = product.description || '';
  document.getElementById('bedrooms').value = product.bedrooms || '';
  document.getElementById('bathrooms').value = product.bathrooms || '';
  document.getElementById('landArea').value = product.landArea || '';
  document.getElementById('buildingArea').value = product.buildingArea || '';
  document.getElementById('facilities').value = (product.facilities || []).join(', ');
  document.getElementById('whatsapp').value = product.whatsapp || '';

  uploadedPhotos = [...(product.photos || [])];
  uploadedVideo = product.video || null;
  renderPhotoPreviews();

  if (uploadedVideo) {
    document.getElementById('video-preview').innerHTML = `
      <video src="${uploadedVideo}" controls style="max-width:100%;border-radius:10px;max-height:200px;"></video>
      <button type="button" class="btn btn-danger mt-1" onclick="removeVideo()" style="padding:6px 12px;font-size:0.8rem;">
        <i class="fas fa-trash"></i> Hapus Video
      </button>
    `;
  }

  // Show video if package allows
  if (user.package === '3' || user.package === 'admin') {
    document.getElementById('video-group')?.classList.remove('hidden');
  }

  // Photo handlers
  const photoInput = document.getElementById('photo-input');
  const photoArea = document.getElementById('photo-upload-area');
  photoArea?.addEventListener('click', () => photoInput?.click());
  photoInput?.addEventListener('change', e => handleFiles(e.target.files));

  document.getElementById('video-input')?.addEventListener('change', handleVideoSelect);
  document.getElementById('form-edit')?.addEventListener('submit', handleSubmit);
});

function handleFiles(files) {
  const remaining = 10 - uploadedPhotos.length;
  Array.from(files).slice(0, remaining).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadedPhotos.push(ev.target.result);
      renderPhotoPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoPreviews() {
  const grid = document.getElementById('photo-preview-grid');
  const countEl = document.getElementById('photo-count');
  if (!grid) return;

  grid.innerHTML = uploadedPhotos.map((src, i) => `
    <div class="photo-preview-item">
      <img src="${src}" alt="Foto ${i+1}">
      <button type="button" class="remove-photo" onclick="removePhoto(${i})">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  if (countEl) {
    countEl.textContent = `${uploadedPhotos.length} foto (minimal 5)`;
    countEl.classList.toggle('invalid', uploadedPhotos.length < 5);
  }
}

function removePhoto(index) {
  uploadedPhotos.splice(index, 1);
  renderPhotoPreviews();
}

function handleVideoSelect(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('video/')) return;
  uploadedVideo = URL.createObjectURL(file);
  document.getElementById('video-preview').innerHTML = `
    <video src="${uploadedVideo}" controls style="max-width:100%;border-radius:10px;max-height:200px;"></video>
    <button type="button" class="btn btn-danger mt-1" onclick="removeVideo()" style="padding:6px 12px;font-size:0.8rem;">
      <i class="fas fa-trash"></i> Hapus Video
    </button>
  `;
}

function removeVideo() {
  uploadedVideo = null;
  document.getElementById('video-preview').innerHTML = '';
  document.getElementById('video-input').value = '';
}

function handleSubmit(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;

  if (uploadedPhotos.length < 5) {
    showToast('Minimal 5 foto wajib', 'error');
    return;
  }

  const title = document.getElementById('title').value.trim();
  const status = document.getElementById('status').value;
  const price = Number(document.getElementById('price').value);
  const address = document.getElementById('address').value.trim();
  const locationShort = document.getElementById('locationShort').value.trim();
  const description = document.getElementById('description').value.trim();
  const bedrooms = Number(document.getElementById('bedrooms').value) || 0;
  const bathrooms = Number(document.getElementById('bathrooms').value) || 0;
  const landArea = Number(document.getElementById('landArea').value) || 0;
  const buildingArea = Number(document.getElementById('buildingArea').value) || 0;
  const facilitiesStr = document.getElementById('facilities').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim().replace(/\D/g, '');

  if (!title || !status || !price || !address || !whatsapp) {
    showToast('Lengkapi field wajib', 'error');
    return;
  }

  let priceText;
  if (status === 'DIKONTRAKKAN') {
    priceText = price >= 1000000 
      ? `Rp${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)} Jt/Tahun`
      : formatPrice(price) + '/Tahun';
  } else {
    priceText = price >= 1000000000
      ? `Rp${(price / 1000000000).toFixed(2)} Miliar`
      : formatPrice(price);
  }

  const products = getProducts();
  const idx = products.findIndex(p => p.id === editingId);
  if (idx === -1) {
    showToast('Produk tidak ditemukan', 'error');
    return;
  }

  products[idx] = {
    ...products[idx],
    title,
    status,
    price,
    priceText,
    address,
    locationShort: locationShort || address.split(',')[0],
    description,
    bedrooms,
    bathrooms,
    landArea,
    buildingArea,
    facilities: facilitiesStr ? facilitiesStr.split(',').map(s => s.trim()).filter(Boolean) : [],
    whatsapp: whatsapp.startsWith('62') ? whatsapp : '62' + whatsapp.replace(/^0/, ''),
    photos: uploadedPhotos,
    video: uploadedVideo
  };

  saveProducts(products);
  showToast('Perubahan berhasil disimpan!');
  setTimeout(() => window.location.href = 'saya.html', 800);
}
