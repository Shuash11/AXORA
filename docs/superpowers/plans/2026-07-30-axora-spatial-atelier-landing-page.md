# AXORA Spatial Atelier Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current AXORA hero into a complete, dependency-free Home, Services, Team, and Contact landing page with restrained CSS 3D depth and an accessible four-member work-and-achievement dialog.

**Architecture:** Keep semantic content in `index.html`, presentation and spatial depth in `styles.css`, and progressive enhancement in one guarded classic-script IIFE in `script.js` so direct `file://` use still works. Preserve `carousel-state.js` as the independently tested circular-state module and retain small local helper copies in `script.js`; no framework, build tool, WebGL library, backend, or remote JavaScript is introduced.

**Tech Stack:** HTML5, modern CSS transforms and custom properties, browser-native JavaScript, native `<dialog>`, Node 24 built-in test runner, local JPEG assets, Google Fonts.

**Approved design:** `docs/superpowers/specs/2026-07-30-axora-spatial-atelier-landing-page-design.md`

---

## File Map

| Path | Responsibility |
| --- | --- |
| `index.html` | Full semantic page, retained five-photo hero, four services, four team placeholders, reusable native dialog, contact panel, and footer. |
| `styles.css` | Existing warm tokens plus spatial hero, asymmetric services, team field, dialog, navigation, responsive, coarse-pointer, and reduced-motion states. |
| `script.js` | Guarded mobile navigation, carousel, one shared motion scheduler, and team-dialog controller. |
| `carousel-state.js` | Existing DOM-free carousel helpers; do not modify unless its existing tests reveal a defect. |
| `tests/hero-markup.test.mjs` | Static full-page, style, asset, and controller contracts. Keep this filename and replace hero-only assumptions. |
| `tests/carousel-state.test.mjs` | Existing pure helper tests; keep unchanged. |
| `README.md` | Updated page scope, preview instructions, placeholder warning, and verification commands. |

Before each commit, inspect `git status --short` and stage only the paths listed for that task. The worktree already contains user changes; never reset, restore, or stage unrelated files.

### Task 1: Establish the full-page semantic contract

**Files:**
- Modify: `tests/hero-markup.test.mjs:66-188`
- Test: `tests/hero-markup.test.mjs`

- [ ] **Step 1: Replace the hero-only content test with the failing full-page contract**

Keep the existing `cards`, `classCount`, and `escapeRegExp` helpers at the top of the file. Replace the test named `hero source contains the locked AXORA copy, restrained navigation, and trust strip` with this test:

```js
test('full landing page contains the approved sections, services, team placeholders, and contact', () => {
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.match(html, /<header\b[^>]*class="site-header"/i);
  assert.match(html, /<main\b/i);
  assert.match(html, /<footer\b[^>]*class="site-footer"/i);

  for (const id of ['home', 'services', 'team', 'contact']) {
    assert.match(html, new RegExp(`<section\\b[^>]*\\bid="${id}"`, 'i'));
    assert.match(html, new RegExp(`href="#${id}"`));
  }

  assert.match(html, /AXORA<span aria-hidden="true">\.<\/span>/);
  assert.match(html, /<p class="eyebrow">OUR TEAM<\/p>/);
  assert.match(html, /<h1\b[^>]*>\s*Skilled hands,\s*<br\s*\/?>\s*<em>ready to help\.<\/em>\s*<\/h1>/i);
  assert.match(html, /Meet AXORA—the skilled virtual assistants behind every task, system, and solution, ready to make your digital work run smoother\./);
  assert.match(html, /href="#services"[^>]*>Explore our services<\/a>/);
  assert.match(html, /href="#team"[^>]*>Meet the team<\/a>/);

  for (const service of ['Web applications', 'Mobile applications', 'UI\/UX and visual design', 'Technical support']) {
    assert.match(html, new RegExp(`<h3[^>]*>${service}<\\/h3>`, 'i'));
  }
  assert.equal(classCount(html, 'service-card'), 4);
  assert.equal(classCount(html, 'team-card'), 4);

  for (let member = 1; member <= 4; member += 1) {
    const marker = String(member).padStart(2, '0');
    assert.match(html, new RegExp(`data-member="${member - 1}"`));
    assert.match(html, new RegExp(`Team Member ${marker}`));
  }
  assert.equal((html.match(/<small>Role \/ specialty<\/small>/g) ?? []).length, 4);
  assert.equal((html.match(/View work and achievements/g) ?? []).length, 4);

  assert.match(html, /<dialog\b[^>]*\bid="team-dialog"/i);
  assert.match(html, /data-dialog-close/);
  assert.match(html, /data-dialog-name/);
  assert.match(html, /data-dialog-bio/);
  assert.match(html, /data-dialog-achievements/);
  assert.match(html, /data-dialog-work/);
  assert.match(html, /Placeholder content/);

  assert.match(html, /Have something useful to build\?/);
  assert.match(html, /href="mailto:your-email@example\.com"/);
  assert.match(html, /Replace this email before launch\./);
});
```

In the existing card test, retain all exact image, alt, loading, decoding, and card-copy assertions. In the existing carousel markup test, replace `id="hero"` expectations with `id="home"`, retain `.hero-stack`, `.stack`, five dots, and the live status, and add these progressive-enhancement assertions:

```js
assert.match(html, /<button\b[^>]*class="nav-toggle"[^>]*aria-controls="primary-nav"[^>]*aria-expanded="false"/i);
assert.match(html, /<nav\b[^>]*id="primary-nav"[^>]*aria-label="Primary navigation"/i);
assert.equal((html.match(/<button\b(?=[^>]*class="team-card")(?=[^>]*disabled)[^>]*>/gi) ?? []).length, 4);
assert.doesNotMatch(html, /<script\b[^>]*type="module"/i);
assert.match(html, /<script\s+src="script\.js"\s+defer><\/script>/i);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="full landing page" tests/hero-markup.test.mjs
```

Expected: FAIL because `#services`, `#team`, `#contact`, the four service cards, the four team cards, and `#team-dialog` do not exist yet.

- [ ] **Step 3: Inspect the failure without weakening the assertions**

Confirm the first actionable failure is missing full-page markup, not a syntax or file-read error. Do not change the expected service names, team count, placeholder values, contact placeholder, image mapping, or dialog hooks.

### Task 2: Build the complete semantic page

**Files:**
- Modify: `index.html:1-121`
- Test: `tests/hero-markup.test.mjs`

- [ ] **Step 1: Replace the page header with the progressive navigation shell**

Keep the existing `<head>` font and asset links, change the title to `AXORA — Web, mobile, design, and tech support`, and use this body opening:

```html
<body>
  <div id="glow" aria-hidden="true"></div>
  <header class="site-header">
    <div class="wrap top">
      <a class="brand" href="#home" aria-label="AXORA home">AXORA<span aria-hidden="true">.</span></a>
      <button class="nav-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Open navigation">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
      <nav class="top-links" id="primary-nav" aria-label="Primary navigation">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#team">Team</a>
        <a href="#contact">Contact</a>
      </nav>
      <a class="top-cta" href="#contact">Let’s talk</a>
    </div>
  </header>
  <main>
```

- [ ] **Step 2: Retain the five cards and upgrade the hero framing**

Change the existing hero section ID from `hero` to `home`. Keep the five existing `<article class="card">` elements, their order, exact local sources, alternatives, loading attributes, dimensions, and card copy unchanged. Replace the hero action and proof markup and add the scene layers as follows:

