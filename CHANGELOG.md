# Changelog

## [Unreleased]

## [0.45.0] - 2026-06-26

### Added

- `src/features/operations/domain/attention-item.types.ts` — tipos de dominio: `AttentionItemKind` (6 variantes), `AttentionAudience` (`support` / `development` / `integrity`), `AttentionItem`, mapas de audiencia y etiquetas, `PRIORITY_SORT_WEIGHT`.
- `src/features/operations/infrastructure/attention-item.repository.ts` — interfaz `AttentionItemRepository` con `findAttentionCandidates` y `countAttentionTickets`. Tipo `AttentionCandidate` (ticket + workItem + workItemMissing flag).
- `src/features/operations/infrastructure/supabase-attention-item.repository.ts` — implementación Supabase: dos queries (tickets no-terminales relevantes → WIs por IDs); `countAttentionTickets` con query `head: true` para el badge; fail-open en count.
- `src/features/operations/application/get-attention-items.use-case.ts` — dos casos de uso: `getAttentionItemsUseCase` (derivación completa + sort) y `getAttentionItemCountUseCase` (fast path para el badge). Derivación: `action_required` → `support_intervention_pending` + `development_intervention_active`; WI `done` → `support_validation_pending`; WI `cancelled` → `support_cancellation_review`; `workItemMissing` → `integrity_missing_work_item`; escalado sin WI → `integrity_orphan_escalation`. Orden: prioridad desc → antigüedad asc.
- `src/components/admin/attention-inbox.tsx` — componente client con filtros por URL searchParam (`?audience=`): Todos / Soporte / Desarrollo / Integridad. Indicador de color por kind. Badge por filtro. Sin acciones directas.
- `src/app/admin/(shell)/attention/page.tsx` — página server component; metadata; carga items; maneja error de use case; pasa items a `AttentionInbox` dentro de `Suspense`.

### Changed

- `src/config/admin-nav.ts` — agrega dominio `"operations"` y nav item `"Atención"` (`/admin/attention`). Reordena dominios: `operations` primero.
- `src/components/admin/admin-shell.tsx` — acepta prop `attentionCount?: number` y la pasa a `AdminSidebar`.
- `src/components/admin/admin-sidebar.tsx` — acepta prop `attentionCount?: number`; renderiza badge numérico en el ítem "Atención" si `count > 0`; cap en "99+".
- `src/app/admin/(shell)/layout.tsx` — llama `getAttentionItemCountUseCase` para poblar el badge en el layout.
- `src/server/actions/admin-project-work-item.action.ts` — agrega `revalidatePath("/admin/attention")` en `revalidateSupportTicketRoutes` (aplica a todos los cambios de WI con ticket vinculado) y en `requestSupportInterventionAction` (partial + success).
- `src/server/actions/admin-support-ticket.action.ts` — agrega `revalidatePath("/admin/attention")` en `updateSupportTicketStatusAction`, `resolveTicketAfterDevelopmentAction`, `returnToDevelopmentAction`, `closeTicketAfterDevelopmentCancellationAction` y `resolveSupportInterventionAction` (partial + success).

### Tests

- `src/features/operations/application/get-attention-items.use-case.test.ts` — 14 tests: derivación por kind (todos los casos), items de integridad, ausencia de items en estado normal, sort por prioridad y antigüedad, error handling, count use case.

## [0.44.1] - 2026-06-26

### Fixed

- `src/features/support/domain/support-ticket-attachment-validation.ts` (nuevo) — validación de firma binaria (magic bytes) para todos los tipos MIME permitidos. Rechaza archivos cuyo contenido no coincide con el tipo declarado por el cliente (ej. EXE declarado como PNG). Tipos soportados: JPEG, PNG, GIF, WEBP, PDF, ZIP/DOCX/XLSX (OLE2 ZIP), DOC/XLS (OLE2 legacy), text/plain y text/csv (ausencia de byte NUL).
- `src/features/support/application/upload-support-ticket-attachment.use-case.ts` — llama a `validateAttachmentContent` después del allowlist de MIME y antes del upload al bucket. Rechaza el archivo antes de tocar el storage si la firma no coincide.
- `src/features/support/application/get-support-ticket-attachment-signed-url.use-case.ts` — recibe `ticketId` como primer parámetro. Verifica `attachment.ticketId === ticketId` antes de generar la URL; el storage no es invocado si el adjunto no pertenece al ticket.
- `src/features/support/application/delete-support-ticket-attachment.use-case.ts` — recibe `ticketId` como primer parámetro. Verifica ownership antes de ejecutar cualquier operación; ni `repository.delete` ni `storage.delete` son invocados si la validación falla. Agrega comentario documentando el orden deliberado DB-primero.
- `src/server/actions/admin-support-ticket-attachment.action.ts` — pasa `ticketId` a los dos use cases corregidos. Corrige semántica de resultado en upload: `partial: true` ahora devuelve `{ error }` en lugar de `{ warning }` (la operación falló — no debe mostrarse como éxito parcial).

### Tests

- `src/features/support/domain/support-ticket-attachment-validation.test.ts` (nuevo) — 28 tests directos sobre `validateAttachmentContent`: vacío, text types (NUL byte), JPEG, PNG, GIF87a/89a, WEBP (RIFF+WEBP), PDF, ZIP/DOCX/XLSX, DOC/XLS (OLE2), escenarios de spoofing (EXE como PNG, HTML como text/plain, JPEG como PDF).
- `src/features/support/application/upload-support-ticket-attachment.use-case.test.ts` — actualiza `DUMMY_BUFFER` por `PDF_BUFFER` con magic bytes `%PDF-`. Agrega 3 tests: firma inválida rechazada, spoofing rechazado, storage no invocado si contenido inválido.
- `src/features/support/application/get-support-ticket-attachment-signed-url.use-case.test.ts` — agrega parámetro `ticketId` a todas las llamadas. Agrega 2 tests de ownership: adjunto de otro ticket rechazado; `storage.getSignedUrl` no invocado.
- `src/features/support/application/delete-support-ticket-attachment.use-case.test.ts` — reescrito limpio con parámetro `ticketId`. Agrega 3 tests de ownership: adjunto de otro ticket rechazado; `storage.delete` no invocado; `repository.delete` no invocado.

## [0.44.0] - 2026-06-26

### Added

- `supabase/migrations/20260628000000_create_support_ticket_attachments.sql` — tabla `support_ticket_attachments` con `id, ticket_id, filename, storage_key, mime_type, size_bytes, uploaded_by, created_at`. Bucket privado `support-ticket-attachments` en Supabase Storage. RLS habilitado.
- `src/features/support/domain/support-ticket-attachment.types.ts` — tipos de dominio: `SupportTicketAttachment`, `ATTACHMENT_MAX_SIZE_BYTES` (10 MB), `ALLOWED_ATTACHMENT_MIME_TYPES`, `SIGNED_URL_EXPIRY_SECONDS` (60 s), `TERMINAL_TICKET_STATUSES`.
- `src/features/support/infrastructure/support-ticket-attachment.repository.ts` — interfaz `SupportTicketAttachmentRepository` con `create`, `findByTicketId`, `findById`, `delete`.
- `src/features/support/infrastructure/supabase-support-ticket-attachment.repository.ts` — implementación Supabase; mapeo snake_case → camelCase.
- `src/features/support/infrastructure/support-ticket-attachment-storage.ts` — interfaz `SupportTicketAttachmentStorage` con `upload`, `getSignedUrl`, `delete`.
- `src/features/support/infrastructure/supabase-support-ticket-attachment-storage.ts` — implementación Supabase Storage; bucket privado; `upsert: false`.
- `src/features/support/application/upload-support-ticket-attachment.use-case.ts` — valida tamaño y MIME; genera `storageKey = tickets/{ticketId}/{uuid}`; sube al bucket (authoritative) → inserta metadata (authoritative) → compensación automática si falla la inserción (borra del bucket; `partial: true` si la compensación también falla).
- `src/features/support/application/get-support-ticket-attachments.use-case.ts` — lista adjuntos por ticket.
- `src/features/support/application/get-support-ticket-attachment-signed-url.use-case.ts` — genera URL firmada de 60 s vía `storageKey` del registro.
- `src/features/support/application/delete-support-ticket-attachment.use-case.ts` — borra metadata primero (authoritative) → borra del bucket (partial: `true` si falla, con archivo huérfano en bucket).
- `src/server/actions/admin-support-ticket-attachment.action.ts` — tres actions: `uploadSupportTicketAttachmentAction` (FormData), `getSupportTicketAttachmentUrlAction`, `deleteSupportTicketAttachmentAction`. Tickets terminales bloqueados en upload y delete.
- `src/components/admin/support-ticket-attachment-upload-form.tsx` — formulario de subida; acepta MIME permitidos; muestra estados de carga, éxito, error y warning.
- `src/components/admin/support-ticket-attachment-list.tsx` — lista adjuntos con descarga (URL firmada) y eliminación con confirmación inline; modo `readOnly` para tickets terminales.
- `src/features/support/application/upload-support-ticket-attachment.use-case.test.ts` — 14 tests: validación, happy path, fallo de storage, compensación exitosa y fallida.
- `src/features/support/application/delete-support-ticket-attachment.use-case.test.ts` — 7 tests: validación, orden de operaciones (DB primero), partial failure, seguridad.
- `src/features/support/application/get-support-ticket-attachment-signed-url.use-case.test.ts` — 5 tests: URL firmada, duración configurada, fallo de storage.

