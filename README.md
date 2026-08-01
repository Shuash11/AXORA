# AXORA Landing Page

A complete, dependency-free AXORA landing page with Home, About, Services, Why AXORA, Portfolio, Team, Testimonials, and Contact. It uses CSS 3D presentation and native JavaScript enhancements while remaining usable as a direct `index.html` file and with reduced motion enabled.

## Before launch

Replace every draft placeholder before publishing:

**Member profiles** — replace `Team Member 01` through `Team Member 04`, role labels, dialog bio, skills, and focus areas. Update in `index.html`, `script.js`, and `tests/hero-markup.test.mjs`.

**Photos** — supply five hero event photos and four team member portraits (Members 02–04 need portraits; Member 01 already has one). Remove the placeholder device cards (`TM-02`, `TM-03`, `TM-04`) and swap in real images.

**Contact** — replace `your-email@example.com` in `index.html` and its expected string in `tests/hero-markup.test.mjs`.

**Portfolio** — replace the "Selected work is being prepared for publication" placeholders with real project screenshots and descriptions as work is approved for publication.

**Testimonials** — replace the honest pre-launch cards with verified client feedback as reviews are approved.

**Social profiles** — add official social destinations once available. The social section currently shows a pre-launch notice.

**Legal** — supply final Privacy Policy text. Terms of Service is optional and will not be a dead link.

Do not add social or contact claims until real destinations and details are available.

## Local preview

```bash
python -m http.server 4173 --directory .
```

Open http://127.0.0.1:4173/. Direct-file preview with `index.html` is also supported.

## Checks

No install is required: the checks use Node built-ins.

```bash
npm test
npm run verify:static
```
