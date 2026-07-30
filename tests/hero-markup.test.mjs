import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const script = readFileSync('script.js', 'utf8');

const cards = [
  ['Hero Image/755941564_2053703328575625_420494940045368523_n.jpg', 'Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg', 'AXORA team members together on the IT Summit and Code Camp Season 4 stage in Ozamiz City.', 'IT Summit · Code Camp S4', 'Team milestone', 'Built to solve', 'AXORA showing up, learning, and building together.', 'Ozamiz City · July 25, 2026'],
  ['Hero Image/755941564_2053703328575625_420494940045368523_n (1).jpg', 'Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg', 'AXORA team members posed onstage at IT Summit and Code Camp Season 4 in Ozamiz City.', 'One team, shared focus', 'Collaboration', 'Ready together', 'Skilled support starts with people who work as one.', 'AXORA · Code Camp Season 4'],
  ['Hero Image/755690039_2254034195393709_1404549311183090400_n.jpg', 'Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg', 'AXORA team members celebrating around a table while holding a certificate and trophy at Code Camp Season 4 in Ozamiz City.', 'The people behind AXORA', 'Human-led', 'Hands-on support', 'Real people helping make everyday digital work easier.', 'Team moment · Ozamiz City'],
  ['Hero Image/755538558_27737088675918586_7287023157067586050_n.jpg', 'Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg', 'AXORA team members in a closer onstage group photo at Code Camp Season 4 in Ozamiz City.', 'Technology, made human', 'Tech assistance', 'Clear. Capable.', 'Practical help for websites, systems, content, and more.', 'AXORA · IT Summit 2026'],
  ['Hero Image/753550594_854922847701273_1471309818899059976_n.jpg', 'Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg', 'AXORA team members in a wide full-group stage photograph at IT Summit and Code Camp Season 4 in Ozamiz City.', 'A wider circle of support', 'People first', 'Ready to help', 'A skilled team grounded in curiosity and collaboration.', 'Ozamiz City · 2026'],
];