### Changed

- `src/app/admin/(shell)/support/[id]/page.tsx` — sección "Adjuntos" con upload form + lista; carga en paralelo con notas; modo lectura para tickets terminales.
- `src/app/admin/(shell)/projects/[id]/work-items/[workItemId]/page.tsx` — referencia "Ver evidencia adjunta →" en el panel de ticket vinculado.

## [0.43.0] - 2026-06-26

### Added

- `supabase/migrations/20260627000000_add_work_item_awaiting_support_status.sql` — agrega `awaiting_support` al constraint `check` de `project_work_items.status`.
- `supabase/migrations/20260627010000_add_ticket_action_required_status.sql` — agrega `action_required` al constraint `check` de `support_tickets.status`.
- `src/features/projects/application/request-support-intervention.use-case.ts` — orquesta: crea comentario `visible_to_support=true` (autoritative) + actualiza WI a `awaiting_support` (autoritative) + marca ticket como `action_required` (best-effort) + nota de auditoría (silent-fail).
- `src/features/support/application/resolve-support-intervention.use-case.ts` — orquesta: actualiza ticket a `escalated_to_development` (autoritative) + devuelve WI a `ready` (best-effort) + nota de auditoría (silent-fail).
- `src/server/actions/admin-project-work-item.action.ts` — `requestSupportInterventionAction`: valida auth + ownership + estado del ticket; llama al use case; sincroniza lifecycle; revalida rutas afectadas.
- `src/server/actions/admin-support-ticket.action.ts` — `resolveSupportInterventionAction`: valida auth; llama al use case; sincroniza lifecycle; revalida rutas afectadas.
- `src/components/admin/support-intervention-request-panel.tsx` — panel client en detalle de work item: muestra formulario cuando hay ticket vinculado; renderiza estado de espera si ya está `awaiting_support`; oculto para estados terminales o sin ticket.
- `src/features/projects/application/request-support-intervention.use-case.test.ts` — 15 tests: validación, happy path, partial failure.
- `src/features/support/application/resolve-support-intervention.use-case.test.ts` — 9 tests: validación, happy path, partial failure.

### Changed

- `src/features/projects/domain/project-work-item.types.ts` — `WORK_ITEM_STATUSES` incluye `awaiting_support`; `WORK_ITEM_SELECTABLE_STATUSES` lo excluye para que UI no lo ofrezca en dropdowns normales.
- `src/features/projects/domain/project-lifecycle.ts` — `OPEN_WORK_ITEM_STATUSES` incluye `awaiting_support` para que el lifecycle del proyecto permanezca `in_development` mientras el WI espera intervención.
- `src/features/projects/domain/project-work-item-labels.ts` — label `awaiting_support: "Esperando a Soporte"`.
- `src/features/support/domain/support-ticket.types.ts` — `TICKET_STATUSES` incluye `action_required`.
- `src/features/support/domain/support-development-phase.ts` — nueva fase `support_action_required` derivada cuando `workItem.status === "awaiting_support"`; `OPEN_EXCLUDING_AWAITING` evita colisión con la derivación genérica `development_in_progress`.
- `src/components/admin/project-work-item-badges.tsx` — badge `awaiting_support` en naranja.
- `src/components/admin/support-ticket-badges.tsx` — label y badge `action_required` en naranja.
- `src/components/admin/support-ticket-form.tsx` — mapa `STATUS_LABELS` incluye `action_required`.
- `src/components/admin/support-ticket-status-form.tsx` — mapa `LABELS` incluye `action_required`.
- `src/components/admin/project-work-item-form.tsx` — usa `WORK_ITEM_SELECTABLE_STATUSES` en lugar de `WORK_ITEM_STATUSES`.
- `src/components/admin/project-work-item-details-form.tsx` — usa `WORK_ITEM_SELECTABLE_STATUSES`; si estado actual es `awaiting_support`, lo antepone como opción de sólo-lectura.
- `src/components/admin/project-work-item-status-form.tsx` — mismo tratamiento que el formulario de detalles.
- `src/server/actions/admin-project-work-item.action.ts` — `updateProjectWorkItemStatusAction` y `updateProjectWorkItemAction` rechazan `awaiting_support` con mensaje explícito que indica el flujo correcto.
- `src/components/admin/support-development-handoff-panel.tsx` — renderiza fase `support_action_required` con título en naranja y botón "Atender intervención"; llama a `resolveSupportInterventionAction`.
- `src/app/admin/(shell)/projects/[id]/work-items/[workItemId]/page.tsx` — integra `SupportInterventionRequestPanel`.
- `src/features/support/domain/support-development-phase.test.ts` — cubre `support_action_required`; corrige iteración sobre estados abiertos para excluir `awaiting_support`.
- `src/features/projects/domain/project-work-item-labels.test.ts` — cubre `awaiting_support`.

## [0.42.0] - 2026-06-26

### Added

- `supabase/migrations/20260626000000_create_project_work_item_comments_table.sql` — tabla `project_work_item_comments` con columnas `id`, `work_item_id`, `content`, `visible_to_support`, `created_by`, `created_at`. Índices para lookup por work item (asc) y filtro de soporte (partial index `where visible_to_support = true`). RLS habilitado; acceso solo via service role key.
- `src/features/projects/domain/project-work-item-comment.types.ts` — `ProjectWorkItemComment`, `CreateProjectWorkItemCommentInput`, `COMMENT_MAX_LENGTH = 2000`.
- `src/features/projects/infrastructure/project-work-item-comment.repository.ts` — interfaz con `findByWorkItemId`, `findByWorkItemIdVisibleToSupport`, `create`.
- `src/features/projects/infrastructure/supabase-project-work-item-comment.repository.ts` — implementación Supabase. El filtro de soporte ocurre a nivel DB (`.eq("visible_to_support", true)`), no en cliente.
- `src/features/projects/application/get-project-work-item-comments.use-case.ts` — retorna todos los comentarios de un work item (vista Desarrollo).
- `src/features/projects/application/get-project-work-item-comments-support-visible.use-case.ts` — retorna solo comentarios con `visible_to_support = true` (vista Soporte).
- `src/features/projects/application/create-project-work-item-comment.use-case.ts` — crea comentario append-only. Sin edición ni borrado.
- `src/server/actions/admin-project-work-item-comment.action.ts` — `createWorkItemCommentAction`: valida auth + ownership del work item; revalida work-item detail siempre; revalida ticket de soporte solo cuando `visibleToSupport = true` (best effort).
- `src/components/admin/project-work-item-comment-form.tsx` — client component; textarea + checkbox "Visible para Soporte"; usa `useTransition`; limpia el formulario al éxito.
- `src/components/admin/project-work-item-comment-list.tsx` — componente de presentación puro; badge "Visible a Soporte" cuando aplica; fecha en locale `es-AR`.

