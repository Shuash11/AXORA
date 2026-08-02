import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const script = readFileSync('script.js', 'utf8');
const assetVersion = '20260802-4';

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

  /* === Section order: home, about, why-axora, portfolio, team, testimonials, contact === */
  for (const id of ['home', 'about', 'why-axora', 'portfolio', 'team', 'testimonials', 'contact']) {
    assert.match(html, new RegExp(`<section[^>]+id="${id}"`, 'i'), `section#${id} must exist`);
  }
  const sectionIds = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/gi)].map((match) => match[1]);
  const expectedOrder = ['home', 'about', 'why-axora', 'portfolio', 'team', 'testimonials', 'contact'];
  assert.deepEqual(sectionIds, expectedOrder, 'sections must follow the required order');

  /* === Primary nav: Home, About, Portfolio, Team, Contact === */
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0] ?? '';
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
  for (const target of ['#home', '#about', '#portfolio', '#team', '#contact']) {
    assert.match(header, new RegExp(`href="${target}"`), `header nav must link to ${target}`);
    assert.match(footer, new RegExp(`href="${target}"`), `footer nav must link to ${target}`);
  }
  assert.match(html, /<button class="nav-toggle"[^>]*aria-controls="primary-nav"[^>]*aria-expanded="false"[^>]*aria-label="Open navigation"[^>]*hidden>/);
  assert.match(html, /<nav id="primary-nav" class="site-nav" aria-label="Primary navigation">/);
  assert.match(html, /href="#home"[^>]*>Home<\/a>/);
  assert.match(html, /href="#about"[^>]*>About<\/a>/);
  assert.match(html, /href="#portfolio"[^>]*>Portfolio<\/a>/);
  assert.match(html, /href="#team"[^>]*>Team<\/a>/);
  assert.match(html, /href="#contact"[^>]*>Contact<\/a>/);
  /* Primary nav must follow the exact section order */
  const primaryNav = header.match(/<nav\b[^>]*id="primary-nav"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? '';
  const primaryNavLinks = [...primaryNav.matchAll(/<a\b[^>]*href="#([a-z0-9-]+)"[^>]*>([^<]+)<\/a>/gi)].map((m) => m[1]);
  assert.deepEqual(primaryNavLinks, ['home', 'about', 'portfolio', 'team', 'contact'], 'primary nav must list links in section order');
  assert.match(header, /<span class="nav-toggle-label">Menu<\/span>/);
  assert.match(css, /^\.site-nav\s*\{[^}]*display:\s*flex/m, 'the desktop nav must be visible without JS');
  assert.match(header, /href="#contact"[^>]*>Let.s talk<\/a>/);

  assert.doesNotMatch(html, /AXORA\s*·\s*VIRTUAL ASSISTANTS/i, 'the stale hero eyebrow must be gone');
  assert.doesNotMatch(html, /Skilled hands,|ready to help\./i, 'the old headline must be gone');
  const heroIdentity = html.match(/<p class="hero-identity load-item"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
  assert.ok(heroIdentity, 'the hero identity must be a hero-specific two-line block');
  assert.match(heroIdentity, /^\s*<strong>AXORA<\/strong>\s*<span>Digital Solutions Studio<\/span>\s*$/m, 'the identity must be exactly AXORA / Digital Solutions Studio');
  assert.doesNotMatch(heroIdentity, /[·|—–]/, 'the identity must not fake two lines with a separator character');
  const heroH1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[0] ?? '';
  assert.match(heroH1, /^<h1 id="hero-title" class="load-item" style="--order: 1">Turning Ideas Into<br><em>Solutions\.<\/em><\/h1>$/, 'the hero H1 must keep its designed line break and gradient emphasis');
  const renderedHeadline = heroH1.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(renderedHeadline, 'Turning Ideas Into Solutions.', 'the rendered headline text must be exactly "Turning Ideas Into Solutions."');
  assert.match(html, /<title>AXORA — Turning Ideas Into Solutions<\/title>/, 'the document title must drop the stale headline');
  assert.match(html, new RegExp(`<link rel="stylesheet" href="styles\\.css\\?v=${assetVersion}">`), 'the stylesheet URL must be versioned so deployed HTML cannot reuse stale CSS');
  assert.match(html, new RegExp(`<script src="script\\.js\\?v=${assetVersion}" defer><\\/script>`), 'the script URL must be versioned with the same release key');
  assert.doesNotMatch(html, /(?:href="styles\.css"|src="script\.js")/, 'bare mutable asset URLs must not return');
  assert.match(html, /<p class="lede load-item"[^>]*>AXORA is a digital solutions studio helping businesses, entrepreneurs, and organizations transform ideas into practical digital products through development, design, and reliable digital support\.<\/p>/, 'the hero must contain the approved studio description');

  /* === Hero CTAs: Explore work, Meet the team, Start a Project === */
  const heroActions = html.match(/<div class="hero-actions load-item"([^>]*)>([\s\S]*?)<\/div>/)?.[0] ?? '';
  assert.doesNotMatch(heroActions, /aria-label=/);
  assert.match(heroActions, /href="#portfolio"[^>]*>Explore work/);
  assert.match(heroActions, /href="#team"[^>]*>Meet the team/);
  assert.match(heroActions, /href="#contact"[^>]*>Start a Project/);

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
});

