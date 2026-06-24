/**
 * PREMIER COFFEE — premier.js
 * Premium interactions: loading, scroll reveal, parallax,
 * counter animation, lightbox, nav, form, micro-interactions
 */
'use strict';
/* ═══════════════════════════════════════════════
 1. LOADING SCREEN
═══════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  const hide = () => {
    loader.classList.add('loaded');
    document.body.style.overflow = '';
    setTimeout(triggerHeroReveal, 100);
  };
  document.body.style.overflow = 'hidden';
  if (document.readyState === 'complete') {
    setTimeout(hide, 1900);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 1900), { once: true });
    setTimeout(hide, 3500);
  }
}
function triggerHeroReveal() {
  const heroItems = document.querySelectorAll('.hero .reveal-up, .hero .reveal-left, .hero .reveal-right, .hero .reveal-scale');
  heroItems.forEach(el => el.classList.add('revealed'));
}
/* ═══════════════════════════════════════════════
 2. STICKY NAVIGATION
═══════════════════════════════════════════════ */
function initNav() {
  const header = document.getElementById('site-header');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-menu');
  if (!header) return;
  let lastScroll = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  const highlightNav = () => {
    const y = window.scrollY + 100;
    sections.forEach(sec => {
      if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${sec.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
}
/* ═══════════════════════════════════════════════
 3. SCROLL REVEAL (Intersection Observer)
═══════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
  if (!els.length) return;
  const nonHeroEls = Array.from(els).filter(el => !el.closest('.hero'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });
  nonHeroEls.forEach(el => observer.observe(el));
}
/* ═══════════════════════════════════════════════
 4. PARALLAX EFFECT
═══════════════════════════════════════════════ */
function initParallax() {
  const parallaxBg = document.querySelector('.why-parallax-bg');
  if (!parallaxBg) return;
  const section = parallaxBg.closest('.why-section');
  if (!section) return;
  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) return;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const shift = (progress - 0.5) * 120;
    parallaxBg.style.transform = `translateY(${shift}px)`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
/* ═══════════════════════════════════════════════
 5. COUNTER ANIMATION
═══════════════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOutQuart(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}
/* ═══════════════════════════════════════════════
 6. GALLERY LIGHTBOX
═══════════════════════════════════════════════ */
function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const backdrop = document.getElementById('lightbox-backdrop');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  if (!lightbox || !items.length) return;
  let currentIndex = 0;
  const images = Array.from(items).map(el => ({
    src: el.dataset.src || el.querySelector('img')?.src || '',
    caption: el.dataset.caption || el.querySelector('img')?.alt || ''
  }));
  const open = (index) => {
    currentIndex = (index + images.length) % images.length;
    const { src, caption: cap } = images[currentIndex];
    img.src = src;
    img.alt = cap;
    caption.textContent = cap;
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };
  const close = () => {
    lightbox.classList.remove('active');
    backdrop.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    img.src = '';
    items[currentIndex]?.focus();
  };
  const prev = () => open(currentIndex - 1);
  const next = () => open(currentIndex + 1);
  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
}
/* ═══════════════════════════════════════════════
 7. CONTACT FORM
═══════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('form-success');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();
    if (!name || !email || !msg) {
      if (success) {
        success.textContent = '⚠ Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը:';
        success.style.color = '#c0392b';
      }
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      if (success) {
        success.textContent = '⚠ Մուտքագրեք վավեր էլ. փոստ:';
        success.style.color = '#c0392b';
      }
      return;
    }
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Ուղարկվում...';
      submitBtn.disabled = true;
    }
    setTimeout(() => {
      if (success) {
        success.textContent = '✓ Ձեր հաղորդագրությունն ուղարկվեց։ Շուտով կպատասխանենք։';
        success.style.color = '#2d7a3c';
      }
      form.reset();
      if (submitBtn) {
        submitBtn.textContent = 'Ուղարկել';
        submitBtn.disabled = false;
      }
    }, 1200);
  });
}
/* ═══════════════════════════════════════════════
 8. AVAGYAN VIDEO PLAY BUTTON
═══════════════════════════════════════════════ */
function initAvagyanVideo() {
  const wrap = document.querySelector('.avagyan-video-full');
  const video = wrap?.querySelector('.avagyan-fullvideo');
  const playBtn = wrap?.querySelector('.avagyan-play-btn');
  if (!video || !playBtn) return;
  playBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      playBtn.style.opacity = '0';
      playBtn.style.pointerEvents = 'none';
    }
  });
  video.addEventListener('pause', () => {
    playBtn.style.opacity = '0.75';
    playBtn.style.pointerEvents = 'all';
  });
  video.addEventListener('ended', () => {
    playBtn.style.opacity = '0.75';
    playBtn.style.pointerEvents = 'all';
  });
}
/* ═══════════════════════════════════════════════
 9. SMOOTH SCROLL
═══════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('site-header')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
/* ═══════════════════════════════════════════════
 10. LAZY LOADING
═══════════════════════════════════════════════ */
function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return;
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  if (!lazyImgs.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  lazyImgs.forEach(img => observer.observe(img));
}
/* ═══════════════════════════════════════════════
 11. PRODUCT CARD MICRO-INTERACTIONS
═══════════════════════════════════════════════ */
function initProductMicroInteractions() {
  const cards = document.querySelectorAll('.product-card, .avagyan-product-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      card.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}
/* ═══════════════════════════════════════════════
 12. GALLERY VIDEO
═══════════════════════════════════════════════ */
function initGalleryVideoAutoPlay() {
  const video = document.querySelector('.gallery-video');
  if (!video) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.preload = 'metadata';
      }
    });
  }, { threshold: 0.3 });
  observer.observe(video);
}
/* ═══════════════════════════════════════════════
 13. HERO VIDEO FALLBACK
═══════════════════════════════════════════════ */
function initHeroVideo() {
  const video = document.querySelector('.hero-video');
  if (!video) return;
  video.addEventListener('error', () => {
    video.style.display = 'none';
    const hero = document.querySelector('.hero-media');
    if (hero) {
      hero.style.backgroundImage = 'url("img_all_products.jpg")';
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
    }
  });
}
/* ═══════════════════════════════════════════════
 14. NAV BACKGROUND OPACITY
═══════════════════════════════════════════════ */
function initNavTransparency() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => {
    const y = window.scrollY;
    if (y < 60) {
      header.style.background = `rgba(250, 246, 239, 0)`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}
/* ═══════════════════════════════════════════════
 15. INIT ALL
═══════════════════════════════════════════════ */
function init() {
  initLoader();
  initNav();
  initSmoothScroll();
  initScrollReveal();
  initParallax();
  initCounters();
  initLightbox();
  initContactForm();
  initAvagyanVideo();
  initLazyLoad();
  initProductMicroInteractions();
  initGalleryVideoAutoPlay();
  initHeroVideo();
  initNavTransparency();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
