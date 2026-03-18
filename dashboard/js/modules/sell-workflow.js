/* ==========================================================================
   Sell Workflow — One-click vehicle sale process
   ========================================================================== */

async function openSellWorkflow(vehicleId) {
  const vehicle = await api.fetchById('vehicles', vehicleId);
  const customers = await api.fetchAll('customers', { orderBy: 'last_name' });
  const settingsArr = await api.fetchAll('settings', { limit: 1 });
  const settings = settingsArr[0] || {};

  const nextInvoiceNr = `${settings.invoice_prefix || 'AK'}-${new Date().getFullYear()}-${String(settings.invoice_counter || 1).padStart(3, '0')}`;

  modal.open('Fahrzeug verkaufen', `
    <form id="sellForm">
      <div class="info-banner" style="margin-bottom: 16px;">
        🚗 <strong>${escapeHtml(vehicle.name)}</strong> — ${formatPrice(vehicle.price)}
      </div>

      <div class="form-group">
        <label class="form-label">Käufer *</label>
        <select name="customer_id" class="form-input" required>
          <option value="">Kunde wählen...</option>
          ${customers.map(c => `<option value="${c.id}">${escapeHtml(c.first_name + ' ' + c.last_name)}${c.email ? ' — ' + c.email : ''}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Verkaufspreis (€) *</label>
        <input type="number" name="sale_price" class="form-input" value="${vehicle.price}" required min="0" step="100">
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Besteuerung</label>
          <select name="tax_type" class="form-input">
            <option value="differential">Differenzbesteuerung</option>
            <option value="standard">19% MwSt</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Rechnungsnr.</label>
          <input type="text" name="invoice_number" class="form-input" value="${nextInvoiceNr}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Verkaufsdatum</label>
        <input type="date" name="sale_date" class="form-input" value="${new Date().toISOString().slice(0, 10)}">
      </div>

      <div class="form-group">
        <label class="form-label">
          <input type="checkbox" name="generate_invoice" checked style="margin-right: 6px;">
          Rechnung als PDF generieren
        </label>
      </div>
      <div class="form-group">
        <label class="form-label">
          <input type="checkbox" name="generate_contract" checked style="margin-right: 6px;">
          Kaufvertrag als PDF generieren
        </label>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
        Verkauf abschließen
      </button>
    </form>
  `, { wide: true });

  document.getElementById('sellForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const customerId = form.customer_id.value;
    const salePrice = parseFloat(form.sale_price.value);
    const taxType = form.tax_type.value;
    const invoiceNumber = form.invoice_number.value.trim();
    const saleDate = form.sale_date.value;
    const genInvoice = form.generate_invoice.checked;
    const genContract = form.generate_contract.checked;

    if (!customerId) { toast.error('Bitte einen Käufer wählen'); return; }

    try {
      // 1. Create transaction (income)
      let netAmount, taxAmount;
      if (taxType === 'standard') {
        netAmount = (salePrice / 1.19).toFixed(2);
        taxAmount = (salePrice - netAmount).toFixed(2);
      } else {
        netAmount = salePrice.toFixed(2);
        taxAmount = '0.00';
      }

      const transaction = await api.insert('transactions', {
        type: 'income',
        category: 'vehicle_sale',
        amount: salePrice.toFixed(2),
        tax_type: taxType,
        tax_amount: taxAmount,
        net_amount: netAmount,
        vehicle_id: vehicleId,
        customer_id: customerId,
        description: `Verkauf: ${vehicle.name}`,
        invoice_number: invoiceNumber,
        date: saleDate
      });

      // 2. Create sale record
      await api.insert('sales', {
        vehicle_id: vehicleId,
        customer_id: customerId,
        transaction_id: transaction.id,
        sale_price: salePrice.toFixed(2),
        sale_date: saleDate
      });

      // 3. Set vehicle status to sold
      await api.update('vehicles', vehicleId, { status: 'sold' });

      // 4. Update customer status to active
      await api.update('customers', customerId, { status: 'active' });

      // 5. Increment invoice counter
      if (settings.id) {
        const { error } = await supabaseClient.from('settings').update({
          invoice_counter: (settings.invoice_counter || 1) + 1
        }).eq('id', settings.id);
      }

      // 6. Log activity
      const customer = await api.fetchById('customers', customerId);
      await api.logActivity('sale_completed', 'vehicle', vehicleId,
        `Verkauf abgeschlossen: ${vehicle.name} an ${customer.first_name} ${customer.last_name} für ${formatPrice(salePrice)}`);

      modal.close();
      toast.success('Verkauf erfolgreich abgeschlossen!');

      // 7. Generate PDFs
      if (genInvoice) {
        await generateInvoicePDF({
          customer, vehicle,
          amount: salePrice,
          taxType,
          invoiceNumber,
          date: new Date(saleDate).toLocaleDateString('de-DE')
        });
      }

      if (genContract) {
        await generateContractPDF({ customer, vehicle, price: salePrice });
      }

      // Refresh list
      const content = document.getElementById('appContent');
      if (content) renderVehiclesList(content);

    } catch (err) {
      toast.error('Fehler beim Verkauf: ' + err.message);
    }
  });
}