test('About section contains required copy and value tiles', () => {
  const about = html.match(/<section id="about"[^>]*>([\s\S]*?)<\/section>\s*(?:<section|<\/main>)/)?.[1] ?? '';
  assert.ok(about, 'the About section must exist');
  assert.match(about, /eyebrow/i, 'About must have an eyebrow');
  assert.match(html, /About AXORA/i, 'About section must have the eyebrow "About AXORA"');
  assert.match(about, /AXORA is a Digital Solutions Studio dedicated to helping businesses, entrepreneurs, startups, and organizations solve problems through technology, design, and digital support/, 'Who We Are text must be present');
  assert.match(about, /To empower businesses by delivering innovative, reliable, and client focused digital solutions through collaboration, creativity, and technology/, 'Mission text must be present');
  assert.match(about, /To become a trusted digital solutions partner recognized for transforming ideas into meaningful digital experiences and long term business success/, 'Vision text must be present');
  assert.match(about, /AXORA was born from a moment of inspiration during an IT Summit\. Surrounded by innovators and industry professionals, we realized that opportunity begins the moment you choose to step forward\. Inspired by that experience, we combined our strengths in development, design, and digital support to create a team dedicated to delivering meaningful digital solutions through collaboration, creativity, and technology\./, 'Our Story must contain the complete approved paragraph');
  assert.match(about, /<div class="about-stage"[^>]*>/, 'About must use the spatial studio-stage composition');
  assert.match(about, /<div class="about-prop" aria-hidden="true">[\s\S]*?about-orbit[\s\S]*?about-core[\s\S]*?about-satellite/, 'About must contain a bounded physical 3D prop scene');
  assert.match(about, /<div class="about-direction">[\s\S]*?about-mission[\s\S]*?about-vision/, 'Mission and Vision must form one directional rail');
  const storyCarousel = about.match(/<div class="story-carousel"[^>]*>([\s\S]*?)<\/div>\s*<div class="story-copy">/)?.[1] ?? '';
  assert.match(about, /<div class="story-carousel"[^>]*role="region"[^>]*aria-roledescription="carousel"[^>]*aria-label="AXORA at the IT Summit">/, 'Our Story must have an accessible IT Summit photo carousel');
  assert.ok(storyCarousel, 'the story carousel must contain a slide deck, controls, and status');
  const storySlides = [...storyCarousel.matchAll(/<div class="story-slide" aria-hidden="(?:false|true)">[\s\S]*?<img\b[^>]*>/g)].map((match) => match[0]);
  assert.equal(storySlides.length, 15, 'the story carousel must cycle all 15 IT Summit photos');
  storySlides.forEach((slide, index) => {
    assert.match(slide, /src="AXORA IMAGES INSPIRED\/[^"]+_n\.jpg"/, `slide ${index + 1} must reference a photo under AXORA IMAGES INSPIRED/`);
    assert.match(slide, new RegExp(`alt="IT Summit photo ${index + 1}"`), `slide ${index + 1} must have sequential alt text`);
    assert.match(slide, /loading="lazy"/, `slide ${index + 1} must be lazy-loaded`);
    assert.match(slide, /width="800"[^>]*height="600"/, `slide ${index + 1} must reserve layout space`);
  });
  assert.match(storyCarousel, /<button class="carousel-arrow" type="button" data-carousel-prev aria-label="Previous photo">[\s\S]*?<svg\b/);
  assert.match(storyCarousel, /<button class="carousel-arrow" type="button" data-carousel-next aria-label="Next photo">[\s\S]*?<svg\b/);
  const storyDots = [...storyCarousel.matchAll(/<button\b[^>]*\bclass="dot"[^>]*>/g)].map((match) => match[0]);
  assert.equal(storyDots.length, 15, 'the story carousel must have 15 dot indicators');
  storyDots.forEach((dot, index) => {
    assert.match(dot, new RegExp(`data-dot="${index}"`));
    assert.match(dot, new RegExp(`aria-label="Photo ${index + 1} of 15"`));
    assert.match(dot, new RegExp(`aria-current="${index === 0}"`));
    assert.match(dot, /disabled/);
  });
  assert.match(storyCarousel, /<span data-count-current>01<\/span>/, 'the story carousel must expose a zero-padded visible count');
  assert.match(about, /<p class="carousel-status sr-only" role="status" aria-live="polite">Photo 1 of 15<\/p>/, 'the story carousel must announce photo changes');
  const valueTileOpenings = [...about.matchAll(/<div\b(?=[^>]*\bclass="[^"]*\bvalue-tile\b[^"]*")[^>]*>/g)].map((match) => match[0]);
  assert.equal(valueTileOpenings.length, 5, 'five complete value-tile opening tags must exist');
  const coreValuePairs = [...about.matchAll(/<div\b(?=[^>]*\bclass="[^"]*\bvalue-tile\b[^"]*")[^>]*>\s*<span class="value-letter" aria-hidden="true">([A-Z])<\/span>\s*<span class="value-name">([^<]+)<\/span>/g)]
    .map((match) => [match[1], match[2]]);
  assert.deepEqual(coreValuePairs, [
    ['A', 'Accountability'],
    ['X', 'Excellence'],
    ['O', 'Openness'],
    ['R', 'Reliability'],
    ['A', 'Adaptability'],
  ], 'Core Value letter/name pairs must be exact and ordered');
  /* Static value tiles must not be keyboard-focusable after their class attribute. */
  for (const opening of valueTileOpenings) {
    const classAttribute = opening.match(/\bclass="[^"]*"/)?.[0] ?? '';
    const afterClassAttribute = opening.slice(opening.indexOf(classAttribute) + classAttribute.length);
    assert.doesNotMatch(afterClassAttribute, /\btabindex\b/, `static value-tile must not have tabindex after its class attribute: ${opening}`);
  }
});

