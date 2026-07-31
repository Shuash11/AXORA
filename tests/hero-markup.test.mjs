import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const script = readFileSync('script.js', 'utf8');

const slides = [
  ['Hero Image/755941564_2053703328575625_420494940045368523_n.jpg', 'Hero%20Image/755941564_2053703328575625_420494940045368523_n.jpg', 'AXORA team together on stage.', 'Web systems that work', 'From internal tools to client-facing platforms — built to perform.'],
  ['Hero Image/755941564_2053703328575625_420494940045368523_n (1).jpg', 'Hero%20Image/755941564_2053703328575625_420494940045368523_n%20(1).jpg', 'AXORA team posed on stage.', 'Mobile, built right', 'Clean, focused apps designed for how people actually use them.'],
  ['Hero Image/755690039_2254034195393709_1404549311183090400_n.jpg', 'Hero%20Image/755690039_2254034195393709_1404549311183090400_n.jpg', 'Team celebrating with a certificate and trophy.', 'Design with intent', 'Interfaces that look sharp and work even sharper.'],
  ['Hero Image/755538558_27737088675918586_7287023157067586050_n.jpg', 'Hero%20Image/755538558_27737088675918586_7287023157067586050_n.jpg', 'Close-up of the team on stage.', 'Support that shows up', 'Troubleshooting, updates, and day-to-day digital help — on call.'],
  ['Hero Image/753550594_854922847701273_1471309818899059976_n.jpg', 'Hero%20Image/753550594_854922847701273_1471309818899059976_n.jpg', 'Full group on stage at the event.', 'Your team, extended', 'Skilled hands ready to plug into your workflow.'],
];

