
# Arkanum — Branching, Versioning & Release Strategy

## 1. Objetivo

Este documento define la estrategia de ramas, commits, versionado y despliegue para Arkanum Web.

El objetivo es mantener un flujo simple, profesional y trazable, evitando burocracia innecesaria.

---

## 2. Estrategia inicial

Arkanum usará una estrategia liviana basada en:

```text
main
feature/*
fix/*
docs/*
refactor/*
```

No se usará Git Flow completo en esta etapa porque sería sobredimensionado para el MVP.

---

## 3. Rama main

La rama `main` representa producción.

Reglas:

* debe compilar;
* debe pasar lint;
* debe estar deployable;
* no se trabaja directamente sobre ella;
* recibe cambios mediante Pull Request;
* cada merge a `main` puede disparar deploy automático.

---

## 4. Ramas feature

Formato:

```text
feature/<short-description>
```

Ejemplos:

```text
feature/landing-hero
feature/diagnostic-form
feature/supabase-leads
feature/admin-dashboard
```

Cada rama debe tener un alcance concreto.

No mezclar múltiples features en una misma rama.

---

## 5. Ramas fix

Formato:

```text
fix/<short-description>
```

Ejemplos:

```text
fix/form-validation-error
fix/mobile-navbar-layout
fix/supabase-insert-error
```

---

## 6. Ramas docs

Formato:

```text
docs/<short-description>
```

Ejemplos:

```text
docs/engineering-principles
docs/agent-pipeline
docs/brand-copy
```

---

## 7. Commits

Se usará Conventional Commits.

Formato:

```text
type(scope): description
```

Tipos permitidos:

```text
feat
fix
docs
style
refactor
test
chore
build
ci
```

Ejemplos:

```text
feat(landing): add hero section
feat(leads): add diagnostic form
fix(forms): handle duplicate submission
docs(agent): add development pipeline
refactor(leads): extract repository interface
chore(config): add env example
```

---

## 8. Pull Requests

Todo PR debe incluir:

```md
## Summary

## Changes

## Validation

## Screenshots

## Risks

## Notes
```

Para cambios visuales, agregar screenshots o descripción clara.

Para cambios de base de datos, indicar migration afectada.

---

## 9. Versionado

Se usará Semantic Versioning adaptado al MVP:

```text
MAJOR.MINOR.PATCH
```

Ejemplo:

```text
0.1.0
```

Mientras el producto esté en MVP, se trabajará en versión `0.x`.

---

## 10. Criterio de versiones

### Patch

Cambios chicos, fixes o ajustes internos:

```text
0.1.1
0.1.2
```

Ejemplos:

* corregir validación;
* ajustar responsive;
* corregir typo;
* corregir bug de formulario.

---

### Minor

Nuevas funcionalidades relevantes:

```text
0.2.0
0.3.0
```

Ejemplos:

* landing completa;
* formulario conectado a Supabase;
* dashboard interno;
* auth admin;
* notas internas.

---

### Major

No aplica durante MVP salvo cambio radical.

Ejemplo futuro:

```text
1.0.0
```

La versión `1.0.0` debería reservarse para una web estable, publicada, con captura de leads funcionando y dashboard operativo.

---

## 11. Releases sugeridas

### v0.1.0 — Project Foundation

Incluye:

```text
Next.js configurado
TypeScript
Tailwind
ESLint
Estructura de carpetas
Documentación base
```

---

### v0.2.0 — Brand Landing MVP

Incluye:

```text
Home pública
Hero
Problemas
Soluciones
Método
CTA
Footer
Responsive inicial
```

---

### v0.3.0 — Diagnostic Form

Incluye:

```text
Página /diagnostico
Formulario
Zod schema
React Hook Form
Página /gracias
```

---

### v0.4.0 — Supabase Leads

Incluye:

```text
Supabase configurado
Migration leads
Insert de formulario
Manejo de errores
.env.example
```

---

### v0.5.0 — Internal Dashboard MVP

Incluye:

```text
Auth admin
Listado de leads
Detalle de lead
Cambio de estado
Notas internas
```

---

### v0.6.0 — Production Launch

Incluye:

```text
Deploy Vercel
Dominio
SEO básico
Open Graph
Favicon
Analytics
Validación mobile
Política de privacidad básica
```

---

## 12. Tags

Cada release estable debe tener tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## 13. Changelog

Mantener archivo:

```text
CHANGELOG.md
```

Formato:

```md
# Changelog

## [0.1.0] - YYYY-MM-DD

### Added

### Changed

### Fixed
```

---

## 14. Deploy

Deploy inicial:

```text
Vercel conectado a GitHub
main → producción
Pull Requests → preview deployments
```

No hacer deploy manual salvo emergencia.

---

## 15. Variables de entorno

Toda variable requerida debe figurar en:

```text
.env.example
```

Variables reales solo en:

```text
Vercel Environment Variables
Local .env.local
```

Nunca commitear secretos.

---

## 16. Migrations

Toda modificación de base de datos debe estar versionada en:

```text
supabase/migrations/
```

No modificar estructura de DB manualmente sin registrar migration.

Formato sugerido:

```text
YYYYMMDDHHMMSS_create_leads_table.sql
YYYYMMDDHHMMSS_create_lead_notes_table.sql
```

---

## 17. Política de rollback

Si una release rompe producción:

```text
1. Identificar release/tag anterior estable.
2. Revertir PR problemático o redeploy anterior.
3. Registrar incidente en CHANGELOG.
4. Corregir en rama fix.
5. Publicar patch.
```

---

## 18. Regla final

La estrategia debe ser simple, pero trazable.

No se busca burocracia enterprise, se busca evitar caos.

```text
Cambios chicos.
PRs claros.
Commits semánticos.
Versiones estables.
Deploy reproducible.
```