### Changed

- `src/app/admin/(shell)/projects/[id]/work-items/[workItemId]/page.tsx` — carga comentarios en paralelo junto con el ticket vinculado; nueva sección "Comentarios" en el main area con formulario + lista.
- `src/app/admin/(shell)/support/[id]/page.tsx` — carga comentarios visibles a soporte cuando hay work item vinculado; los pasa como prop `supportComments` al `SupportDevelopmentHandoffPanel`.
- `src/components/admin/support-development-handoff-panel.tsx` — nueva prop opcional `supportComments?: ProjectWorkItemComment[]`; renderiza bloque "Comentarios de Desarrollo" cuando hay al menos uno.

### Notes

- No hay edición ni borrado de comentarios — append-only es intencional.
- Soporte nunca puede crear comentarios; solo los lee si el equipo de Desarrollo los marcó como visibles.
- Sin notificaciones, sin visibilidad para clientes, sin cambios automáticos de estado.
- 12 tests nuevos agregados en `project-work-item-comment.use-cases.test.ts`. Total: 62 tests / 7 archivos.

## [0.41.0] - 2026-06-25

### Added

- `src/features/support/domain/support-development-phase.ts` — `SupportDevelopmentPhase` type + `deriveDevelopmentPhase(ticket, workItem)` pure function. Derives phase from ticket.escalatedWorkItemId + work item status using `OPEN_WORK_ITEM_STATUSES`. No new DB column or support status.
- `src/features/support/application/resolve-ticket-after-development.use-case.ts` — resolves ticket to `resolved` + adds validation note. Idempotent (already resolved → no duplicate note). Terminal statuses (closed/cancelled) rejected. Note failure → warning.
- `src/features/support/application/return-ticket-to-development.use-case.ts` — updates ticket to `escalated_to_development` + adds support note with optional operator reason. Work item update and lifecycle sync handled by the action before this use case runs.
- `resolveAfterDevelopmentAction` — validates auth, ticket existence, work item existence and status (must be done); delegates to `resolveTicketAfterDevelopmentUseCase`; revalidates support detail/list, work-item detail, project, client.
- `returnToDevelopmentAction` — validates auth, ticket not closed/cancelled, work item open check; step 1: work item → ready; step 2: lifecycle sync (best effort); step 3+4: ticket → escalated_to_development + note via `returnTicketToDevelopmentUseCase`; explicit partial-failure warning when work item updated but ticket not synced; revalidates all affected paths.
- `src/components/admin/support-development-handoff-panel.tsx` — client component showing phase-appropriate UI:
  - `development_in_progress`: info panel with work item details + project/work-item links.
  - `pending_support_validation`: success panel with "Resolver ticket" + "Devolver a desarrollo" actions.
  - `development_cancelled`: warning panel with "Devolver a desarrollo" action.
  - `missingWorkItemId`: integrity error panel when ticket references a non-existent work item.
  - "Devolver a desarrollo" shows an inline reason textarea before confirming.

### Changed

- `src/app/admin/(shell)/support/[id]/page.tsx` — integrates `SupportDevelopmentHandoffPanel` in sidebar above Estado; derives `developmentPhase` and `missingWorkItemId` server-side; removes inline `linkedWorkItemOpen`/`linkedWorkItemCancelled` hints that were duplicating the panel's job.

### Notes

- No new DB columns or Supabase migrations required.
- No new dependencies.
- `deriveDevelopmentPhase` uses the same `OPEN_WORK_ITEM_STATUSES` from `project-lifecycle.ts`; no duplication of status lists.
- `returnToDevelopmentAction` reuses `updateProjectWorkItemStatusUseCase` and `synchronizeProjectLifecycleUseCase` from the work-item action layer; no duplicated lifecycle logic.
- The existing development-completion note (added when work item → done) is orthogonal; this release does not remove or replace it.

## [0.40.0] - 2026-06-25

### Added

- `src/features/projects/domain/project-work-item.types.ts` — `UpdateProjectWorkItemInput`, `UpdateProjectWorkItemResult`.
- `src/features/projects/application/update-project-work-item.use-case.ts` — findById, ownership check (`workItem.projectId === projectId`), update; full try/catch.
- `ProjectWorkItemRepository.update(id, input)` — nueva firma en interfaz e implementación Supabase; persiste title/description/category/status/priority/notes.
- `updateProjectWorkItemAction` en `admin-project-work-item.action.ts` — validación equivalente a creación (título, enums); carga el work item pre-update para capturar `previousStatus` y validar pertenencia al proyecto en la action boundary; revalida work-item detail + proyecto + ticket de soporte cuando aplica.
- Helper privado `applyStatusSideEffects` en el action file — centraliza lifecycle sync + nota automática de soporte; ambas acciones (status inline y edición full) lo usan; nota de soporte solo se crea cuando `previousStatus !== "done" && newStatus === "done"` (prevención de duplicados).
- `src/components/admin/project-work-item-details-form.tsx` — formulario de edición full con todos los campos editables.
- `src/components/admin/project-work-item-workspace.tsx` — `ProjectWorkItemWorkspaceProvider`, `EditWorkItemButton`, `WorkItemDetailsSection`; el Provider mantiene `warning` persistente hasta la próxima edición.
- `src/components/admin/project-work-item-badges.tsx` — `WorkItemStatusBadge`, `WorkItemPriorityBadge`.
- `src/app/admin/(shell)/projects/[id]/work-items/[workItemId]/page.tsx` — ruta de detalle; carga en paralelo work item + proyecto; guard de ownership (workItem.projectId === projectId); sidebar: proyecto padre, ticket vinculado (si aplica), metadata.

### Changed

- `src/app/admin/(shell)/projects/[id]/page.tsx` — work item cards ahora tienen `<Link>` al detalle en lugar de texto plano.
- `updateProjectWorkItemStatusAction` refactorizado para usar el nuevo helper `applyStatusSideEffects`; comportamiento externo idéntico.

### Notes

- Sin cambios de DB — todos los campos ya existían en `project_work_items`.
- Sin nuevas dependencias.
- Ediciones sin cambio de status no llaman a lifecycle sync ni a la nota de soporte; solo persisten los campos.
- `previousStatus` se captura antes de la escritura (en la action, no en el use case) para garantizar que la detección de transición usa el valor realmente persisted antes del update.

## [0.39.0] - 2026-06-25

### Added

- `src/features/clients/domain/client.types.ts` — `UpdateClientInput`, `UpdateClientResult`, `ClientOperationalOverview`.
- `src/features/clients/application/update-client.use-case.ts` — actualiza todos los campos editables del cliente; valida existencia antes de persistir (Alternativa A); errores controlados ante fallos de IO.
- `src/features/clients/application/get-client-operational-overview.use-case.ts` — orquesta proyectos y tickets en paralelo (`Promise.all`); calcula en memoria: total/inDevelopment/paused/deployed de proyectos; total/open/escalatedToDevelopment de tickets; `latestRelatedActivityAt` como máximo de `updatedAt` entre proyectos y tickets (no incluye `client.updatedAt`). Devuelve además las listas crudas para que la página no necesite consultas adicionales.
- `src/features/support/application/get-support-tickets-by-client-id.use-case.ts` — wrapper reutilizable sobre `findByClientId`, con manejo de errores.
- `ClientRepository.update(id, input)` — nueva firma en interfaz e implementación Supabase.
- `SupportTicketRepository.findByClientId(clientId)` — nueva firma en interfaz e implementación Supabase (ordenado por `updated_at DESC`).
- `updateClientAction` en `admin-client.action.ts` — validación equivalente a creación: nombre requerido, status de enum, email con regex; opcionales normalizados a `null`.
- `src/components/admin/client-details-form.tsx` — formulario de edición con todos los campos, `useTransition`, errores inline.
- `src/components/admin/client-workspace.tsx` — `ClientWorkspaceProvider`, `EditClientButton` (se oculta al editar), `ClientDetailsSection` (read-only: empresa/rubro/notas; formulario full-width al editar).

### Changed

