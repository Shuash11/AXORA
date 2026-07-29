# AXORA Hero Redesign Implementation Plan

> **Agentic-worker note:** Execute this document in order. Keep this change limited to the standalone hero and its local verification files. Do not alter the five source photographs in `Hero Image/`, add a framework or external JavaScript, invent business claims, or perform Git publication work.

## Goal

Build a polished, progressively enhanced AXORA landing-page hero in an editorial-tech-atelier style. The page will pair an accessible, restrained navigation and concise service introduction with a large, photographic five-image achievement deck from the July 25, 2026 IT Summit / Code Camp Season 4 in Ozamiz City. It must remain useful without JavaScript, become keyboard and pointer operable with JavaScript, and fit cleanly from 1440px down to 320px.

The approved copy is fixed as follows:

- Brand: `AXORA`
- Eyebrow: `REMOTE TECH SUPPORT · HUMAN-LED`
- H1: `Skilled minds, ready to solve.`
- Lede: `AXORA is a hands-on virtual assistance team helping people and growing businesses handle websites, systems, content, and everyday digital work with confidence.`
- Primary CTA: `Meet AXORA` linking to `#team`
- Secondary CTA: `See what we handle` linking to `#services`
- Proof labels: `Tech-focused`, `Remote-ready`, `People-first`
- Event label: `IT Summit · Code Camp S4`
- Event location/date: `Ozamiz City · 2026`

## Architecture

- `index.html` is the semantic, no-build document. It contains the header/navigation, the only H1, the hero copy, and five complete image slides. Before JavaScript loads, the five figures display in normal document flow so every photograph remains available.
- `styles.css` provides the ink/cobalt/ember/ivory design tokens, editorial type pairing, desktop photo-deck layering, responsive breakpoints, focus treatment, and reduced-motion fallback. The deck becomes layered only after `script.js` adds an enhancement class.
- `carousel-state.js` is a DOM-free ES module that normalizes circular indexes and calculates adjacent deck offsets. Node unit tests import this module directly.
- `script.js` is the small DOM controller. It imports the state module, updates slide and dot semantics, handles buttons, gallery-local arrow keys, simple pointer swipes, and runs one guarded timeout-based autoplay lifecycle.
- `tests/hero-markup.test.mjs` reads source files and the original hero photographs with Node built-ins only. `tests/carousel-state.test.mjs` unit-tests the pure module with Node's built-in test runner.
- The original photographs remain in `Hero Image/`, are never altered, and are referenced directly by the page through URL-encoded path segments.

## Tech Stack

- Plain semantic HTML, modern CSS, and browser-native ES modules.
- Bricolage Grotesque for display text and Instrument Sans for body/interface text, loaded from Google Fonts with `display=swap` and robust local/system fallbacks. No JavaScript font loader is used.
- Node v24 built-in `node:test`, `node:assert/strict`, and `node:fs` for all automated checks; npm only invokes those Node commands.
- Local JPEG assets; no framework, build tool, CSS library, icon package, analytics, form backend, or remote JavaScript dependency.

---

## [ ] 1. Establish Node-only test entry points and write static acceptance tests first (RED)

**Files created:** `package.json`, `tests/hero-markup.test.mjs`  
**Files modified:** none

1. Create `package.json` with private metadata and scripts that run only Node's built-in test runner:

   ```json
   {
     "name": "axora-hero",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "test": "npm run test:markup && npm run test:carousel",
       "test:markup": "node --test tests/hero-markup.test.mjs",
       "test:carousel": "node --test tests/carousel-state.test.mjs",
       "verify:static": "node --test tests/hero-markup.test.mjs"
     }
   }
   ```

