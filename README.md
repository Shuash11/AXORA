# AXORA Landing Page

A complete, dependency-free AXORA landing page with Home, Services, a four-person Team showcase, and Contact. It uses CSS 3D presentation and native JavaScript enhancements while remaining usable as a direct `index.html` file and with reduced motion enabled.

## Before launch

Replace every draft placeholder before publishing:

- `Team Member 01`, `Team Member 02`, `Team Member 03`, and `Team Member 04`
- Every `Role / specialty` label
- The placeholder dialog biography, achievements, and projects
- `your-email@example.com`

Team names, roles, and dialog biography, achievements, and projects are deliberately duplicated for the static progressive fallback and JavaScript enhancement. Replace them together in the static visible Team cards and dialog fallback in `index.html`, the dynamic member names and dialog placeholder constants in `script.js`, and the locked expectations in `tests/hero-markup.test.mjs`. The contact email is in `index.html` and its expected string is in `tests/hero-markup.test.mjs`. Update every listed source together, then run `npm test` and `npm run verify:static`; there is no single source of truth for these draft values.

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
