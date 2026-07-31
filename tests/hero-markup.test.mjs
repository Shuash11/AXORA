import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const script = readFileSync('script.js', 'utf8');

const cards = [
  {
    file: 'Hero Image/755941564_2053703328575625_420494940045368523_n.jpg',
    src: 'Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg',
    alt: 'AXORA team members together on the IT Summit and Code Camp Season 4 stage in Ozamiz City.',
    photoTag: 'IT Summit · Code Camp S4',
    category: 'Team milestone',
    statement: 'Built to solve',
    supporting: 'AXORA showing up, learning, and building together.',
    attribution: 'Ozamiz City · July 25, 2026',
  },
  {
    file: 'Hero Image/755941564_2053703328575625_420494940045368523_n (1).jpg',
    src: 'Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg',
    alt: 'AXORA team members posed onstage at IT Summit and Code Camp Season 4 in Ozamiz City.',
    photoTag: 'One team, shared focus',
    category: 'Collaboration',
    statement: 'Ready together',
    supporting: 'Skilled support starts with people who work as one.',
    attribution: 'AXORA · Code Camp Season 4',
  },
  {
    file: 'Hero Image/755690039_2254034195393709_1404549311183090400_n.jpg',
    src: 'Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg',
    alt: 'AXORA team members celebrating around a table while holding a certificate and trophy at Code Camp Season 4 in Ozamiz City.',
    photoTag: 'The people behind AXORA',
    category: 'Human-led',
    statement: 'Hands-on support',
    supporting: 'Real people helping make everyday digital work easier.',
    attribution: 'Team moment · Ozamiz City',
  },
  {
    file: 'Hero Image/755538558_27737088675918586_7287023157067586050_n.jpg',
    src: 'Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg',
    alt: 'AXORA team members in a closer onstage group photo at Code Camp Season 4 in Ozamiz City.',
    photoTag: 'Technology, made human',
    category: 'Tech assistance',
    statement: 'Clear. Capable.',
    supporting: 'Practical help for websites, systems, content, and more.',
    attribution: 'AXORA · IT Summit 2026',
  },
  {
    file: 'Hero Image/753550594_854922847701273_1471309818899059976_n.jpg',
    src: 'Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg',
    alt: 'AXORA team members in a wide full-group stage photograph at IT Summit and Code Camp Season 4 in Ozamiz City.',
    photoTag: 'A wider circle of support',
    category: 'People first',
    statement: 'Ready to help',
    supporting: 'A skilled team grounded in curiosity and collaboration.',
    attribution: 'Ozamiz City · 2026',
  },
];

const classCount = (source, className) => [...source.matchAll(/\bclass=(['"])(.*?)\1/gi)]
  .filter((match) => match[2].split(/\s+/).includes(className)).length;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('hero source contains the locked AXORA copy, restrained navigation, and trust strip', () => {
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<section\b/gi) ?? []).length, 2, 'hero-only scope permits only the outer hero and nested carousel sections');
  assert.match(html, /<main\b/i);
  assert.match(html, /<section[^>]+id="hero"/i);
  assert.match(html, /AXORA<span aria-hidden="true">\.<\/span>/);
  assert.match(html, /<p class="eyebrow">OUR TEAM<\/p>/);
  assert.match(html, /<h1\b[^>]*>\s*Skilled hands,\s*<br\s*\/?>(?:\s*)<em>ready to help\.<\/em>\s*<\/h1>/i);
  assert.match(html, /Meet AXORA—the skilled virtual assistants behind every task, system, and solution, ready to make your digital work run smoother\./);
  assert.match(html, /<a[^>]+href="#team"[^>]*>Meet the team ↓<\/a>/);
  assert.match(html, /<a[^>]+href="#description"[^>]*>See what we handle →<\/a>/);

  const nav = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? '';
  for (const target of ['#description', '#team', '#work', '#contact']) {
    assert.match(nav, new RegExp(`href="${target}"`), `navigation must include ${target}`);
  }
  assert.match(nav, /href="#contact"[^>]*>Let’s talk<\/a>/);

  for (const label of ['Tech support', 'Virtual assistance', 'Human-first']) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /Tech support\s*<span[^>]*aria-hidden="true"[^>]*>·<\/span>\s*Virtual assistance\s*<span[^>]*aria-hidden="true"[^>]*>·<\/span>\s*Human-first/);
});

