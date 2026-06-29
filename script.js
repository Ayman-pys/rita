/* ============================================================
   RITAL OFFICE — script.js
   RTL Arabic Educational Services Website
   Created by KIN
   ============================================================ */

'use strict';

/* ── 1. LOADER ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  // Minimum display time for the loader animation (1.8s matches CSS loadBar)
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
  }, 1900);
});

document.body.classList.add('loading');


/* ── 2. THEME (Dark / Light) ── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const root        = document.documentElement;

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('rital-theme', theme);
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
};

// Load saved preference or respect OS preference
const savedTheme = localStorage.getItem('rital-theme')
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// Sync when OS preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('rital-theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});


/* ── 3. NAVBAR — Scroll & Sticky ── */
const navbar = document.getElementById('navbar');

const handleNavScroll = () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 50);
};

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run on init


/* ── 4. MOBILE MENU ── */
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'فتح القائمة');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ── 5. ACTIVE NAV LINK (IntersectionObserver) ── */
const sections     = document.querySelectorAll('main section[id], section[id]');
const allNavLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      allNavLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
        link.setAttribute('aria-current', active ? 'page' : 'false');
      });
    }
  });
}, {
  rootMargin: `-${parseInt(getComputedStyle(root).getPropertyValue('--nav-h')) || 72}px 0px -40% 0px`,
  threshold: 0
});

sections.forEach(s => sectionObserver.observe(s));


/* ── 6. SCROLL PROGRESS BAR ── */
const scrollProgress = document.getElementById('scrollProgress');

const updateScrollProgress = () => {
  if (!scrollProgress) return;
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
  scrollProgress.setAttribute('aria-valuenow', Math.round(progress));
};

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();


/* ── 7. REVEAL ON SCROLL ── */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children within same parent
      const siblings = entry.target.parentElement
        ? [...entry.target.parentElement.querySelectorAll('.reveal')]
        : [];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));


/* ── 8. COUNTER ANIMATION ── */
const counters = document.querySelectorAll('.stat-num[data-target]');

const animateCounter = (el) => {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const suffix   = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const step     = 16; // ~60fps
  const steps    = duration / step;
  let current    = 0;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    const progress = easeOut(frame / steps);
    current = Math.round(progress * target);
    el.textContent = current + suffix;
    if (frame >= steps) {
      el.textContent = target + suffix;
      clearInterval(timer);
    }
  }, step);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));


/* ── 9. TESTIMONIAL SLIDER ── */
const slides      = document.querySelectorAll('.slide');
const dotsWrap    = document.getElementById('sliderDots');
const prevBtn     = document.getElementById('prevSlide');
const nextBtn     = document.getElementById('nextSlide');

let currentSlide  = 0;
let autoSlideTimer;

