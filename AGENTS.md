# AGENTS

This repository is a cross-browser WebExtension project. These guidelines are for agentic tools working in this repo. Keep changes minimal, understandable, and privacy-preserving.

## Project Summary

- Extension name: Multi Close
- Purpose: add a tab menu item to close all tabs from the same domain/subdomain scope
- Target browsers: Chrome, Firefox, Edge (desktop and mobile best effort)
- Manifest: MV3 where possible, minimal dependencies

## Commands

If scripts exist, use them. Otherwise, default to the commands below when they are added.

Build

- `npm run build`

Lint

- `npm run lint`

Format

- `npm run format`
- `npm run format:check`

Test

- `npm test`

E2E (if present)

- `npm run e2e`

Verify (full local gate)

- `npm run verify`

Single test

- `npm test -- <pattern>`
- `npm run test -- <pattern>`

Typecheck (if TypeScript)

- `npm run typecheck`

Package extension

- Do not package locally. Packaging and publishing must be done by GitHub Actions.
- Builds must be published from GitHub Actions to GitHub Packages.

## Code Style

### General

- Prefer TypeScript for background and UI code.
- Keep dependencies to a minimum; prefer WebExtension APIs and standard library.
- Write small, pure helpers for URL and host logic.
- Avoid runtime side effects in module scope; initialize in explicit entry points.
- Keep files small and cohesive.

### Imports

- Use ES module syntax.
- Group imports: external, internal, then relative.
- Prefer named imports; avoid default exports unless required by tooling.

### Formatting

- Use Prettier defaults with 2-space indentation.
- Use single quotes in JS/TS unless JSON or tooling requires double.
- Keep lines <= 100 chars where possible.

### Types

- Prefer explicit types on public functions and module exports.
- Avoid `any`; use `unknown` and narrow.
- Use discriminated unions for status/result objects.

### Naming

- Functions: `camelCase` verbs (e.g., `closeMatchingTabs`).
- Types/interfaces: `PascalCase` nouns.
- Constants: `UPPER_SNAKE_CASE` for true constants, otherwise `camelCase`.
- Files: `kebab-case`.

### Error Handling

- Treat invalid URLs or non-http(s) tabs as no-ops.
- Do not surface errors to users unless a UI is present.
- Log only when it helps debugging; do not log URLs in production unless needed.

### Privacy

- Do not store browsing data.
- Do not send any data off-device.
- Only read tab data needed for the action.

## Domain Matching Rules

- Use the selected tab host as the match root.
- Match same host or subdomains only.
- Never close parent domain tabs when the selected tab is a subdomain.

## UX

- Menu label: `Close all tabs from <domain>`.
- Desktop: tab context menu item.
- Mobile: best-effort tab selection menu; if unavailable, use a toolbar popup.

## TODO / Future Considerations

- Pinned tab handling.
- Current tab handling.
- Incognito behavior.
- Optional confirmation dialog.

## SemVer Policy

- Agents decide the semantic version bump for each change.
- If a major bump is required, prompt the user for confirmation before proceeding.
- If the user declines a major bump, create a GitHub issue tagged with a label
  indicating the required major version (e.g., `major-v2`) and summarize the
  blocked change in that issue.

## CI/CD Expectations

- Lint, format check, typecheck, tests, E2E (if present), and security scans must pass in CI.
- Before review or commit, ensure all of the above pass locally (when available).
- Dependabot must be configured for npm.
- `feature/*` branches publish prereleases with the branch name as prerelease
  component (e.g., `1.2.0-feature-foo.1`).
- `main` publishes release builds without prerelease identifiers.

## Repo Rules

- No Cursor or Copilot rules detected. If added later, incorporate them here.
- Keep AGENTS.md around 150 lines; update when workflows change.
