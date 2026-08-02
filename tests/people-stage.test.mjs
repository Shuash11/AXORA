import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/* The people stage module is created separately from the root manifest; the
   test loads the module file directly so the module stays independently
   testable. It fails to load until styles/06-people.css exists. */
const css = readFileSync('styles/06-people.css', 'utf8');

test('people-list stays a four-column stage grid under shared perspective', () => {
  assert.match(css, /\.people-list\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/, 'the people grid must keep four equal columns');
  assert.match(css, /\.people-list\s*\{[^}]*perspective:\s*1[34]\d{2}px/, 'the people grid must carry the shared tilt perspective');
});

test('person-stage is a transparent preserve-3d control carrying tilt and lift', () => {
  assert.match(css, /\.person-stage\s*\{[^}]*--tilt-x:\s*0deg;/, 'the stage must declare a tilt-x variable');
  assert.match(css, /\.person-stage\s*\{[^}]*--tilt-y:\s*0deg;/, 'the stage must declare a tilt-y variable');
  assert.match(css, /\.person-stage\s*\{[^}]*--lift:\s*0px;/, 'the stage must declare a lift variable');
  assert.match(css, /\.person-stage\s*\{[^}]*transform:\s*rotateX\(clamp\(-3deg,\s*var\(--tilt-x\),\s*3deg\)\)\s*rotateY\(clamp\(-3deg,\s*var\(--tilt-y\),\s*3deg\)\)\s*translateY\(var\(--lift\)\)/, 'the stage tilt must compose the shared non-inverted tilt and lift transform');
  assert.match(css, /\.person-stage\s*\{[^}]*transform-style:\s*preserve-3d/, 'the stage must preserve 3D space');
  assert.match(css, /\.person-stage\s*\{[^}]*background:\s*transparent/, 'the stage must not be a boxed card surface');
  assert.match(css, /\.person-stage\s*\{[^}]*border:\s*0/, 'the stage must explicitly drop the button border');
  assert.match(css, /\.person-stage\s*\{[^}]*padding:\s*0/, 'the stage must reset the native button padding');
  assert.match(css, /\.person-stage\s*\{[^}]*appearance:\s*none/, 'the stage must reset the native button appearance');
  assert.doesNotMatch(css, /\.person-stage\s*\{[^}]*?(?:border-radius|box-shadow):/, 'the stage must not fake a card with rounded framing or shadows');
  assert.match(css, /\.person-stage\s*\{[^}]*transition:\s*transform\s+260ms\s+var\(--ease-out\),\s*opacity\s+220ms\s+ease;/, 'the stage must transition exactly transform and opacity');
  assert.doesNotMatch(css, /\.person-stage\s*\{[^}]*transition:[^}]*?(?:border|shadow|color|background|filter)\b/, 'no other property may join the stage transition list');
});

test('person-scene is a bounded 3:4 stage viewport with its own perspective', () => {
  assert.match(css, /\.person-scene\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/, 'the scene must hold a 3:4 figure ratio');
  assert.match(css, /\.person-scene\s*\{[^}]*perspective:/, 'the scene must project its layers in depth');
  assert.match(css, /\.person-scene\s*\{[^}]*overflow:\s*hidden/, 'the scene must bound its layers');
});

test('scene layers place a rear wall, top-left light, floor shadow, and forward figure', () => {
  assert.match(css, /\.person-backdrop\s*\{[^}]*translateZ\(-\d+px\)/, 'the backdrop must sit behind the stage at negative depth');
  assert.match(css, /\.person-light\s*\{[^}]*radial-gradient\(/, 'the stage light must be a radial key light');
  assert.match(css, /\.person-floor-shadow\s*\{[^}]*border-radius:\s*50%[^}]*radial-gradient\(ellipse[^}]*filter:\s*blur\(/, 'the floor shadow must be a blurred ellipse');
  assert.match(css, /\.person-figure\s*\{[^}]*clip-path:[^}]*translateZ\(28px\)/, 'the figure must be clipped into a standing silhouette at +28px depth');
});

test('placeholder images crop top-center cover and the stage keeps its index label', () => {
  assert.match(css, /img\.person-placeholder\s*\{[^}]*object-fit:\s*cover[^}]*object-position:\s*top\s+center/, 'the placeholder image itself must crop from the top center like a portrait');
  assert.match(css, /\.person-index\s*\{/, 'the stage must style its index label');
});

test('hover, focus, and selection lift the stage and tighten the floor shadow', () => {
  assert.match(css, /\.person-stage:not\(:disabled\):hover[^{}]*\{[^}]*--lift:\s*-7px;/, 'hover must lift the stage -7px within its own rule');
  assert.match(css, /\.person-stage:not\(:disabled\):focus-visible[^{}]*\{[^}]*--lift:\s*-7px;/, 'keyboard focus must lift the stage -7px within its own rule');
  assert.match(css, /\.person-stage\.is-selected\s*\{[^}]*--lift:\s*-7px;/, 'selection must keep the lifted stage');
  assert.match(css, /\.person-stage\.is-selected \.person-floor-shadow\s*\{[^}]*inline-size:\s*5[0-9]%/, 'selection must tighten the floor shadow');
});

test('the fast tilt transition out-specifies the shared reveal transition', () => {
  assert.match(css, /\.js\s*\.person-stage\[data-tilt\]\[data-reveal\]\.is-revealed\.is-tilting\s*\{[^}]*transition:\s*opacity\s+700ms\s+var\(--ease-out\)\s+calc\(var\(--reveal-order,\s*0\)\s*\*\s*90ms\),\s*transform\s+130ms\s+ease-out;/, 'the tilting transition must speed transform while keeping the reveal opacity contract');
  assert.match(css, /\.js\s*\.person-stage\[data-tilt\]\[data-reveal\]\.is-revealed\.is-tilting\s*\{[^}]*transition:[^}]*opacity\s+700ms/, 'opacity must remain in the tilting transition list');
  assert.doesNotMatch(css, /\.js\s*\.person-stage\[data-tilt\]\[data-reveal\]\.is-revealed\.is-tilting\s*\{[^}]*transition:\s*transform\s+130ms\s+ease-out;/, 'the tilting transition must not drop opacity for a transform-only list');
  assert.doesNotMatch(css, /\.person-stage\.is-tilting\s*\{/, 'the low-specificity tilting rule must not return');
});

test('names and actions keep the display type and a 44px tap target', () => {
  assert.match(css, /\.person-name\s*\{[^}]*font-family:\s*var\(--display\)/, 'person names must use the display typeface');
  assert.match(css, /\.person-action\s*\{[^}]*min-block-size:\s*44px/, 'the action row must stay at least 44px tall');
  assert.match(css, /\.person-action\s*\{[^}]*color:\s*var\(--text-dim\)[^}]*font-size:\s*\.(?:6[89]|[7-9])\d*rem/, 'the action must use the contrast-safe dim token at a readable size');
  assert.doesNotMatch(css, /\.person-action\s*\{[^}]*color:\s*var\(--text-faint\)/, 'the action must not rely on the low-contrast faint token');
});

test('module owns no global media overrides', () => {
  assert.doesNotMatch(css, /@media/, 'coarse-pointer and reduced-motion overrides belong to styles/16-overrides.css');
});
