/* ============================================================
   INFLATED DREAMS — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- Utility ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     NAVIGATION — scroll behaviour & mobile menu
     ================================================================ */
  const header      = $('#site-header');
  const hamburger   = $('.nav-hamburger');
  const mobileMenu  = $('#mobile-menu');
  const menuClose   = $('.mobile-menu-close');
  const mobileLinks = $$('.mobile-nav-link');

  let lastScrollY = 0;

  function handleHeaderScroll() {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
  }

  function openMobileMenu() {
    mobileMenu.scrollTop = 0;
    mobileMenu.classList.add('is-open');
    mobileMenu.removeAttribute('aria-hidden');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    menuClose.focus();
    trapFocus(mobileMenu);
  }

  function closeMobileMenu() {
    releaseFocus(mobileMenu);
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    hamburger.focus({ preventScroll: true });
  }

  hamburger.addEventListener('click', openMobileMenu);
  menuClose.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  mobileMenu.addEventListener('click', e => {
    const isContent = e.target.closest('.mobile-nav-links, .mobile-menu-close, .mobile-social');
    if (!isContent) closeMobileMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ================================================================
     FOCUS TRAP (for mobile menu & lightbox)
     ================================================================ */
  function trapFocus(container) {
    const focusable = $$('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(el => !el.disabled && el.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }

    container._trapHandler = onKeydown;
    container.addEventListener('keydown', onKeydown);
  }

  function releaseFocus(container) {
    if (container._trapHandler) {
      container.removeEventListener('keydown', container._trapHandler);
      delete container._trapHandler;
    }
  }

  /* ================================================================
     SMOOTH SCROLL — anchor links
     ================================================================ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ================================================================
     PARALLAX — hero glow layer on scroll + cursor balloon parallax
     ================================================================ */
  const parallaxLayer = $('.hero-parallax-layer');

  if (parallaxLayer && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxLayer.style.transform = `translateY(${scrollY * 0.35}px)`;
    }, { passive: true });
  }

  const balloonsContainer = $('.balloons-container');

  if (balloonsContainer && !prefersReducedMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let ticking = false;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouch) {
      window.addEventListener('mousemove', e => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = ((e.clientX - cx) / cx) * -12;
        targetY = ((e.clientY - cy) / cy) * -8;

        if (!ticking) {
          ticking = true;
          requestAnimationFrame(function lerp() {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            balloonsContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;

            if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
              requestAnimationFrame(lerp);
            } else {
              ticking = false;
            }
          });
        }
      }, { passive: true });
    }
  }

  /* ================================================================
     SCROLL ANIMATIONS — IntersectionObserver
     ================================================================ */
  const animatables = $$('.animate-on-scroll');

  if (animatables.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    animatables.forEach(el => observer.observe(el));
  }

  /* ================================================================
     GALLERY LIGHTBOX
     ================================================================ */
  const lightbox        = $('#lightbox');
  const lightboxClose   = $('#lightbox-close');
  const lightboxContent = $('#lightbox-content');
  const galleryItems    = $$('.gallery-item');

  const galleryData = galleryItems.map((item, i) => ({
    index: i,
    type: item.dataset.type || 'image',
    label: item.getAttribute('aria-label') || `Gallery item ${i + 1}`,
    src: item.dataset.src || '',
  }));

  function openLightbox(index) {
    const item = galleryData[index];
    lightboxContent.innerHTML = '';

    if (item.type === 'video') {
      const videoEl = document.createElement('video');
      videoEl.controls = true;
      videoEl.autoplay = !prefersReducedMotion;
      videoEl.setAttribute('aria-label', item.label);
      videoEl.style.cssText = 'max-width:min(90vw,900px);max-height:80vh;border-radius:8px;display:block;background:#000;';
      const source = document.createElement('source');
      source.src = item.src;
      source.type = 'video/mp4';
      videoEl.appendChild(source);
      lightboxContent.appendChild(videoEl);
    } else {
      const imgEl = document.createElement('img');
      imgEl.src = item.src;
      imgEl.alt = item.label;
      imgEl.style.cssText = 'max-width:min(90vw,900px);max-height:80vh;object-fit:contain;border-radius:8px;display:block;';
      lightboxContent.appendChild(imgEl);
    }

    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
    trapFocus(lightbox);

    requestAnimationFrame(() => {
      lightbox.style.opacity = '1';
    });
  }

  function closeLightbox() {
    const activeVideo = lightboxContent.querySelector('video');
    if (activeVideo) activeVideo.pause();
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.setAttribute('hidden', '');
      lightboxContent.innerHTML = '';
      document.body.style.overflow = '';
      releaseFocus(lightbox);
    }, 300);
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
      closeLightbox();
    }
  });

  /* ================================================================
     CONTACT FORM — Web3Forms submission
     ================================================================ */
  const form        = $('#contact-form');
  const submitBtn   = $('#form-submit');
  const successMsg  = $('#form-success');
  const errorMsg    = $('#form-error-msg');

  function validateField(input) {
    const errorEl = input.parentElement.querySelector('.form-error');
    let message = '';

    if (input.required && !input.value.trim()) {
      message = 'This field is required.';
    } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      message = 'Please enter a valid email address.';
    } else if (input.type === 'tel' && input.value && input.value.replace(/\D/g, '').length < 7) {
      message = 'Please enter a valid phone number.';
    }

    input.classList.toggle('is-invalid', !!message);
    if (errorEl) errorEl.textContent = message;
    return !message;
  }

  const phoneInput = $('#phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', e => {
      const cursorPos = e.target.selectionStart;
      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
      let formatted = '';
      if (raw.length <= 3) {
        formatted = raw.length ? `(${raw}` : '';
      } else if (raw.length <= 6) {
        formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
      } else {
        formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
      }
      e.target.value = formatted;
    });

    phoneInput.addEventListener('keydown', e => {
      if (e.key === 'Backspace') {
        const val = phoneInput.value;
        const pos = phoneInput.selectionStart;
        if (pos > 0 && /\D/.test(val[pos - 1])) {
          e.preventDefault();
          const newPos = pos - 1;
          phoneInput.value = val.slice(0, newPos) + val.slice(pos);
          phoneInput.setSelectionRange(newPos, newPos);
          phoneInput.dispatchEvent(new Event('input'));
        }
      }
    });
  }

  $$('.form-input', form).forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validateField(input);
    });
  });

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const inputs = $$('[required]', form);
      const valid = inputs.map(validateField).every(Boolean);
      if (!valid) {
        inputs.find(i => i.classList.contains('is-invalid'))?.focus();
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      successMsg.hidden = true;
      errorMsg.hidden = true;

      try {
        const data = new FormData(form);
        const json = Object.fromEntries(data.entries());

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(json),
        });

        const result = await response.json();

        if (result.success) {
          successMsg.hidden = false;
          form.reset();
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        errorMsg.hidden = false;
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        console.error('Form error:', err);
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
    });
  }

  /* ================================================================
     FOOTER — dynamic year
     ================================================================ */
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
