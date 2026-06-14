
# Analytics y Medición — Arkanum

## Decisión

Arkanum usa dos capas de medición con propósitos distintos:

| Herramienta | Propósito | Estado |
|---|---|---|
| **Vercel Analytics** | Tráfico de páginas, visitantes únicos, referrers | Activo siempre |
| **Vercel Speed Insights** | Core Web Vitals, performance real por dispositivo | Activo siempre |
| **Google Analytics 4** | Eventos de conversión, atribución de campañas, linkeo con Search Console | Activo si `NEXT_PUBLIC_GA_MEASUREMENT_ID` está seteado |

Vercel Analytics es server-side y privacy-first — no requiere consentimiento de cookies ni scripts externos. GA4 se usa específicamente para lo que Vercel Analytics no cubre: eventos de CTA, campañas UTM y Search Console.

---

## Variables de entorno

```bash
# Requerida para activar GA4 (sin esto, el script no se inyecta)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Requerida para verificar propiedad en Search Console (agregar cuando tengas el código)
# NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

Si `NEXT_PUBLIC_GA_MEASUREMENT_ID` no está seteado, GA4 no se monta y todas las llamadas a `track*()` son no-ops silenciosos.

---

## Cómo configurar GA4

1. Crear una propiedad en [Google Analytics](https://analytics.google.com) → tipo Web.
2. Copiar el **Measurement ID** (formato `G-XXXXXXXXXX`).
3. Setearlo en Vercel: **Project Settings → Environment Variables → `NEXT_PUBLIC_GA_MEASUREMENT_ID`**.
4. En local: agregarlo a `.env.local`.
5. Verificar que el script aparezca en el `<head>` usando las DevTools del browser.

---

## Cómo configurar Search Console

1. Abrir [Google Search Console](https://search.google.com/search-console).
2. Agregar la propiedad con la URL de producción.
3. Elegir verificación por **HTML tag** — copiar el contenido del atributo `content`.
4. En `src/app/layout.tsx`, agregar al objeto `metadata`:

```typescript
verification: {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
},
```

5. Setear la variable en Vercel y deployar.
6. Confirmar verificación en Search Console.
7. Enviar sitemap: `<dominio>/sitemap.xml`.

Para vincular GA4 con Search Console: **Search Console → Settings → Associations → Google Analytics**.

---

## Eventos disponibles

Todos los eventos están definidos en `src/lib/analytics/track.ts`. Ninguno envía datos personales.

| Función | Evento GA4 | Parámetro | Cuándo se dispara |
|---|---|---|---|
| `trackCtaDiagnosticClick(location)` | `cta_diagnostic_click` | `location: "hero" \| "final_cta"` | Click en CTA de home |
| `trackServiceLinkClick(service)` | `home_service_link_click` | `service: slug de página` | Click en card de servicios |
| `trackIntentPageCta(page)` | `intent_page_cta_click` | `page: slug de página` | Click en CTA de página de intención |
| `trackDiagnosticSubmitSuccess()` | `diagnostic_submit_success` | — | Formulario enviado correctamente |
| `trackDiagnosticSubmitError()` | `diagnostic_submit_error` | — | Error al enviar el formulario |

Para agregar un nuevo evento: definir la función en `track.ts` usando `sendGAEvent`, con parámetros genéricos (nunca PII).

---

## Qué datos NO se envían

Los siguientes datos del formulario de diagnóstico **nunca** se pasan a Analytics:

- Nombre
- Email
- WhatsApp
- Empresa
- Cargo
- Mensaje o descripción del proceso
- Herramientas actuales seleccionadas
- Notas internas

Solo se registra que el envío ocurrió (éxito o error), sin ningún atributo del usuario.

---

## Performance (Speed Insights)

Vercel Speed Insights mide Core Web Vitals en producción con tráfico real:

- **LCP** (Largest Contentful Paint) — velocidad de carga percibida
- **CLS** (Cumulative Layout Shift) — estabilidad visual
- **INP** (Interaction to Next Paint) — respuesta a interacciones

Los datos aparecen en el dashboard de Vercel bajo **Analytics → Speed Insights**. No es marketing analytics — es diagnóstico de performance real por dispositivo y región.

---

## Convención de UTMs

Ver [docs/seo-strategy.md](seo-strategy.md#convención-de-utms) — la convención está definida ahí y GA4 la captura automáticamente sin configuración adicional.

---

## Checklist de activación

- [ ] Crear propiedad GA4 y obtener Measurement ID
- [ ] Setear `NEXT_PUBLIC_GA_MEASUREMENT_ID` en Vercel
- [ ] Verificar que eventos aparecen en GA4 → **DebugView** (activar con `?gtm_debug=1` o GA4 Debugger)
- [ ] Verificar propiedad en Search Console
- [ ] Enviar sitemap desde Search Console
- [ ] Vincular GA4 con Search Console
- [ ] Confirmar que `diagnostic_submit_success` llega correctamente tras enviar el form de prueba