test('five complete achievement cards preserve the exact local image mapping and content', () => {
  assert.equal(classCount(html, 'card'), 5);
  assert.equal((html.match(/\bdata-slide\b/gi) ?? []).length, 5);
  assert.equal(classCount(html, 'card-photo'), 5);
  assert.equal(classCount(html, 'card-body'), 5);
  assert.equal(classCount(html, 'card-tag'), 5);
  assert.equal(classCount(html, 'card-stat'), 5);
  assert.equal(classCount(html, 'card-stat-label'), 5);
  assert.equal(classCount(html, 'card-attribution'), 5);

  const cardMatches = [...html.matchAll(/<article\b(?=[^>]*\bclass="card")(?=[^>]*\bdata-slide="\d+")[^>]*>([\s\S]*?)<\/article>/g)];
  const cardBlocks = cardMatches.map((match) => match[1]);
  const cardOpenings = cardMatches.map((match) => match[0].match(/^<article\b[^>]*>/)?.[0] ?? '');
  assert.equal((html.match(/<article\b/gi) ?? []).length, 5, 'there must be exactly five article cards');
  assert.equal(cardBlocks.length, 5, 'each data-slide card must be a complete article');
  assert.match(cardOpenings[0], /data-slide="0"/);
  assert.match(cardOpenings[0], /data-position="0"/);
  assert.match(cardOpenings[0], /aria-hidden="false"/);
  assert.match(cardOpenings[1], /data-slide="1"/);
  assert.match(cardOpenings[1], /data-position="1"/);
  assert.match(cardOpenings[1], /aria-hidden="true"/);
  assert.match(cardOpenings[2], /data-slide="2"/);
  assert.match(cardOpenings[2], /data-position="2"/);
  assert.match(cardOpenings[2], /aria-hidden="true"/);
  assert.match(cardOpenings[3], /data-slide="3"/);
  assert.match(cardOpenings[4], /data-slide="4"/);
  for (const opening of cardOpenings.slice(3)) {
    assert.match(opening, /aria-hidden="true"/);
  }
  const hiddenPositions = cardOpenings.slice(3).map((opening) => opening.match(/data-position="(-[12])"/)?.[1]);
  assert.deepEqual(new Set(hiddenPositions), new Set(['-1', '-2']));
  assert.equal(cardOpenings.filter((opening) => /aria-hidden="false"/.test(opening)).length, 1);
  assert.equal(cardOpenings.filter((opening) => /aria-hidden="true"/.test(opening)).length, 4);
  assert.match(html, /loading="eager"/);
  assert.match(html, /fetchpriority="high"/);
  assert.equal((html.match(/loading="lazy"/gi) ?? []).length, 4);
  assert.equal((html.match(/decoding="async"/gi) ?? []).length, 5);
  assert.equal((html.match(/draggable="false"/gi) ?? []).length, 5);

  cards.forEach((card, index) => {
    const cardMarkup = cardBlocks[index];
    assert.ok(existsSync(card.file), `missing source asset: ${card.file}`);
    assert.match(cardMarkup, /<div class="card-photo">\s*<img\b[^>]*\bsrc="[^"]+"/i);
    assert.match(cardMarkup, new RegExp(`src="${escapeRegExp(card.src)}"`), `card ${index + 1} must retain its image source`);
    assert.match(cardMarkup, new RegExp(`alt="${escapeRegExp(card.alt)}"`), `card ${index + 1} must retain its image alt`);
    assert.match(cardMarkup, /width="2048"\s+height="1536"/);
    for (const text of [card.photoTag, card.category, card.statement, card.supporting, card.attribution]) {
      assert.ok(cardMarkup.includes(text), `card ${index + 1} is missing: ${text}`);
    }
  });
});