```html
<section class="hero wrap" id="home" aria-labelledby="hero-title">
  <div class="hero-text">
    <p class="eyebrow">OUR TEAM</p>
    <h1 id="hero-title">Skilled hands,<br><em>ready to help.</em></h1>
    <p class="lede">Meet AXORA—the skilled virtual assistants behind every task, system, and solution, ready to make your digital work run smoother.</p>
    <div class="hero-actions" aria-label="Explore AXORA">
      <a class="button button-primary" href="#services">Explore our services</a>
      <a class="button button-ghost" href="#team">Meet the team</a>
    </div>
    <ul class="trust-strip" aria-label="AXORA capabilities">
      <li>Web apps</li>
      <li>Mobile apps</li>
      <li>Design</li>
      <li>Tech support</li>
    </ul>
  </div>

  <section class="hero-stack" role="region" aria-roledescription="carousel" aria-label="AXORA team achievements" tabindex="0">
    <div class="scene-rings" aria-hidden="true">
      <span class="scene-ring scene-ring-one"></span>
      <span class="scene-ring scene-ring-two"></span>
      <span class="scene-axis"></span>
    </div>
    <p class="scene-label" aria-hidden="true">OZAMIZ CITY · 2026</p>
    <div class="stack">
      <article class="card" data-slide="0" data-position="0" aria-hidden="false">
        <div class="card-photo">
          <img src="Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg" alt="AXORA team members together on the IT Summit and Code Camp Season 4 stage in Ozamiz City." width="2048" height="1536" loading="eager" fetchpriority="high" decoding="async" draggable="false">
          <span class="card-photo-hint">01 / 05</span><span class="photo-tag">IT Summit · Code Camp S4</span>
        </div>
        <div class="card-body"><p class="card-tag">Team milestone</p><p class="card-stat">Built to solve</p><p class="card-stat-label">AXORA showing up, learning, and building together.</p><p class="card-attribution">Ozamiz City · July 25, 2026</p></div>
      </article>
      <article class="card" data-slide="1" data-position="1" aria-hidden="true">
        <div class="card-photo">
          <img src="Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg" alt="AXORA team members posed onstage at IT Summit and Code Camp Season 4 in Ozamiz City." width="2048" height="1536" loading="lazy" decoding="async" draggable="false">
          <span class="card-photo-hint">02 / 05</span><span class="photo-tag">One team, shared focus</span>
        </div>
        <div class="card-body"><p class="card-tag">Collaboration</p><p class="card-stat">Ready together</p><p class="card-stat-label">Skilled support starts with people who work as one.</p><p class="card-attribution">AXORA · Code Camp Season 4</p></div>
      </article>
      <article class="card" data-slide="2" data-position="2" aria-hidden="true">
        <div class="card-photo">
          <img src="Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg" alt="AXORA team members celebrating around a table while holding a certificate and trophy at Code Camp Season 4 in Ozamiz City." width="2048" height="1536" loading="lazy" decoding="async" draggable="false">
          <span class="card-photo-hint">03 / 05</span><span class="photo-tag">The people behind AXORA</span>
        </div>
        <div class="card-body"><p class="card-tag">Human-led</p><p class="card-stat">Hands-on support</p><p class="card-stat-label">Real people helping make everyday digital work easier.</p><p class="card-attribution">Team moment · Ozamiz City</p></div>
      </article>
      <article class="card" data-slide="3" data-position="-2" aria-hidden="true">
        <div class="card-photo">
          <img src="Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg" alt="AXORA team members in a closer onstage group photo at Code Camp Season 4 in Ozamiz City." width="2048" height="1536" loading="lazy" decoding="async" draggable="false">
          <span class="card-photo-hint">04 / 05</span><span class="photo-tag">Technology, made human</span>
        </div>
        <div class="card-body"><p class="card-tag">Tech assistance</p><p class="card-stat">Clear. Capable.</p><p class="card-stat-label">Practical help for websites, systems, content, and more.</p><p class="card-attribution">AXORA · IT Summit 2026</p></div>
      </article>
      <article class="card" data-slide="4" data-position="-1" aria-hidden="true">
        <div class="card-photo">
          <img src="Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg" alt="AXORA team members in a wide full-group stage photograph at IT Summit and Code Camp Season 4 in Ozamiz City." width="2048" height="1536" loading="lazy" decoding="async" draggable="false">
          <span class="card-photo-hint">05 / 05</span><span class="photo-tag">A wider circle of support</span>
        </div>
        <div class="card-body"><p class="card-tag">People first</p><p class="card-stat">Ready to help</p><p class="card-stat-label">A skilled team grounded in curiosity and collaboration.</p><p class="card-attribution">Ozamiz City · 2026</p></div>
      </article>
    </div>
    <div class="dots" role="group" aria-label="Choose an achievement card">
      <button class="dot" type="button" data-dot="0" aria-label="Show card 1" aria-current="true"></button>
      <button class="dot" type="button" data-dot="1" aria-label="Show card 2" aria-current="false"></button>
      <button class="dot" type="button" data-dot="2" aria-label="Show card 3" aria-current="false"></button>
      <button class="dot" type="button" data-dot="3" aria-label="Show card 4" aria-current="false"></button>
      <button class="dot" type="button" data-dot="4" aria-label="Show card 5" aria-current="false"></button>
    </div>
    <p class="carousel-status sr-only" role="status" aria-live="polite">Card 1 of 5</p>
  </section>
</section>
```

- [ ] **Step 3: Add the exact Services section after the hero**

```html
<section class="services section wrap" id="services" aria-labelledby="services-title">
  <header class="section-heading services-heading">
    <div>
      <p class="section-kicker">SERVICES · 04</p>
      <h2 id="services-title">What we build<br><em>and support.</em></h2>
    </div>
    <p>Practical digital assistance for products, systems, and the everyday work around them.</p>
  </header>

  <div class="service-grid">
    <article class="service-card service-web" data-tilt tabindex="0">
      <span class="service-index">01</span>
      <svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
      <div><h3>Web applications</h3><p>Responsive web experiences and practical browser-based tools shaped around the way you work.</p></div>
      <span class="service-line" aria-hidden="true"></span>
    </article>
    <article class="service-card service-mobile" data-tilt tabindex="0">
      <span class="service-index">02</span>
      <svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>
      <div><h3>Mobile applications</h3><p>Focused mobile products and companion experiences designed for everyday use.</p></div>
      <span class="service-line" aria-hidden="true"></span>
    </article>
    <article class="service-card service-design" data-tilt tabindex="0">
      <span class="service-index">03</span>
      <svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 19 7-7 3 3-7 7-3-3Z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18"/><path d="m2 2 7.6 7.6"/><circle cx="11" cy="11" r="2"/></svg>
      <div><h3>UI/UX and visual design</h3><p>Clear interfaces, thoughtful interaction flows, and visual systems that make digital products easier to use.</p></div>
      <span class="service-line" aria-hidden="true"></span>
    </article>
    <article class="service-card service-support" data-tilt tabindex="0">
      <span class="service-index">04</span>
      <svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5-5l2.1 2.1-2.4 2.4-2.1-2.1a4 4 0 0 0 5 5l6.8 6.8a2 2 0 0 0 2.8-2.8l-7.2-6.4Z"/><path d="m5 19-2 2M7 17l-4 4"/></svg>
      <div><h3>Technical support</h3><p>Flexible help with websites, systems, content updates, troubleshooting, and other day-to-day digital tasks.</p></div>
      <span class="service-line" aria-hidden="true"></span>
    </article>
  </div>
</section>
```

- [ ] **Step 4: Add exactly four disabled-by-default team buttons**

```html
<section class="team section wrap" id="team" aria-labelledby="team-title">
  <header class="section-heading team-heading">
    <div>
      <p class="section-number">02 / TEAM</p>
      <h2 id="team-title">Four people,<br><em>one shared standard.</em></h2>
    </div>
    <p>AXORA brings technical and creative strengths together to make digital work clearer and easier to move forward.</p>
  </header>

  <div class="team-grid">
    <button class="team-card" type="button" data-member="0" disabled>
      <span class="team-portrait" aria-hidden="true"><span>01</span></span>
      <span class="team-meta"><strong>Team Member 01</strong><small>Role / specialty</small></span>
      <span class="team-prompt">View work and achievements <span aria-hidden="true">↗</span></span>
    </button>
    <button class="team-card" type="button" data-member="1" disabled>
      <span class="team-portrait" aria-hidden="true"><span>02</span></span>
      <span class="team-meta"><strong>Team Member 02</strong><small>Role / specialty</small></span>
      <span class="team-prompt">View work and achievements <span aria-hidden="true">↗</span></span>
    </button>
    <button class="team-card" type="button" data-member="2" disabled>
      <span class="team-portrait" aria-hidden="true"><span>03</span></span>
      <span class="team-meta"><strong>Team Member 03</strong><small>Role / specialty</small></span>
      <span class="team-prompt">View work and achievements <span aria-hidden="true">↗</span></span>
    </button>
    <button class="team-card" type="button" data-member="3" disabled>
      <span class="team-portrait" aria-hidden="true"><span>04</span></span>
      <span class="team-meta"><strong>Team Member 04</strong><small>Role / specialty</small></span>
      <span class="team-prompt">View work and achievements <span aria-hidden="true">↗</span></span>
    </button>
  </div>
</section>
```