const classCount = (source, className) => [...source.matchAll(/\bclass=(["'])(.*?)\1/gi)]
  .filter((match) => match[2].split(/\s+/).includes(className)).length;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const canonicalFaviconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F8FAFF"/><path d="M14 48L29 16h6l15 32h-9l-3-7H26l-3 7h-9zm16-15h5l-2.5-6z" fill="#172033"/><circle cx="46" cy="48" r="4" fill="#FF795C"/></svg>';
const faviconDataPrefix = 'data:image/svg+xml,';
const faviconHrefs = (source) => [...source.matchAll(/<link\b[^>]*\brel="icon"[^>]*>/gi)]
  .map((match) => match[0].match(/\bhref="([^"]*)"/i)?.[1])
  .filter((href) => href !== undefined);

function validateCanonicalFavicon(href) {
  if (typeof href !== 'string' || !href.startsWith(faviconDataPrefix)) return false;

  let svg;
  try {
    svg = decodeURIComponent(href.slice(faviconDataPrefix.length));
  } catch {
    return false;
  }

  const elements = [...new Set([...svg.matchAll(/<([a-z][\w:-]*)\b/gi)].map((match) => match[1].toLowerCase()))].sort();
  const withoutNamespace = svg.replace('xmlns="http://www.w3.org/2000/svg"', '');
  return svg === canonicalFaviconSvg
    && /^<svg\b[^>]*\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*\bviewBox="0 0 64 64"[^>]*>/.test(svg)
    && elements.join(',') === 'circle,path,rect,svg'
    && !/<(?:script|foreignObject|style)\b/i.test(svg)
    && !/\son\w+\s*=/i.test(svg)
    && !/\b(?:xlink:)?href\s*=/i.test(svg)
    && !/\burl\s*\(/i.test(svg)
    && !/(?:\bhttps?:|\/\/)/i.test(withoutNamespace);
}

test('full landing page has the required semantic sections, navigation, and content', () => {
  const icons = faviconHrefs(html);
  assert.equal(icons.length, 1, 'the page must define exactly one favicon');
  assert.match(icons[0], /^data:image\/svg\+xml,/i, 'the favicon must not use an external or local path');
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
  assert.match(html, /<button class="nav-toggle"[^>]*aria-controls="primary-nav"[^>]*aria-expanded="false"[^>]*aria-label="Open navigation"[^>]*hidden>/);
  assert.match(html, /<nav id="primary-nav" class="site-nav" aria-label="Primary navigation">\s*<a class="load-item" href="#home"[^>]*>Home<\/a>\s*<a class="load-item" href="#services"[^>]*>Services<\/a>\s*<a class="load-item" href="#team"[^>]*>Team<\/a>\s*<a class="load-item" href="#contact"[^>]*>Contact<\/a>/);
  assert.match(header, /<span class="nav-toggle-label">Menu<\/span>/);
  assert.match(css, /^\.site-nav\s*\{[^}]*display:\s*flex/m, 'the desktop nav must be visible without JS (only the mobile dropdown hides it inside the 767px media query)');
  assert.match(header, /href="#contact"[^>]*>Let’s talk<\/a>/);

  assert.match(html, /<p class="eyebrow load-item"[^>]*>AXORA · VIRTUAL ASSISTANTS<\/p>/);
  assert.match(html, /<h1\b[^>]*>\s*Skilled hands,\s*<br\s*\/?>(?:\s*)<em>ready to help\.<\/em>\s*<\/h1>/i);
  assert.match(html, /Meet AXORA—the skilled virtual assistants behind every task, system, and solution, ready to make your digital work run smoother\./);
  const heroActions = html.match(/<div class="hero-actions load-item"([^>]*)>([\s\S]*?)<\/div>/)?.[0] ?? '';
  assert.doesNotMatch(heroActions, /aria-label=/);
  assert.match(heroActions, /href="#services"[^>]*>Explore services/);
  assert.match(heroActions, /href="#team"[^>]*>Meet the team/);
  const chips = html.match(/<ul class="chips load-item"[^>]*aria-label="Capabilities">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  for (const label of ['Web apps', 'Mobile apps', 'Design', 'Tech support']) {
    assert.match(chips, new RegExp(`<li class="chip">[\\s\\S]*?<svg\\b[\\s\\S]*?<span>${escapeRegExp(label)}<\\/span>`));
  }
  assert.equal(classCount(html, 'chip'), 4);
  assert.match(html, /<div class="ambient-scene" aria-hidden="true">/);
  for (const className of ['blob-violet', 'blob-coral', 'blob-mint']) {
    assert.equal(classCount(html, className), 1, `there must be one .${className}`);
  }
  assert.equal(classCount(html, 'passing-ball-track'), 1);
  assert.equal(classCount(html, 'passing-ball'), 1);
  assert.ok(existsSync('assets/waving-hand.svg'), 'the local waving-hand asset must exist');
  assert.match(html, /<a class="scroll-greeter" href="#contact" aria-label="Contact AXORA" aria-hidden="true" tabindex="-1" hidden>/);
  assert.match(html, /<span class="greeter-bubble"><strong>Hi!<\/strong><span>AXORA ready for action\.<\/span><\/span>/);
  for (const className of ['peek-character', 'peek-body', 'peek-head', 'peek-hair', 'peek-hand']) {
    assert.equal(classCount(html, className), 1, `there must be one .${className}`);
  }
  assert.match(html, /<img src="assets\/waving-hand\.svg" alt="" width="42" height="42">/);

  assert.match(html, /<section class="hero-scene load-item"[^>]*role="region"[^>]*aria-roledescription="carousel"[^>]*aria-label="AXORA team event photos"[^>]*tabindex="0">/);
  assert.match(html, /<div class="scene" data-tilt>/);
  assert.match(html, /<div class="scene-back scene-back-a" aria-hidden="true"><\/div>/);
  assert.match(html, /<div class="scene-back scene-back-b" aria-hidden="true"><\/div>/);
  assert.match(html, /<p class="scene-count" aria-hidden="true"><span data-count-current>01<\/span> \/ 05<\/p>/);
  assert.match(html, /<div class="stage">/);

  const services = [
    ['Web applications', 'Responsive web experiences and practical browser-based tools shaped around the way you work.'],
    ['Mobile applications', 'Focused mobile products and companion experiences designed for everyday use.'],
    ['UI/UX and visual design', 'Clear interfaces, thoughtful interaction flows, and visual systems that make digital products easier to use.'],
    ['Technical support', 'Flexible help with websites, systems, content updates, troubleshooting, and other day-to-day digital tasks.'],
  ];
  const serviceClasses = ['service-web', 'service-mobile', 'service-design', 'service-support'];
  assert.equal(classCount(html, 'service-card'), 4);
  services.forEach(([title, copy], index) => {
    assert.match(html, new RegExp(`<article[^>]*class="service-card ${serviceClasses[index]}"[^>]*data-tilt[^>]*tabindex="0"[^>]*data-reveal[^>]*>[\\s\\S]*?<svg\\b[\\s\\S]*?<h3>${escapeRegExp(title)}<\\/h3>[\\s\\S]*?${escapeRegExp(copy)}`));
    assert.match(html, new RegExp(`<span class="service-index" aria-hidden="true">0${index + 1}<\\/span>`));
  });

  assert.match(html, /<h2 id="services-title"[^>]*>What we build<br>and support\.<\/h2>\s*<p class="section-intro"[^>]*>Practical digital assistance for products, systems, and the everyday work around them\.<\/p>/);
  assert.match(html, /<h2 id="team-title"[^>]*>Four people,<br>one shared standard\.<\/h2>\s*<p class="section-intro"[^>]*>AXORA combines different technical and creative strengths to make digital work clearer and easier to move forward\.<\/p>/);
  assert.equal(classCount(html, 'team-card'), 4);
  for (let index = 0; index < 4; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    assert.match(html, new RegExp(`<button[^>]*class="team-card"[^>]*data-member="${index}"[^>]*data-tilt[^>]*disabled[^>]*data-reveal[^>]*>[\\s\\S]*?${number}[\\s\\S]*?Team Member ${number}[\\s\\S]*?<small class="team-role">Role / specialty<\\/small>[\\s\\S]*?View work and achievements`));
    assert.match(html, new RegExp(`<span class="device-label">TM-0${index + 1}<\\/span>`));
  }
  assert.equal((html.match(/<small class="team-role">Role \/ specialty<\/small>/g) ?? []).length, 4);
  assert.equal((html.match(/View work and achievements/g) ?? []).length, 4);

  const contact = html.match(/<section id="contact" class="contact-panel"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  for (const text of ['Have something useful to build?', 'Tell us what you are working on and where you need a capable extra set of hands.', 'mailto:your-email@example.com', 'Replace this email before launch.', 'Start a conversation']) assert.ok(contact.includes(text));
  const dialog = html.match(/<dialog id="team-dialog"[^>]*>([\s\S]*?)<\/dialog>/)?.[1] ?? '';
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

test('embedded favicon is the canonical safe SVG data URI', () => {
  const [href] = faviconHrefs(html);
  const decodedSvg = decodeURIComponent(href.slice(faviconDataPrefix.length));

  assert.equal(href.startsWith(faviconDataPrefix), true);
  assert.equal(decodedSvg, canonicalFaviconSvg);
  assert.match(decodedSvg, /^<svg\b[^>]*\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*\bviewBox="0 0 64 64"[^>]*>/);
  assert.deepEqual([...new Set([...decodedSvg.matchAll(/<([a-z][\w:-]*)\b/gi)].map((match) => match[1].toLowerCase()))].sort(), ['circle', 'path', 'rect', 'svg']);
  assert.doesNotMatch(decodedSvg, /<(?:script|foreignObject|style)\b|\son\w+\s*=|\b(?:xlink:)?href\s*=|\burl\s*\(/i);
  assert.doesNotMatch(decodedSvg.replace('xmlns="http://www.w3.org/2000/svg"', ''), /(?:\bhttps?:|\/\/)/i);
  assert.equal(validateCanonicalFavicon(href), true);
  assert.equal(validateCanonicalFavicon('data:image/svg+xml,not-svg'), false);
  assert.equal(validateCanonicalFavicon(`${faviconDataPrefix}${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><script>alert(1)</script></svg>')}`), false);
});

test('five event photo slides preserve the exact local image mapping and caption content', () => {
  assert.equal(classCount(html, 'scene-slide'), 5);
  for (const className of ['slide-photo', 'slide-caption', 'slide-title', 'slide-note']) {
    assert.equal(classCount(html, className), 5, `there must be five .${className} elements`);
  }
  const slideMatches = [...html.matchAll(/<article\b(?=[^>]*\bclass="scene-slide")(?=[^>]*\bdata-slide="\d+")[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(slideMatches.length, 5);
  assert.equal((html.match(/\bdata-slide\b/gi) ?? []).length, 5);
  assert.equal((html.match(/\bdata-dot\b/gi) ?? []).length, 5);
  assert.equal((html.match(/loading="lazy"/gi) ?? []).length, 4);
  assert.equal((html.match(/decoding="async"/gi) ?? []).length, 5);
  assert.equal((html.match(/draggable="false"/gi) ?? []).length, 5);
  const expectedPositions = ['0', '1', '2', '-2', '-1'];
  slides.forEach(([file, src, alt, title, note], index) => {
    assert.ok(existsSync(file), `missing source asset: ${file}`);
    const opening = slideMatches[index][0].match(/^<article\b[^>]*>/)?.[0] ?? '';
    const image = slideMatches[index][1].match(/<img\b[^>]*>/)?.[0] ?? '';
    assert.match(opening, new RegExp(`data-slide="${index}"`));
    assert.match(opening, new RegExp(`data-position="${expectedPositions[index]}"`));
    assert.match(slideMatches[index][1], new RegExp(`src="${escapeRegExp(src)}"`));
    assert.match(slideMatches[index][1], new RegExp(`alt="${escapeRegExp(alt)}"`));
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
    assert.match(slideMatches[index][1], new RegExp(`<p class="slide-title">${escapeRegExp(title)}<\\/p>`));
    assert.match(slideMatches[index][1], new RegExp(`<p class="slide-note">${escapeRegExp(note)}<\\/p>`));
    assert.doesNotMatch(slideMatches[index][1], /slide-tag|slide-meta/, 'premium carousel slides must not carry a tag pill or meta line');
  });
  assert.match(html, /<p class="carousel-status sr-only" role="status" aria-live="polite">Photo 1 of 5<\/p>/);
  const controls = html.match(/<div class="carousel-controls" hidden>([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.ok(controls, 'source carousel controls must remain hidden until enhancement succeeds');
  assert.match(controls, /<button class="carousel-arrow" type="button" data-carousel-prev aria-label="Previous photo">[\s\S]*?<svg\b/);
  assert.match(controls, /<button class="carousel-arrow" type="button" data-carousel-next aria-label="Next photo">[\s\S]*?<svg\b/);
  const dots = [...controls.matchAll(/<button\b[^>]*\bclass="dot"[^>]*>/g)].map((match) => match[0]);
  assert.equal(dots.length, 5);
  dots.forEach((dot, index) => {
    assert.match(dot, new RegExp(`data-dot="${index}"`));
    assert.match(dot, new RegExp(`aria-label="Show photo ${index + 1}"`));
    assert.match(dot, new RegExp(`aria-current="${index === 0}"`));
    assert.match(dot, /disabled/);
  });
  assert.doesNotMatch(html, /data-carousel-toggle/);
  assert.doesNotMatch(html, /carousel-toggle/);
});

test('styles define the white 3D studio design with motion safeguards', () => {
  for (const color of ['#F8FAFF', '#FFFFFF', '#F0F3FF', '#E7ECFF', '#172033', '#667086', '#6268F4', '#3640C8', '#FF795C', '#6CC9B8']) assert.match(css, new RegExp(color, 'i'));
  for (const font of ['Fraunces', 'DM Sans', 'DM Mono']) assert.match(css, new RegExp(font));
  assert.doesNotMatch(css, /Sora|Manrope|IBM Plex Mono|#111014|#1a1820|#22202a|#2a2835|#d4845a|#c46a3a/i, 'the previous dark editorial system must be gone');
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=DM\+Sans/);
  assert.match(html, /family=DM\+Mono/);
  assert.match(css, /--display:\s*["']Fraunces/);
  assert.match(css, /--body:\s*["']DM Sans/);
  assert.match(css, /--label:\s*["']DM Mono/);
  assert.match(css, /body\s*\{[^}]*font-family:\s*var\(--body\)/);
  assert.match(css, /h1\s*\{[^}]*font-family:\s*var\(--display\)/);
  assert.match(css, /h1\s*\{[^}]*font-size:\s*clamp\(2\.8rem,\s*5\.4vw,\s*4\.9rem\)/, 'desktop H1 must retain the prominent responsive display scale');
  assert.match(css, /\.eyebrow\s*\{[^}]*font-family:\s*var\(--label\)/);
  for (const selector of ['.site-header', '.nav-toggle', '.hero', '.hero-scene', '.scene', '.stage', '.scene-slide', '.carousel-controls', '.carousel-arrow', '.dot', '.service-card', '.team-card', '.contact-panel', '.site-footer']) assert.match(css, new RegExp(selector.replace('.', '\\.') + '\\s*(?:,|\\{)'));
  for (const safeguard of ['min-inline-size:\\s*44px', 'min-block-size:\\s*44px', ':focus-visible', 'overflow-x:\\s*hidden', '\\.sr-only\\s*\\{[\\s\\S]*?clip-path:', 'scroll-behavior:\\s*smooth', 'scroll-margin-block-start:\\s*96px', '@media \\(max-width:\\s*1023px\\)', '@media \\(max-width:\\s*767px\\)', '@media \\(max-width:\\s*420px\\)', '@media \\(hover:\\s*none\\),\\s*\\(pointer:\\s*coarse\\)', '@media \\(prefers-reduced-motion:\\s*reduce\\)']) assert.match(css, new RegExp(safeguard));
  assert.match(css, /perspective:\s*1[34]\d{2}px/);
  assert.match(css, /transform-style:\s*preserve-3d/);
  assert.match(css, /backdrop-filter:\s*blur\(/);
  assert.doesNotMatch(css, /#glow|\.glow|--pointer-x|--scroll-depth/, 'the giant cursor glow and scroll-depth machinery must be gone');
  for (const animation of ['drift-violet', 'drift-coral', 'drift-mint', 'pass-ball', 'roll-ball', 'float-coral', 'float-mint', 'wave-greeting', 'character-peek', 'bubble-pop', 'character-blink']) assert.match(css, new RegExp(`@keyframes\\s+${animation}`));
  assert.match(css, /\.hero-scene::before,\s*\.hero-scene::after/);
  assert.match(css, /\.passing-ball\s*\{[^}]*radial-gradient\(circle at 30% 27%/);
  assert.match(css, /\.scroll-greeter\.is-visible\s*\{[^}]*opacity:\s*1[^}]*pointer-events:\s*auto/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none\s*!important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.scroll-greeter\.is-visible \.greeter-bubble\s*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/);
  assert.match(css, /\.js \[data-reveal\]\s*\{[^}]*opacity:\s*0[^}]*translateY\(26px\)\s+rotateX\(3deg\)/, 'reveal must settle with a 20-32px rise and subtle rotateX');
  assert.match(css, /\.js \[data-reveal\]\.is-revealed\s*\{[^}]*opacity:\s*1/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*no-preference\)[\s\S]*?\.load-item\s*\{[^}]*animation:\s*rise/);
  assert.match(css, /@keyframes\s+rise\s*\{/);
  assert.match(css, /\.scene-slide\[data-position="0"\]\s*\{[^}]*opacity:\s*1/);
  assert.match(css, /\.scene-slide\[data-position="1"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /\.scene-slide\[data-position="-1"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /\.carousel-controls\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.hero-scene\.is-enhanced \.carousel-controls\s*\{[\s\S]*?display:\s*flex/);
  assert.match(css, /\.carousel-arrow\s*\{[\s\S]*?min-inline-size:\s*36px[\s\S]*?min-block-size:\s*36px/);
  assert.match(css, /\.dot\s*\{[\s\S]*?min-inline-size:\s*44px[\s\S]*?min-block-size:\s*44px/);
  assert.match(css, /\.service-card\s*\{[^}]*--lift:\s*0px/);
  assert.match(css, /\.service-card:hover[\s\S]*?--lift:\s*-7px/);
  assert.match(css, /\.team-card:not\(:disabled\):hover[\s\S]*?--lift:\s*-7px/);
  assert.match(css, /\.scene-back-a\s*\{[^}]*var\(--px\)/);
  assert.match(css, /\.scene-back-b\s*\{[^}]*var\(--py\)/);
  assert.match(css, /\.scene\s*\{[^}]*transform:\s*rotateX\(var\(--tilt-x, 0deg\)\)/);
  assert.match(css, /#team-dialog\s*\{[^}]*opacity:\s*0/);
  assert.match(css, /#team-dialog\.is-open\s*\{[^}]*opacity:\s*1/);
  assert.match(css, /#team-dialog\.closing\s*\{/);
  assert.match(css, /#team-dialog::backdrop\s*\{[^}]*opacity:\s*0/);
  assert.match(css, /#team-dialog\.is-open::backdrop\s*\{[^}]*opacity:\s*1/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.js \[data-reveal\]\s*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.scene,\s*\.service-card,\s*\.team-card\s*\{[^}]*transform:\s*none\s*!important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.load-item\s*\{[^}]*animation:\s*none\s*!important/);
  assert.match(css, /@media \(max-width:\s*1023px\)[\s\S]*?\.team-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.service-list,\s*\.team-list\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.hero-actions\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.nav-toggle\s*\{[^}]*min-block-size:\s*44px[^}]*align-items:\s*center[^}]*justify-content:\s*center/, 'nav toggle must be a 44px-tall tap target (tester: 151x24 at 390/320)');
  assert.match(css, /@media \(max-width:\s*767px\)\s*\{[\s\S]*?html:not\(\.js\)\s*\.scene-back-a,\s*html:not\(\.js\)\s*\.scene-back-b\s*\{[^}]*inset-inline:\s*0[^}]*transform:\s*none/, 'no-JS scene backdrop cards must be bounded flush on narrow screens (tester: 390->425, 320->350)');
  assert.match(css, /@media \(max-width:\s*767px\)\s*and\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.scene-back-a,\s*\.scene-back-b\s*\{[^}]*inset-inline:\s*0[^}]*transform:\s*none/, 'reduced-motion scene backdrop cards must be bounded flush on narrow screens (tester: 390->404, 320->333)');
});

test('script keeps one RAF scheduler plus one IntersectionObserver and drops stale glow machinery', () => {
  assert.doesNotMatch(script, /^\s*(?:import|export)\b/m);
  assert.doesNotMatch(script, /isUserPaused|scheduleAutoplay|clearAutoplay|carousel-toggle|carouselToggle|3200|Pause carousel/);
  assert.doesNotMatch(script, /glowFrame|renderGlow|scheduleGlow|glowTargetX|glow\.style/);
  assert.doesNotMatch(script, /--pointer-x|--scroll-depth/);
  assert.match(script, /document\.documentElement\.classList\.add\(['"]js['"]\)/);
  assert.match(script, /matchMedia\(['"]\(prefers-reduced-motion: reduce\)['"]\)/);
  assert.match(script, /function initNavigation\(\)\s*\{/);
  assert.match(script, /function initReveals\(\)\s*\{/);
  assert.match(script, /function initTeamDialog\(\)\s*\{/);
  assert.match(script, /function initSpatialMotion\(\)\s*\{/);
  assert.match(script, /function initCarousel\(heroStack\)\s*\{/);
  for (const name of ['initNavigation', 'initReveals', 'initTeamDialog', 'initSpatialMotion']) {
    assert.equal((script.match(new RegExp(`\\b${name}\\(\\)\\s*;`)) ?? []).length, 1, `${name}() must run exactly once`);
  }
  assert.equal((script.match(/new IntersectionObserver/g) ?? []).length, 1, 'exactly one IntersectionObserver');
  const spatialMotion = script.match(/function initSpatialMotion\(\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(spatialMotion, /let frameId;/);
  assert.match(spatialMotion, /function render\(\)\s*\{/);
  assert.match(spatialMotion, /window\.requestAnimationFrame\(render\)/);
  assert.match(spatialMotion, /window\.cancelAnimationFrame\(frameId\)/);
  assert.match(spatialMotion, /root\.style\.setProperty\(['"]--px['"]/);
  assert.match(spatialMotion, /root\.style\.setProperty\(['"]--py['"]/);
  assert.match(spatialMotion, /clamp\(relativeY \* -6, -3, 3\)/);
  assert.match(spatialMotion, /clamp\(relativeX \* 6, -3, 3\)/);
  assert.match(spatialMotion, /window\.matchMedia\(['"]\(hover: hover\) and \(pointer: fine\)['"]\)/);
  assert.match(spatialMotion, /target\.closest\(['"]\[data-tilt\]['"]\)/);
  assert.match(spatialMotion, /!event\.isPrimary \|\| event\.pointerType === ['"]touch['"]/);
  assert.match(spatialMotion, /document\.addEventListener\(['"]pointermove['"],[\s\S]*?\{ passive: true \}\)/);
  assert.match(spatialMotion, /resetSurface\(activeSurface\)/);
  assert.match(spatialMotion, /function stopSpatialMotion\(\)\s*\{/);
  assert.match(spatialMotion, /return stopSpatialMotion;/);
  assert.match(spatialMotion, /header\?\.classList\.toggle\(['"]is-scrolled['"], window\.scrollY > 24\)/);
  assert.match(spatialMotion, /document\.querySelector\(['"]\.scroll-greeter['"]\)/);
  assert.match(spatialMotion, /greeter\.classList\.toggle\(['"]is-visible['"], visible\)/);
  assert.match(spatialMotion, /greeter\.setAttribute\(['"]aria-hidden['"], String\(!visible\)\)/);
  assert.match(spatialMotion, /greeter\.tabIndex = visible \? 0 : -1/);
  assert.match(spatialMotion, /function updateScrollSpy\(\)\s*\{/);
  assert.match(spatialMotion, /link\.classList\.toggle\(['"]is-active['"], active\)/);
  const reveals = script.match(/function initReveals\(\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(reveals, /document\.querySelectorAll\(['"]\[data-reveal\]['"]\)/);
  assert.match(reveals, /item\.classList\.add\(['"]is-revealed['"]\)/);
  assert.match(reveals, /reducedMotionQuery\.matches \|\| typeof IntersectionObserver === ['"]undefined['"]/);
  assert.match(reveals, /entry\.isIntersecting/);
  assert.match(reveals, /observer\.unobserve\(entry\.target\)/);
  assert.match(reveals, /threshold:\s*0\.12/);
});

test('dialog keeps named hooks, focus restoration, and spring entry/exit without autoplay', () => {
  const dialog = script.match(/function initTeamDialog\(\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(dialog, /document\.querySelector\(['"]#team-dialog['"]\)/);
  assert.match(dialog, /members\.length !== 4/);
  assert.match(dialog, /typeof dialog\.showModal !== ['"]function['"]/);
  assert.match(dialog, /members\.forEach[\s\S]*?member\.disabled = false;[\s\S]*?member\.setAttribute\(['"]aria-haspopup['"], ['"]dialog['"]\)/);
  assert.match(dialog, /document\.createElement\(/);
  assert.match(dialog, /replaceChildren\(/);
  assert.doesNotMatch(dialog, /innerHTML/);
  assert.match(dialog, /dialog\.classList\.add\(['"]is-open['"]\)/);
  assert.match(dialog, /dialog\.classList\.add\(['"]closing['"]\)/);
  assert.match(dialog, /window\.setTimeout\(\(\) => dialog\.close\(\), 160\)/);
  assert.match(dialog, /reducedMotionQuery\.matches[\s\S]*?dialog\.close\(\)/);
  assert.match(dialog, /dialog\.addEventListener\(['"]cancel['"][\s\S]*?event\.preventDefault\(\);[\s\S]*?animateClose\(\)/);
  assert.match(dialog, /document\.body\.classList\.add\(['"]dialog-open['"]\);[\s\S]*?closeButton\.focus\(\)/);
  assert.match(dialog, /dialog\.addEventListener\(['"]close['"][\s\S]*?trigger\?\.focus\(\)/);
  assert.match(dialog, /selectedMember\?\.classList\.remove\(['"]is-selected['"]\)/);
  assert.doesNotMatch(dialog, /window\.setTimeout\([\s\S]*?\}, 140\)/);
  assert.doesNotMatch(dialog, /pendingOpen/);
});

test('carousel keeps keyboard, swipe, dots, and arrows with an accessible status', () => {
  const carousel = script.match(/function initCarousel\(heroStack\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(carousel, /heroStack\.querySelector\(['"]\.stage['"]\)/);
  assert.match(carousel, /heroStack\.querySelectorAll\(['"]\.scene-slide['"]\)/);
  assert.match(carousel, /count !== 5 \|\| dots\.length !== count \|\| !status/);
  assert.match(carousel, /slide\.dataset\.position\s*=\s*String\(relativeOffset\(/);
  assert.match(carousel, /slide\.setAttribute\(['"]aria-hidden['"],\s*String\(index !== activeIndex\)\)/);
  assert.match(carousel, /dot\.setAttribute\(['"]aria-current['"],\s*String\(index === activeIndex\)\)/);
  assert.match(carousel, /status\.setAttribute\(['"]aria-live['"],\s*announce \? ['"]polite['"] : ['"]off['"]\)/);
  assert.match(carousel, /status\.textContent = `Photo \$\{activeIndex \+ 1\} of \$\{count\}`/);
  assert.match(carousel, /counter\.textContent = String\(activeIndex \+ 1\)\.padStart\(2, ['"]0['"]\)/);
  assert.match(carousel, /heroStack\.classList\.add\(['"]is-enhanced['"]\)/);
  assert.match(carousel, /controls\.hidden = false/);
  assert.match(carousel, /previous\.addEventListener\(['"]click['"], \(\) => show\(previousIndex\(activeIndex, count\)\)\)/);
  assert.match(carousel, /next\.addEventListener\(['"]click['"], \(\) => show\(nextIndex\(activeIndex, count\)\)\)/);
  assert.match(carousel, /event\.key === ['"]ArrowLeft['"][\s\S]*?event\.key === ['"]ArrowRight['"]/);
  assert.match(carousel, /stage\.addEventListener\(['"]dragstart['"],\s*\(event\) => event\.preventDefault\(\)\)/);
  assert.match(carousel, /stage\.addEventListener\(['"]pointerdown['"][\s\S]*?stage\.setPointerCapture\(event\.pointerId\)/);
  assert.match(carousel, /Math\.abs\(deltaX\) >= 44 && Math\.abs\(deltaX\) > Math\.abs\(deltaY\)/);
  assert.match(carousel, /show\(deltaX < 0 \? nextIndex\(activeIndex, count\) : previousIndex\(activeIndex, count\)\)/);
  assert.match(carousel, /if \(reducedMotionQuery\.matches \|\| document\.hidden\)/);
  assert.match(carousel, /reducedMotionQuery\.addEventListener\(['"]change['"], startAutoplay\)/);
  for (const helper of ['normalizeIndex', 'nextIndex', 'previousIndex', 'relativeOffset']) {
    assert.match(script, new RegExp(`function\\s+${helper}\\s*\\([^)]*\\bcount\\b[^)]*\\)`), `${helper} must be local to the direct-file controller`);
  }
  assert.match(script, /function validateCount\(count\)\s*\{\s*if \(count < 1\)/);
});

function createSpatialHarness() {
  class MockElement {
    constructor(surface, rect = { left: 0, top: 0, width: 100, height: 100 }) {
      this.surface = surface;
      this.rect = rect;
      this.boundsCalls = 0;
      this.attributes = new Map();
      this.hidden = true;
      this.tabIndex = -1;
      this.styleValues = new Map();
      this.style = {
        setProperty: (name, value) => this.styleValues.set(name, String(value)),
        getPropertyValue: (name) => this.styleValues.get(name) ?? '',
      };
      const classes = new Set();
      this.classList = {
        add: (...names) => names.forEach((name) => classes.add(name)),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        toggle: (name, force) => {
          if (force === undefined) {
            if (classes.has(name)) classes.delete(name);
            else classes.add(name);
          } else if (force) classes.add(name);
          else classes.delete(name);
        },
        contains: (name) => classes.has(name),
      };
    }

    closest(selector) { return selector === '[data-tilt]' ? this.surface ?? null : null; }
    contains(element) { return element === this || element?.surface === this; }
    getBoundingClientRect() { this.boundsCalls += 1; return this.rect; }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
  }

  const documentListeners = new Map();
  const windowListeners = new Map();
  const addListener = (listeners, type, listener) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(listener);
  };
  const emit = (listeners, type, event = {}) => listeners.get(type)?.forEach((listener) => listener(event));
  const createQuery = (matches) => {
    const listeners = new Set();
    return {
      matches,
      addEventListener(type, listener) { if (type === 'change') listeners.add(listener); },
      setMatches(next) {
        this.matches = next;
        listeners.forEach((listener) => listener({ matches: next }));
      },
    };
  };
  const reducedMotion = createQuery(false);
  const finePointer = createQuery(true);
  const root = new MockElement();
  const header = new MockElement();
  const greeter = new MockElement();
  const surfaceA = new MockElement(undefined, { left: 0, top: 0, width: 100, height: 100 });
  const surfaceB = new MockElement(undefined, { left: 200, top: 0, width: 100, height: 100 });
  surfaceA.surface = surfaceA;
  surfaceB.surface = surfaceB;
  const childA = new MockElement(surfaceA);
  const childB = new MockElement(surfaceB);
  const ordinary = new MockElement(null);
  const frames = new Map();
  let nextFrameId = 1;
  const document = {
    documentElement: root,
    body: new MockElement(),
    hidden: false,
    activeElement: undefined,
    addEventListener(type, listener) { addListener(documentListeners, type, listener); },
    getElementById() { return undefined; },
    querySelector(selector) { return { '.site-header': header, '.scroll-greeter': greeter }[selector]; },
    querySelectorAll() { return []; },
  };
  const window = {
    innerWidth: 1000,
    innerHeight: 1000,
    scrollY: 0,
    matchMedia(query) { return query === '(prefers-reduced-motion: reduce)' ? reducedMotion : finePointer; },
    requestAnimationFrame(callback) {
      const frameId = nextFrameId;
      nextFrameId += 1;
      frames.set(frameId, callback);
      return frameId;
    },
    cancelAnimationFrame(frameId) { frames.delete(frameId); },
    addEventListener(type, listener) { addListener(windowListeners, type, listener); },
    setTimeout() { return 1; },
    clearTimeout() {},
  };
  runInNewContext(script, { document, window, Element: MockElement, decodeURIComponent });

  function runFrame() {
    const entry = frames.entries().next().value;
    if (!entry) return false;
    const [frameId, callback] = entry;
    frames.delete(frameId);
    callback();
    return true;
  }

  function flush() {
    let count = 0;
    while (runFrame()) {
      count += 1;
      assert.ok(count < 200, 'spatial frames must settle');
    }
  }

  return {
    childA,
    childB,
    ordinary,
    document,
    emitDocument: (type, event) => emit(documentListeners, type, event),
    emitWindow: (type, event) => emit(windowListeners, type, event),
    finePointer,
    flush,
    frameCount: () => frames.size,
    header,
    greeter,
    reducedMotion,
    root,
    runFrame,
    surfaceA,
    surfaceB,
    window,
  };
}

test('shared pointer scheduler coalesces input, tilts at most 3 degrees, and resets on leave', () => {
  const runtime = createSpatialHarness();
  const pointer = (target, clientX, clientY, extras = {}) => ({
    isPrimary: true,
    pointerType: 'mouse',
    target,
    clientX,
    clientY,
    ...extras,
  });

  runtime.flush();
  assert.equal(runtime.greeter.hidden, false, 'the scroll greeting is enabled only after JavaScript initializes');
  assert.equal(runtime.greeter.classList.contains('is-visible'), false);
  assert.equal(runtime.greeter.attributes.get('aria-hidden'), 'true');
  assert.equal(runtime.greeter.tabIndex, -1);
  for (let x = 100; x <= 1000; x += 100) runtime.emitDocument('pointermove', pointer(runtime.childA, x, 1000));
  assert.equal(runtime.frameCount(), 1, 'many raw pointer moves share one queued frame');
  assert.equal(runtime.surfaceA.boundsCalls, 0, 'raw pointer work must not read bounds');
  runtime.runFrame();
  assert.equal(runtime.surfaceA.boundsCalls, 1, 'the rendered latest sample reads bounds once');
  assert.equal(runtime.root.style.getPropertyValue('--px'), '0.160', 'the latest pointer sample (x=1000 -> +1.0) wins: 0 + 1.0 * 0.16');
  assert.equal(runtime.surfaceA.style.getPropertyValue('--tilt-y'), '0.48deg');
  assert.equal(runtime.surfaceA.style.getPropertyValue('--tilt-x'), '-0.48deg');
  assert.equal(runtime.surfaceA.classList.contains('is-tilting'), true);
  runtime.flush();
  assert.equal(runtime.frameCount(), 0, 'frames stop after settling');
  assert.equal(runtime.surfaceA.style.getPropertyValue('--tilt-y'), '3.00deg', 'tilt clamps at 3 degrees');
  assert.equal(runtime.surfaceA.style.getPropertyValue('--tilt-x'), '-3.00deg');

  runtime.emitDocument('pointermove', pointer(runtime.childB, 200, 0));
  runtime.runFrame();
  assert.equal(runtime.surfaceA.style.getPropertyValue('--tilt-x'), '0deg');
  assert.equal(runtime.surfaceA.classList.contains('is-tilting'), false);
  assert.equal(runtime.surfaceB.classList.contains('is-tilting'), true);

  runtime.emitDocument('pointermove', pointer(runtime.childB, 250, 50));
  const boundsBeforePointerOut = runtime.surfaceB.boundsCalls;
  runtime.emitDocument('pointerout', { target: runtime.childB, relatedTarget: undefined });
  runtime.flush();
  assert.equal(runtime.surfaceB.boundsCalls, boundsBeforePointerOut, 'pointerout drops an unrendered local sample');
  assert.equal(runtime.surfaceB.style.getPropertyValue('--tilt-x'), '0deg');
  assert.equal(runtime.surfaceB.classList.contains('is-tilting'), false);

  runtime.emitDocument('pointermove', pointer(runtime.ordinary, 300, 100));
  runtime.runFrame();
  assert.doesNotThrow(() => runtime.emitDocument('pointerout', { target: runtime.ordinary, relatedTarget: undefined }), 'ordinary non-tilt pointerout is safe when the active surface is null');
  runtime.emitDocument('pointermove', pointer(runtime.childA, 100, 100));
  runtime.runFrame();
  assert.equal(runtime.surfaceA.classList.contains('is-tilting'), true);
  assert.doesNotThrow(() => runtime.emitDocument('pointerout', { target: runtime.ordinary, relatedTarget: undefined }), 'ordinary pointerout is safe when another surface is active');
  assert.equal(runtime.surfaceA.classList.contains('is-tilting'), true, 'ordinary pointerout leaves the active surface alone');
  runtime.emitDocument('pointerout', { target: runtime.childA, relatedTarget: undefined });
  assert.equal(runtime.surfaceA.classList.contains('is-tilting'), false, 'leaving the active surface resets its tilt state');

  runtime.emitDocument('pointermove', pointer(runtime.childA, 1000, 1000));
  assert.equal(runtime.frameCount(), 1);
  runtime.reducedMotion.setMatches(true);
  assert.equal(runtime.frameCount(), 0, 'capability loss cancels queued work');
  assert.equal(runtime.root.style.getPropertyValue('--px'), '0.000');
  runtime.reducedMotion.setMatches(false);
  runtime.flush();

  const rootBeforeIgnoredPointer = runtime.root.style.getPropertyValue('--px');
  runtime.emitDocument('pointermove', pointer(runtime.childA, 1000, 1000, { pointerType: 'touch' }));
  runtime.emitDocument('pointermove', pointer(runtime.childA, 1000, 1000, { isPrimary: false }));
  assert.equal(runtime.frameCount(), 0, 'touch and secondary pointers do not schedule spatial work');
  assert.equal(runtime.root.style.getPropertyValue('--px'), rootBeforeIgnoredPointer);

  runtime.window.scrollY = 500;
  runtime.emitWindow('scroll', {});
  assert.equal(runtime.header.classList.contains('is-scrolled'), true, 'scroll toggles the compact header state without a RAF loop');
  assert.equal(runtime.greeter.classList.contains('is-visible'), true, 'scroll reveals the greeting');
  assert.equal(runtime.greeter.attributes.get('aria-hidden'), 'false');
  assert.equal(runtime.greeter.tabIndex, 0, 'the visible greeting enters the keyboard order');
  runtime.finePointer.setMatches(false);
  assert.equal(runtime.frameCount(), 0, 'coarse pointers stop spatial work');
});

function createCarouselHarness() {
  class MockElement {
    constructor() {
      this.listeners = new Map();
      this.attributes = new Map();
      this.dataset = {};
      this.style = { setProperty() {} };
      this.classList = { add() {}, contains() { return false; } };
      this.hidden = false;
      this.disabled = false;
      this.textContent = '';
    }

    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(listener);
    }

    emit(type, event) { this.listeners.get(type)?.forEach((listener) => listener(event)); }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    contains() { return true; }
    setPointerCapture() {}
    querySelector() { return undefined; }
    querySelectorAll() { return []; }
  }

  const heroStack = new MockElement();
  const stage = new MockElement();
  const controls = new MockElement();
  const previous = new MockElement();
  const next = new MockElement();
  const status = new MockElement();
  const counter = new MockElement();
  const slides = Array.from({ length: 5 }, () => new MockElement());
  const dots = Array.from({ length: 5 }, () => new MockElement());
  heroStack.querySelector = (selector) => ({
    '.stage': stage,
    '.carousel-controls': controls,
    '[data-carousel-prev]': previous,
    '[data-carousel-next]': next,
    '.carousel-status': status,
    '[data-count-current]': counter,
  })[selector];
  heroStack.querySelectorAll = (selector) => (selector === '.scene-slide' ? slides : []);
  controls.querySelectorAll = (selector) => (selector === '[data-dot]' ? dots : []);
  const document = {
    documentElement: new MockElement(),
    body: new MockElement(),
    hidden: false,
    activeElement: new MockElement(),
    addEventListener() {},
    getElementById() { return undefined; },
    querySelector(selector) { return selector === '.hero-scene' ? heroStack : undefined; },
    querySelectorAll() { return []; },
  };
  const window = {
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 0,
    matchMedia(query) { return { matches: false, addEventListener() {} }; },
    requestAnimationFrame(callback) { callback(); return 1; },
    cancelAnimationFrame() {},
    addEventListener() {},
    setTimeout() { return 1; },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
  };
  runInNewContext(script, { document, window, Element: MockElement, decodeURIComponent });

  return { heroStack, stage, controls, previous, next, status, counter, slides, dots };
}

test('carousel renders accessible state and advances via arrows, keyboard, dots, and swipe', () => {
  const harness = createCarouselHarness();

  assert.equal(harness.heroStack.classList.contains('is-enhanced'), false, 'classList.contains is mocked inert; state asserted via render outputs below');
  assert.equal(harness.controls.hidden, false, 'controls are revealed once enhancement succeeds');
  assert.equal(harness.slides[0].dataset.position, '0');
  assert.equal(harness.slides[1].dataset.position, '1');
  assert.equal(harness.slides[2].dataset.position, '2');
  assert.equal(harness.slides[3].dataset.position, '-2');
  assert.equal(harness.slides[4].dataset.position, '-1');
  assert.equal(harness.slides[0].attributes.get('aria-hidden'), 'false');
  assert.equal(harness.slides[1].attributes.get('aria-hidden'), 'true');
  assert.equal(harness.dots[0].attributes.get('aria-current'), 'true');
  assert.equal(harness.dots[1].attributes.get('aria-current'), 'false');
  assert.equal(harness.status.textContent, 'Photo 1 of 5');
  assert.equal(harness.counter.textContent, '01');
  assert.equal(harness.dots[0].disabled, false, 'dots are enabled on enhancement');

  harness.next.emit('click', {});
  assert.equal(harness.slides[1].dataset.position, '0');
  assert.equal(harness.slides[0].dataset.position, '-1');
  assert.equal(harness.slides[2].dataset.position, '1');
  assert.equal(harness.slides[3].dataset.position, '2');
  assert.equal(harness.slides[4].dataset.position, '-2');
  assert.equal(harness.slides[1].attributes.get('aria-hidden'), 'false');
  assert.equal(harness.slides[0].attributes.get('aria-hidden'), 'true');
  assert.equal(harness.dots[1].attributes.get('aria-current'), 'true');
  assert.equal(harness.status.textContent, 'Photo 2 of 5');
  assert.equal(harness.counter.textContent, '02');

  harness.heroStack.emit('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(harness.status.textContent, 'Photo 3 of 5');
  harness.heroStack.emit('keydown', { key: 'ArrowLeft', preventDefault() {} });
  assert.equal(harness.status.textContent, 'Photo 2 of 5');

  harness.previous.emit('click', {});
  assert.equal(harness.status.textContent, 'Photo 1 of 5');

  harness.stage.emit('pointerdown', { isPrimary: true, button: 0, target: harness.stage, pointerId: 1, clientX: 260, clientY: 120 });
  harness.stage.emit('pointerup', { pointerId: 1, clientX: 180, clientY: 130 });
  assert.equal(harness.status.textContent, 'Photo 2 of 5', 'a left swipe advances the deck');

  harness.stage.emit('pointerdown', { isPrimary: true, button: 0, target: harness.stage, pointerId: 2, clientX: 180, clientY: 120 });
  harness.stage.emit('pointerup', { pointerId: 2, clientX: 260, clientY: 130 });
  assert.equal(harness.status.textContent, 'Photo 1 of 5', 'a right swipe rewinds the deck');

  harness.stage.emit('pointerdown', { isPrimary: true, button: 0, target: harness.stage, pointerId: 3, clientX: 200, clientY: 120 });
  harness.stage.emit('pointerup', { pointerId: 3, clientX: 190, clientY: 130 });
  assert.equal(harness.status.textContent, 'Photo 1 of 5', 'short swipes do nothing');

  harness.dots[4].emit('click', {});
  assert.equal(harness.status.textContent, 'Photo 5 of 5');
  assert.equal(harness.counter.textContent, '05');
  harness.dots[4].emit('click', {});
  assert.equal(harness.status.textContent, 'Photo 5 of 5', 'clicking the active dot keeps the current photo (dots are direct selectors)');
  harness.next.emit('click', {});
  assert.equal(harness.status.textContent, 'Photo 1 of 5', 'the deck wraps from the last photo to the first');
});

test('direct-file navigation handles fragment mutations without selector parsing', () => {
  class MockElement {
    constructor() {
      this.listeners = new Map();
      this.attributes = new Map();
      this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
      this.style = { setProperty() {} };
      this.hidden = false;
      this.textContent = '';
      this.focusCount = 0;
    }

    addEventListener(type, listener) { this.listeners.set(type, listener); }
    emit(type, event) { this.listeners.get(type)?.forEach((listener) => listener(event)); }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    focus() { this.focusCount += 1; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; }
    querySelector(selector) { return selector === '.nav-toggle-label' ? this.label : undefined; }
    querySelectorAll() { return []; }
  }

  const header = new MockElement();
  const toggle = new MockElement();
  toggle.label = new MockElement();
  const nav = new MockElement();
  const target = new MockElement();
  const links = [
    Object.assign(new MockElement(), { origin: 'file://', pathname: '/axora/index.html', hash: '' }),
    Object.assign(new MockElement(), { origin: 'https://example.com', pathname: '/', hash: '#services' }),
    Object.assign(new MockElement(), { origin: 'file://', pathname: '/axora/index.html', hash: '#%' }),
    Object.assign(new MockElement(), { origin: 'file://', pathname: '/axora/index.html', hash: '#missing' }),
    Object.assign(new MockElement(), { origin: 'file://', pathname: '/axora/index.html', hash: '#services' }),
  ];
  nav.querySelectorAll = () => links;
  const document = {
    body: new MockElement(),
    documentElement: new MockElement(),
    hidden: false,
    activeElement: undefined,
    addEventListener() {},
    getElementById(id) { return id === 'services' ? target : null; },
    querySelector(selector) {
      return { '.site-header': header, '.nav-toggle': toggle, '#primary-nav': nav }[selector];
    },
    querySelectorAll() { return []; },
  };
  const window = {
    location: { origin: 'file://', pathname: '/axora/index.html' },
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 0,
    matchMedia(query) { return { matches: false, addEventListener() {} }; },
    requestAnimationFrame(callback) { callback(); return 1; },
    cancelAnimationFrame() {},
    addEventListener() {},
    setTimeout() { return 1; },
    clearTimeout() {},
  };

  runInNewContext(script, { document, window, Element: MockElement, decodeURIComponent });

  for (const link of links.slice(0, 4)) {
    assert.doesNotThrow(() => link.listeners.get('click')());
  }
  assert.equal(toggle.focusCount, 4, 'unresolvable fragments close the menu and restore focus');
  assert.equal(toggle.attributes.get('aria-expanded'), 'false');
  assert.equal(toggle.label.textContent, 'Open navigation');
  links[4].listeners.get('click')();
  assert.equal(target.focusCount, 1, 'resolvable fragments focus the target section');
  assert.equal(target.attributes.get('tabindex'), '-1');
});
