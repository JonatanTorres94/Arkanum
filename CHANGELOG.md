# Changelog

## [Unreleased]

## [0.25.0] - 2026-06-19

### Added

- `supabase/migrations/20260619000000_add_lead_follow_up_fields.sql` — columnas `next_action` (text, nullable) y `follow_up_date` (date, nullable) en `leads`. Índice `leads_follow_up_date_idx`.
- `supabase/migrations/20260619010000_extend_lead_events_type_check_follow_up.sql` — extiende el CHECK de `lead_events.type` para aceptar `follow_up_updated`.
- `src/features/leads/domain/lead.types.ts` — `LeadFollowUpInput`, `UpdateLeadFollowUpResult`, campos `nextAction`/`followUpDate` en `Lead`.
- `src/features/leads/application/update-lead-follow-up.use-case.ts` — mismo patrón que los use-cases de status/etapa.
- `src/components/admin/lead-follow-up-form.tsx` — Client Component. Textarea de próxima acción + input de fecha + botón "Guardar seguimiento". Muestra "Sin próxima acción definida." cuando ambos campos están vacíos.
- `src/server/actions/admin-lead.action.ts` — nueva `updateLeadFollowUpAction`: valida auth, valida la fecha server-side (regex + `Date.parse`, independiente de la validación del `<input type="date">` del cliente), normaliza strings vacíos a `null`, guard anti-duplicado (sin escritura ni evento si ningún campo cambió), registra evento `follow_up_updated` reusando `from_status`/`to_status` de `lead_events` como un snapshot de texto único ("Acción: ... · Fecha: ...").

### Changed

- `src/features/leads/infrastructure/lead.repository.ts` / `supabase-lead.repository.ts` — agregan `updateFollowUp(id, input)`; `LeadRow`/`toLeadDomain` incluyen `next_action`/`follow_up_date`.
- `src/components/admin/lead-activity-feed.tsx` — agrega rama de render para eventos `follow_up_updated` (muestra el snapshot guardado directamente, sin label lookup — ya es texto legible).
- `src/app/admin/leads/[id]/page.tsx` — agrega la card "Seguimiento" justo después de "Workflow".

### Notes