- [ ] **Step 5: Add Contact, the reusable dialog, and the footer**

```html
<section class="contact section wrap" id="contact" aria-labelledby="contact-title">
  <div class="contact-panel">
    <p class="contact-label">START A CONVERSATION</p>
    <h2 id="contact-title">Have something<br><em>useful to build?</em></h2>
    <p>Tell us what you are working on and where you need a capable extra set of hands.</p>
    <a class="contact-email" href="mailto:your-email@example.com">your-email@example.com <span aria-hidden="true">↗</span></a>
    <small>Replace this email before launch.</small>
    <a class="button button-primary contact-action" href="mailto:your-email@example.com">Start a conversation</a>
  </div>
</section>
</main>

<dialog class="team-dialog" id="team-dialog" aria-labelledby="dialog-title">
  <div class="dialog-shell">
    <button class="dialog-close" type="button" data-dialog-close aria-label="Close team member details">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
    <div class="dialog-identity">
      <p class="dialog-placeholder">Placeholder content</p>
      <span class="dialog-marker" data-dialog-marker aria-hidden="true">01</span>
      <h2 id="dialog-title" data-dialog-name>Team Member 01</h2>
      <p class="dialog-role" data-dialog-role>Role / specialty</p>
      <p class="dialog-bio" data-dialog-bio>Add this team member's short biography, focus, and approach here.</p>
    </div>
    <div class="dialog-details">
      <section aria-labelledby="achievement-title">
        <h3 id="achievement-title">Achievements</h3>
        <ol data-dialog-achievements>
          <li>Achievement placeholder 01</li>
          <li>Achievement placeholder 02</li>
        </ol>
      </section>
      <section aria-labelledby="work-title">
        <h3 id="work-title">Selected work</h3>
        <div class="dialog-work" data-dialog-work>
          <article><span>01</span><h4>Project placeholder 01</h4><p>Add a short project summary and contribution.</p></article>
          <article><span>02</span><h4>Project placeholder 02</h4><p>Add a short project summary and contribution.</p></article>
        </div>
      </section>
    </div>
  </div>
</dialog>

<footer class="site-footer">
  <div class="wrap footer-inner">
    <a class="brand" href="#home" aria-label="AXORA home">AXORA<span aria-hidden="true">.</span></a>
    <p>Web apps, mobile apps, design, and practical tech support.</p>
    <nav aria-label="Footer navigation">
      <a href="#home">Home</a><a href="#services">Services</a><a href="#team">Team</a><a href="#contact">Contact</a>
    </nav>
  </div>
</footer>
<script src="script.js" defer></script>
</body>
```

- [ ] **Step 6: Run the full markup test and make it GREEN**

Run:

```powershell
node --test --test-name-pattern="full landing page|five complete achievement cards|carousel markup" tests/hero-markup.test.mjs
```

Expected: PASS for the selected semantic, asset, and carousel-markup tests.

- [ ] **Step 7: Commit the semantic page**

```powershell
git add -- index.html tests/hero-markup.test.mjs
git commit -m "feat: expand AXORA into a full landing page"
```

Expected: one commit containing only `index.html` and `tests/hero-markup.test.mjs`.

### Task 3: Implement the warm spatial visual system

**Files:**
- Modify: `tests/hero-markup.test.mjs:155-188`
- Modify: `styles.css:1-217`
- Test: `tests/hero-markup.test.mjs`

- [ ] **Step 1: Replace the old style contract with the failing spatial-page contract**

Retain assertions for the seven approved colors, three font families, focus visibility, horizontal overflow, `.sr-only`, and reduced motion. Add these exact assertions:

```js
test('styles define the approved spatial page, responsive layouts, and motion safeguards', () => {
  for (const color of ['#211A15', '#2C231C', '#362B22', '#F5EFE4', '#B8AA97', '#E7A23A', '#6FB3A0']) {
    assert.match(css, new RegExp(color, 'i'));
  }
  for (const font of ['Lora', 'Plus Jakarta Sans', 'Space Mono']) {
    assert.match(css, new RegExp(font));
  }

  for (const selector of [
    '.site-header', '.nav-toggle', '.hero', '.scene-rings', '.stack',
    '.service-grid', '.service-card', '.team-grid', '.team-card',
    '.team-dialog', '.contact-panel', '.site-footer'
  ]) {
    assert.match(css, new RegExp(selector.replace('.', '\\.'), 'i'), `missing ${selector}`);
  }

  assert.match(css, /perspective:\s*1[0-6]\d{2}px/);
  assert.match(css, /transform-style:\s*preserve-3d/);
  assert.match(css, /translateZ\(/);
  assert.match(css, /backdrop-filter:\s*blur\(/);
  assert.match(css, /grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.team-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.team-dialog::backdrop/);
  assert.match(css, /min-(?:inline-)?size:\s*44px/);
  assert.match(css, /min-(?:block-)?size:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /overflow-x:\s*(?:clip|hidden)/);
  assert.match(css, /@media \(max-width:\s*1023px\)/);
  assert.match(css, /@media \(max-width:\s*767px\)/);
  assert.match(css, /@media \(max-width:\s*420px\)/);
  assert.match(css, /@media \(hover:\s*none\),\s*\(pointer:\s*coarse\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?transition-duration:\s*\.01ms\s*!important/);
  assert.match(css, /\.sr-only\s*\{[\s\S]*?clip-path:\s*inset\(50%\)/);
});
```

Remove obsolete assertions that lock the page to a hero-only `1.05fr 0.95fr` grid or the old 336px stack size. Keep card visibility, exact color, focus, overflow, and reduced-motion safety assertions when they still describe the approved behavior.

- [ ] **Step 2: Run the style test and verify RED**

Run:

```powershell
node --test --test-name-pattern="styles define the approved spatial page" tests/hero-markup.test.mjs
```

Expected: FAIL on missing `.service-grid`, `.team-grid`, `.team-dialog`, or the 12-column service composition.

- [ ] **Step 3: Extend the root tokens and global page treatment**

Keep the existing seven brand tokens and add these variables to `:root`:

```css
--glass: rgb(54 43 34 / 72%);
--glass-strong: rgb(44 35 28 / 90%);
--line-strong: rgb(245 239 228 / 24%);
--shadow-soft: 0 24px 80px rgb(10 7 5 / 26%);
--shadow-deep: 0 42px 110px rgb(10 7 5 / 38%);
--radius-sm: 12px;
--radius-md: 22px;
--radius-lg: 34px;
--pointer-x: 0;
--pointer-y: 0;
--scroll-depth: 0;
```

Update the body background and shared shell without changing the existing font stack:

```css
html { overflow-x: clip; background: var(--page); scroll-behavior: smooth; scroll-padding-top: 92px; }
body {
  min-inline-size: 320px;
  margin: 0;
  overflow-x: clip;
  color: var(--cream);
  background:
    radial-gradient(circle at 78% 4%, rgb(111 179 160 / 8%), transparent 28rem),
    radial-gradient(circle at 16% 20%, rgb(231 162 58 / 7%), transparent 26rem),
    var(--page);
  font-family: var(--body);
  font-size: 1rem;
  line-height: 1.5;
}
.wrap { position: relative; z-index: 1; inline-size: min(calc(100% - 80px), 1240px); margin-inline: auto; }
#glow {
  position: fixed;
  z-index: 0;
  inset: 50% auto auto 50%;
  inline-size: 640px;
  block-size: 640px;
  margin: -320px 0 0 -320px;
  border-radius: 50%;
  pointer-events: none;
  opacity: .28;
  background: radial-gradient(circle, rgb(231 162 58 / 18%), rgb(111 179 160 / 6%) 38%, transparent 70%);
  filter: blur(10px);
  transform: translate3d(calc(var(--pointer-x) * 44vw), calc(var(--pointer-y) * 42vh + var(--scroll-depth) * 18px), 0);
  will-change: transform;
}
.section { padding-block: clamp(5.5rem, 10vw, 9rem); }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 3rem; margin-block-end: clamp(2.5rem, 5vw, 4.5rem); }
.section-heading h2 { max-inline-size: 12ch; margin: 0; font-family: var(--display); font-size: clamp(2.8rem, 5vw, 5.4rem); font-weight: 500; letter-spacing: -.04em; line-height: .96; }
.section-heading h2 em { color: var(--honey); font-weight: inherit; }
.section-heading > p { max-inline-size: 32rem; margin: 0; color: var(--cream-dim); line-height: 1.75; }
.section-kicker, .section-number, .contact-label { margin: 0 0 1.1rem; color: var(--teal); font-family: var(--label); font-size: .7rem; letter-spacing: .13em; }
```

