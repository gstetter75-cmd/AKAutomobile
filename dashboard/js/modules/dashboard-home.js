/* ==========================================================================
   Dashboard Home — KPIs & Activity Feed
   ========================================================================== */

async function renderDashboardHome(container) {
  // Fetch KPIs in parallel
  const [vehicleCount, inquiryCount, activities, todayAppointments] = await Promise.all([
    api.count('vehicles', { status: 'available' }),
    api.count('inquiries', { status: 'new' }),
    api.fetchAll('activity_log', { orderBy: 'created_at', ascending: false, limit: 15 }),
    supabaseClient.from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('start_time', new Date().toISOString().split('T')[0])
      .lt('start_time', new Date(Date.now() + 86400000).toISOString().split('T')[0])
      .then(r => r.count || 0)
  ]);

  // Monthly revenue
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const { data: monthIncome } = await supabaseClient.from('transactions')
    .select('amount')
    .eq('type', 'income')
    .gte('date', firstOfMonth.toISOString().split('T')[0]);

  // Tomorrow's appointments for reminders
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const { data: tomorrowAppts } = await supabaseClient.from('appointments')
    .select('*')
    .eq('status', 'scheduled')
    .gte('start_time', tomorrowStr)
    .lt('start_time', dayAfter)
    .order('start_time');
  const monthRevenue = (monthIncome || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);

  container.innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="page-subtitle">Willkommen bei AK Automobile</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon kpi-blue">🚗</div>
        <div class="kpi-content">
          <div class="kpi-value">${vehicleCount}</div>
          <div class="kpi-label">Fahrzeuge im Bestand</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-orange">📧</div>
        <div class="kpi-content">
          <div class="kpi-value">${inquiryCount}</div>
          <div class="kpi-label">Offene Anfragen</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-green">💰</div>
        <div class="kpi-content">
          <div class="kpi-value">${formatCurrency(monthRevenue)}</div>
          <div class="kpi-label">Umsatz diesen Monat</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-purple">📅</div>
        <div class="kpi-content">
          <div class="kpi-value">${todayAppointments}</div>
          <div class="kpi-label">Termine heute</div>
        </div>
      </div>
    </div>

    ${(tomorrowAppts && tomorrowAppts.length > 0) ? `
    <div class="card" style="margin-bottom: 20px; border-left: 4px solid var(--orange);">
      <div class="card-body">
        <h3 style="margin-bottom: 12px;">⏰ Erinnerung: ${tomorrowAppts.length} Termin${tomorrowAppts.length > 1 ? 'e' : ''} morgen</h3>
        ${tomorrowAppts.map(a => {
          const time = new Date(a.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
          const typeInfo = appointmentTypeMap[a.type] || { icon: '📌', label: a.type };
          return `<div style="display:flex;gap:8px;align-items:center;padding:6px 0;">
            <span>${typeInfo.icon}</span>
            <strong>${time}</strong>
            <span>${escapeHtml(a.title)}</span>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <div class="dash-grid-2">
      <div class="card">
        <div class="card-header">
          <h2>Schnellzugriff</h2>
        </div>
        <div class="card-body quick-actions">
          <a href="#/vehicles/new" class="quick-action-btn">🚗 Fahrzeug hinzufügen</a>
          <a href="#/customers/new" class="quick-action-btn">👤 Kunde anlegen</a>
          <a href="#/inquiries" class="quick-action-btn">📧 Anfragen anzeigen</a>
          <a href="#/appointments/new" class="quick-action-btn">📅 Termin planen</a>
          <a href="#/finance/new" class="quick-action-btn">💰 Buchung erfassen</a>
          <a href="../index.html" target="_blank" class="quick-action-btn">🔗 Website ansehen</a>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Letzte Aktivitäten</h2>
        </div>
        <div class="card-body">
          ${activities.length === 0
            ? '<p class="text-muted">Noch keine Aktivitäten vorhanden.</p>'
            : `<div class="activity-feed">
                ${activities.map(a => `
                  <div class="activity-item">
                    <div class="activity-dot"></div>
                    <div class="activity-content">
                      <span class="activity-text">${escapeHtml(a.description)}</span>
                      <span class="activity-time">${formatDateTime(a.created_at)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>`
          }
        </div>
      </div>
    </div>
  `;
}
