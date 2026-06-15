# Changelog

## [Unreleased]

## [0.14.0] - 2026-06-15

### Added

- `src/components/admin/lead-filters.tsx` — Client Component con 5 selects (estado, presupuesto, urgencia, rubro, tamaño). Auto-submit en onChange via `router.push`. "Limpiar filtros" visible solo cuando hay filtros activos.

### Changed

- `src/app/admin/leads/page.tsx` — acepta `searchParams`, filtra leads en memoria según los 5 campos de calificación sin modificar repositorio ni use cases. Columnas actualizadas: Nombre (+ empresa como subtext), Estado, Presupuesto, Urgencia, Rubro, Fecha. Contador cambia a "X de Y" cuando hay filtros activos. Filtros envueltos en `<Suspense>` por requisito de `useSearchParams`. `max-w-5xl` → `max-w-6xl`.
- Two distinct empty states: "no leads en absoluto" vs. "no resultados para los filtros activos".

### Notes

- Sin cambios en repositorio, use cases, tipos de dominio ni base de datos.
- Filtrado en memoria: apropiado para el volumen esperado en MVP. Si el listado crece, el filtro puede moverse a la query de Supabase sin cambiar la interfaz de la página.
- Lead detail, status update y notas internas sin cambios.

## [0.13.0] - 2026-06-15

### Added

- `/sistemas-para-distribuidoras` — landing de intención para distribuidoras y mayoristas. Cubre: gestión de pedidos, stock, repartos, historial de clientes, conciliación de pagos y reportes. 3 FAQs con JSON-LD.
- `/software-para-logistica` — landing de intención para empresas de logística y repartos. Cubre: órdenes de entrega, app para choferes, confirmación de entrega, seguimiento en tiempo real y reportes. 3 FAQs con JSON-LD.
- `/sistemas-de-stock` — landing de intención para control de inventario. Cubre: entradas/salidas, alertas de mínimo, múltiples depósitos, trazabilidad por lote y reportes. 3 FAQs con JSON-LD.
- `/automatizacion-con-whatsapp` — landing de intención para empresas que operan por WhatsApp. Cubre: captura de pedidos, panel de gestión, notificaciones automáticas, historial trazable y roles diferenciados. 3 FAQs con JSON-LD.
- Sección "También puede interesarte" con 2 links internos en cada página nueva.

### Changed

- `src/lib/analytics/track.ts` — `ServiceSlug` extendido con los 4 slugs nuevos para `intent_page_cta_click`.
- `src/config/routes.ts` — 4 rutas nuevas registradas (priority 0.8). El sitemap las recoge automáticamente.

### Notes

- No hay claims falsos, métricas inventadas ni testimonios en ninguna página.
- Todos los CTAs usan `ServicePageCtaButton` con el slug correspondiente — eventos ya trackeados.
- Links internos: distribuidoras ↔ stock, logística ↔ distribuidoras, stock ↔ software-a-medida, whatsapp ↔ automatizacion-de-procesos.

## [0.12.0] - 2026-06-15

### Added

- `docs/production-launch.md` — checklist completo de lanzamiento a producción. Cubre: Vercel, Supabase, Resend, Admin, SEO, Analytics, Smoke tests, Rollback y validación post-deploy (primeras 48h). Incluye notas de arquitectura sobre rate limiter, service role key y admin whitelist.

### Changed

- `.env.example` — comentario en `NEXT_PUBLIC_SITE_URL` aclara que debe coincidir con el dominio real en producción.

### Notes

- No se agregaron features. Esta release es exclusivamente preparación operacional para producción.
- Rollback: Vercel permite hacer Promote to Production de cualquier deploy anterior desde el dashboard en segundos.

## [0.11.1] - 2026-06-15

### Fixed