- [ ] **Step 4: Replace the header and hero layout rules**

Use the following rules as the source of truth; remove conflicting old `.top`, `.top-links`, `.hero`, `.hero-stack`, `.stack`, and `.card[data-position]` declarations:

```css
.site-header { position: sticky; z-index: 50; inset-block-start: 0; border-block-end: 1px solid transparent; transition: background-color 220ms ease, border-color 220ms ease, backdrop-filter 220ms ease; }
.site-header.is-scrolled { border-color: var(--line); background: rgb(33 26 21 / 84%); backdrop-filter: blur(18px); }
.top { display: grid; grid-template-columns: auto 1fr auto; align-items: center; min-block-size: 86px; }
.brand { display: inline-flex; align-items: center; min-block-size: 44px; font-family: var(--display); font-size: 1.3rem; font-weight: 600; }
.brand span { color: var(--honey); }
.top-links { display: flex; justify-content: center; gap: clamp(1rem, 3vw, 2.75rem); }
.top-links a, .top-cta { display: inline-flex; align-items: center; justify-content: center; min-inline-size: 44px; min-block-size: 44px; font-size: .78rem; font-weight: 700; }
.top-links a { color: var(--cream-dim); }
.top-links a:hover { color: var(--cream); }
.top-cta { padding-inline: 1.25rem; border-radius: 999px; color: var(--page); background: var(--honey); }
.nav-toggle { display: none; inline-size: 44px; block-size: 44px; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--cream); background: transparent; }

.hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(390px, .92fr); gap: clamp(3rem, 7vw, 7rem); align-items: center; min-block-size: calc(100svh - 86px); padding-block: clamp(4rem, 8vw, 7.5rem); }
.hero-text { position: relative; z-index: 4; max-inline-size: 36rem; }
.hero h1 { margin: 0; font-family: var(--display); font-size: clamp(3.2rem, 6.1vw, 6.2rem); font-weight: 500; letter-spacing: -.045em; line-height: .93; }
.hero h1 em { color: var(--honey); font-weight: inherit; }
.lede { max-inline-size: 33rem; margin: 1.65rem 0 0; color: var(--cream-dim); line-height: 1.8; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-block-start: 2rem; }
.button { display: inline-flex; align-items: center; justify-content: center; min-inline-size: 44px; min-block-size: 48px; padding-inline: 1.15rem; border: 1px solid transparent; border-radius: 999px; font-size: .8rem; font-weight: 700; transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease; }
.button:hover { transform: translateY(-2px); }
.button-primary { color: var(--page); background: var(--honey); }
.button-ghost { border-color: var(--line-strong); color: var(--cream); }
.trust-strip { display: flex; flex-wrap: wrap; gap: .65rem 1.3rem; margin: 2.4rem 0 0; padding: 1.2rem 0 0; border-block-start: 1px solid var(--line); color: var(--cream-dim); font-family: var(--label); font-size: .66rem; list-style: none; }
.trust-strip li { display: flex; align-items: center; min-block-size: 44px; }
.trust-strip li::before { inline-size: 5px; block-size: 5px; margin-inline-end: .6rem; border-radius: 50%; content: ""; background: var(--teal); box-shadow: 0 0 14px rgb(111 179 160 / 70%); }

.hero-stack { position: relative; justify-self: end; inline-size: min(100%, 470px); min-block-size: 590px; padding-block-start: 3.25rem; perspective: 1500px; perspective-origin: 52% 42%; transform-style: preserve-3d; }
.scene-rings { position: absolute; inset: 0; pointer-events: none; transform: translate3d(calc(var(--pointer-x) * -10px), calc(var(--pointer-y) * -8px + var(--scroll-depth) * 18px), -160px); transform-style: preserve-3d; }
.scene-ring { position: absolute; border: 1px solid rgb(245 239 228 / 12%); border-radius: 50%; }
.scene-ring-one { inset: 3% -7% auto auto; inline-size: 410px; aspect-ratio: 1; }
.scene-ring-two { inset: 13% 4% auto auto; inline-size: 325px; aspect-ratio: 1; border-color: rgb(111 179 160 / 18%); }
.scene-axis { position: absolute; inset: 11% 49% auto auto; inline-size: 1px; block-size: 445px; background: linear-gradient(transparent, rgb(231 162 58 / 32%), transparent); transform: rotate(26deg); }
.scene-label { position: absolute; z-index: 8; inset: .35rem 1rem auto auto; margin: 0; color: var(--cream-dim); font-family: var(--label); font-size: .65rem; letter-spacing: .1em; transform: translateZ(95px); }
.stack { position: relative; inline-size: 370px; block-size: 500px; margin-inline: auto; touch-action: pan-y; transform-style: preserve-3d; }
.card { position: absolute; inset: 0; display: flex; flex-direction: column; inline-size: 370px; block-size: 500px; overflow: hidden; border: 1px solid rgb(245 239 228 / 14%); border-radius: var(--radius-md); background: var(--panel); box-shadow: var(--shadow-deep); transform-origin: 50% 100%; transform-style: preserve-3d; backface-visibility: hidden; will-change: transform, opacity, filter; transition: transform 900ms cubic-bezier(.16, 1, .3, 1), opacity 700ms ease, filter 700ms ease; }
.card-photo { position: relative; block-size: 55%; flex: 0 0 55%; overflow: hidden; background: var(--panel-soft); }
.card-photo img { display: block; inline-size: 100%; block-size: 100%; object-fit: cover; user-select: none; -webkit-user-drag: none; }
.card[data-position="0"] { z-index: 5; opacity: 1; transform: translate3d(calc(var(--pointer-x) * 6px), calc(var(--pointer-y) * 5px), 86px) rotateX(calc(var(--pointer-y) * -4deg)) rotateY(calc(var(--pointer-x) * 5deg)); }
.card[data-position="1"] { z-index: 4; opacity: .92; filter: brightness(.75) saturate(.78); transform: translate3d(34px, -24px, 0) translateZ(-46px) scale(.965) rotateZ(3deg); }
.card[data-position="2"] { z-index: 3; opacity: .68; filter: brightness(.58) saturate(.66); transform: translate3d(61px, -43px, 0) translateZ(-105px) scale(.92) rotateZ(6deg); }
.card[data-position="-1"], .card[data-position="-2"] { z-index: 1; opacity: 0; pointer-events: none; transform: translate3d(-24px, 24px, -150px) scale(.9); }
```

Retain the current card photo overlays, tags, body typography, dots, focus treatment, and `.sr-only` utility unless these new dimensions require a narrow size adjustment.

- [ ] **Step 5: Add the asymmetric Services and four-card Team system**

Append these exact layout rules before the media queries:

