# Changelog

## [Unreleased]

## [0.6.0] - 2026-06-14

### Added

- Internal admin login using Supabase Auth (`/admin/login`).
- `ADMIN_EMAILS` environment variable for allowlist-based dashboard access.
- Server-side admin guard (`verifyAdmin`) applied to all `/admin/*` pages and actions.
- `@supabase/ssr` for cookie-based session management in Server Components and middleware.
- Middleware at `/admin/:path*` to refresh Supabase session token on each request.
- Admin leads list page (`/admin/leads`) with status badges and date formatting.
- Admin lead detail page (`/admin/leads/[id]`) with all lead fields.
- `LeadStatusSelector` client component for inline status updates.
- `LeadStatusBadge` component with color-coded states.
- `getLeadsUseCase` and `updateLeadStatusUseCase` in application layer.
- `findAll()` and `updateStatus()` methods in `LeadRepository` interface and `SupabaseLeadRepository`.
- Server Actions: `updateLeadStatusAction` (auth-guarded), `signOutAction`, `signInAction`.
- DB migration: `leads_status_check` constraint restricting valid status values.

### Changed

- `LeadStatus` type expanded to four workflow states: `new`, `contacted`, `qualified`, `disqualified`.
- `LEAD_STATUSES` constant added to domain for runtime validation.

### Notes

- Dashboard is internal-only. No public read/write policies on `leads`.
- `verifyAdmin` checks both Supabase session and `ADMIN_EMAILS` allowlist on every request.
- `findById` is not implemented — detail page uses `findAll()` for MVP. Marked as tech debt.

## [0.5.0] - 2026-06-14

### Added

- `EmailService` interface (`src/lib/email/email-service.ts`) decoupling the application layer from Resend.
- `ResendEmailService` implementation (`src/lib/email/resend-email-service.ts`) wrapping the Resend SDK.
- `notifyLeadUseCase` receives `EmailService` via dependency injection and includes `leadId` in the notification body.
- Email notification triggered after successful lead persist; failure is non-blocking (logged server-side, user redirected to `/gracias` regardless).
- `LEAD_NOTIFICATION_TO` and `LEAD_NOTIFICATION_FROM` added to `.env.example`.

### Changed

- `submitDiagnosticAction` updated to instantiate `ResendEmailService` and pass it to `notifyLeadUseCase`.

### Removed

- `src/lib/email/resend.ts` singleton replaced by encapsulated `ResendEmailService`.

## [0.4.0] - 2026-06-13

### Added

- Supabase server client using `SUPABASE_SERVICE_ROLE_KEY` (server-side only).
- `supabase/migrations/20260613000000_create_leads_table.sql` with RLS enabled.
- `Lead` domain type and `CreateLeadResult` in `lead.types.ts`.
- `LeadRepository` interface.
- `SupabaseLeadRepository` implementation with camelCase → snake_case mapping.
- `createLeadUseCase` with controlled error handling.
- `submitDiagnosticAction` updated to persist via use case before redirect.
- `/gracias` copy updated to truthfully confirm submission was received.

### Notes

- Insert happens server-side only via service role key. No public RLS policies.
- Dashboard, auth, and read policies are out of scope until v0.5.0.

## [0.3.0] - 2026-06-13

### Added

- `/diagnostico` page with full diagnostic form.
- `/gracias` page with honest non-persistent copy.
- Zod schema for lead diagnostic form (`lead.schema.ts`).
- React Hook Form integration with client-side validation.
- Server Action with server-side Zod re-validation (`diagnostic.action.ts`).
- Required/optional field distinction aligned with `docs/copy.md`.
- Loading state and double-submit protection on form submit button.
- Server error display when server-side validation fails.

### Notes

- Data is intentionally discarded after server-side validation. Persistence via Supabase will be added in v0.4.0.

## [0.2.0] - 2026-06-12

### Added

- Brand landing page with full section structure.
- Hero, Problems, Solutions, Use Cases, Process, Trust and Final CTA sections.
- Site header (sticky, responsive) and site footer.
- SEO metadata and Open Graph configuration.
- Dark premium visual foundation with Inter font and brand color tokens.
- UI primitives: Button, Section, Card.
- Site config centralized in `src/config/site.ts`.

## [0.1.0] - 2026-06-12

### Added

- Engineering principles document.
- Agent pipeline document.
- Branching and versioning strategy document.
- Brand foundation document.
- Landing copy foundation document.
- Next.js 16 initialized with TypeScript, Tailwind CSS and ESLint.
- Base folder structure per Clean Architecture.
- `.env.example` with required variables.
- README with local setup instructions.
- CHANGELOG.
