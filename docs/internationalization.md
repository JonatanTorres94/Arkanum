
# Internationalization — Arkanum

## Decisión actual (v0.24.0)

**Español (por defecto) + Português Brasil (piloto activo).** Next.js i18n routing con `[locale]` NO está habilitado. Las rutas pt-BR son segmentos literales bajo `app/pt-BR/`.

Limitación conocida: `<html lang>` es `"es"` para todas las rutas, incluyendo pt-BR. El atributo se corregirá cuando se migre a la arquitectura `[locale]` con route groups. La etiqueta `hreflang` es lo que Google usa para detección de idioma/región; está implementada correctamente en todas las páginas con equivalentes en ambos idiomas.

---

## Estado del código

| Item | Estado |
|---|---|
| `lang="es"` en `<html>` | ✅ Configurado en `src/app/layout.tsx` |
| Locale config centralizado | ✅ `src/config/i18n.ts` con metadata, types y type guards |
| Registro de rutas públicas | ✅ `src/config/routes.ts` — fuente única para sitemap y futuros helpers |
| Helpers SEO/canonical | ✅ `src/lib/seo/canonical.ts` — `getCanonicalUrl`, `getLocalizedUrl`, `getAlternates` |
| hreflang en sitemap | ✅ No emitido — `getAlternates` retorna `{}` con un solo locale activo |
| Archivos de mensajes | ✅ `src/messages/es.json` (fuente) y `src/messages/pt-BR.json` (piloto traducido) |
| Routing i18n activado | ❌ No implementado |
| Componentes usando mensajes | ❌ Pendiente para cuando se active i18n |

---

## Locales definidos

En `src/config/i18n.ts`:

| Locale | Mercado | Estado | Activar en |
|---|---|---|---|
| `es` | Argentina / LATAM hispanohablante | Activo | — |
| `pt-BR` | Brasil | Futuro | Cuando haya ≥ 5 leads calificados y decisión estratégica |
| `en` | Internacional | Futuro | Idem |

---

## Archivos de la fundación i18n

### `src/config/i18n.ts`

Config central de locales. Exporta:

- `locales` — todos los locales definidos (activos + futuros)
- `activeLocales` / `futureLocales` — separados por estado
- `defaultLocale` — `"es"`, con `satisfies ActiveLocale` para garantía de tipo
- `localeConfig` — metadata por locale: label, territory, direction, active
- `isActiveLocale(str)` / `isFutureLocale(str)` — type guards para validación en runtime

### `src/config/routes.ts`

Registro de rutas públicas e indexables. Cada entrada tiene `path`, `priority` y `changeFrequency`. Es la fuente única de verdad para el sitemap. Rutas de admin, `/gracias` y páginas con `noindex` están excluidas intencionalmente.

Para agregar una nueva ruta pública, editarla aquí — el sitemap la recoge automáticamente.

### `src/lib/seo/canonical.ts`

Tres helpers:

| Función | Uso |
|---|---|
| `getCanonicalUrl(path)` | URL canónica sin prefijo de locale (para el sitemap y metadata actual) |
| `getLocalizedUrl(path, locale)` | URL para una variante de locale (para hreflang cuando se activen más locales) |
| `getAlternates(path)` | Mapa de alternates para `metadata.alternates.languages` — retorna `{}` mientras haya un solo locale activo |

`getAlternates` es seguro de usar desde ya en metadata de páginas. No emitirá nada mientras `activeLocales.length <= 1`.

---

## Cómo activar un nuevo locale

Cuando la decisión estratégica esté tomada y el contenido traducido:

### 1. Agregar a `activeLocales` en `src/config/i18n.ts`

```typescript
export const activeLocales = ["es", "pt-BR"] as const;
```

### 2. Habilitar routing en `next.config.ts`

Con Next.js App Router, la convención es una carpeta `[locale]`:

```
src/app/
  [locale]/
    layout.tsx
    page.tsx
    software-a-medida/
      page.tsx
    ...
```

El locale default (`es`) sigue sin prefijo en la URL.

### 3. Agregar mensajes de contenido

```
src/messages/
  es.json
  pt-BR.json
```

Usar `next-intl` o el mecanismo de i18n elegido en ese momento.

### 4. Agregar rutas traducidas en `src/config/routes.ts`

```typescript
{ path: "/software-sob-medida",  locale: "pt-BR", priority: 0.9, changeFrequency: "monthly" },
```

### 5. Hreflang aparece automáticamente

