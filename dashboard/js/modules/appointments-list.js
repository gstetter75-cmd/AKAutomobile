/* ==========================================================================
   Appointments Module — List & Calendar
   ========================================================================== */

async function renderAppointmentsList(container) {
  const appointments = await api.fetchAll('appointments', { orderBy: 'start_time', ascending: true });
  const upcoming = appointments.filter(a => a.status === 'scheduled' && new Date(a.start_time) >= new Date());
  const past = appointments.filter(a => a.status !== 'scheduled' || new Date(a.start_time) < new Date());

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Termine</h1>
        <p class="page-subtitle">${upcoming.length} anstehende Termine</p>
      </div>
      <a href="#/appointments/new" class="btn btn-primary">+ Neuer Termin</a>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header"><h2>Anstehende Termine</h2></div>
      <div class="card-body">
        ${upcoming.length === 0 ? '<p class="text-muted">Keine anstehenden Termine.</p>' : `
          <div class="appointments-grid">
            ${upcoming.map(a => renderAppointmentCard(a)).join('')}
          </div>
        `}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h2>Vergangene Termine</h2></div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Typ</th>
              <th>Titel</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            ${past.length === 0 ? '<tr><td colspan="5" class="text-center text-muted">Keine vergangenen Termine</td></tr>' :
              past.map(a => `
                <tr>
                  <td>${formatDateTime(a.start_time)}</td>
                  <td>${appointmentTypeMap[a.type]?.icon || ''} ${appointmentTypeMap[a.type]?.label || a.type}</td>
                  <td>${escapeHtml(a.title)}</td>
                  <td>${a.status === 'completed' ? '<span class="badge badge-green">Erledigt</span>' :
                        a.status === 'cancelled' ? '<span class="badge badge-red">Storniert</span>' :
                        '<span class="badge badge-orange">Geplant</span>'}</td>
                  <td><button class="btn-icon btn-delete" data-id="${a.id}">🗑️</button></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Appointment card actions
  container.querySelectorAll('[data-action="complete"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api.update('appointments', btn.dataset.id, { status: 'completed' });
      toast.success('Termin als erledigt markiert');
      renderAppointmentsList(container);
    });
  });

  container.querySelectorAll('[data-action="cancel"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api.update('appointments', btn.dataset.id, { status: 'cancelled' });
      toast.success('Termin storniert');
      renderAppointmentsList(container);
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await modal.confirm('Termin löschen', 'Möchten Sie diesen Termin löschen?')) {
        await api.remove('appointments', btn.dataset.id);
        toast.success('Termin gelöscht');
        renderAppointmentsList(container);
      }
    });
  });
}

function renderAppointmentCard(a) {
  const typeInfo = appointmentTypeMap[a.type] || { icon: '📌', label: a.type };
  const date = new Date(a.start_time);
  const endDate = new Date(a.end_time);
  return `
    <div class="appointment-card">
      <div class="appointment-card-header">
        <span class="appointment-type">${typeInfo.icon} ${typeInfo.label}</span>
        <span class="appointment-date">${date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
      </div>
      <h3 class="appointment-title">${escapeHtml(a.title)}</h3>
      <p class="appointment-time">${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
      ${a.description ? `<p class="text-muted" style="font-size:0.85rem;">${escapeHtml(a.description)}</p>` : ''}
      <div class="appointment-actions">
        <button class="btn btn-outline" style="padding:6px 12px;font-size:0.8rem;" data-id="${a.id}" data-action="complete">✓ Erledigt</button>
        <button class="btn-icon" data-id="${a.id}" data-action="cancel" title="Stornieren">✗</button>
      </div>
    </div>
  `;
}
