/* ==========================================================================
   AK Automobile Dashboard — Utility Functions
   ========================================================================== */

function formatPrice(price) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(price);
}

function formatMileage(km) {
  return new Intl.NumberFormat('de-DE').format(km) + ' km';
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function validateEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function validateRequired(formData, fields) {
  const missing = fields.filter(f => !formData[f] || formData[f].toString().trim() === '');
  return missing;
}

function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function statusBadge(status, map) {
  const config = map[status] || { label: status, color: 'gray' };
  return `<span class="badge badge-${config.color}">${config.label}</span>`;
}

const vehicleStatusMap = {
  available: { label: 'Verfügbar', color: 'green' },
  reserved: { label: 'Reserviert', color: 'orange' },
  sold: { label: 'Verkauft', color: 'red' }
};

const customerStatusMap = {
  lead: { label: 'Interessent', color: 'blue' },
  active: { label: 'Aktiv', color: 'green' },
  closed: { label: 'Abgeschlossen', color: 'gray' }
};

const inquiryStatusMap = {
  new: { label: 'Neu', color: 'orange' },
  contacted: { label: 'Kontaktiert', color: 'blue' },
  closed: { label: 'Erledigt', color: 'gray' }
};

const appointmentTypeMap = {
  test_drive: { label: 'Probefahrt', icon: '🚗' },
  viewing: { label: 'Besichtigung', icon: '👁' },
  workshop: { label: 'Werkstatt', icon: '🔧' },
  other: { label: 'Sonstiges', icon: '📌' }
};

const categoryMap = {
  kleinwagen: 'Kleinwagen',
  kompakt: 'Kompakt',
  mittelklasse: 'Mittelklasse',
  kombi: 'Kombi',
  suv: 'SUV'
};
