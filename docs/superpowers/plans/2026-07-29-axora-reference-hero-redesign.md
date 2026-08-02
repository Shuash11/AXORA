# AXORA Reference-Faithful Hero Redesign Plan

## Status and direction

This plan supersedes the visual direction of `docs/superpowers/plans/2026-07-29-axora-hero.md`. That earlier plan remains historical; it must not guide further visual work. The approved direction is the warm, restrained hero in `C:\Users\joashua\Downloads\handled-team-hero.html`, populated with AXORA's five supplied photographs.

The work remains hero-only. Do not add `#description`, `#team`, `#work`, or `#contact` sections yet, and do not modify any file under `Hero Image/`.

## Exact file map

| Path | Responsibility |
| --- | --- |
| `tests/hero-markup.test.mjs` | Node-built-in static acceptance contract for the reference hero, local images, CSS, and controller source. |
| `tests/carousel-state.test.mjs` | Existing pure state-helper test; leave unchanged. |
| `index.html` | Hero-only semantic markup, navigation, five complete achievement cards, dots, and hidden status. |
| `styles.css` | Warm reference visual system, responsive stacked-card composition, accessibility styles, and motion fallback. |
| `script.js` | Carousel rendering and lifecycle plus the warm cursor glow. |
| `carousel-state.js` | Existing circular index and relative-position helper; reuse without changing its contract unless a controller integration defect requires a narrowly scoped repair. |
| `docs/superpowers/plans/2026-07-29-axora-reference-hero-redesign.md` | This implementation plan and future verification record. |

## Locked content and assets

- Brand: `AXORA` followed by a honey period.
- Eyebrow: `OUR TEAM`.
- Heading markup: `Skilled hands,` then `<br>` then `<em>ready to help.</em>`.
- Lede: `Meet AXORA—the skilled virtual assistants behind every task, system, and solution, ready to make your digital work run smoother.`
- Primary action: `Meet the team ↓` to `#team`.
- Secondary action: `See what we handle →` to `#description`.
- Navigation targets: `#description`, `#team`, `#work`, and `Let’s talk` to `#contact`.
- Trust strip: `Tech support`, `Virtual assistance`, and `Human-first`, separated by dots. Do not add counts, metrics, award placement, clients, coverage hours, or contact details.

Keep these image-file, URL, and alt-text pairs exactly, including the two visually identical first photos as separate cards:

| Card | File and page `src` | Exact `alt` |
| --- | --- | --- |
| 1 | `Hero Image/755941564_2053703328575625_420494940045368523_n.jpg` / `Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg` | `AXORA team members together on the IT Summit and Code Camp Season 4 stage in Ozamiz City.` |
| 2 | `Hero Image/755941564_2053703328575625_420494940045368523_n (1).jpg` / `Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg` | `AXORA team members posed onstage at IT Summit and Code Camp Season 4 in Ozamiz City.` |
| 3 | `Hero Image/755690039_2254034195393709_1404549311183090400_n.jpg` / `Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg` | `AXORA team members celebrating around a table while holding a certificate and trophy at Code Camp Season 4 in Ozamiz City.` |
| 4 | `Hero Image/755538558_27737088675918586_7287023157067586050_n.jpg` / `Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg` | `AXORA team members in a closer onstage group photo at Code Camp Season 4 in Ozamiz City.` |
| 5 | `Hero Image/753550594_854922847701273_1471309818899059976_n.jpg` / `Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg` | `AXORA team members in a wide full-group stage photograph at IT Summit and Code Camp Season 4 in Ozamiz City.` |

Every image remains `2048` by `1536`, uses `decoding="async"` and `draggable="false"`; only the first is eager with high fetch priority and cards two through five are lazy.

## Ordered RED/GREEN work

### 1. RED — establish and retain the reference contract