- `ResendEmailService` — lazy Resend client initialization in `send()` instead of constructor. If `RESEND_API_KEY` is not set, logs a warning and returns early instead of throwing. Prevents email errors from surfacing to users when the env var is missing.
- `lead.schema.ts` — `companySize` promoted from optional free text to required `z.enum(COMPANY_SIZE_OPTIONS)`. Predefined ranges improve data consistency and lead qualification.
- `lead.schema.ts` — `BUDGET_OPTIONS` updated to more filtering ranges: floor raised to $500k, top range to $5M+, "No lo sé" replaced with "No tenemos cifra definida aún".
- `diagnostic-form.tsx` — `companySize` input converted to a required select with `COMPANY_SIZE_OPTIONS`.
- `diagnostic-form.tsx` — WhatsApp field now includes anti-spam microcopy below the input.

### Notes

- No Supabase migration required. `company_size` and `budget` columns remain `TEXT`; new enum values are validated at form submission time only.
- Existing records in the DB with old budget strings or empty company_size are unaffected.

## [0.11.0] - 2026-06-14

### Added

- `src/config/routes.ts` — central registry of public, indexable routes (path, priority, changeFrequency). Single source of truth for sitemap and future tooling.
- `src/lib/seo/canonical.ts` — SEO helpers: `getCanonicalUrl`, `getLocalizedUrl`, `getAlternates`. `getAlternates` returns empty object while only one locale is active — no hreflang emitted to non-existent pages.

### Changed

- `src/config/i18n.ts` — hardened: added `localeConfig` with label, territory, direction and active flag per locale; added `isActiveLocale` and `isFutureLocale` type guards; explicit `ActiveLocale` and `FutureLocale` types derived from const arrays.
- `src/app/sitemap.ts` — derives entries from `publicRoutes` and `getCanonicalUrl` instead of hardcoded strings.
- `docs/internationalization.md` — updated to v0.11.0 state, documents new helpers and activation checklist.

### Notes

- No i18n routing activated. Spanish only. No locale-prefixed routes created.
- No hreflang tags emitted. `getAlternates` is safe: it produces output only when multiple locales are active.
- When a new locale is ready to activate: add it to `activeLocales` in `i18n.ts`, add route translations to `routes.ts`, and enable routing per `docs/internationalization.md`.

## [0.10.0] - 2026-06-14

### Added

- Vercel Analytics (`@vercel/analytics`) — page view tracking, server-side, privacy-first.
- Vercel Speed Insights (`@vercel/speed-insights`) — Core Web Vitals monitoring.
- Google Analytics 4 via `@next/third-parties/google` — event tracking and Search Console integration.
- `src/lib/analytics/track.ts` — infrastructure wrapper with strongly typed, no-PII event functions:
  - `trackCtaDiagnosticClick(location)` → `cta_diagnostic_click`
  - `trackDiagnosticSubmitSuccess()` → `diagnostic_submit_success`
  - `trackDiagnosticSubmitError()` → `diagnostic_submit_error`
  - `trackServiceLinkClick(service)` → `home_service_link_click`
  - `trackIntentPageCta(page)` → `intent_page_cta_click`
