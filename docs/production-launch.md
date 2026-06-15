
# Production Launch Checklist — Arkanum

## Cómo usar este documento

Recorré cada sección en orden antes del primer deploy a producción con tráfico real. Marcá cada item cuando esté confirmado. No avances al siguiente bloque si hay items sin resolver en el anterior.

El objetivo no es perfección — es no lanzar con errores básicos que rompan el flujo de captura de leads.

---

## 1. Vercel

- [ ] Proyecto conectado al repositorio GitHub correcto (`JonatanTorres94/Arkanum`)
- [ ] `main` apunta a producción — verificar en **Settings → Git**
- [ ] Build pasa sin errores (`npm run build` limpio localmente antes de cualquier push)
- [ ] Todas las variables de entorno seteadas en **Settings → Environment Variables** para el entorno **Production**
- [ ] `NEXT_PUBLIC_SITE_URL` apunta al dominio real (no a `arkanum.vercel.app` si tenés dominio propio)
- [ ] Preview deployments habilitados para PRs (activo por default, verificar que no esté desactivado)
- [ ] Dominio configurado en **Settings → Domains** y con certificado SSL activo

**Variables de entorno requeridas en Vercel Production:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
LEAD_NOTIFICATION_TO
LEAD_NOTIFICATION_FROM
ADMIN_EMAILS
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID   ← opcional pero recomendado desde el primer día
```

---

## 2. Supabase

- [ ] Proyecto de Supabase apunta a producción (no al local ni a un proyecto de staging)
- [ ] Las tres migraciones aplicadas en orden:
  - `20260613000000_create_leads_table.sql`
  - `20260614000000_add_lead_status_check.sql`
  - `20260614010000_create_lead_notes_table.sql`
- [ ] RLS habilitado en `leads` y `lead_notes` — verificar en **Table Editor → RLS**
- [ ] No existen políticas públicas de lectura/escritura en ninguna tabla
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo usada en server-side (nunca en `NEXT_PUBLIC_*`)
- [ ] Al menos un usuario admin creado en **Authentication → Users** con el email que figura en `ADMIN_EMAILS`
- [ ] Verificar que el usuario admin puede loguearse en `/admin/login` en el deploy de producción

**Nota sobre RLS:** las migraciones habilitan RLS pero no crean políticas públicas. El acceso al dashboard usa el `service role key` server-side. Si agregás políticas en el futuro, revisarlas cuidadosamente.

---

## 3. Resend

- [ ] API key generada en [Resend](https://resend.com) y seteada en `RESEND_API_KEY`
- [ ] Dominio verificado en Resend (DNS: SPF, DKIM configurados)
- [ ] `LEAD_NOTIFICATION_FROM` usa el dominio verificado (ej: `leads@tudominio.com`)
- [ ] `LEAD_NOTIFICATION_TO` es el email donde querés recibir notificaciones de nuevos leads
- [ ] Enviar un email de prueba desde el panel de Resend para confirmar que el dominio funciona
- [ ] Si no configurás Resend todavía: el submit del formulario igual funciona — el email se saltea con un `warn` en logs. No es un bloqueante para el lanzamiento.

---

## 4. Admin

- [ ] `/admin/login` carga correctamente en producción
- [ ] Login con las credenciales del usuario admin funciona
- [ ] `/admin/leads` muestra la lista de leads (puede estar vacía al inicio)
- [ ] Detalle de un lead carga correctamente
- [ ] Cambio de estado de un lead funciona
- [ ] Agregar una nota interna funciona
- [ ] Cerrar sesión redirige a `/admin/login`
- [ ] Un usuario sin email en `ADMIN_EMAILS` es redirigido al login (probar con otro browser o sesión)

---

## 5. SEO

- [ ] `NEXT_PUBLIC_SITE_URL` seteado con el dominio definitivo — afecta sitemap, canonical URLs y Open Graph
- [ ] `/sitemap.xml` accesible y muestra las 4 URLs públicas correctas
- [ ] `/robots.txt` accesible, `Disallow: /admin/` y `Disallow: /gracias` presentes
- [ ] Verificar que Open Graph funciona: pegar la URL en [opengraph.xyz](https://www.opengraph.xyz) o en Slack/WhatsApp
- [ ] Propiedad verificada en [Google Search Console](https://search.google.com/search-console) — ver `docs/analytics.md` para instrucciones
- [ ] Sitemap enviado desde Search Console: `https://tudominio.com/sitemap.xml`

