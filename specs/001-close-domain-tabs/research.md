# Research: Cross-Browser Domain Tab Close

## Decision 1: Keep one codebase with multi-target build artifacts

- Decision: Continue a single shared source with browser-targeted outputs
  (`dist/` for Chromium-compatible installs, `dist-firefox/` for
  Firefox-compatible installs).
- Rationale: Browser manifest/runtime constraints differ, but core behavior can
  remain shared. This preserves maintainability and satisfies constitution
  cross-browser gate requirements.
- Alternatives considered:
  - Single universal artifact for all browsers: rejected due to incompatible
    manifest/background models across target browsers.
  - Fully separate browser-specific repos: rejected due to duplication and drift.

## Decision 2: Preserve deterministic host matching rules as the contract baseline

- Decision: Define host matching as exact host plus subdomains, explicitly
  excluding parent domains; non-http(s) URLs are no-op.
- Rationale: Prevents accidental closure beyond user intent and aligns with
  existing requirements and safety principles.
- Alternatives considered:
  - eTLD+1 matching (close all sibling subdomains): rejected because it can
    close unrelated organizational areas.
  - Regex/custom scopes: rejected for complexity and elevated error risk.

## Decision 3: Use existing test stack and add installability checks as first-class validation

- Decision: Keep Vitest for unit/installability tests and Playwright-based E2E
  for Chromium behavior; validate Firefox installability via artifact structure
  and manifest checks.
- Rationale: Existing test tools are already integrated and fast to run. This
  provides coverage for behavior correctness and cross-browser packaging
  readiness without introducing new toolchain complexity.
- Alternatives considered:
  - Introduce a second E2E framework for Firefox/mobile immediately: rejected as
    unnecessary for first planning iteration; can be added later if needed.
  - Manual-only browser validation: rejected as insufficiently repeatable.

## Decision 4: Keep permissions and privacy posture unchanged

- Decision: Do not add permissions or storage/network capabilities.
- Rationale: Feature does not require additional privilege and constitution
  requires minimal scope and local-only processing.
- Alternatives considered:
  - Add storage for recent domains: rejected (not required for requested value,
    introduces retention risk).
  - Add telemetry for usage: rejected by privacy constraints.

## Decision 5: Mobile support as best-effort with fallback entry point

- Decision: Maintain mobile best-effort UI support and require a fallback action
  path where tab menu placement is unavailable.
- Rationale: Browser mobile UI surfaces vary; fallback preserves usable
  behavior and satisfies feature scope.
- Alternatives considered:
  - Require native tab menu support on every mobile browser: rejected as
    infeasible due to platform differences.
  - Skip mobile support entirely: rejected against feature goal.
