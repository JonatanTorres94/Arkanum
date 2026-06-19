
# Arkanum — Internal Operations Architecture

## 1. Propósito del documento

Este documento define la arquitectura operativa interna de Arkanum antes de seguir agregando módulos de negocio (clientes, proyectos, soporte).

Es una pausa intencional: hasta v0.26.0 se construyó un CRM liviano para leads (captura, calificación, seguimiento, pipeline). A partir de v0.28.0 el dashboard interno empieza a crecer hacia gestión de clientes, delivery de proyectos y soporte post-entrega — y eso necesita un modelo claro *antes* de la primera migration, no después.

Esta release (v0.27.0) es **solo documentación/arquitectura**. No introduce tablas, rutas, UI ni integraciones. Define los límites entre dominios para que cada release futura (v0.28.0 a v0.35.0) implemente sobre un modelo ya decidido, no improvisado.

---

## 2. Los cuatro dominios

```text
Commercial / CRM        → capta y califica leads
Client Management       → representa al cliente después del cierre
Delivery / Projects     → construye lo que se vendió
Support / Post-delivery → sostiene al cliente después de la entrega
```

Cada dominio tiene una responsabilidad y un final de ciclo claro. Ningún dominio debe asumir las responsabilidades de otro.

---

## 3. Decisiones cerradas

Estas tres frases son la regla de oro de este documento. Toda decisión de modelado futura debe poder explicarse en estos términos:

```text
CRM vende.
Delivery construye.
Support sostiene.
```

### 3.1. Support no es development

Un ticket de soporte puede **escalar o linkear** a un work item técnico (un bug real, una mejora), pero el ticket en sí **no es** el work item técnico. Son dos entidades distintas, en dos dominios distintos, conectadas por una referencia — nunca fusionadas.

Razón: el ciclo de vida de un ticket ("¿el cliente quedó atendido?") y el de un work item técnico ("¿el código se mergeó?") tienen reglas, estados y dueños distintos. Mezclarlos produce un sistema que no sirve bien a ninguno de los dos.

### 3.2. Arkanum no usará Jira como workflow principal

Arkanum tendrá su propio modelo operativo (clientes, proyectos, work items, tickets) en su propia base de datos. No se adopta Jira, Linear ni herramienta externa de project management como fuente de verdad.

Razón: el negocio de Arkanum no es solo desarrollo de software — es CRM + delivery + soporte de un estudio chico. Una herramienta de PM genérica modela bien "desarrollo", pero no modela bien "lead → cliente → proyecto → ticket" como un solo flujo de negocio.

### 3.3. GitHub es híbrido

```text
Arkanum   → modelo operativo/ejecutivo del proyecto
            (qué cliente, qué alcance, qué estado, qué se vendió)

GitHub    → código, commits, PRs, workflow técnico a nivel repo
            (qué se mergeó, qué branch, qué CI)

Arkanum enlaza a GitHub primero — no lo integra por API todavía.
```

En esta etapa, un proyecto en Arkanum puede *referenciar* un repo de GitHub (nombre, URL) como dato simple. No hay sync automática, no hay webhooks, no hay GitHub API. Eso es trabajo de releases posteriores a v0.35.0, si se justifica.

---

## 4. Commercial / CRM (implementado)

Estado actual, ya construido (v0.4.0 a v0.26.0):

```text
leads          — captura, calificación, pipeline, intención
lead_notes     — notas internas
lead_events    — audit trail (status, etapa, seguimiento, intención)
```

El lead vive en este dominio hasta que se convierte en cliente. Un lead **nunca** se edita para "convertirse" en cliente — ver sección 7.

Responsabilidad: captar interés comercial, calificarlo, y decidir si vale la pena avanzar. Termina cuando el lead se descarta (`disqualified`) o se gana (conversión a cliente).

---

## 5. Client Management (futuro — v0.28.0)

Representa al cliente real, después de cerrar una venta. Contacto comercial, datos de facturación, relación comercial vigente.

Un cliente:

* no es un lead editado — es una entidad nueva, creada a partir de la conversión;
* puede tener uno o más proyectos asociados (delivery);
* puede tener uno o más tickets de soporte asociados;
* es independiente de si hay o no proyectos activos en este momento.

No se modela todavía multi-usuario por cliente (portal cliente) — eso ya está señalado como futuro en `docs/engineering-principles.md` §12, y esta arquitectura no lo adelanta.

---

## 6. Delivery / Projects (futuro — v0.29.0 a v0.31.0)

Lo que Arkanum construye para un cliente, con seguimiento propio (no Jira).

### 6.1. Proyecto