- `src/app/admin/(shell)/clients/[id]/page.tsx` — integra workspace en columna principal; botón "Editar cliente" en header; agrega sección tickets de soporte (título, estado, prioridad, updatedAt, link a detalle); sidebar con resumen operativo (conteos), contacto principal y metadata. Manejo de errores independiente por sección: si el overview falla el cliente sigue visible; no se inventan conteos en cero.

### Notes

- Sin cambios de DB — los campos y relaciones ya existían en `clients` y `support_tickets`.
- Sin nuevas dependencias.
- Cambios de status del cliente (active/paused/former) no modifican proyectos, tickets ni work items — cada lifecycle mantiene autoridad independiente.
- Semántica operativa centralizada en `get-client-operational-overview.use-case.ts`; `page.tsx` solo renderiza lo que recibe.
- Tickets abiertos = status ∉ {resolved, closed, cancelled}. Escalados a desarrollo ⊆ abiertos (subconjunto, no suma separada).

## [0.38.0] - 2026-06-25

### Added

- `src/features/projects/domain/project.types.ts` — `UpdateProjectInput`, `UpdateProjectResult`, `LifecycleWarning`.
- `src/features/projects/domain/project-lifecycle.ts` — función pura `computeLifecycleWarnings(project, workItems)` y constante `OPEN_WORK_ITEM_STATUSES` (backlog / ready / in_progress / blocked / review / testing).
- `src/features/projects/application/update-project.use-case.ts` — actualiza campos editables del proyecto; protege startDate existente contra sobrescritura por payload nulo; auto-setea startDate = hoy (America/Argentina/Buenos_Aires) al pasar a `in_development` solo si la fecha no estaba persistida.
- `src/features/projects/application/synchronize-project-lifecycle.use-case.ts` — avance automático conservador del estado del proyecto disparado por cambios en work items. Reglas: planning + work item → in_progress = proyecto a `in_development` (+ auto-startDate si era null); planning/in_development + sin ítems abiertos + al menos uno done = proyecto a `testing`. Toda la operación (lecturas y escritura) queda en try/catch para garantizar éxito parcial ante cualquier fallo secundario.
- `ProjectRepository.update(id, input)` — nueva firma en la interfaz e implementación Supabase.
- `updateProjectAction` en `admin-project.action.ts` — acción de servidor para edición manual; acepta cualquier `PROJECT_STATUS` válido (sin restricciones de transición manual); misma validación de fechas y enums que la acción de creación.
- `src/components/admin/project-workspace.tsx` — workspace pattern: `ProjectWorkspaceProvider`, `EditProjectButton` (aparece en header, se oculta con el formulario abierto), `ProjectDetailsSection` (read-only ↔ formulario en columna principal).
- `src/components/admin/project-details-form.tsx` — formulario de edición de proyecto (nombre, descripción, estado, fechas, notas); warning inline al seleccionar `testing`/`deployed` con work items abiertos; usa `useTransition`.

### Changed

- `updateProjectWorkItemStatusAction` — ahora llama `synchronizeProjectLifecycleUseCase` tras actualizar el work item; si el sync falla, devuelve `warning` (éxito parcial explícito) en lugar de fallar globalmente.
- `createProjectWorkItemAction` — ahora llama `synchronizeProjectLifecycleUseCase` tras crear el work item, cubriendo el caso de crear un ítem directamente en `in_progress` o `done`; firma actualizada a `{ error?: string; warning?: string }`.
- `src/components/admin/project-work-item-form.tsx` — maneja `warning` además de `error`: resetea el formulario ante éxito parcial y muestra el aviso en amarillo.
- `src/app/admin/(shell)/projects/[id]/page.tsx` — integra `ProjectWorkspaceProvider` y workspace en columna principal (primera sección); botón "Editar proyecto" en header junto al badge de estado; warnings pasivos de ciclo de vida en sidebar; metadata (fechas, timestamps) en sección separada.

### Notes

- Sin cambios de DB — toda la lógica opera sobre la tabla `projects` existente.
- Sin nuevas dependencias.
- La autoridad manual del administrador sobre los estados del proyecto está preservada: manual → cualquier valor válido. Solo las transiciones automáticas (vía work items) están restringidas a `planning → in_development` y `planning/in_development → testing`.
- El campo `fieldClass` en `project-details-form.tsx` está definido localmente porque `admin-field-styles.ts` vive en `fix/admin-form-interaction-polish`, aún no mergeado. Consolidar cuando ese branch se integre.

## [0.37.0] - 2026-06-25

### Added

- `supabase/migrations/20260625000000_add_support_tickets_escalated_work_item_unique_index.sql` — índice único parcial sobre `support_tickets.escalated_work_item_id` (solo `where ... is not null`): un work item de desarrollo no puede quedar vinculado a más de un ticket.
- `ProjectWorkItemRepository.findById()` / `.updateStatus()` (+ impl Supabase), `get-project-work-item-by-id.use-case.ts`, `update-project-work-item-status.use-case.ts` — el work item ahora tiene ciclo de vida propio de estado, antes solo se podía fijar al crear.
- `SupportTicketRepository.findByEscalatedWorkItemId()` (+ impl Supabase), `get-support-ticket-by-work-item.use-case.ts` — lookup inverso (work item → ticket de origen).
- `updateProjectWorkItemStatusAction` en `admin-project-work-item.action.ts` — cambia el estado del work item; si está vinculado a un ticket de soporte y el nuevo estado es `done`, agrega automáticamente una nota interna en el ticket (no cambia su status). Si la nota automática falla después de persistir el cambio de estado, la action devuelve un `warning` explícito en vez de fallar silenciosamente o revertir.
- `src/components/admin/project-work-item-status-form.tsx` — selector de estado por work item en `/admin/projects/[id]`, con feedback visible de error/warning.
- Guard server-side en `updateSupportTicketStatusAction`: si el ticket tiene un work item vinculado que sigue abierto (no `done`/`cancelled`), rechaza la transición a `resolved` con un mensaje explícito. La UI solo refleja esto (deshabilitando visualmente o mostrando el motivo) — el servidor es la única fuente de verdad.
- Nota automática de reapertura: al mover un ticket resuelto a un estado no terminal cuando tiene un work item vinculado, se agrega una nota interna indicando que el work item permanece cerrado (no se reabre automáticamente).
- `/admin/projects/[id]`: cada work item escalado desde soporte muestra un panel compacto "Origen: Soporte" (título + badge de estado del ticket + link "Ver ticket"). Sin duplicar notas de soporte en el proyecto.
- `/admin/support/[id]`: nueva sección de sidebar "Desarrollo vinculado" (título + estado del work item + link "Ver trabajo") para tickets escalados, y texto explicativo junto al selector de estado cuando la resolución está bloqueada.

### Changed

- `support-ticket-status-form.tsx`: ahora muestra feedback de error/warning devuelto por la action (antes era silencioso); necesario para que el nuevo guard de resolución sea visible al usuario.

### Notes

- Cerrar un work item nunca resuelve el ticket de soporte automáticamente, y reabrir un ticket nunca reabre el work item — ambos dominios permanecen independientes, según la regla del issue (`Work item done ≠ Support ticket resolved`).
- Se interpretó "work item terminal/completado" como `done` o `cancelled` (no solo `done`): un work item cancelado tampoco debería bloquear la resolución del ticket para siempre. Esta interpretación no está escrita literalmente en el issue — señalarlo en review.
- No existe una página de detalle dedicada por work item; el link "Ver trabajo" desde soporte apunta a `/admin/projects/[id]` (donde el work item se lista), no a una URL específica del item.
- El lookup de ticket de origen por work item (`/admin/projects/[id]`) es por-ítem (N consultas), no por lote — aceptable dado el volumen esperado de work items por proyecto en este MVP.
- Sin reescalación automática a un nuevo work item al reabrir, sin client portal, sin notificaciones externas, sin RBAC, sin cambios públicos/SEO/i18n.
- Verificado: `npm run lint`, `tsc --noEmit` y `npm run build` limpios. **No se validó visualmente en navegador** (sin sesión admin en este entorno) — recomendable revisión manual antes de mergear, especialmente: intento de resolver con work item abierto (debe rechazar), completar desarrollo y verificar la nota automática en el ticket, reabrir y verificar que el work item no cambia, y los paneles cruzados en desktop/mobile y dark/light.

