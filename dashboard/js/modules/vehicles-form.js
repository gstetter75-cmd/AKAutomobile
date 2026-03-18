/* ==========================================================================
   Vehicle Form Module (Create / Edit)
   ========================================================================== */

async function renderVehicleForm(container, vehicleId) {
  let vehicle = null;
  const isEdit = !!vehicleId;

  if (isEdit) {
    vehicle = await api.fetchById('vehicles', vehicleId);
  }

  const v = vehicle || {};

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>${isEdit ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'}</h1>
        <p class="page-subtitle">${isEdit ? v.name : 'Fahrzeug zum Bestand hinzufügen'}</p>
      </div>
      <a href="#/vehicles" class="btn btn-outline">&larr; Zurück</a>
    </div>

    <form id="vehicleForm" class="card">
      <div class="card-body">
        <h3 class="form-section-title">Grunddaten</h3>
        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="vBrand">Marke *</label>
            <input type="text" id="vBrand" name="brand" class="form-input" value="${escapeHtml(v.brand || '')}" required placeholder="z.B. Volkswagen">
          </div>
          <div class="form-group">
            <label class="form-label" for="vModel">Modell *</label>
            <input type="text" id="vModel" name="model" class="form-input" value="${escapeHtml(v.model || '')}" required placeholder="z.B. Golf 1.5 TSI Life">
          </div>
          <div class="form-group">
            <label class="form-label" for="vName">Anzeigename *</label>
            <input type="text" id="vName" name="name" class="form-input" value="${escapeHtml(v.name || '')}" required placeholder="z.B. VW Golf 1.5 TSI Life">
          </div>
        </div>

        <div class="form-grid-4">
          <div class="form-group">
            <label class="form-label" for="vYear">Baujahr *</label>
            <input type="number" id="vYear" name="year" class="form-input" value="${v.year || ''}" required min="1990" max="2030">
          </div>
          <div class="form-group">
            <label class="form-label" for="vPrice">Preis (€) *</label>
            <input type="number" id="vPrice" name="price" class="form-input" value="${v.price || ''}" required min="0" step="100">
          </div>
          <div class="form-group">
            <label class="form-label" for="vMileage">Km-Stand *</label>
            <input type="number" id="vMileage" name="mileage" class="form-input" value="${v.mileage || ''}" required min="0" step="1000">
          </div>
          <div class="form-group">
            <label class="form-label" for="vCategory">Kategorie *</label>
            <select id="vCategory" name="category" class="form-input" required>
              <option value="">Wählen...</option>
              ${Object.entries(categoryMap).map(([val, label]) =>
                `<option value="${val}" ${v.category === val ? 'selected' : ''}>${label}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-4">
          <div class="form-group">
            <label class="form-label" for="vFuel">Kraftstoff *</label>
            <select id="vFuel" name="fuel" class="form-input" required>
              <option value="">Wählen...</option>
              ${['Benzin', 'Diesel', 'Hybrid', 'Elektro', 'Autogas'].map(f =>
                `<option value="${f}" ${v.fuel === f ? 'selected' : ''}>${f}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="vStatus">Status</label>
            <select id="vStatus" name="status" class="form-input">
              ${['available', 'reserved', 'sold'].map(s =>
                `<option value="${s}" ${(v.status || 'available') === s ? 'selected' : ''}>${vehicleStatusMap[s].label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="vBadge">Badge (optional)</label>
            <input type="text" id="vBadge" name="badge" class="form-input" value="${escapeHtml(v.badge || '')}" placeholder="z.B. Top-Angebot">
          </div>
          <div class="form-group">
            <label class="form-label" for="vHp">Leistung (PS)</label>
            <input type="number" id="vHp" name="hp" class="form-input" value="${v.hp || ''}" min="0">
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="vPurchasePrice">Einkaufspreis (€) <span class="text-muted">intern</span></label>
            <input type="number" id="vPurchasePrice" name="purchase_price" class="form-input" value="${v.purchase_price || ''}" min="0" step="100" placeholder="Nur für Margenberechnung">
          </div>
          <div class="form-group" id="marginDisplay" style="display:flex;align-items:flex-end;">
            <div class="margin-info">
              <span class="form-label">Marge</span>
              <div id="marginValue" class="margin-value">—</div>
            </div>
          </div>
        </div>

        <h3 class="form-section-title">Technische Daten</h3>
        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="vEngine">Motor</label>
            <input type="text" id="vEngine" name="engine" class="form-input" value="${escapeHtml(v.engine || '')}" placeholder="z.B. 1.5L TSI evo2">
          </div>
          <div class="form-group">
            <label class="form-label" for="vTransmission">Getriebe</label>
            <input type="text" id="vTransmission" name="transmission" class="form-input" value="${escapeHtml(v.transmission || '')}" placeholder="z.B. 7-Gang DSG">
          </div>
          <div class="form-group">
            <label class="form-label" for="vDrivetrain">Antrieb</label>
            <select id="vDrivetrain" name="drivetrain" class="form-input">
              <option value="">Wählen...</option>
              ${['FWD', 'RWD', 'AWD'].map(d =>
                `<option value="${d}" ${v.drivetrain === d ? 'selected' : ''}>${d}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="vTopSpeed">Höchstgeschwindigkeit</label>
            <input type="text" id="vTopSpeed" name="top_speed" class="form-input" value="${escapeHtml(v.top_speed || '')}" placeholder="z.B. 224 km/h">
          </div>
          <div class="form-group">
            <label class="form-label" for="vAcceleration">0-100 km/h</label>
            <input type="text" id="vAcceleration" name="acceleration" class="form-input" value="${escapeHtml(v.acceleration || '')}" placeholder="z.B. 8.5s">
          </div>
        </div>

        <h3 class="form-section-title">Bilder</h3>
        <div id="imageUploadArea" class="image-upload-area">
          <div class="image-upload-zone" id="dropZone">
            <p>📷 Bilder hierher ziehen oder <label for="fileInput" class="upload-link">Dateien auswählen</label></p>
            <input type="file" id="fileInput" multiple accept="image/jpeg,image/png,image/webp" style="display:none;">
            <p class="text-muted" style="font-size:0.8rem;">Max. 5 MB pro Bild · JPEG, PNG, WebP</p>
          </div>
          <div class="image-preview-grid" id="imagePreviewGrid"></div>
        </div>

        <h3 class="form-section-title">Beschreibung</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label" for="vDescDe">Beschreibung (Deutsch)</label>
            <textarea id="vDescDe" name="description_de" class="form-input" rows="4" placeholder="Deutsche Beschreibung...">${escapeHtml(v.description_de || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="vDescEn">Beschreibung (English)</label>
            <textarea id="vDescEn" name="description_en" class="form-input" rows="4" placeholder="English description...">${escapeHtml(v.description_en || '')}</textarea>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <a href="#/vehicles" class="btn btn-outline">Abbrechen</a>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Speichern' : 'Fahrzeug anlegen'}</button>
      </div>
    </form>
  `;

  // --- Image Upload ---
  const dropZone = container.querySelector('#dropZone');
  const fileInput = container.querySelector('#fileInput');
  const previewGrid = container.querySelector('#imagePreviewGrid');
  let uploadedImages = [];

  // Load existing images for edit mode
  if (isEdit) {
    try {
      const existingImages = await api.fetchAll('vehicle_images', { filters: { vehicle_id: vehicleId }, orderBy: 'position' });
      uploadedImages = existingImages.map(img => ({ id: img.id, url: img.url, storage_path: img.storage_path, existing: true }));
      renderImagePreviews();
    } catch (e) { /* no images yet */ }
  }

  function renderImagePreviews() {
    previewGrid.innerHTML = uploadedImages.map((img, i) => `
      <div class="image-preview-item" data-index="${i}">
        <img src="${img.url}" alt="Bild ${i + 1}">
        <button type="button" class="image-preview-remove" data-index="${i}">&times;</button>
        ${i === 0 ? '<span class="image-preview-primary">Hauptbild</span>' : ''}
      </div>
    `).join('');

    previewGrid.querySelectorAll('.image-preview-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.index);
        const img = uploadedImages[idx];
        if (img.existing && img.id) {
          try {
            if (img.storage_path) await supabaseClient.storage.from('vehicle-images').remove([img.storage_path]);
            await api.remove('vehicle_images', img.id);
          } catch (e) { /* continue */ }
        } else if (img.storage_path) {
          await supabaseClient.storage.from('vehicle-images').remove([img.storage_path]);
        }
        uploadedImages.splice(idx, 1);
        renderImagePreviews();
      });
    });
  }

  async function handleFiles(files) {
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} ist zu groß (max 5 MB)`); continue; }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error(`${file.name}: Format nicht unterstützt`); continue; }

      const path = `vehicles/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      try {
        const { error } = await supabaseClient.storage.from('vehicle-images').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabaseClient.storage.from('vehicle-images').getPublicUrl(path);
        uploadedImages.push({ url: publicUrl, storage_path: path, existing: false });
        renderImagePreviews();
        toast.success(`${file.name} hochgeladen`);
      } catch (err) { toast.error(`Upload fehlgeschlagen: ${err.message}`); }
    }
  }

  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
  fileInput.addEventListener('change', () => { handleFiles(fileInput.files); fileInput.value = ''; });
  dropZone.querySelector('.upload-link').addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });

  // Auto-generate name from brand + model
  const brandInput = container.querySelector('#vBrand');
  const modelInput = container.querySelector('#vModel');
  const nameInput = container.querySelector('#vName');

  function autoName() {
    const brand = brandInput.value.trim();
    const mdl = modelInput.value.trim();
    if (brand && mdl && !isEdit) {
      nameInput.value = brand + ' ' + mdl;
    }
  }
  brandInput.addEventListener('input', autoName);
  modelInput.addEventListener('input', autoName);

  // Margin calculation
  const priceInput = container.querySelector('#vPrice');
  const purchasePriceInput = container.querySelector('#vPurchasePrice');
  const marginValue = container.querySelector('#marginValue');

  function updateMargin() {
    const sell = parseInt(priceInput?.value) || 0;
    const buy = parseInt(purchasePriceInput?.value) || 0;
    if (sell && buy) {
      const margin = sell - buy;
      const pct = ((margin / buy) * 100).toFixed(0);
      marginValue.textContent = `${formatPrice(margin)} (${pct}%)`;
      marginValue.style.color = margin >= 0 ? 'var(--green)' : 'var(--red)';
    } else {
      marginValue.textContent = '—';
      marginValue.style.color = '';
    }
  }
  priceInput?.addEventListener('input', updateMargin);
  purchasePriceInput?.addEventListener('input', updateMargin);
  updateMargin();

  // Submit
  container.querySelector('#vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      brand: form.brand.value.trim(),
      model: form.model.value.trim(),
      name: form.name.value.trim(),
      year: parseInt(form.year.value),
      price: parseInt(form.price.value),
      mileage: parseInt(form.mileage.value),
      category: form.category.value,
      fuel: form.fuel.value,
      status: form.status.value,
      badge: form.badge.value.trim() || null,
      hp: form.hp.value ? parseInt(form.hp.value) : null,
      engine: form.engine.value.trim() || null,
      transmission: form.transmission.value.trim() || null,
      drivetrain: form.drivetrain.value || null,
      top_speed: form.top_speed.value.trim() || null,
      acceleration: form.acceleration.value.trim() || null,
      description_de: form.description_de.value.trim() || null,
      description_en: form.description_en.value.trim() || null,
      purchase_price: form.purchase_price.value ? parseInt(form.purchase_price.value) : 0
    };

    const missing = validateRequired(data, ['brand', 'model', 'name', 'year', 'price', 'mileage', 'category', 'fuel']);
    if (missing.length > 0) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    try {
      let savedId;
      if (isEdit) {
        await api.update('vehicles', vehicleId, data);
        savedId = vehicleId;
        await api.logActivity('vehicle_updated', 'vehicle', vehicleId, `Fahrzeug aktualisiert: ${data.name}`);
        toast.success('Fahrzeug gespeichert');
      } else {
        const created = await api.insert('vehicles', data);
        savedId = created.id;
        await api.logActivity('vehicle_created', 'vehicle', created.id, `Neues Fahrzeug: ${data.name}`);
        toast.success('Fahrzeug angelegt');
      }

      // Save new uploaded images to vehicle_images table
      const newImages = uploadedImages.filter(img => !img.existing);
      for (let i = 0; i < newImages.length; i++) {
        await api.insert('vehicle_images', {
          vehicle_id: savedId,
          url: newImages[i].url,
          storage_path: newImages[i].storage_path,
          position: uploadedImages.indexOf(newImages[i]),
          is_primary: uploadedImages.indexOf(newImages[i]) === 0
        });
      }

      router.navigate('/vehicles');
    } catch (err) {
      toast.error('Fehler: ' + err.message);
    }
  });
}
