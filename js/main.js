/* ==========================================================================
   AK Automobile — Main Interaction System
   Clean, professional interactions for a used car dealer
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', async () => {
  // Try loading vehicles from Supabase, fallback to static data
  if (typeof loadVehiclesFromSupabase === 'function') {
    await loadVehiclesFromSupabase();
  }

  // Cards MUST be rendered first — other inits depend on them
  initVehicleCards();
  initNavigation();
  initScrollAnimations();
  initHeroCounters();
  initVehicleFilters();
  initContactForm();
  initSmoothScroll();
  initImageLoadStates();
  initVehicleModal();
  initI18n();
  initCookieConsent();
  initBackToTop();
  initMobileCTA();
});

/* ---------- Vehicle Card Rendering ---------- */
function initVehicleCards() {
  const grid = document.getElementById('vehiclesGrid');
  const vehicleSelect = document.getElementById('vehicle');

  if (grid && typeof vehicleData !== 'undefined') {
    vehicleData.forEach(v => {
      const badgeHtml = v.badge ? `<span class="vehicle-badge">${v.badge}</span>` : '';
      const card = document.createElement('div');
      card.className = 'vehicle-card fade-up';
      card.setAttribute('data-vehicle-id', v.id);
      card.setAttribute('data-category', v.category);

      card.innerHTML = `
        <div class="vehicle-card-image">
          ${badgeHtml}
          <img src="${v.images[0]}"
               alt="${v.name}"
               width="400" height="267"
               loading="lazy">
        </div>
        <div class="vehicle-card-body">
          <div class="vehicle-card-brand">${v.brand}</div>
          <h3 class="vehicle-card-name">${v.model}</h3>
          <div class="vehicle-card-specs">
            <span class="vehicle-card-spec">${v.year}</span>
            <span class="vehicle-card-spec-dot">&middot;</span>
            <span class="vehicle-card-spec">${v.mileage}</span>
            <span class="vehicle-card-spec-dot">&middot;</span>
            <span class="vehicle-card-spec">${v.specs.hp} PS</span>
            <span class="vehicle-card-spec-dot">&middot;</span>
            <span class="vehicle-card-spec">${v.fuel || v.specs.fuel}</span>
          </div>
          <div class="vehicle-card-footer">
            <span class="vehicle-card-price">${formatPrice(v.price)}</span>
            <span class="vehicle-card-btn">Details &rarr;</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Populate vehicle select in contact form
  if (vehicleSelect && typeof vehicleData !== 'undefined') {
    vehicleData.forEach(v => {
      const option = document.createElement('option');
      option.value = v.id;
      option.textContent = `${v.name} — ${formatPrice(v.price)}`;
      vehicleSelect.appendChild(option);
    });
  }
}

/* ---------- Navigation ---------- */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 60) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Active link tracking
  const sections = document.querySelectorAll('section[id]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sections.forEach(section => sectionObserver.observe(section));

  // Close mobile nav on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks && navLinks.classList.contains('open')) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

/* ---------- Scroll Animations ---------- */
function initScrollAnimations() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    return;
  }

  const fadeElements = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = parent ? parent.querySelectorAll('.fade-up') : [];
        let delay = 0;

        siblings.forEach((sibling, i) => {
          if (sibling === entry.target) {
            delay = i * 80;
          }
        });

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  fadeElements.forEach(el => observer.observe(el));
}

/* ---------- Image Load States ---------- */
function initImageLoadStates() {
  const images = document.querySelectorAll('.vehicle-card-image img, .hero-image img, .about-image img');

  images.forEach(img => {
    if (img.complete && img.naturalHeight > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });
}

/* ---------- Hero Counter Animation ---------- */
function initHeroCounters() {
  const counters = document.querySelectorAll('.hero-stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        const suffix = entry.target.dataset.suffix || '';
        animateCounter(entry.target, target, suffix);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, suffix) {
  if (prefersReducedMotion) {
    element.textContent = target + suffix;
    return;
  }

  const duration = 1500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(eased * target) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ---------- Vehicle Filters ---------- */
function initVehicleFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const grid = document.getElementById('vehiclesGrid');

  if (!filterBtns.length || !grid) return;

  // Create empty state element
  const emptyState = document.createElement('div');
  emptyState.className = 'vehicles-empty';
  emptyState.style.display = 'none';
  const lang = document.documentElement.getAttribute('lang') || 'de';
  emptyState.innerHTML = `<p>${lang === 'de' ? 'Keine Fahrzeuge in dieser Kategorie gefunden.' : 'No vehicles found in this category.'}</p>`;
  grid.parentElement.appendChild(emptyState);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      const cards = grid.querySelectorAll('.vehicle-card');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      let visibleCount = 0;

      cards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          visibleCount++;
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          setTimeout(() => card.classList.add('hidden'), 300);
        }
      });

      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    });
  });
}

/* ---------- Contact Form ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const lang = document.documentElement.getAttribute('lang') || 'de';

    if (!data.name || !data.email) {
      const emptyField = !data.name ? form.querySelector('#name') : form.querySelector('#email');
      highlightField(emptyField);
      return;
    }

    if (!isValidEmail(data.email)) {
      highlightField(form.querySelector('#email'));
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = lang === 'de' ? 'Wird gesendet...' : 'Sending...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    try {
      // Try Supabase first, fallback to Formspree
      let success = false;

      if (typeof window.supabase !== 'undefined') {
        const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { error } = await sb.from('inquiries').insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject || null,
          vehicle_id: (data.vehicle && data.vehicle !== 'other' && data.vehicle !== '') ? data.vehicle : null,
          message: data.message || null
        });
        success = !error;
      }

      if (!success) {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        success = response.ok;
      }

      if (success) {
        submitBtn.textContent = lang === 'de' ? 'Nachricht gesendet!' : 'Message Sent!';
        submitBtn.style.background = 'var(--green)';
        form.reset();
      } else {
        submitBtn.textContent = lang === 'de' ? 'Fehler — erneut versuchen' : 'Error — try again';
        submitBtn.style.background = '#c0392b';
      }
    } catch {
      submitBtn.textContent = lang === 'de' ? 'Nachricht gesendet!' : 'Message Sent!';
      submitBtn.style.background = 'var(--green)';
      form.reset();
    }

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.background = '';
    }, 3000);
  });

  // Focus effects
  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function highlightField(field) {
  if (!field) return;
  field.style.borderColor = 'var(--accent)';
  field.focus();
  setTimeout(() => {
    field.style.borderColor = '';
  }, 2000);
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      const offset = 80;
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    });
  });
}

/* ---------- Back to Top Button ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Mobile CTA Bar ---------- */
function initMobileCTA() {
  const bar = document.getElementById('mobileCTA');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  });
}
