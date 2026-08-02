# People Behind AXORA and CSS Modularization Design

## Goal

Split the AXORA stylesheet into ordered, section-owned modules so changes to one
section, especially Hero, do not affect unrelated sections. Replace the current
Team card presentation with a dimensional "People Behind AXORA" stage that uses
four temporary project images and reveals only a placeholder name and short
description in the existing accessible dialog.

## Scope

- Preserve the current visual system, responsive behavior, native dialog flow,
  and reduced-motion safeguards.
- Change the Team heading to "People Behind AXORA".
- Show four temporary people entries named `People 01` through `People 04`.
- Remove role labels from both the stage and the dialog.
- Retain only the selected person's name and a short description in the dialog.
- Use existing project image assets as visual placeholders only. They do not
  claim to represent the named people.

## Non-Goals

- Do not add a CSS framework, build step, WebGL, third-party dependencies, or
  generated faces.
- Do not treat group or event photographs as verified portraits.
- Do not redesign other site sections while splitting their styles.
- Do not change the existing dialog to an inline expander.

## Stylesheet Architecture

`styles.css` becomes a small import manifest. It contains only the ordered local
`@import` statements below, which must remain in this order. `index.html` keeps
loading only the versioned manifest stylesheet.

1. `styles/00-tokens.css`: root custom properties.
2. `styles/01-base.css`: reset, document defaults, typography, focus styles,
   layout shell, and section primitives.
3. `styles/02-ambient.css`: page ambient background and related keyframes.
4. `styles/03-header.css`: header, navigation, CTA, and menu controls.
5. `styles/04-components.css`: reusable buttons, chips, carousel controls,
   dots, and screen-reader-only utilities.
6. `styles/05-hero.css`: Hero layout, content, scene, and carousel rules only.
7. `styles/06-people.css`: the People Behind AXORA section only.
8. `styles/07-contact.css`: contact section only.
9. `styles/08-about.css`: About, values, and story carousel only.
10. `styles/09-why.css`: Why AXORA cards and all prop-scene geometry.
11. `styles/10-portfolio.css`: portfolio cards and previews only.
12. `styles/11-proof.css`: proof board and list only.
13. `styles/12-dialogs.css`: team and photo dialogs only.
14. `styles/13-footer.css`: footer only.
15. `styles/14-greeter.css`: scroll greeter only.
16. `styles/15-motion.css`: shared reveal and load motion only.
17. `styles/16-overrides.css`: existing media-query, coarse-pointer, and
    reduced-motion overrides, kept in their current source order.

The implementation copies rules without changing selectors or visual values in
the migration pass. It must not alphabetize or consolidate existing media
queries. Shared tokens, base selectors, button/chip controls, dialog primitives,
and global accessibility and motion rules stay shared. Section modules use their
own roots, such as `.hero` and `#team`; Hero-specific changes must not edit bare
element selectors, shared component selectors, or root tokens.

The static CSS test loader will resolve the manifest imports in order so existing
style-contract assertions continue to inspect the complete assembled stylesheet.

## People Behind AXORA Presentation

The existing four-card responsive grid becomes four open dimensional stages. A
stage is not a boxed card: it contains a tall temporary image silhouette, a rear
light plane, a shallow perspective layer, and an elliptical floor shadow. These
layers make the figure appear to stand in the section rather than sit inside a
rectangular container.

Each temporary figure uses an existing project image as an illustrative
placeholder, labeled `People 01`, `People 02`, `People 03`, or `People 04`.
The images are temporary and must be easy to replace with approved individual,
full-body portraits later. No asset gets an individual identity claim or
meaningful portrait alt text until that attribution is approved.

On fine-pointer hover and keyboard focus, the current lightweight card-lift
language becomes a small stage lift and a tighter floor shadow. Selection keeps
that static visual state while the dialog is open. Depth is supplied by shadows,
gradients, perspective, and bounded transform values, not continuous large
movement.

## Interaction and Accessibility

The existing native team dialog remains the single reveal mechanism. Selecting a
stage opens it with exactly:

- The selected placeholder name.
- One short placeholder description.

The dialog does not show roles, skills, role focus, or additional profile
metadata. It retains native dialog semantics, close control, Escape handling,
backdrop close, focus placement on open, and trigger focus restoration on close.
The description is referenced by `aria-describedby`, and the dialog heading
remains referenced by `aria-labelledby`.

Each stage remains a real button, starts disabled until JavaScript has validated
and initialized the dialog, retains `aria-haspopup="dialog"`, supports Enter and
Space, and has a visible keyboard focus state. Touch targets remain at least
44px. Image layers remain decorative while placeholders are in use.

## Responsive and Motion Behavior

- Desktop, 1024px and above: four dimensional stages in the current four-column
  grid, with restrained alternating depth offsets.
- Tablet, 768px through 1023px: two columns; stages scale within their own
  bounds without clipping or affecting neighboring content.
- Mobile, below 768px: one full-width vertical sequence with stable document
  order and no horizontal scrolling.
- Coarse pointers: no pointer-tracking tilt. Static depth remains visible.
- Reduced motion: no idle, hover, or dialog-adjacent decorative animation;
  transforms settle to a stable, fully visible composition.

## Implementation Sequence

1. Add all stylesheet modules by moving existing rule blocks unchanged and
   replace `styles.css` with the ordered import manifest.
2. Update CSS test loading to assemble the manifest before its existing style
   assertions run.
3. Verify modularization has no visual or behavioral change before altering the
   people section.
4. Replace the Team section heading and box-like card internals with four
   dimensional placeholder stages.
5. Reduce team data and dialog markup/controller behavior to name plus short
   description.
6. Add and update focused markup, controller, style-order, responsive, and
   reduced-motion tests.
7. Verify desktop, tablet, mobile, coarse-pointer, keyboard, Escape, backdrop,
   focus-restoration, and reduced-motion behavior.

## Acceptance Criteria

- `styles.css` is an ordered manifest and Hero rules live only in
  `styles/05-hero.css`.
- Existing sections retain their current computed behavior after the style move.
- The section heading reads exactly "People Behind AXORA".
- Four temporary, dimensional image stages are visible without box-like card
  framing and are labeled `People 01` through `People 04`.
- No role text appears in the people stages or their dialog.
- Selecting a stage exposes only its placeholder name and short description in
  the existing accessible dialog.
- Keyboard, pointer, coarse-pointer, reduced-motion, and responsive behavior
  continue to meet the stated contract.
- Repository-native static tests, syntax checks, and visual viewport checks pass.
