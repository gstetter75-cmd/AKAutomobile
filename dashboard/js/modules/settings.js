/* ==========================================================================
   Settings Module — Company Data + Website Preview
   ========================================================================== */

async function renderSettings(container) {
  let settings;
  try {
    const result = await api.fetchAll('settings', { limit: 1 });
    settings = result;
  } catch (err) {
    settings = [];
  }
  const s = settings[0] || {};

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Einstellungen</h1>
        <p class="page-subtitle">Firmendaten und Konfiguration</p>
      </div>
      <a href="../index.html" target="_blank" class="btn btn-outline">🔗 Website ansehen</a>
    </div>

    <form id="settingsForm" class="card" style="margin-bottom: 24px;">
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

        <h3 class="form-section-title">Benachrichtigungen</h3>
        <div class="info-banner" style="margin-bottom: 16px;">
          📧 E-Mail-Benachrichtigungen bei neuen Anfragen können über das
          <a href="https://supabase.com/dashboard/project/bwunbletmseulnfgtljn/database/hooks" target="_blank">Supabase Dashboard → Database Webhooks</a>
          eingerichtet werden. Verbinde die <code>inquiries</code>-Tabelle mit einem E-Mail-Dienst wie
          <a href="https://resend.com" target="_blank">Resend</a> (kostenlos bis 3.000 E-Mails/Monat).
        </div>

        <h3 class="form-section-title">Website</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Website-URL</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input" value="https://gstetter75-cmd.github.io/AKAutomobile/" readonly style="background: var(--gray-100);">
              <a href="https://gstetter75-cmd.github.io/AKAutomobile/" target="_blank" class="btn btn-outline" style="white-space: nowrap;">Öffnen</a>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Supabase-Projekt</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input" value="bwunbletmseulnfgtljn (eu-central-1)" readonly style="background: var(--gray-100);">
              <a href="https://supabase.com/dashboard/project/bwunbletmseulnfgtljn" target="_blank" class="btn btn-outline" style="white-space: nowrap;">Öffnen</a>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button type="submit" class="btn btn-primary">Einstellungen speichern</button>
      </div>
    </form>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-body">
        <h3 class="form-section-title" style="margin-top: 0;">Tipps & nächste Schritte</h3>
        <div class="tips-grid">
          <div class="tip-item">
            <span class="tip-icon">🌐</span>
            <div>
              <strong>Custom Domain</strong>
              <p class="text-muted">Eigene Domain (z.B. ak-automobile.de) statt GitHub Pages. Unter <a href="https://github.com/gstetter75-cmd/AKAutomobile/settings/pages" target="_blank">Repo Settings → Pages</a> konfigurierbar.</p>
            </div>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📱</span>
            <div>
              <strong>Dashboard als App</strong>
              <p class="text-muted">Öffne das Dashboard auf dem Handy und tippe "Zum Startbildschirm hinzufügen" — es verhält sich dann wie eine App.</p>
            </div>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📊</span>
            <div>
              <strong>Website-Analytics</strong>
              <p class="text-muted">Für Besucherstatistiken: <a href="https://plausible.io" target="_blank">Plausible.io</a> (DSGVO-konform, ab 9€/Monat). Script ist vorbereitet in index.html.</p>
            </div>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📍</span>
            <div>
              <strong>Google My Business</strong>
              <p class="text-muted">Erstelle ein <a href="https://business.google.com" target="_blank">Google Business Profil</a> — Kunden finden dich dann auf Google Maps.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        // Settings table has no updated_at — use direct update
        const { error } = await supabaseClient.from('settings').update(data).eq('id', s.id);
        if (error) throw error;
      } else {
        await api.insert('settings', data);
      }
      toast.success('Einstellungen gespeichert');
    } catch (err) { toast.error('Fehler: ' + err.message); }
  });
}
