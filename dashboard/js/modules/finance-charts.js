/* ==========================================================================
   Finance Charts — Monthly Revenue Chart (Chart.js)
   ========================================================================== */

async function renderFinanceCharts(container) {
  // Fetch last 12 months of transactions
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const { data: transactions } = await supabaseClient.from('transactions')
    .select('type, amount, date')
    .gte('date', twelveMonthsAgo.toISOString().split('T')[0])
    .order('date');

  // Group by month
  const months = [];
  const incomeByMonth = {};
  const expenseByMonth = {};

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
    months.push({ key, label });
    incomeByMonth[key] = 0;
    expenseByMonth[key] = 0;
  }

  (transactions || []).forEach(t => {
    const key = t.date.slice(0, 7);
    const amount = parseFloat(t.amount);
    if (t.type === 'income') incomeByMonth[key] = (incomeByMonth[key] || 0) + amount;
    else expenseByMonth[key] = (expenseByMonth[key] || 0) + amount;
  });

  // Top categories
  const categoryTotals = {};
  (transactions || []).forEach(t => {
    const cat = t.type === 'income' ? 'Einnahmen' : (transactionCategoryMap[t.category] || t.category || 'Sonstige');
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(t.amount);
  });
  const topCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Finanz-Übersicht</h1>
        <p class="page-subtitle">Letzte 12 Monate</p>
      </div>
      <a href="#/finance" class="btn btn-outline">&larr; Zur Buchungsliste</a>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header"><h2>Umsatz-Verlauf</h2></div>
      <div class="card-body" style="height: 300px;">
        <canvas id="revenueChart"></canvas>
      </div>
    </div>

    <div class="dash-grid-2">
      <div class="card">
        <div class="card-header"><h2>Top-Kategorien</h2></div>
        <div class="card-body">
          ${topCats.map(([cat, amount]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100);">
              <span>${cat}</span>
              <strong>${formatCurrency(amount)}</strong>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Einnahmen vs. Ausgaben</h2></div>
        <div class="card-body" style="height: 250px;">
          <canvas id="pieChart"></canvas>
        </div>
      </div>
    </div>
  `;

  // Render charts
  const { Chart } = window;
  if (!Chart) return;

  new Chart(document.getElementById('revenueChart'), {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        { label: 'Einnahmen', data: months.map(m => incomeByMonth[m.key] || 0), backgroundColor: '#2D9F4A' },
        { label: 'Ausgaben', data: months.map(m => expenseByMonth[m.key] || 0), backgroundColor: '#E03131' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => formatCurrency(v) } } }
    }
  });

  const totalIncome = Object.values(incomeByMonth).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseByMonth).reduce((a, b) => a + b, 0);

  new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: ['Einnahmen', 'Ausgaben'],
      datasets: [{ data: [totalIncome, totalExpense], backgroundColor: ['#2D9F4A', '#E03131'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}
