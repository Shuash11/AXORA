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

  document.documentElement.classList.add('js');

  /* ---------- Navigation ---------- */

  function initNavigation() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('#primary-nav');

    if (!header || !toggle || !nav) {
      return;
    }

    const label = toggle.querySelector('.nav-toggle-label');

    function setMenu(open, restoreFocus = false) {
      const text = open ? 'Close navigation' : 'Open navigation';
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) {
        label.textContent = text;
      }
      toggle.setAttribute('aria-label', text);
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

  /* ---------- Reveals: one IntersectionObserver ---------- */

  function initReveals() {
    const items = [...document.querySelectorAll('[data-reveal]')];

    if (!items.length) {
      return;
    }

    function reveal(item) {
      item.classList.add('is-revealed');
    }

    if (reducedMotionQuery.matches || typeof IntersectionObserver === 'undefined') {
      items.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Team dialog with spring entry/exit ---------- */

  function initTeamDialog() {
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
    let closeTimer;

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
      if (dialog.open) {
        return;
      }

      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
        closeTimer = undefined;
      }

      dialog.classList.remove('closing');
      dialog.showModal();
      document.body.classList.add('dialog-open');
      closeButton.focus();

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          dialog.classList.add('is-open');
        });
      });
    }

    function animateClose() {
      if (!dialog.open) {
        return;
      }

      if (reducedMotionQuery.matches) {
        dialog.close();
        return;
      }

      dialog.classList.remove('is-open');
      dialog.classList.add('closing');
      closeTimer = window.setTimeout(() => dialog.close(), 160);
    }

    function requestOpen(member) {
      if (dialog.open) {
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
      openDialog();
    }

    members.forEach((member) => {
      member.disabled = false;
      member.setAttribute('aria-haspopup', 'dialog');
      member.addEventListener('click', () => requestOpen(member));
    });

    closeButton.addEventListener('click', () => animateClose());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog || event.target.closest('.dialog-shell')) {
        return;
      }

      animateClose();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      animateClose();
    });
    dialog.addEventListener('close', () => {
      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
        closeTimer = undefined;
      }

      dialog.classList.remove('is-open', 'closing');
      document.body.classList.remove('dialog-open');
      selectedMember?.classList.remove('is-selected');
      trigger?.focus();
      trigger = undefined;
      selectedMember = undefined;
    });
  }

  /* ---------- Pointer parallax + tilt: one RAF scheduler ---------- */

  function initSpatialMotion() {
    const root = document.documentElement;
    const header = document.querySelector('.site-header');
    const sectionIds = ['home', 'services', 'team', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section) => section != null);
    const navLinks = [...document.querySelectorAll('.site-nav a')];
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frameId;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let activeSurface;
    let pendingPointer;

    function clamp(value, minimum, maximum) {
      return Math.max(minimum, Math.min(maximum, value));
    }

    function isMotionAllowed() {
      return finePointerQuery.matches && !reducedMotionQuery.matches;
    }

    function setRootVariables() {
      root.style.setProperty('--px', currentPointerX.toFixed(3));
      root.style.setProperty('--py', currentPointerY.toFixed(3));
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

      if (activeSurface) {
        resetSurface(activeSurface);
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
          targetTiltX = clamp(relativeY * -6, -3, 3);
          targetTiltY = clamp(relativeX * 6, -3, 3);
          pointer.surface.classList.add('is-tilting');
        }
      }

      currentPointerX += (targetPointerX - currentPointerX) * .16;
      currentPointerY += (targetPointerY - currentPointerY) * .16;
      currentTiltX += (targetTiltX - currentTiltX) * .16;
      currentTiltY += (targetTiltY - currentTiltY) * .16;

      if (hasSettled()) {
        currentPointerX = targetPointerX;
        currentPointerY = targetPointerY;
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
      currentPointerX = 0;
      currentPointerY = 0;
      targetTiltX = 0;
      targetTiltY = 0;
      currentTiltX = 0;
      currentTiltY = 0;
      pendingPointer = undefined;
      resetSurface(activeSurface);
      activeSurface = undefined;
      setRootVariables();
    }

    function updateScrollSpy() {
      const probe = window.scrollY + 140;
      let currentId = sections.length ? sections[0].id : '';

      for (const section of sections) {
        if (section.getBoundingClientRect().top + window.scrollY <= probe) {
          currentId = section.id;
        }
      }

      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function handleScroll() {
      header?.classList.toggle('is-scrolled', window.scrollY > 24);
      updateScrollSpy();
    }

    function handleCapabilityChange() {
      if (!isMotionAllowed()) {
        stopSpatialMotion();
        return;
      }

      setRootVariables();
    }

    root.style.setProperty('--px', '0');
    root.style.setProperty('--py', '0');
    handleCapabilityChange();
    handleScroll();

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    finePointerQuery.addEventListener('change', handleCapabilityChange);
    reducedMotionQuery.addEventListener('change', handleCapabilityChange);

    return stopSpatialMotion;
  }

  /* ---------- Photo carousel: manual controls, swipe, keyboard ---------- */

  function initCarousel(heroStack) {
    const stage = heroStack.querySelector('.stage');
    const slides = [...heroStack.querySelectorAll('.scene-slide')];
    const controls = heroStack.querySelector('.carousel-controls');
    const previous = heroStack.querySelector('[data-carousel-prev]');
    const next = heroStack.querySelector('[data-carousel-next]');
    const dots = controls ? [...controls.querySelectorAll('[data-dot]')] : [];
    const status = heroStack.querySelector('.carousel-status');
    const counter = heroStack.querySelector('[data-count-current]');
    const count = slides.length;

    if (!stage || !controls || !previous || !next || count !== 5 || dots.length !== count || !status) {
      return;
    }

    let activeIndex = 0;
    let pointerStart;

    function render(announce) {
      slides.forEach((slide, index) => {
        slide.dataset.position = String(relativeOffset(index, activeIndex, count));
        slide.setAttribute('aria-hidden', String(index !== activeIndex));
      });

      dots.forEach((dot, index) => {
        dot.setAttribute('aria-current', String(index === activeIndex));
      });

      status.setAttribute('aria-live', announce ? 'polite' : 'off');
      status.textContent = `Photo ${activeIndex + 1} of ${count}`;

      if (counter) {
        counter.textContent = String(activeIndex + 1).padStart(2, '0');
      }
    }

    function show(index) {
      activeIndex = normalizeIndex(index, count);
      render(true);
    }

    function resetPointer() {
      pointerStart = undefined;
    }

    heroStack.classList.add('is-enhanced');
    controls.hidden = false;

    dots.forEach((dot, index) => {
      dot.disabled = false;
      dot.addEventListener('click', () => show(index));
    });

    previous.addEventListener('click', () => show(previousIndex(activeIndex, count)));
    next.addEventListener('click', () => show(nextIndex(activeIndex, count)));

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

    stage.addEventListener('dragstart', (event) => event.preventDefault());

    stage.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest?.('button')) {
        return;
      }

      pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
      stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointerup', (event) => {
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

    stage.addEventListener('pointercancel', resetPointer);
    stage.addEventListener('lostpointercapture', resetPointer);

    render(false);

    /* Autoplay: advance every 4.5s, pause on hover and while hidden. */
    let autoplayTimer;

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotionQuery.matches || document.hidden) {
        return;
      }
      autoplayTimer = window.setInterval(() => {
        show(nextIndex(activeIndex, count));
      }, 4500);
    }

    function stopAutoplay() {
      if (autoplayTimer !== undefined) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = undefined;
      }
    }

    heroStack.addEventListener('mouseenter', stopAutoplay);
    heroStack.addEventListener('mouseleave', startAutoplay);

    document.addEventListener('visibilitychange', startAutoplay);
    reducedMotionQuery.addEventListener('change', startAutoplay);

    startAutoplay();
  }

  initNavigation();
  initReveals();
  initTeamDialog();
  initSpatialMotion();

  const heroStack = document.querySelector('.hero-scene');
  if (heroStack) {
    initCarousel(heroStack);
  }
})();
