
# Internationalization — Arkanum

## Decisión actual (v0.11.0)

**Español únicamente.** Next.js i18n routing no está habilitado.

El mercado inicial es Argentina. Validar la propuesta de valor en español primero antes de invertir en traducción y localización.

---

## Estado del código

| Item | Estado |
|---|---|
| `lang="es"` en `<html>` | ✅ Configurado en `src/app/layout.tsx` |
| Locale config centralizado | ✅ `src/config/i18n.ts` con metadata, types y type guards |
| Registro de rutas públicas | ✅ `src/config/routes.ts` — fuente única para sitemap y futuros helpers |
| Helpers SEO/canonical | ✅ `src/lib/seo/canonical.ts` — `getCanonicalUrl`, `getLocalizedUrl`, `getAlternates` |
| hreflang en sitemap | ✅ No emitido — `getAlternates` retorna `{}` con un solo locale activo |
| Routing i18n activado | ❌ No implementado |
| Contenido separado de componentes | ❌ Pendiente para cuando se active i18n |

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

## Lo que NO se hará

- Traducción automática (Google Translate, DeepL sin revisión humana)
- Routing multilenguaje sin contenido real disponible
- Páginas `/es`, `/pt-BR`, `/en` sin leads que justifiquen la inversión
- i18n del dashboard interno (distinto producto, distinto roadmap)
