# Project Lifecycle Reconciliation

## Conceptual model

The platform has three distinct operational units:

- **Project** — the operational container. Represents a client engagement. Its `status` reflects the overall state of the engagement, not the state of any single work unit.
- **Work Item** — a technical work unit owned by Development. Each belongs to a Project. Its `status` tracks granular progress from `backlog` through `done`.
- **Support Ticket** — a client/support unit owned by the Support team. May or may not be linked to a Project or Work Item.
- **Attention Item** — a derived, ephemeral inbox item. Never persisted. Computed on demand from the current state of Tickets and Work Items by `getAttentionItemsUseCase`.

These units interact, but they have distinct lifecycles. A Project's lifecycle is not managed directly by users — it is **reconciled** automatically whenever an operational change occurs.

---

## The Reconciler: single lifecycle authority

**`reconcileProjectLifecycleAfterOperationalChange`** is the only function that may auto-advance or reopen a Project's `status`. No other function, action, or use case may modify project `status` as a side effect of a work item or support ticket change.

It accepts a `reason` value that describes what triggered the reconciliation, and applies a fixed rule set to determine whether the project status should change.

### Reasons

| Reason | Triggered by |
|---|---|
| `new_work_item` | A Work Item was created for the project |
| `work_item_status_changed` | A Work Item's status changed |
| `support_ticket_escalated` | A Support Ticket was escalated, creating a linked Work Item |
| `support_ticket_resolved` | A Support Ticket was resolved |
| `support_ticket_closed` | A Support Ticket was closed |
| `support_ticket_cancelled` | A Support Ticket was cancelled |
| `support_intervention` | Development requested a support intervention via a Work Item |

---

## Rules applied (in order)

### Reopen rule
**Condition:** reason is a rework reason (`new_work_item`, `support_ticket_escalated`, `support_intervention`) AND current project status is rework-eligible (`planning`, `testing`, `deployed`, `maintenance`)

**Effect:** sets candidate status to `in_development`

This ensures that new active work reopens a project that had reached a later phase.

### Rule 1 — planning → in_development
**Condition:** candidate status is `planning` AND at least one Work Item has status `in_progress`

**Effect:** advances to `in_development`, initializes `startDate`

### Rule 2 — → testing
**Condition:** candidate status is `planning` or `in_development` AND at least one Work Item has status `testing`

**Effect:** advances to `testing`

### Rule 3 — in_development → testing (Bug 1 fix)
**Condition:** candidate status is `in_development` AND no Work Items are open (open = `backlog`, `ready`, `in_progress`, `blocked`, `review`, `testing`, `awaiting_support`) AND at least one Work Item is `done`

**Effect:** advances to `testing`

This rule prevents the project from being stuck in `in_development` when all work is finished but no WI was in `testing` status at the time of the last reconcile.

---

## Protected statuses — never auto-mutated

Projects with status `paused`, `cancelled`, or `discovery` are **never touched** by the reconciler. A project must be manually managed to exit these states.

---

## Attention: derived, not persisted

Attention Items are computed on demand from live Ticket and Work Item data. The Attention inbox has no database table.

This means:
- When a Ticket is resolved/closed/cancelled (terminal), it disappears from Attention immediately at next load — no cleanup needed.
- When a Work Item is marked `done` and the linked Ticket is awaiting validation, the Attention inbox shows a `support_validation_pending` item automatically.
- A `backlog` Work Item does **not** appear in Attention as a standalone item — the repository's `findAttentionCandidates()` only fetches Work Items with active statuses (`ready`, `in_progress`, `blocked`, `review`, `testing`, `awaiting_support`). However, if a Ticket references a `backlog` Work Item, the repository fetches it via a secondary query, and the use case will generate attention items for the pair.

---

## Terminal tickets cannot generate work

A Support Ticket with status `resolved`, `closed`, or `cancelled` cannot be escalated to development. This is enforced at two layers:

1. **Action layer** (`escalateSupportTicketAction`): fast-fails before creating a Work Item, preventing orphaned Work Items.
2. **Use case layer** (`escalateSupportTicketUseCase`): guard in the domain logic, independently testable.

`TERMINAL_TICKET_STATUSES` is the canonical constant for this set, defined in `support-ticket.types.ts`.

---

## Key files

| File | Role |
|---|---|
| `src/features/projects/application/reconcile-project-lifecycle.use-case.ts` | Single lifecycle authority |
| `src/features/projects/application/reconcile-project-lifecycle.use-case.test.ts` | 29 unit tests for all rules |
| `src/features/projects/application/project-lifecycle-workflow.test.ts` | Multi-step workflow chain tests |
| `src/features/operations/application/get-attention-items.use-case.ts` | Attention derivation |
| `src/features/support/application/escalate-support-ticket.use-case.ts` | Terminal ticket guard (use case layer) |
| `src/server/actions/admin-support-ticket.action.ts` | Terminal ticket guard (action layer) |
| `src/features/support/domain/support-ticket.types.ts` | `TERMINAL_TICKET_STATUSES` canonical constant |
