
# Arkanum — Engineering Principles

## 1. Propósito del documento

Este documento define los principios técnicos obligatorios para el desarrollo de Arkanum Web.

El objetivo no es construir una landing descartable, sino una base profesional, mantenible y preparada para evolucionar hacia:

* Web institucional.
* Captura de leads.
* Dashboard interno.
* Administración de oportunidades comerciales.
* Futuro portal cliente.
* Futuro sistema de tickets, proyectos y solicitudes de features.

El MVP debe ser simple, pero no improvisado.

---

## 2. Principios generales

### 2.1. Arquitectura antes que velocidad aparente

Se prioriza una estructura clara, mantenible y testeable por encima de soluciones rápidas pero frágiles.

No se aceptan implementaciones que:

* mezclen lógica de negocio con componentes visuales;
* dependan directamente de servicios externos desde la UI;
* dupliquen reglas de validación;
* concentren responsabilidades en componentes grandes;
* dificulten el reemplazo futuro de proveedores externos;
* generen deuda técnica innecesaria en el MVP.

La velocidad real del proyecto viene de una arquitectura simple y consistente, no de hacks.

---

## 3. Stack inicial

Stack aprobado para Arkanum Web:

* Next.js
* TypeScript
* React
* Tailwind CSS
* Supabase
* Vercel
* Zod
* React Hook Form

Dependencias opcionales permitidas:

* shadcn/ui
* Lucide React
* Resend
* Framer Motion, solo con uso moderado y justificado

No se deben agregar dependencias sin justificar:

* qué problema resuelven;
* por qué no alcanza una solución nativa/simple;
* qué costo de acoplamiento introducen;
* qué impacto tienen en bundle, mantenimiento y testing.

---

## 4. Estilo arquitectónico

Arkanum Web seguirá una arquitectura modular inspirada en Clean Architecture, adaptada a Next.js.

La separación conceptual será:

```text
Presentation Layer
  Componentes visuales
  Páginas
  Layouts
  Formularios

Application Layer
  Casos de uso
  Orquestación de operaciones
  Reglas de aplicación

Domain Layer
  Entidades conceptuales
  Tipos de dominio
  Reglas puras
  Value objects cuando aplique

Infrastructure Layer
  Supabase
  Email providers
  Analytics
  Storage
  Integraciones externas
```

La UI no debe conocer detalles internos de Supabase, proveedores de email o servicios externos.

---

## 5. Estructura de carpetas esperada

Estructura inicial sugerida:

```text
src/
  app/
    page.tsx
    diagnostico/
      page.tsx
    gracias/
      page.tsx
    dashboard/
      layout.tsx
      page.tsx
      leads/
        page.tsx
        [id]/
          page.tsx

  components/
    ui/
    layout/
    landing/
    forms/
    dashboard/

  features/
    leads/
      domain/
        lead.types.ts
        lead.constants.ts
      application/
        create-lead.use-case.ts
        update-lead-status.use-case.ts
        add-lead-note.use-case.ts
      infrastructure/
        lead.repository.ts
        supabase-lead.repository.ts
      presentation/
        lead-form.tsx
        lead-list.tsx
        lead-detail.tsx
        lead-status-badge.tsx

  lib/
    supabase/
      client.ts
      server.ts
    validations/
    utils/
    errors/

  server/
    actions/

  config/
    site.ts
    navigation.ts
```

La estructura puede ajustarse, pero no se debe romper la separación de responsabilidades.

---

## 6. Reglas de Clean Architecture

### 6.1. La UI no debe acceder directamente a proveedores externos

Incorrecto:

```tsx
const { data } = await supabase.from("leads").select("*");
```

dentro de un componente visual.

Correcto:

```text
Component → Use Case → Repository Interface → Supabase Repository
```

La UI debe ejecutar acciones de aplicación, no consultas directas a infraestructura.

---

### 6.2. Los casos de uso deben expresar intención de negocio

Los nombres deben ser explícitos:

```text
createLeadUseCase
updateLeadStatusUseCase
addLeadInternalNoteUseCase
```

Evitar nombres genéricos:

```text
handleSubmit
saveData
processForm
doAction
```

---

### 6.3. Las reglas de validación deben estar centralizadas

La validación del formulario de diagnóstico debe vivir en schemas reutilizables.

Ejemplo:

```text
features/leads/domain/lead.schema.ts
```

No duplicar validaciones entre componentes, actions y repositorios.

---

### 6.4. El dominio no debe depender de infraestructura

El dominio no debe importar:

* Supabase;
* Next.js;
* React;
* proveedores de email;
* librerías de UI;
* APIs externas.

El dominio debe mantenerse lo más puro posible.

---

## 7. Encapsulamiento de terceros

Arkanum no se debe atar directamente a servicios externos.

Supabase, Resend, Vercel Analytics u otros proveedores deben estar encapsulados detrás de adaptadores o repositorios.

Ejemplo:

```text
LeadRepository
  createLead()
  findLeads()
  findLeadById()
  updateStatus()
  addNote()
```

Implementación concreta:

```text
SupabaseLeadRepository
```

Si mañana se cambia Supabase por un backend propio, la UI y los casos de uso no deberían reescribirse por completo.

---

## 8. Manejo de errores

No se deben exponer errores crudos de infraestructura al usuario final.

Incorrecto:

```text
duplicate key value violates unique constraint
```

Correcto:

```text
No pudimos registrar tu solicitud en este momento. Intentá nuevamente o contactanos por WhatsApp.
```

Los errores deben clasificarse en:

```text
ValidationError
RepositoryError
AuthenticationError
AuthorizationError
UnexpectedError
```

---

## 9. Tipado

TypeScript debe usarse de forma estricta.

Reglas:

* No usar `any` salvo justificación explícita.
* Preferir tipos de dominio a objetos sueltos.
* No pasar datos crudos de Supabase directamente a componentes.
* Mapear datos de infraestructura a modelos internos.
* Evitar tipos ambiguos como `data`, `item`, `object`, `payload` cuando el contexto no sea claro.

---

## 10. Formularios

Los formularios deben usar:

* React Hook Form.
* Zod.
* Schemas reutilizables.
* Mensajes de error claros para usuarios no técnicos.

Los formularios deben manejar:

* loading state;
* success state;
* error state;
* validación client-side;
* validación server-side;
* protección contra doble envío.

---

## 11. Seguridad

Desde el MVP se deben respetar reglas mínimas de seguridad:

* No exponer claves privadas en frontend.
* Usar variables de entorno.
* Validar siempre en servidor.
* Proteger rutas internas.
* No confiar en datos enviados desde cliente.
* Preparar Supabase RLS cuando existan usuarios externos.
* Separar dashboard interno de futuro portal cliente.

El dashboard interno no debe quedar accesible públicamente.

---

## 12. Multi-cliente futuro

El MVP no implementará portal multi-cliente completo, pero la arquitectura debe evitar decisiones que bloqueen ese camino.

Reglas:

* No diseñar datos como si existiera un único cliente.
* Preparar conceptos como `organization`, `lead`, `project`, `ticket` en documentación.
* No mezclar lead con cliente.
* No mezclar usuario interno con usuario cliente.
* No construir el portal cliente hasta validar demanda real.

La regla estratégica es:

```text
Preparar la arquitectura, no construir features prematuras.
```

---

## 13. Componentes

Los componentes deben ser:

* pequeños;
* componibles;
* legibles;
* testeables;
* sin lógica de infraestructura;
* sin duplicación innecesaria.

Evitar componentes de más de 200 líneas salvo justificación fuerte.

Separar:

```text
Componente visual
Contenedor de datos
Formulario
Schema
Caso de uso
Repositorio
```

---

## 14. Diseño visual

Arkanum tendrá una estética:

* minimalista;
* premium;
* oscura/elegante;
* sobria;
* clara para pymes;
* sin exceso futurista;
* sin lenguaje técnico innecesario.

La web debe transmitir:

* claridad;
* criterio;
* confianza;
* precisión;
* capacidad técnica;
* orientación a negocio.

No debe parecer:

* plantilla genérica SaaS;
* portfolio de programador;
* agencia de marketing;
* producto esotérico;
* sitio gamer/cyberpunk excesivo.

---

## 15. Copywriting

La web debe hablar en términos de negocio.

Evitar como mensaje principal:

```text
Desarrollamos en Next.js, Kotlin, Python y PostgreSQL.
```

Priorizar:

```text
Automatizamos y modernizamos procesos de tu empresa con sistemas web, apps móviles e integraciones a medida.
```

El lenguaje técnico puede aparecer como respaldo, no como propuesta central.

---

## 16. Testing

El MVP debe incluir al menos:

* validación manual documentada;
* tests unitarios para lógica pura cuando aplique;
* tests de schemas críticos;
* revisión de formularios;
* revisión responsive;
* revisión de errores.

No se debe sobredimensionar testing al inicio, pero tampoco dejar lógica crítica sin validación.

Prioridades de testing:

```text
Schemas
Casos de uso
Mappers
Repositories
Form submit flow
Auth del dashboard
```

---

## 17. Performance

La landing debe ser rápida.

Reglas:

* evitar bundles pesados;
* optimizar imágenes;
* usar componentes server cuando tenga sentido;
* no abusar de animaciones;
* evitar dependencias visuales innecesarias;
* cuidar Core Web Vitals.

---

## 18. Accesibilidad

Mínimos obligatorios:

* contraste correcto;
* labels en formularios;
* navegación por teclado;
* estados focus visibles;
* textos claros;
* botones con intención explícita;
* estructura semántica correcta.

---

## 19. SEO inicial

El MVP debe incluir:

* title;
* description;
* Open Graph;
* favicon;
* robots;
* sitemap si aplica;
* metadata por página;
* contenido indexable;
* copy claro orientado a búsqueda comercial.

---

## 20. Criterio de aceptación técnico

Una tarea se considera terminada solo si:

* cumple el objetivo funcional;
* respeta la arquitectura;
* no introduce acoplamiento innecesario;
* no rompe responsive;
* no deja errores de TypeScript;
* no introduce `any` injustificado;
* no duplica lógica;
* tiene manejo de error;
* respeta estilo visual;
* queda documentada si afecta arquitectura;
* pasa lint/build.

---

## 21. Regla final

Arkanum debe avanzar rápido, pero no de forma amateur.

Cada decisión debe sostener esta tensión:

```text
MVP simple.
Arquitectura seria.
Crecimiento posible.
Deuda técnica controlada.
```