2. Create `tests/hero-markup.test.mjs`. The test intentionally requires files and assets that do not yet exist, so it establishes the static contract before hero markup and styling are written:

   ```js
   import assert from 'node:assert/strict';
   import { existsSync, readFileSync } from 'node:fs';
   import test from 'node:test';

   const html = readFileSync('index.html', 'utf8');
   const css = readFileSync('styles.css', 'utf8');
    const slides = [
      {
        file: 'Hero Image/755941564_2053703328575625_420494940045368523_n.jpg',
        src: 'Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg',
        alt: 'AXORA team members together on the IT Summit and Code Camp Season 4 stage in Ozamiz City.'
      },
      {
        file: 'Hero Image/755941564_2053703328575625_420494940045368523_n (1).jpg',
        src: 'Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg',
        alt: 'AXORA team members posed onstage at IT Summit and Code Camp Season 4 in Ozamiz City.'
      },
      {
        file: 'Hero Image/755690039_2254034195393709_1404549311183090400_n.jpg',
        src: 'Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg',
        alt: 'AXORA team members celebrating around a table while holding a certificate and trophy at Code Camp Season 4 in Ozamiz City.'
      },
      {
        file: 'Hero Image/755538558_27737088675918586_7287023157067586050_n.jpg',
        src: 'Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg',
        alt: 'AXORA team members in a closer onstage group photo at Code Camp Season 4 in Ozamiz City.'
      },
      {
        file: 'Hero Image/753550594_854922847701273_1471309818899059976_n.jpg',
        src: 'Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg',
        alt: 'AXORA team members in a wide full-group stage photograph at IT Summit and Code Camp Season 4 in Ozamiz City.'
     }
   ];

   test('hero source contains the approved semantic content and navigation', () => {
     assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
     assert.match(html, /<main\b/i);
     assert.match(html, /<section[^>]+id="hero"/i);
     assert.match(html, /REMOTE TECH SUPPORT · HUMAN-LED/);
     assert.match(html, /<h1\b[^>]*>Skilled minds, ready to solve\.<\/h1>/);
     assert.match(html, /AXORA is a hands-on virtual assistance team helping people and growing businesses handle websites, systems, content, and everyday digital work with confidence\./);
     assert.match(html, /<a[^>]+href="#team"[^>]*>Meet AXORA(?:\s*<span[^>]*>↗<\/span>)?<\/a>/);
     assert.match(html, /<a[^>]+href="#services"[^>]*>See what we handle(?:\s*<span[^>]*>↗<\/span>)?<\/a>/);
     for (const anchor of ['#services', '#story', '#team']) {
       assert.match(html, new RegExp(`href="${anchor}"`));
     }
     for (const label of ['Tech-focused', 'Remote-ready', 'People-first']) {
       assert.match(html, new RegExp(label));
     }
   });

   test('five descriptive local hero images and complete gallery controls are present', () => {
     assert.equal((html.match(/data-slide/gi) ?? []).length, 5);
     assert.match(html, /aria-roledescription="carousel"/);
     assert.match(html, /IT Summit · Code Camp S4/);
     assert.match(html, /Ozamiz City · 2026/);
     assert.match(html, /aria-live="polite"/);
     assert.match(html, /aria-label="Previous photo"/);
     assert.match(html, /aria-label="Next photo"/);
     assert.equal((html.match(/data-dot/gi) ?? []).length, 5);
     assert.match(html, /loading="eager"/);
     assert.match(html, /fetchpriority="high"/);
      assert.equal((html.match(/loading="lazy"/gi) ?? []).length, 4);
      for (const slide of slides) {
        assert.ok(existsSync(slide.file), `missing source asset: ${slide.file}`);
        assert.ok(html.includes(`src="${slide.src}"`), `missing image source: ${slide.src}`);
        assert.ok(html.includes(`alt="${slide.alt}"`), `missing image alt: ${slide.alt}`);
     }
   });

   test('styles contain the responsive, focus, overflow, and motion safeguards', () => {
     assert.match(css, /--ink:/);
     assert.match(css, /--cobalt:/);
     assert.match(css, /--ember:/);
     assert.match(css, /Bricolage Grotesque/);
     assert.match(css, /Instrument Sans/);
     assert.match(css, /min-inline-size:\s*44px/);
     assert.match(css, /min-block-size:\s*44px/);
     assert.match(css, /:focus-visible/);
     assert.match(css, /overflow-x:\s*clip/);
     assert.match(css, /@media \(max-width: 1024px\)/);
     assert.match(css, /@media \(max-width: 768px\)/);
     assert.match(css, /@media \(max-width: 390px\)/);
     assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
   });
   ```

3. Run the first RED command only after those two files are saved:

   ```powershell
   npm run test:markup
   ```

   **Expected RED outcome:** a non-zero exit because `index.html` and `styles.css` have not been created. This is the expected proof that the acceptance test precedes the implementation.

## [ ] 2. Reference all original photographs directly and implement the static hero composition (GREEN)

**Files created:** `index.html`, `styles.css`  
**Files modified:** none

