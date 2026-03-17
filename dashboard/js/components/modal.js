/* ==========================================================================
   Reusable Modal Component
   ========================================================================== */

const modal = {
  overlay: null,

  open(title, contentHtml, { wide = false, onClose = null } = {}) {
    this.close();

    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="dash-modal ${wide ? 'dash-modal-wide' : ''}">
        <div class="dash-modal-header">
          <h2 class="dash-modal-title">${title}</h2>
          <button class="dash-modal-close" aria-label="Schließen">&times;</button>
        </div>
        <div class="dash-modal-body">${contentHtml}</div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => this.overlay.classList.add('visible'));

    this.overlay.querySelector('.dash-modal-close').addEventListener('click', () => this.close(onClose));
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close(onClose);
    });

    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.close(onClose);
    });
  },

  close(callback) {
    if (!this.overlay) return;
    this.overlay.classList.remove('visible');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._escHandler);
    setTimeout(() => {
      this.overlay?.remove();
      this.overlay = null;
      if (callback) callback();
    }, 200);
  },

  confirm(title, message) {
    return new Promise((resolve) => {
      this.open(title, `
        <p style="margin-bottom: 24px;">${message}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button class="btn btn-outline" id="modalCancel">Abbrechen</button>
          <button class="btn btn-danger" id="modalConfirm">Bestätigen</button>
        </div>
      `);
      this.overlay.querySelector('#modalConfirm').addEventListener('click', () => {
        this.close();
        resolve(true);
      });
      this.overlay.querySelector('#modalCancel').addEventListener('click', () => {
        this.close();
        resolve(false);
      });
    });
  }
};
