# Internationalization — Arkanum

## Decisión actual (v0.9.0)

**Español únicamente.** Next.js i18n routing no está habilitado.

El mercado inicial es Argentina. Validar la propuesta de valor en español primero antes de invertir en traducción y localización.

---

## Estado del código

| Item | Estado |
|---|---|
| `lang="es"` en `<html>` | ✅ Configurado en `src/app/layout.tsx` |
| Config de locales futuros | ✅ En `src/config/i18n.ts` |
| Routing i18n activado | ❌ No implementado |
| Contenido separado de componentes | ❌ Pendiente para cuando se active i18n |

---

## Locales planificados

Definidos en `src/config/i18n.ts`:

| Locale | Mercado | Estado |
|---|---|---|
| `es` | Argentina / LATAM hispanohablante | Activo |
| `pt-BR` | Brasil | Futuro |
| `en` | Internacional / SaaS | Futuro |

---

## Arquitectura futura con Next.js i18n

Cuando se implemente i18n, el camino recomendado es:

### 1. Activar routing en `next.config.ts`

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  i18n: {
    locales: ["es", "pt-BR", "en"],
    defaultLocale: "es",
  },
};
```

### 2. Separar copy de componentes

Mover todo el texto hardcodeado a archivos de mensajes:

```
src/
  messages/
    es.json
    pt-BR.json
    en.json
```

Usar una librería como `next-intl` para acceder a los mensajes desde los componentes.

### 3. Actualizar sitemap

Generar entradas alternativas por locale:

```
https://arkanum.com/software-a-medida       (es)
https://arkanum.com/pt-BR/software-sob-medida  (pt-BR)
https://arkanum.com/en/custom-software         (en)
```

### 4. Agregar `hreflang` en metadata

Para señalar a Google las versiones por idioma de cada página.

---

## Cuándo activar i18n

Criterios sugeridos antes de implementar:

- [ ] Al menos 5 leads calificados obtenidos desde la versión en español
- [ ] Decisión estratégica de expandir a Brasil o mercado en inglés
- [ ] Recursos para traducción humana (no automática) del copy de ventas
