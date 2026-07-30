(() => {
  'use strict';

  function validateCount(count) {
    if (count < 1) {
      throw new RangeError('Carousel count must be positive');
    }
  }

  function normalizeIndex(index, count) {
    validateCount(count);
    return ((index % count) + count) % count;
  }

  function nextIndex(index, count) {
    return normalizeIndex(index + 1, count);
  }

  function previousIndex(index, count) {
    return normalizeIndex(index - 1, count);
  }

  function relativeOffset(index, activeIndex, count) {
    const offset = normalizeIndex(index - activeIndex, count);
    return offset > count / 2 ? offset - count : offset;
  }

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReducedMotion = reducedMotionQuery.matches;
  const glow = document.querySelector('#glow');
  let glowTargetX = window.innerWidth / 2;
  let glowTargetY = window.innerHeight / 2;
  let glowCurrentX = glowTargetX;
  let glowCurrentY = glowTargetY;
  let glowFrame;
  let resetTilt = () => {};
  let refreshAutoplay = () => {};

  function stopGlow() {
    if (glowFrame !== undefined) {
      window.cancelAnimationFrame(glowFrame);
      glowFrame = undefined;
    }
  }

  function renderGlow() {
    glowFrame = undefined;
    glowCurrentX += (glowTargetX - glowCurrentX) * .14;
    glowCurrentY += (glowTargetY - glowCurrentY) * .14;
    glow.style.transform = `translate3d(${glowCurrentX}px, ${glowCurrentY}px, 0)`;

    if (Math.abs(glowTargetX - glowCurrentX) > .2 || Math.abs(glowTargetY - glowCurrentY) > .2) {
      glowFrame = window.requestAnimationFrame(renderGlow);
    }
  }

  function scheduleGlow() {
    if (!glow || prefersReducedMotion || glowFrame !== undefined) {
      return;
    }

    glowFrame = window.requestAnimationFrame(renderGlow);
  }

  if (glow) {
    glow.style.transform = `translate3d(${glowCurrentX}px, ${glowCurrentY}px, 0)`;

    document.addEventListener('pointermove', (event) => {
      if (prefersReducedMotion) {
        return;
      }

      glowTargetX = event.clientX;
      glowTargetY = event.clientY;
      scheduleGlow();
    });
  }

  const heroStack = document.querySelector('.hero-stack');

  if (heroStack) {
    const stack = heroStack.querySelector('.stack');
    const cards = [...heroStack.querySelectorAll('.card')];
    const dots = [...heroStack.querySelectorAll('[data-dot]')];
    const status = heroStack.querySelector('.carousel-status');
    const count = cards.length;

    if (stack && count === 5 && dots.length === count && status) {
      let activeIndex = 0;
      let autoplayTimer;
      let pointerStart;
      let tiltFrame;
      let isPointerInside = heroStack.matches(':hover');
      let isFocusWithin = heroStack.contains(document.activeElement);
      let isDocumentVisible = !document.hidden;

      function render(announce) {
        cards.forEach((card, index) => {
          card.dataset.position = String(relativeOffset(index, activeIndex, count));
          card.setAttribute('aria-hidden', String(index !== activeIndex));
        });

        dots.forEach((dot, index) => {
          dot.setAttribute('aria-current', String(index === activeIndex));
        });

        status.setAttribute('aria-live', announce ? 'polite' : 'off');
        status.textContent = `Card ${activeIndex + 1} of ${count}`;
      }

      function canAutoplay() {
        return count > 1 && !prefersReducedMotion && isDocumentVisible && !isPointerInside && !isFocusWithin;
      }

      function clearAutoplay() {
        if (autoplayTimer !== undefined) {
          window.clearTimeout(autoplayTimer);
          autoplayTimer = undefined;
        }
      }

      function scheduleAutoplay() {
        clearAutoplay();

        if (!canAutoplay()) {
          return;
        }

        autoplayTimer = window.setTimeout(() => {
          autoplayTimer = undefined;

          if (!canAutoplay()) {
            return;
          }

          activeIndex = nextIndex(activeIndex, count);
          render(false);
          scheduleAutoplay();
        }, 3200);
      }

      function show(index) {
        activeIndex = normalizeIndex(index, count);
        render(true);
        scheduleAutoplay();
      }

      function resetPointer() {
        pointerStart = undefined;
      }

      resetTilt = function resetTilt() {
        if (tiltFrame !== undefined) {
          window.cancelAnimationFrame(tiltFrame);
          tiltFrame = undefined;
        }

        stack.style.setProperty('--tilt-x', '0deg');
        stack.style.setProperty('--tilt-y', '0deg');
        stack.classList.remove('is-tilting');
      };
      refreshAutoplay = scheduleAutoplay;

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => show(index));
      });

      heroStack.addEventListener('keydown', (event) => {
        if (!heroStack.contains(document.activeElement)) {
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          show(previousIndex(activeIndex, count));
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          show(nextIndex(activeIndex, count));
        }
      });

      heroStack.addEventListener('pointerenter', () => {
        isPointerInside = true;
        scheduleAutoplay();
      });

      heroStack.addEventListener('pointerleave', () => {
        isPointerInside = false;
        resetPointer();
        scheduleAutoplay();
      });

      heroStack.addEventListener('focusin', () => {
        isFocusWithin = true;
        scheduleAutoplay();
      });

      heroStack.addEventListener('focusout', (event) => {
        isFocusWithin = heroStack.contains(event.relatedTarget);
        scheduleAutoplay();
      });

      document.addEventListener('visibilitychange', () => {
        isDocumentVisible = !document.hidden;
        scheduleAutoplay();
      });

      stack.addEventListener('dragstart', (event) => event.preventDefault());

      stack.addEventListener('pointermove', (event) => {
        if (prefersReducedMotion || !event.isPrimary || event.pointerType === 'touch') {
          return;
        }

        const bounds = stack.getBoundingClientRect();
        const relativeX = event.clientX - bounds.left;
        const relativeY = event.clientY - bounds.top;
        const tiltY = Math.max(-6, Math.min(6, (relativeX / bounds.width - .5) * 12));
        const tiltX = Math.max(-6, Math.min(6, (relativeY / bounds.height - .5) * -12));

        if (tiltFrame !== undefined) {
          return;
        }

        stack.classList.add('is-tilting');
        tiltFrame = window.requestAnimationFrame(() => {
          stack.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
          stack.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
          tiltFrame = undefined;
        });
      });

      stack.addEventListener('pointerleave', () => {
        if (tiltFrame !== undefined) {
          window.cancelAnimationFrame(tiltFrame);
          tiltFrame = undefined;
        }

        stack.style.setProperty('--tilt-x', '0deg');
        stack.style.setProperty('--tilt-y', '0deg');
        stack.classList.remove('is-tilting');
      });

      stack.addEventListener('pointerdown', (event) => {
        if (!event.isPrimary || event.button !== 0 || event.target.closest?.('button')) {
          return;
        }

        pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
        stack.setPointerCapture(event.pointerId);
      });

      stack.addEventListener('pointerup', (event) => {
        if (!pointerStart || pointerStart.id !== event.pointerId) {
          return;
        }

        const deltaX = event.clientX - pointerStart.x;
        const deltaY = event.clientY - pointerStart.y;
        resetPointer();

        if (Math.abs(deltaX) >= 44 && Math.abs(deltaX) > Math.abs(deltaY)) {
          show(deltaX < 0 ? nextIndex(activeIndex, count) : previousIndex(activeIndex, count));
        }
      });

      stack.addEventListener('pointercancel', resetPointer);
      stack.addEventListener('lostpointercapture', resetPointer);

      render(false);
      scheduleAutoplay();
    }
  }

  reducedMotionQuery.addEventListener('change', (event) => {
    prefersReducedMotion = event.matches;

    if (prefersReducedMotion) {
      stopGlow();
      resetTilt();
    }

    refreshAutoplay();
  });
})();