---

## 6. Analytics

- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` seteado en Vercel con el ID real de GA4
- [ ] Vercel Analytics mostrando datos (puede tardar unas horas después del primer tráfico)
- [ ] Verificar GA4 en **DebugView**: abrir el sitio y confirmar que aparecen los eventos `page_view`
- [ ] Hacer click en el CTA de home → confirmar `cta_diagnostic_click` en DebugView
- [ ] Enviar el formulario de diagnóstico de prueba → confirmar `diagnostic_submit_success` en DebugView
- [ ] GA4 vinculado con Search Console — ver `docs/analytics.md`

---

## 7. Smoke tests

Ejecutar después del primer deploy a producción con tráfico real. Usar una sesión de incógnito para simular un visitante nuevo.

**Páginas públicas:**

- [ ] `/` — home carga, sin errores de consola
- [ ] `/software-a-medida` — carga, FAQ visible
- [ ] `/automatizacion-de-procesos` — carga, FAQ visible
- [ ] `/sitemap.xml` — devuelve XML con 4 URLs
- [ ] `/robots.txt` — devuelve texto plano con las reglas correctas

**Formulario:**

- [ ] `/diagnostico` — formulario carga con todos los campos
- [ ] Intentar enviar sin campos requeridos → errores de validación visibles
- [ ] Completar el formulario completo y enviar → redirige a `/gracias`
- [ ] Verificar que el lead aparece en `/admin/leads` con estado `new`
- [ ] Verificar que llegó el email de notificación (si Resend está configurado)

**Admin:**

- [ ] `/admin/login` — login funciona
- [ ] `/admin/leads` — el lead de prueba aparece
- [ ] `/admin/leads/[id]` — detalle del lead de prueba carga
- [ ] Cambiar estado del lead de prueba a `contacted`
- [ ] Agregar nota al lead de prueba

**Seguridad:**

- [ ] `/admin/leads` sin sesión → redirige a `/admin/login` (no muestra datos)
- [ ] `/gracias` directo (sin venir del form) — verifica que no hay datos sensibles expuestos

---

## 8. Rollback

Antes de lanzar, identificar el punto de rollback:

- [ ] Anotar el SHA del último commit estable en `main`: `git log --oneline -5`
- [ ] Vercel guarda los últimos deploys — en el dashboard podés hacer **Redeploy** a cualquier deploy anterior en segundos
- [ ] En caso de emergencia: identificar el deploy previo en **Deployments** y hacer **Promote to Production**

No es necesario preparar nada extra — Vercel tiene rollback instantáneo desde el dashboard.

---

## 9. Validación post-deploy (primeras 48 h)

- [ ] Monitorear **Vercel → Logs** por errores 500 o excepciones inesperadas
- [ ] Monitorear **Supabase → Logs → API** por errores de insert o de autenticación
- [ ] Verificar que el primer lead real fue capturado correctamente en el dashboard
- [ ] Verificar delivery del email de notificación en **Resend → Logs → Emails**
- [ ] Revisar **Vercel Analytics** a las 24h — confirmar que se están registrando visitas
- [ ] Confirmar que `/sitemap.xml` fue procesado por Search Console (puede tardar 1–2 días)

---

## Notas de arquitectura relevantes para producción

**Rate limiter in-memory**: El límite de 5 envíos por IP en ventanas de 15 minutos se reinicia en cada cold start de Vercel. Es suficiente para el MVP. Si hay abuso real, reemplazar con Upstash Redis o similar.

**Service role key**: Solo se usa server-side (`src/features/leads/infrastructure/supabase-lead.repository.ts`, `src/server/actions/`). Nunca debe aparecer como `NEXT_PUBLIC_*`.

**Email opcional en launch**: Si no configurás Resend antes del lanzamiento, los leads igual se guardan en Supabase. Solo no llegará la notificación. El fix de v0.11.1 garantiza que un email fallido no rompe el submit.

**Admin whitelist**: `ADMIN_EMAILS` es una lista separada por comas. Si agregás otro admin en el futuro, solo hay que agregar su email a la variable y crear el usuario en Supabase Auth.
