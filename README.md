# Multi Closer

Close all tabs from the same domain as a selected tab.

## What it does

- Adds a menu item labeled `Close all tabs from <domain>` to tab menus.
- Closes tabs whose host matches the selected tab's host or its subdomains.
- Best-effort support on mobile; falls back to a toolbar popup.

## Privacy

- No telemetry or analytics.
- No storage.
- No data is sent off-device.

## Development

Constitution and governance guidance lives in
`.specify/memory/constitution.md`. Any feature/spec/plan/tasks output should
align with its privacy, cross-browser, and verification gates.

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

Build output includes:

- `dist/` for Chromium-family browsers (Chrome/Edge)
- `dist-firefox/` for Firefox temporary install compatibility

Run tests:

```bash
npm test
```

Run E2E tests (Chromium):

```bash
npm run e2e
```

E2E uses a local server and host resolver rules to avoid external network access.
E2E runs a headful Chromium instance; use Xvfb on CI or headless servers.

Run full verification (format, lint, typecheck, unit, E2E, audit, version check):

```bash
npm run verify
```

Regenerate icons:

```bash
npm run icons
```

## TODO

See `TODO.md`.
