# AXORA Spatial Atelier Landing Page Design

## Status

Approved on July 30, 2026.

This design replaces the current hero-only scope with a complete single-page AXORA landing page. It preserves the existing warm brand direction, five supplied event photographs, dependency-free implementation, and accessible carousel behavior while extending the experience with restrained CSS 3D depth.

## Goal

Create an immersive but elegant landing page that presents AXORA as a four-person team offering web applications, mobile applications, design, and other technical support. The page should feel like a warm digital atelier rather than a generic software landing page.

The experience must remain readable, responsive, keyboard accessible, and useful without JavaScript. Three-dimensional effects should strengthen hierarchy and tactility without obscuring content, hijacking scroll, or adding continuous decorative motion.

## Scope

The page contains these sections in this order:

1. Home hero
2. Services
3. Team
4. Contact
5. Footer

The primary navigation links to `#home`, `#services`, `#team`, and `#contact`.

The current five-photo carousel remains part of the hero. The Team section contains exactly four placeholder member cards. Selecting a team card opens a detail modal containing placeholder biography, achievements, and selected work for that member.

## Non-Goals

- No WebGL, Three.js, framework, build system, CSS library, or external JavaScript dependency.
- No backend, form submission service, analytics, CMS, authentication, or persistent data.
- No dedicated team profile routes in this version.
- No invented clients, testimonials, awards, project metrics, contact details, or individual team identities.
- No modification, renaming, recompression, or deletion of files under `Hero Image/`.
- No scroll hijacking, custom cursor, continuous object spinning, or motion required to understand content.

## Information Architecture

### Header

Use a restrained sticky header inside the page shell:

- AXORA wordmark with the existing honey-colored period.
- Links for Home, Services, Team, and Contact.
- A compact `Let's talk` action linking to `#contact`.
- A mobile navigation toggle with native button semantics, an accessible name, and an expanded state.

The header gains a slightly more opaque smoked-glass surface after `window.scrollY` exceeds 24px, but it must not become a floating rounded capsule.

### Home Hero

Retain the approved core copy:

- Eyebrow: `OUR TEAM`
- Heading: `Skilled hands,` followed by `ready to help.` as the emphasized line.
- Lede: `Meet AXORA—the skilled virtual assistants behind every task, system, and solution, ready to make your digital work run smoother.`
- Primary action: `Explore our services` linking to `#services`.
- Secondary action: `Meet the team` linking to `#team`.
- Proof line: `Web apps`, `Mobile apps`, `Design`, and `Tech support`.

The right side is a spatial photo assembly using all five existing AXORA event photographs. It keeps dots, keyboard arrows, pointer swipe, autoplay lifecycle, live status, and active-slide semantics from the current carousel.

### Services

Introduce the section with the heading `What we build and support` and concise copy that frames the work as practical digital assistance.

Present four services in an asymmetric composition rather than four identical cards:

1. `Web applications` — `Responsive web experiences and practical browser-based tools shaped around the way you work.`
2. `Mobile applications` — `Focused mobile products and companion experiences designed for everyday use.`
3. `UI/UX and visual design` — `Clear interfaces, thoughtful interaction flows, and visual systems that make digital products easier to use.`
4. `Technical support` — `Flexible help with websites, systems, content updates, troubleshooting, and other day-to-day digital tasks.`

These statements intentionally avoid claiming specific frameworks, platforms, clients, delivery volume, or guaranteed outcomes.

### Team

Introduce the section with the heading `Four people, one shared standard` and supporting text explaining that AXORA combines different technical and creative strengths.

Render exactly four interactive member cards with these visible placeholder values:

| Card | Name | Role | Marker |
| --- | --- | --- | --- |
| 1 | `Team Member 01` | `Role / specialty` | `01` |
| 2 | `Team Member 02` | `Role / specialty` | `02` |
| 3 | `Team Member 03` | `Role / specialty` | `03` |
| 4 | `Team Member 04` | `Role / specialty` | `04` |

Use designed typographic portrait placeholders rather than fabricated headshots or crops that imply a specific person. Each complete card is one real button and includes the prompt `View work and achievements`.

### Team Detail Modal

Selecting a member opens one native modal dialog populated for that member. The visible placeholder content is:

- Name: the selected `Team Member 01–04` value.
- Role: `Role / specialty`.
- Biography: `Add this team member's short biography, focus, and approach here.`
- Achievement 1: `Achievement placeholder 01`.
- Achievement 2: `Achievement placeholder 02`.
- Work item 1: `Project placeholder 01` with `Add a short project summary and contribution.`
- Work item 2: `Project placeholder 02` with `Add a short project summary and contribution.`

The modal includes a visible `Placeholder content` label so draft information cannot be mistaken for published facts.

### Contact

End the main content with a focused contact panel:

- Heading: `Have something useful to build?`
- Supporting copy: `Tell us what you are working on and where you need a capable extra set of hands.`
- Email placeholder: `your-email@example.com`.
- Visible note: `Replace this email before launch.`
- Action: `Start a conversation` using `mailto:your-email@example.com`.

