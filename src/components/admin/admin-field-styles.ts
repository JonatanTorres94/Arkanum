// Shared interaction language for the narrow (~320px) admin sidebar forms
// flagged in issue #63: LeadFollowUpForm, LeadIntentFieldsForm,
// LeadConversionPanel, SupportTicketStatusForm, and the project repository/
// environment/work-item forms. Centralized here so focus/shadow/transition
// treatment stays consistent instead of drifting per-file.
//
// - min-w-0 lets the control shrink inside a grid cell instead of forcing
//   the cell (and the card) wider — the root cause of the cramped feeling.
// - focus:ring-2 is the "shadow" emphasis the issue asked for, layered on
//   top of the existing border-color change.
// - motion-reduce:transition-none respects prefers-reduced-motion.
export const adminFieldClass =
  "w-full min-w-0 rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-[border-color,box-shadow] duration-150 ease-out focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25 disabled:opacity-50 motion-reduce:transition-none";

// Applied to a field's wrapping <div> inside a multi-column grid. While any
// control inside it has focus, the field claims the full row width (Option B
// from the issue) instead of staying squeezed into its half/third column —
// a discrete grid-column change, not an animation, so there's nothing for
// prefers-reduced-motion to disable.
export const adminFieldRowClass = "min-w-0 sm:focus-within:relative sm:focus-within:z-10 sm:focus-within:col-span-full";

// focus-visible (not focus) so the ring only appears for keyboard navigation,
// not on every mouse click — explicit ask from the issue ("preserve keyboard
// navigation and visible focus").
export const adminButtonFocusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40";
