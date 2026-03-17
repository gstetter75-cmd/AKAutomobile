/* ==========================================================================
   AK Automobile Dashboard — Hash-based SPA Router
   ========================================================================== */

const router = {
  routes: {},
  currentRoute: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  async navigate(path) {
    window.location.hash = path;
  },

  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/dashboard';
    const content = document.getElementById('appContent');
    if (!content) return;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + hash);
    });

    // Find matching route
    const handler = this.routes[hash];
    if (handler) {
      this.currentRoute = hash;
      content.innerHTML = '<div class="loading-spinner"></div>';
      try {
        await handler(content);
      } catch (err) {
        content.innerHTML = `<div class="error-state"><h2>Fehler</h2><p>${err.message}</p></div>`;
      }
    } else {
      content.innerHTML = '<div class="error-state"><h2>Seite nicht gefunden</h2><p>Die angeforderte Seite existiert nicht.</p></div>';
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
};