There is no form or submission behavior in this version.

### Footer

The footer repeats the AXORA wordmark, the four section links, and a concise line: `Web apps, mobile apps, design, and practical tech support.` It does not add social links until real destinations are supplied.

## Visual System

### Direction

The page uses a warm digital atelier aesthetic. It should feel tactile, crafted, and technical without becoming glossy science fiction.

Use these existing colors as the foundation:

- Page brown: `#211A15`
- Raised panel brown: `#2C231C`
- Soft panel brown: `#362B22`
- Primary cream: `#F5EFE4`
- Dim cream: `#B8AA97`
- Honey accent: `#E7A23A`
- Teal accent: `#6FB3A0`

Honey remains the primary action and focus color. Teal is a secondary informational accent. Do not introduce another competing accent hue.

### Materials

Build depth with:

- Smoked translucent surfaces.
- Matte paper-like cards.
- Thin warm edge highlights.
- Soft, broad shadows rather than hard black drop shadows.
- Subtle grain at low opacity.
- Radial honey and teal illumination with no large multicolor gradient fields.

Use one radius system: small controls, medium service surfaces, and large feature panels. Pills are reserved for compact labels and actions, not every container.

### Typography

- Lora remains the display face for the wordmark, major headings, and selected expressive phrases.
- Plus Jakarta Sans remains the body and interface face.
- Space Mono remains limited to labels, counters, card markers, and technical metadata.

Headings use clear size contrast, compact line height, and restrained italic emphasis. Body text remains at least 16px on small screens. Avoid uppercase eyebrow labels above every section; only the hero and Services section use them.

## Spatial Composition

### Hero Depth

The hero scene has three bounded planes inside one perspective container:

1. Rear plane: low-opacity rings, grain, and honey/teal illumination.
2. Middle plane: the five-photo carousel stack.
3. Front plane: compact event label, slide count, and one thin framing element.

Only the active photo receives pointer tilt. Adjacent cards recede using `translateZ`, scale, vertical offset, and small rotation. Inactive cards never overlap the hero copy or leave the scene bounds.

### Services Depth

The service composition uses one larger Web applications panel, two medium Mobile applications and UI/UX panels, and one wide Technical support rail. Their varied proportions create rhythm without fabricating hierarchy of business importance.

On fine-pointer devices, a service surface may tilt by no more than four degrees and lift by no more than eight pixels. Keyboard focus receives the same visual prominence without requiring pointer coordinates.

### Team Depth

The four team cards form a two-by-two field on desktop. Alternating cards begin with small Z offsets and vertical shifts, but all names and actions align to a stable reading grid. A selected card visually lifts forward before the modal appears. This pre-transition is skipped under reduced motion.

### Modal Depth

The dialog uses a smoked backdrop and a two-plane panel: identity summary in front and achievements/work behind on desktop. On small screens, those planes flatten into one vertical reading order. Depth never changes tab order.

## Interaction Design

### Shared Motion Controller

Use one requestAnimationFrame scheduler for pointer and scroll-derived CSS variables. It updates only while values are settling and stops when there is no pending movement. Pointer values are normalized to `-1` through `1` and clamped before being exposed as CSS custom properties.

Do not attach independent animation loops to every card.

### Carousel

Preserve these behaviors:

- Five exact local image sources and descriptive alternatives.
- Dot selection.
- ArrowLeft and ArrowRight while focus is within the carousel.
- Horizontal swipe with vertical-gesture protection.
- Native image drag prevention.
- One guarded timeout for autoplay.
- Autoplay pause during hover, focus within, document hiding, or reduced motion.
- `aria-current` on the active dot.
- `aria-hidden` on inactive cards.
- A visually hidden live status for explicit user changes.

The carousel transitions through depth. Autoplay must not trigger live announcements.

### Team Dialog

Use one reusable native `dialog` element. Member buttons identify their member index through data attributes. Opening the dialog:

1. Records the initiating button.
2. Populates the approved placeholder fields.
3. Calls `showModal()`.
4. Places focus on the close button or dialog heading.

The dialog closes through its close button, Escape, or a pointer event on the backdrop itself. Closing restores focus to the initiating member button. Focus remains inside the modal through native dialog behavior.

### Mobile Navigation

The navigation toggle updates `aria-expanded` and the menu's visibility. Selecting any navigation link closes the mobile menu. Escape also closes it and restores focus to the toggle.

## Progressive Enhancement and Failure Behavior

The HTML contains the complete hero copy, all services, four team summaries, contact information, and all five images before JavaScript executes.

Without JavaScript:

- Navigation links remain ordinary anchors.
- Hero images display in a static layered arrangement with the first image in front and the remaining images visibly offset behind it.
- Service and team cards remain visible.
- Team detail buttons do not falsely imply successful modal behavior; enhancement adds their interactive state only after dialog initialization succeeds.
- Contact remains a normal mail link.

JavaScript initialization is independently guarded for navigation, carousel, spatial motion, and dialog behavior. Failure in one enhancement must not prevent the others from initializing.