Un proyecto pertenece a un cliente. Tiene alcance, estado y, opcionalmente, uno o más repositorios/entornos asociados (v0.30.0).

### 6.2. Repositorios y entornos (v0.30.0)

Referencia simple a GitHub (repo, URL) y a entornos de despliegue (producción, staging) como metadata del proyecto — no como integración técnica. Ver §3.3.

### 6.3. Work items (v0.31.0)

Unidad de trabajo técnico dentro de un proyecto.

Categorías:

```text
feature
bug
task
improvement
technical_debt
research
support_escalation
```

`support_escalation` es la categoría que recibe un work item creado a partir de un ticket de soporte escalado (ver §3.1 y §7) — el work item resultante vive en Delivery, el ticket original sigue viviendo en Support, y quedan linkeados.

Estados sugeridos:

```text
backlog
ready
in_progress
in_review
blocked
done
cancelled
```

---

## 7. Support / Post-delivery Operations (futuro — v0.32.0 a v0.33.0)

Sostiene al cliente después de la entrega: preguntas, configuración, bugs reportados, incidentes, pedidos de cambio, capacitación, facturación, accesos.

Categorías de ticket:

```text
question
configuration
bug_report
incident
change_request
training
billing
access
```

### 7.1. Flujo de triage

```text
Ticket entry → Triage → Resolución directa
                      → Escalación a un work item técnico (Delivery)
```

La escalación crea (o linkea) un work item en Delivery con categoría `support_escalation`, pero el ticket sigue siendo la entidad que el cliente ve y con la que se hace seguimiento de SLA/respuesta. El work item es trabajo interno; el ticket es la relación con el cliente.

---

## 8. Conversión Lead → Cliente / Proyecto (futuro — v0.34.0)

Concepto, no implementación todavía. Cuando un lead se gana:

1. Se crea un **Client** nuevo a partir de los datos comerciales del lead (no se reutiliza la fila de `leads`).
2. Opcionalmente se crea un **Project** inicial asociado a ese cliente.
3. El lead original queda con un estado terminal y una referencia al cliente creado — no se borra, queda como historial de origen comercial.

Esto evita que el modelo de CRM (leads, optimizado para volumen y descarte) se contamine con el modelo de Client Management (relación comercial de largo plazo, mucho más estable y con menos campos que cambian).

---

## 9. Boundaries explícitos

Reglas de no-mezcla, para consultar antes de cualquier migration futura:

* No agregar campos de cliente a `leads` — un lead que se convierte genera un `Client` nuevo (§8).
* No agregar campos de proyecto/work item a `lead_events` — son audit trails de dominios distintos.
* No fusionar `support_tickets` con work items de Delivery — se linkean, no se fusionan (§3.1).
* No modelar Arkanum como si Jira fuera la fuente de verdad de nada — Arkanum es la fuente de verdad operativa (§3.2).
* No integrar GitHub API hasta que el modelo de Delivery esté validado con uso real (§3.3).
* No construir UI de cliente/proyecto/soporte antes de que la tabla y el caso de uso correspondiente existan — cada release del roadmap (§10) es secuencial, no paralela.

---

## 10. Roadmap

```text
v0.27.0  Internal Operations Architecture        (este documento)
v0.28.0  Internal Clients Foundation
v0.29.0  Internal Projects Foundation
v0.30.0  Project Repositories and Environments
v0.31.0  Project Work Items MVP
v0.32.0  Support Tickets Foundation
v0.33.0  Support Triage and Escalation to Development
v0.34.0  Lead-to-Client/Project Conversion
v0.35.0  Client/Project/Support Dashboard
```

Cada release implementa un único dominio o una única extensión de dominio. No se mezclan dominios en una misma release — mismo criterio que ya rige `docs/branching-versioning.md` §4 ("no mezclar múltiples features en una misma rama"), aplicado a nivel de roadmap completo.

---

## 11. Guardrails de v0.27.0

Esta release es solo este documento. Explícitamente no incluye:

* migrations de base de datos;
* tablas nuevas (`clients`, `projects`, `work_items`, `support_tickets` no existen aún);
* rutas admin nuevas;
* UI nueva;
* integración con GitHub API;
* integración con Jira;
* soporte, proyectos o clientes implementados de ninguna forma;
* cambios públicos, SEO o i18n.

---

## 12. Regla final

```text
Documentar antes de modelar.
Modelar antes de migrar.
Migrar antes de construir UI.
```

Cada release del roadmap (§10) debe poder señalar a la sección correspondiente de este documento como su especificación. Si una release necesita algo que este documento no cubre, se actualiza el documento primero.