## [0.36.0] - 2026-06-24

### Added

- `supabase/migrations/20260624000000_create_support_ticket_notes_table.sql` — nueva tabla `support_ticket_notes` (FK `ticket_id → support_tickets` con `on delete cascade`, índice compuesto `(ticket_id, created_at desc)`, RLS service-role-only). Append-only: sin edición ni borrado de notas.
- `src/features/support/domain/support-ticket-note.types.ts`, `support-ticket-note.schema.ts` — tipo `SupportTicketNote` y validación Zod (2-5000 caracteres).
- `src/features/support/infrastructure/support-ticket-note.repository.ts` (+ `supabase-support-ticket-note.repository.ts`), `src/features/support/application/create-support-ticket-note.use-case.ts`, `get-support-ticket-notes.use-case.ts` — capas application/infrastructure para notas, mismo patrón que `lead_notes`.
- `src/server/actions/support-ticket-note.action.ts` (`createSupportTicketNoteAction`) — gateado con `getAdminUser()`, revalida `/admin/support/[id]`.
- `src/components/admin/support-ticket-note-form.tsx`, `support-ticket-note-list.tsx` — composer y listado cronológico (más reciente primero) de notas internas.
- `UpdateSupportTicketDetailsInput/Result` en `support-ticket.types.ts`, método `updateDetails()` en `SupportTicketRepository` (+ impl Supabase), `update-support-ticket-details.use-case.ts`, action `updateSupportTicketDetailsAction` — permiten editar título, descripción, prioridad, categoría, fuente, reportado-por y proyecto de un ticket existente. `client_id` permanece inmutable.
- `src/components/admin/support-ticket-details-form.tsx`, `support-ticket-workspace.tsx` (`SupportTicketWorkspaceProvider`, `EditTicketButton`, `SupportTicketDetailsSection`) — controlador cliente con contexto compartido entre header (botón "Editar ticket") y columna principal (vista de solo lectura ↔ formulario full-width), siguiendo el mismo patrón que `lead-intent-workspace.tsx` de la v0.35.0.

### Changed

- `/admin/support/[id]`: la columna principal ahora incluye edición de detalles del ticket y una sección de "Notas internas" operativa (composer + listado), en vez del bloque estático de solo lectura. El sidebar conserva los controles compactos existentes (estado, prioridad/categoría, escalación, metadata) sin cambios.
- Una vez que un ticket tiene `escalated_work_item_id`, el campo `projectId` queda bloqueado en el formulario de edición y se ignora cualquier valor enviado — se muestra una nota explicando que los cambios posteriores no afectan el work item ya escalado.

### Notes

- La columna legacy `support_tickets.notes` se conserva sin cambios y se muestra como "Nota inicial" cuando existe; las notas nuevas usan exclusivamente `support_ticket_notes`. Sin migración destructiva de datos existentes.
- Sin tabla de eventos/auditoría general para `support_tickets` en esta release (MVP aceptado explícitamente) — la autoría/timestamp de cada nota interna actúa como auditoría a nivel de nota.
- Status, `resolved_at`, lógica de escalación (mapeo categoría → work item) y vínculos cliente/proyecto quedan sin cambios.
- Sin client portal, notas visibles al cliente, attachments, notificaciones, SLA, asignación/RBAC, dashboard ni cambios públicos/SEO/i18n.
- Verificado: `npm run lint`, `tsc --noEmit` y `npm run build` limpios. **No se validó visualmente en navegador** (sin sesión admin disponible en este entorno) — recomendable revisión manual de los flujos de edición, notas y bloqueo de proyecto post-escalación en desktop/mobile y dark/light antes de mergear.

## [0.35.0] - 2026-06-20

### Added

- `src/app/globals.css` — tokens de theming `--admin-*` (bg/surface/surface-hover/border/border-strong/text/text-secondary/text-muted/text-faint/accent/accent-foreground/danger/warning/success), registrados vía `@theme` como utilidades `bg-admin-*`/`text-admin-*`/`border-admin-*`. Dark por default (`:root`), light vía `[data-admin-theme="light"]`. Scoped solo al admin — el sitio público sigue usando `bg-slate-950` literal en `body`, sin cambios.
- `src/config/admin-nav.ts` — registro de navegación (`AdminNavItem`, dominios `crm`/`clients`/`delivery`/`support`/`system`, `futureRoles` como metadata para v0.37/v0.38, sin RBAC todavía).
- `src/components/admin/admin-shell.tsx`, `admin-sidebar.tsx`, `admin-topbar.tsx`, `theme-toggle.tsx` — shell compartido: sidebar desktop agrupado por dominio con highlight de ruta activa, topbar mobile con menú desplegable, toggle de tema persistido en `localStorage`. Sign-out centralizado ahí (antes repetido en cada página).
- `src/components/admin/admin-page-header.tsx`, `admin-card.tsx` (+ `AdminSection`), `admin-empty-state.tsx`, `admin-detail-layout.tsx` — primitivos visuales reutilizables usados en las 8 pantallas foco.
- `src/app/admin/(shell)/layout.tsx` — layout compartido que llama `verifyAdmin()` una sola vez para las 4 secciones (antes duplicado en ~11 páginas) y renderiza `AdminShell`.

### Changed

- **Reestructuración de rutas**: `leads/`, `clients/`, `projects/`, `support/` se movieron a `src/app/admin/(shell)/` (route group de Next.js — las URLs no cambian). `admin/login` queda afuera del grupo, sin shell ni theming (es pre-auth).
- **Layout de detalle a dos columnas** en `/admin/leads/[id]`, `/admin/clients/[id]`, `/admin/projects/[id]`, `/admin/support/[id]`: header de ancho completo + grid desktop (contenido principal a la izquierda, estado/workflow/acciones/metadata a la derecha), una sola columna en mobile.
- **Listados** (`/admin/leads`, `/admin/clients`, `/admin/projects`, `/admin/support`): `AdminPageHeader` + `AdminEmptyState` consistentes, filas de tabla con más padding vertical para legibilidad.
- **Migración completa de tokens** en los ~18 componentes admin restantes (forms, selectors, filters, activity feed, summary cards, panels) — clases `slate-*` literales reemplazadas por `admin-*`.
- `src/components/admin/lead-detail-section.tsx` eliminado — superado por `AdminSection`, genérico para los 4 dominios.

### Notes

- **Excepción deliberada al "migración completa"**: los 4 componentes de badge (`lead-status-badge`, `client-status-badge`, `project-status-badge`, `support-ticket-badges`) y los mapas de color por-enum en `lead-summary-cards.tsx` y la página de detalle de proyecto (work items) **quedan con sus tonos literales** (cyan/blue/green/violet/amber/emerald/red/slate). Son tintes translúcidos que distinguen 3-8 valores de un enum — funcionan igual de bien en light y dark por construcción, y tokenizar cada tono por separado para ambos modos sería sobre-ingeniería sin beneficio visual real.
- Sin DB migrations, sin RBAC real, sin gestión de usuarios/equipo, sin dashboard, sin charts, sin nuevas entidades, sin client portal, sin cambios públicos/SEO/i18n, sin tocar lógica de negocio (conversión de leads, escalación de soporte, creación de proyectos: sin cambios).
- Verificado: build/lint/typecheck limpios; las 11 rutas de detalle/listado/creación redirigen correctamente a `/admin/login` sin sesión (regresión tras el move a `(shell)/`); cero errores de consola en login y home pública (screenshots tomados).
- **Limitación de testing importante**: no pude verificar visualmente el shell, sidebar, topbar ni los layouts de dos columnas en un navegador real — requieren sesión admin autenticada, credenciales no disponibles en este entorno. Todo lo que renderiza después del login (es decir, el contenido real de esta release) no fue visto rendereado, solo compilado. Recomiendo una revisión visual manual antes de mergear, en desktop y mobile, con foco en: contraste del toggle de tema en ambos modos, que el sidebar/topbar no se rompan en pantallas chicas, y que el grid de dos columnas colapse bien en mobile.

## [0.34.0] - 2026-06-20

### Added