```css
.service-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 1rem; perspective: 1400px; }
.service-card { position: relative; display: flex; min-block-size: 250px; overflow: hidden; padding: clamp(1.4rem, 3vw, 2.25rem); border: 1px solid var(--line); border-radius: var(--radius-md); background: linear-gradient(145deg, rgb(54 43 34 / 88%), rgb(44 35 28 / 78%)); box-shadow: var(--shadow-soft); transform: perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateY(var(--lift, 0px)); transform-style: preserve-3d; transition: transform 220ms ease, border-color 220ms ease, background-color 220ms ease; }
.service-card:hover, .service-card:focus-within { --lift: -8px; border-color: rgb(231 162 58 / 38%); }
.service-card > * { position: relative; z-index: 2; }
.service-card h3 { margin: 0 0 .7rem; font-family: var(--display); font-size: clamp(1.55rem, 2.5vw, 2.35rem); font-weight: 500; line-height: 1.05; }
.service-card p { max-inline-size: 34rem; margin: 0; color: var(--cream-dim); line-height: 1.65; }
.service-index { position: absolute; inset: 1.5rem 1.5rem auto auto; color: var(--cream-dim); font-family: var(--label); font-size: .65rem; }
.service-icon { inline-size: 34px; block-size: 34px; flex: 0 0 auto; margin-inline-end: 1.25rem; fill: none; stroke: var(--teal); stroke-width: 1.35; stroke-linecap: round; stroke-linejoin: round; transform: translateZ(28px); }
.service-line { position: absolute; inset: auto 2rem 1.4rem 2rem; block-size: 1px; background: linear-gradient(90deg, var(--honey), transparent); opacity: .38; }
.service-web { grid-column: span 7; grid-row: span 2; min-block-size: 390px; align-items: end; }
.service-web .service-icon { position: absolute; inset: 2rem auto auto 2rem; inline-size: 58px; block-size: 58px; }
.service-mobile { grid-column: span 5; align-items: center; }
.service-design { grid-column: span 5; align-items: center; }
.service-support { grid-column: 1 / -1; align-items: center; min-block-size: 190px; }

.team { border-block-start: 1px solid var(--line); }
.team-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; perspective: 1400px; }
.team-card { position: relative; display: grid; grid-template-rows: 1fr auto auto; min-inline-size: 44px; min-block-size: 420px; overflow: hidden; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-md); color: var(--cream); background: var(--panel); text-align: start; cursor: pointer; box-shadow: var(--shadow-soft); transform: translateZ(var(--team-z, 0px)) translateY(var(--team-y, 0px)); transform-style: preserve-3d; transition: transform 260ms ease, border-color 220ms ease, box-shadow 220ms ease; }
.team-card:nth-child(2), .team-card:nth-child(3) { --team-y: 24px; --team-z: -20px; }
.team-card:disabled { color: var(--cream); opacity: 1; cursor: default; }
.team-card:not(:disabled):hover, .team-card:not(:disabled):focus-visible { --team-z: 34px; --team-y: -6px; border-color: rgb(231 162 58 / 42%); box-shadow: var(--shadow-deep); }
.team-card.is-selected { --team-z: 80px; --team-y: -12px; }
.team-portrait { position: relative; display: grid; place-items: center; overflow: hidden; min-block-size: 275px; background: radial-gradient(circle at 50% 44%, rgb(231 162 58 / 18%), transparent 34%), linear-gradient(145deg, var(--panel-soft), var(--panel)); }
.team-portrait::before, .team-portrait::after { position: absolute; border: 1px solid rgb(245 239 228 / 13%); border-radius: 50%; content: ""; }
.team-portrait::before { inline-size: 230px; aspect-ratio: 1; }
.team-portrait::after { inline-size: 165px; aspect-ratio: 1; border-color: rgb(111 179 160 / 23%); transform: translate3d(24px, -12px, 26px); }
.team-portrait span { position: relative; z-index: 2; color: var(--honey); font-family: var(--display); font-size: clamp(4rem, 9vw, 7rem); font-style: italic; transform: translateZ(54px); }
.team-meta { display: flex; align-items: end; justify-content: space-between; gap: 1rem; padding: 1.4rem 1.5rem .65rem; }
.team-meta strong { font-family: var(--display); font-size: 1.45rem; font-weight: 500; }
.team-meta small { color: var(--cream-dim); font-family: var(--label); font-size: .62rem; }
.team-prompt { display: flex; align-items: center; justify-content: space-between; min-block-size: 52px; margin-inline: 1.5rem; border-block-start: 1px solid var(--line); color: var(--cream-dim); font-size: .75rem; }
```

- [ ] **Step 6: Add Contact, dialog, and footer presentation**

```css
.contact-panel { position: relative; overflow: hidden; padding: clamp(2rem, 6vw, 5.5rem); border: 1px solid var(--line); border-radius: var(--radius-lg); background: radial-gradient(circle at 82% 20%, rgb(111 179 160 / 14%), transparent 26rem), linear-gradient(145deg, var(--panel-soft), var(--panel)); box-shadow: var(--shadow-deep); }
.contact-panel::after { position: absolute; inset: -35% -8% auto auto; inline-size: 440px; aspect-ratio: 1; border: 1px solid rgb(231 162 58 / 18%); border-radius: 50%; content: ""; }
.contact-panel h2 { position: relative; z-index: 1; max-inline-size: 12ch; margin: 0; font-family: var(--display); font-size: clamp(3rem, 6vw, 6.4rem); font-weight: 500; letter-spacing: -.045em; line-height: .93; }
.contact-panel h2 em { color: var(--honey); font-weight: inherit; }
.contact-panel > p:not(.contact-label) { max-inline-size: 34rem; color: var(--cream-dim); line-height: 1.7; }
.contact-email { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; max-inline-size: 42rem; min-block-size: 64px; margin-block-start: 2rem; border-block-end: 1px solid var(--line-strong); font-family: var(--display); font-size: clamp(1.25rem, 3vw, 2.4rem); }
.contact-panel small { display: block; margin-block-start: .65rem; color: var(--honey); font-family: var(--label); font-size: .62rem; }
.contact-action { margin-block-start: 2rem; }

.team-dialog { inline-size: min(calc(100% - 40px), 980px); max-block-size: min(84svh, 760px); padding: 0; overflow: auto; border: 1px solid var(--line-strong); border-radius: var(--radius-lg); color: var(--cream); background: var(--glass-strong); box-shadow: var(--shadow-deep); backdrop-filter: blur(24px); }
.team-dialog::backdrop { background: rgb(18 13 10 / 72%); backdrop-filter: blur(8px); }
.dialog-shell { position: relative; display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); min-block-size: 620px; }
.dialog-close { position: absolute; z-index: 4; inset: 1.25rem 1.25rem auto auto; display: grid; place-items: center; inline-size: 44px; block-size: 44px; padding: 0; border: 1px solid var(--line); border-radius: 50%; color: var(--cream); background: rgb(33 26 21 / 58%); cursor: pointer; }
.dialog-identity { position: relative; display: flex; flex-direction: column; justify-content: end; overflow: hidden; padding: 3rem; background: radial-gradient(circle at 50% 32%, rgb(231 162 58 / 20%), transparent 28%), var(--panel-soft); }
.dialog-marker { position: absolute; inset: 8% auto auto 50%; color: rgb(231 162 58 / 30%); font-family: var(--display); font-size: 10rem; font-style: italic; transform: translateX(-50%); }
.dialog-placeholder { position: absolute; inset: 1.5rem auto auto 1.5rem; margin: 0; color: var(--teal); font-family: var(--label); font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; }
.dialog-identity h2 { position: relative; margin: 0; font-family: var(--display); font-size: clamp(2.4rem, 5vw, 4.5rem); font-weight: 500; line-height: .95; }
.dialog-role { position: relative; margin: .75rem 0 0; color: var(--honey); font-family: var(--label); font-size: .68rem; }
.dialog-bio { position: relative; margin: 1.5rem 0 0; color: var(--cream-dim); line-height: 1.7; }
.dialog-details { display: grid; align-content: center; gap: 2.5rem; padding: 4rem 3rem; }
.dialog-details h3 { margin: 0 0 1rem; color: var(--teal); font-family: var(--label); font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; }
.dialog-details ol { display: grid; gap: .7rem; margin: 0; padding-inline-start: 1.25rem; color: var(--cream-dim); }
.dialog-work { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.dialog-work article { padding: 1.1rem; border: 1px solid var(--line); border-radius: var(--radius-sm); background: rgb(33 26 21 / 38%); }
.dialog-work span { color: var(--honey); font-family: var(--label); font-size: .62rem; }
.dialog-work h4 { margin: .8rem 0 .4rem; font-family: var(--display); font-size: 1.2rem; font-weight: 500; }
.dialog-work p { margin: 0; color: var(--cream-dim); font-size: .82rem; line-height: 1.55; }
body.dialog-open { overflow: hidden; }

.site-footer { border-block-start: 1px solid var(--line); }
.footer-inner { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 2rem; min-block-size: 150px; }
.footer-inner p { margin: 0; color: var(--cream-dim); font-size: .78rem; text-align: center; }
.footer-inner nav { display: flex; gap: 1.25rem; }
.footer-inner nav a { display: inline-flex; align-items: center; min-inline-size: 44px; min-block-size: 44px; color: var(--cream-dim); font-size: .72rem; }
```

