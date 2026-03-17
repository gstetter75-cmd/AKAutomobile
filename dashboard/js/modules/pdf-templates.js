/* ==========================================================================
   PDF Templates — Invoice & Purchase Contract Generator
   ========================================================================== */

async function generateInvoicePDF({ customer, vehicle, amount, taxType, invoiceNumber, date }) {
  const settingsArr = await api.fetchAll('settings', { limit: 1 });
  const s = settingsArr[0] || {};
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const brutto = parseFloat(amount);
  let netto, ust, ustText;
  if (taxType === 'standard') {
    netto = brutto / 1.19;
    ust = brutto - netto;
    ustText = '19% MwSt';
  } else if (taxType === 'differential') {
    netto = brutto;
    ust = 0;
    ustText = 'Differenzbesteuerung gem. § 25a UStG';
  } else {
    netto = brutto;
    ust = 0;
    ustText = 'Kein USt-Ausweis';
  }

  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(s.company_name || 'AK Automobile', 14, 20);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text([s.address || '', s.phone || '', s.email || ''].filter(Boolean).join(' | '), 14, 27);
  if (s.tax_id) doc.text(`USt-IdNr.: ${s.tax_id}`, 14, 32);

  // Divider
  doc.setDrawColor(200);
  doc.line(14, 36, 196, 36);

  // RECHNUNG title
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('RECHNUNG', 14, 48);

  // Invoice meta
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Rechnungsnr.: ${invoiceNumber || '—'}`, 130, 44);
  doc.text(`Datum: ${date || new Date().toLocaleDateString('de-DE')}`, 130, 50);

  // Customer address
  doc.setFontSize(10);
  doc.text('Rechnungsempfänger:', 14, 60);
  doc.setFont(undefined, 'bold');
  const customerName = customer ? `${customer.first_name} ${customer.last_name}` : '—';
  doc.text(customerName, 14, 66);
  doc.setFont(undefined, 'normal');
  if (customer?.address_street) doc.text(customer.address_street, 14, 71);
  if (customer?.address_zip || customer?.address_city) doc.text(`${customer.address_zip || ''} ${customer.address_city || ''}`, 14, 76);

  // Items table
  const vehicleName = vehicle ? vehicle.name : 'Dienstleistung';
  const itemDesc = vehicle ? `Gebrauchtfahrzeug: ${vehicleName}\nBaujahr: ${vehicle.year} | km-Stand: ${formatMileage(vehicle.mileage)}` : 'Dienstleistung';

  doc.autoTable({
    startY: 85,
    head: [['Pos.', 'Beschreibung', 'Betrag']],
    body: [
      ['1', itemDesc, formatCurrency(brutto)]
    ],
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [27, 58, 92], textColor: 255 },
    columnStyles: { 0: { cellWidth: 15 }, 2: { cellWidth: 35, halign: 'right' } },
    margin: { left: 14, right: 14 }
  });

  let y = doc.lastAutoTable.finalY + 8;

  // Totals
  doc.setFontSize(10);
  doc.text('Nettobetrag:', 130, y);
  doc.text(formatCurrency(netto), 182, y, { align: 'right' });
  y += 6;
  doc.text(`USt (${ustText}):`, 130, y);
  doc.text(formatCurrency(ust), 182, y, { align: 'right' });
  y += 2;
  doc.line(130, y, 182, y);
  y += 6;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Gesamtbetrag:', 130, y);
  doc.text(formatCurrency(brutto), 182, y, { align: 'right' });

  // Differential tax note
  if (taxType === 'differential') {
    y += 12;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Differenzbesteuerung nach § 25a UStG. Im Rechnungsbetrag ist keine Umsatzsteuer enthalten.', 14, y);
  }

  // Bank details
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  y = 250;
  doc.setDrawColor(200);
  doc.line(14, y - 4, 196, y - 4);
  doc.text('Bankverbindung:', 14, y);
  const bankInfo = [s.bank_name, s.bank_iban ? `IBAN: ${s.bank_iban}` : null, s.bank_bic ? `BIC: ${s.bank_bic}` : null].filter(Boolean).join(' | ');
  doc.text(bankInfo || 'Bitte überweisen Sie den Betrag auf unser Geschäftskonto.', 14, y + 5);

  // Footer
  doc.setFontSize(8);
  doc.text([s.company_name || 'AK Automobile', s.address, s.phone, s.email].filter(Boolean).join(' | '), 14, 285);

  doc.save(`Rechnung_${invoiceNumber || 'Entwurf'}.pdf`);
  toast.success('Rechnung als PDF erstellt');
}

async function generateContractPDF({ customer, vehicle, price }) {
  const settingsArr = await api.fetchAll('settings', { limit: 1 });
  const s = settingsArr[0] || {};
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('de-DE');

  // Header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(s.company_name || 'AK Automobile', 14, 20);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text([s.address || '', s.phone || '', s.email || ''].filter(Boolean).join(' | '), 14, 27);
  doc.line(14, 31, 196, 31);

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('KAUFVERTRAG', 105, 42, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('für ein gebrauchtes Kraftfahrzeug', 105, 49, { align: 'center' });

  let y = 60;

  // Seller
  doc.setFont(undefined, 'bold');
  doc.text('Verkäufer:', 14, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  doc.text(s.company_name || 'AK Automobile', 14, y);
  y += 5;
  doc.text(s.address || '', 14, y);
  y += 5;
  doc.text([s.phone || '', s.email || ''].filter(Boolean).join(' | '), 14, y);

  y += 12;

  // Buyer
  doc.setFont(undefined, 'bold');
  doc.text('Käufer:', 14, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  const buyerName = customer ? `${customer.first_name} ${customer.last_name}` : '______________________________';
  doc.text(buyerName, 14, y);
  y += 5;
  doc.text(customer?.address_street || '______________________________', 14, y);
  y += 5;
  doc.text(customer ? `${customer.address_zip || ''} ${customer.address_city || ''}` : '______________________________', 14, y);

  y += 12;

  // Vehicle data
  doc.setFont(undefined, 'bold');
  doc.text('Fahrzeugdaten:', 14, y);
  y += 2;

  const vehicleSpecs = vehicle ? [
    ['Marke / Modell', vehicle.name],
    ['Baujahr', String(vehicle.year)],
    ['Km-Stand', formatMileage(vehicle.mileage)],
    ['Kraftstoff', vehicle.fuel || '—'],
    ['Getriebe', vehicle.transmission || '—'],
    ['Fahrgestell-Nr. (VIN)', '______________________________']
  ] : [
    ['Marke / Modell', '______________________________'],
    ['Baujahr', '________'],
    ['Km-Stand', '________'],
    ['Fahrgestell-Nr. (VIN)', '______________________________']
  ];

  doc.autoTable({
    startY: y,
    body: vehicleSpecs,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 8;

  // Price
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  const priceText = price ? formatCurrency(price) : '________________ EUR';
  doc.text(`Kaufpreis: ${priceText}`, 14, y);

  y += 10;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  // Terms
  const terms = [
    '1. Das Fahrzeug wird wie besichtigt und Probe gefahren verkauft.',
    '2. Der Verkäufer sichert zu, dass das Fahrzeug sein Eigentum ist und frei von Rechten Dritter.',
    '3. Die Gewährleistung beträgt 12 Monate ab Übergabe (gem. § 476 BGB).',
    '4. Der Käufer bestätigt, das Fahrzeug besichtigt und eine Probefahrt durchgeführt zu haben.',
    '5. Die Übergabe erfolgt Zug um Zug gegen vollständige Kaufpreiszahlung.',
    '6. Der Verkäufer übergibt: Fahrzeugbrief, Fahrzeugschein, Serviceheft, 2 Schlüssel.',
    '7. Gerichtsstand ist der Sitz des Verkäufers.'
  ];

  terms.forEach(term => {
    doc.text(term, 14, y);
    y += 5;
  });

  y += 10;

  // Signatures
  doc.text(`Ort, Datum: Salzhemmendorf, ${today}`, 14, y);
  y += 20;

  doc.line(14, y, 85, y);
  doc.line(110, y, 196, y);
  y += 5;
  doc.text('Unterschrift Verkäufer', 14, y);
  doc.text('Unterschrift Käufer', 110, y);

  // Footer
  doc.setFontSize(8);
  doc.text([s.company_name || 'AK Automobile', s.address, s.phone].filter(Boolean).join(' | '), 14, 285);

  const safeName = vehicle ? vehicle.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Entwurf';
  doc.save(`Kaufvertrag_${safeName}.pdf`);
  toast.success('Kaufvertrag als PDF erstellt');
}