- Seguimiento manual únicamente (issue #41): sin reminders automáticos, sin notificaciones por email/WhatsApp, sin integración de calendario, sin asignaciones, sin task management, sin kanban, sin CRM completo.
- Sin cambios públicos/SEO/i18n. CSV export sin tocar.
- El registro del evento es no-bloqueante, igual que `status_changed`/`qualified_stage_changed`: si falla, solo se emite `console.warn`.
- No pude verificar visualmente en navegador — `/admin/leads/[id]` requiere sesión admin no disponible en este entorno.

## [0.24.0] - 2026-06-19

### Added

- `src/app/pt-BR/automacao-de-processos/page.tsx`, `sistemas-para-distribuidoras/page.tsx`, `software-para-logistica/page.tsx`, `sistemas-de-estoque/page.tsx`, `automacao-com-whatsapp/page.tsx` — equivalentes pt-BR de las 5 páginas públicas de intención que quedaban solo en español, con terminología brasileña auténtica ("automação", "estoque", "sem custo"). FAQ schema JSON-LD propio, capacidades/casos de uso y páginas relacionadas traducidos por completo.

### Changed

- `src/components/ui/locale-switcher.tsx` — 10 entradas nuevas en `ALTERNATE` (5 pares ES↔PT).
- `src/config/routes.ts` — 5 rutas pt-BR agregadas al sitemap, con la misma prioridad que su equivalente en español.
- `src/app/automatizacion-de-procesos/page.tsx`, `sistemas-para-distribuidoras/page.tsx`, `software-para-logistica/page.tsx`, `sistemas-de-stock/page.tsx`, `automatizacion-con-whatsapp/page.tsx` — agregan `alternates.languages` vía `getBilingualAlternates`, completando el hreflang bidireccional con su par pt-BR.
- `docs/internationalization.md` — tabla de slug mapping actualizada con los 5 pares nuevos; nota obsoleta sobre "necesita análisis de SEO para Brasil" reemplazada por el estado real (ya traducido).

### Notes

- Las CTAs de las páginas pt-BR nuevas usan `<Link>` simple a `/pt-BR/diagnostico`, no `ServicePageCtaButton` — ese componente está atado a `ServiceSlug` (tipo solo-español para analytics) y a un `href` fijo a `/diagnostico`. Mismo patrón que ya usaba `/pt-BR/software-sob-medida`.
- Verificado en navegador headless (issue #39): las 5 rutas renderizan sin errores de consola, el `LocaleSwitcher` resuelve correctamente en ambas direcciones, hreflang es bidireccional y correcto, el sitemap incluye los 5 paths nuevos.
- Sin `/es`, sin redirects automáticos, sin detección de idioma del browser, sin rutas en inglés, sin i18n de admin, sin cambios de DB, sin cambios al formulario de diagnóstico ni a los emails, sin framework de i18n nuevo.

## [0.23.0] - 2026-06-19

### Added

- `src/components/admin/lead-filters.tsx` — select "Etapa calificada" con `unassigned` + las 7 etapas del pipeline, vía query param `qualifiedStage`.

### Changed

- `src/app/admin/leads/page.tsx` y `src/app/admin/leads/export/route.ts` — agregan la misma cláusula de filtro: `qualifiedStage` solo matchea leads con `status === "qualified"`; `unassigned` matchea `qualifiedStage === null`, cualquier otro valor matchea esa etapa exacta. Conteo `(X de Y)`, resto de filtros y export CSV sin cambios.

### Notes

- Solo filtrado en memoria sobre leads ya cargados (issue #37): sin migrations, sin nuevos campos, sin nuevas etapas, sin CRM automation, sin cambios al esquema del CSV.

## [0.22.0] - 2026-06-19

### Added

- `src/components/admin/lead-operational-metrics.tsx` — 4 cards con datos derivados sobre el set de leads ya cargado: últimos 7 días (por `createdAt`), calificados, alta urgencia (`urgency === "Lo necesitamos cuanto antes"`) y con presupuesto definido (`budget !== "No tenemos cifra definida aún"`).
- `src/components/admin/lead-pipeline-distribution.tsx` — distribución de leads calificados por `qualifiedStage` (incluye bucket "Sin etapa asignada"). No renderiza nada (`return null`) si no hay leads calificados.

### Changed

- `src/app/admin/leads/page.tsx` — agrega la sección de métricas operativas y distribución de pipeline entre el header y los cards de estado existentes (`LeadSummaryCards`). Ambos componentes nuevos reciben `result.leads` (set completo, sin filtrar) — mismo criterio que ya usaba `LeadSummaryCards`. Filtros, tabla y export CSV sin cambios.

### Notes

- Solo lectura/cálculo derivado sobre datos existentes (issue #34): sin migrations, sin nuevos campos, sin tipos de evento nuevos, sin automatización de CRM, sin charting library, sin cambios públicos/SEO/i18n.
- "Alta urgencia" y "presupuesto definido" se determinan comparando contra los valores literales del enum (`URGENCY_OPTIONS`/`BUDGET_OPTIONS`), documentado con comentario en el componente — no son flags propios, así que un cambio de copy en esos enums rompería silenciosamente la métrica.

## [0.21.0] - 2026-06-18

### Added

- `src/components/admin/lead-detail-section.tsx` — wrapper de card reutilizable (título + contenido) para las secciones de `/admin/leads/[id]`.

### Changed

- `src/app/admin/leads/[id]/page.tsx` — reorganizado en cards: header con nombre, empresa/rol, email/WhatsApp y fecha de creación; card "Workflow" con el selector de estado y el de etapa calificada; datos del lead agrupados en "Datos de contacto", "Empresa", "Proceso a mejorar" y "Contexto operativo"; "Actividad" y "Notas internas" como cards separadas. Sin cambios de lógica ni de datos — es una reorganización de render sobre los mismos `Field`/use-cases existentes.
- `src/components/admin/lead-activity-feed.tsx` — copy del estado vacío actualizado a "Sin actividad registrada todavía."
- Estado vacío de notas internas actualizado a "Sin notas registradas todavía." (mismo tono que el de actividad).

### Notes

- Solo UX/frontend (issue #32): sin migrations, sin nuevos campos de lead, sin automatización de CRM, sin cambios públicos/SEO/i18n, sin tocar CSV export.
- Mobile: layout a una sola columna, `break-words` agregado donde podía haber overflow (nombre, empresa/rol, email, WhatsApp, notas).
- `package-lock.json` — version bump a `0.21.0` (estaba desincronizado desde la v0.16.0, sin tocar el árbol de dependencias).

## [0.20.0] - 2026-06-18

### Added

- `supabase/migrations/20260618000000_add_lead_qualified_stage.sql` — columna `qualified_stage` (nullable) en `leads`, con CHECK constraint que la limita a los 7 valores del pipeline (`discovery_pending`, `proposal_pending`, `proposal_sent`, `waiting_client`, `accepted`, `rejected`, `project_started`). Índice `leads_qualified_stage_idx`.
- `supabase/migrations/20260618010000_extend_lead_events_type_check.sql` — extiende el CHECK de `lead_events.type` para aceptar `qualified_stage_changed` además de `status_changed`.
- `src/features/leads/domain/lead.types.ts` — `QUALIFIED_STAGES`, `QualifiedStage`, campo `qualifiedStage` en `Lead`, `UpdateLeadQualifiedStageResult`.
- `src/features/leads/application/update-lead-qualified-stage.use-case.ts` — mismo patrón que `update-lead-status.use-case.ts`.
- `src/components/admin/lead-qualified-stage-selector.tsx` — Client Component. Select con las 7 etapas + opción "Sin etapa asignada" (`null`). Llama a `updateLeadQualifiedStageAction`.
- `src/server/actions/admin-lead.action.ts` — nueva `updateLeadQualifiedStageAction`: valida auth, valida etapa, exige `status === "qualified"` server-side (no confía solo en que el selector esté oculto en el cliente), guard anti-duplicado, registra evento `qualified_stage_changed` reusando las columnas genéricas `from_status`/`to_status` de `lead_events`.

### Changed

- `src/features/leads/domain/lead-event.types.ts` — `LeadEventType` ahora es `"status_changed" | "qualified_stage_changed"`.
- `src/features/leads/infrastructure/lead.repository.ts` / `supabase-lead.repository.ts` — agregan `updateQualifiedStage(id, stage)`; `LeadRow`/`toLeadDomain` incluyen `qualified_stage`.
- `src/components/admin/lead-activity-feed.tsx` — agrega rama de render para eventos `qualified_stage_changed` (mismo patrón visual que `status_changed`, con labels propias).
- `src/app/admin/leads/[id]/page.tsx` — muestra `LeadQualifiedStageSelector` únicamente cuando `lead.status === "qualified"`.

### Notes

- Pipeline liviano, no CRM: sin recordatorios, tareas, asignaciones, automatizaciones ni follow-up por WhatsApp/email (issue #30).
- Sin cambios públicos, SEO ni i18n.
- CSV export (`/admin/leads/export`) queda sin tocar — no incluye `qualified_stage`.
- El registro del evento es no-bloqueante, igual que `status_changed`: si falla, solo se emite `console.warn`.

## [0.19.0] - 2026-06-16

### Added

- `src/components/ui/locale-switcher.tsx` — Client Component ("use client"). Usa `usePathname()` para determinar la ruta actual y muestra un link al locale alternativo (ES/PT) con un mapa estático de alternates. Retorna `null` para rutas sin equivalente traducido (admin, páginas SEO de intención, gracias).
- `src/app/pt-BR/page.tsx` — Home en portugués: hero, sección de servicios (2 cards), CTA final. Piloto: incluye secciones principales. Secciones secundarias (Problemas, Proceso, Confianza) quedan para la activación completa.
- `src/app/pt-BR/software-sob-medida/page.tsx` — Equivalente pt-BR de `/software-a-medida`. Capacidades, FAQs con JSON-LD, CTA. Contenido traducido manualmente.
- `src/app/pt-BR/diagnostico/page.tsx` — Wrapper pt-BR con header/intro en portugués que reutiliza `DiagnosticForm`. Los labels del formulario permanecen en español (limitación del piloto, documentada).
- `src/app/pt-BR/obrigado/page.tsx` — Página de confirmación pt-BR. `robots: noindex`. No está conectada al redirect del Server Action aún (deferred).

### Changed

- `src/config/i18n.ts` — `activeLocales` pasa de `["es"]` a `["es", "pt-BR"]`. `futureLocales` queda solo `["en"]`. `localeConfig["pt-BR"].active` → `true`.
- `src/config/routes.ts` — 3 rutas pt-BR agregadas al sitemap: `/pt-BR` (0.9), `/pt-BR/software-sob-medida` (0.9), `/pt-BR/diagnostico` (0.7).
- `src/lib/seo/canonical.ts` — Nuevo helper `getBilingualAlternates(esPath, ptBrPath)` para hreflang en páginas con slugs traducidos. `getAlternates()` conserva su implementación pero recibe una nota de que no aplica a slugs distintos entre locales.
- `src/components/layout/site-header.tsx` — Agrega `<LocaleSwitcher />` junto al CTA. Se muestra PT/ES solo en rutas con equivalente en el otro locale; invisible en el resto del sitio.
- `src/app/page.tsx` — `alternates.languages` con `getBilingualAlternates("/", "/pt-BR")`.
- `src/app/software-a-medida/page.tsx` — `alternates.languages` con `getBilingualAlternates("/software-a-medida", "/pt-BR/software-sob-medida")`.
- `src/app/diagnostico/page.tsx` — `alternates.languages` con `getBilingualAlternates("/diagnostico", "/pt-BR/diagnostico")`.
- `docs/internationalization.md` — Sección de decisión actualizada a v0.19.0; documenta limitación de `<html lang>`.

### Notes

- `<html lang>` es `"es"` para todas las rutas incluyendo pt-BR — limitación de la arquitectura sin `[locale]` route groups. Hreflang está correctamente implementado (lo que Google usa para targeting de idioma).
- No hay redirects automáticos por idioma, no hay middleware de detección de locale, no hay `/es/` prefijo.
- El formulario de diagnóstico en `/pt-BR/diagnostico` envía datos correctamente al mismo Server Action y redirige a `/gracias` (español). El redirect a `/pt-BR/obrigado` es trabajo futuro.
- Las 4 páginas SEO de intención (distribuidoras, logística, stock, whatsapp) quedan sin equivalente pt-BR — `LocaleSwitcher` retorna null para ellas.
- Sin cambios en admin, dashboard, base de datos, CSV export ni rutas SEO en español.

## [0.18.0] - 2026-06-15

### Added

- `supabase/migrations/20260615010000_create_lead_events_table.sql` — tabla `lead_events` con `id`, `lead_id` (FK con cascade), `type` (CHECK `status_changed`), `from_status`, `to_status`, `created_by`, `created_at`. RLS habilitado, sin políticas públicas.
- `src/features/leads/domain/lead-event.types.ts` — tipos `LeadEvent`, `LeadEventType` y `CreateLeadEventInput`.
- `src/features/leads/infrastructure/event.repository.ts` — interfaz `EventRepository` con `create` y `findByLeadId`.
- `src/features/leads/infrastructure/supabase-event.repository.ts` — implementación Supabase. `create` hace insert; `findByLeadId` ordena por `created_at DESC`.
- `src/features/leads/application/create-lead-event.use-case.ts` — retorna `{ ok, error }`. El caller decide si propagar el fallo.
- `src/features/leads/application/get-lead-events.use-case.ts` — retorna `{ ok: true; events }` | `{ ok: false; error }`.
- `src/components/admin/lead-activity-feed.tsx` — Server Component. Renderiza lista de eventos con estado anterior → nuevo, autor y fecha. Muestra "Sin actividad registrada." cuando la lista está vacía.

### Changed

- `src/server/actions/admin-lead.action.ts` — `updateLeadStatusAction` ahora: (1) fetch del lead actual con `getLeadByIdUseCase`, (2) guard anti-duplicado (`fromStatus === status → return {}`), (3) actualiza estado, (4) registra evento `status_changed`. Si el registro del evento falla, solo emite `console.warn` — la actualización de estado no se revierte.
- `src/app/admin/leads/[id]/page.tsx` — agrega sección "Actividad" entre los campos del lead y las notas internas. `getLeadEventsUseCase` y `getLeadNotesUseCase` se ejecutan en paralelo con `Promise.all`.

### Notes

- El registro de eventos es no-bloqueante: un fallo en `createLeadEventUseCase` no impide que el cambio de estado llegue al usuario.
- `fromStatus` se obtiene server-side (via `getLeadByIdUseCase`) — no se acepta del cliente para el audit trail.
- Sin cambios en `leads`, `lead_notes`, CSV export, rutas públicas ni i18n.

## [0.17.0] - 2026-06-15

### Added

- `src/features/leads/application/get-lead-by-id.use-case.ts` — use case con resultado tipado: `{ ok: true; lead }` | `{ ok: false; notFound: boolean; error: string }`. Distingue not-found de error de repositorio.

### Changed

- `src/features/leads/infrastructure/lead.repository.ts` — `findById(id: string): Promise<Lead | null>` agregado al contrato de `LeadRepository`.
- `src/features/leads/infrastructure/supabase-lead.repository.ts` — implementa `findById` con `.eq("id", id).maybeSingle()`. Retorna `null` cuando no existe el registro; lanza para errores reales de Supabase.
- `src/app/admin/leads/[id]/page.tsx` — reemplaza `findAll() + .find()` por `getLeadByIdUseCase`. Un solo query de DB, proporcional al caso de uso.

### Notes

- Sin migraciones de DB. Sin cambios en `create`, `findAll` ni `updateStatus`.
- El refactor reduce la carga del detalle de O(N) queries en datos a O(1).
- `notFound()` se llama en ambos casos de error (`notFound: true` y errores de repositorio) — comportamiento consistente con el estado previo.

## [0.16.0] - 2026-06-15

### Added

- `src/app/admin/leads/export/route.ts` — Route Handler GET `/admin/leads/export`. Admin-guarded, respects los 5 query params de filtro (status, industry, companySize, budget, urgency), aplica el mismo filtrado en memoria que la página. Devuelve CSV con 16 columnas: nombre, email, empresa, rol, WhatsApp, rubro, tamaño, proceso a mejorar, problema actual, herramientas actuales, horas semanales, presupuesto, urgencia, mensaje adicional, estado, fecha. Sin notas internas. Escaping seguro: campos con coma, comilla o salto de línea se envuelven en comillas dobles con escaping interno.
- `src/components/admin/lead-summary-cards.tsx` — 4 cards de resumen operativo (Nuevos / Contactados / Calificados / Descartados). Muestra conteos sobre el total de leads, independiente de los filtros activos. Sin markup extra ni estado cliente.

### Changed

- `src/app/admin/leads/page.tsx` — importa `LeadSummaryCards` y lo muestra entre el header y los filtros cuando hay leads. Agrega link "Exportar CSV" en el header (junto a "Cerrar sesión"); cuando hay filtros activos dice "Exportar CSV (filtrado)" y pasa los mismos query params al endpoint. La URL de export se construye server-side.

### Notes

- Export es admin-only — `verifyAdmin()` corre antes de cualquier procesamiento en el Route Handler.
- Las notas internas (`lead_notes`) no se incluyen en el export: `getLeadsUseCase` no las fetcha.
- Sin cambios en repositorio, use cases, tipos de dominio ni base de datos.
- El link de export usa `<a>` (no `<Link>`) — es un Route Handler que devuelve un archivo, no una página.

## [0.15.0] - 2026-06-15

### Added

- `src/messages/es.json` — strings extraídos de todas las páginas públicas actuales (home, software-a-medida, automatizacion-de-procesos, diagnóstico, gracias, nav, footer). Fuente de verdad para español, estructurada para ser compatible con next-intl cuando se active el routing i18n.
- `src/messages/pt-BR.json` — traducción completa al português brasileiro de los mismos namespaces. Contenido revisado manualmente; no se usó traducción automática. Incluye traducción de CTAs, hero, capacidades, casos de uso, FAQs, sección de agradecimiento, nav y footer.

### Changed

- `docs/internationalization.md` — nueva sección "Piloto pt-BR — v0.15.0" documenta qué se hizo, qué guardrails se respetaron, la tabla de slug mapping para activación futura y los criterios de activación pendientes.

### Notes

- `activeLocales` sigue siendo `["es"]` — no se activó routing. No hay hreflang, no hay entradas de sitemap en pt-BR.
- Las páginas de intención (distribuidoras, logística, stock, whatsapp) están fuera del piloto deliberadamente — sus slugs en Brasil requieren análisis de SEO local antes de traducir.
- Activación completa requiere: revisión por hablante nativo, análisis de slugs, instalación de next-intl (o equivalente), refactor de componentes para usar mensajes, y routing `[locale]` en App Router.

## [0.14.0] - 2026-06-15

### Added

- `src/components/admin/lead-filters.tsx` — Client Component con 5 selects (estado, presupuesto, urgencia, rubro, tamaño). Auto-submit en onChange via `router.push`. "Limpiar filtros" visible solo cuando hay filtros activos.

### Changed

- `src/app/admin/leads/page.tsx` — acepta `searchParams`, filtra leads en memoria según los 5 campos de calificación sin modificar repositorio ni use cases. Columnas actualizadas: Nombre (+ empresa como subtext), Estado, Presupuesto, Urgencia, Rubro, Tamaño (xl+), Fecha. Contador cambia a "X de Y" cuando hay filtros activos. Filtros envueltos en `<Suspense>` por requisito de `useSearchParams`. `max-w-5xl` → `max-w-6xl`.
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