`tests/hero-markup.test.mjs` is the first change. It uses only `node:test`, `node:assert/strict`, and `node:fs`; it intentionally rejects the blue editorial collage. It checks the locked copy, anchor targets, trust strip, five card records, exact image mapping, dot-only controls, carousel semantics, warm design tokens, visual dimensions, responsive tiers, accessibility safeguards, and controller behaviors. It explicitly forbids `--cobalt`, `--ember`, Bricolage Grotesque, Instrument Sans, and `.gallery-deck`.

The test is expected to be RED until the following HTML, CSS, and JavaScript work is complete. Keep `tests/carousel-state.test.mjs` unchanged.

### 2. GREEN — replace the HTML composition, not the old collage

In `index.html`, replace the existing header and hero rather than decorating the blue gallery. Add one ambient `<div id="glow" aria-hidden="true"></div>`, then center the header and hero in `.wrap`. Use `.top` for restrained navigation, `.hero-text` for the left column, and one keyboard-focusable `.hero-stack` on the right:

- `.hero-stack` is `role="region"`, `aria-roledescription="carousel"`, labelled `AXORA team achievements`, and `tabindex="0"`.
- Place a `.stack` inside it with exactly five complete article cards. Before JavaScript runs, card 0 is `<article class="card" data-slide="0" data-position="0" aria-hidden="false">`; cards 1 and 2 use `data-position="1"` and `data-position="2"` with `aria-hidden="true"`; cards 3 and 4 use `data-position="-2"` and `data-position="-1"` in either order with `aria-hidden="true"`. Thus exactly one initial card is exposed and the two next cards are visibly stacked. Each card contains `.card-photo` with a real `<img>`, `.card-body`, `.card-tag`, `.card-stat`, `.card-stat-label`, and `.card-attribution`.
- Use the following card data in order: 

  | Card | Photo tag | Category | Statement | Supporting line | Attribution |
  | --- | --- | --- | --- | --- | --- |
  | 1 | `IT Summit · Code Camp S4` | `Team milestone` | `Built to solve` | `AXORA showing up, learning, and building together.` | `Ozamiz City · July 25, 2026` |
  | 2 | `One team, shared focus` | `Collaboration` | `Ready together` | `Skilled support starts with people who work as one.` | `AXORA · Code Camp Season 4` |
  | 3 | `The people behind AXORA` | `Human-led` | `Hands-on support` | `Real people helping make everyday digital work easier.` | `Team moment · Ozamiz City` |
  | 4 | `Technology, made human` | `Tech assistance` | `Clear. Capable.` | `Practical help for websites, systems, content, and more.` | `AXORA · IT Summit 2026` |
  | 5 | `A wider circle of support` | `People first` | `Ready to help` | `A skilled team grounded in curiosity and collaboration.` | `Ozamiz City · 2026` |

- After the stack, add five real `button` dot controls using `data-dot="0"` through `data-dot="4"`; do not add visible prior/next controls.
- Add `<p class="carousel-status sr-only" role="status" aria-live="polite">` for announced position changes. It is visually hidden but remains available to assistive technology.

### 3. GREEN — implement the warm reference CSS

In `styles.css`, remove the cobalt/ember/grid-collage system and use `#211A15` background, `#2C231C` panel, `#362B22` soft panel, `#F5EFE4` primary cream, `#B8AA97` dim cream, `#E7A23A` honey, and `#6FB3A0` teal. Load and assign Lora for display, Plus Jakarta Sans for body copy, and Space Mono for labels.

Set `.wrap` to a 1240px maximum with 40px desktop gutters. Make the desktop hero grid `1.05fr 0.95fr`: compact left copy and right-aligned stack. Make `.stack` 336px by 452px; `.card` has a 22px radius; `.card-photo` occupies 54% of it. The active card sits in front, only `data-position="1"` and `data-position="2"` visibly offset behind it, and all other positions are visually hidden. Use 1.5-second eased card transitions.

Style dots as 44px by 44px hit targets with 7px visual dots and a 22px honey active indicator. Include an overflow-x guard, clear `:focus-visible` treatment, and robust `.sr-only` clipping. At `max-width: 900px`, stack and center the hero. At `max-width: 420px`, size the stack at about 280px by 420px. Under `prefers-reduced-motion: reduce`, remove transitions/animation and keep `#glow` static and non-drifting.

