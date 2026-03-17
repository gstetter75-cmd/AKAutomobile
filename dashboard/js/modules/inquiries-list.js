/* ==========================================================================
   Inquiries List Module (Website Leads)
   ========================================================================== */

async function renderInquiriesList(container) {
  const inquiries = await api.fetchAll('inquiries', { orderBy: 'created_at', ascending: false });

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Anfragen</h1>
        <p class="page-subtitle">${inquiries.filter(i => i.status === 'new').length} neue Anfragen</p>
      </div>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <select id="inquiryStatusFilter" class="filter-select">
          <option value="">Alle</option>
          <option value="new" selected>Neue</option>
          <option value="contacted">Kontaktiert</option>
          <option value="closed">Erledigt</option>
        </select>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kontakt</th>
              <th>Betreff</th>
              <th>Nachricht</th>
              <th>Status</th>
              <th>Datum</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody id="inquiriesBody">
            ${renderInquiryRows(inquiries.filter(i => i.status === 'new'))}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const statusFilter = container.querySelector('#inquiryStatusFilter');
  statusFilter.addEventListener('change', () => {
    const status = statusFilter.value;
    const filtered = status ? inquiries.filter(i => i.status === status) : inquiries;
    container.querySelector('#inquiriesBody').innerHTML = renderInquiryRows(filtered);
    attachInquiryActions(container, inquiries);
  });

  attachInquiryActions(container, inquiries);
}

function renderInquiryRows(inquiries) {
  if (inquiries.length === 0) {
    return '<tr><td colspan="7" class="text-center text-muted">Keine Anfragen</td></tr>';
  }
  const subjectMap = { buy: 'Fahrzeuganfrage', sell: 'Auto verkaufen', general: 'Allgemein' };
  return inquiries.map(i => `
    <tr>
      <td><strong>${escapeHtml(i.name)}</strong></td>
      <td>
        <div>${escapeHtml(i.email)}</div>
        ${i.phone ? `<div class="text-muted">${escapeHtml(i.phone)}</div>` : ''}
      </td>
      <td>${subjectMap[i.subject] || i.subject || '—'}</td>
      <td><span style="max-width:200px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(i.message || '—')}</span></td>
      <td>${statusBadge(i.status, inquiryStatusMap)}</td>
      <td>${formatDateTime(i.created_at)}</td>
      <td>
        <div class="table-actions">
          ${i.status === 'new' ? `<button class="btn-icon" data-id="${i.id}" data-action="contacted" title="Als kontaktiert markieren">📞</button>` : ''}
          ${i.status !== 'closed' ? `<button class="btn-icon" data-id="${i.id}" data-action="closed" title="Als erledigt markieren">✅</button>` : ''}
          <button class="btn-icon" data-id="${i.id}" data-action="create-customer" title="Als Kunde anlegen">👤</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function attachInquiryActions(container, allInquiries) {
  container.querySelectorAll('.table-actions .btn-icon').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === 'contacted' || action === 'closed') {
        try {
          await api.update('inquiries', id, { status: action });
          toast.success(action === 'contacted' ? 'Als kontaktiert markiert' : 'Anfrage erledigt');
          renderInquiriesList(container);
        } catch (err) { toast.error('Fehler: ' + err.message); }
      }

      if (action === 'create-customer') {
        const inquiry = allInquiries.find(i => i.id === id);
        if (!inquiry) return;
        const nameParts = inquiry.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        try {
          const customer = await api.insert('customers', {
            first_name: firstName,
            last_name: lastName || firstName,
            email: inquiry.email,
            phone: inquiry.phone || null,
            source: 'website_form',
            status: 'lead'
          });
          await api.update('inquiries', id, { customer_id: customer.id, status: 'contacted' });
          await api.logActivity('customer_created', 'customer', customer.id, `Kunde aus Anfrage erstellt: ${inquiry.name}`);
          toast.success('Kunde angelegt und Anfrage zugeordnet');
          renderInquiriesList(container);
        } catch (err) { toast.error('Fehler: ' + err.message); }
      }
    });
  });
}
