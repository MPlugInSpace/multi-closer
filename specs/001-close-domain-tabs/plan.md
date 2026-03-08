# Implementation Plan: Cross-Browser Domain Tab Close

**Branch**: `001-close-domain-tabs` | **Date**: 2026-03-08 | **Spec**: `/home/gabe/projects/mutli-close/specs/001-close-domain-tabs/spec.md`
**Input**: Feature specification from `/specs/001-close-domain-tabs/spec.md`

## Summary

Deliver a privacy-preserving browser extension behavior that adds a domain-scoped
tab-closing action usable across supported desktop browsers and mobile best-effort
entry points, while preserving deterministic host matching and cross-browser
installability validation.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js >=20 for tooling)  
**Primary Dependencies**: WebExtension APIs, esbuild, Vitest, Playwright  
**Storage**: N/A (no persistent user/browsing data)  
**Testing**: Vitest unit tests, installability tests, Playwright E2E (Chromium),
Firefox installability artifact checks  
**Target Platform**: Chrome, Edge, Firefox desktop; mobile browsers best-effort  
**Project Type**: Browser extension (single project with multi-target build outputs)  
**Performance Goals**: Close operation completes within 1 second for up to 200
open tabs on reference desktop environments  
**Constraints**: No telemetry, no off-device transfer, no persistent browsing
data, minimal permissions, deterministic domain matching  
**Scale/Scope**: Single extension package source with two target build outputs
(Chromium-compatible and Firefox-compatible)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Privacy gate: PASS - feature requires local tab/host processing only; no storage
  and no network egress are maintained.
- Permissions gate: PASS - only `tabs`, `contextMenus`, and required runtime
  permissions are retained; no expansion proposed.
- Cross-browser gate: PASS - plan includes explicit Chromium and Firefox build
  outputs with installability validation.
- Matching safety gate: PASS - matching remains same-host plus subdomains, with
  explicit parent-domain exclusion.
- Verification gate: PASS - plan includes unit, E2E, installability tests and
  full `npm run verify` for completion.
- Dependency gate: PASS - no new runtime dependencies required; keep standard
  WebExtension APIs and existing toolchain.

## Project Structure

### Documentation (this feature)

```text
specs/001-close-domain-tabs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── extension-behavior.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── background.ts
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.ts
├── shared/
│   ├── chrome-async.ts
│   ├── close-tabs.ts
│   └── domain.ts
└── test/
   ├── runner.html
   └── runner.ts

tests/
├── domain.test.ts
├── close-tabs.test.ts
└── installability.test.ts

e2e/
├── runner.mjs
└── tests/
   └── close-tabs.mjs

build.mjs
```

**Structure Decision**: Use the existing single-project extension structure,
with multi-target build outputs (`dist/` for Chromium-compatible output and
`dist-firefox/` for Firefox-compatible output).

## Phase 0: Research Outcomes

All technical context unknowns are resolved. See
`/home/gabe/projects/mutli-close/specs/001-close-domain-tabs/research.md` for
decision records and alternatives.

## Phase 1: Design Outcomes

- Data model documented in
  `/home/gabe/projects/mutli-close/specs/001-close-domain-tabs/data-model.md`.
- Behavior contract documented in
  `/home/gabe/projects/mutli-close/specs/001-close-domain-tabs/contracts/extension-behavior.md`.
- Validation workflow documented in
  `/home/gabe/projects/mutli-close/specs/001-close-domain-tabs/quickstart.md`.

## Constitution Check (Post-Design)

- Privacy gate: PASS - data model defines only ephemeral runtime entities.
- Permissions gate: PASS - no additional permissions required by design.
- Cross-browser gate: PASS - design explicitly includes multi-target artifact
  and install verification for Chromium-family and Firefox.
- Matching safety gate: PASS - contract requires same-host/subdomain-only logic,
  parent-domain exclusion, and non-http(s) no-op behavior.
- Verification gate: PASS - quickstart requires relevant tests and verify gate.
- Dependency gate: PASS - design reuses existing stack without new runtime deps.

## Complexity Tracking

No constitution violations require justification in this plan.
