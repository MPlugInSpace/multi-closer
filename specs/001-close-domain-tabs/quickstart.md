# Quickstart: Cross-Browser Domain Tab Close

## 1) Install dependencies

```bash
npm ci
```

## 2) Build artifacts

```bash
npm run build
```

Expected outputs:

- `dist/` (Chromium-compatible install target)
- `dist-firefox/` (Firefox-compatible install target)

## 3) Run validation suite

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Optional full gate (includes E2E and security checks):

```bash
npm run verify
```

## 4) Local browser verification

### Chrome/Chromium

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Load unpacked extension from `dist/`
4. Open multiple tabs across domains and verify the action closes only same-host
   and subdomain tabs

### Firefox (desktop)

1. Open `about:debugging#/runtime/this-firefox`
2. Load temporary add-on from `dist-firefox/manifest.json`
3. Verify domain-scoped close behavior and no-op handling on unsupported URLs

## 5) Expected behavior checklist

- Menu label uses current host: `Close all tabs from <domain>`.
- Parent-domain tabs are never closed when initiated from subdomain tabs.
- Non-http(s) tabs are ignored.
- No telemetry/network transfer or data persistence is introduced.
