<!--
Sync Impact Report
- Version change: 0.0.0 -> 1.0.0
- Modified principles:
  - Principle 1 -> I. Privacy-First, Local-Only Operation
  - Principle 2 -> II. Cross-Browser Compatibility via Multi-Target Builds
  - Principle 3 -> III. Deterministic Domain Matching and Safe Closures
  - Principle 4 -> IV. Test-and-Verify as a Release Gate
  - Principle 5 -> V. Minimal Dependencies and Cohesive TypeScript
- Added sections:
  - Operational Constraints
  - Workflow and Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ updated: README.md
  - ⚠ pending: .specify/templates/commands/*.md (directory not present)
- Deferred TODOs:
  - None
-->

# Multi Closer Constitution

## Core Principles

### I. Privacy-First, Local-Only Operation

The extension MUST process tab and host data only as needed to perform the
requested close action. It MUST NOT send data off-device, MUST NOT persist
browsing data, and MUST NOT add telemetry or analytics. New features MUST
justify every permission, and permission scope MUST remain minimal.

Rationale: trust and privacy are core product promises and non-negotiable.

### II. Cross-Browser Compatibility via Multi-Target Builds

The project MUST maintain one shared source codebase with browser-targeted
build outputs. Chrome and Chromium-compatible targets MUST use MV3 output,
and Firefox-compatible targets MUST use a Firefox-installable output.
Cross-browser support claims MUST be backed by explicit build artifacts and
installation verification steps.

Rationale: browser manifest/runtime differences exist and require distinct
packaging while preserving shared behavior.

### III. Deterministic Domain Matching and Safe Closures

Domain matching behavior MUST remain deterministic and conservative: match only
the selected host and its subdomains; NEVER match parent domains. Invalid or
non-http(s) URLs MUST be no-ops. Any change to matching or closure behavior
MUST include explicit tests for same-host, subdomain, parent-domain exclusion,
and non-http(s) cases.

Rationale: incorrect tab closure is user-impacting and difficult to reverse.

### IV. Test-and-Verify as a Release Gate

Every functional change MUST follow TDD intent: add or update tests that fail
for the target behavior before final implementation is considered complete.
Before review or release, the full local verification gate MUST pass when
available (`npm run verify`). CI parity checks (format, lint, typecheck, unit
tests, E2E where present, and security checks) MUST remain green.

Rationale: fast iteration is only safe when behavior is continuously validated.

### V. Minimal Dependencies and Cohesive TypeScript

Implementation MUST prefer WebExtension APIs and standard library capabilities
before adding dependencies. TypeScript code MUST avoid `any` in production
paths, keep modules cohesive, and use explicit helper boundaries for browser
API interactions and host logic.

Rationale: minimal dependency surface improves security, portability, and long
term maintenance.

## Operational Constraints

- Runtime targets MUST support Chrome, Firefox, and Edge on desktop; mobile is
  best-effort and MUST provide a fallback action path when native tab menus are
  unavailable.
- Menu behavior MUST preserve product UX text: `Close all tabs from <domain>`.
- Packaging and publishing MUST be performed by GitHub Actions; local packaging
  may be used for developer testing only and MUST NOT replace release workflow.
- Release artifacts MUST clearly identify target compatibility.

## Workflow and Quality Gates

- Work MUST be performed on feature or fix branches; direct work on `main` is
  prohibited.
- Pull requests MUST document behavior changes, test evidence, and any browser-
  specific compatibility implications.
- Any required MAJOR semver bump for product releases MUST be explicitly
  confirmed by maintainers before proceeding.
- Changes that affect permissions, matching logic, or tab-closing behavior MUST
  receive focused review.

## Governance

This constitution supersedes informal practices for this repository. Amendments
MUST be documented in this file, include a semantic version update, and include
a Sync Impact Report describing dependent template and documentation updates.

Amendment versioning policy:

- MAJOR: remove or redefine a core principle in a backward-incompatible way.
- MINOR: add a new principle/section or materially expand required behavior.
- PATCH: clarify wording, fix ambiguity, or make non-semantic edits.

Compliance review policy:

- Every implementation plan MUST pass the Constitution Check before research and
  again after design.
- Every specification and task list MUST map to applicable principles and gates.
- Runtime guidance sources (`AGENTS.md`, `README.md`, and CI workflows) SHOULD
  remain aligned with this constitution; drift MUST be corrected in the same
  change when practical.

**Version**: 1.0.0 | **Ratified**: 2026-03-08 | **Last Amended**: 2026-03-08
