/* ==========================================================================
   Settings Module — Company Data
   ========================================================================== */

async function renderSettings(container) {
  const settings = await api.fetchAll('settings', { limit: 1 });
  const s = settings[0] || {};

  container.innerHTML = `
    <div class="page-header">
      <h1>Einstellungen</h1>
    </div>

    <form id="settingsForm" class="card">
      <div class="card-body">
        <h3 class="form-section-title">Firmendaten</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Firmenname</label>
            <input type="text" name="company_name" class="form-input" value="${escapeHtml(s.company_name || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Adresse</label>
            <input type="text" name="address" class="form-input" value="${escapeHtml(s.address || '')}">
          </div>
        </div>
        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Telefon</label>
            <input type="text" name="phone" class="form-input" value="${escapeHtml(s.phone || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">E-Mail</label>
            <input type="email" name="email" class="form-input" value="${escapeHtml(s.email || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">USt-IdNr.</label>
            <input type="text" name="tax_id" class="form-input" value="${escapeHtml(s.tax_id || '')}" placeholder="DE...">
          </div>
        </div>

        <h3 class="form-section-title">Bankverbindung</h3>
        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Bank</label>
            <input type="text" name="bank_name" class="form-input" value="${escapeHtml(s.bank_name || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">IBAN</label>
            <input type="text" name="bank_iban" class="form-input" value="${escapeHtml(s.bank_iban || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">BIC</label>
            <input type="text" name="bank_bic" class="form-input" value="${escapeHtml(s.bank_bic || '')}">
          </div>
        </div>

        <h3 class="form-section-title">Rechnungen</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Rechnungs-Präfix</label>
            <input type="text" name="invoice_prefix" class="form-input" value="${escapeHtml(s.invoice_prefix || 'AK')}">
          </div>
          <div class="form-group">
            <label class="form-label">Nächste Rechnungsnr.</label>
            <input type="number" name="invoice_counter" class="form-input" value="${s.invoice_counter || 1}" min="1">
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button type="submit" class="btn btn-primary">Einstellungen speichern</button>
      </div>
    </form>
  `;

  container.querySelector('#settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      company_name: form.company_name.value.trim(),
      address: form.address.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      tax_id: form.tax_id.value.trim() || null,
      bank_name: form.bank_name.value.trim() || null,
      bank_iban: form.bank_iban.value.trim() || null,
      bank_bic: form.bank_bic.value.trim() || null,
      invoice_prefix: form.invoice_prefix.value.trim() || 'AK',
      invoice_counter: parseInt(form.invoice_counter.value) || 1
    };

    try {
      if (s.id) {
        await api.update('settings', s.id, data);
      } else {
        await api.insert('settings', data);
      }
      toast.success('Einstellungen gespeichert');
    } catch (err) { toast.error('Fehler: ' + err.message); }
  });
}
