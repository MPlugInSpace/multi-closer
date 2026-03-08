---
description: 'Task list for implementing cross-browser domain tab close'
---

# Tasks: Cross-Browser Domain Tab Close

**Input**: Design documents from `/home/gabe/projects/mutli-close/specs/001-close-domain-tabs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required for behavior changes in this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3)
- All tasks include explicit repository file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align build/test scaffolding for the feature branch.

- [ ] T001 Verify and document feature artifact layout in specs/001-close-domain-tabs/quickstart.md
- [ ] T002 Align build output expectations for dist and dist-firefox in build.mjs
- [ ] T003 [P] Ensure repository ignore rules cover local artifact download dirs in .gitignore
- [ ] T004 [P] Add/refresh spec-task traceability notes in specs/001-close-domain-tabs/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared behavior foundations required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Implement host parsing and validation hardening in src/shared/domain.ts
- [ ] T006 Implement safe tab query/filter primitives for closure inputs in src/shared/close-tabs.ts
- [ ] T007 Implement context menu create/update resilience baseline in src/background.ts
- [ ] T008 [P] Add foundational unit coverage for host matching invariants in tests/domain.test.ts
- [ ] T009 [P] Add foundational unit coverage for close filtering invariants in tests/close-tabs.test.ts
- [ ] T010 Add artifact installability baseline assertions for both targets in tests/installability.test.ts

**Checkpoint**: Foundation supports deterministic matching, safe no-op behavior, and dual-target install checks.

---

## Phase 3: User Story 1 - Close Matching Tabs from Menu (Priority: P1) 🎯 MVP

**Goal**: User can close same-host and subdomain tabs from initiating tab context.

**Independent Test**: With mixed-domain tabs open, invoking close from an example.com tab closes only example.com scope tabs and leaves others untouched.

### Tests for User Story 1

- [ ] T011 [P] [US1] Add same-host closure scenario coverage in tests/close-tabs.test.ts
- [ ] T012 [P] [US1] Add subdomain closure and parent-domain exclusion coverage in tests/close-tabs.test.ts
- [ ] T013 [US1] Add menu label host rendering behavior test coverage in tests/domain.test.ts

### Implementation for User Story 1

- [ ] T014 [P] [US1] Implement menu title derivation from initiating tab host in src/background.ts
- [ ] T015 [US1] Implement click handler flow from initiating tab to closeMatchingTabs in src/background.ts
- [ ] T016 [US1] Implement strict same-host/subdomain-only closure predicate integration in src/shared/close-tabs.ts
- [ ] T017 [US1] Implement parent-domain exclusion guard in src/shared/domain.ts
- [ ] T018 [US1] Wire tab/window event-driven menu title sync behavior in src/background.ts

**Checkpoint**: US1 is independently functional and testable as MVP.

---

## Phase 4: User Story 2 - Cross-Browser Desktop and Mobile Access (Priority: P2)

**Goal**: Action is accessible across supported desktop targets and fallback path exists for constrained/mobile contexts.

**Independent Test**: Desktop install exposes actionable menu path; constrained context still exposes fallback trigger path.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add installability assertions for Chromium and Firefox manifests in tests/installability.test.ts
- [ ] T020 [P] [US2] Add E2E coverage for close action invocation path in e2e/tests/close-tabs.mjs

### Implementation for User Story 2

- [ ] T021 [US2] Ensure Chromium-compatible action/menu contexts are defined correctly in src/background.ts
- [ ] T022 [US2] Ensure fallback action flow for constrained contexts via popup messaging in src/popup/popup.ts
- [ ] T023 [US2] Ensure Firefox-compatible build output generation and manifest transformation in build.mjs
- [ ] T024 [US2] Ensure package workflow includes both dist and dist-firefox outputs in .github/workflows/package.yml
- [ ] T025 [US2] Update local verification instructions for both browser paths in README.md

**Checkpoint**: US1 and US2 are independently testable with dual-target install validation.

---

## Phase 5: User Story 3 - Safe, Private, and Predictable Behavior (Priority: P3)

**Goal**: Behavior remains local-only, no-storage, and robust against unsupported inputs.

**Independent Test**: Non-http(s) initiators and unsupported tabs no-op safely; no persistent/off-device data behavior is introduced.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add non-http(s) initiating tab no-op coverage in tests/close-tabs.test.ts
- [ ] T027 [P] [US3] Add invalid URL and missing-tab edge-case coverage in tests/domain.test.ts
- [ ] T028 [US3] Add privacy/behavior contract assertions for local-only processing in tests/installability.test.ts

### Implementation for User Story 3

- [ ] T029 [US3] Enforce non-http(s) and invalid URL no-op handling in src/background.ts
- [ ] T030 [US3] Enforce no-persist/no-telemetry behavior documentation in specs/001-close-domain-tabs/contracts/extension-behavior.md
- [ ] T031 [US3] Validate message handling origin and safe response semantics in src/background.ts

**Checkpoint**: All user stories are independently functional and safety constraints are enforced.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, validation, and release readiness.

- [ ] T032 [P] Run full verification gate and resolve failures via npm scripts in package.json
- [ ] T033 [P] Validate quickstart flow against actual outputs in specs/001-close-domain-tabs/quickstart.md
- [ ] T034 Reconcile feature documentation and requirements language in REQUIREMENTS.md
- [ ] T035 Reconcile agent guidance updates for this feature in AGENTS.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) must complete first.
- Foundational (Phase 2) blocks all user stories.
- User Story phases proceed in priority order: US1 (P1) -> US2 (P2) -> US3 (P3).
- Polish (Phase 6) depends on completion of desired user stories.

### User Story Dependencies

- **US1**: Depends on Phase 2 only; provides MVP.
- **US2**: Depends on Phase 2 and integrates with US1 action behavior.
- **US3**: Depends on Phase 2 and validates safety/privacy behavior across US1/US2 flows.

### Within Each User Story

- Write tests first, confirm failure intent, then implement.
- Implement core behavior before integration and documentation updates.
- Complete story checkpoint before advancing priority.

---

## Parallel Execution Examples

### User Story 1

```bash
# Run in parallel:
Task: "T011 [US1] same-host closure test in tests/close-tabs.test.ts"
Task: "T012 [US1] subdomain/parent exclusion test in tests/close-tabs.test.ts"
Task: "T014 [US1] menu title derivation in src/background.ts"
```

### User Story 2

```bash
# Run in parallel:
Task: "T019 [US2] installability assertions in tests/installability.test.ts"
Task: "T020 [US2] E2E invocation coverage in e2e/tests/close-tabs.mjs"
Task: "T025 [US2] browser verification docs in README.md"
```

### User Story 3

```bash
# Run in parallel:
Task: "T026 [US3] non-http(s) no-op test in tests/close-tabs.test.ts"
Task: "T027 [US3] invalid URL edge tests in tests/domain.test.ts"
Task: "T030 [US3] privacy contract reinforcement in specs/001-close-domain-tabs/contracts/extension-behavior.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate US1 independently before expanding scope

### Incremental Delivery

1. Deliver US1 (MVP)
2. Add US2 for cross-browser access parity
3. Add US3 for safety/privacy hardening
4. Run Phase 6 polish and full verification

### Parallel Team Strategy

1. Team aligns on Setup + Foundational tasks
2. Then parallelize by story-aligned test/implementation tasks where marked [P]
3. Merge story increments in priority order with checkpoint validation
