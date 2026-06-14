# SEO Strategy — Arkanum

## Objetivo

Captar tráfico de búsqueda orgánica de pymes y empresas en Argentina (y LATAM) que están buscando activamente soluciones digitales para sus procesos.

---

## Intenciones de búsqueda principales

| Intención | Página | Prioridad |
|---|---|---|
| "software a medida para empresas" | `/software-a-medida` | Alta |
| "automatización de procesos empresariales" | `/automatizacion-de-procesos` | Alta |
| "diagnóstico de automatización" / "consultoría operativa" | `/diagnostico` | Media |
| "arkanum software" (branded) | `/` | Alta |

---

## Estructura de páginas

| Página | Rol SEO |
|---|---|
| `/` | Homepage general — branded + awareness |
| `/software-a-medida` | Landing comercial — intención de búsqueda transaccional |
| `/automatizacion-de-procesos` | Landing comercial — intención de búsqueda transaccional |
| `/diagnostico` | Página de conversión — intención de acción directa |

### Reglas de contenido

- Cada página tiene su propio `title`, `description` y `openGraph`.
- La homepage usa `title: { absolute }` para no activar el template de layout.
- Las páginas de intención usan el template `%s | Arkanum`.
- `/gracias` y `/admin/*` tienen `robots: { index: false, follow: false }`.
- El sitemap incluye solo páginas públicas e indexables.

---

## Checklist de Search Console

- [ ] Verificar propiedad en [Search Console](https://search.google.com/search-console)
- [ ] Enviar sitemap: `https://arkanum.vercel.app/sitemap.xml`
- [ ] Confirmar indexación de `/`, `/software-a-medida`, `/automatizacion-de-procesos`, `/diagnostico`
- [ ] Revisar errores de cobertura tras primer deploy
- [ ] Monitorear impresiones y clicks por query en los primeros 30 días

---

## Convención de UTMs

Para tracking de campañas y links externos, usar esta estructura:

```
?utm_source=<fuente>&utm_medium=<medio>&utm_campaign=<campaña>
```

Ejemplos:

| Uso | URL |
|---|---|
| Email a prospect | `?utm_source=email&utm_medium=outreach&utm_campaign=diagnostico` |
| LinkedIn post | `?utm_source=linkedin&utm_medium=social&utm_campaign=awareness` |
| WhatsApp directo | `?utm_source=whatsapp&utm_medium=direct&utm_campaign=referral` |

---

## Open Graph y metadata

Checklist de validación por página:

- [ ] `title` — específico, incluye keyword principal
- [ ] `description` — entre 120 y 160 caracteres, menciona el valor concreto
- [ ] `openGraph.title` y `openGraph.description` — pueden diferir del `<title>` para optimizar clicks en redes
- [ ] `openGraph.url` — URL canónica de la página
- [ ] `robots` — `index: true, follow: true` en páginas públicas

Validar OG tags en: [opengraph.xyz](https://www.opengraph.xyz)

---

## Siguiente prioridad SEO (futura)

- Página de industria específica (ej: `/distribuidoras`, `/logistica`)
- Schema `Organization` en el homepage
- Schema `Service` por página de intención
- Blog/artículos para long-tail (fuera de scope actual)
