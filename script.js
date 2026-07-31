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
      const label = open ? 'Close navigation' : 'Open navigation';
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = label;
      toggle.setAttribute('aria-label', label);

      if (restoreFocus) {
        toggle.focus();
      }
    }

    function resolveFragmentTarget(link) {
      if (link.origin !== window.location.origin || link.pathname !== window.location.pathname) {
        return;
      }

      if (link.hash.length <= 1) {
        return;
      }

      try {
        const fragment = decodeURIComponent(link.hash.slice(1));
        return document.getElementById(fragment);
      } catch {
        return;
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
      link.addEventListener('click', () => {
        const target = resolveFragmentTarget(link);
        setMenu(false);

        window.requestAnimationFrame(() => {
          if (!target) {
            setMenu(false, true);
            return;
          }

          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        });
      });
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
      achievementsTitle.id = 'achievements-title';
      achievementsTitle.textContent = 'Achievements';
      replaceTextChildren(achievements, 'p', achievementTexts);
      achievements.prepend(achievementsTitle);

      const workTitle = document.createElement('h3');
      workTitle.id = 'work-title';
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
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || pendingOpen === undefined || dialog.open) {
        return;
      }

      window.clearTimeout(pendingOpen);
      pendingOpen = undefined;
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

  function initSpatialMotion(reducedMotionQuery) {
    const root = document.documentElement;
    const header = document.querySelector('.site-header');
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frameId;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let targetScroll = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;
    let currentScroll = 0;
    let activeSurface;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let pendingPointer;

    function clamp(value, minimum, maximum) {
      return Math.max(minimum, Math.min(maximum, value));
    }

    function isMotionAllowed() {
      return finePointerQuery.matches && !reducedMotionQuery.matches;
    }

    function setRootVariables() {
      root.style.setProperty('--pointer-x', currentPointerX.toFixed(3));
      root.style.setProperty('--pointer-y', currentPointerY.toFixed(3));
      root.style.setProperty('--scroll-depth', currentScroll.toFixed(3));
    }

    function resetSurface(surface) {
      if (!surface) {
        return;
      }

      surface.style.setProperty('--tilt-x', '0deg');
      surface.style.setProperty('--tilt-y', '0deg');
      surface.classList.remove('is-tilting');
    }

    function setActiveSurface(surface) {
      if (surface === activeSurface) {
        return;
      }

      const previousSurface = activeSurface;
      if (previousSurface) {
        previousSurface.style.setProperty('--tilt-x', '0deg');
        previousSurface.style.setProperty('--tilt-y', '0deg');
        previousSurface.classList.remove('is-tilting');
      }

      activeSurface = surface;
      targetTiltX = 0;
      targetTiltY = 0;
      currentTiltX = 0;
      currentTiltY = 0;
    }

    function hasSettled() {
      return Math.abs(targetPointerX - currentPointerX) <= .001
        && Math.abs(targetPointerY - currentPointerY) <= .001
        && Math.abs(targetScroll - currentScroll) <= .001
        && Math.abs(targetTiltX - currentTiltX) <= .001
        && Math.abs(targetTiltY - currentTiltY) <= .001;
    }

    function render() {
      frameId = undefined;

      if (!isMotionAllowed()) {
        return;
      }

      const pointer = pendingPointer;
      pendingPointer = undefined;
      if (pointer) {
        targetPointerX = clamp((pointer.clientX / Math.max(window.innerWidth, 1)) * 2 - 1, -1, 1);
        targetPointerY = clamp((pointer.clientY / Math.max(window.innerHeight, 1)) * 2 - 1, -1, 1);
        setActiveSurface(pointer.surface);

        if (pointer.surface) {
          const bounds = pointer.surface.getBoundingClientRect();
          const relativeX = bounds.width ? (pointer.clientX - bounds.left) / bounds.width - .5 : 0;
          const relativeY = bounds.height ? (pointer.clientY - bounds.top) / bounds.height - .5 : 0;
          targetTiltX = Math.max(-4, Math.min(4, relativeY * -8));
          targetTiltY = Math.max(-4, Math.min(4, relativeX * 8));
          pointer.surface.classList.add('is-tilting');
        }
      }

      currentPointerX += (targetPointerX - currentPointerX) * .14;
      currentPointerY += (targetPointerY - currentPointerY) * .14;
      currentScroll += (targetScroll - currentScroll) * .14;
      currentTiltX += (targetTiltX - currentTiltX) * .14;
      currentTiltY += (targetTiltY - currentTiltY) * .14;

      if (hasSettled()) {
        currentPointerX = targetPointerX;
        currentPointerY = targetPointerY;
        currentScroll = targetScroll;
        currentTiltX = targetTiltX;
        currentTiltY = targetTiltY;
      }

      setRootVariables();

      if (activeSurface) {
        activeSurface.style.setProperty('--tilt-x', `${currentTiltX.toFixed(2)}deg`);
        activeSurface.style.setProperty('--tilt-y', `${currentTiltY.toFixed(2)}deg`);
      }

      if (!hasSettled()) {
        frameId = window.requestAnimationFrame(render);
      }
    }

    function scheduleRender() {
      if (isMotionAllowed() && frameId === undefined) {
        frameId = window.requestAnimationFrame(render);
      }
    }

    function stopSpatialMotion() {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
        frameId = undefined;
      }

      targetPointerX = 0;
      targetPointerY = 0;
      targetScroll = 0;
      currentPointerX = 0;
      currentPointerY = 0;
      currentScroll = 0;
      targetTiltX = 0;
      targetTiltY = 0;
      currentTiltX = 0;
      currentTiltY = 0;
      pendingPointer = undefined;
      resetSurface(activeSurface);
      activeSurface = undefined;
      setRootVariables();
    }

    function updateScroll() {
      header?.classList.toggle('is-scrolled', window.scrollY > 24);

      if (!isMotionAllowed()) {
        return;
      }

      targetScroll = clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
      scheduleRender();
    }

    function handleCapabilityChange() {
      if (!isMotionAllowed()) {
        stopSpatialMotion();
        return;
      }

      updateScroll();
    }

    root.style.setProperty('--pointer-x', '0');
    root.style.setProperty('--pointer-y', '0');
    root.style.setProperty('--scroll-depth', '0');
    handleCapabilityChange();

    document.addEventListener('pointermove', (event) => {
      if (!isMotionAllowed() || !event.isPrimary || event.pointerType === 'touch') {
        return;
      }

      const target = event.target;
      const surface = target instanceof Element ? target.closest('[data-tilt]') : undefined;
      pendingPointer = { clientX: event.clientX, clientY: event.clientY, surface };
      scheduleRender();
    }, { passive: true });

    document.addEventListener('pointerout', (event) => {
      if (event.isPrimary === false || event.pointerType === 'touch') {
        return;
      }

      pendingPointer = undefined;
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const surface = target.closest('[data-tilt]');
      if (!surface || surface !== activeSurface) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      if (!(relatedTarget instanceof Element) || !surface.contains(relatedTarget)) {
        resetSurface(activeSurface);
        activeSurface = undefined;
        targetTiltX = 0;
        targetTiltY = 0;
        currentTiltX = 0;
        currentTiltY = 0;
      }
    });

    window.addEventListener('scroll', updateScroll, { passive: true });
    finePointerQuery.addEventListener('change', handleCapabilityChange);
    reducedMotionQuery.addEventListener('change', handleCapabilityChange);

    return stopSpatialMotion;
  }

  initSpatialMotion(reducedMotionQuery);
  let refreshAutoplay = () => {};
  let syncAutoplayControl = () => {};

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
    syncAutoplayControl();
    refreshAutoplay();
  });
})();
