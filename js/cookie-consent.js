/* ==========================================================================
   AK Automobile — DSGVO Cookie Consent Banner
   ========================================================================== */

function initCookieConsent() {
  const consent = localStorage.getItem('ak-cookie-consent');
  if (consent) return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');

  function render() {
    const lang = document.documentElement.getAttribute('lang') || 'de';
    const texts = {
      en: {
        text: 'This website uses cookies and local storage to enhance your experience. We store your language preference and cookie consent choice.',
        accept: 'Accept All',
        essential: 'Essential Only',
        privacy: 'Privacy Policy'
      },
      de: {
        text: 'Diese Website verwendet Cookies und lokalen Speicher, um Ihr Erlebnis zu verbessern. Wir speichern Ihre Spracheinstellung und Cookie-Zustimmung.',
        accept: 'Alle akzeptieren',
        essential: 'Nur Essentiell',
        privacy: 'Datenschutz'
      }
    };

    const t = texts[lang] || texts.de;

    banner.innerHTML = `
      <div class="cookie-content">
        <p class="cookie-text">${t.text}</p>
        <div class="cookie-actions">
          <button class="btn btn-primary cookie-btn" id="cookieAccept">${t.accept}</button>
          <button class="btn btn-outline cookie-btn" id="cookieEssential">${t.essential}</button>
        </div>
      </div>
    `;
  }

  render();
  document.body.appendChild(banner);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      banner.classList.add('visible');
    });
  });

  banner.addEventListener('click', (e) => {
    if (e.target.id === 'cookieAccept') {
      localStorage.setItem('ak-cookie-consent', 'all');
      closeBanner();
    } else if (e.target.id === 'cookieEssential') {
      localStorage.setItem('ak-cookie-consent', 'essential');
      closeBanner();
    }
  });

  function closeBanner() {
    banner.classList.remove('visible');
    setTimeout(() => {
      banner.remove();
    }, 500);
  }

  const observer = new MutationObserver(() => {
    render();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}