Known image paths are verified by automated tests. CSS supplies a panel background behind each image so late loading does not expose the page background.

## Responsive Behavior

### Desktop: 1024px and wider

- Header shows the full navigation.
- Hero uses two columns with copy on the left and the spatial photo scene on the right.
- Services use the asymmetric four-module composition.
- Team uses a two-by-two field.
- Modal uses a wide two-column interior.

### Tablet: 768px to 1023px

- Hero stacks copy above the photo scene.
- The photo scene retains overlapping cards with reduced offsets.
- Services become two columns while preserving one wide support rail.
- Team remains two columns throughout this range.
- Modal becomes a single-column panel with a constrained height and internal scroll.

### Mobile: below 768px

- Navigation uses the menu toggle.
- All sections use one column in document order.
- Hero perspective and card offsets are reduced to prevent clipping.
- Services become a clear vertical sequence.
- Team cards become one column.
- Modal becomes a near-full-height bottom sheet.
- Decorative rear-plane objects are reduced or hidden.
- Horizontal overflow is prohibited down to a 320px viewport.

On coarse-pointer devices, pointer tilt and cursor-following illumination are disabled. Swipe remains available for the carousel.

## Accessibility

- Use semantic header, navigation, main, section, dialog, and footer landmarks.
- Keep exactly one H1.
- Give every interactive link, button, dot, and menu control a hit area of at least 44px in both dimensions.
- Preserve clear visible focus using honey against the dark surfaces.
- Maintain at least 4.5:1 contrast for body copy and interface labels.
- Ensure visual depth never changes semantic reading or tab order.
- Ensure the mobile menu and dialog report expanded/open state correctly.
- Preserve descriptive alternatives for all supplied photographs.
- Keep background autoplay silent to assistive technology.
- Under `prefers-reduced-motion: reduce`, disable autoplay, smooth scrolling, tilt, parallax, pre-modal lift, and effective depth transitions.

## File Responsibilities

| Path | Responsibility |
| --- | --- |
| `index.html` | Complete semantic landing page, five-photo hero, four services, four team placeholders, reusable dialog, contact panel, and footer. |
| `styles.css` | Warm visual tokens, spatial layouts, responsive states, focus treatment, dialog presentation, and reduced-motion fallbacks. |
| `script.js` | Guarded navigation, carousel, shared spatial-motion scheduler, service/team tilt, and dialog behavior. |
| `carousel-state.js` | Existing DOM-free circular carousel helpers; preserve its public contract. |
| `tests/hero-markup.test.mjs` | Expand the existing source contract to cover the full landing page and enhancement safeguards; do not rename the file. |
| `tests/carousel-state.test.mjs` | Preserve carousel helper coverage. |

Keep the implementation dependency-free and direct-file compatible.

## Verification Strategy

### Automated

Update the Node-built-in source tests to verify:

- Exactly one H1 and all four section anchors.
- Exact approved hero copy.
- Exact mapping and existence of all five supplied image files.
- Exactly four named service entries.
- Exactly four team member cards with the approved placeholder values.
- One native dialog with biography, achievement, work, close, and placeholder-content hooks.
- Exact contact placeholder and replacement warning.
- Mobile navigation semantics.
- Shared requestAnimationFrame motion source rather than independent loops.
- Carousel keyboard, swipe, guarded autoplay, and live-status behavior.
- Required desktop, tablet, mobile, coarse-pointer, and reduced-motion CSS guards.
- Focus styles, minimum control sizing, overflow protection, and screen-reader-only utility.

Continue to run the pure carousel-state tests unchanged unless a demonstrated helper defect requires a narrow update.

### Browser Review

Review at viewport widths of 1440px, 1024px, 768px, 390px, and 320px. Verify:

- No horizontal overflow or clipped controls.
- Stable text hierarchy and readable content over every surface.
- Bounded pointer depth and no overlap with hero copy.
- Carousel dots, keyboard arrows, swipe, autoplay pause/resume, and image drag prevention.
- Mobile menu open, link selection, Escape close, and focus restoration.
- Four member cards and correct member-specific modal content.
- Modal close button, Escape, backdrop close, focus containment, and focus restoration.
- Coarse-pointer behavior without hover dependence.
- Reduced-motion behavior with all content and actions intact.
- Direct `file://` and local HTTP behavior.

## Acceptance Criteria

- The result is a complete single-page AXORA landing page with Home, Services, Team, and Contact sections.
- The design uses the approved warm spatial atelier direction and one restrained 3D system.
- Services cover web applications, mobile applications, UI/UX and visual design, and technical support using only the approved factual draft copy.
- The Team section contains exactly four explicit placeholder profiles.
- Selecting any team member opens an accessible detail modal with explicit biography, achievement, and work placeholders for that member.
- The five supplied photographs and current accessible carousel capabilities are preserved.
- The page is dependency-free, direct-file compatible, progressively enhanced, and useful without JavaScript.
- Desktop, tablet, mobile, coarse-pointer, and reduced-motion experiences remain complete and readable.
- Repository-native automated checks and the browser review matrix pass without weakening existing accessibility coverage.