`getAlternates` empezará a retornar el mapa completo en cuanto `activeLocales.length > 1`. Llamarlo desde el `metadata` de cada página:

```typescript
alternates: {
  languages: getAlternates("/software-a-medida"),
},
```

### 6. Actualizar sitemap

Agregar la entrada para el locale nuevo en el array de `publicRoutes`.

---

## Cuándo activar i18n

Criterios antes de implementar:

- [ ] Al menos 5 leads calificados obtenidos desde la versión en español
- [ ] Decisión estratégica de expandir a Brasil o mercado en inglés
- [ ] Recursos para traducción humana (no automática) del copy de ventas
- [ ] Validación de que el copy original funciona para conversión

---

---

## Piloto pt-BR — v0.15.0

### Qué se hizo

Se creó contenido de traducción para português brasileiro sin activar routing:

- `src/messages/es.json` — strings extraídos de todas las páginas actuales. Fuente de verdad para español. Namespace compartido con pt-BR para que la activación futura sea un reemplazo directo.
- `src/messages/pt-BR.json` — traducción completa al português brasileiro de las páginas principales: home, software-a-medida, automatizacion-de-procesos, diagnóstico y gracias.

Los archivos de mensajes están estructurados para ser compatibles con `next-intl` (namespaces anidados, claves semánticas en inglés). No hay ningún componente que los consuma aún.

### Qué NO se hizo (guardrails)

- No se activó routing `/pt-BR/` — `activeLocales` sigue siendo `["es"]`
- No se emiten hreflang — `getAlternates` continúa retornando `{}`
- No hay entradas en el sitemap para páginas en pt-BR
- No se usó traducción automática — el contenido fue revisado manualmente
- Sin cambios en admin, dashboard, base de datos ni formularios

### Criterios de activación

Antes de avanzar de "contenido preparado" a "rutas activas":

- [ ] Al menos 5 leads calificados desde la versión en español
- [ ] Decisión estratégica de expandir al mercado brasileño
- [ ] Revisión del copy en pt-BR por hablante nativo de Brasil
- [ ] Slug mapping validado (ver tabla abajo)

### Slug mapping (activo desde v0.24.0)

| Español | Português Brasil |
|---|---|
| `/` | `/pt-BR` |
| `/software-a-medida` | `/pt-BR/software-sob-medida` |
| `/automatizacion-de-procesos` | `/pt-BR/automacao-de-processos` |
| `/sistemas-para-distribuidoras` | `/pt-BR/sistemas-para-distribuidoras` |
| `/software-para-logistica` | `/pt-BR/software-para-logistica` |
| `/sistemas-de-stock` | `/pt-BR/sistemas-de-estoque` |
| `/automatizacion-con-whatsapp` | `/pt-BR/automacao-com-whatsapp` |
| `/diagnostico` | `/pt-BR/diagnostico` |
| `/gracias` | `/pt-BR/obrigado` |

Las 4 páginas de intención SEO (distribuidoras, logística, stock, whatsapp) ya cuentan con su equivalente pt-BR completo desde v0.24.0, usando terminología brasileña auténtica ("automação", "estoque", "sem custo") en vez de traducción literal del español.

---

## Piloto pt-BR — v0.24.0

Cobertura pública completa: las 4 páginas de intención SEO que quedaban solo en español ya tienen equivalente pt-BR.

- `/pt-BR/automacao-de-processos`
- `/pt-BR/sistemas-para-distribuidoras`
- `/pt-BR/software-para-logistica`
- `/pt-BR/sistemas-de-estoque`
- `/pt-BR/automacao-com-whatsapp`

Cada página agrega `alternates.languages` (vía `getBilingualAlternates`) tanto en la versión es como en la pt-BR, entrada en el sitemap (`src/config/routes.ts`) y mapeo en `LocaleSwitcher`. Las CTAs de estas páginas pt-BR usan `<Link>` simple a `/pt-BR/diagnostico` en vez de `ServicePageCtaButton` — ese componente está atado a `ServiceSlug` (solo slugs en español) y a un `href` fijo a `/diagnostico`, mismo patrón ya usado en `/pt-BR/software-sob-medida`.

Sin cambios en admin, base de datos, formulario de diagnóstico ni emails — alcance puramente de contenido público/SEO.

---

## Lo que NO se hará

- Traducción automática (Google Translate, DeepL sin revisión humana)
- Routing multilenguaje sin contenido real disponible
- Páginas `/es`, `/pt-BR`, `/en` sin leads que justifiquen la inversión
- i18n del dashboard interno (distinto producto, distinto roadmap)
