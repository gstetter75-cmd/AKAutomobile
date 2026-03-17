/* ==========================================================================
   Finance Form Module — Create / Edit Transaction
   ========================================================================== */

async function renderFinanceForm(container, transactionId) {
  const isEdit = !!transactionId;
  let transaction = null;

  if (isEdit) {
    transaction = await api.fetchById('transactions', transactionId);
  }

  const t = transaction || {};
  const vehicles = await api.fetchAll('vehicles', { orderBy: 'name' });
  const customers = await api.fetchAll('customers', { orderBy: 'last_name' });

  const incomeCategories = ['vehicle_sale', 'commission', 'other'];
  const expenseCategories = ['vehicle_purchase', 'repair', 'operating_cost', 'insurance', 'rent', 'salary', 'other'];

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>${isEdit ? 'Buchung bearbeiten' : 'Neue Buchung'}</h1>
      </div>
      <a href="#/finance" class="btn btn-outline">&larr; Zurück</a>
    </div>

    <form id="financeForm" class="card">
      <div class="card-body">
        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Typ *</label>
            <select name="type" class="form-input" id="fType" required>
              <option value="income" ${t.type === 'income' || !t.type ? 'selected' : ''}>Einnahme</option>
              <option value="expense" ${t.type === 'expense' ? 'selected' : ''}>Ausgabe</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Kategorie *</label>
            <select name="category" class="form-input" id="fCategory" required>
              ${incomeCategories.map(c => `<option value="${c}" ${t.category === c ? 'selected' : ''}>${transactionCategoryMap[c]}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Datum *</label>
            <input type="date" name="date" class="form-input" value="${t.date || new Date().toISOString().slice(0, 10)}" required>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Betrag (Brutto) *</label>
            <input type="number" name="amount" class="form-input" id="fAmount" value="${t.amount || ''}" required min="0" step="0.01" placeholder="0,00">
          </div>
          <div class="form-group">
            <label class="form-label">Besteuerung</label>
            <select name="tax_type" class="form-input" id="fTaxType">
              <option value="standard" ${(t.tax_type || 'standard') === 'standard' ? 'selected' : ''}>19% MwSt</option>
              <option value="differential" ${t.tax_type === 'differential' ? 'selected' : ''}>Differenzbesteuerung</option>
              <option value="none" ${t.tax_type === 'none' ? 'selected' : ''}>Keine USt</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Rechnungsnr.</label>
            <input type="text" name="invoice_number" class="form-input" value="${escapeHtml(t.invoice_number || '')}" placeholder="z.B. AK-2026-001">
          </div>
        </div>

        <div id="taxCalc" class="tax-calc" style="background: var(--gray-50); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 16px;">
          <span>Netto: <strong id="fNet">—</strong></span> &nbsp;|&nbsp;
          <span>USt: <strong id="fTax">—</strong></span> &nbsp;|&nbsp;
          <span>Brutto: <strong id="fGross">—</strong></span>
        </div>

        <div class="form-group">
          <label class="form-label">Beschreibung</label>
          <input type="text" name="description" class="form-input" value="${escapeHtml(t.description || '')}" placeholder="Beschreibung der Buchung">
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Fahrzeug (optional)</label>
            <select name="vehicle_id" class="form-input">
              <option value="">— Kein Fahrzeug —</option>
              ${vehicles.map(v => `<option value="${v.id}" ${t.vehicle_id === v.id ? 'selected' : ''}>${escapeHtml(v.name)} — ${formatPrice(v.price)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Kunde (optional)</label>
            <select name="customer_id" class="form-input">
              <option value="">— Kein Kunde —</option>
              ${customers.map(c => `<option value="${c.id}" ${t.customer_id === c.id ? 'selected' : ''}>${escapeHtml(c.first_name + ' ' + c.last_name)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <a href="#/finance" class="btn btn-outline">Abbrechen</a>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Speichern' : 'Buchung erfassen'}</button>
      </div>
    </form>
  `;

  // Dynamic category options based on type
  const typeSelect = container.querySelector('#fType');
  const categorySelect = container.querySelector('#fCategory');

  typeSelect.addEventListener('change', () => {
    const cats = typeSelect.value === 'income' ? incomeCategories : expenseCategories;
    categorySelect.innerHTML = cats.map(c => `<option value="${c}">${transactionCategoryMap[c]}</option>`).join('');
  });

  // Tax calculation
  const amountInput = container.querySelector('#fAmount');
  const taxTypeSelect = container.querySelector('#fTaxType');

  function updateTaxCalc() {
    const brutto = parseFloat(amountInput.value) || 0;
    const taxType = taxTypeSelect.value;
    let net, tax;

    if (taxType === 'standard') {
      net = brutto / 1.19;
      tax = brutto - net;
    } else if (taxType === 'differential') {
      net = brutto;
      tax = 0;
    } else {
      net = brutto;
      tax = 0;
    }

    container.querySelector('#fNet').textContent = formatCurrency(net);
    container.querySelector('#fTax').textContent = formatCurrency(tax);
    container.querySelector('#fGross').textContent = formatCurrency(brutto);
  }

  amountInput.addEventListener('input', updateTaxCalc);
  taxTypeSelect.addEventListener('change', updateTaxCalc);
  updateTaxCalc();

  // Submit
  container.querySelector('#financeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const brutto = parseFloat(form.amount.value);
    const taxType = form.tax_type.value;
    let netAmount, taxAmount;

    if (taxType === 'standard') {
      netAmount = (brutto / 1.19).toFixed(2);
      taxAmount = (brutto - netAmount).toFixed(2);
    } else {
      netAmount = brutto.toFixed(2);
      taxAmount = '0.00';
    }

    const data = {
      type: form.type.value,
      category: form.category.value,
      amount: brutto.toFixed(2),
      tax_type: taxType,
      tax_amount: taxAmount,
      net_amount: netAmount,
      date: form.date.value,
      description: form.description.value.trim() || null,
      invoice_number: form.invoice_number.value.trim() || null,
      vehicle_id: form.vehicle_id.value || null,
      customer_id: form.customer_id.value || null
    };

    try {
      if (isEdit) {
        await api.update('transactions', transactionId, data);
        toast.success('Buchung gespeichert');
      } else {
        const created = await api.insert('transactions', data);
        await api.logActivity('transaction_created', 'transaction', created.id, `${data.type === 'income' ? 'Einnahme' : 'Ausgabe'}: ${formatCurrency(brutto)}`);
        toast.success('Buchung erfasst');
      }
      router.navigate('/finance');
    } catch (err) { toast.error('Fehler: ' + err.message); }
  });
}
