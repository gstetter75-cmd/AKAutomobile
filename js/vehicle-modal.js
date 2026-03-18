/* ==========================================================================
   AK Automobile — Vehicle Detail Modal
   Gallery, specs, description, focus trap, keyboard navigation
   ========================================================================== */

function initVehicleModal() {
  const modal = document.getElementById('vehicleModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const overlay = modal ? modal.querySelector('.modal-overlay') : null;

  if (!modal || !modalBody) return;

  let previousFocus = null;
  let currentGalleryIndex = 0;
  let currentVehicle = null;

  // Register click handlers on all vehicle cards
  document.querySelectorAll('[data-vehicle-id]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const id = card.getAttribute('data-vehicle-id');
      openModal(id);
    });
  });

  function openModal(vehicleId) {
    const vehicle = getVehicleById(vehicleId);
    if (!vehicle) return;

    currentVehicle = vehicle;
    currentGalleryIndex = 0;
    previousFocus = document.activeElement;

    renderModal(vehicle);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      modalClose.focus();
    });

    const liveRegion = document.getElementById('ariaLive');
    if (liveRegion) {
      const lang = document.documentElement.getAttribute('lang') || 'de';
      liveRegion.textContent = lang === 'de'
        ? `Fahrzeugdetails geöffnet: ${vehicle.name}`
        : `Vehicle details opened: ${vehicle.name}`;
    }
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }

    currentVehicle = null;
  }

  function renderModal(vehicle) {
    const lang = document.documentElement.getAttribute('lang') || 'de';
    const desc = vehicle.description[lang] || vehicle.description.de;
    const contactText = lang === 'de' ? 'Jetzt anfragen' : 'Inquire Now';
    const specsTitle = lang === 'de' ? 'Fahrzeugdaten' : 'Specifications';

    const specRows = [
      [lang === 'de' ? 'Leistung' : 'Power', `${vehicle.specs.hp} PS`],
      [lang === 'de' ? 'Höchstgeschwindigkeit' : 'Top Speed', vehicle.specs.topSpeed],
      ['0-100 km/h', vehicle.specs.acceleration],
      [lang === 'de' ? 'Motor' : 'Engine', vehicle.specs.engine],
      [lang === 'de' ? 'Antrieb' : 'Drivetrain', vehicle.specs.drivetrain],
      [lang === 'de' ? 'Kraftstoff' : 'Fuel', vehicle.specs.fuel],
      [lang === 'de' ? 'Getriebe' : 'Transmission', vehicle.specs.transmission]
    ];

    modalBody.innerHTML = `
      <div class="modal-layout">
        <div class="modal-gallery">
          <div class="modal-gallery-main">
            <img src="${vehicle.images[0]}" alt="${vehicle.name}" class="modal-main-img" id="modalMainImg">
          </div>
          ${vehicle.images.length > 1 ? `
          <div class="modal-gallery-thumbs">
            ${vehicle.images.map((img, i) => `
              <button class="modal-thumb${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Bild ${i + 1}">
                <img src="${img.replace('w=800', 'w=200').replace('w=400', 'w=200')}" alt="${vehicle.name} Ansicht ${i + 1}">
              </button>
            `).join('')}
          </div>
          ` : ''}
        </div>
        <div class="modal-details">
          <div class="modal-header">
            <span class="modal-brand">${vehicle.brand}</span>
            <h2 class="modal-vehicle-name">${vehicle.model}</h2>
            <div class="modal-meta">
              <span class="modal-year">${vehicle.year}</span>
              <span class="modal-mileage">${vehicle.mileage}</span>
            </div>
          </div>
          <div class="modal-price-tag">${formatPrice(vehicle.price)}</div>
          <p class="modal-description">${desc}</p>
          <div class="modal-specs">
            <h3 class="modal-specs-title">${specsTitle}</h3>
            <div class="modal-specs-grid">
              ${specRows.map(([label, value]) => `
                <div class="modal-spec-row">
                  <span class="modal-spec-label">${label}</span>
                  <span class="modal-spec-value">${value}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-finance" style="background:var(--gray-50);padding:12px 16px;border-radius:8px;margin-top:16px;">
            <div style="font-size:0.85rem;font-weight:600;color:var(--gray-700);margin-bottom:8px;">
              ${lang === 'de' ? '💳 Finanzierungsrechner' : '💳 Finance Calculator'}
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <label style="font-size:0.82rem;color:var(--gray-600);">${lang === 'de' ? 'Laufzeit:' : 'Term:'}</label>
              <select id="financeMonths" style="padding:6px 10px;border:1px solid var(--gray-300);border-radius:6px;font-size:0.85rem;">
                <option value="24">24 ${lang === 'de' ? 'Monate' : 'months'}</option>
                <option value="36">36 ${lang === 'de' ? 'Monate' : 'months'}</option>
                <option value="48" selected>48 ${lang === 'de' ? 'Monate' : 'months'}</option>
                <option value="60">60 ${lang === 'de' ? 'Monate' : 'months'}</option>
                <option value="72">72 ${lang === 'de' ? 'Monate' : 'months'}</option>
              </select>
              <span style="font-size:1.1rem;font-weight:800;color:var(--primary);" id="monthlyRate"></span>
              <span style="font-size:0.78rem;color:var(--gray-500);">${lang === 'de' ? '/ Monat*' : '/ month*'}</span>
            </div>
            <div style="font-size:0.72rem;color:var(--gray-400);margin-top:4px;">
              *${lang === 'de' ? 'Beispielrechnung bei 4,99% eff. Jahreszins. Keine verbindliche Zusage.' : 'Example at 4.99% APR. Not a binding offer.'}
            </div>
          </div>
          <div class="modal-footer">
            <a href="#contact" class="btn btn-primary modal-cta" id="modalContactBtn">${contactText}</a>
          </div>
        </div>
      </div>
    `;

    // Finance calculator
    function calcMonthlyRate() {
      const months = parseInt(document.getElementById('financeMonths')?.value || 48);
      const rate = 0.0499;
      const monthlyRate = rate / 12;
      const price = vehicle.price;
      const monthly = (price * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const rateEl = document.getElementById('monthlyRate');
      if (rateEl) rateEl.textContent = `ab ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(monthly)}`;
    }
    calcMonthlyRate();
    document.getElementById('financeMonths')?.addEventListener('change', calcMonthlyRate);

    // Gallery thumbnail click handlers
    modalBody.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index, 10);
        setGalleryImage(index);
      });
    });

    // Contact button: close modal and scroll to form
    const contactBtn = document.getElementById('modalContactBtn');
    if (contactBtn) {
      contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();

        const vehicleSelect = document.getElementById('vehicle');
        if (vehicleSelect) {
          const option = Array.from(vehicleSelect.options).find(
            o => o.value === vehicle.id || o.text.includes(vehicle.model)
          );
          if (option) vehicleSelect.value = option.value;
        }

        const contact = document.getElementById('contact');
        if (contact) {
          setTimeout(() => {
            contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      });
    }
  }

  function setGalleryImage(index) {
    if (!currentVehicle) return;
    currentGalleryIndex = index;

    const mainImg = document.getElementById('modalMainImg');
    if (mainImg) {
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = currentVehicle.images[index];
        mainImg.style.opacity = '1';
      }, 200);
    }

    modalBody.querySelectorAll('.modal-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  // Close handlers
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (currentVehicle && currentVehicle.images.length > 1) {
      if (e.key === 'ArrowLeft') {
        setGalleryImage((currentGalleryIndex - 1 + currentVehicle.images.length) % currentVehicle.images.length);
      } else if (e.key === 'ArrowRight') {
        setGalleryImage((currentGalleryIndex + 1) % currentVehicle.images.length);
      }
    }

    // Focus trap
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
}