- `src/components/ui/tracked-cta-button.tsx` — `HomeCtaButton` and `ServicePageCtaButton` client components.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var — GA4 is only mounted when the var is set.
- `.env.example` — documented `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (commented, for when Search Console code is available).

### Changed

- `src/app/layout.tsx` — added Analytics, SpeedInsights, and conditional GoogleAnalytics.
- `hero-section.tsx`, `final-cta-section.tsx` — CTA buttons replaced with `HomeCtaButton` (tracks `cta_diagnostic_click`).
- `service-links-section.tsx` — converted to client component, cards track `home_service_link_click`.
- `software-a-medida/page.tsx`, `automatizacion-de-procesos/page.tsx` — CTAs use `ServicePageCtaButton` (tracks `intent_page_cta_click`).
- `diagnostic-form.tsx` — `onSubmit` fires `diagnostic_submit_success` or `diagnostic_submit_error` after server action resolves.

### Notes

- No PII is sent to analytics. All event params are generic slugs or location identifiers.
- GA4 is conditionally mounted: if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is not set, the script is not injected and tracking calls are silent no-ops.
- Search Console verification: when you have the code, add `metadata.verification.google` in `src/app/layout.tsx`. Env var documented in `.env.example`.

## [0.9.0] - 2026-06-14

### Added

- `/software-a-medida` landing page with targeted metadata, 4 service types and 3 visible FAQs with JSON-LD structured data.
- `/automatizacion-de-procesos` landing page with targeted metadata, 6 use cases and 3 visible FAQs with JSON-LD structured data.
- `ServiceLinksSection` component on homepage linking to both intent pages.
- `src/config/i18n.ts` — locale config: `es` active, `pt-BR` and `en` defined as future targets.
- `docs/seo-strategy.md` — keyword strategy, page structure, Search Console checklist and UTM conventions.
- `docs/internationalization.md` — i18n decision, future architecture and activation criteria.

### Changed

- Homepage (`src/app/page.tsx`) — added `metadata` export with `title: { absolute }` and SEO-targeted description.
- `sitemap.ts` — added `/software-a-medida` and `/automatizacion-de-procesos` with `priority: 0.9`.
- `site-footer.tsx` — added links to both intent pages for navigability and internal linking.

### Notes

- Both intent pages include rendered FAQ sections; JSON-LD is only present because the content is also visible to users.
- No i18n routing activated. Spanish only. Migration path documented in `docs/internationalization.md`.
- No false claims, metrics or testimonials added.

## [0.8.0] - 2026-06-14

### Added

- `supabase/migrations/20260614010000_create_lead_notes_table.sql` — `lead_notes` table with `on delete cascade`, indexes and RLS enabled.
- `LeadNote` domain type with `id`, `leadId`, `content`, `createdBy` and `createdAt`.
- `noteSchema` — Zod validation: required, min 2, max 2000 characters.
- `NoteRepository` interface with `findByLeadId` and `create`.
- `SupabaseNoteRepository` implementation with snake_case → camelCase mapping.
- `getLeadNotesUseCase` — fetches notes by lead, sorted newest first.
- `createLeadNoteUseCase` — persists a new note with author and trimmed content.
- `createLeadNoteAction` — admin-guarded Server Action with Zod validation; captures `user.email` as `createdBy`.
- `LeadNoteForm` — client component with `useTransition`, error display and form reset on success.
- Notes section in `/admin/leads/[id]` — list of existing notes + form to add new ones.

### Notes

- Note content is never logged.
- `created_by` stores the admin's email. Nullable if email is unavailable.
- Notes are fetched server-side; `revalidatePath` triggers page re-render after creation.

## [0.7.0] - 2026-06-14

### Added

- Security headers on all responses: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- `robots.txt` via Next.js App Router — blocks `/admin/` and `/gracias` from indexing.
- `sitemap.xml` via Next.js App Router — includes `/` and `/diagnostico`.
- Honeypot field (`website`) in the diagnostic form — silently discards bot submissions.
- In-memory rate limiter (`src/lib/security/rate-limit.ts`) — 5 requests per IP per 15 minutes.
- `src/instrumentation.ts` — validates required env vars at startup; throws in production, warns in development.
- `docs/deployment.md` — full deployment guide covering Supabase, Vercel, env vars, admin setup and anti-abuse caveats.

### Changed

- `diagnostic.action.ts` — integrates honeypot check and rate limit before persisting; sanitizes error log to avoid leaking internal details.

### Notes

- Rate limiter is in-memory (best-effort). Resets on serverless cold starts. Redis/KV-backed solution deferred to a future release.
- CSP not configured in this release. Next.js inline scripts require dedicated tuning. Deferred.
- HSTS handled by Vercel on production domains; not set at app level.

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