test('carousel markup is dot-only, keyboard-focusable, and exposes a visually hidden status', () => {
  assert.match(html, /<div class="ambient-scene" aria-hidden="true">/);
  for (const className of ['blob-violet', 'blob-coral', 'blob-mint']) {
    assert.ok(classCount(html, className) === 1, `missing .${className}`);
  }
  assert.match(html, /<div id="particles"><\/div>/);
  assert.match(html, /<div id="glow" aria-hidden="true"><\/div>/);
  for (const className of ['wrap', 'top', 'hero-text', 'hero-stack', 'stack']) {
    assert.ok(classCount(html, className) >= 1, `missing .${className}`);
  }
  assert.match(html, /<section class="hero-stack" role="region" aria-roledescription="carousel"[^>]*tabindex="0"/);
  assert.match(html, /aria-label="AXORA team achievements"/);
  assert.match(html, /<p class="carousel-status sr-only" role="status" aria-live="polite">/);
  assert.equal((html.match(/<button\b[^>]*\bdata-dot="\d+"[^>]*>/gi) ?? []).length, 5);
  assert.equal((html.match(/\bdata-dot\b/gi) ?? []).length, 5);
  assert.doesNotMatch(html, /data-previous|data-next|Previous photo|Next photo/);
});

test('styles encode the white 3D studio system, stacked card proportions, and safety guards', () => {
  for (const color of ['#F8FAFF', '#FFFFFF', '#172033', '#6268F4', '#3640C8', '#FF795C', '#6CC9B8']) {
    assert.match(css, new RegExp(color, 'i'));
  }
  for (const font of ['Fraunces', 'DM Sans', 'DM Mono']) {
    assert.match(css, new RegExp(font));
  }
  assert.match(css, /\.wrap\s*\{[\s\S]*?max-(?:inline-)?size:\s*1240px/);
  assert.match(css, /\.hero\s*\{[\s\S]*?grid-template-columns:\s*1\.05fr\s+0\.95fr/);
  assert.match(css, /\.stack\s*\{[\s\S]*?inline-size:\s*336px;[\s\S]*?block-size:\s*452px/);
  assert.match(css, /\.card\s*\{[\s\S]*?border-radius:\s*28px/);
  assert.match(css, /\.card-photo\s*\{[\s\S]*?block-size:\s*56%/);
  assert.match(css, /transition:[^;]*1\.1s/);
  assert.match(css, /\.card\[data-position="0"\][\s\S]*?opacity:\s*1/);
  assert.match(css, /\.card\[data-position="1"\][\s\S]*?opacity:\s*1/);
  assert.match(css, /\.card\[data-position="2"\][\s\S]*?opacity:\s*1/);
  assert.match(css, /\.card\[data-position="-1"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /\.card\[data-position="-2"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /inline-size:\s*7px/);
  assert.match(css, /inline-size:\s*24px/);
  assert.match(css, /min-inline-size:\s*44px/);
  assert.match(css, /min-block-size:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /overflow-x:\s*(?:clip|hidden)/);
  assert.match(css, /@media \(max-width:\s*900px\)/);
  assert.match(css, /@media \(max-width:\s*520px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.sr-only\s*\{[\s\S]*?(?:clip-path:\s*inset\(50%\)|clip:\s*rect)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none\s*!important/);
  assert.match(css, /@keyframes\s+float-coral/);
  assert.match(css, /@keyframes\s+float-mint/);
  assert.match(css, /@keyframes\s+rise/);

  for (const obsoleteDirection of ['--honey', '--cream', 'Lora', 'Plus Jakarta Sans', '.gallery-deck']) {
    assert.doesNotMatch(css, new RegExp(obsoleteDirection));
  }
});

test('carousel controller uses the accessible 3200ms, swipe, and ambient-glow lifecycle', () => {
  assert.match(script, /document\.querySelector\(['"]\.hero-stack['"]\)/);
  assert.match(script, /card\.dataset\.position\s*=\s*String\(relativeOffset\(/);
  assert.match(script, /card\.setAttribute\(['"]aria-hidden['"],\s*String\(index !== activeIndex\)\)/);
  assert.match(script, /dot\.setAttribute\(['"]aria-current['"],\s*String\(index === activeIndex\)\)/);
  assert.match(script, /status\.setAttribute\(['"]aria-live['"],\s*announce \? ['"]polite['"] : ['"]off['"]\)/);
  assert.match(script, /\},\s*3200\)/);
  for (const interaction of ['ArrowLeft', 'ArrowRight', 'pointerenter', 'pointerleave', 'focusin', 'focusout', 'visibilitychange', 'pointerdown', 'pointerup', 'dragstart']) {
    assert.match(script, new RegExp(interaction));
  }
  assert.match(script, /matchMedia\(['"]\(prefers-reduced-motion: reduce\)['"]\)/);
  assert.match(script, /clearAutoplay\(\)/);
  assert.match(script, /stack\.setPointerCapture\(/);
  assert.match(script, /document\.querySelector\(['"]#glow['"]\)/);
  assert.match(script, /document\.querySelector\(['"]#particles['"]\)/);
  assert.match(script, /Math\.random\(\)/);
  assert.match(script, /createParticles\(\)/);
  assert.match(script, /clearParticles\(\)/);
  assert.match(script, /pointermove/);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /if \(prefersReducedMotion\)\s*\{\s*return;/);
});

test('direct-file controller and 3D motion source preserve accessible runtime behavior', () => {
  assert.match(html, /<script\s+src="script\.js"\s+defer><\/script>/i);
  assert.doesNotMatch(html, /<script\b(?=[^>]*\bsrc="script\.js")(?=[^>]*\btype="module")[^>]*>/i);
  assert.doesNotMatch(script, /^\s*(?:import|export)\b/m, 'the direct-file controller must be a classic script');

  for (const helper of ['normalizeIndex', 'nextIndex', 'previousIndex', 'relativeOffset']) {
    assert.match(script, new RegExp(`function\\s+${helper}\\s*\\([^)]*\\bcount\\b[^)]*\\)`), `${helper} must be a local helper`);
    assert.ok((script.match(new RegExp(`\\b${helper}\\s*\\(`, 'g')) ?? []).length >= 2, `${helper} must be used by the controller`);
  }
  assert.match(script, /count\s*(?:<=\s*0|<\s*1)/, 'local circular helpers must reject non-positive counts');

  assert.match(css, /\.stack\s*\{[\s\S]*?perspective:\s*1[0-3]\d{2}px[\s\S]*?transform-style:\s*preserve-3d/);
  assert.match(css, /\.card\s*\{[\s\S]*?transform-style:\s*preserve-3d[\s\S]*?backface-visibility:\s*hidden/);
  assert.match(css, /translateZ\(/);
  assert.match(css, /\.card\[data-position="0"\]\s*\{[\s\S]*?rotateX\(var\(--tilt-x(?:,\s*[^)]*)?\)\)[\s\S]*?rotateY\(var\(--tilt-y(?:,\s*[^)]*)?\)\)/);

  assert.match(script, /stack\.getBoundingClientRect\(\)/);
  assert.match(script, /event\.clientX\s*-\s*[^;\n]*\.left/);
  assert.match(script, /event\.clientY\s*-\s*[^;\n]*\.top/);
  assert.match(script, /style\.setProperty\(['"]--tilt-x['"]/);
  assert.match(script, /style\.setProperty\(['"]--tilt-y['"]/);
  assert.match(script, /stack\.addEventListener\(['"]pointerleave['"][\s\S]*?setProperty\(['"]--tilt-x['"],\s*['"]0deg['"]\)/);
  assert.match(script, /requestAnimationFrame/);

  assert.match(script, /glowTargetX\s*=\s*event\.clientX/);
  assert.match(script, /glowTargetY\s*=\s*event\.clientY/);
  assert.match(script, /glowCurrentX\s*\+=\s*\(glowTargetX\s*-\s*glowCurrentX\)\s*\*/);
  assert.match(script, /glowCurrentY\s*\+=\s*\(glowTargetY\s*-\s*glowCurrentY\)\s*\*/);
  assert.match(script, /glow\.style\.transform\s*=\s*`translate3d\(\$\{glowCurrentX\}px,\s*\$\{glowCurrentY\}px,\s*0\)`/);
  assert.match(script, /if\s*\(prefersReducedMotion\)\s*\{[\s\S]*?(?:resetTilt\(\)|cancelAnimationFrame\(glowFrame\)|glowFrame\s*=\s*undefined)/, 'reduced motion must explicitly settle tilt and glow');
  assert.match(script, /reducedMotionQuery\.addEventListener\(['"]change['"][\s\S]*?(?:resetTilt\(\)|cancelAnimationFrame\(glowFrame\)|glowFrame\s*=\s*undefined)/, 'reduced-motion changes must stop motion already in progress');
});
