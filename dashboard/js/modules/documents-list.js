/* ==========================================================================
   Documents Module
   ========================================================================== */

async function renderDocumentsList(container) {
  const documents = await api.fetchAll('documents', { orderBy: 'created_at', ascending: false });

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Dokumente</h1>
        <p class="page-subtitle">${documents.length} Dokumente</p>
      </div>
      <button class="btn btn-primary" id="uploadDocBtn">+ Dokument hochladen</button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Titel</th>
              <th>Typ</th>
              <th>Dateiname</th>
              <th>Größe</th>
              <th>Erstellt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            ${documents.length === 0 ? '<tr><td colspan="6" class="text-center text-muted">Keine Dokumente vorhanden</td></tr>' :
              documents.map(d => {
                const typeLabels = { contract: 'Kaufvertrag', handover_protocol: 'Übergabe', invoice: 'Rechnung', other: 'Sonstiges' };
                const sizeKb = d.file_size ? (d.file_size / 1024).toFixed(0) + ' KB' : '—';
                return `
                  <tr>
                    <td><strong>${escapeHtml(d.title)}</strong></td>
                    <td>${typeLabels[d.type] || d.type}</td>
                    <td>${escapeHtml(d.file_name)}</td>
                    <td>${sizeKb}</td>
                    <td>${formatDate(d.created_at)}</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon btn-download" data-path="${d.storage_path}" title="Herunterladen">📥</button>
                        <button class="btn-icon btn-delete" data-id="${d.id}" data-path="${d.storage_path}" title="Löschen">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Upload button
  container.querySelector('#uploadDocBtn').addEventListener('click', () => {
    modal.open('Dokument hochladen', `
      <form id="docUploadForm">
        <div class="form-group">
          <label class="form-label">Titel *</label>
          <input type="text" name="title" class="form-input" required placeholder="z.B. Kaufvertrag VW Golf">
        </div>
        <div class="form-group">
          <label class="form-label">Typ</label>
          <select name="type" class="form-input">
            <option value="contract">Kaufvertrag</option>
            <option value="handover_protocol">Übergabeprotokoll</option>
            <option value="invoice">Rechnung</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Datei *</label>
          <input type="file" name="file" class="form-input" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Hochladen</button>
      </form>
    `);

    document.getElementById('docUploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const file = form.file.files[0];
      if (!file) return;

      const storagePath = `documents/${Date.now()}_${file.name}`;

      try {
        const { error: uploadError } = await supabaseClient.storage.from('documents').upload(storagePath, file);
        if (uploadError) throw uploadError;

        await api.insert('documents', {
          title: form.title.value.trim(),
          type: form.type.value,
          storage_path: storagePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        });

        modal.close();
        toast.success('Dokument hochgeladen');
        renderDocumentsList(container);
      } catch (err) { toast.error('Upload fehlgeschlagen: ' + err.message); }
    });
  });

  // Download
  container.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { data } = await supabaseClient.storage.from('documents').createSignedUrl(btn.dataset.path, 60);
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    });
  });

  // Delete
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await modal.confirm('Dokument löschen', 'Möchten Sie dieses Dokument löschen?')) {
        try {
          await supabaseClient.storage.from('documents').remove([btn.dataset.path]);
          await api.remove('documents', btn.dataset.id);
          toast.success('Dokument gelöscht');
          renderDocumentsList(container);
        } catch (err) { toast.error('Fehler: ' + err.message); }
      }
    });
  });
}