- `supabase/migrations/20260623000000_add_lead_conversion_fields.sql` — agrega `converted_to_client` (boolean, default `false`), `converted_client_id`/`converted_project_id` (FK a `clients`/`projects`, `ON DELETE SET NULL`), `converted_at`, `converted_by` a `leads`. Índices en las tres primeras.
- `supabase/migrations/20260623010000_extend_lead_events_type_check_conversion.sql` — extiende el CHECK de `lead_events.type` para aceptar `converted_to_client` y `converted_to_project`.
- `src/features/leads/application/convert-lead-to-client.use-case.ts` — solo persiste la metadata de conversión en el lead; crear el cliente (y el proyecto opcional) son use-cases/repositorios aparte, orquestados desde la server action (mismo criterio que `escalateSupportTicketUseCase` de v0.33.0).
- `src/server/actions/admin-lead.action.ts` — `convertLeadToClientAction`: exige elegibilidad (`status === "qualified"` Y `qualifiedStage` en `accepted`/`project_started`) y que no esté ya convertido; mapea lead→cliente (`fullName`/`company` → `name`, `fullName` → `contact_name`, `email` → `contact_email`, `whatsapp` → `contact_phone`, `industry` → `industry`, `status` → `"active"`, nota de origen breve); si se pide, crea además un proyecto inicial (nombre del admin o `processToImprove`, descripción desde `currentProblem`, estado `planning`/`discovery`). Registra eventos `converted_to_client`/`converted_to_project`.
- `src/components/admin/lead-conversion-panel.tsx` — card "Conversión a cliente" en `/admin/leads/[id]`: no renderiza nada para leads no elegibles y no convertidos; muestra links de solo lectura al cliente/proyecto si ya se convirtió; muestra el formulario (con checkbox opcional "crear proyecto inicial") si es elegible.

### Notes

