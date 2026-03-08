# Contract: Extension Behavior and User-Facing Interfaces

## 1. User-Facing Action Contract

- Label format: `Close all tabs from <domain>`
- Domain source: initiating tab host.
- Availability:
  - Desktop: available through browser-supported extension/tab menu surfaces.
  - Mobile: best-effort menu placement; fallback action path required.

## 2. Domain Match Contract

- Input: initiating tab URL host as `rootHost`.
- Eligible target hosts:
  - exact match: `candidateHost == rootHost`
  - subdomain match: `candidateHost` ends with `.` + `rootHost`
- Ineligible hosts:
  - parent domains of `rootHost`
  - unrelated domains
  - invalid or non-http(s) URLs

## 3. Action Execution Contract

- Evaluation scope: all open tabs in all browser windows.
- Result behavior:
  - close all eligible tabs in a single invocation.
  - if no valid initiating host exists, perform no-op without user-facing error.
  - if no matches exist, perform no-op.

## 4. Privacy and Data Handling Contract

- All processing is local to the browser runtime.
- No browsing data persistence beyond transient runtime state.
- No off-device data transfer.

## 5. Build/Installability Contract

- Chromium-family installable artifact MUST be produced.
- Firefox-installable artifact MUST be produced.
- Verification MUST include tests that assert artifact installability metadata.
