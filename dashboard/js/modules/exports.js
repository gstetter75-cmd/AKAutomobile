/* ==========================================================================
   AK Automobile Dashboard — Export Module
   CSV & PDF exports for vehicles and customers
   ========================================================================== */

// ---------------------------------------------------------------------------
// Helper: trigger file download in the browser
// ---------------------------------------------------------------------------
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function csvSafe(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ---------------------------------------------------------------------------
// 1. CSV export of all vehicles
// ---------------------------------------------------------------------------
async function exportVehiclesCSV() {
  try {
    const vehicles = await api.fetchAll('vehicles', {
      filters: { status: 'available' },
      limit: 9999
    });

    const headers = [
      'Marke', 'Modell', 'Name', 'Baujahr', 'Preis', 'Km-Stand',
      'Kategorie', 'Kraftstoff', 'PS', 'Getriebe', 'Antrieb',
      'Motor', 'Status', 'Beschreibung (DE)'
    ];

    const rows = vehicles.map(v => [
      csvSafe(v.brand),
      csvSafe(v.model),
      csvSafe(v.name),
      csvSafe(v.year),
      csvSafe(v.price),
      csvSafe(v.mileage),
      csvSafe(categoryMap[v.category] || v.category),
      csvSafe(v.fuel),
      csvSafe(v.hp),
      csvSafe(v.transmission),
      csvSafe(v.drivetrain),
      csvSafe(v.engine),
      csvSafe(vehicleStatusMap[v.status]?.label || v.status),
      csvSafe(v.description_de)
    ].join(';'));

    const BOM = '\uFEFF';
    const csv = BOM + headers.join(';') + '\n' + rows.join('\n');
    const filename = `AK_Fahrzeuge_${todayISO()}.csv`;

    downloadFile(csv, filename, 'text/csv;charset=utf-8');
    toast.success(`${vehicles.length} Fahrzeuge exportiert`);
  } catch (err) {
    toast.error('CSV-Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// 2. PDF inventory list (landscape A4)
// ---------------------------------------------------------------------------
async function exportVehiclesPDF() {
  try {
    const [vehicles, settingsArr] = await Promise.all([
      api.fetchAll('vehicles', { filters: { status: 'available' }, limit: 9999 }),
      api.fetchAll('settings', { limit: 1 })
    ]);

    const settings = settingsArr[0] || {};
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(18);
    doc.text('AK Automobile \u2014 Fahrzeugbestand', 14, 20);
    doc.setFontSize(10);
    doc.text(`Stand: ${new Date().toLocaleDateString('de-DE')}`, 14, 27);

    if (settings.company_name) {
      doc.text(`${settings.company_name} | ${settings.address || ''} | ${settings.phone || ''}`, 14, 33);
    }

    // Table
    const tableData = vehicles.map(v => [
      `${v.brand} ${v.model}`,
      String(v.year),
      formatMileage(v.mileage),
      formatPrice(v.price),
      v.fuel || '',
      vehicleStatusMap[v.status]?.label || v.status
    ]);

    doc.autoTable({
      startY: settings.company_name ? 38 : 32,
      head: [['Marke / Modell', 'Baujahr', 'Km-Stand', 'Preis', 'Kraftstoff', 'Status']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 50, 65], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Seite ${i} von ${pageCount}`, 280, 200, { align: 'right' });
    }

    doc.save(`AK_Bestandsliste_${todayISO()}.pdf`);
    toast.success('Bestandsliste als PDF exportiert');
  } catch (err) {
    toast.error('PDF-Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// 3. Single vehicle expose (portrait A4)
// ---------------------------------------------------------------------------
async function exportVehicleExpose(vehicleId) {
  try {
    const [vehicle, settingsArr] = await Promise.all([
      api.fetchById('vehicles', vehicleId),
      api.fetchAll('settings', { limit: 1 })
    ]);

    const settings = settingsArr[0] || {};
    const v = vehicle;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Company header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('AK Automobile', 14, 20);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const contactParts = [settings.address, settings.phone, settings.email].filter(Boolean);
    if (contactParts.length > 0) {
      doc.text(contactParts.join(' | '), 14, 27);
    }

    // Divider line
    doc.setDrawColor(200);
    doc.line(14, 31, 196, 31);

    // Vehicle name
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(v.name || `${v.brand} ${v.model}`, 14, 42);

    // Specs table
    const specs = [
      ['Marke', v.brand],
      ['Modell', v.model],
      ['Baujahr', String(v.year)],
      ['Km-Stand', formatMileage(v.mileage)],
      ['Kategorie', categoryMap[v.category] || v.category || ''],
      ['Kraftstoff', v.fuel || ''],
      ['Leistung', v.hp ? `${v.hp} PS (${Math.round(v.hp * 0.7355)} kW)` : ''],
      ['Getriebe', v.transmission || ''],
      ['Antrieb', v.drivetrain || ''],
      ['Motor', v.engine || ''],
      ['Status', vehicleStatusMap[v.status]?.label || v.status]
    ].filter(([, val]) => val !== '' && val !== null);

    doc.autoTable({
      startY: 48,
      body: specs,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 120 }
      },
      margin: { left: 14, right: 14 }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // Price
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text(formatPrice(v.price), 14, currentY);
    currentY += 12;

    // Description
    if (v.description_de) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(v.description_de, 180);
      doc.text(lines, 14, currentY);
      currentY += lines.length * 5 + 10;
    }

    // Footer with contact
    doc.setDrawColor(200);
    doc.line(14, 270, 196, 270);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const footerParts = [
      settings.company_name || 'AK Automobile',
      settings.address,
      settings.phone,
      settings.email
    ].filter(Boolean);

    doc.text(footerParts.join(' | '), 14, 277);

    const safeName = (v.name || `${v.brand}_${v.model}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`AK_Expose_${safeName}.pdf`);
    toast.success('Expose als PDF exportiert');
  } catch (err) {
    toast.error('Expose-Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// 4. Customers CSV export
// ---------------------------------------------------------------------------
async function exportCustomersCSV() {
  try {
    const customers = await api.fetchAll('customers', { limit: 9999 });

    const headers = [
      'Vorname', 'Nachname', 'E-Mail', 'Telefon',
      'Strasse', 'PLZ', 'Ort', 'Status', 'Quelle', 'Erstellt'
    ];

    const rows = customers.map(c => [
      csvSafe(c.first_name),
      csvSafe(c.last_name),
      csvSafe(c.email),
      csvSafe(c.phone),
      csvSafe(c.address_street),
      csvSafe(c.address_zip),
      csvSafe(c.address_city),
      csvSafe(customerStatusMap[c.status]?.label || c.status),
      csvSafe(c.source),
      csvSafe(formatDate(c.created_at))
    ].join(';'));

    const BOM = '\uFEFF';
    const csv = BOM + headers.join(';') + '\n' + rows.join('\n');
    const filename = `AK_Kunden_${todayISO()}.csv`;

    downloadFile(csv, filename, 'text/csv;charset=utf-8');
    toast.success(`${customers.length} Kunden exportiert`);
  } catch (err) {
    toast.error('Kunden-Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// Exports overview page
// ---------------------------------------------------------------------------
async function renderExportsPage(container) {
  let vehicleCount = 0;
  let customerCount = 0;

  try {
    vehicleCount = await api.count('vehicles', { status: 'available' });
    customerCount = await api.count('customers');
  } catch (err) {
    // counts are non-critical, continue with 0
  }

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Exporte</h1>
        <p class="page-subtitle">Fahrzeuge und Kunden exportieren</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h3 class="form-section-title">Fahrzeug-Exporte</h3>
        <p class="text-muted" style="margin-bottom: 1rem;">
          Exportiert alle verfügbaren Fahrzeuge (${vehicleCount} Stück).
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
          <button class="btn btn-primary" id="btnExportVehiclesCSV">
            CSV-Export (Excel)
          </button>
          <button class="btn btn-primary" id="btnExportVehiclesPDF">
            PDF-Bestandsliste
          </button>
        </div>

        <h3 class="form-section-title">Kunden-Export</h3>
        <p class="text-muted" style="margin-bottom: 1rem;">
          Exportiert alle Kunden (${customerCount} Stück).
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
          <button class="btn btn-primary" id="btnExportCustomersCSV">
            Kunden als CSV
          </button>
        </div>

        <h3 class="form-section-title">Einzelfahrzeug-Expose</h3>
        <p class="text-muted" style="margin-bottom: 1rem;">
          Ein PDF-Expose für ein einzelnes Fahrzeug können Sie direkt aus der
          Fahrzeugliste heraus erstellen (Aktionen-Spalte) oder die Fahrzeug-ID
          unten eingeben.
        </p>
        <div style="display: flex; gap: 0.5rem; align-items: flex-end; flex-wrap: wrap;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="exposeVehicleId">Fahrzeug-ID</label>
            <input type="text" id="exposeVehicleId" class="form-input" placeholder="UUID eingeben" style="width: 320px;">
          </div>
          <button class="btn btn-outline" id="btnExportExpose">
            Expose erstellen
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  container.querySelector('#btnExportVehiclesCSV').addEventListener('click', exportVehiclesCSV);
  container.querySelector('#btnExportVehiclesPDF').addEventListener('click', exportVehiclesPDF);
  container.querySelector('#btnExportCustomersCSV').addEventListener('click', exportCustomersCSV);

  container.querySelector('#btnExportExpose').addEventListener('click', () => {
    const vehicleId = container.querySelector('#exposeVehicleId').value.trim();
    if (!vehicleId) {
      toast.error('Bitte eine Fahrzeug-ID eingeben');
      return;
    }
    exportVehicleExpose(vehicleId);
  });
}
