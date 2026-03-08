# Data Model: Cross-Browser Domain Tab Close

## Entity: InitiatingTabContext

- Description: Runtime context for the tab from which the action is invoked.
- Fields:
  - `tabId` (number, required)
  - `windowId` (number, required)
  - `url` (string, required for processing)
  - `host` (string | null, derived)
- Validation rules:
  - `url` must parse as http(s) to produce a non-null `host`.
  - Non-http(s) inputs produce `host = null` and action no-op.

## Entity: HostMatchScope

- Description: Derived scope that determines eligible tabs for closure.
- Fields:
  - `rootHost` (string, required)
  - `matchMode` (enum: `exact-or-subdomain`)
- Validation rules:
  - `rootHost` must be a valid host token.
  - Matching predicate: candidate host equals `rootHost` OR ends with
    `.` + `rootHost`.
  - Parent domains MUST NOT match.

## Entity: CandidateTab

- Description: Open tab evaluated for closure eligibility.
- Fields:
  - `tabId` (number, required)
  - `windowId` (number, required)
  - `url` (string | undefined)
  - `host` (string | null, derived)
  - `isClosable` (boolean, derived)
- Validation rules:
  - Tabs without numeric `tabId` are excluded.
  - Tabs with non-http(s) URLs are excluded.

## Entity: CloseActionResult

- Description: Result of a single invocation.
- Fields:
  - `rootHost` (string)
  - `evaluatedTabs` (number)
  - `closedTabIds` (number[])
  - `closedCount` (number)
  - `reason` (enum: `ok` | `no-valid-host` | `no-matches`)
- Validation rules:
  - `closedCount` equals `closedTabIds.length`.
  - `reason = no-valid-host` requires `closedCount = 0`.

## Relationships

- `InitiatingTabContext.host` derives `HostMatchScope.rootHost` when valid.
- `HostMatchScope` is used to evaluate each `CandidateTab`.
- Eligible `CandidateTab.tabId` values populate `CloseActionResult.closedTabIds`.

## State Transitions

1. `invoked` -> action called with `InitiatingTabContext`.
2. `scope-derived` -> derive `HostMatchScope` or terminate with `no-valid-host`.
3. `tabs-evaluated` -> evaluate all open tabs into candidate closable set.
4. `closed` -> close eligible tabs and return `CloseActionResult`.