const classCount = (source, className) => [...source.matchAll(/\bclass=(["'])(.*?)\1/gi)]
  .filter((match) => match[2].split(/\s+/).includes(className)).length;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('full landing page has the required semantic sections, navigation, and content', () => {
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.match(html, /<header\b[^>]*\bclass="[^"]*\bsite-header\b[^"]*"/);
  assert.match(html, /<main>/);
  assert.match(html, /<footer\b[^>]*\bclass="[^"]*\bsite-footer\b[^"]*"/);
  assert.match(html, /AXORA<span aria-hidden="true">\.<\/span>/);
  for (const id of ['home', 'services', 'team', 'contact']) {
    assert.match(html, new RegExp(`<section[^>]+id="${id}"`, 'i'));
  }
  const sectionIds = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/gi)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ['home', 'services', 'team', 'contact']);
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0] ?? '';
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
  for (const target of ['#home', '#services', '#team', '#contact']) {
    assert.match(header, new RegExp(`href="${target}"`));
    assert.match(footer, new RegExp(`href="${target}"`));
  }
  assert.match(html, /<button class="nav-toggle"[^>]*aria-controls="primary-nav"[^>]*aria-expanded="false"[^>]*aria-label="Open navigation"/);
  assert.match(html, /<nav id="primary-nav"[^>]*>\s*<a href="#home">Home<\/a>\s*<a href="#services">Services<\/a>\s*<a href="#team">Team<\/a>\s*<a href="#contact">Contact<\/a>/);
  assert.doesNotMatch(css, /\.top-links\s*\{\s*display:\s*none/);
  assert.match(header, /href="#contact"[^>]*>Let’s talk<\/a>/);

  assert.match(html, /<p class="eyebrow">OUR TEAM<\/p>/);
  assert.match(html, /<h1\b[^>]*>\s*Skilled hands,\s*<br\s*\/?>(?:\s*)<em>ready to help\.<\/em>\s*<\/h1>/i);
  assert.match(html, /Meet AXORA—the skilled virtual assistants behind every task, system, and solution, ready to make your digital work run smoother\./);
  assert.match(html, /href="#services"[^>]*>Explore our services/);
  assert.match(html, /href="#team"[^>]*>Meet the team/);
  for (const label of ['Web apps', 'Mobile apps', 'Design', 'Tech support']) assert.ok(html.includes(label));
  assert.match(html, /<div class="scene-rings" aria-hidden="true">\s*<span class="scene-ring"><\/span>\s*<span class="scene-ring"><\/span>\s*<span class="scene-axis"><\/span>\s*<\/div>/);
  assert.match(html, /<p class="scene-label">OZAMIZ CITY · 2026<\/p>/);
  assert.match(html, /<div class="stack" data-tilt>/);

  const services = [
    ['Web applications', 'Responsive web experiences and practical browser-based tools shaped around the way you work.'],
    ['Mobile applications', 'Focused mobile products and companion experiences designed for everyday use.'],
    ['UI/UX and visual design', 'Clear interfaces, thoughtful interaction flows, and visual systems that make digital products easier to use.'],
    ['Technical support', 'Flexible help with websites, systems, content updates, troubleshooting, and other day-to-day digital tasks.'],
  ];
  assert.equal(classCount(html, 'service-card'), 4);
  for (const [title, copy] of services) {
    assert.match(html, new RegExp(`<article[^>]*class="service-card"[^>]*data-tilt[^>]*tabindex="0"[^>]*>[\\s\\S]*?<svg\\b[\\s\\S]*?<h3>${escapeRegExp(title)}<\\/h3>[\\s\\S]*?${escapeRegExp(copy)}`));
  }

  assert.match(html, /What we build\s*<br>\s*and support\./);
  assert.match(html, /Four people,\s*<br>\s*one shared standard\./);
  assert.equal(classCount(html, 'team-card'), 4);
  for (let index = 0; index < 4; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    assert.match(html, new RegExp(`<button[^>]*class="team-card"[^>]*data-member="${index}"[^>]*disabled[^>]*>[\\s\\S]*?${number}[\\s\\S]*?Team Member ${number}[\\s\\S]*?<small>Role / specialty<\\/small>[\\s\\S]*?View work and achievements`));
  }
  assert.equal((html.match(/<small>Role \/ specialty<\/small>/g) ?? []).length, 4);
  assert.equal((html.match(/View work and achievements/g) ?? []).length, 4);

  for (const text of ['Have something useful to build?', 'Tell us what you are working on and where you need a capable extra set of hands.', 'mailto:your-email@example.com', 'Replace this email before launch.', 'Start a conversation']) assert.ok(html.includes(text));
  assert.match(html, /<dialog id="team-dialog">/);
  for (const hook of ['data-dialog-close', 'data-dialog-name', 'data-dialog-marker', 'data-dialog-role', 'data-dialog-bio', 'data-dialog-achievements', 'data-dialog-work']) assert.ok(html.includes(hook));
  for (const text of ['Team Member 01', 'Role / specialty', "Add this team member's short biography, focus, and approach here.", '01', '02', 'Add a short project summary and contribution.', 'Placeholder content']) assert.ok(html.includes(text));
  assert.match(footer, /Web apps, mobile apps, design, and practical tech support\./);
  assert.match(html, /<script\s+src="script\.js"\s+defer><\/script>/i);
  assert.doesNotMatch(html, /<script\b(?=[^>]*\bsrc="script\.js")(?=[^>]*\btype="module")[^>]*>/i);
});

test('five complete achievement cards preserve the exact local image mapping and content', () => {
  assert.equal(classCount(html, 'card'), 5);
  const cardMatches = [...html.matchAll(/<article\b(?=[^>]*\bclass="card")(?=[^>]*\bdata-slide="\d+")[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(cardMatches.length, 5);
  assert.equal((html.match(/\bdata-slide\b/gi) ?? []).length, 5);
  assert.equal((html.match(/\bdata-dot\b/gi) ?? []).length, 5);
  assert.equal((html.match(/loading="lazy"/gi) ?? []).length, 4);
  assert.equal((html.match(/decoding="async"/gi) ?? []).length, 5);
  assert.equal((html.match(/draggable="false"/gi) ?? []).length, 5);
  assert.match(html, /loading="eager"/);
  assert.match(html, /fetchpriority="high"/);
  cards.forEach(([file, src, alt, ...content], index) => {
    const opening = cardMatches[index][0].match(/^<article\b[^>]*>/)?.[0] ?? '';
    assert.ok(existsSync(file), `missing source asset: ${file}`);
    assert.match(opening, new RegExp(`data-slide="${index}"`));
    assert.match(opening, /aria-hidden=/);
    assert.match(cardMatches[index][1], new RegExp(`src="${escapeRegExp(src)}"`));
    assert.match(cardMatches[index][1], new RegExp(`alt="${escapeRegExp(alt)}"`));
    assert.match(cardMatches[index][1], /width="2048"\s+height="1536"/);
    content.forEach((text) => assert.ok(cardMatches[index][1].includes(text), `card ${index + 1} is missing ${text}`));
  });
  assert.match(html, /<section class="hero-stack" role="region" aria-roledescription="carousel"[^>]*tabindex="0"/);
  assert.match(html, /<p class="carousel-status sr-only" role="status" aria-live="polite">Card 1 of 5<\/p>/);
});

test('carousel markup retains warm visual, direct-file, focus, overflow, and reduced-motion safeguards', () => {
  for (const color of ['#211A15', '#2C231C', '#362B22', '#F5EFE4', '#B8AA97', '#E7A23A', '#6FB3A0']) assert.match(css, new RegExp(color, 'i'));
  for (const font of ['Lora', 'Plus Jakarta Sans', 'Space Mono']) assert.match(css, new RegExp(font));
  for (const safeguard of ['min-inline-size:\\s*44px', 'min-block-size:\\s*44px', ':focus-visible', 'overflow-x:\\s*(?:clip|hidden)', '@media \\(max-width:\\s*900px\\)', '@media \\(prefers-reduced-motion:\\s*reduce\\)']) assert.match(css, new RegExp(safeguard));
  assert.doesNotMatch(script, /^\s*(?:import|export)\b/m);
  for (const helper of ['normalizeIndex', 'nextIndex', 'previousIndex', 'relativeOffset']) assert.match(script, new RegExp(`function\\s+${helper}\\s*\\([^)]*\\bcount\\b[^)]*\\)`));
  for (const interaction of ['ArrowLeft', 'ArrowRight', 'pointerenter', 'pointerleave', 'focusin', 'focusout', 'visibilitychange', 'pointerdown', 'pointerup', 'dragstart']) assert.match(script, new RegExp(interaction));
  assert.match(script, /matchMedia\(['"]\(prefers-reduced-motion: reduce\)['"]\)/);
  assert.match(script, /stack\.getBoundingClientRect\(\)/);
  assert.match(script, /style\.setProperty\(['"]--tilt-x['"]/);
  assert.match(script, /style\.setProperty\(['"]--tilt-y['"]/);
});
