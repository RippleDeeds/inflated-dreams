/* ============================================================
   INFLATED DREAMS — Book Page JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- Utility ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     SMOOTH SCROLL — anchor links
     ================================================================ */
  const header = $('#book-header');

  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = header ? header.offsetHeight + 8 : 8;
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
      parallaxLayer.style.transform = `translateY(${window.scrollY * 0.35}px)`;
    }, { passive: true });
  }

  /* ================================================================
     CONTACT FORM — Web3Forms submission
     ================================================================ */
  const form       = $('#contact-form');
  const submitBtn  = $('#form-submit');
  const successMsg = $('#form-success');
  const errorMsg   = $('#form-error-msg');

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

  if (form) {
    $$('.form-input', form).forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) validateField(input);
      });
    });

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
