/* ==========================================================================
   Finance Module — Transactions List & Overview
   ========================================================================== */

async function renderFinanceList(container) {
  const transactions = await api.fetchAll('transactions', { orderBy: 'date', ascending: false });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
  const profit = totalIncome - totalExpense;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Finanzen</h1>
        <p class="page-subtitle">${transactions.length} Buchungen</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline" id="exportCsvBtn">📥 CSV-Export</button>
        <a href="#/finance/new" class="btn btn-primary">+ Neue Buchung</a>
      </div>
    </div>

    <div class="info-banner">
      ⚠️ Diese Finanzverwaltung ist nicht GoBD-zertifiziert und ersetzt keine Buchhaltungssoftware. CSV-Export für den Steuerberater verfügbar.
    </div>

    <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
      <div class="kpi-card">
        <div class="kpi-icon kpi-green">📈</div>
        <div class="kpi-content">
          <div class="kpi-value" style="color: var(--green);">${formatCurrency(totalIncome)}</div>
          <div class="kpi-label">Einnahmen gesamt</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#FFF0F0;">📉</div>
        <div class="kpi-content">
          <div class="kpi-value" style="color: var(--red);">${formatCurrency(totalExpense)}</div>
          <div class="kpi-label">Ausgaben gesamt</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-blue">💰</div>
        <div class="kpi-content">
          <div class="kpi-value" style="color: ${profit >= 0 ? 'var(--green)' : 'var(--red)'};">${formatCurrency(profit)}</div>
          <div class="kpi-label">Ergebnis</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <select id="financeTypeFilter" class="filter-select">
          <option value="">Alle</option>
          <option value="income">Einnahmen</option>
          <option value="expense">Ausgaben</option>
        </select>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Typ</th>
              <th>Kategorie</th>
              <th>Beschreibung</th>
              <th>Netto</th>
              <th>USt</th>
              <th>Brutto</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody id="financeBody">
            ${renderTransactionRows(transactions)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Filter
  container.querySelector('#financeTypeFilter').addEventListener('change', (e) => {
    const type = e.target.value;
    const filtered = type ? transactions.filter(t => t.type === type) : transactions;
    container.querySelector('#financeBody').innerHTML = renderTransactionRows(filtered);
    attachFinanceActions(container);
  });

  // CSV Export
  container.querySelector('#exportCsvBtn').addEventListener('click', () => {
    const csv = ['Datum;Typ;Kategorie;Beschreibung;Netto;USt;Brutto;Rechnungsnr'];
    transactions.forEach(t => {
      csv.push([
        t.date, t.type === 'income' ? 'Einnahme' : 'Ausgabe',
        t.category, `"${(t.description || '').replace(/"/g, '""')}"`,
        t.net_amount || '', t.tax_amount || '', t.amount, t.invoice_number || ''
      ].join(';'));
    });
    const blob = new Blob(['\ufeff' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `AK_Finanzen_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('CSV exportiert');
  });

  attachFinanceActions(container);
}

const transactionCategoryMap = {
  vehicle_sale: 'Fahrzeugverkauf', vehicle_purchase: 'Fahrzeugeinkauf',
  commission: 'Provision', repair: 'Reparatur',
  operating_cost: 'Betriebskosten', insurance: 'Versicherung',
  rent: 'Miete', salary: 'Gehalt', other: 'Sonstiges'
};

function renderTransactionRows(transactions) {
  if (transactions.length === 0) {
    return '<tr><td colspan="8" class="text-center text-muted">Keine Buchungen</td></tr>';
  }
  return transactions.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.type === 'income'
        ? '<span class="badge badge-green">Einnahme</span>'
        : '<span class="badge badge-red">Ausgabe</span>'}</td>
      <td>${transactionCategoryMap[t.category] || t.category}</td>
      <td>${escapeHtml(t.description || '—')}</td>
      <td>${t.net_amount ? formatCurrency(t.net_amount) : '—'}</td>
      <td>${t.tax_amount ? formatCurrency(t.tax_amount) : '—'}</td>
      <td><strong>${formatCurrency(t.amount)}</strong></td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-edit" data-id="${t.id}" title="Bearbeiten">✏️</button>
          <button class="btn-icon btn-delete" data-id="${t.id}" title="Löschen">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function attachFinanceActions(container) {
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => router.navigate('/finance/edit/' + btn.dataset.id));
  });
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await modal.confirm('Buchung löschen', 'Möchten Sie diese Buchung löschen?')) {
        try {
          await api.remove('transactions', btn.dataset.id);
          toast.success('Buchung gelöscht');
          renderFinanceList(container);
        } catch (err) { toast.error('Fehler: ' + err.message); }
      }
    });
  });
}
