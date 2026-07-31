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

  function initNavigation() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('#primary-nav');

    if (!header || !toggle || !nav) {
      return;
    }

    function setMenu(open, restoreFocus = false) {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');

      if (restoreFocus) {
        toggle.focus();
      }
    }

    header.classList.add('is-enhanced');
    toggle.hidden = false;
    toggle.setAttribute('aria-controls', 'primary-nav');
    setMenu(false);

    toggle.addEventListener('click', () => {
      setMenu(!header.classList.contains('menu-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !header.classList.contains('menu-open')) {
        return;
      }

      setMenu(false, true);
    });
  }

  function initTeamDialog(reducedMotionQuery) {
    const dialog = document.querySelector('#team-dialog');
    const members = [...document.querySelectorAll('button[data-member]')];
    const dialogShell = dialog?.querySelector('.dialog-shell');
    const closeButton = dialog?.querySelector('[data-dialog-close]');
    const name = dialog?.querySelector('[data-dialog-name]');
    const marker = dialog?.querySelector('[data-dialog-marker]');
    const role = dialog?.querySelector('[data-dialog-role]');
    const bio = dialog?.querySelector('[data-dialog-bio]');
    const achievements = dialog?.querySelector('[data-dialog-achievements]');
    const work = dialog?.querySelector('[data-dialog-work]');

    const memberIndexes = new Set(members.map((member) => Number(member.dataset.member)));

    if (!dialog || members.length !== 4 || ![...memberIndexes].every(Number.isInteger) || memberIndexes.size !== 4 || !memberIndexes.has(0) || !memberIndexes.has(1) || !memberIndexes.has(2) || !memberIndexes.has(3) || !dialogShell || !closeButton || !name || !marker || !role || !bio || !achievements || !work || typeof dialog.showModal !== 'function') {
      return;
    }

    const membersByIndex = [
      'Team Member 01',
      'Team Member 02',
      'Team Member 03',
      'Team Member 04',
    ];
    const roleText = 'Role / specialty';
    const bioText = "Add this team member's short biography, focus, and approach here.";
    const achievementTexts = ['Achievement placeholder 01', 'Achievement placeholder 02'];
    const projectTexts = ['Project placeholder 01', 'Project placeholder 02'];
    const projectSummary = 'Add a short project summary and contribution.';
    let trigger;
    let selectedMember;
    let pendingOpen;

    function replaceTextChildren(container, tagName, values) {
      const children = values.map((value) => {
        const element = document.createElement(tagName);
        element.textContent = value;
        return element;
      });
      container.replaceChildren(...children);
    }

    function populate(index) {
      const number = String(index + 1).padStart(2, '0');
      marker.textContent = number;
      name.textContent = membersByIndex[index];
      role.textContent = roleText;
      bio.textContent = bioText;

      const achievementsTitle = document.createElement('h3');
      achievementsTitle.textContent = 'Achievements';
      replaceTextChildren(achievements, 'p', achievementTexts);
      achievements.prepend(achievementsTitle);

      const workTitle = document.createElement('h3');
      workTitle.textContent = 'Selected work';
      const projects = projectTexts.map((project) => {
        const article = document.createElement('article');
        const heading = document.createElement('h4');
        const summary = document.createElement('p');
        heading.textContent = project;
        summary.textContent = projectSummary;
        article.replaceChildren(heading, summary);
        return article;
      });
      work.replaceChildren(workTitle, ...projects);
    }

    function openDialog() {
      pendingOpen = undefined;

      if (dialog.open) {
        return;
      }

      dialog.showModal();
      document.body.classList.add('dialog-open');
      closeButton.focus();
    }

    function requestOpen(member) {
      if (pendingOpen !== undefined || dialog.open) {
        return;
      }

      const index = Number(member.dataset.member);
      if (!Number.isInteger(index) || index < 0 || index >= membersByIndex.length) {
        return;
      }

      trigger = member;
      selectedMember = member;
      selectedMember.classList.add('is-selected');
      populate(index);

      if (reducedMotionQuery.matches) {
        openDialog();
        return;
      }

      pendingOpen = window.setTimeout(() => {
        openDialog();
      }, 140);
    }

    members.forEach((member) => {
      member.disabled = false;
      member.setAttribute('aria-haspopup', 'dialog');
      member.addEventListener('click', () => requestOpen(member));
    });

    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog || event.target.closest('.dialog-shell')) {
        return;
      }

      dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (pendingOpen !== undefined) {
        window.clearTimeout(pendingOpen);
      }

      pendingOpen = undefined;
      document.body.classList.remove('dialog-open');
      selectedMember?.classList.remove('is-selected');
      trigger?.focus();
      trigger = undefined;
      selectedMember = undefined;
    });
    reducedMotionQuery.addEventListener('change', (event) => {
      if (event.matches && pendingOpen !== undefined) {
        window.clearTimeout(pendingOpen);
        pendingOpen = undefined;
        openDialog();
      }
    });
  }

  initNavigation();
  initTeamDialog(reducedMotionQuery);
  const glow = document.querySelector('#glow');
  let glowTargetX = window.innerWidth / 2;
  let glowTargetY = window.innerHeight / 2;
  let glowCurrentX = glowTargetX;
  let glowCurrentY = glowTargetY;
  let glowFrame;
  let resetTilt = () => {};
  let refreshAutoplay = () => {};
  let syncAutoplayControl = () => {};

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
    const controls = heroStack.querySelector('.carousel-controls');
    const cards = [...heroStack.querySelectorAll('.card')];
    const dots = controls ? [...controls.querySelectorAll('[data-dot]')] : [];
    const carouselToggle = heroStack.querySelector('[data-carousel-toggle]');
    const status = heroStack.querySelector('.carousel-status');
    const count = cards.length;

    if (stack && controls && carouselToggle && count === 5 && dots.length === count && status) {
      let activeIndex = 0;
      let autoplayTimer;
      let pointerStart;
      let tiltFrame;
      let isUserPaused = false;
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
        return count > 1 && !prefersReducedMotion && !isUserPaused && isDocumentVisible && !isPointerInside && !isFocusWithin;
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
      syncAutoplayControl = function syncAutoplayControl() {
        if (reducedMotionQuery.matches) {
          carouselToggle.disabled = true;
          carouselToggle.hidden = true;
          return;
        }

        carouselToggle.hidden = false;
        carouselToggle.disabled = false;
        carouselToggle.setAttribute('aria-pressed', String(isUserPaused));
      };

      heroStack.classList.add('is-enhanced');
      controls.hidden = false;

      dots.forEach((dot, index) => {
        dot.disabled = false;
        dot.addEventListener('click', () => show(index));
      });

      syncAutoplayControl();
      carouselToggle.addEventListener('click', () => {
        isUserPaused = !isUserPaused;
        syncAutoplayControl();
        scheduleAutoplay();
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

    syncAutoplayControl();
    refreshAutoplay();
  });
})();
