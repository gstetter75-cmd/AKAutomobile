/* ==========================================================================
   Customers List Module
   ========================================================================== */

async function renderCustomersList(container) {
  const customers = await api.fetchAll('customers', { orderBy: 'created_at', ascending: false });

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Kunden</h1>
        <p class="page-subtitle">${customers.length} Kunden im System</p>
      </div>
      <a href="#/customers/new" class="btn btn-primary">+ Neuer Kunde</a>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <input type="text" id="customerSearch" class="search-input" placeholder="Suche nach Name, E-Mail...">
        <select id="customerStatusFilter" class="filter-select">
          <option value="">Alle Status</option>
          <option value="lead">Interessent</option>
          <option value="active">Aktiv</option>
          <option value="closed">Abgeschlossen</option>
        </select>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kontakt</th>
              <th>Ort</th>
              <th>Status</th>
              <th>Erstellt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody id="customersBody">
            ${renderCustomerRows(customers)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#customerSearch');
  const statusFilter = container.querySelector('#customerStatusFilter');

  const applyFilters = debounce(() => {
    const search = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const filtered = customers.filter(c => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      const matchSearch = !search || fullName.includes(search) || (c.email || '').toLowerCase().includes(search) || (c.phone || '').includes(search);
      const matchStatus = !status || c.status === status;
      return matchSearch && matchStatus;
    });
    container.querySelector('#customersBody').innerHTML = renderCustomerRows(filtered);
    attachCustomerActions(container);
  }, 200);

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  attachCustomerActions(container);
}

function renderCustomerRows(customers) {
  if (customers.length === 0) {
    return '<tr><td colspan="6" class="text-center text-muted">Keine Kunden gefunden</td></tr>';
  }
  return customers.map(c => `
    <tr data-id="${c.id}">
      <td><strong>${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</strong></td>
      <td>
        ${c.email ? `<div>${escapeHtml(c.email)}</div>` : ''}
        ${c.phone ? `<div class="text-muted">${escapeHtml(c.phone)}</div>` : ''}
      </td>
      <td>${c.address_city ? escapeHtml(c.address_zip + ' ' + c.address_city) : '—'}</td>
      <td>${statusBadge(c.status, customerStatusMap)}</td>
      <td>${formatDate(c.created_at)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-edit" data-id="${c.id}" title="Bearbeiten">✏️</button>
          <button class="btn-icon btn-delete" data-id="${c.id}" title="Löschen">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function attachCustomerActions(container) {
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => router.navigate('/customers/edit/' + btn.dataset.id));
  });
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await modal.confirm('Kunde löschen', 'Möchten Sie diesen Kunden wirklich löschen?')) {
        try {
          await api.remove('customers', btn.dataset.id);
          toast.success('Kunde gelöscht');
          renderCustomersList(container);
        } catch (err) { toast.error('Fehler: ' + err.message); }
      }
    });
  });
}
