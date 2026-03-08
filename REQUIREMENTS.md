# Multi Close Requirements

## Overview

Multi Close is a cross-browser WebExtension for Chrome, Firefox, and Edge that adds a menu option to close all tabs from the same domain as a selected tab. It is designed for general users and should be minimal, privacy-preserving, and fast.

## Goals

- Add a menu item labeled `Close all tabs from <domain>` for a selected tab.
- Close all tabs whose host matches the selected tab's host or its subdomains.
- Keep the extension lightweight with minimal dependencies.
- Work across desktop and mobile browsers, with best-effort mobile UI support.

## Non-Goals

- No telemetry, analytics, or external network calls.
- No persistent storage or sync.
- No configuration UI in v1 (beyond default menu entry).

## UX Entry Points

- Desktop: tab context menu entry for the selected tab.
- Mobile: tab selection menu entry when supported (best effort).
- Fallback: toolbar popup offering the same action for the active tab.

## Behavior

- Menu label is `Close all tabs from <domain>`.
- `<domain>` is the selected tab's host (including subdomain).
- Close all tabs whose host is exactly the selected host or a subdomain of it.
- Do not close parent domain tabs when the selected tab is a subdomain.
- Close all matching tabs in all windows (current or other).

## Domain Matching Rules

- Use the URL host of the selected tab as the match root.
- A matching tab host is:
  - exactly the same host, or
  - ends with `.` + selected host.
- Examples:
  - Selected: `docs.example.com`
    - Match: `docs.example.com`, `a.docs.example.com`
    - Do not match: `example.com`, `blog.example.com`

## Edge Cases

- Non-http(s) URLs are ignored (no action, no error surfaced to user).
- Internal browser pages are ignored (no action).

## Permissions

- `tabs` and `contextMenus` are required.
- No optional permissions in v1.

## Privacy

- Collect only data necessary to identify matching tabs.
- Do not persist any data.
- Never send data off-device.

## Build and Release Requirements

- GitHub Actions for lint, format check, tests, and security scans.
- Dependabot enabled for npm dependencies.
- Feature branch prereleases for `feature/*` with SemVer prerelease component.
- `main` builds produce release versions without prerelease component.
- Automatic version bumping required; semver level chosen by agents.
- Packaging artifacts must include Chromium (`dist/`) and Firefox-compatible
  (`dist-firefox/`) install targets for local validation.

## Future Considerations (tracked in TODO.md)

- Pinned tab handling.
- Current tab handling.
- Incognito behavior.
- Optional confirmation before closing tabs.