- [ ] **Step 7: Replace the media queries with the approved exact breakpoints**

```css
@media (max-width: 1023px) {
  .hero { grid-template-columns: 1fr; justify-items: center; min-block-size: auto; }
  .hero-text { max-inline-size: 44rem; text-align: center; }
  .eyebrow, .hero-actions, .trust-strip { justify-content: center; }
  .lede { margin-inline: auto; }
  .hero-stack { justify-self: center; inline-size: min(100%, 520px); }
  .service-web, .service-mobile, .service-design { grid-column: span 6; }
  .service-web { min-block-size: 300px; }
  .service-support { grid-column: 1 / -1; }
  .dialog-shell { grid-template-columns: 1fr; }
  .dialog-identity { min-block-size: 330px; }
}

@media (max-width: 767px) {
  .wrap { inline-size: min(calc(100% - 32px), 680px); }
  .section { padding-block: 5rem; }
  .site-header.is-enhanced .top { grid-template-columns: auto auto 1fr; }
  .site-header.is-enhanced .nav-toggle { display: grid; place-items: center; justify-self: end; }
  .site-header.is-enhanced .top-cta { justify-self: end; }
  .site-header.is-enhanced .top-links { position: absolute; inset: calc(100% + 1px) 0 auto; display: none; flex-direction: column; gap: 0; padding: .75rem 1rem; border: 1px solid var(--line); border-radius: 0 0 var(--radius-md) var(--radius-md); background: var(--glass-strong); box-shadow: var(--shadow-soft); backdrop-filter: blur(18px); }
  .site-header.is-enhanced.menu-open .top-links { display: flex; }
  .site-header.is-enhanced .top-links a { justify-content: flex-start; min-block-size: 48px; }
  .hero { gap: 2.75rem; padding-block-start: 3.5rem; }
  .hero h1 { font-size: clamp(3.1rem, 14vw, 5.2rem); }
  .hero-stack { min-block-size: 510px; padding-block-start: 2.5rem; }
  .stack { inline-size: min(310px, calc(100vw - 64px)); block-size: 430px; }
  .card { inline-size: 100%; block-size: 430px; }
  .card[data-position="1"] { transform: translate3d(15px, -16px, -46px) scale(.96) rotateZ(2deg); }
  .card[data-position="2"] { transform: translate3d(27px, -29px, -100px) scale(.91) rotateZ(4deg); }
  .scene-ring-one { inline-size: 330px; }
  .scene-ring-two { inline-size: 250px; }
  .section-heading { align-items: start; flex-direction: column; gap: 1.5rem; }
  .service-grid { grid-template-columns: 1fr; }
  .service-web, .service-mobile, .service-design, .service-support { grid-column: 1; min-block-size: 240px; }
  .service-web { min-block-size: 300px; }
  .team-grid { grid-template-columns: 1fr; }
  .team-card:nth-child(2), .team-card:nth-child(3) { --team-y: 0px; --team-z: 0px; }
  .team-dialog { inset-block-end: 0; inline-size: 100%; max-block-size: 92svh; margin-block-end: 0; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .dialog-shell { min-block-size: 0; }
  .dialog-details, .dialog-identity { padding: 2rem 1.25rem; }
  .dialog-work { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; justify-items: start; gap: .5rem; padding-block: 2rem; }
  .footer-inner p { text-align: start; }
  .footer-inner nav { flex-wrap: wrap; }
}

@media (max-width: 420px) {
  .top-cta { padding-inline: .8rem; font-size: .68rem; }
  .hero-actions { display: grid; }
  .hero-actions .button { inline-size: 100%; }
  .trust-strip { gap: .25rem .75rem; }
  .team-card { min-block-size: 380px; }
  .contact-panel { padding: 2rem 1.25rem; border-radius: var(--radius-md); }
  .contact-email { align-items: flex-start; flex-direction: column; justify-content: center; overflow-wrap: anywhere; }
}

@media (hover: none), (pointer: coarse) {
  .scene-rings { transform: translate3d(0, 0, -160px); }
  .card[data-position="0"] { transform: translate3d(0, 0, 86px); }
  .service-card { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
  #glow, .scene-rings { transform: none !important; }
  .card[data-position="0"] { transform: translate3d(0, 0, 0); }
  .service-card, .team-card { transform: none; }
}
```

- [ ] **Step 8: Run the style contract and full tests**

Run:

```powershell
node --test --test-name-pattern="styles define the approved spatial page" tests/hero-markup.test.mjs
npm test
```

Expected: the focused test and complete suite PASS. If an old assertion encodes a superseded hero dimension, replace it only with the approved equivalent from the design spec; do not remove accessibility, image, carousel, or reduced-motion coverage.

- [ ] **Step 9: Commit the spatial visual system**

```powershell
git add -- styles.css tests/hero-markup.test.mjs
git commit -m "feat: add AXORA spatial atelier styling"
```

### Task 4: Add navigation and accessible team-dialog behavior

**Files:**
- Modify: `tests/hero-markup.test.mjs:190-240`
- Modify: `script.js:1-285`
- Test: `tests/hero-markup.test.mjs`

- [ ] **Step 1: Write the failing controller-source contract**

Add this test after the carousel controller tests:

