/* ==========================================================================
   Customer Form Module (Create / Edit)
   ========================================================================== */

async function renderCustomerForm(container, customerId) {
  const isEdit = !!customerId;
  let customer = null;
  let notes = [];

  if (isEdit) {
    customer = await api.fetchById('customers', customerId);
    notes = await api.fetchAll('customer_notes', { filters: { customer_id: customerId }, orderBy: 'created_at', ascending: false });
  }

  const c = customer || {};

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>${isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}</h1>
        <p class="page-subtitle">${isEdit ? c.first_name + ' ' + c.last_name : 'Neuen Kunden anlegen'}</p>
      </div>
      <a href="#/customers" class="btn btn-outline">&larr; Zurück</a>
    </div>

    <div class="dash-grid-2">
      <form id="customerForm" class="card">
        <div class="card-body">
          <h3 class="form-section-title">Kontaktdaten</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Vorname *</label>
              <input type="text" name="first_name" class="form-input" value="${escapeHtml(c.first_name || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nachname *</label>
              <input type="text" name="last_name" class="form-input" value="${escapeHtml(c.last_name || '')}" required>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">E-Mail</label>
              <input type="email" name="email" class="form-input" value="${escapeHtml(c.email || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Telefon</label>
              <input type="tel" name="phone" class="form-input" value="${escapeHtml(c.phone || '')}">
            </div>
          </div>

          <h3 class="form-section-title">Adresse</h3>
          <div class="form-group">
            <label class="form-label">Straße</label>
            <input type="text" name="address_street" class="form-input" value="${escapeHtml(c.address_street || '')}">
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">PLZ</label>
              <input type="text" name="address_zip" class="form-input" value="${escapeHtml(c.address_zip || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Ort</label>
              <input type="text" name="address_city" class="form-input" value="${escapeHtml(c.address_city || '')}">
            </div>
          </div>

          <h3 class="form-section-title">Status</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select name="status" class="form-input">
                ${['lead', 'active', 'closed'].map(s =>
                  `<option value="${s}" ${(c.status || 'lead') === s ? 'selected' : ''}>${customerStatusMap[s].label}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Quelle</label>
              <select name="source" class="form-input">
                ${['manual', 'website_form', 'phone'].map(s =>
                  `<option value="${s}" ${(c.source || 'manual') === s ? 'selected' : ''}>${s === 'manual' ? 'Manuell' : s === 'website_form' ? 'Website' : 'Telefon'}</option>`
                ).join('')}
              </select>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <a href="#/customers" class="btn btn-outline">Abbrechen</a>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Speichern' : 'Kunde anlegen'}</button>
        </div>
      </form>

      ${isEdit ? `
      <div class="card">
        <div class="card-header"><h2>Notizen</h2></div>
        <div class="card-body">
          <div class="form-group">
            <textarea id="newNote" class="form-input" rows="2" placeholder="Neue Notiz..."></textarea>
          </div>
          <button class="btn btn-outline" id="addNoteBtn" style="margin-bottom: 16px;">Notiz hinzufügen</button>
          <div id="notesList">
            ${notes.length === 0 ? '<p class="text-muted">Noch keine Notizen.</p>' :
              notes.map(n => `
                <div class="note-item">
                  <p>${escapeHtml(n.note)}</p>
                  <span class="text-muted" style="font-size: 0.8rem;">${formatDateTime(n.created_at)}</span>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
      ` : '<div></div>'}
    </div>
  `;

  // Form submit
  container.querySelector('#customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      email: form.email.value.trim() || null,
      phone: form.phone.value.trim() || null,
      address_street: form.address_street.value.trim() || null,
      address_zip: form.address_zip.value.trim() || null,
      address_city: form.address_city.value.trim() || null,
      status: form.status.value,
      source: form.source.value
    };

    if (!data.first_name || !data.last_name) {
      toast.error('Bitte Vor- und Nachname eingeben');
      return;
    }

    try {
      if (isEdit) {
        await api.update('customers', customerId, data);
        await api.logActivity('customer_updated', 'customer', customerId, `Kunde aktualisiert: ${data.first_name} ${data.last_name}`);
        toast.success('Kunde gespeichert');
      } else {
        const created = await api.insert('customers', data);
        await api.logActivity('customer_created', 'customer', created.id, `Neuer Kunde: ${data.first_name} ${data.last_name}`);
        toast.success('Kunde angelegt');
      }
      router.navigate('/customers');
    } catch (err) { toast.error('Fehler: ' + err.message); }
  });

  // Notes
  if (isEdit) {
    container.querySelector('#addNoteBtn')?.addEventListener('click', async () => {
      const textarea = container.querySelector('#newNote');
      const note = textarea.value.trim();
      if (!note) return;

      try {
        await api.insert('customer_notes', { customer_id: customerId, note });
        toast.success('Notiz hinzugefügt');
        textarea.value = '';
        renderCustomerForm(container, customerId);
      } catch (err) { toast.error('Fehler: ' + err.message); }
    });
  }
}
