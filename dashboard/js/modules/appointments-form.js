/* ==========================================================================
   Appointment Form Module
   ========================================================================== */

async function renderAppointmentForm(container) {
  const vehicles = await api.fetchAll('vehicles', { filters: { status: 'available' }, orderBy: 'name' });
  const customers = await api.fetchAll('customers', { orderBy: 'last_name' });

  const today = new Date().toISOString().slice(0, 10);

  container.innerHTML = `
    <div class="page-header">
      <div><h1>Neuer Termin</h1></div>
      <a href="#/appointments" class="btn btn-outline">&larr; Zurück</a>
    </div>

    <form id="appointmentForm" class="card">
      <div class="card-body">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Typ *</label>
            <select name="type" class="form-input" required>
              ${Object.entries(appointmentTypeMap).map(([val, info]) =>
                `<option value="${val}">${info.icon} ${info.label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Titel *</label>
            <input type="text" name="title" class="form-input" required placeholder="z.B. Probefahrt Golf mit Hr. Müller">
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Datum *</label>
            <input type="date" name="date" class="form-input" required value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">Von *</label>
            <input type="time" name="start_time" class="form-input" required value="10:00">
          </div>
          <div class="form-group">
            <label class="form-label">Bis *</label>
            <input type="time" name="end_time" class="form-input" required value="11:00">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Kunde</label>
            <select name="customer_id" class="form-input">
              <option value="">— Kein Kunde —</option>
              ${customers.map(c => `<option value="${c.id}">${escapeHtml(c.first_name + ' ' + c.last_name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fahrzeug</label>
            <select name="vehicle_id" class="form-input">
              <option value="">— Kein Fahrzeug —</option>
              ${vehicles.map(v => `<option value="${v.id}">${escapeHtml(v.name)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Beschreibung</label>
          <textarea name="description" class="form-input" rows="3" placeholder="Weitere Details..."></textarea>
        </div>
      </div>
      <div class="card-footer">
        <a href="#/appointments" class="btn btn-outline">Abbrechen</a>
        <button type="submit" class="btn btn-primary">Termin anlegen</button>
      </div>
    </form>
  `;

  container.querySelector('#appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const date = form.date.value;
    const startTime = form.start_time.value;
    const endTime = form.end_time.value;

    const data = {
      type: form.type.value,
      title: form.title.value.trim(),
      start_time: `${date}T${startTime}:00`,
      end_time: `${date}T${endTime}:00`,
      customer_id: form.customer_id.value || null,
      vehicle_id: form.vehicle_id.value || null,
      description: form.description.value.trim() || null,
      status: 'scheduled'
    };

    if (!data.title) { toast.error('Bitte Titel eingeben'); return; }
    if (data.end_time <= data.start_time) { toast.error('Endzeit muss nach Startzeit liegen'); return; }

    try {
      const created = await api.insert('appointments', data);
      await api.logActivity('appointment_created', 'appointment', created.id, `Neuer Termin: ${data.title}`);
      toast.success('Termin angelegt');
      router.navigate('/appointments');
    } catch (err) { toast.error('Fehler: ' + err.message); }
  });
}
