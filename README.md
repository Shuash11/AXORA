# AXORA Landing Page

A complete, dependency-free AXORA landing page with Home, Services, a four-person Team showcase, and Contact. It uses CSS 3D presentation and native JavaScript enhancements while remaining usable as a direct `index.html` file and with reduced motion enabled.

## Before launch

Replace every draft placeholder before publishing:

- `Team Member 01`, `Team Member 02`, `Team Member 03`, and `Team Member 04`
- Every `Role / specialty` label
- The placeholder biography, achievements, and projects in `script.js`
- `your-email@example.com` in `index.html`

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