- El puente entre CRM y Client/Project Management (issue #52). Guardrail respetado: el lead nunca se transforma — sigue como historial comercial con una referencia al cliente creado a partir de él.
- **Manejo de fallo parcial** (tal como lo pedía el issue): si la creación del proyecto falla después de crear el cliente, el lead igual queda marcado como convertido (con `converted_project_id = null`), y se devuelve un error controlado en vez de perder el cliente silenciosamente.
- Sin client portal, sin repositorios/entornos, sin work items, sin tickets de soporte, sin GitHub API, sin billing, sin conversión automática, sin conversión de leads no calificados, sin rediseño UX grande.
- Sin cambios públicos/SEO/i18n, sin cambios al CSV export de leads.
- No hay rutas nuevas — todo vive en `/admin/leads/[id]`, ya cubierto por el gate de auth verificado en releases anteriores.

## [0.33.0] - 2026-06-20

### Added

- `supabase/migrations/20260622020000_add_support_ticket_escalation_fields.sql` — agrega `escalated_work_item_id` (FK a `project_work_items`, `ON DELETE SET NULL`), `escalated_at` y `escalated_by` a `support_tickets`. Índices en ambas columnas de fecha/FK.
- `src/features/support/application/update-support-ticket-status.use-case.ts`, `escalate-support-ticket.use-case.ts` — el segundo solo persiste metadata de escalación en el ticket; crear el `project_work_item` es un use-case/repositorio aparte, orquestado desde la server action (mismo criterio que el resto del código para flujos multi-repositorio).
- `src/server/actions/admin-support-ticket.action.ts` — `updateSupportTicketStatusAction`: valida el enum, no escribe si el estado es idéntico, y maneja `resolved_at` correctamente (se setea al entrar a `resolved`, se limpia al salir). `escalateSupportTicketAction`: exige que el ticket no esté ya escalado, que tenga `project_id`, y que el proyecto exista y pertenezca al cliente del ticket; mapea categoría de ticket → categoría de work item (`bug_report`/`incident` → `bug`, `change_request` → `improvement`, `configuration` → `task`, el resto — `question`/`training`/`billing`/`access_issue` — → `support_escalation`, la categoría de work item que existe específicamente para esto); crea el work item en `backlog` con la prioridad del ticket.
- `src/components/admin/support-ticket-status-form.tsx` — reemplaza el badge estático de estado en `/admin/support/[id]` por un selector (mismo patrón que `LeadStatusSelector`).
- `src/components/admin/support-ticket-escalation-panel.tsx` — card "Escalación a desarrollo" con 3 estados: sin proyecto (informativo), ya escalado (de solo lectura, con link al proyecto donde vive el work item — no hay página propia de work item), o elegible (botón de escalar).

### Notes

- Primer workflow real de soporte (issue #58). Guardrail respetado: un ticket de soporte no se transforma en work item — crea/linkea uno, pero sigue existiendo como caso de soporte.
- El mapeo de categorías es una decisión de diseño propia (el issue solo daba 2 ejemplos): las categorías con equivalente técnico claro mantienen esa forma (`bug`/`improvement`/`task`); las que no tienen equivalente limpio caen en `support_escalation`, que ya existía desde v0.31.0 con ese propósito exacto.
- Si la creación del work item tiene éxito pero el update de escalación del ticket falla, se devuelve un error explícito indicando que el work item ya se creó — no hay rollback automático (no existe infraestructura de transacciones cross-repository en este MVP).
- Sin audit trail completo, sin notas de soporte, sin attachments, sin ingestion de email/WhatsApp, sin client portal, sin SLA timers, sin asignación, sin Kanban de soporte, sin editar cliente/proyecto del ticket, sin link a un work item ya existente, sin GitHub API, sin conversión de leads.
- Sin cambios públicos/SEO/i18n. No hay rutas nuevas — todo vive en `/admin/support/[id]`, ya cubierto por el gate de auth verificado en v0.32.0. La sección "Work items" de `/admin/projects/[id]` (desde v0.31.0) ya muestra los work items creados por escalación, sin cambios adicionales.

## [0.32.0] - 2026-06-19

### Added

- `supabase/migrations/20260622010000_create_support_tickets_table.sql` — tabla `support_tickets`: `client_id` (FK a `clients`, `ON DELETE RESTRICT` — es un registro de negocio real, no metadata), `project_id` opcional (FK a `projects`, `ON DELETE SET NULL`), `source`/`category`/`status`/`priority` con CHECK y defaults (`manual`/`question`/`new`/`medium`), `resolved_at` reservado para uso futuro (sin workflow de cambio de estado todavía). Índices en `client_id`, `project_id`, `status`, `category`, `priority` y `created_at desc` — los seis desde el arranque, después del review de v0.31.0 que señaló índices faltantes.
- `src/features/support/domain/support-ticket.types.ts` — `SupportTicket`, `TICKET_SOURCES`, `TICKET_CATEGORIES`, `TICKET_STATUSES`, `TICKET_PRIORITIES` y tipos asociados.
- `src/features/support/infrastructure/support-ticket.repository.ts` / `supabase-support-ticket.repository.ts`, `application/create-support-ticket.use-case.ts`, `get-support-tickets.use-case.ts`, `get-support-ticket-by-id.use-case.ts` — mismo patrón que `clients`/`projects` (`create`, `findAll`, `findById`; sin `findByClientId`, no lo necesita nada todavía).
- `src/server/actions/admin-support-ticket.action.ts` — `createSupportTicketAction`: valida que `clientId` exista, y si se manda `projectId`, que el proyecto exista **y pertenezca al cliente seleccionado** (no cualquier proyecto). Valida los 4 enums server-side, persiste opcionales vacíos como `null`. Usa `useActionState` igual que `clients`/`projects`, redirige a `/admin/support/[id]` al crear.
- `src/components/admin/support-ticket-badges.tsx` — `TicketStatusBadge`, `TicketPriorityBadge`, `TicketCategoryBadge` (componente separado, sugerido explícitamente por el issue — a diferencia de los work items, los tickets se muestran tanto en el listado como en el detalle).
- `src/components/admin/support-ticket-form.tsx` — formulario de creación; el select de "Proyecto" se filtra en el cliente según el cliente elegido, para que sea difícil llegar a un mismatch antes de la validación server-side.
- `src/app/admin/support/page.tsx`, `new/page.tsx`, `[id]/page.tsx` — listado, creación (con guardia de "no hay clientes todavía") y detalle de solo lectura con links al cliente y al proyecto asociado.

### Notes

- Primer módulo del dominio Support/Post-delivery Operations (issue #56, ver `docs/internal-operations-architecture.md`). Support no es Development: un ticket no es un work item.
- Sin escalación a work item, sin link a work item, sin notas de soporte, sin audit trail, sin attachments, sin ingestion de email/WhatsApp, sin client portal, sin workflow de cambio de estado, sin SLA timers, sin asignación/responsables.
- Sin conversión lead→cliente (eso es v0.34.0, issue #52 — leído solo como contexto futuro, no implementado).
- Sin cambios públicos/SEO/i18n. Verificado regresión en leads/clients/projects (lint/build/typecheck sobre todo el proyecto).
- Verificado en navegador headless: `/admin/support`, `/admin/support/new` y `/admin/support/[id]` redirigen correctamente a `/admin/login` sin sesión.

## [0.31.0] - 2026-06-19

### Added

- `supabase/migrations/20260622000000_create_project_work_items_table.sql` — tabla `project_work_items`: `category` (CHECK con 7 valores, default `'task'`), `status` (CHECK con 8 valores, default `'backlog'`), `priority` (CHECK con 4 valores, default `'medium'`), `title` requerido, `description`/`notes` nullable. FK a `projects` `ON DELETE CASCADE`, mismo criterio que repositorios/entornos. RLS habilitado, sin políticas públicas.
- `src/features/projects/domain/project-work-item.types.ts` — `ProjectWorkItem`, `WORK_ITEM_CATEGORIES`, `WORK_ITEM_STATUSES`, `WORK_ITEM_PRIORITIES` y tipos asociados.
- `src/features/projects/infrastructure/project-work-item.repository.ts` / `supabase-project-work-item.repository.ts`, `application/create-project-work-item.use-case.ts`, `get-project-work-items.use-case.ts` — mismo patrón que repositorios/entornos, scoped por `project_id`.
- `src/server/actions/admin-project-work-item.action.ts` — `createProjectWorkItemAction`: re-valida que el proyecto exista, valida los 3 enums server-side, persiste opcionales vacíos como `null`.
- `src/components/admin/project-work-item-form.tsx` — formulario inline (mismo patrón `useTransition` + `revalidatePath` que repositorios/entornos) en la nueva sección "Work items" de `/admin/projects/[id]`: contador, empty state, lista (título, badges de categoría/estado/prioridad, preview de descripción, fecha) y alta.

### Notes

- Cuarto módulo del dominio Delivery/Projects (issue #54, ver `docs/internal-operations-architecture.md`). Primer flujo tipo Jira liviano, pero propio de Arkanum — sin Kanban, sin GitHub issue/PR sync, sin asignaciones, sin due dates, sin estimates/time tracking, sin comments, sin audit trail en este MVP.
- Sin tickets de soporte, sin conversión lead-to-client/project (eso es v0.34.0, ver issue #52 — explícitamente no es parte de esta release), sin releases.
- Sin edición ni borrado (solo alta), igual que repositorios/entornos. Sin cambios públicos/SEO/i18n, sin CSV export, sin notificaciones.
- No hay rutas nuevas — todo vive como sección dentro de `/admin/projects/[id]`, ya cubierto por el gate de auth verificado en v0.29.0.

## [0.30.0] - 2026-06-19

### Added

- `supabase/migrations/20260621010000_create_project_repositories_and_environments.sql` — tablas `project_repositories` (`provider` CHECK `github`/`other`, `name`/`repo_url` requeridos, `owner`/`default_branch`/`notes` nullable) y `project_environments` (`type` CHECK con 5 valores, `status` CHECK con 3 valores, `url`/`notes` nullable). Ambas con FK a `projects` `ON DELETE CASCADE` (son metadata que pertenece al proyecto, a diferencia de `projects → clients` que es `RESTRICT`). RLS habilitado, sin políticas públicas.
- `src/features/projects/domain/project-repository-link.types.ts` — `ProjectRepositoryLink`, `REPOSITORY_PROVIDERS`, `RepositoryProvider`, `CreateProjectRepositoryLinkInput/Result`.
- `src/features/projects/domain/project-environment.types.ts` — `ProjectEnvironment`, `ENVIRONMENT_TYPES`, `ENVIRONMENT_STATUSES`, tipos asociados.
- `src/features/projects/infrastructure/project-repository-link.repository.ts` / `supabase-project-repository-link.repository.ts` y los equivalentes de `project-environment` — mismo patrón que el resto del dominio, con `findByProjectId` (no hay listado global, solo scoped al proyecto).
- `src/features/projects/application/create-project-repository-link.use-case.ts`, `get-project-repository-links.use-case.ts`, `create-project-environment.use-case.ts`, `get-project-environments.use-case.ts`.
- `src/server/actions/admin-project-metadata.action.ts` — `createProjectRepositoryAction`/`createProjectEnvironmentAction`: re-validan que el proyecto exista server-side, validan enums y URL `http(s)` (vía `new URL()`), persisten strings opcionales vacíos como `null`.
- `src/components/admin/project-repository-form.tsx`, `project-environment-form.tsx` — formularios inline (patrón `LeadNoteForm`: `useTransition` + `revalidatePath`, sin redirect) en las nuevas secciones "Repositorios" y "Entornos" de `/admin/projects/[id]`.

### Notes

- Tercer módulo del dominio Delivery/Projects (issue #51, ver `docs/internal-operations-architecture.md`). Un repositorio no es un proyecto, un entorno no es un proyecto — ambos son metadata operativa manual que pertenece al proyecto.
- **Desviación del naming sugerido por el issue**: la entidad "repo vinculado a un proyecto" se llama `ProjectRepositoryLink`, no `ProjectRepository` como sugería el issue — ese nombre ya lo usa la interfaz de persistencia del entity `Project` (`infrastructure/project.repository.ts`, desde v0.29.0), y ambos se importan juntos en las mismas páginas/actions.
- Sin GitHub API, sin OAuth, sin webhooks, sin sync de PRs/issues, sin work items, sin releases, sin tickets de soporte, sin conversión lead-to-project, sin miembros/responsables de proyecto.
- Sin edición ni borrado (solo alta) de repositorios/entornos en esta release. Sin cambios públicos/SEO/i18n, sin CSV export, sin notificaciones.
- No hay rutas nuevas — todo vive como secciones dentro de `/admin/projects/[id]`, ya cubierto por el gate de auth verificado en v0.29.0.

## [0.29.0] - 2026-06-19

### Added

- `supabase/migrations/20260621000000_create_projects_table.sql` — tabla `projects`: `client_id` (FK a `clients`, `ON DELETE RESTRICT`), `name` (requerido), `description`/`start_date`/`target_date`/`notes` (nullable), `status` (default `'planning'`, CHECK con 8 valores: `discovery`, `planning`, `in_development`, `testing`, `deployed`, `maintenance`, `paused`, `cancelled`). Mismo trigger `set_updated_at()` que `leads`/`clients`. Índices por `client_id`, `status` y `created_at`. RLS habilitado, sin políticas públicas.
- `src/features/projects/domain/project.types.ts` — `Project`, `PROJECT_STATUSES`, `ProjectStatus`, `CreateProjectInput`, `CreateProjectResult`.
- `src/features/projects/infrastructure/project.repository.ts` / `supabase-project.repository.ts` — mismo patrón que `clients`, con `findByClientId` adicional para la integración en el detalle del cliente.
- `src/features/projects/application/get-projects.use-case.ts`, `get-project-by-id.use-case.ts`, `get-projects-by-client-id.use-case.ts`, `create-project.use-case.ts`.
- `src/lib/validation/calendar-date.ts` — `isValidCalendarDate`, extraída de `admin-lead.action.ts` (validación estricta de fecha calendario que rechaza fechas imposibles como `2026-02-31`) para reutilizarla en `projects`.
- `src/server/actions/admin-project.action.ts` — `createProjectAction`: valida que `clientId` referencie un cliente existente, `name` (requerido, trim, máx. 200 caracteres), `status` (debe ser uno de `PROJECT_STATUSES`), formato de `startDate`/`targetDate` (vía `isValidCalendarDate`), y rechaza `targetDate` anterior a `startDate`. Usa `useActionState` igual que `clients`, redirige a `/admin/projects/[id]` al crear con éxito.
- `src/components/admin/project-status-badge.tsx`, `project-create-form.tsx`.
- `src/app/admin/projects/page.tsx` — listado con nombre de cliente resuelto vía lookup, botón "Crear proyecto" y empty state "Todavía no hay proyectos registrados.".
- `src/app/admin/projects/new/page.tsx` — formulario de creación; si no hay clientes todavía, muestra mensaje y link para crear el primero (un proyecto siempre necesita un cliente).
- `src/app/admin/projects/[id]/page.tsx` — detalle de solo lectura con link al cliente asociado.

### Changed

- `src/app/admin/clients/[id]/page.tsx` — agrega sección "Proyectos" mínima: lista los proyectos del cliente (nombre + badge de estado) y un link "Crear proyecto" que precompleta `clientId` por query param en `/admin/projects/new`.
- `src/server/actions/admin-lead.action.ts` — usa `isValidCalendarDate` desde la lib compartida en vez de la función local duplicada.

### Notes

- Segundo módulo del dominio Delivery/Projects (issue #49, ver `docs/internal-operations-architecture.md`). Un proyecto pertenece a un cliente, no es un lead, no es un ticket de soporte, no es un repositorio de GitHub — es el contenedor business/delivery del trabajo vendido.
- Sin repositorios/entornos, sin work items, sin releases, sin tickets de soporte, sin conversión lead-to-client/project, sin integración GitHub API, sin miembros/responsables de proyecto, sin audit trail de proyectos.
- Sin cambios públicos/SEO/i18n, sin CSV export, sin notificaciones, sin facturación.
- Verificado en navegador headless: `/admin/projects`, `/admin/projects/new` y `/admin/projects/[id]` redirigen correctamente a `/admin/login` sin sesión. No pude verificar el flujo de creación/listado real con datos — requiere sesión admin no disponible en este entorno.

## [0.28.0] - 2026-06-19

### Added

- `supabase/migrations/20260620010000_create_clients_table.sql` — tabla `clients`: `name` (text, requerido), `company`/`contact_name`/`contact_email`/`contact_phone`/`industry`/`notes` (text, nullable), `status` (default `'active'`, CHECK `active`/`paused`/`former`), `created_at`/`updated_at` con el mismo trigger `set_updated_at()` que ya usaba `leads`. Índices `clients_status_idx` y `clients_created_at_idx`. RLS habilitado, sin políticas públicas.
- `src/features/clients/domain/client.types.ts` — `Client`, `CLIENT_STATUSES`, `ClientStatus`, `CreateClientInput`, `CreateClientResult`.
- `src/features/clients/infrastructure/client.repository.ts` / `supabase-client.repository.ts` — mismo patrón que `LeadRepository`/`SupabaseLeadRepository`.
- `src/features/clients/application/get-clients.use-case.ts`, `get-client-by-id.use-case.ts`, `create-client.use-case.ts`.
- `src/server/actions/admin-client.action.ts` — `createClientAction`: valida `name` (requerido, trim, máx. 200 caracteres), `status` (debe ser uno de `CLIENT_STATUSES`) y formato de `contactEmail` (solo si se completa); strings opcionales vacíos persisten como `null`. Usa `useActionState` igual que el login de admin, y redirige a `/admin/clients/[id]` al crear con éxito.
- `src/components/admin/client-create-form.tsx`, `client-status-badge.tsx`.
- `src/app/admin/clients/page.tsx` — listado con botón "Crear cliente" y empty state "Todavía no hay clientes registrados.".
- `src/app/admin/clients/new/page.tsx` — formulario de creación.
- `src/app/admin/clients/[id]/page.tsx` — detalle de solo lectura (contacto, email, teléfono, rubro, notas, creado/actualizado).

### Notes

- Primer módulo real del dominio Client Management (issue #47, ver `docs/internal-operations-architecture.md`). Un cliente es una entidad nueva creada manualmente desde admin — **no** es un lead editado. La conversión lead → cliente queda para v0.34.0.
- Sin conversión lead-to-client, sin proyectos, sin repositorios/entornos, sin work items, sin tickets de soporte, sin portal cliente, sin integración GitHub API, sin audit trail, sin edición de cliente (solo alta), sin notificaciones, sin facturación.
- Sin cambios públicos/SEO/i18n, sin tocar CSV export de leads, sin regresión en leads (lint/build/typecheck verificados sobre todo el proyecto, no solo el módulo nuevo).
- Verificado en navegador headless: `/admin/clients`, `/admin/clients/new` y `/admin/clients/[id]` redirigen correctamente a `/admin/login` sin sesión. No pude verificar el flujo de creación/listado real con datos — requiere sesión admin no disponible en este entorno.

## [0.27.0] - 2026-06-19

### Added

- `docs/internal-operations-architecture.md` — arquitectura de los 4 dominios operativos internos (Commercial/CRM, Client Management, Delivery/Projects, Support/Post-delivery): decisiones cerradas ("CRM vende, Delivery construye, Support sostiene"; Support no es development; sin Jira; GitHub híbrido), modelo de work items y de tickets de soporte, concepto de conversión lead → cliente/proyecto, boundaries explícitos entre dominios, y el roadmap completo v0.28.0 a v0.35.0.

### Notes

- Release de documentación únicamente (issue #45): sin migrations, sin tablas nuevas, sin rutas admin nuevas, sin UI nueva, sin integración GitHub API, sin Jira, sin módulos de cliente/proyecto/soporte implementados, sin cambios públicos/SEO/i18n.
- Esta pausa documental precede a v0.28.0 (Internal Clients Foundation) — el roadmap completo queda fijado en el documento antes de la primera migration de un dominio nuevo.

## [0.26.0] - 2026-06-19

### Added

- `supabase/migrations/20260620000000_extend_lead_events_type_check_intent_fields.sql` — extiende el CHECK de `lead_events.type` para aceptar `intent_fields_updated`. Sin columnas nuevas en `leads` (los 4 campos ya existían).
- `src/features/leads/domain/lead.types.ts` — `LeadIntentFieldsInput`, `UpdateLeadIntentFieldsResult`.
- `src/features/leads/application/update-lead-intent-fields.use-case.ts` — mismo patrón que los demás use-cases de update.
- `src/components/admin/lead-intent-fields-form.tsx` — Client Component. 4 selects (Rubro, Tamaño de empresa, Urgencia, Presupuesto) usando los enums existentes de `lead.schema.ts`. Card "Editar intención" en `/admin/leads/[id]`, después de "Contexto operativo".
- `src/server/actions/admin-lead.action.ts` — nueva `updateLeadIntentFieldsAction`: valida los 4 valores contra sus enums server-side (rechaza cualquier valor fuera de `INDUSTRY_OPTIONS`/`COMPANY_SIZE_OPTIONS`/`URGENCY_OPTIONS`/`BUDGET_OPTIONS`), guard anti-duplicado (sin escritura ni evento si nada cambió), registra evento `intent_fields_updated` con snapshot antes/después de los 4 campos en `from_status`/`to_status`.

### Changed

- `src/features/leads/infrastructure/lead.repository.ts` / `supabase-lead.repository.ts` — agregan `updateIntentFields(id, input)`.
- `src/components/admin/lead-activity-feed.tsx` — agrega rama de render para eventos `intent_fields_updated` (bloque "antes/después" con el snapshot guardado).

### Notes

- Solo edición manual de campos existentes (issue #43): sin nuevos campos de lead, sin cambios al formulario público, sin migration en `leads` (solo se extendió el CHECK de `lead_events`), sin CRM automation, sin reminders/notifications/assignments/kanban.
- Sin cambios públicos/SEO/i18n. Filtros y CSV export sin tocar.
- No afecta los workflows de estado, etapa calificada ni seguimiento — son cards independientes.
- No pude verificar visualmente en navegador — `/admin/leads/[id]` requiere sesión admin no disponible en este entorno.

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
