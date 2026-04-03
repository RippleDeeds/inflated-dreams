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
     PARALLAX — hero glow layer on scroll
     ================================================================ */
  const parallaxLayer = $('.hero-parallax-layer');

  if (parallaxLayer && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxLayer.style.transform = `translateY(${scrollY * 0.35}px)`;
    }, { passive: true });
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
  }));

  function openLightbox(index) {
    const item = galleryData[index];
    lightboxContent.innerHTML = '';

    if (item.type === 'video') {
      const videoEl = document.createElement('video');
      videoEl.controls = true;
      videoEl.autoplay = false;
      videoEl.setAttribute('aria-label', item.label);
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'width:300px;height:200px;display:flex;align-items:center;justify-content:center;color:rgba(245,230,204,0.5);font-family:var(--font-heading);font-size:1rem;text-align:center;';
      placeholder.textContent = 'Video coming soon — follow us on Instagram & TikTok!';
      lightboxContent.appendChild(placeholder);
    } else {
      const imgEl = document.createElement('div');
      imgEl.style.cssText = 'width:min(80vw,500px);height:min(60vh,400px);background:linear-gradient(135deg,#C9A84C,#C7956C);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:rgba(10,10,10,0.6);font-family:var(--font-heading);text-align:center;padding:24px;';
      imgEl.textContent = 'Your beautiful photo will appear here';
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