```js
test('controller progressively enhances navigation and the reusable team dialog', () => {
  for (const initializer of ['initNavigation', 'initTeamDialog']) {
    assert.match(script, new RegExp(`function\\s+${initializer}\\s*\\(`));
    assert.match(script, new RegExp(`${initializer}\\(`));
  }

  assert.match(script, /document\.querySelector\(['"]\.site-header['"]\)/);
  assert.match(script, /document\.querySelector\(['"]\.nav-toggle['"]\)/);
  assert.match(script, /setAttribute\(['"]aria-expanded['"]/);
  assert.match(script, /setAttribute\(['"]aria-label['"]/);
  assert.match(script, /event\.key\s*===\s*['"]Escape['"]/);
  assert.match(script, /classList\.add\(['"]is-enhanced['"]\)/);

  assert.match(script, /document\.querySelector\(['"]#team-dialog['"]\)/);
  assert.match(script, /querySelectorAll\(['"]\[data-member\]['"]\)/);
  assert.match(script, /showModal\(\)/);
  assert.match(script, /dialog\.close\(\)/);
  assert.match(script, /event\.target\s*===\s*dialog/);
  assert.match(script, /trigger\.focus\(\)/);
  assert.match(script, /button\.disabled\s*=\s*false/);
  assert.match(script, /Team Member \$\{marker\}/);
  assert.match(script, /Achievement placeholder 01/);
  assert.match(script, /Project placeholder 01/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --test --test-name-pattern="progressively enhances navigation" tests/hero-markup.test.mjs
```

Expected: FAIL because `initNavigation`, `initTeamDialog`, `showModal`, and focus restoration do not exist.

- [ ] **Step 3: Add the navigation initializer inside the existing IIFE**

Place this function after the local carousel helpers and before carousel initialization:

```js
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('#primary-nav');

  if (!header || !toggle || !navigation) {
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
  toggle.addEventListener('click', () => {
    setMenu(!header.classList.contains('menu-open'));
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenu(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      setMenu(false, true);
    }
  });
}
```

- [ ] **Step 4: Add the four-member dialog initializer**

Use one shared placeholder record because only the member number changes in this version:

```js
function initTeamDialog(reducedMotionQuery) {
  const dialog = document.querySelector('#team-dialog');
  const buttons = [...document.querySelectorAll('[data-member]')];

  if (!dialog || buttons.length !== 4 || typeof dialog.showModal !== 'function') {
    return;
  }

  const closeButton = dialog.querySelector('[data-dialog-close]');
  const markerTarget = dialog.querySelector('[data-dialog-marker]');
  const nameTarget = dialog.querySelector('[data-dialog-name]');
  const roleTarget = dialog.querySelector('[data-dialog-role]');
  const bioTarget = dialog.querySelector('[data-dialog-bio]');
  const achievementsTarget = dialog.querySelector('[data-dialog-achievements]');
  const workTarget = dialog.querySelector('[data-dialog-work]');

  if (!closeButton || !markerTarget || !nameTarget || !roleTarget || !bioTarget || !achievementsTarget || !workTarget) {
    return;
  }

  let trigger;
  let openTimer;

  function populate(memberIndex) {
    const marker = String(memberIndex + 1).padStart(2, '0');
    markerTarget.textContent = marker;
    nameTarget.textContent = `Team Member ${marker}`;
    roleTarget.textContent = 'Role / specialty';
    bioTarget.textContent = "Add this team member's short biography, focus, and approach here.";
    achievementsTarget.replaceChildren();

    for (const label of ['Achievement placeholder 01', 'Achievement placeholder 02']) {
      const item = document.createElement('li');
      item.textContent = label;
      achievementsTarget.append(item);
    }

    workTarget.replaceChildren();
    for (const [index, title] of ['Project placeholder 01', 'Project placeholder 02'].entries()) {
      const article = document.createElement('article');
      const number = document.createElement('span');
      const heading = document.createElement('h4');
      const summary = document.createElement('p');
      number.textContent = String(index + 1).padStart(2, '0');
      heading.textContent = title;
      summary.textContent = 'Add a short project summary and contribution.';
      article.append(number, heading, summary);
      workTarget.append(article);
    }
  }

  function openDialog(button) {
    if (dialog.open || openTimer !== undefined) {
      return;
    }

    trigger = button;
    populate(Number(button.dataset.member));
    button.classList.add('is-selected');

    const show = () => {
      openTimer = undefined;
      dialog.showModal();
      document.body.classList.add('dialog-open');
      closeButton.focus();
    };

    if (reducedMotionQuery.matches) {
      show();
    } else {
      openTimer = window.setTimeout(show, 140);
    }
  }

  buttons.forEach((button) => {
    button.disabled = false;
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => openDialog(button));
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (trigger) {
      trigger.classList.remove('is-selected');
      trigger.focus();
    }
  });
}
```

- [ ] **Step 5: Initialize both guarded controllers**

After `reducedMotionQuery` is created and before carousel initialization, call:

```js
initNavigation();
initTeamDialog(reducedMotionQuery);
```

- [ ] **Step 6: Run the focused and full tests**

Run:

```powershell
node --test --test-name-pattern="progressively enhances navigation" tests/hero-markup.test.mjs
npm test
```

Expected: PASS. The existing carousel tests must remain green.

- [ ] **Step 7: Commit navigation and dialog behavior**

```powershell
git add -- script.js tests/hero-markup.test.mjs
git commit -m "feat: add navigation and team detail dialog"
```

### Task 5: Consolidate hero, scroll, and card depth into one motion scheduler

**Files:**
- Modify: `tests/hero-markup.test.mjs:190-250`
- Modify: `script.js:28-284`
- Test: `tests/hero-markup.test.mjs`

- [ ] **Step 1: Write the failing shared-motion contract**

Replace old assertions that require independent glow and active-card tilt frames with this contract:

```js
test('controller uses one settling scheduler for pointer, scroll, glow, and card depth', () => {
  assert.match(script, /function\s+initSpatialMotion\s*\(/);
  assert.match(script, /matchMedia\(['"]\(hover: hover\) and \(pointer: fine\)['"]\)/);
  assert.match(script, /const\s+root\s*=\s*document\.documentElement/);
  assert.match(script, /root\.style\.setProperty\(['"]--pointer-x['"]/);
  assert.match(script, /root\.style\.setProperty\(['"]--pointer-y['"]/);
  assert.match(script, /root\.style\.setProperty\(['"]--scroll-depth['"]/);
  assert.match(script, /header\.classList\.toggle\(['"]is-scrolled['"],\s*window\.scrollY\s*>\s*24\)/);
  assert.match(script, /event\.target\.closest\(['"]\[data-tilt\]['"]\)/);
  assert.match(script, /getBoundingClientRect\(\)/);
  assert.match(script, /--tilt-x/);
  assert.match(script, /--tilt-y/);
  assert.match(script, /window\.requestAnimationFrame\(render\)/);
  assert.match(script, /window\.cancelAnimationFrame\(frameId\)/);
  assert.match(script, /Math\.abs\([^)]*\)\s*>\s*\.001/);
  assert.match(script, /if\s*\(prefersReducedMotion\)\s*\{[\s\S]*?stopSpatialMotion\(\)/);
  assert.doesNotMatch(script, /let\s+glowFrame\b/);
  assert.doesNotMatch(script, /let\s+tiltFrame\b/);
  assert.doesNotMatch(script, /let\s+resetTilt\b/);
});
```

Retain the carousel lifecycle assertions for 3200ms autoplay, hover/focus/document visibility pauses, arrows, swipe, dots, live status, and reduced motion. In both existing motion-related tests, remove assertions for `document.querySelector('#glow')`, `glowTargetX`, `glowTargetY`, `glowCurrentX`, `glowCurrentY`, direct `.stack` `--tilt-x`/`--tilt-y` writes, `stopGlow`, and `resetTilt`; replace them with the root-property and one-scheduler assertions above. Replace the old CSS assertion for `rotateX(var(--tilt-x)) rotateY(var(--tilt-y))` with assertions that the active card references `var(--pointer-x)` and `var(--pointer-y)`. Keep the direct-file classic-script, perspective, preserved-depth, and reduced-motion assertions.

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --test --test-name-pattern="one settling scheduler" tests/hero-markup.test.mjs
```

Expected: FAIL because the current controller still uses separate `glowFrame` and `tiltFrame` paths.

- [ ] **Step 3: Remove the old glow and active-card pointer loops**

Delete the current `glow`, `glowTargetX`, `glowTargetY`, `glowCurrentX`, `glowCurrentY`, `glowFrame`, `stopGlow`, `renderGlow`, and `scheduleGlow` block. Remove `let resetTilt = () => {}`, `tiltFrame`, the later `resetTilt` assignment, and the `.stack` pointermove/pointerleave tilt handlers from the carousel. Do not remove swipe pointerdown/pointerup, image drag prevention, carousel autoplay, or reduced-motion lifecycle code.

- [ ] **Step 4: Add one shared spatial-motion initializer**

Add this function before controller initialization:

```js
function initSpatialMotion(reducedMotionQuery) {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let targetScroll = 0;
  let currentScroll = 0;
  let activeSurface;
  let frameId;

  function resetSurface(surface) {
    surface?.style.setProperty('--tilt-x', '0deg');
    surface?.style.setProperty('--tilt-y', '0deg');
  }

  function render() {
    frameId = undefined;
    currentX += (targetX - currentX) * .13;
    currentY += (targetY - currentY) * .13;
    currentScroll += (targetScroll - currentScroll) * .12;
    root.style.setProperty('--pointer-x', currentX.toFixed(4));
    root.style.setProperty('--pointer-y', currentY.toFixed(4));
    root.style.setProperty('--scroll-depth', currentScroll.toFixed(4));

    const unsettled = Math.abs(targetX - currentX) > .001
      || Math.abs(targetY - currentY) > .001
      || Math.abs(targetScroll - currentScroll) > .001;

    if (unsettled) {
      frameId = window.requestAnimationFrame(render);
    }
  }

  function schedule() {
    if (frameId === undefined) {
      frameId = window.requestAnimationFrame(render);
    }
  }

  function updateAvailability() {
    if (!finePointerQuery.matches || reducedMotionQuery.matches) {
      targetX = 0;
      targetY = 0;
      resetSurface(activeSurface);
      activeSurface = undefined;
      schedule();
    }
  }

  document.addEventListener('pointermove', (event) => {
    if (!finePointerQuery.matches || reducedMotionQuery.matches) {
      return;
    }

    targetX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
    targetY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
    const surface = event.target.closest('[data-tilt]');

    if (surface !== activeSurface) {
      resetSurface(activeSurface);
      activeSurface = surface;
    }

    if (activeSurface) {
      const bounds = activeSurface.getBoundingClientRect();
      const localX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const localY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      activeSurface.style.setProperty('--tilt-x', `${(-localY * 4).toFixed(2)}deg`);
      activeSurface.style.setProperty('--tilt-y', `${(localX * 4).toFixed(2)}deg`);
    }

    schedule();
  });

  document.addEventListener('pointerout', (event) => {
    if (activeSurface && !activeSurface.contains(event.relatedTarget)) {
      resetSurface(activeSurface);
      activeSurface = undefined;
    }
  });

  window.addEventListener('scroll', () => {
    targetScroll = Math.max(0, Math.min(1, window.scrollY / Math.max(window.innerHeight, 1)));
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    }
    schedule();
  }, { passive: true });

  finePointerQuery.addEventListener('change', updateAvailability);
  reducedMotionQuery.addEventListener('change', updateAvailability);
  if (header) {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  return function stopSpatialMotion() {
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      frameId = undefined;
    }
    resetSurface(activeSurface);
    root.style.setProperty('--pointer-x', '0');
    root.style.setProperty('--pointer-y', '0');
    root.style.setProperty('--scroll-depth', '0');
  };
}
```

- [ ] **Step 5: Connect the hero and services to the scheduler**

Add `data-tilt` to the active-capable hero `.stack` container in `index.html`:

```html
<div class="stack" data-tilt>
```

Initialize the scheduler after `reducedMotionQuery` is created:

```js
const stopSpatialMotion = initSpatialMotion(reducedMotionQuery);
```

In the reduced-motion change handler, replace old `stopGlow()` and `resetTilt()` calls with:

```js
if (prefersReducedMotion) {
  stopSpatialMotion();
}
```

Keep `refreshAutoplay()` so autoplay stops or resumes when the preference changes.

- [ ] **Step 6: Run the focused and full tests**

Run:

```powershell
node --test --test-name-pattern="one settling scheduler|carousel controller" tests/hero-markup.test.mjs
npm test
npm run verify:static
```

Expected: all commands PASS. The controller remains a classic deferred script with no `import` or `export` statement.

- [ ] **Step 7: Commit the consolidated motion controller**

```powershell
git add -- index.html script.js tests/hero-markup.test.mjs
git commit -m "feat: unify AXORA spatial motion"
```

### Task 6: Document placeholders and perform integrated verification

**Files:**
- Modify: `README.md:1-25`
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `script.js`
- Verify: `carousel-state.js`
- Test: `tests/hero-markup.test.mjs`
- Test: `tests/carousel-state.test.mjs`

- [ ] **Step 1: Replace README content with the completed page instructions**

```md
# AXORA Landing Page

This repository contains the dependency-free AXORA landing page: Home, Services, a four-person Team showcase, and Contact. The visual experience uses CSS 3D transforms and native JavaScript while preserving a reduced-motion path and direct-file support.

## Placeholder content

Before launch, replace:

- `Team Member 01` through `Team Member 04`
- Every `Role / specialty` label
- The placeholder biography, achievements, and selected work in `script.js`
- `your-email@example.com` in `index.html`

## Local preview

```bash
python -m http.server 4173 --directory .
```

Open `http://127.0.0.1:4173/`. The page also supports opening `index.html` directly through `file://`.

## Checks

```bash
npm test
npm run verify:static
```

The checks use Node's built-in test runner and require no package installation.
```

- [ ] **Step 2: Run repository-native tests and source checks**

Run:

```powershell
npm test
npm run verify:static
git diff --check
```

Expected: both test commands exit 0, `git diff --check` reports no whitespace errors, and the carousel-state tests remain unchanged and green.

- [ ] **Step 3: Run local HTTP assertions**

Run this from the repository root:

```powershell
$server = Start-Process -FilePath python -ArgumentList '-m','http.server','4173','--directory','.' -PassThru
try {
  Start-Sleep -Seconds 1
  $root = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/'
  if ($root.StatusCode -ne 200) { throw "Root returned HTTP $($root.StatusCode)" }
  foreach ($id in @('home', 'services', 'team', 'contact')) {
    if ($root.Content -notmatch "id=`"$id`"") { throw "Missing #$id" }
  }
  foreach ($service in @('Web applications', 'Mobile applications', 'UI/UX and visual design', 'Technical support')) {
    if ($root.Content -notmatch [regex]::Escape($service)) { throw "Missing service: $service" }
  }
  if (($root.Content | Select-String -AllMatches 'class="team-card"').Matches.Count -ne 4) { throw 'Expected four team cards' }
  if ($root.Content -notmatch 'id="team-dialog"') { throw 'Missing team dialog' }
  if ($root.Content -notmatch 'mailto:your-email@example\.com') { throw 'Missing contact placeholder' }
  $assets = @(
    'Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg',
    'Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg',
    'Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg',
    'Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg',
    'Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg'
  )
  foreach ($asset in $assets) {
    if ($root.Content -notmatch [regex]::Escape($asset)) { throw "Root does not reference $asset" }
    $response = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:4173/$asset"
    if ($response.StatusCode -ne 200) { throw "$asset returned HTTP $($response.StatusCode)" }
  }
  'AXORA HTTP assertions passed.'
} finally {
  Stop-Process -Id $server.Id
}
```

Expected final output: `AXORA HTTP assertions passed.` and the server process stops in the `finally` block.

- [ ] **Step 4: Review exact responsive widths in a browser**

Open `http://127.0.0.1:4173/` in a browser with responsive device emulation and inspect widths 1440px, 1024px, 768px, 390px, and 320px. Record PASS only after confirming all of these observations:

- 1440px: two-column hero; photo layers stay right of copy; asymmetric Services composition; two-by-two Team field; dialog uses two columns.
- 1024px: hero copy stacks above the photo scene; service modules remain balanced; no clipped rings or controls.
- 768px: tablet layout has no horizontal overflow; Team remains two columns; navigation remains usable.
- 390px and 320px: mobile menu opens and closes; all content is one column; carousel stays inside the viewport; service and team controls remain at least 44px; dialog is a bottom sheet.
- Every width: text remains readable, the contact email wraps safely, and no decorative plane covers an interactive element.

- [ ] **Step 5: Verify keyboard, pointer, modal, and motion behavior**

Perform this exact interaction sequence on the local HTTP page:

1. Tab through the header links, both hero actions, carousel dots, four team cards, contact links, and footer links; visible focus must remain clear.
2. Focus the carousel and press ArrowRight then ArrowLeft; the active card, dot, hidden status, and `aria-hidden` values must update.
3. Swipe the carousel left and right on touch emulation; vertical scrolling must remain available.
4. Hover the carousel, focus within it, and hide the browser tab; autoplay must pause in each state and resume only when all pause reasons clear.
5. Open every team card; each dialog heading and marker must match 01, 02, 03, or 04.
6. Close the dialog through the close button, Escape, and backdrop; focus must return to the initiating team card every time.
7. Enable `prefers-reduced-motion: reduce`; autoplay, parallax, card tilt, smooth scrolling, and the pre-dialog lift must stop while all actions remain usable.
8. Use coarse-pointer emulation; hover tilt must be absent and carousel swipe must remain available.
9. Open `file:///C:/projects/AXORA/index.html`; navigation, carousel, team dialog, local images, and contact link must still initialize without module or CORS errors.

Expected: every observation passes with no uncaught console error.

- [ ] **Step 6: Inspect the final diff and commit documentation**

Run:

```powershell
git status --short
git diff -- README.md index.html styles.css script.js tests/hero-markup.test.mjs
git log --oneline -10
```

Confirm the diff contains only approved landing-page work and preserves unrelated user changes. Then commit the README only if all verification steps passed:

```powershell
git add -- README.md
git commit -m "docs: update AXORA landing page guidance"
```

## Final Acceptance Gate

Do not report completion until all of the following are true:

- [ ] `npm test` exits 0.
- [ ] `npm run verify:static` exits 0.
- [ ] `git diff --check` reports no whitespace errors.
- [ ] Local HTTP assertions print `AXORA HTTP assertions passed.`.
- [ ] Browser checks pass at 1440px, 1024px, 768px, 390px, and 320px.
- [ ] Direct `file://` loading has no module or CORS failure.
- [ ] Keyboard, swipe, autoplay pause lifecycle, mobile navigation, four-member dialog, focus restoration, coarse-pointer, and reduced-motion checks pass.
- [ ] No file under `Hero Image/` changed.
- [ ] The four team identities, roles, biographies, achievements, projects, and contact email remain visibly marked placeholders rather than fabricated facts.
