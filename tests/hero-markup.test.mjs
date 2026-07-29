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
