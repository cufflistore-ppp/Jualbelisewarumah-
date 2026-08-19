/**
 * Tambah Rumah form logic
 */

let uploadedPhotos = []; // base64 or object URLs
let uploadedVideo = null;

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  if (user.package === 'none' || user.maxProducts === 0) {
    document.getElementById('form-container').innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <strong>Akses Diperlukan</strong><br>
          Anda belum memiliki paket. Silakan beli paket terlebih dahulu agar dapat menambahkan rumah.
          <br><br>
          <a href="paket.html" class="btn btn-primary">Lihat Paket</a>
        </div>
      </div>
    `;
    return;
  }

  const count = countUserProducts(user.id);
  if (count >= user.maxProducts) {
    document.getElementById('form-container').innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-box"></i>
        <div>
          <strong>Slot Penuh</strong><br>
          Anda sudah menggunakan ${count}/${user.maxProducts} slot produk.
          Upgrade paket atau hapus produk lama untuk menambah yang baru.
        </div>
      </div>
    `;
    return;
  }

  // Update slot info
  const slotEl = document.getElementById('slot-info');
  if (slotEl) {
    slotEl.textContent = `Produk: ${count}/${user.maxProducts}`;
  }

  // Show video field only for package 3
  if (user.package === '3' || user.package === 'admin') {
    document.getElementById('video-group')?.classList.remove('hidden');
  }

  // Photo upload
  const photoInput = document.getElementById('photo-input');
  const photoArea = document.getElementById('photo-upload-area');
  
  photoArea?.addEventListener('click', () => photoInput?.click());
  photoInput?.addEventListener('change', handlePhotoSelect);

  // Drag drop
  photoArea?.addEventListener('dragover', e => {
    e.preventDefault();
    photoArea.classList.add('dragover');
  });
  photoArea?.addEventListener('dragleave', () => photoArea.classList.remove('dragover'));
  photoArea?.addEventListener('drop', e => {
    e.preventDefault();
    photoArea.classList.remove('dragover');
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  });

  // Video
  document.getElementById('video-input')?.addEventListener('change', handleVideoSelect);

  // Form submit
  document.getElementById('form-tambah')?.addEventListener('submit', handleSubmit);
});

function handlePhotoSelect(e) {
  handleFiles(e.target.files);
}

function handleFiles(files) {
  const remaining = 10 - uploadedPhotos.length; // max 10 photos
  const toAdd = Array.from(files).slice(0, remaining);

  toAdd.forEach(file => {
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
    countEl.textContent = `${uploadedPhotos.length} foto dipilih (minimal 5)`;
    countEl.classList.toggle('invalid', uploadedPhotos.length < 5);
  }
}

function removePhoto(index) {
  uploadedPhotos.splice(index, 1);
  renderPhotoPreviews();
}

function handleVideoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('video/')) {
    showToast('File harus berupa video', 'error');
    return;
  }
  // For demo, we just store object URL (won't persist across sessions well, but ok for demo)
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
    showToast('Minimal 5 foto wajib di-upload', 'error');
    return;
  }

  const count = countUserProducts(user.id);
  if (count >= user.maxProducts) {
    showToast('Slot produk sudah penuh', 'error');
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
    showToast('Lengkapi semua field wajib', 'error');
    return;
  }

  if (whatsapp.length < 10) {
    showToast('Nomor WhatsApp tidak valid', 'error');
    return;
  }

  // Format price text
  let priceText;
  if (status === 'DIKONTRAKKAN') {
    if (price >= 1000000) {
      priceText = `Rp${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)} Jt/Tahun`;
    } else {
      priceText = formatPrice(price) + '/Tahun';
    }
  } else {
    if (price >= 1000000000) {
      priceText = `Rp${(price / 1000000000).toFixed(2)} Miliar`;
    } else if (price >= 1000000) {
      priceText = formatPrice(price);
    } else {
      priceText = formatPrice(price);
    }
  }

  const product = {
    id: generateId('prod'),
    ownerId: user.id,
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
    video: uploadedVideo,
    createdAt: new Date().toISOString(),
    active: true
  };

  const products = getProducts();
  products.push(product);
  saveProducts(products);

  showToast('Rumah berhasil ditambahkan!');
  setTimeout(() => {
    window.location.href = 'saya.html';
  }, 1000);
}
