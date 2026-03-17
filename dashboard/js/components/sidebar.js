/* ==========================================================================
   Sidebar Navigation
   ========================================================================== */

function renderSidebar(container) {
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/vehicles', icon: '🚗', label: 'Fahrzeuge' },
    { path: '/customers', icon: '👥', label: 'Kunden' },
    { path: '/inquiries', icon: '📧', label: 'Anfragen' },
    { path: '/finance', icon: '💰', label: 'Finanzen' },
    { path: '/documents', icon: '📄', label: 'Dokumente' },
    { path: '/appointments', icon: '📅', label: 'Termine' },
    { divider: true },
    { path: '/settings', icon: '⚙️', label: 'Einstellungen' }
  ];

  const currentHash = window.location.hash.slice(1) || '/dashboard';

  container.innerHTML = `
    <div class="sidebar-header">
      <img src="../favicon.svg" alt="" width="28" height="28">
      <span class="sidebar-brand">AK Automobile</span>
    </div>
    <nav class="sidebar-nav">
      ${menuItems.map(item => {
        if (item.divider) return '<div class="sidebar-divider"></div>';
        const active = currentHash === item.path || currentHash.startsWith(item.path + '/') ? ' active' : '';
        return `<a href="#${item.path}" class="sidebar-link${active}">
          <span class="sidebar-icon">${item.icon}</span>
          <span class="sidebar-label">${item.label}</span>
        </a>`;
      }).join('')}
    </nav>
    <div class="sidebar-footer">
      <button class="sidebar-logout" id="logoutBtn">
        <span class="sidebar-icon">🚪</span>
        <span class="sidebar-label">Abmelden</span>
      </button>
    </div>
  `;

  container.querySelector('#logoutBtn').addEventListener('click', () => logout());
}