1. Reference the originals directly. Do not rename, delete, edit, recompress, or otherwise modify any source file in `Hero Image/`. The explicit original-file-to-URL mapping is:

    | Original file, preserved in `Hero Image/` | URL referenced by the page |
    | --- | --- |
    | `Hero Image/755941564_2053703328575625_420494940045368523_n.jpg` | `Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg` |
    | `Hero Image/755941564_2053703328575625_420494940045368523_n (1).jpg` | `Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg` |
    | `Hero Image/755690039_2254034195393709_1404549311183090400_n.jpg` | `Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg` |
    | `Hero Image/755538558_27737088675918586_7287023157067586050_n.jpg` | `Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg` |
    | `Hero Image/753550594_854922847701273_1471309818899059976_n.jpg` | `Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg` |

    The first two original files are visually identical, but both are intentionally represented as separate slides and retained in the five-photo deck.

2. Create `index.html` with one header landmark, a nav containing only the approved future anchors, one main landmark, and one hero section. Use the following structural content exactly; controls are real buttons and every image has the tested descriptive alt text:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <meta name="description" content="AXORA remote tech support and virtual assistance.">
     <title>AXORA — Remote Tech Support</title>
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@10..48,400..800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
     <link rel="stylesheet" href="styles.css">
     <script type="module" src="script.js"></script>
   </head>
   <body>
     <header class="site-header">
       <a class="brand" href="#hero" aria-label="AXORA home">AXORA</a>
       <nav aria-label="Primary navigation">
         <a href="#services">Services</a>
         <a href="#story">Our story</a>
         <a href="#team">Meet the team</a>
       </nav>
     </header>
     <main>
       <section class="hero" id="hero" aria-labelledby="hero-title">
         <div class="hero-copy">
           <p class="eyebrow">REMOTE TECH SUPPORT · HUMAN-LED</p>
           <h1 id="hero-title">Skilled minds, ready to solve.</h1>
           <p class="lede">AXORA is a hands-on virtual assistance team helping people and growing businesses handle websites, systems, content, and everyday digital work with confidence.</p>
           <div class="hero-actions" aria-label="Hero actions">
             <a class="button button-primary" href="#team">Meet AXORA <span aria-hidden="true">↗</span></a>
             <a class="button button-secondary" href="#services">See what we handle <span aria-hidden="true">↗</span></a>
           </div>
           <ul class="proof-list" aria-label="AXORA principles">
             <li>Tech-focused</li><li>Remote-ready</li><li>People-first</li>
           </ul>
         </div>
         <section class="gallery" aria-label="AXORA at IT Summit and Code Camp Season 4" aria-roledescription="carousel" tabindex="0">
           <div class="gallery-heading"><p>IT Summit · Code Camp S4</p><p>Ozamiz City · 2026</p></div>
           <div class="photo-deck">
             <figure class="slide" data-slide>
                <img src="Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg" alt="AXORA team members together on the IT Summit and Code Camp Season 4 stage in Ozamiz City." width="1200" height="900" loading="eager" fetchpriority="high" decoding="async">
             </figure>
             <figure class="slide" data-slide>
                <img src="Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg" alt="AXORA team members posed onstage at IT Summit and Code Camp Season 4 in Ozamiz City." width="1200" height="900" loading="lazy" decoding="async">
             </figure>
             <figure class="slide" data-slide>
                <img src="Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg" alt="AXORA team members celebrating around a table while holding a certificate and trophy at Code Camp Season 4 in Ozamiz City." width="1200" height="900" loading="lazy" decoding="async">
             </figure>
             <figure class="slide" data-slide>
                <img src="Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg" alt="AXORA team members in a closer onstage group photo at Code Camp Season 4 in Ozamiz City." width="1200" height="900" loading="lazy" decoding="async">
             </figure>
             <figure class="slide" data-slide>
                <img src="Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg" alt="AXORA team members in a wide full-group stage photograph at IT Summit and Code Camp Season 4 in Ozamiz City." width="1200" height="900" loading="lazy" decoding="async">
             </figure>
           </div>
           <div class="caption-rail">
             <p id="gallery-status" role="status" aria-live="polite">Photo 1 of 5</p>
             <div class="gallery-controls">
               <button type="button" data-previous aria-label="Previous photo"><span aria-hidden="true">←</span></button>
               <ol class="gallery-dots" aria-label="Choose photo">
                 <li><button type="button" data-dot="0" aria-label="Show photo 1" aria-current="true"></button></li>
                 <li><button type="button" data-dot="1" aria-label="Show photo 2"></button></li>
                 <li><button type="button" data-dot="2" aria-label="Show photo 3"></button></li>
                 <li><button type="button" data-dot="3" aria-label="Show photo 4"></button></li>
                 <li><button type="button" data-dot="4" aria-label="Show photo 5"></button></li>
               </ol>
               <button type="button" data-next aria-label="Next photo"><span aria-hidden="true">→</span></button>
             </div>
           </div>
         </section>
       </section>
     </main>
   </body>
   </html>
   ```

3. Create `styles.css` using the following complete design rules. The content uses an ink foundation, cobalt light, ember accent, ivory copy, subtle grid/grain, no text laid over faces, and a no-JavaScript photo fallback. Keep the supplied media queries exactly so the source-level acceptance test can guard each required viewport tier.

   ```css
   :root {
     --ink: #07111f;
     --ink-raised: #0d1c30;
     --cobalt: #2764ea;
     --ember: #f26c4f;
     --ivory: #f5f0e7;
     --muted: #b8c0cc;
     --line: rgb(245 240 231 / 18%);
     --display: "Bricolage Grotesque", "Arial Narrow", sans-serif;
     --body: "Instrument Sans", Arial, sans-serif;
   }
   * { box-sizing: border-box; }
   html { scroll-behavior: smooth; overflow-x: clip; }
   body { min-inline-size: 320px; margin: 0; overflow-x: clip; color: var(--ivory); background: var(--ink); font-family: var(--body); }
   body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; opacity: .28; background-image: linear-gradient(rgb(245 240 231 / 4%) 1px, transparent 1px), linear-gradient(90deg, rgb(245 240 231 / 4%) 1px, transparent 1px), radial-gradient(circle at 82% 14%, rgb(39 100 234 / 30%), transparent 29%), radial-gradient(circle at 12% 82%, rgb(242 108 79 / 15%), transparent 25%); background-size: 48px 48px, 48px 48px, auto, auto; }
   a { color: inherit; text-decoration: none; }
   button { color: inherit; font: inherit; }
   :focus-visible { outline: 3px solid var(--ember); outline-offset: 4px; }
   .site-header, .hero { inline-size: min(100% - 64px, 1400px); margin-inline: auto; }
   .site-header { display: flex; align-items: center; justify-content: space-between; min-block-size: 88px; border-bottom: 1px solid var(--line); }
   .brand { font-family: var(--display); font-size: 1.25rem; font-weight: 800; letter-spacing: .08em; }
   nav { display: flex; flex-wrap: wrap; gap: clamp(1rem, 2vw, 2rem); font-size: .9rem; }
   nav a { padding-block: .5rem; color: var(--muted); }
   nav a:hover { color: var(--ivory); }
   .hero { display: grid; grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr); gap: clamp(3rem, 7vw, 9rem); align-items: center; min-block-size: calc(100svh - 88px); padding-block: clamp(3rem, 8vw, 7rem); }
   .eyebrow, .gallery-heading p:first-child { margin: 0; color: var(--ember); font-size: .75rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
   h1 { max-inline-size: 12ch; margin: 1rem 0 1.25rem; font-family: var(--display); font-size: clamp(3.1rem, 6.2vw, 6.8rem); font-weight: 650; letter-spacing: -.065em; line-height: .91; text-wrap: balance; }
   .lede { max-inline-size: 60ch; margin: 0; color: var(--muted); font-size: clamp(1rem, 1.3vw, 1.15rem); line-height: 1.65; }
   .hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-block: 2rem; }
   .button { display: inline-flex; align-items: center; justify-content: center; gap: .7rem; min-block-size: 48px; padding-inline: 1.1rem; border: 1px solid var(--line); font-weight: 700; }
   .button-primary { border-color: var(--cobalt); background: var(--cobalt); }
   .button-secondary { background: rgb(7 17 31 / 45%); }
   .button:hover { transform: translateY(-2px); }
   .proof-list { display: flex; flex-wrap: wrap; gap: .6rem 1.25rem; margin: 0; padding: 0; color: var(--muted); font-size: .88rem; list-style: none; }
   .proof-list li::before { content: "•"; margin-inline-end: .45rem; color: var(--ember); }
   .gallery { min-inline-size: 0; }
   .gallery-heading { display: flex; justify-content: space-between; gap: 1rem; margin-block-end: 1rem; }
   .gallery-heading p { margin: 0; color: var(--muted); font-size: .8rem; }
   .photo-deck { display: grid; gap: .8rem; }
   .slide { aspect-ratio: 4 / 3; margin: 0; overflow: hidden; border: 1px solid var(--line); background: var(--ink-raised); }
   .slide img { display: block; inline-size: 100%; block-size: 100%; object-fit: cover; }
   .caption-rail { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-block-start: 1rem; border-top: 1px solid var(--line); padding-block-start: 1rem; }
   #gallery-status { margin: 0; color: var(--muted); font-size: .85rem; }
   .gallery-controls { display: flex; align-items: center; gap: .55rem; }
   .gallery-controls button { display: inline-grid; place-items: center; min-inline-size: 44px; min-block-size: 44px; border: 1px solid var(--line); background: transparent; cursor: pointer; }
   .gallery-controls button:hover { border-color: var(--ember); color: var(--ember); }
   .gallery-dots { display: flex; gap: .25rem; margin: 0; padding: 0; list-style: none; }
   .gallery-dots button { min-inline-size: 16px; min-block-size: 44px; border: 0; background: transparent; }
   .gallery-dots button::after { content: ""; display: block; inline-size: 16px; block-size: 2px; background: var(--muted); }
   .gallery-dots button[aria-current="true"]::after { background: var(--ember); }
   .gallery.is-enhanced .photo-deck { position: relative; block-size: clamp(330px, 40vw, 570px); overflow: clip; }
   .gallery.is-enhanced .slide { position: absolute; inset: 0 auto auto 50%; inline-size: 78%; block-size: 88%; box-shadow: 0 24px 60px rgb(0 0 0 / 30%); transition: transform 420ms cubic-bezier(.2, .8, .2, 1), opacity 420ms ease; }
   .gallery.is-enhanced .slide[data-offset="0"] { z-index: 5; opacity: 1; transform: translateX(-50%) rotate(-2deg); }
   .gallery.is-enhanced .slide[data-offset="1"] { z-index: 4; opacity: .82; transform: translateX(-35%) translateY(4%) rotate(5deg); }
   .gallery.is-enhanced .slide[data-offset="-1"] { z-index: 3; opacity: .68; transform: translateX(-66%) translateY(8%) rotate(-7deg); }
   .gallery.is-enhanced .slide[data-offset="2"] { z-index: 2; opacity: .42; transform: translateX(-25%) translateY(14%) rotate(10deg); }
   .gallery.is-enhanced .slide[data-offset="-2"] { z-index: 1; opacity: .32; transform: translateX(-76%) translateY(17%) rotate(-11deg); }
   @media (max-width: 1024px) { .site-header, .hero { inline-size: min(100% - 48px, 980px); } .hero { gap: 3rem; } h1 { font-size: clamp(3rem, 6vw, 5.3rem); } }
   @media (max-width: 768px) { .site-header { align-items: flex-start; flex-direction: column; justify-content: center; gap: .35rem; padding-block: 1rem; } .hero { grid-template-columns: 1fr; min-block-size: auto; padding-block: 3rem 4rem; } .hero-copy { max-inline-size: 680px; } .gallery { inline-size: min(100%, 640px); } }
   @media (max-width: 390px) { .site-header, .hero { inline-size: min(100% - 32px, 390px); } nav { gap: .7rem 1rem; } .hero { gap: 2.5rem; } h1 { font-size: clamp(2.75rem, 15vw, 3.5rem); } .hero-actions { align-items: stretch; flex-direction: column; } .gallery-heading, .caption-rail { align-items: flex-start; flex-direction: column; } .gallery-controls { inline-size: 100%; justify-content: space-between; } .gallery.is-enhanced .photo-deck { block-size: 300px; } }
   @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; } }
   ```

4. Run the static GREEN command:

   ```powershell
   npm run test:markup
   ```

    **Expected GREEN outcome:** exit code 0; all three source-level static tests pass, confirming the approved content, five directly referenced local images, semantic controls, responsive guardrails, focus rules, and reduced-motion CSS.

## [ ] 3. Define the pure carousel-state contract before browser logic (RED)

**Files created:** `tests/carousel-state.test.mjs`  
**Files modified:** none

1. Create `tests/carousel-state.test.mjs` before `carousel-state.js` exists:

   ```js
   import assert from 'node:assert/strict';
   import test from 'node:test';
   import { nextIndex, normalizeIndex, previousIndex, relativeOffset } from '../carousel-state.js';

   test('normalizeIndex wraps positive and negative positions through five slides', () => {
     assert.equal(normalizeIndex(0, 5), 0);
     assert.equal(normalizeIndex(5, 5), 0);
     assert.equal(normalizeIndex(7, 5), 2);
     assert.equal(normalizeIndex(-1, 5), 4);
     assert.equal(normalizeIndex(-6, 5), 4);
   });

   test('nextIndex and previousIndex wrap at both ends', () => {
     assert.equal(nextIndex(4, 5), 0);
     assert.equal(nextIndex(2, 5), 3);
     assert.equal(previousIndex(0, 5), 4);
     assert.equal(previousIndex(2, 5), 1);
   });

   test('relativeOffset assigns the shortest signed deck position', () => {
     assert.equal(relativeOffset(2, 2, 5), 0);
     assert.equal(relativeOffset(3, 2, 5), 1);
     assert.equal(relativeOffset(4, 2, 5), 2);
     assert.equal(relativeOffset(1, 2, 5), -1);
     assert.equal(relativeOffset(0, 2, 5), -2);
     assert.equal(relativeOffset(0, 4, 5), 1);
   });

   test('state helpers reject a non-positive or non-integer slide count', () => {
     for (const count of [0, -1, 2.5, Number.NaN]) {
       assert.throws(() => normalizeIndex(0, count), RangeError);
     }
   });
   ```

2. Run the RED unit-test command:

   ```powershell
   npm run test:carousel
   ```

   **Expected RED outcome:** a non-zero exit with a module-resolution error for `carousel-state.js`, because the tested state module is deliberately not created yet.

## [ ] 4. Implement the tested state module and accessible carousel controller (GREEN)

**Files created:** `carousel-state.js`, `script.js`  
**Files modified:** none

1. Create the DOM-free `carousel-state.js` exactly as follows:

   ```js
   function assertCount(count) {
     if (!Number.isInteger(count) || count < 1) {
       throw new RangeError('count must be a positive integer');
     }
   }

   export function normalizeIndex(index, count) {
     assertCount(count);
     const remainder = index % count;
     return remainder < 0 ? remainder + count : remainder;
   }

   export function nextIndex(current, count) {
     return normalizeIndex(current + 1, count);
   }

   export function previousIndex(current, count) {
     return normalizeIndex(current - 1, count);
   }

   export function relativeOffset(index, activeIndex, count) {
     assertCount(count);
     const forward = normalizeIndex(index - activeIndex, count);
     return forward > count / 2 ? forward - count : forward;
   }
   ```

2. Create `script.js` as the single controller. It adds enhancement only after the required DOM exists, uses one `setTimeout` rather than an accumulating interval, pauses on hover/focus/hidden state, honors reduced motion, updates status and active semantics, supports gallery-local arrow keys, and recognizes a simple horizontal pointer swipe:

   ```js
   import { nextIndex, previousIndex, relativeOffset } from './carousel-state.js';

   const gallery = document.querySelector('.gallery');
   if (gallery) {
     const slides = [...gallery.querySelectorAll('[data-slide]')];
     const dots = [...gallery.querySelectorAll('[data-dot]')];
     const previous = gallery.querySelector('[data-previous]');
     const next = gallery.querySelector('[data-next]');
     const status = gallery.querySelector('#gallery-status');
     const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
     const pauses = new Set();
     const count = slides.length;
     let activeIndex = 0;
     let timerId = null;
     let pointerStart = null;

     const clearTimer = () => {
       if (timerId !== null) window.clearTimeout(timerId);
       timerId = null;
     };

     const canAutoplay = () => count > 1 && !reducedMotion.matches && !document.hidden && pauses.size === 0;

     const scheduleAutoplay = () => {
       clearTimer();
       if (!canAutoplay()) return;
       timerId = window.setTimeout(() => {
         show(nextIndex(activeIndex, count), false);
       }, 6000);
     };

     const show = (index, announce = true) => {
       activeIndex = ((index % count) + count) % count;
       slides.forEach((slide, slideIndex) => {
         const current = slideIndex === activeIndex;
         slide.dataset.offset = String(relativeOffset(slideIndex, activeIndex, count));
         slide.setAttribute('aria-hidden', String(!current));
       });
       dots.forEach((dot, dotIndex) => {
         if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
         else dot.removeAttribute('aria-current');
       });
       status.setAttribute('aria-live', announce ? 'polite' : 'off');
       status.textContent = `Photo ${activeIndex + 1} of ${count}`;
       scheduleAutoplay();
     };

     const setPause = (reason, paused) => {
       if (paused) pauses.add(reason);
       else pauses.delete(reason);
       scheduleAutoplay();
     };

     gallery.classList.add('is-enhanced');
     previous.addEventListener('click', () => show(previousIndex(activeIndex, count)));
     next.addEventListener('click', () => show(nextIndex(activeIndex, count)));
     dots.forEach((dot) => dot.addEventListener('click', () => show(Number(dot.dataset.dot))));
     gallery.addEventListener('keydown', (event) => {
       if (event.key === 'ArrowLeft') { event.preventDefault(); show(previousIndex(activeIndex, count)); }
       if (event.key === 'ArrowRight') { event.preventDefault(); show(nextIndex(activeIndex, count)); }
     });
     gallery.addEventListener('pointerenter', () => setPause('hover', true));
     gallery.addEventListener('pointerleave', () => setPause('hover', false));
     gallery.addEventListener('focusin', () => setPause('focus', true));
     gallery.addEventListener('focusout', () => queueMicrotask(() => setPause('focus', gallery.contains(document.activeElement))));
     gallery.addEventListener('pointerdown', (event) => {
       if (!event.target.closest('button')) pointerStart = { id: event.pointerId, x: event.clientX };
     });
     gallery.addEventListener('pointerup', (event) => {
       if (!pointerStart || pointerStart.id !== event.pointerId) return;
       const delta = event.clientX - pointerStart.x;
       pointerStart = null;
       if (Math.abs(delta) >= 40) show(delta < 0 ? nextIndex(activeIndex, count) : previousIndex(activeIndex, count));
     });
     gallery.addEventListener('pointercancel', () => { pointerStart = null; });
     document.addEventListener('visibilitychange', () => setPause('hidden', document.hidden));
     reducedMotion.addEventListener('change', scheduleAutoplay);
     show(0, false);
   }
   ```

3. Run the module GREEN command and then the full suite:

   ```powershell
   npm run test:carousel
   npm test
   ```

   **Expected GREEN outcome:** both commands exit 0. The state tests prove circular navigation and offsets; the full suite also re-confirms the static hero contract.

## [ ] 5. Refine against responsive and accessibility requirements without broadening scope

**Files modified:** none  
**Files created:** none

1. Preserve the semantic reading order: header/navigation, hero copy, then gallery. Do not use CSS `order` to cause assistive technology to encounter photographs before the heading and lede.
2. At 1440px, retain a balanced two-column grid with copy on the left and the large deck on the right. At 1024px, retain the split layout with reduced gap. At 768px and below, stack copy before gallery. At 390px and 320px, preserve the 32px shell width calculation, wrapping navigation, full-width stacked actions, 44px controls, and no page-level horizontal overflow.
3. Keep captions and control rail outside the photographic canvas. Keep the layered images cropped with `object-fit: cover`, but do not add opaque captions, gradients, badges, or text over faces.
4. Retain the exact keyboard and motion behavior: buttons remain focusable real buttons; ArrowLeft and ArrowRight only act while focus is inside `.gallery`; `aria-current`, `aria-hidden`, and the polite status are updated by `show`; reduced-motion users receive no autoplay; hover, focus, and hidden-document states stop the active timer; only `scheduleAutoplay` creates its single timeout.
5. Repeat static and unit checks after any refinement:

   ```powershell
   npm test
   npm run verify:static
   ```

   **Expected outcome:** both commands exit 0. Automated checks remain required even after manual review.

### Manual responsive review matrix

No browser or Playwright executable is available globally in the stated environment, so this review must be performed later in an available browser and must not be represented as an automated browser test.

| Viewport | Required observations |
| --- | --- |
| 1440px | Header is restrained; copy and large photo deck form a calm split composition; all five cards are visibly layered; faces are unobscured; neither column feels crowded. |
| 1024px | Two columns remain legible; heading, CTAs, caption rail, and deck do not collide; deck remains larger than its controls. |
| 768px | Copy appears above gallery; navigation wraps without clipping; gallery retains full control access; no horizontal scrollbar appears. |
| 390px | Heading wraps naturally without clipping; buttons stack; caption rail stacks; 44px previous/next controls and dots are tappable; imagery remains prominent. |
| 320px | The page has no horizontal overflow; navigation and proof labels wrap; all approved copy remains readable; card stack is contained; controls remain reachable. |

### Accessibility checklist

- [ ] Exactly one visible H1 contains `Skilled minds, ready to solve.`.
- [ ] Header, navigation, main, hero section, and gallery all have meaningful landmarks or labels.
- [ ] Each of the five directly referenced photos has its own descriptive alt text and every source original remains unchanged.
- [ ] Tab order reaches navigation, CTAs, gallery, previous/next, and all five dots in document order; visible focus has sufficient contrast.
- [ ] Previous/next and dot controls work with Enter and Space because they are native buttons.
- [ ] Arrow keys operate the carousel only when the gallery has focus; focus never moves unexpectedly after a slide change.
- [ ] The live status says the current photo number without repeatedly announcing background autoplay activity to a user who is not interacting.
- [ ] Text, controls, and focus indicators meet a minimum 4.5:1 contrast target against their immediate backgrounds.
- [ ] `prefers-reduced-motion: reduce` prevents autoplay and effectively removes transition motion.

## [ ] 6. Perform final repository-native verification, local HTTP checks, and concise usage documentation

**Files created:** `README.md`  
**Files modified:** none

1. Create `README.md` with this concise, factual section and no business claims:

   ```md
   # AXORA Hero

   ## Local preview

   Run `python -m http.server 4173 --directory .` and open `http://127.0.0.1:4173/` in a browser.

   ## Checks

   Run `npm test` for the Node-built-in markup and carousel-state tests.
   ```

2. Run the final automated suite:

   ```powershell
   npm test
   npm run verify:static
   ```

   **Expected outcome:** both commands exit 0 with all static acceptance and carousel-state tests passing.

3. Start a local static server in one terminal; this command intentionally stays running while the server is needed:

   ```powershell
   python -m http.server 4173 --directory .
   ```

4. In a second terminal, run mechanical HTTP assertions that require no browser installation. They verify the root response, the single H1 text in the served document, root references to each URL-encoded source path, and HTTP 200 for every source photograph:

   ```powershell
   $root = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/'
   if ($root.StatusCode -ne 200) { throw "Root returned HTTP $($root.StatusCode)" }
   if (($root.Content | Select-String -AllMatches '<h1\b[^>]*>Skilled minds, ready to solve\.</h1>').Matches.Count -ne 1) { throw 'Expected exactly one approved H1 in root response' }
    $assets = @(
      'Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg',
      'Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg',
      'Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg',
      'Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg',
      'Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg'
   )
   foreach ($asset in $assets) {
     if ($root.Content -notmatch [regex]::Escape($asset)) { throw "Root does not reference $asset" }
     $assetResponse = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:4173/$asset"
     if ($assetResponse.StatusCode -ne 200) { throw "$asset returned HTTP $($assetResponse.StatusCode)" }
   }
   'Local hero HTTP assertions passed.'
   ```

   **Expected outcome:** the final line is `Local hero HTTP assertions passed.`. Stop the local server after this check.

5. Record the future post-deploy smoke assertion without inventing a Netlify domain: fetch the exact Netlify HTTPS root supplied by the completed deployment. It must return HTTP 200, its response must contain exactly one H1 with `Skilled minds, ready to solve.`, and that same root response must reference all five paths below:

    - `Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg`
    - `Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg`
    - `Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg`
    - `Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg`
    - `Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg`

   A Netlify HTTPS root is not available in the current repository context, so do not claim this future infrastructure assertion has been run until deployment supplies its exact URL.

## Final acceptance criteria

- [ ] The result is hero-only: it does not add later description, services, story, or team sections.
- [ ] `index.html`, `styles.css`, `script.js`, and `carousel-state.js` use the stated dependency-light architecture; there is no framework, build step, CSS library, remote JavaScript, analytics, icon package, or form backend.
- [ ] The header contains AXORA and links only to the approved future `#services`, `#story`, and `#team` destinations; the hero uses only the approved copy and factual proof labels.
- [ ] All five original `Hero Image/` files remain present and untouched, and the page references each one directly through its exact URL-encoded source path in this plan.
- [ ] The page has one H1, semantic landmarks, descriptive image alternatives, visible focus, 44px control targets, sufficient contrast, sensible reading order, and a reduced-motion path.
- [ ] The carousel is progressively enhanced and supports five images, dots, previous/next controls, gallery-local arrow keys, guarded autoplay, hover/focus/document-hidden pause handling, safe resume, and simple pointer swipe without duplicate timers.
- [ ] The page has been reviewed at 1440px, 1024px, 768px, 390px, and 320px with no horizontal overflow and mobile copy above the gallery.
- [ ] `npm test`, `npm run verify:static`, and the local mechanical HTTP assertions pass; browser-based visual verification is reported only after a browser is actually available.
- [ ] The future exact Netlify HTTPS-root assertion returns HTTP 200 and finds the sole approved H1 plus references to every exact URL-encoded hero source path.