### 4. GREEN — integrate carousel and glow behavior

In `script.js`, select `.hero-stack`, its `.stack`, `data-slide` cards, dots, status, and `#glow`. Continue to use `nextIndex`, `previousIndex`, `normalizeIndex`, and `relativeOffset` from `carousel-state.js`.

On every render, set `card.dataset.position` from `relativeOffset`, make only the active card exposed with `aria-hidden`, update `aria-current` on all dots, and use the live status only for announced user changes. Dot click, ArrowLeft/ArrowRight while the region contains focus, and horizontal pointer swipe must change cards. Prevent native drag and retain `touch-action: pan-y` behavior.

Autoplay uses one guarded 3200ms timeout. It pauses while hovered, focused within, or document-hidden; it resumes safely afterward, clears any existing timer before scheduling, and remains disabled under reduced motion. The `#glow` pointer movement is batched through `requestAnimationFrame`; reduced motion must return before scheduling cursor drift.

### 5. GREEN — verify source and browser behavior

Run the static hero acceptance test and the unchanged pure carousel-state test after implementation. Resolve every reference-contract failure without weakening the test. In a browser, inspect desktop, a width at or below 900px, and a width at or below 420px; verify the warm two-column-to-stacked layout, three visible card layers, no arrow controls, dot hit areas, focus outline, the static reduced-motion glow, and no horizontal overflow.

Manually verify keyboard ArrowLeft/ArrowRight, each dot, left/right swipe, image drag prevention, a single 3.2-second autoplay progression, pause/resume on hover and focus, and pause/resume when the document visibility changes. Confirm only the active card is exposed to assistive technology and that the status announces explicit changes.

## Future deployment smoke assertion

After a deployment reports its Netlify HTTPS root, assert that the exact reported HTTPS root returns HTTP 200, contains exactly one H1 whose text is `Skilled hands, ready to help.`, and references all five exact URL-encoded image paths listed in this plan. This is a future post-deploy assertion, not authorization to deploy or publish.

## Direct-file runtime and 3D motion repair

Opening `file:///C:/projects/AXORA/index.html` leaves the status at `Card 1 of 5`, leaves card positions static, and leaves the glow transform at its origin after pointer movement. The browser reports that `file:///C:/projects/AXORA/script.js` is blocked by the CORS policy (`net::ERR_FAILED`): the module controller imports `carousel-state.js`, and module fetching is unavailable from the `null` file origin.

- **RED:** Extend `tests/hero-markup.test.mjs` without changing `tests/carousel-state.test.mjs` to require a classic deferred `script.js`, local circular helpers with positive-count validation, real-pointer glow smoothing, and the accessible 3D source contract.
- **GREEN:** Change only `index.html`, `styles.css`, and `script.js`. Load `script.js` as a classic deferred script, keep the independently tested `carousel-state.js` history untouched, and place small local copies of its helpers in the classic controller so both `file://` and HTTP work.
- **3D behavior:** Keep the warm brown/cream/honey/teal reference composition and three visible layers. Give `.stack` perspective and preserved depth; keep inactive cards receding while only the active card receives bounded pointer tilt. Move the approximately 640px warm glow toward actual viewport pointer coordinates through one settling `requestAnimationFrame` loop.
- **Accessibility and interaction:** Preserve dots, keyboard arrows, swipe, 3200ms autoplay, hover/focus/visibility pause, live status, `aria-hidden`, and direct image behavior. Under reduced motion, stop autoplay and glow drift, reset/disable tilt, and remove effective transitions. Small touch screens retain swipe and depth without hover dependence or horizontal overflow.
- **Browser acceptance:** Verify the direct `file://` page and the HTTP-served page at desktop and mobile widths, including card movement, visible glow travel, three-layer geometry, image loads, keyboard/dot/swipe behavior, pause lifecycle, and reduced-motion behavior.

The future Netlify HTTPS smoke assertion above remains unchanged.
