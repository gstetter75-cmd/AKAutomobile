/* ==========================================================================
   Vehicles List Module
   ========================================================================== */

async function renderVehiclesList(container) {
  const vehicles = await api.fetchAll('vehicles', { orderBy: 'created_at', ascending: false });

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Fahrzeuge</h1>
        <p class="page-subtitle">${vehicles.length} Fahrzeuge im System</p>
      </div>
      <a href="#/vehicles/new" class="btn btn-primary">+ Neues Fahrzeug</a>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <input type="text" id="vehicleSearch" class="search-input" placeholder="Suche nach Marke, Modell...">
        <select id="vehicleStatusFilter" class="filter-select">
          <option value="">Alle Status</option>
          <option value="available">Verfügbar</option>
          <option value="reserved">Reserviert</option>
          <option value="sold">Verkauft</option>
        </select>
        <select id="vehicleCategoryFilter" class="filter-select">
          <option value="">Alle Kategorien</option>
          <option value="kleinwagen">Kleinwagen</option>
          <option value="kompakt">Kompakt</option>
          <option value="mittelklasse">Mittelklasse</option>
          <option value="kombi">Kombi</option>
          <option value="suv">SUV</option>
        </select>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="vehiclesTable">
          <thead>
            <tr>
              <th>Fahrzeug</th>
              <th>Kategorie</th>
              <th>Preis</th>
              <th>Km-Stand</th>
              <th>Baujahr</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody id="vehiclesBody">
            ${renderVehicleRows(vehicles)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Search & Filter
  const searchInput = container.querySelector('#vehicleSearch');
  const statusFilter = container.querySelector('#vehicleStatusFilter');
  const categoryFilter = container.querySelector('#vehicleCategoryFilter');

  const applyFilters = debounce(() => {
    const search = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const category = categoryFilter.value;

    const filtered = vehicles.filter(v => {
      const matchSearch = !search || v.name.toLowerCase().includes(search) || v.brand.toLowerCase().includes(search) || v.model.toLowerCase().includes(search);
      const matchStatus = !status || v.status === status;
      const matchCategory = !category || v.category === category;
      return matchSearch && matchStatus && matchCategory;
    });

    container.querySelector('#vehiclesBody').innerHTML = renderVehicleRows(filtered);
    attachVehicleActions(container);
  }, 200);

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);

  attachVehicleActions(container);
}

function renderVehicleRows(vehicles) {
  if (vehicles.length === 0) {
    return '<tr><td colspan="7" class="text-center text-muted">Keine Fahrzeuge gefunden</td></tr>';
  }

  return vehicles.map(v => `
    <tr data-id="${v.id}">
      <td>
        <div class="table-vehicle">
          <strong>${escapeHtml(v.brand)} ${escapeHtml(v.model)}</strong>
          <span class="text-muted">${v.hp || '—'} PS · ${v.fuel}</span>
        </div>
      </td>
      <td>${categoryMap[v.category] || v.category}</td>
      <td><strong>${formatPrice(v.price)}</strong></td>
      <td>${formatMileage(v.mileage)}</td>
      <td>${v.year}</td>
      <td>${statusBadge(v.status, vehicleStatusMap)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-edit" data-id="${v.id}" title="Bearbeiten">✏️</button>
          <button class="btn-icon btn-delete" data-id="${v.id}" title="Löschen">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function attachVehicleActions(container) {
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => router.navigate('/vehicles/edit/' + btn.dataset.id));
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmed = await modal.confirm('Fahrzeug löschen', 'Möchten Sie dieses Fahrzeug wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.');
      if (confirmed) {
        try {
          await api.remove('vehicles', btn.dataset.id);
          await api.logActivity('vehicle_deleted', 'vehicle', btn.dataset.id, 'Fahrzeug gelöscht');
          toast.success('Fahrzeug gelöscht');
          renderVehiclesList(container);
        } catch (err) {
          toast.error('Fehler: ' + err.message);
        }
      }
    });
  });
}
