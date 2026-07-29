import {
  nextIndex,
  normalizeIndex,
  previousIndex,
  relativeOffset,
} from './carousel-state.js';

const gallery = document.querySelector('.gallery');

if (gallery) {
  const deck = gallery.querySelector('.gallery-deck');
  const slides = [...gallery.querySelectorAll('[data-slide]')];
  const dots = [...gallery.querySelectorAll('[data-dot]')];
  const previousButton = gallery.querySelector('[data-previous]');
  const nextButton = gallery.querySelector('[data-next]');
  const status = gallery.querySelector('.gallery-status');
  const count = slides.length;

  if (deck && count === 5 && dots.length === count && previousButton && nextButton && status) {
    let activeIndex = 0;
    let autoplayTimer;
    let pointerStart;
    let isPointerInside = gallery.matches(':hover');
    let isFocusWithin = gallery.contains(document.activeElement);
    let isDocumentVisible = !document.hidden;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;

    function render(announce) {
      slides.forEach((slide, index) => {
        slide.dataset.offset = String(relativeOffset(index, activeIndex, count));
        slide.setAttribute('aria-hidden', String(index !== activeIndex));
      });

      dots.forEach((dot, index) => {
        dot.setAttribute('aria-current', String(index === activeIndex));
      });

      status.setAttribute('aria-live', announce ? 'polite' : 'off');
      status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')} · AXORA in the room`;
    }

    function canAutoplay() {
      return count > 1
        && !prefersReducedMotion
        && isDocumentVisible
        && !isPointerInside
        && !isFocusWithin;
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
      }, 6000);
    }

    function show(index) {
      activeIndex = normalizeIndex(index, count);
      render(true);
      scheduleAutoplay();
    }

    function resetPointer() {
      pointerStart = undefined;
    }

    previousButton.addEventListener('click', () => {
      show(previousIndex(activeIndex, count));
    });

    nextButton.addEventListener('click', () => {
      show(nextIndex(activeIndex, count));
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
      });
    });

    gallery.addEventListener('keydown', (event) => {
      if (!gallery.contains(document.activeElement)) {
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

    gallery.addEventListener('pointerenter', () => {
      isPointerInside = true;
      scheduleAutoplay();
    });

    gallery.addEventListener('pointerleave', () => {
      isPointerInside = false;
      scheduleAutoplay();
    });

    gallery.addEventListener('focusin', () => {
      isFocusWithin = true;
      scheduleAutoplay();
    });

    gallery.addEventListener('focusout', (event) => {
      isFocusWithin = gallery.contains(event.relatedTarget);
      scheduleAutoplay();
    });

    document.addEventListener('visibilitychange', () => {
      isDocumentVisible = !document.hidden;
      scheduleAutoplay();
    });

    const updateMotionPreference = (event) => {
      prefersReducedMotion = event.matches;
      scheduleAutoplay();
    };

    reducedMotionQuery.addEventListener('change', updateMotionPreference);

    deck.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });

    deck.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest?.('button')) {
        return;
      }

      pointerStart = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      deck.setPointerCapture(event.pointerId);
    });

    deck.addEventListener('pointerup', (event) => {
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

    deck.addEventListener('pointercancel', resetPointer);
    deck.addEventListener('lostpointercapture', resetPointer);

    render(true);
    gallery.classList.add('is-enhanced');
    scheduleAutoplay();
  }
}