const buildDots = () => {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `شهادة ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
};

const goToSlide = (index) => {
  slides[currentSlide].classList.remove('active');
  dotsWrap?.querySelectorAll('.dot')[currentSlide]?.classList.remove('active');
  dotsWrap?.querySelectorAll('.dot')[currentSlide]?.setAttribute('aria-selected', 'false');

  currentSlide = (index + slides.length) % slides.length;

  slides[currentSlide].classList.add('active');
  const activeDot = dotsWrap?.querySelectorAll('.dot')[currentSlide];
  activeDot?.classList.add('active');
  activeDot?.setAttribute('aria-selected', 'true');

  resetAutoSlide();
};

const resetAutoSlide = () => {
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
};

if (slides.length) {
  buildDots();
  prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Keyboard support
  document.getElementById('testimonialSlider')?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   goToSlide(currentSlide - 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown')  goToSlide(currentSlide + 1);
  });

  // Touch / swipe
  let touchStartX = 0;
  const slider = document.getElementById('testimonialSlider');
  slider?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider?.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goToSlide(dx > 0 ? currentSlide - 1 : currentSlide + 1);
  });

  resetAutoSlide();
}


/* ── 10. GALLERY LIGHTBOX ── */
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox     = document.getElementById('lightbox');
const lbImg        = document.getElementById('lbImg');
const lbCaption    = document.getElementById('lbCaption');
const lbClose      = document.getElementById('lbClose');
const lbPrev       = document.getElementById('lbPrev');
const lbNext       = document.getElementById('lbNext');

let lbCurrentIndex = 0;
const galleryData  = [...galleryItems].map(item => ({
  src:     item.getAttribute('data-src') || item.querySelector('img')?.src || '',
  caption: item.getAttribute('data-caption') || item.querySelector('img')?.alt || ''
}));

const openLightbox = (index) => {
  if (!lightbox || !galleryData.length) return;
  lbCurrentIndex = index;
  lbImg.src      = galleryData[index].src;
  lbImg.alt      = galleryData[index].caption;
  lbCaption.textContent = galleryData[index].caption;
  lightbox.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  lbClose?.focus();
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.setAttribute('hidden', '');
  document.body.style.overflow = '';
  galleryItems[lbCurrentIndex]?.focus();
};

const lbNavigate = (dir) => {
  lbCurrentIndex = (lbCurrentIndex + dir + galleryData.length) % galleryData.length;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src     = galleryData[lbCurrentIndex].src;
    lbImg.alt     = galleryData[lbCurrentIndex].caption;
    lbCaption.textContent = galleryData[lbCurrentIndex].caption;
    lbImg.style.opacity = '1';
  }, 150);
};

galleryItems.forEach((item, i) => {
  const trigger = () => openLightbox(i);
  item.addEventListener('click', trigger);
  item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); } });
});

lbClose?.addEventListener('click', closeLightbox);
lbPrev?.addEventListener('click', () => lbNavigate(1));
lbNext?.addEventListener('click', () => lbNavigate(-1));

lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox || lightbox.hasAttribute('hidden')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  lbNavigate(1);
  if (e.key === 'ArrowLeft')   lbNavigate(-1);
});

// Touch swipe for lightbox
let lbTouchStartX = 0;
lightbox?.addEventListener('touchstart', (e) => { lbTouchStartX = e.touches[0].clientX; }, { passive: true });
lightbox?.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - lbTouchStartX;
  if (Math.abs(dx) > 50) lbNavigate(dx > 0 ? 1 : -1);
});


/* ── 11. FAQ ACCORDION ── */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-q');
  const answer   = item.querySelector('.faq-a');
  if (!question || !answer) return;

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all others
    faqItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        const otherA = other.querySelector('.faq-a');
        if (otherA) otherA.setAttribute('hidden', '');
      }
    });

    // Toggle current
    item.classList.toggle('open', !isOpen);
    question.setAttribute('aria-expanded', !isOpen);
    if (!isOpen) {
      answer.removeAttribute('hidden');
      answer.focus?.();
    } else {
      answer.setAttribute('hidden', '');
    }
  });

  // Keyboard: Enter / Space already triggers click on <button>
});


/* ── 12. CONTACT FORM VALIDATION ── */
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');

const validators = {
  name: (val) => val.trim().length >= 2 ? '' : 'الرجاء إدخال الاسم الكامل (حرفان على الأقل)',
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'الرجاء إدخال بريد إلكتروني صحيح',
  phone: (val) => val === '' || /^[\+\d\s\-\(\)]{7,20}$/.test(val.trim()) ? '' : 'رقم الهاتف غير صحيح',
  message: (val) => val.trim().length >= 10 ? '' : 'الرسالة يجب أن تحتوي على 10 أحرف على الأقل'
};

const fieldMap = {
  fname:    { key: 'name',    label: 'الاسم' },
  femail:   { key: 'email',   label: 'البريد' },
  fphone:   { key: 'phone',   label: 'الهاتف' },
  fmessage: { key: 'message', label: 'الرسالة' }
};

const showFieldError = (input, msg) => {
  input.classList.toggle('error', !!msg);
  const errSpan = input.closest('.form-group')?.querySelector('.field-err');
  if (errSpan) errSpan.textContent = msg;
};

// Real-time validation on blur
Object.entries(fieldMap).forEach(([id, { key }]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    const err = validators[key]?.(el.value) ?? '';
    showFieldError(el, err);
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) {
      const err = validators[key]?.(el.value) ?? '';
      showFieldError(el, err);
    }
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    Object.entries(fieldMap).forEach(([id, { key }]) => {
      const el  = document.getElementById(id);
      if (!el) return;
      const err = validators[key]?.(el.value) ?? '';
      showFieldError(el, err);
      if (err) valid = false;
    });

    if (!valid) {
      // Focus first error field
      contactForm.querySelector('.error')?.focus();
      return;
    }

    // Simulate form submission (replace with real backend / API call)
    const submitBtn = contactForm.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ الإرسال…';
    }

    setTimeout(() => {
      contactForm.reset();
      contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      contactForm.querySelectorAll('.field-err').forEach(el => el.textContent = '');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> أرسل الرسالة';
      }
      if (formSuccess) {
        formSuccess.removeAttribute('hidden');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => formSuccess.setAttribute('hidden', ''), 6000);
      }
    }, 1500);
  });
}


/* ── 13. BACK TO TOP ── */
const backToTop = document.getElementById('backToTop');

const toggleBackToTop = () => {
  if (!backToTop) return;
  if (window.scrollY > 500) {
    backToTop.removeAttribute('hidden');
  } else {
    backToTop.setAttribute('hidden', '');
  }
};

window.addEventListener('scroll', toggleBackToTop, { passive: true });
toggleBackToTop();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ── 14. SMOOTH SCROLL (for browsers that don't support CSS scroll-behavior) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH   = parseInt(getComputedStyle(root).getPropertyValue('--nav-h')) || 72;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── 15. FOOTER YEAR ── */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();


/* ── 16. SKIP LINK (Accessibility) ── */
// Dynamically inject skip link if not present in HTML
if (!document.querySelector('.skip-link')) {
  const skip = document.createElement('a');
  skip.className   = 'skip-link';
  skip.href        = '#main-content';
  skip.textContent = 'تخطى إلى المحتوى الرئيسي';
  document.body.prepend(skip);
}

// Ensure <main> has an id for skip link
const mainEl = document.querySelector('main');
if (mainEl && !mainEl.id) mainEl.id = 'main-content';


/* ── 17. HERO PARALLAX (subtle, respects reduced motion) ── */
const heroImg = document.querySelector('.hero-img');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroImg && !prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroImg.style.transform = `translateY(${scrollY * 0.25}px)`;
    }
  }, { passive: true });
}


/* ── 18. LAZY IMAGE OBSERVER (fallback for browsers without native lazy-load) ── */
if (!('loading' in HTMLImageElement.prototype)) {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src   = img.dataset.src || img.src;
        lazyObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => lazyObserver.observe(img));
}


/* ── 19. SERVICE CARD KEYBOARD NAVIGATION ── */
document.querySelectorAll('.service-card[tabindex="0"]').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const link = card.querySelector('.sc-link');
      if (link) link.click();
    }
  });
});


/* ── 20. COUNTRY CARD KEYBOARD NAVIGATION ── */
document.querySelectorAll('.country-card[tabindex="0"]').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.querySelector('.btn')?.click();
    }
  });
});


/* ── 21. STAT CARD FOCUS (for keyboard users) ── */
document.querySelectorAll('.stat-card[tabindex="0"]').forEach(card => {
  card.addEventListener('keydown', (e) => {
    // Stat cards are informational; Enter adds a subtle highlight
    if (e.key === 'Enter') {
      card.style.transform = 'translateY(-8px)';
      setTimeout(() => { card.style.transform = ''; }, 600);
    }
  });
});


/* ── INIT COMPLETE ── */
console.log('%c ريتال أوفيس — Rital Office ', 'background:#0F4C81;color:#F4B400;font-weight:bold;font-size:14px;padding:6px 12px;border-radius:4px;');
console.log('%c Created by KIN ', 'background:#1E88E5;color:#fff;font-size:11px;padding:3px 8px;border-radius:4px;');
