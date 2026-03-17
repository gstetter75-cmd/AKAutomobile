/* ==========================================================================
   AK Automobile Dashboard — Portal Integration Module
   Exports for mobile.de, AutoScout24, eBay Kleinanzeigen, OpenImmo
   ========================================================================== */

// ---------------------------------------------------------------------------
// Helper: trigger file download in the browser
// ---------------------------------------------------------------------------
function portalDownloadFile(content, filename, mimeType) {
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

function psToKw(ps) {
  if (!ps) return 0;
  return Math.round(ps * 0.7355);
}

function xmlEscape(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function portalCsvSafe(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ---------------------------------------------------------------------------
// Fuel type mappings for portals
// ---------------------------------------------------------------------------
const fuelMapMobileDe = {
  'Benzin': 'PETROL',
  'Diesel': 'DIESEL',
  'Hybrid': 'HYBRID',
  'Elektro': 'ELECTRIC',
  'Autogas': 'LPG'
};

const gearboxMapMobileDe = {
  'Automatik': 'AUTOMATIC',
  'Schaltgetriebe': 'MANUAL',
  'DSG': 'AUTOMATIC',
  '7-Gang DSG': 'AUTOMATIC',
  '6-Gang DSG': 'AUTOMATIC',
  '8-Gang Automatik': 'AUTOMATIC'
};

function mapGearbox(transmission) {
  if (!transmission) return 'MANUAL';
  const lower = transmission.toLowerCase();
  if (lower.includes('automat') || lower.includes('dsg') || lower.includes('tiptronic') || lower.includes('dct')) {
    return 'AUTOMATIC';
  }
  return 'MANUAL';
}

// ---------------------------------------------------------------------------
// 1. mobile.de XML export
// ---------------------------------------------------------------------------
async function exportMobileDeXML() {
  try {
    const vehicles = await api.fetchAll('vehicles', {
      filters: { status: 'available' },
      limit: 9999
    });

    const ads = vehicles.map(v => {
      const fuelType = fuelMapMobileDe[v.fuel] || 'PETROL';
      const gearbox = mapGearbox(v.transmission);
      const kw = psToKw(v.hp);

      return `
    <ad:ad>
      <ad:vehicle>
        <ad:make>${xmlEscape(v.brand)}</ad:make>
        <ad:model>${xmlEscape(v.model)}</ad:model>
        <ad:price>${v.price}</ad:price>
        <ad:mileage>${v.mileage}</ad:mileage>
        <ad:first-registration>${v.year}</ad:first-registration>
        <ad:fuel-type>${fuelType}</ad:fuel-type>
        <ad:power>${kw}</ad:power>
        <ad:gearbox>${gearbox}</ad:gearbox>
        <ad:description>${xmlEscape(v.description_de || '')}</ad:description>
      </ad:vehicle>
    </ad:ad>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ad:ads xmlns:ad="http://services.mobile.de/schema/ad">
${ads}
</ad:ads>`;

    portalDownloadFile(xml, 'mobile_de_export.xml', 'application/xml;charset=utf-8');
    toast.success(`${vehicles.length} Fahrzeuge als mobile.de XML exportiert`);
  } catch (err) {
    toast.error('mobile.de Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// 2. AutoScout24 CSV export
// ---------------------------------------------------------------------------
async function exportAutoScout24CSV() {
  try {
    const vehicles = await api.fetchAll('vehicles', {
      filters: { status: 'available' },
      limit: 9999
    });

    const headers = [
      'Marke', 'Modell', 'Preis', 'Erstzulassung', 'Kilometer',
      'Kraftstoff', 'Leistung (kW)', 'Getriebe', 'Farbe', 'Beschreibung'
    ];

    const rows = vehicles.map(v => [
      portalCsvSafe(v.brand),
      portalCsvSafe(v.model),
      portalCsvSafe(v.price),
      portalCsvSafe(v.year),
      portalCsvSafe(v.mileage),
      portalCsvSafe(v.fuel),
      portalCsvSafe(psToKw(v.hp)),
      portalCsvSafe(v.transmission || ''),
      portalCsvSafe(''),
      portalCsvSafe(v.description_de || '')
    ].join(';'));

    const BOM = '\uFEFF';
    const csv = BOM + headers.join(';') + '\n' + rows.join('\n');

    portalDownloadFile(csv, `autoscout24_export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
    toast.success(`${vehicles.length} Fahrzeuge als AutoScout24 CSV exportiert`);
  } catch (err) {
    toast.error('AutoScout24 Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// 3. eBay Kleinanzeigen text templates
// ---------------------------------------------------------------------------
async function exportEbayTexts() {
  try {
    const vehicles = await api.fetchAll('vehicles', {
      filters: { status: 'available' },
      limit: 9999
    });

    const blocks = vehicles.map(v => {
      const priceStr = new Intl.NumberFormat('de-DE').format(v.price);
      const mileageStr = new Intl.NumberFormat('de-DE').format(v.mileage);
      const description = v.description_de || '';

      return [
        `${v.name || v.brand + ' ' + v.model} \u2014 ${priceStr} \u20AC`,
        '',
        `\u2705 ${v.year} | ${mileageStr} km | ${v.fuel || ''} | ${v.hp || ''} PS`,
        '',
        description,
        '',
        `\uD83D\uDCCD AK Automobile \u2014 Salzhemmendorf`,
        `\uD83D\uDCDE +49 5153 123456`
      ].join('\n');
    });

    const text = blocks.join('\n\n---\n\n');

    portalDownloadFile(text, `ebay_kleinanzeigen_texte_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain;charset=utf-8');
    toast.success(`${vehicles.length} Textvorlagen exportiert`);
  } catch (err) {
    toast.error('eBay Kleinanzeigen Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// 4. OpenImmo XML export (simplified schema)
// ---------------------------------------------------------------------------
async function exportOpenImmoXML() {
  try {
    const vehicles = await api.fetchAll('vehicles', {
      filters: { status: 'available' },
      limit: 9999
    });

    const objects = vehicles.map(v => `
    <immobilie>
      <objektkategorie>
        <nutzungsart KFZ="true"/>
        <objektart><kfz/></objektart>
      </objektkategorie>
      <geo/>
      <kontaktperson/>
      <verwaltung_techn>
        <objektnr_intern>${xmlEscape(v.id)}</objektnr_intern>
      </verwaltung_techn>
      <anbieter>
        <openimmo_anid>AK-AUTO</openimmo_anid>
      </anbieter>
      <freitexte>
        <objekttitel>${xmlEscape(v.name || v.brand + ' ' + v.model)}</objekttitel>
        <objektbeschreibung>${xmlEscape(v.description_de || '')}</objektbeschreibung>
      </freitexte>
      <zustand_angaben>
        <baujahr>${v.year}</baujahr>
        <zustand zustand_art="GEBRAUCHT"/>
      </zustand_angaben>
      <ausstattung>
        <kfz_marke>${xmlEscape(v.brand)}</kfz_marke>
        <kfz_modell>${xmlEscape(v.model)}</kfz_modell>
        <kfz_kraftstoff>${xmlEscape(v.fuel || '')}</kfz_kraftstoff>
        <kfz_kilometerstand>${v.mileage}</kfz_kilometerstand>
      </ausstattung>
      <preise>
        <kaufpreis>${v.price}</kaufpreis>
      </preise>
    </immobilie>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<openimmo>
  <uebertragung art="ONLINE" umfang="VOLL" modus="NEW" version="1.2.7"/>
  <anbieter>
    <openimmo_anid>AK-AUTO</openimmo_anid>
    <firma>AK Automobile</firma>
${objects}
  </anbieter>
</openimmo>`;

    portalDownloadFile(xml, `openimmo_export_${new Date().toISOString().slice(0, 10)}.xml`, 'application/xml;charset=utf-8');
    toast.success(`${vehicles.length} Fahrzeuge als OpenImmo XML exportiert`);
  } catch (err) {
    toast.error('OpenImmo Export fehlgeschlagen: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// Portals overview page
// ---------------------------------------------------------------------------
async function renderPortalsPage(container) {
  let vehicleCount = 0;
  try {
    vehicleCount = await api.count('vehicles', { status: 'available' });
  } catch (err) {
    // non-critical
  }

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Portal-Integration</h1>
        <p class="page-subtitle">Fahrzeuge auf externen Plattformen inserieren (${vehicleCount} verfügbare Fahrzeuge)</p>
      </div>
    </div>

    <!-- mobile.de -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div style="flex: 1; min-width: 300px;">
            <h3 class="form-section-title" style="margin-top: 0;">mobile.de</h3>
            <p class="text-muted">
              Deutschlands grösster Fahrzeugmarkt. Der XML-Export kann im
              Händlerbereich unter "Daten-Import" hochgeladen werden.
            </p>
            <p style="margin-top: 0.5rem;">
              <span class="badge badge-orange">Händlerkonto erforderlich</span>
            </p>
            <p style="margin-top: 0.5rem;">
              <a href="https://www.mobile.de/haendler/" target="_blank" rel="noopener">
                Händler-Registrierung &rarr;
              </a>
            </p>
          </div>
          <div>
            <button class="btn btn-primary" id="btnMobileDe">
              XML-Export herunterladen
            </button>
          </div>
        </div>
        <div class="text-muted" style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-secondary, #f5f5f5); border-radius: 6px; font-size: 0.9rem;">
          Laden Sie diese Datei im mobile.de Händlerbereich unter "Daten-Import" hoch.
        </div>
      </div>
    </div>

    <!-- AutoScout24 -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div style="flex: 1; min-width: 300px;">
            <h3 class="form-section-title" style="margin-top: 0;">AutoScout24</h3>
            <p class="text-muted">
              Europas grosser Automarkt. AutoScout24 akzeptiert CSV-Uploads
              im Händlerbereich zur Bulk-Inserierung.
            </p>
            <p style="margin-top: 0.5rem;">
              <span class="badge badge-orange">Händlerkonto erforderlich</span>
            </p>
            <p style="margin-top: 0.5rem;">
              <a href="https://www.autoscout24.de/haendler/" target="_blank" rel="noopener">
                Händler-Registrierung &rarr;
              </a>
            </p>
          </div>
          <div>
            <button class="btn btn-primary" id="btnAutoScout24">
              CSV-Export herunterladen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- eBay Kleinanzeigen -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div style="flex: 1; min-width: 300px;">
            <h3 class="form-section-title" style="margin-top: 0;">eBay Kleinanzeigen</h3>
            <p class="text-muted">
              Generiert fertige Textvorlagen, die per Copy & Paste in
              eBay Kleinanzeigen-Inserate eingefügt werden können.
              Kein Händlerkonto erforderlich.
            </p>
            <p style="margin-top: 0.5rem;">
              <span class="badge badge-green">Kostenlos nutzbar</span>
            </p>
            <p style="margin-top: 0.5rem;">
              <a href="https://www.kleinanzeigen.de/" target="_blank" rel="noopener">
                Zu Kleinanzeigen &rarr;
              </a>
            </p>
          </div>
          <div>
            <button class="btn btn-primary" id="btnEbay">
              Textvorlagen herunterladen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- OpenImmo -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div style="flex: 1; min-width: 300px;">
            <h3 class="form-section-title" style="margin-top: 0;">OpenImmo XML</h3>
            <p class="text-muted">
              Branchenstandard-Format für den Datenaustausch. Kann in viele
              Portale und Verwaltungssysteme importiert werden.
            </p>
            <p style="margin-top: 0.5rem;">
              <span class="badge badge-blue">Standard-Format</span>
            </p>
            <p style="margin-top: 0.5rem;">
              <a href="https://www.openimmo.de/" target="_blank" rel="noopener">
                OpenImmo-Standard &rarr;
              </a>
            </p>
          </div>
          <div>
            <button class="btn btn-primary" id="btnOpenImmo">
              OpenImmo XML herunterladen
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  container.querySelector('#btnMobileDe').addEventListener('click', exportMobileDeXML);
  container.querySelector('#btnAutoScout24').addEventListener('click', exportAutoScout24CSV);
  container.querySelector('#btnEbay').addEventListener('click', exportEbayTexts);
  container.querySelector('#btnOpenImmo').addEventListener('click', exportOpenImmoXML);
}
