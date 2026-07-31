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
  assert.equal((html.match(/<header\b[^>]*\bclass="[^"]*\bsite-header\b[^"]*"/gi) ?? []).length, 1);
  assert.equal((html.match(/<main\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<footer\b[^>]*\bclass="[^"]*\bsite-footer\b[^"]*"/gi) ?? []).length, 1);
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
  const heroActions = html.match(/<div class="hero-actions"([^>]*)>([\s\S]*?)<\/div>/)?.[0] ?? '';
  assert.doesNotMatch(heroActions, /aria-label=/);
  assert.match(heroActions, /href="#services"[^>]*>Explore our services/);
  assert.match(heroActions, /href="#team"[^>]*>Meet the team/);
  const trustStrip = html.match(/<p class="trust-strip">([\s\S]*?)<\/p>/)?.[1] ?? '';
  assert.match(trustStrip, /^Web apps\s*<span aria-hidden="true">·<\/span>\s*Mobile apps\s*<span aria-hidden="true">·<\/span>\s*Design\s*<span aria-hidden="true">·<\/span>\s*Tech support$/);
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

  const contact = html.match(/<section id="contact"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  for (const text of ['Have something useful to build?', 'Tell us what you are working on and where you need a capable extra set of hands.', 'mailto:your-email@example.com', 'Replace this email before launch.', 'Start a conversation']) assert.ok(contact.includes(text));
  const dialog = html.match(/<dialog id="team-dialog">([\s\S]*?)<\/dialog>/)?.[1] ?? '';
  assert.ok(dialog, 'the native team dialog must be present');
  for (const hook of ['data-dialog-close', 'data-dialog-name', 'data-dialog-marker', 'data-dialog-role', 'data-dialog-bio', 'data-dialog-achievements', 'data-dialog-work']) assert.ok(dialog.includes(hook));
  for (const text of ['Team Member 01', 'Role / specialty', "Add this team member's short biography, focus, and approach here.", '01', '02', 'Add a short project summary and contribution.', 'Placeholder content']) assert.ok(dialog.includes(text));
  const achievements = dialog.match(/<section data-dialog-achievements[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  const achievementLabels = [...achievements.matchAll(/<p>Achievement placeholder (0[12])<\/p>/g)].map((match) => match[1]);
  assert.deepEqual(achievementLabels, ['01', '02']);
  const work = dialog.match(/<section data-dialog-work[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  const projectLabels = [...work.matchAll(/<article>\s*<h4>Project placeholder (0[12])<\/h4>[\s\S]*?<\/article>/g)].map((match) => match[1]);
  assert.deepEqual(projectLabels, ['01', '02']);
  assert.equal((work.match(/Add a short project summary and contribution\./g) ?? []).length, 2);
  assert.match(footer, /Web apps, mobile apps, design, and practical tech support\./);
  assert.match(html, /<script\s+src="script\.js"\s+defer><\/script>/i);
  assert.doesNotMatch(html, /<script\b(?=[^>]*\bsrc="script\.js")(?=[^>]*\btype="module")[^>]*>/i);
});

test('five complete achievement cards preserve the exact local image mapping and content', () => {
  assert.equal(classCount(html, 'card'), 5);
  for (const className of ['card-photo', 'card-body', 'card-tag', 'card-stat', 'card-stat-label', 'card-attribution']) {
    assert.equal(classCount(html, className), 5, `there must be five .${className} elements`);
  }
  const cardMatches = [...html.matchAll(/<article\b(?=[^>]*\bclass="card")(?=[^>]*\bdata-slide="\d+")[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(cardMatches.length, 5);
  assert.equal((html.match(/\bdata-slide\b/gi) ?? []).length, 5);
  assert.equal((html.match(/\bdata-dot\b/gi) ?? []).length, 5);
  assert.equal((html.match(/loading="lazy"/gi) ?? []).length, 4);
  assert.equal((html.match(/decoding="async"/gi) ?? []).length, 5);
  assert.equal((html.match(/draggable="false"/gi) ?? []).length, 5);
  const expectedPositions = ['0', '1', '2', '-2', '-1'];
  assert.equal(cardMatches.map((match) => match[0]).filter((opening) => /aria-hidden="false"/.test(opening)).length, 5);
  assert.equal(cardMatches.map((match) => match[0]).filter((opening) => /aria-hidden="true"/.test(opening)).length, 0);
  cards.forEach(([file, src, alt, ...content], index) => {
    const opening = cardMatches[index][0].match(/^<article\b[^>]*>/)?.[0] ?? '';
    const image = cardMatches[index][1].match(/<img\b[^>]*>/)?.[0] ?? '';
    assert.ok(existsSync(file), `missing source asset: ${file}`);
    assert.match(opening, new RegExp(`data-slide="${index}"`));
    assert.match(opening, new RegExp(`data-position="${expectedPositions[index]}"`));
    assert.match(opening, /aria-hidden="false"/);
    assert.match(cardMatches[index][1], new RegExp(`src="${escapeRegExp(src)}"`));
    assert.match(cardMatches[index][1], new RegExp(`alt="${escapeRegExp(alt)}"`));
    assert.match(image, /width="2048"\s+height="1536"/);
    assert.match(image, /decoding="async"/);
    assert.match(image, /draggable="false"/);
    if (index === 0) {
      assert.match(image, /loading="eager"/);
      assert.match(image, /fetchpriority="high"/);
    } else {
      assert.match(image, /loading="lazy"/);
      assert.doesNotMatch(image, /fetchpriority=/);
    }
    content.forEach((text) => assert.ok(cardMatches[index][1].includes(text), `card ${index + 1} is missing ${text}`));
  });
  assert.match(html, /<section class="hero-stack" role="region" aria-roledescription="carousel"[^>]*tabindex="0"/);
  assert.match(html, /<p class="carousel-status sr-only" role="status" aria-live="polite">Card 1 of 5<\/p>/);
  const controls = html.match(/<div class="carousel-controls" hidden>([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.ok(controls, 'source carousel controls must remain hidden until enhancement succeeds');
  const dots = [...controls.matchAll(/<button\b[^>]*\bclass="dot"[^>]*>/g)].map((match) => match[0]);
  assert.equal(dots.length, 5);
  dots.forEach((dot, index) => {
    assert.match(dot, new RegExp(`data-dot="${index}"`));
    assert.match(dot, new RegExp(`aria-label="Show card ${index + 1}"`));
    assert.match(dot, new RegExp(`aria-current="${index === 0}"`));
    assert.match(dot, /disabled/);
  });
  assert.match(controls, /<button class="carousel-toggle" type="button" data-carousel-toggle disabled aria-pressed="false" aria-label="Pause carousel autoplay">[\s\S]*?<svg\b[\s\S]*?<g class="icon-pause"[\s\S]*?<g class="icon-play"/);
});

test('styles define the approved spatial page', () => {
  const rule = (selector) => {
    const match = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`));
    assert.ok(match, `missing ${selector} rule`);
    return match[1];
  };
  for (const color of ['#211A15', '#2C231C', '#362B22', '#F5EFE4', '#B8AA97', '#E7A23A', '#6FB3A0']) assert.match(css, new RegExp(color, 'i'));
  for (const font of ['Lora', 'Plus Jakarta Sans', 'Space Mono']) assert.match(css, new RegExp(font));
  assert.match(css, /--display:\s*Lora,/);
  assert.match(css, /--body:\s*["']Plus Jakarta Sans["']/);
  assert.match(css, /--label:\s*["']Space Mono["']/);
  assert.match(css, /body\s*\{[^}]*font-family:\s*var\(--body\)/);
  assert.match(css, /h1\s*\{[^}]*font-family:\s*var\(--display\)/);
  assert.match(css, /\.eyebrow\s*\{[^}]*font-family:\s*var\(--label\)/);
  for (const [token, value] of [['--radius-sm', '12px'], ['--radius-md', '22px'], ['--radius-lg', '34px']]) assert.match(css, new RegExp(`${token}:\\s*${value}`));
  for (const token of ['--glass:', '--glass-strong:', '--line-strong:', '--shadow-soft:', '--shadow-deep:', '--radius-sm:', '--radius-md:', '--radius-lg:', '--pointer-x:', '--pointer-y:', '--scroll-depth:']) assert.match(css, new RegExp(token));
  for (const selector of ['.site-header', '.nav-toggle', '.hero', '.scene-rings', '.stack', '.service-grid', '.service-card', '.team-grid', '.team-card', '.team-dialog', '.contact-panel', '.site-footer']) assert.match(css, new RegExp(selector.replace('.', '\\.') + '\\s*(?:,|\\{)'));
  for (const safeguard of ['min-inline-size:\\s*44px', 'min-block-size:\\s*44px', ':focus-visible', 'overflow-x:\\s*(?:clip|hidden)', '\\.sr-only\\s*\\{[\\s\\S]*?clip-path:', '@media \\(max-width:\\s*1023px\\)', '@media \\(max-width:\\s*767px\\)', '@media \\(max-width:\\s*420px\\)', '@media \\(hover:\\s*none\\),\\s*\\(pointer:\\s*coarse\\)', '@media \\(prefers-reduced-motion:\\s*reduce\\)']) assert.match(css, new RegExp(safeguard));
  assert.match(css, /perspective:\s*1[45]\d{2}px/);
  assert.match(css, /transform-style:\s*preserve-3d/);
  assert.match(css, /translateZ\(/);
  assert.match(css, /backdrop-filter:\s*blur\(/);
  const glowRule = rule('#glow');
  assert.match(glowRule, /inset:\s*0\s+auto\s+auto\s+0/);
  assert.match(glowRule, /margin:\s*-320px\s+0\s+0\s+-320px/);
  assert.match(glowRule, /transform:\s*translate3d\(calc\(50vw\s*\+\s*\(var\(--pointer-x\)\s*\*\s*44vw\)\),\s*calc\(50vh\s*\+\s*\(var\(--pointer-y\)\s*\*\s*42vh\)\s*\+\s*\(var\(--scroll-depth\)\s*\*\s*18px\)\),\s*0\)/);
  assert.match(css, /\.site-header,\s*\.top\s*\{[^}]*position:\s*sticky/);
  const scrolledHeaderRule = rule('\\.site-header\\.is-scrolled');
  assert.match(scrolledHeaderRule, /background:\s*var\(--glass-strong\)/);
  assert.match(scrolledHeaderRule, /backdrop-filter:\s*blur\(/);
  assert.match(css, /\.hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(390px,\s*\.92fr\)/);
  assert.match(css, /\.service-grid,\s*\.service-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.service-card:first-child\s*\{[^}]*grid-column:\s*span\s+7/);
  assert.match(css, /\.service-card:nth-child\(2\),\s*\.service-card:nth-child\(3\)\s*\{[^}]*grid-column:\s*span\s+5/);
  assert.match(css, /\.service-card:nth-child\(4\)\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.team-grid,\s*\.team-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.dialog-shell\s*\{[^}]*grid-template-columns:\s*minmax\(13rem,\s*\.7fr\)\s+minmax\(0,\s*1fr\)/);
  for (const selector of ['\\.card-stat-label', '\\.service-card p', '#contact p', '#team-dialog \\[data-dialog-bio\\]', '#team-dialog section p', '#team-dialog article p', '\\.site-footer p']) assert.match(css, new RegExp(`${selector}\\s*\\{[^}]*font-size:\\s*1rem`));
  assert.match(css, /\.stack\s*\{[^}]*position:\s*relative[^}]*display:\s*block[^}]*inline-size:\s*min\(370px,\s*100%\)[^}]*block-size:\s*500px[^}]*overflow:\s*hidden[^}]*perspective:\s*1[45]\d{2}px[^}]*transform-style:\s*preserve-3d/);
  assert.match(css, /\.stack > \.card\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*inline-size:\s*100%[^}]*opacity:\s*1/);
  for (let index = 1; index <= 5; index += 1) assert.match(css, new RegExp(`\\.stack > \\.card:nth-child\\(${index}\\)\\s*\\{[^}]*z-index:\\s*${6 - index}[^}]*opacity:\\s*1[^}]*transform:\\s*translate3d\\(`));
  assert.doesNotMatch(css, /\.stack\s*\{[^}]*display:\s*flex/);
  assert.doesNotMatch(css, /\.stack\s*\{[^}]*overflow-x:\s*auto/);
  assert.doesNotMatch(css, /\.stack\s*\{[^}]*scroll-snap-type:\s*x/);
  assert.match(css, /\.hero-stack\.is-enhanced \.stack\s*\{[\s\S]*?perspective:\s*1[45]\d{2}px[\s\S]*?transform-style:\s*preserve-3d/);
  assert.match(css, /\.hero-stack\.is-enhanced \.card\s*\{[\s\S]*?position:\s*absolute[\s\S]*?transform-style:\s*preserve-3d[\s\S]*?backface-visibility:\s*hidden/);
  assert.match(css, /\.carousel-controls\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.hero-stack\.is-enhanced \.carousel-controls\s*\{[\s\S]*?display:\s*flex/);
  assert.match(css, /\.hero-stack\.is-enhanced \.card\[data-position="-1"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /\.hero-stack\.is-enhanced \.card\[data-position="-2"\][\s\S]*?opacity:\s*0/);
  assert.doesNotMatch(css, /(?:^|\n)\s*\.card\[data-position/m);
  assert.match(css, /\.carousel-toggle\s*\{[\s\S]*?min-inline-size:\s*44px[\s\S]*?min-block-size:\s*44px/);
  assert.match(css, /\.carousel-toggle\[aria-pressed="true"\] \.icon-pause/);
  assert.match(css, /\.carousel-toggle\[aria-pressed="true"\] \.icon-play/);
  assert.match(css, /\.carousel-toggle\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  assert.match(css, /@media \(hover:\s*none\),\s*\(pointer:\s*coarse\)[\s\S]*?#glow\s*\{[^}]*transform:\s*translate3d\(50vw,\s*50vh,\s*0\)\s*!important/);
  assert.match(css, /@media \(hover:\s*none\),\s*\(pointer:\s*coarse\)[\s\S]*?\.scene-rings,\s*\.scene-ring,\s*\.scene-axis\s*\{[^}]*transform:\s*none/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?#glow\s*\{[\s\S]*?(?:animation:\s*none|transition:\s*none)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?#glow\s*\{[^}]*transform:\s*translate3d\(50vw,\s*50vh,\s*0\)\s*!important/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.service-card p,\s*\.card-stat-label,\s*#contact p,\s*#team-dialog \[data-dialog-bio\],\s*#team-dialog section p,\s*#team-dialog article p,\s*\.site-footer p\s*\{[^}]*font-size:\s*1rem/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.service-web,\s*\.service-mobile,\s*\.service-design,\s*\.service-support[\s\S]*?\{[^}]*grid-column:\s*1[^}]*grid-row:\s*auto/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.service-card,\s*\.service-card:first-child,\s*\.service-card:nth-child\(2\),\s*\.service-card:nth-child\(3\),\s*\.service-card:nth-child\(4\)\s*\{[^}]*grid-column:\s*1/);
  assert.match(rule('\\[hidden\\]'), /display:\s*none\s*!important/);
  assert.match(rule('body'), /min-inline-size:\s*0/);
  assert.match(css, /\.hero > \*\s*\{[^}]*min-inline-size:\s*0[^}]*max-inline-size:\s*100%/);
  assert.match(css, /\.hero-text,\s*\.hero-stack,\s*\.stack\s*\{[^}]*min-inline-size:\s*0[^}]*max-inline-size:\s*100%/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.stack\s*\{[^}]*inline-size:\s*min\(310px,\s*100%\)[^}]*max-inline-size:\s*100%/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.hero-stack\.is-enhanced \.stack\s*\{[^}]*inline-size:\s*min\(310px,\s*100%\)[^}]*max-inline-size:\s*100%/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.hero-stack\s*\{[^}]*overflow-x:\s*clip/);
  assert.match(css, /\.team-card\s*\{[^}]*display:\s*grid[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto\s+auto\s+auto/);
  assert.match(css, /\.team-card small\s*\{[^}]*position:\s*static[^}]*grid-row:\s*3/);
  assert.match(css, /\.team-card > span:last-child\s*\{[^}]*position:\s*static[^}]*grid-row:\s*4[^}]*min-block-size:\s*44px[^}]*border-block-start:/);
  assert.match(css, /@media \(max-width:\s*1023px\)[\s\S]*?\.service-web,\s*\.service-mobile,\s*\.service-design[\s\S]*?\{[^}]*grid-column:\s*span\s+6[^}]*grid-row:\s*auto/);
  assert.match(css, /@media \(max-width:\s*1023px\)[\s\S]*?\.service-support[\s\S]*?\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.site-header:not\(\.is-enhanced\)\s*\{[^}]*position:\s*relative/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.site-header\.is-enhanced \.nav-toggle:not\(\[hidden\]\)\s*\{[^}]*display:\s*inline-flex/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.site-header\.is-enhanced \.site-nav\s*\{[^}]*display:\s*none/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.site-header\.is-enhanced\.menu-open \.site-nav\s*\{[^}]*display:\s*grid/);
  assert.match(css, /#team-dialog\s*\{[^}]*padding:\s*0/);
  assert.match(css, /\.dialog-shell\s*\{[^}]*position:\s*relative[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(13rem,\s*\.7fr\)\s+minmax\(0,\s*1fr\)[^}]*padding:\s*clamp\(1\.5rem,\s*4vw,\s*3rem\)/);
  assert.match(css, /\.dialog-shell > p:first-of-type\s*\{/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?#team-dialog\s*\{[^}]*max-inline-size:\s*none[^}]*inline-size:\s*100%[^}]*inset-inline:\s*0[^}]*margin:\s*auto\s+0\s+0/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.team-card\.is-selected,\s*\.team-card:not\(:disabled\):hover,\s*\.team-card:not\(:disabled\):focus-visible\s*\{[^}]*transform:\s*none\s*!important/);
});

test('carousel controller preserves accessible state, guarded autoplay, keyboard, and swipe behavior', () => {
  assert.match(script, /document\.querySelector\(['"]\.hero-stack['"]\)/);
  assert.match(script, /card\.dataset\.position\s*=\s*String\(relativeOffset\(/);
  assert.match(script, /card\.setAttribute\(['"]aria-hidden['"],\s*String\(index !== activeIndex\)\)/);
  assert.match(script, /dot\.setAttribute\(['"]aria-current['"],\s*String\(index === activeIndex\)\)/);
  assert.match(script, /status\.setAttribute\(['"]aria-live['"],\s*announce \? ['"]polite['"] : ['"]off['"]\)/);
  assert.match(script, /const carouselToggle = heroStack\.querySelector\(['"]\[data-carousel-toggle\]['"]\)/);
  assert.match(script, /if \(stack && controls && carouselToggle && count === 5 && dots\.length === count && status\)/);
  assert.match(script, /let isUserPaused = false/);
  assert.match(script, /function canAutoplay\(\)\s*\{[\s\S]*?count > 1[\s\S]*?!prefersReducedMotion[\s\S]*?!isUserPaused[\s\S]*?isDocumentVisible[\s\S]*?!isPointerInside[\s\S]*?!isFocusWithin/);
  assert.match(script, /syncAutoplayControl = function syncAutoplayControl\(\)\s*\{[\s\S]*?if \(reducedMotionQuery\.matches\)\s*\{[\s\S]*?carouselToggle\.disabled = true;[\s\S]*?carouselToggle\.hidden = true;[\s\S]*?carouselToggle\.hidden = false;[\s\S]*?carouselToggle\.disabled = false;[\s\S]*?carouselToggle\.setAttribute\(['"]aria-pressed['"], String\(isUserPaused\)\)/);
  assert.match(script, /function scheduleAutoplay\(\)\s*\{[\s\S]*?clearAutoplay\(\);[\s\S]*?if \(!canAutoplay\(\)\)\s*\{\s*return;[\s\S]*?window\.setTimeout\([\s\S]*?\}, 3200\)/);

  assert.match(script, /heroStack\.addEventListener\(['"]keydown['"][\s\S]*?event\.key === ['"]ArrowLeft['"][\s\S]*?event\.key === ['"]ArrowRight['"]/);
  assert.match(script, /heroStack\.addEventListener\(['"]pointerenter['"][\s\S]*?isPointerInside = true[\s\S]*?scheduleAutoplay\(\)/);
  assert.match(script, /heroStack\.addEventListener\(['"]pointerleave['"][\s\S]*?isPointerInside = false[\s\S]*?scheduleAutoplay\(\)/);
  assert.match(script, /heroStack\.addEventListener\(['"]focusin['"][\s\S]*?isFocusWithin = true[\s\S]*?scheduleAutoplay\(\)/);
  assert.match(script, /heroStack\.addEventListener\(['"]focusout['"][\s\S]*?isFocusWithin = heroStack\.contains\(event\.relatedTarget\)[\s\S]*?scheduleAutoplay\(\)/);
  assert.match(script, /document\.addEventListener\(['"]visibilitychange['"][\s\S]*?isDocumentVisible = !document\.hidden[\s\S]*?scheduleAutoplay\(\)/);
  assert.match(script, /heroStack\.classList\.add\(['"]is-enhanced['"]\)/);
  assert.match(script, /controls\.hidden = false/);
  assert.match(script, /dots\.forEach\([\s\S]*?dot\.disabled = false/);
  assert.match(script, /heroStack\.classList\.add\(['"]is-enhanced['"]\)[\s\S]*?dots\.forEach[\s\S]*?syncAutoplayControl\(\);[\s\S]*?render\(false\)/);
  assert.match(script, /carouselToggle\.addEventListener\(['"]click['"], \(\) => \{[\s\S]*?isUserPaused = !isUserPaused;[\s\S]*?syncAutoplayControl\(\);[\s\S]*?scheduleAutoplay\(\)/);
  const carouselAutoplayControl = script.match(/syncAutoplayControl = function syncAutoplayControl\(\)\s*\{[\s\S]*?\n      \};/)?.[0] ?? '';
  assert.doesNotMatch(carouselAutoplayControl, /setAttribute\(['"]aria-label['"]/);

  assert.match(script, /stack\.addEventListener\(['"]dragstart['"],\s*\(event\) => event\.preventDefault\(\)\)/);
  assert.match(script, /stack\.addEventListener\(['"]pointerdown['"][\s\S]*?stack\.setPointerCapture\(event\.pointerId\)/);
  assert.match(script, /stack\.addEventListener\(['"]pointerup['"][\s\S]*?Math\.abs\(deltaX\) >= 44 && Math\.abs\(deltaX\) > Math\.abs\(deltaY\)/);
  assert.match(script, /show\(deltaX < 0 \? nextIndex\(activeIndex, count\) : previousIndex\(activeIndex, count\)\)/);
  assert.match(script, /stack\.getBoundingClientRect\(\)/);
  assert.match(script, /style\.setProperty\(['"]--tilt-x['"]/);
  assert.match(script, /style\.setProperty\(['"]--tilt-y['"]/);
});

test('direct-file carousel helpers and reduced-motion cleanup retain the warm baseline behavior', () => {
  assert.match(html, /<script\s+src="script\.js"\s+defer><\/script>/i);
  assert.doesNotMatch(script, /^\s*(?:import|export)\b/m);
  for (const helper of ['normalizeIndex', 'nextIndex', 'previousIndex', 'relativeOffset']) {
    assert.match(script, new RegExp(`function\\s+${helper}\\s*\\([^)]*\\bcount\\b[^)]*\\)`), `${helper} must be local to the direct-file controller`);
    assert.ok((script.match(new RegExp(`\\b${helper}\\s*\\(`, 'g')) ?? []).length >= 2, `${helper} must be used by the controller`);
  }
  assert.match(script, /function validateCount\(count\)\s*\{\s*if \(count < 1\)/);
  assert.match(script, /function normalizeIndex\(index, count\)\s*\{\s*validateCount\(count\)/);
  assert.match(script, /matchMedia\(['"]\(prefers-reduced-motion: reduce\)['"]\)/);
  assert.match(script, /function stopGlow\(\)\s*\{[\s\S]*?window\.cancelAnimationFrame\(glowFrame\)[\s\S]*?glowFrame = undefined/);
  assert.match(script, /resetTilt = function resetTilt\(\)\s*\{[\s\S]*?window\.cancelAnimationFrame\(tiltFrame\)[\s\S]*?setProperty\(['"]--tilt-x['"], ['"]0deg['"]\)[\s\S]*?setProperty\(['"]--tilt-y['"], ['"]0deg['"]\)/);
  assert.match(script, /refreshAutoplay = scheduleAutoplay/);
  const motionChange = script.match(/\n  reducedMotionQuery\.addEventListener\(['"]change['"][\s\S]*?\n  \}\);/)?.[0] ?? '';
  assert.match(motionChange, /if \(prefersReducedMotion\)\s*\{[\s\S]*?stopGlow\(\);[\s\S]*?resetTilt\(\);/);
  assert.match(motionChange, /syncAutoplayControl\(\);[\s\S]*?refreshAutoplay\(\)/);
  assert.doesNotMatch(motionChange, /isUserPaused\s*=/);
});

test('progressively enhances navigation and the reusable team dialog', () => {
  assert.match(script, /function initNavigation\(\)\s*\{/);
  assert.match(script, /function initTeamDialog\(reducedMotionQuery\)\s*\{/);
  assert.match(script, /const reducedMotionQuery = window\.matchMedia\([\s\S]*?\);[\s\S]*?initNavigation\(\);[\s\S]*?initTeamDialog\(reducedMotionQuery\);/);
  assert.equal((script.match(/\binitNavigation\(\);/g) ?? []).length, 1);
  assert.equal((script.match(/\binitTeamDialog\(reducedMotionQuery\);/g) ?? []).length, 1);

  const navigation = script.match(/function initNavigation\(\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(navigation, /document\.querySelector\(['"]\.site-header['"]\)/);
  assert.match(navigation, /document\.querySelector\(['"]\.nav-toggle['"]\)/);
  assert.match(navigation, /document\.querySelector\(['"]#primary-nav['"]\)/);
  assert.match(navigation, /if \(!header \|\| !toggle \|\| !nav\)\s*\{\s*return;/);
  assert.match(navigation, /header\.classList\.add\(['"]is-enhanced['"]\);[\s\S]*?toggle\.hidden = false;[\s\S]*?toggle\.setAttribute\(['"]aria-controls['"], ['"]primary-nav['"]\);/);
  assert.match(navigation, /function setMenu\(open, restoreFocus = false\)[\s\S]*?header\.classList\.toggle\(['"]menu-open['"], open\);[\s\S]*?toggle\.setAttribute\(['"]aria-expanded['"], String\(open\)\);[\s\S]*?toggle\.setAttribute\(['"]aria-label['"], open \? ['"]Close navigation['"] : ['"]Open navigation['"]\);/);
  assert.doesNotMatch(navigation, /aria-pressed/);
  assert.match(navigation, /setMenu\(false\);[\s\S]*?toggle\.addEventListener\(['"]click['"]/);
  assert.match(navigation, /nav\.querySelectorAll\(['"]a['"]\)\.forEach[\s\S]*?setMenu\(false\)/);
  assert.match(navigation, /document\.addEventListener\(['"]keydown['"][\s\S]*?event\.key !== ['"]Escape['"] \|\| !header\.classList\.contains\(['"]menu-open['"]\)[\s\S]*?setMenu\(false, true\)/);
  assert.match(navigation, /if \(restoreFocus\)\s*\{\s*toggle\.focus\(\);/);
  assert.doesNotMatch(navigation, /nav\.style\.|overflow\s*=/);

  const dialog = script.match(/function initTeamDialog\(reducedMotionQuery\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(dialog, /document\.querySelector\(['"]#team-dialog['"]\)/);
  assert.match(dialog, /document\.querySelectorAll\(['"]button\[data-member\]['"]\)/);
  assert.match(dialog, /members\.length !== 4/);
  assert.match(dialog, /new Set\(members\.map\(\(member\) => Number\(member\.dataset\.member\)\)\)/);
  assert.match(dialog, /memberIndexes\.size !== 4[\s\S]*?memberIndexes\.has\(0\)[\s\S]*?memberIndexes\.has\(1\)[\s\S]*?memberIndexes\.has\(2\)[\s\S]*?memberIndexes\.has\(3\)/);
  for (const hook of ['[data-dialog-close]', '[data-dialog-name]', '[data-dialog-marker]', '[data-dialog-role]', '[data-dialog-bio]', '[data-dialog-achievements]', '[data-dialog-work]']) assert.match(dialog, new RegExp(escapeRegExp(hook)));
  assert.match(dialog, /typeof dialog\.showModal !== ['"]function['"]/);
  assert.match(dialog, /if \([\s\S]*?members\.length !== 4[\s\S]*?\|\| !closeButton[\s\S]*?\|\| typeof dialog\.showModal !== ['"]function['"][\s\S]*?\)\s*\{\s*return;/);
  assert.match(dialog, /members\.forEach[\s\S]*?member\.disabled = false;[\s\S]*?member\.setAttribute\(['"]aria-haspopup['"], ['"]dialog['"]\)/);
  assert.match(dialog, /document\.createElement\(/);
  assert.match(dialog, /\.textContent\s*=/);
  assert.match(dialog, /replaceChildren\(/);
  assert.doesNotMatch(dialog, /innerHTML/);
  for (const text of ['Team Member 01', 'Team Member 02', 'Team Member 03', 'Team Member 04', 'Role / specialty', "Add this team member's short biography, focus, and approach here.", 'Achievement placeholder 01', 'Achievement placeholder 02', 'Project placeholder 01', 'Project placeholder 02', 'Add a short project summary and contribution.']) assert.ok(dialog.includes(text), `missing dialog draft content: ${text}`);
  assert.match(dialog, /if \(pendingOpen !== undefined \|\| dialog\.open\)\s*\{\s*return;/);
  assert.match(dialog, /window\.setTimeout\([\s\S]*?\}, 140\)/);
  assert.match(dialog, /if \(reducedMotionQuery\.matches\)\s*\{[\s\S]*?openDialog\(\);/);
  assert.match(dialog, /reducedMotionQuery\.addEventListener\(['"]change['"][\s\S]*?if \(event\.matches && pendingOpen !== undefined\)[\s\S]*?window\.clearTimeout\(pendingOpen\);[\s\S]*?openDialog\(\)/);
  assert.match(dialog, /closeButton\.addEventListener\(['"]click['"][\s\S]*?dialog\.close\(\)/);
  assert.match(dialog, /dialog\.addEventListener\(['"]click['"][\s\S]*?event\.target !== dialog[\s\S]*?event\.target\.closest\(['"]\.dialog-shell['"]\)[\s\S]*?dialog\.close\(\)/);
  assert.match(dialog, /dialog\.addEventListener\(['"]close['"][\s\S]*?document\.body\.classList\.remove\(['"]dialog-open['"]\);[\s\S]*?selectedMember\?\.classList\.remove\(['"]is-selected['"]\);[\s\S]*?trigger\?\.focus\(\)/);
  assert.match(dialog, /document\.body\.classList\.add\(['"]dialog-open['"]\);[\s\S]*?closeButton\.focus\(\)/);
  assert.match(html, /<dialog id="team-dialog">\s*<div class="dialog-shell">[\s\S]*?<\/div>\s*<\/dialog>/);
});