test('Services section is removed in favor of Selected Work', () => {
  assert.doesNotMatch(html, /<section id="services"\b/, 'the duplicate Services section must not exist');
  assert.doesNotMatch(html, /href="#services"/, 'no navigation may target the removed Services section');
  assert.doesNotMatch(html, /What we build\s*<br>and support\./, 'the removed section heading must not remain');
  assert.match(html, /<section id="portfolio"[^>]*>/, 'Selected Work must remain the destination for work exploration');
  assert.match(html, /<a class="button button-primary" href="#portfolio">Explore work/, 'the primary hero action must lead to Selected Work');
  for (const label of ['Web Development', 'Mobile Development', 'Design', 'Digital Support']) {
    assert.match(html, new RegExp(`<li><a href="#portfolio">${label}<\\/a><\\/li>`), `${label} in the footer must lead to Selected Work`);
  }
});

test('Why Choose AXORA section has required items', () => {
  const why = html.match(/<section id="why-axora"[^>]*>([\s\S]*?)<\/section>\s*(?:<section|<\/main>)/)?.[1] ?? '';
  assert.ok(why, 'the why-axora section must exist');
  assert.match(why, /Multidisciplinary Team/);
  assert.match(why, /Different specialists working together to deliver complete solutions\./);
  assert.match(why, /Client Focused Approach/);
  assert.match(why, /Every solution is tailored to your goals and requirements\./);
  assert.match(why, /Reliable Delivery/);
  assert.match(why, /We value professionalism, communication, and accountability\./);
  assert.match(why, /Modern Technology/);
  assert.match(why, /We use current tools and best practices to create scalable digital solutions\./);
  assert.match(why, /Long Term Partnership/);
  assert.match(why, /We continue supporting your business even after project completion\./);
  assert.match(why, /<div class="why-focal-media"[^>]*>[\s\S]*?<img\b[^>]*\bsrc="Hero Image\/755690039_2254034195393709_1404549311183090400_n\.jpg"[^>]*\bloading="lazy"/, 'the focal team card must show the team photo instead of a plain box');
  assert.doesNotMatch(why.match(/<article\b(?=[^>]*\bclass="[^"]*\bwhy-card\b[^"]*\bwhy-focal\b[^"]*")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '', /<svg\b/, 'the focal team card must not fake a team visual with an icon');
  assert.match(why, /<button\b[^>]*\bclass="[^"]*\bwhy-focal-open\b[^"]*"[^>]*\bdata-open-lightbox[^>]*\bdisabled\b/, 'the focal card must ship a tappable photo button, inert until enhancement succeeds');
  assert.match(why, /<span class="why-focal-hint">[^<]+<\/span>/, 'the tappable photo area must show a view-photo hint');
  assert.match(html, /<dialog\b[^>]*\bid="photo-lightbox"[^>]*\baria-label="[^"]+"[^>]*>\s*<img\b[^>]*\bsrc="Hero Image\/755690039_2254034195393709_1404549311183090400_n\.jpg"[^>]*\balt="[^"]+"[^>]*>/m, 'the full team photo must live in a labelled lightbox dialog');
  assert.match(html, /<dialog\b[^>]*\bid="photo-lightbox"[\s\S]*?<button\b[^>]*\bdata-close-lightbox\b/, 'the lightbox must carry an explicit close button');
  /* Static why cards must not be keyboard-focusable after their class attribute. */
  const whyCardOpenings = [...why.matchAll(/<article\b(?=[^>]*\bclass="[^"]*\bwhy-card\b[^"]*")[^>]*>/g)].map((match) => match[0]);
  assert.equal(whyCardOpenings.length, 5, 'five complete why-card opening tags must exist');
  for (const opening of whyCardOpenings) {
    const classAttribute = opening.match(/\bclass="[^"]*"/)?.[0] ?? '';
    const afterClassAttribute = opening.slice(opening.indexOf(classAttribute) + classAttribute.length);
    assert.doesNotMatch(afterClassAttribute, /\btabindex\b/, `static why-card must not have tabindex after its class attribute: ${opening}`);
  }
});

test('Portfolio section has categories and honest pre-launch state', () => {
  const portfolio = html.match(/<section id="portfolio"[^>]*>([\s\S]*?)<\/section>\s*(?:<section|<\/main>)/)?.[1] ?? '';
  assert.ok(portfolio, 'the portfolio section must exist');
  for (const cat of ['Websites', 'Mobile Apps', 'Branding Projects', 'UI/UX Designs', 'Graphics', 'Academic Projects']) {
    assert.match(portfolio, new RegExp(escapeRegExp(cat)), `portfolio must include category: ${cat}`);
  }
  assert.match(portfolio, /Academic Projects/i, 'Academic Projects must be clearly labeled');
  assert.match(portfolio, /Selected work is being prepared for publication|being prepared for publication/i, 'portfolio must have honest pre-launch state');
  assert.doesNotMatch(portfolio, /Lorem ipsum/i, 'no lorem ipsum in portfolio');
  /* Static portfolio cards must not be keyboard-focusable (no tabindex) */
  const portfolioCards = [...html.matchAll(/<article\b[^>]*class="portfolio-card[^"]*"[^>]*>/g)];
  assert.ok(portfolioCards.length >= 6, 'at least six portfolio cards');
  for (const card of portfolioCards) {
    assert.doesNotMatch(card[0], /tabindex/, `static portfolio-card must not have tabindex: ${card[0].slice(0, 80)}`);
  }
});

test('Team section has updated roles and dialog data', () => {
  const team = html.match(/<section id="team"[^>]*>([\s\S]*?)<\/section>\s*(?:<section|<\/main>)/)?.[1] ?? '';
  assert.ok(team, 'the team section must exist');
  assert.equal(classCount(html, 'team-card'), 4);
  const member01PortraitPath = 'member images/762542297_1046525607966526_6264202658131260171_n.jpg';
  assert.ok(existsSync(member01PortraitPath), 'the Member 01 portrait source file must exist on disk');
  const member01EncodedSrc = 'member%20images/762542297_1046525607966526_6264202658131260171_n.jpg';

  /* Check that roles are updated */
  const roles = [...html.matchAll(/<small class="team-role">([^<]+)<\/small>/g)].map(m => m[1]);
  assert.equal(roles.length, 4, 'four team cards must have roles');
  assert.equal(roles[0], 'Client Success Lead', 'Member 01 role');
  assert.equal(roles[1], 'Lead Developer', 'Member 02 role');
  assert.equal(roles[2], 'Frontend Developer', 'Member 03 role');
  assert.equal(roles[3], 'Creative Director', 'Member 04 role');

  for (let index = 0; index < 4; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    assert.match(html, new RegExp(`<button[^>]*class="team-card"[^>]*data-member="${index}"[^>]*data-tilt[^>]*disabled[^>]*data-reveal[^>]*>[\\s\\S]*?${number}[\\s\\S]*?Team Member ${number}`));
  }

  const member01Card = html.match(/<button[^>]*class="team-card"[^>]*data-member="0"[^>]*data-tilt[^>]*disabled[^>]*data-reveal[^>]*>([\s\S]*?)<\/button>/)?.[0] ?? '';
  assert.ok(member01Card, 'Member 01 card must be matched');
  assert.match(member01Card, new RegExp(`<img[^>]*class="team-photo"[^>]*src="${escapeRegExp(member01EncodedSrc)}"[^>]*alt=""[^>]*width="1086"[^>]*height="1448"[^>]*loading="lazy"[^>]*decoding="async"[^>]*draggable="false">`), 'Member 01 must contain the portrait image');
  assert.doesNotMatch(member01Card, /device-label/, 'Member 01 must not contain a device-label');
  for (let index = 1; index < 4; index += 1) {
    assert.match(html, new RegExp(`<span class="device-label">TM-0${index + 1}<\\/span>`), `Members 02-04 must retain device labels`);
  }

  /* Dialog must use role-based content, not generic placeholder wording */
  const dialog = html.match(/<dialog id="team-dialog"[^>]*>([\s\S]*?)<\/dialog>/)?.[1] ?? '';
  assert.ok(dialog, 'the native team dialog must be present');
  assert.doesNotMatch(dialog, /Achievement placeholder/, 'dialog must not contain generic "Achievement placeholder" text');
  assert.doesNotMatch(dialog, /Project placeholder/, 'dialog must not contain generic "Project placeholder" text');
  assert.doesNotMatch(dialog, /Role \/ specialty/, 'dialog must not show generic "Role / specialty" — should show actual roles');
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
  const controls = html.match(/<div class="carousel-controls" hidden>([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.equal((controls.match(/\bdata-dot\b/gi) ?? []).length, 5, 'the hero carousel must expose exactly five dots');
  const slideImages = slideMatches.map((m) => m[1].match(/<img\b[^>]*>/)?.[0] ?? '');
  assert.equal(slideImages.filter((img) => /loading="lazy"/i.test(img)).length, 4, 'four of five carousel slides use lazy loading');
  assert.equal(slideImages.filter((img) => /loading="eager"/i.test(img)).length, 1, 'one carousel slide uses eager loading');
  assert.equal(slideImages.filter((img) => /decoding="async"/i.test(img)).length, 5, 'all five carousel slides use async decoding');
  assert.equal(slideImages.filter((img) => /draggable="false"/i.test(img)).length, 5, 'all five carousel slides use draggable false');
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

test('Testimonials section has honest pre-launch state', () => {
  const testimonials = html.match(/<section id="testimonials"[^>]*>([\s\S]*?)<\/section>\s*(?:<section|<\/main>)/)?.[1] ?? '';
  assert.ok(testimonials, 'the testimonials section must exist');
  assert.match(testimonials, /Academic collaborations/i, 'testimonials must include academic collaborations');
  assert.match(testimonials, /Organization projects/i, 'testimonials must include organization projects');
  assert.match(testimonials, /Volunteer work/i, 'testimonials must include volunteer work');
  assert.match(testimonials, /We do not publish invented praise\. Verified feedback will appear here only after completed work is approved for publication\./i, 'the section must state its verified-feedback policy');
  assert.match(testimonials, /<div class="proof-board"[^>]*>[\s\S]*?<article class="proof-manifesto">[\s\S]*?<ol class="proof-list">/, 'Testimonials must render as one cohesive proof board, not generic quote cards');
  assert.equal(classCount(testimonials, 'proof-row'), 3, 'the proof board must contain three evidence rows');
  assert.equal(classCount(testimonials, 'testimonial-card'), 0, 'generic testimonial placeholder cards must be removed');
  const proofIcons = [...testimonials.matchAll(/<svg\b[^>]*>/g)].map((match) => match[0]);
  assert.equal(proofIcons.length, 3, 'each proof source must have one icon');
  proofIcons.forEach((icon) => {
    assert.match(icon, /width="24"/);
    assert.match(icon, /height="24"/);
  });
  assert.doesNotMatch(testimonials, /Lorem ipsum/i, 'no lorem ipsum');
  assert.doesNotMatch(testimonials, /★★★|star rating|⭐/i, 'no fake star ratings');
});

test('Contact section has updated copy', () => {
  const contact = html.match(/<section id="contact" class="contact-panel"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  assert.ok(contact, 'the contact section must exist');
  assert.match(contact, /<h2 id="contact-title">Let's Build Something Meaningful Together\.<\/h2>/, 'contact heading');
  assert.match(contact, /Whether you.re starting with an idea or improving an existing project, AXORA is ready to help transform your vision into practical digital solutions\./, 'contact supporting text');
  assert.match(contact, /mailto:your-email@example.com/, 'contact email');
  assert.match(contact, /Replace this email before launch\./, 'contact warning');
  assert.match(contact, /<a class="button button-dark" href="mailto:your-email@example\.com">Start a Project<\/a>/, 'contact CTA');
});

test('Footer has expanded navigation, services, connect sections', () => {
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
  assert.ok(footer, 'footer must exist');
  /* Quick nav links */
  const footerNav = footer.match(/<nav\b[^>]*aria-label="Footer navigation"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? '';
  assert.ok(footerNav, 'footer navigation must exist');
  for (const target of ['#home', '#about', '#portfolio', '#team', '#contact']) {
    assert.match(footerNav, new RegExp(`href="${target}"`), `footer navigation must link to ${target}`);
  }
  const footerNavLinks = [...footerNav.matchAll(/<a\b[^>]*href="#([a-z0-9-]+)"[^>]*>[^<]+<\/a>/gi)].map((match) => match[1]);
  assert.deepEqual(footerNavLinks, ['home', 'about', 'portfolio', 'team', 'contact'], 'footer navigation links must follow the exact quick-nav order');
  /* Service group names */
  assert.match(footer, /Web Development/i, 'footer must list Web Development');
  assert.match(footer, /Mobile Development/i, 'footer must list Mobile Development');
  assert.match(footer, /Design/i, 'footer must list Design');
  assert.match(footer, /Digital Support/i, 'footer must list Digital Support');
  /* Placeholder email */
  assert.match(footer, /your-email@example\.com/, 'footer must display placeholder email');
  /* Copyright */
  assert.match(footer, /© 2026 AXORA\. All rights reserved\./, 'footer must have copyright');
  /* Social profiles state */
  assert.match(footer, /social profiles will be added|official social profiles/i, 'footer must state social profiles are pending');
  assert.doesNotMatch(footer, /href="#"/, 'no dead # links in footer');
  /* Privacy policy */
  assert.match(footer, /Privacy Policy/i, 'footer must include Privacy Policy label');
  assert.doesNotMatch(footer, /Terms of Service is optional/, 'footer must not contain internal dev sentence');
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
  assert.match(css, /\.hero-identity\s*\{[^}]*flex-direction:\s*column[^}]*font-family:\s*var\(--label\)/, 'the hero identity must be a two-line label-type block');
  for (const selector of ['.site-header', '.nav-toggle', '.hero', '.hero-scene', '.scene', '.stage', '.scene-slide', '.carousel-controls', '.carousel-arrow', '.dot', '.team-card', '.contact-panel', '.site-footer', '.team-photo']) assert.match(css, new RegExp(selector.replace('.', '\\.') + '\\s*(?:,|\\{)'));
  assert.match(css, /\.team-photo\s*\{[^}]*object-fit:\s*cover/, '.team-photo must use object-fit: cover');
  assert.match(css, /\.team-photo\s*\{[^}]*object-position:\s*top/, '.team-photo must anchor the face near top');
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
  assert.match(css, /\.js \[data-tilt\]\[data-reveal\]\.is-revealed\s*\{[^}]*transform:\s*rotateX\(clamp\(-3deg,\s*var\(--tilt-x,\s*0deg\),\s*3deg\)\)\s*rotateY\(clamp\(-3deg,\s*var\(--tilt-y,\s*0deg\),\s*3deg\)\)\s*translateY\(var\(--lift,\s*0px\)\)/, 'revealed tilt cards must preserve the non-inverted base tilt orientation and lift');
  assert.match(css, /\.values-label\s*\{[^}]*color:\s*#D8DBFF/i, 'values label must use a high-contrast light token on the dark values rail');
  assert.doesNotMatch(css, /\.values-label\s*\{[^}]*color:\s*var\(--text-faint\)/, 'values label must not use the low-contrast text-faint token');
  assert.match(css, /\.footer-privacy\s*\{[^}]*color:\s*var\(--text-dim\)/, 'footer privacy label must use the approved contrast-safe text token');
  assert.doesNotMatch(css, /\.footer-privacy\s*\{[^}]*color:\s*var\(--text-faint\)/, 'footer privacy label must not use the low-contrast text-faint token');
  assert.match(css, /@media \(hover:\s*none\),\s*\(pointer:\s*coarse\)\s*\{[\s\S]*?\.js \[data-tilt\]\[data-reveal\]\.is-revealed\s*\{[^}]*--lift:\s*0px[^}]*transform:\s*none\s*;/, 'coarse pointers must explicitly clear revealed tilt transforms and lift');
  assert.match(css, /@media \(prefers-reduced-motion:\s*no-preference\)[\s\S]*?\.load-item\s*\{[^}]*animation:\s*rise/);
  assert.match(css, /@keyframes\s+rise\s*\{/);
  assert.match(css, /\.scene-slide\[data-position="0"\]\s*\{[^}]*opacity:\s*1/);
  assert.match(css, /\.scene-slide\[data-position="1"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /\.scene-slide\[data-position="-1"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /\.carousel-controls\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.hero-scene\.is-enhanced \.carousel-controls\s*\{[\s\S]*?display:\s*flex/);
  assert.match(css, /\.carousel-arrow\s*\{[\s\S]*?min-inline-size:\s*36px[\s\S]*?min-block-size:\s*36px/);
  assert.match(css, /\.dot\s*\{[\s\S]*?min-inline-size:\s*44px[\s\S]*?min-block-size:\s*44px/);
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
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.scene,\s*\.team-card,\s*\.why-card,\s*\.portfolio-card,\s*\.value-tile\s*\{[^}]*transform:\s*none\s*!important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.load-item\s*\{[^}]*animation:\s*none\s*!important/);
  assert.match(css, /@media \(max-width:\s*1023px\)[\s\S]*?\.team-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.team-list\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.hero-actions\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.chips\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/, 'mobile capability chips must form a balanced two-column grid');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.site-footer\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.site-footer \.brand\s*\{[^}]*(?:grid-area:\s*auto|order:\s*1)/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.site-footer nav\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/, 'mobile footer navigation must use a two-column grid');
  assert.match(css, /\.nav-toggle\s*\{[^}]*min-block-size:\s*44px[^}]*align-items:\s*center[^}]*justify-content:\s*center/, 'nav toggle must be a 44px-tall tap target');
  assert.match(css, /@media \(max-width:\s*767px\)\s*\{[\s\S]*?html:not\(\.js\)\s*\.scene-back-a,\s*html:not\(\.js\)\s*\.scene-back-b\s*\{[^}]*inset-inline:\s*0[^}]*transform:\s*none/, 'no-JS scene backdrop cards must be bounded flush on narrow screens');
  assert.match(css, /@media \(max-width:\s*767px\)\s*and\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.scene-back-a,\s*\.scene-back-b\s*\{[^}]*inset-inline:\s*0[^}]*transform:\s*none/, 'reduced-motion scene backdrop cards must be bounded flush on narrow screens');
  /* New section layout selectors */
  assert.match(css, /\.about-stage\s*\{[^}]*display:\s*grid/, 'about-stage must be a grid layout');
  assert.match(css, /\.about-who\s*\{[^}]*grid-column:/, 'about-who must be the focal editorial plate');
  assert.match(css, /\.about-prop\s*\{[^}]*position:\s*relative[^}]*overflow:\s*hidden/, 'about prop scene must be bounded');
  assert.match(css, /@keyframes\s+about-orbit\s*\{/, 'the About prop must include real object motion');
  assert.match(css, /\.values-row\s*\{[^}]*background:/, 'values-row must be a distinct dark studio rail');
  assert.match(css, /\.value-tiles\s*\{[^}]*display:\s*grid/, 'value-tiles must be a grid');
  assert.match(css, /\.value-tile\s*\{[^}]*border/, 'value-tile must have border for depth');
  assert.match(css, /\.value-letter\s*\{[^}]*font-family:\s*var\(--display\)/, 'value-letter must use display font');
  assert.match(css, /\.about-story\s*\{[^}]*border/, 'about-story must have border for plate effect');
  assert.doesNotMatch(css, /\.story-marker\b|\.story-spark\b/, 'the removed origin marker styles must not remain');
  assert.match(css, /\.story-carousel\s*\{/, 'story carousel must have dedicated styles');
  assert.match(css, /\.story-carousel\s*\{[^}]*touch-action:\s*pan-y/, 'story carousel must ignore horizontal drags while keeping vertical page scroll');
  assert.match(css, /\.story-carousel\.is-enhanced \.story-slide\[data-position="0"\]\s*\{[^}]*opacity:\s*1/, 'the active story slide must sit crisply in front');
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.story-carousel\.is-enhanced \.story-slide\s*\{[^}]*transform:\s*none\s*!important/, 'story carousel must disable the 3D fan under reduced motion');
  assert.doesNotMatch(css, /\.service-(?:card|list|index|web|mobile|design|support)\b/, 'removed Services section styles must not remain');
  assert.match(css, /\.why-grid\s*\{[^}]*display:\s*grid/, 'why-grid must be a grid layout');
  assert.match(css, /\.why-focal\s*\{[^}]*grid-column:\s*span/, 'why-focal must span columns for dominance');
  assert.match(css, /\.portfolio-grid\s*\{[^}]*display:\s*grid/, 'portfolio-grid must be a grid layout');
  assert.match(css, /\.portfolio-preview\s*\{[^}]*aspect-ratio/, 'portfolio-preview must have aspect-ratio');
  assert.match(css, /\.proof-board\s*\{[^}]*display:\s*grid/, 'proof-board must be one cohesive grid');
  assert.match(css, /\.proof-manifesto\s*\{[^}]*background:/, 'proof manifesto must be visually distinct');
  assert.match(css, /\.proof-row\s*\{[^}]*display:\s*grid/, 'proof sources must be structured rows');
  assert.match(css, /\.proof-icon svg\s*\{[^}]*inline-size:\s*24px[^}]*block-size:\s*24px/, 'proof icons must remain intrinsically bounded');
  assert.match(css, /\.footer-brand\s*\{[^}]*display:\s*flex/, 'footer-brand must use flex or grid');
  assert.match(css, /\.footer-services ul\s*\{[^}]*list-style:\s*none/, 'footer-services list must be unstyled');
  assert.match(css, /\.footer-legal\s*\{[^}]*display:\s*flex/, 'footer-legal must be flex for row layout');
  /* Responsive rules for new sections */
  assert.match(css, /@media \(max-width:\s*1023px\)[\s\S]*?\.about-stage\s*\{/, 'about-stage must have tablet breakpoint');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.portfolio-grid\s*\{[^}]*grid-template-columns:\s*1fr/, 'portfolio-grid must stack on mobile');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.why-grid\s*\{/, 'why-grid must have mobile rule');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.value-tiles\s*\{/, 'value-tiles must have mobile rule');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.value-tiles\s*\{[^}]*grid-template-columns:\s*repeat\(2/, 'value-tiles must collapse to 2 columns at 767px');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.value-tiles \.value-tile:last-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/, 'last value tile must span both columns at 767px');
  assert.match(css, /@media \(max-width:\s*540px\)[\s\S]*?\.value-tiles\s*\{[^}]*grid-template-columns:\s*1fr/, 'the dark value rail must become one readable column on phones');
  assert.doesNotMatch(css, /@media \(max-width:\s*1699px\)[\s\S]*?\.scroll-greeter\s*\{[^}]*display:\s*none/, 'the peeking character must not disappear at normal viewport widths');
  assert.match(css, /@media \(max-width:\s*1699px\)[\s\S]*?\.scroll-greeter\s*\{[^}]*scale:\s*\.82/, 'the full greeter must dock compactly at normal desktop widths');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.scroll-greeter\s*\{[^}]*scale:\s*\.8[^}]*[\s\S]*?\.greeter-bubble\s*\{[^}]*display:\s*grid[^}]*inline-size:\s*158px/, 'the mobile peeking character and speech bubble must remain clearly visible');
  assert.match(css, /@media \(max-width:\s*340px\)[\s\S]*?\.value-tiles\s*\{[^}]*grid-template-columns:\s*1fr/, 'value-tiles must collapse to 1 column at 340px');
  assert.match(css, /@media \(max-width:\s*340px\)[\s\S]*?\.value-tiles \.value-tile:last-child\s*\{[^}]*grid-column:\s*auto/, 'last value tile span must reset at 340px');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.proof-board\s*\{/, 'proof-board must have a mobile rule');
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*?\.footer-legal\s*\{/, 'footer-legal must have mobile rule');
  /* Tilt integration for new cards */
  assert.match(css, /\.why-card\s*\{[^}]*--tilt-x/, 'why-card must participate in tilt system');
  assert.match(css, /\.why-card\s*\{[^}]*transform-style:\s*preserve-3d/, 'why-card must preserve-3d');
  assert.match(css, /\.why-focal-media\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/, 'the team photo must be a full-card background layer');
  assert.match(css, /\.why-focal-media img\s*\{[^}]*object-fit:\s*cover[^}]*opacity:\s*\.\d+[^}]*filter:\s*contrast\(/, 'the backdrop photo must fill its frame, crisp enough to read behind the copy');
  assert.match(css, /\.why-focal-media::after\s*\{[^}]*linear-gradient/, 'the backdrop must carry a light scrim so the copy stays readable');
  assert.match(css, /\.why-focal\s*\{[^}]*min-block-size:\s*clamp\(/, 'the focal card must reserve enough height for a readable photo backdrop');
  assert.match(css, /\.why-focal-open\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*z-index:\s*2/, 'the tappable photo layer must cover the whole card above the backdrop');
  assert.match(css, /\.why-focal-hint\s*\{[^}]*border-radius:\s*999px/, 'the view-photo hint must render as a pill');
  assert.match(css, /\.photo-lightbox\s*\{[^}]*animation:\s*lightbox-in/, 'the lightbox must open with a short entrance animation');
  assert.match(css, /\.photo-lightbox\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/, 'the lightbox must adopt the photo aspect so the image fills it completely');
  assert.match(css, /\.photo-lightbox img\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/, 'the full photo must fill the lightbox edge to edge');
  assert.match(css, /\.photo-lightbox::backdrop\s*\{[^}]*backdrop-filter:\s*blur\(/, 'the lightbox must dim and soften the page behind it');
  assert.match(css, /\.why-focal p\s*\{[^}]*color:\s*var\(--text\)/, 'the focal sub copy must be dark enough to read over the photo');
  assert.match(css, /\.why-focal-media::after\s*\{[^}]*rgb\(248 250 255 \/ \.8\d\)/, 'the scrim must stay strong behind the copy');
  assert.match(css, /\.why-focal h3,\s*\.why-focal p\s*\{[^}]*z-index:\s*1/, 'the focal copy must sit above the photo layer');
  assert.match(css, /\.portfolio-card\s*\{[^}]*--tilt-x/, 'portfolio-card must participate in tilt system');
  assert.match(css, /\.portfolio-card\s*\{[^}]*transform-style:\s*preserve-3d/, 'portfolio-card must preserve-3d');
  /* Reduced motion coverage for new sections */
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.why-card\s*[,{][^}]*transform:\s*none\s*!important/, 'why-card must respect reduced-motion');
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.portfolio-card\s*[,{][^}]*transform:\s*none\s*!important/, 'portfolio-card must respect reduced-motion');
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.value-tile\s*[,{][^}]*transform:\s*none\s*!important/, 'value-tile must respect reduced-motion');
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
  assert.match(script, /function initPhotoLightbox\(\)\s*\{/);
  assert.match(script, /function initSpatialMotion\(\)\s*\{/);
  assert.match(script, /function initCarousel\(heroStack\)\s*\{/);
  assert.match(script, /function initStoryCarousel\(storyCarousel\)\s*\{/);
  assert.match(script, /if \(storyCarousel\) \{\s*initStoryCarousel\(storyCarousel\);/);
  const storyCarousel = script.match(/function initStoryCarousel\(storyCarousel\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(storyCarousel, /function show\(index, announce = true\)/, 'story slides can advance without announcing');
  assert.match(storyCarousel, /show\(nextIndex\(activeIndex, count\), false\)/, 'autoplay advances the deck quietly');
  assert.match(storyCarousel, /setInterval\(\(\) => \{[\s\S]*?\}, 1000\)/, 'autoplay ticks at 1s (at least 0.9s)');
  assert.match(storyCarousel, /if \(reducedMotionQuery\.matches \|\| document\.hidden \|\| autoplayHeld\)/, 'autoplay respects reduced motion, hidden tabs, and manual hold');
  assert.match(storyCarousel, /storyCarousel\.addEventListener\(['"]pointerenter['"]/);
  assert.match(storyCarousel, /storyCarousel\.addEventListener\(['"]pointerleave['"]/);
  assert.match(storyCarousel, /storyCarousel\.addEventListener\(['"]focusin['"]/);
  assert.match(storyCarousel, /storyCarousel\.addEventListener\(['"]focusout['"]/);
  assert.match(storyCarousel, /reducedMotionQuery\.addEventListener\(['"]change['"], startAutoplay\)/);
  assert.match(storyCarousel, /stage\.addEventListener\(['"]dragstart['"],\s*\(event\) => event\.preventDefault\(\)\)/, 'the deck must ignore native drags');
  for (const name of ['initNavigation', 'initReveals', 'initTeamDialog', 'initPhotoLightbox', 'initSpatialMotion']) {
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
  assert.match(spatialMotion, /document\.querySelector\(['"]\.site-footer['"]\)/);
  assert.match(spatialMotion, /footer\.getBoundingClientRect\(\)\.top > window\.innerHeight - 32/);
  assert.match(spatialMotion, /greeter\.classList\.toggle\(['"]is-visible['"], visible\)/);
  assert.match(spatialMotion, /greeter\.setAttribute\(['"]aria-hidden['"], String\(!visible\)\)/);
  assert.match(spatialMotion, /greeter\.tabIndex = visible \? 0 : -1/);
  assert.match(spatialMotion, /function updateScrollSpy\(\)\s*\{/);
  assert.match(spatialMotion, /link\.classList\.toggle\(['"]is-active['"], active\)/);
  /* Scroll spy must include every navigable section ID. */
  assert.match(spatialMotion, /const sectionIds = /, 'sectionIds must be defined for scroll spy');
  assert.match(spatialMotion, /'home'/, 'scroll spy must track home');
  assert.match(spatialMotion, /'about'/, 'scroll spy must track about');
  assert.match(spatialMotion, /'portfolio'/, 'scroll spy must track portfolio');
  assert.match(spatialMotion, /'team'/, 'scroll spy must track team');
  assert.match(spatialMotion, /'contact'/, 'scroll spy must track contact');
  assert.match(spatialMotion, /const sectionIds = \['home', 'about', 'portfolio', 'team', 'contact'\]/, 'scroll-spy sectionIds must match the exact navigable section order');
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
  /* Dialog must use role-based content, not generic placeholders */
  assert.doesNotMatch(dialog, /Achievement placeholder/, 'dialog populate must not use generic achievement placeholders');
  assert.doesNotMatch(dialog, /Project placeholder/, 'dialog populate must not use generic project placeholders');
  assert.doesNotMatch(dialog, /Role \/ specialty/, 'dialog must populate with actual role text, not generic');
});

test('photo lightbox opens the full team photo without auto-announce or autoplay', () => {
  const lightbox = script.match(/function initPhotoLightbox\(\)\s*\{[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.match(lightbox, /document\.querySelector\(['"]\[data-open-lightbox\]['"]\)/);
  assert.match(lightbox, /document\.querySelector\(['"]#photo-lightbox['"]\)/);
  assert.match(lightbox, /typeof lightbox\.showModal !== ['"]function['"]/);
  assert.match(lightbox, /opener\.disabled = false;/, 'the photo button must become tappable only after the lightbox initializes');
  assert.match(lightbox, /lightbox\.showModal\(\);[\s\S]*?document\.body\.classList\.add\(['"]dialog-open['"]\)/);
  assert.match(lightbox, /event\.target === lightbox[\s\S]*?lightbox\.close\(\)/, 'clicking the dimmed backdrop must close the lightbox');
  assert.match(lightbox, /lightbox\.addEventListener\(['"]close['"][\s\S]*?document\.body\.classList\.remove\(['"]dialog-open['"]\)/);
  assert.doesNotMatch(lightbox, /window\.setTimeout\(/, 'lightbox must open and close synchronously');
  assert.doesNotMatch(lightbox, /innerHTML/, 'lightbox must not build markup from strings');
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
  const footer = new MockElement(undefined, { left: 0, top: 2000, width: 1000, height: 200 });
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
    querySelector(selector) { return { '.site-header': header, '.scroll-greeter': greeter, '.site-footer': footer }[selector]; },
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
    footer,
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
  runtime.footer.rect.top = 700;
  runtime.emitWindow('scroll', {});
  assert.equal(runtime.greeter.classList.contains('is-visible'), false, 'the greeting clears the footer before it can cover content');
  assert.equal(runtime.greeter.attributes.get('aria-hidden'), 'true');
  assert.equal(runtime.greeter.tabIndex, -1);
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
