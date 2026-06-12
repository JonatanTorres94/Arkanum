
# Arkanum — Agent Development Pipeline

## 1. Propósito

Este documento define el pipeline de trabajo para agentes de programación conectados al repositorio de Arkanum Web.

El agente debe actuar como implementador técnico bajo supervisión humana. No debe tomar decisiones estratégicas, comerciales o arquitectónicas mayores sin aprobación.

El objetivo es avanzar rápido sin sacrificar arquitectura, mantenibilidad ni claridad.

---

## 2. Rol del agente

El agente debe comportarse como:

```text
Senior implementation assistant
```

Responsabilidades:

* implementar tareas definidas;
* respetar la arquitectura existente;
* mantener consistencia de código;
* evitar sobreingeniería;
* reportar bloqueos;
* proponer mejoras cuando detecte deuda técnica;
* no modificar alcance sin autorización.

El agente no debe comportarse como:

```text
Product owner
Arquitecto autónomo
Diseñador de marca autónomo
Dev que reescribe todo sin motivo
```

---

## 3. Orden obligatorio de trabajo

El agente debe seguir este orden:

```text
1. Leer documentación del proyecto.
2. Inspeccionar estructura actual del repo.
3. Identificar archivos relacionados con la tarea.
4. Proponer plan breve de cambios.
5. Implementar en pasos pequeños.
6. Ejecutar validaciones.
7. Reportar cambios realizados.
8. Señalar riesgos o deuda detectada.
```

No debe modificar archivos sin entender su contexto.

---

## 4. Documentos que debe leer antes de implementar

Antes de cualquier tarea importante, el agente debe revisar:

```text
docs/engineering-principles.md
docs/agent-pipeline.md
docs/brand.md
docs/copy.md
docs/architecture.md
docs/backlog.md
```

Si alguno no existe, debe solicitarlo o crearlo solo si la tarea lo pide explícitamente.

---

## 5. Regla de alcance

Cada tarea debe tener un alcance concreto.

Correcto:

```text
Crear sección Hero de landing con CTA principal.
```

Incorrecto:

```text
Hacer toda la web.
```

Correcto:

```text
Implementar formulario de diagnóstico con validación Zod y submit a Supabase.
```

Incorrecto:

```text
Hacer backend completo.
```

El agente debe rechazar o pedir división cuando una tarea sea demasiado amplia.

---

## 6. Flujo de implementación

Para cada tarea, el agente debe entregar:

```text
Plan
Archivos a modificar
Cambios implementados
Validaciones ejecutadas
Riesgos detectados
Siguiente paso recomendado
```

Formato esperado:

```text
Task:
Summary:
Files changed:
Validation:
Risks:
Next:
```

---

## 7. Reglas de modificación de código

El agente puede:

* crear componentes nuevos;
* modificar componentes existentes;
* crear schemas;
* crear casos de uso;
* crear repositorios;
* crear migrations;
* ajustar estilos;
* agregar documentación;
* corregir bugs.

El agente no puede sin aprobación:

* cambiar el stack;
* agregar dependencias grandes;
* cambiar arquitectura global;
* eliminar carpetas completas;
* reescribir secciones no relacionadas;
* cambiar modelo de datos ya aprobado;
* modificar configuración de deploy;
* introducir servicios externos nuevos;
* cambiar diseño de marca de forma radical.

---

## 8. Dependencias

Antes de agregar una dependencia, el agente debe justificar:

```text
Nombre de dependencia:
Problema que resuelve:
Alternativas consideradas:
Impacto en bundle/mantenimiento:
Riesgo de acoplamiento:
```

Dependencias chicas y estándar pueden aprobarse rápido, pero deben seguir registradas.

---

## 9. Arquitectura obligatoria

El agente debe respetar la separación:

```text
Presentation
Application
Domain
Infrastructure
```

No debe colocar consultas de Supabase directamente dentro de componentes visuales.

Patrón esperado:

```text
UI Component
  ↓
Server Action / Controller
  ↓
Use Case
  ↓
Repository Interface
  ↓
Supabase Repository
```

Para tareas pequeñas puede simplificarse, pero sin romper el encapsulamiento de infraestructura.

---

## 10. Naming conventions

Nombres claros y semánticos.

Ejemplos correctos:

```text
CreateLeadUseCase
LeadRepository
SupabaseLeadRepository
DiagnosticForm
LeadStatusBadge
leadSchema
createLeadAction
```

Ejemplos incorrectos:

```text
DataManager
Helper
Utils2
FormComponent
handleStuff
saveThing
```

---

## 11. Manejo de formularios

Todo formulario debe incluir:

* schema Zod;
* mensajes de error;
* estado loading;
* estado error;
* estado success o redirect;
* protección contra doble submit;
* validación server-side;
* tipado del input.

No se aceptan formularios que solo validen en cliente.

---

## 12. Supabase

Supabase debe tratarse como proveedor de infraestructura.

Reglas:

* no usar claves privadas en frontend;
* usar cliente server cuando corresponda;
* encapsular queries;
* mapear errores;
* no devolver errores crudos;
* preparar migrations reproducibles;
* no editar estructura de DB manualmente sin reflejarlo en migrations.

---

## 13. Variables de entorno

Toda variable debe estar documentada en:

```text
.env.example
```

Formato:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

No se deben commitear valores reales.

---

## 14. Commits

El agente debe preparar cambios con commits chicos y claros.

Formato:

```text
type(scope): description
```

Tipos permitidos:

```text
feat
fix
refactor
docs
style
test
chore
build
ci
```

Ejemplos:

```text
feat(landing): add hero section
feat(leads): implement diagnostic form schema
fix(forms): prevent duplicate lead submission
docs(architecture): document lead repository pattern
```

---

## 15. Branching

El agente debe trabajar en ramas feature.

Formato:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
refactor/<short-description>
```

Ejemplos:

```text
feature/landing-hero
feature/diagnostic-form
feature/leads-dashboard
docs/engineering-principles
```

No trabajar directo sobre `main`, salvo autorización explícita.

---

## 16. Pull Request esperado

Cada PR debe incluir:

```text
Resumen
Cambios principales
Screenshots si aplica
Validaciones ejecutadas
Riesgos
Notas para reviewer
```

Template recomendado:

```md
## Summary

## Changes

## Screenshots

## Validation

## Risks

## Notes
```

---

## 17. Validaciones obligatorias

Antes de entregar una tarea, ejecutar cuando aplique:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

Si un comando no existe, el agente debe informarlo y sugerir agregarlo.

No debe afirmar que validó algo si no lo ejecutó.

---

## 18. Definition of Done

Una tarea está terminada cuando:

* cumple el alcance;
* compila;
* pasa lint;
* no rompe TypeScript;
* respeta arquitectura;
* maneja errores;
* no introduce dependencias injustificadas;
* funciona en mobile;
* respeta diseño visual;
* queda documentada si corresponde.

---

## 19. Política de refactor

El agente puede hacer refactors pequeños si:

* están directamente relacionados con la tarea;
* reducen duplicación;
* mejoran claridad;
* no cambian comportamiento funcional;
* se reportan explícitamente.

No debe hacer refactors grandes mezclados con features.

---

## 20. Política de deuda técnica

Si el agente detecta deuda, debe clasificarla:

```text
Critical
High
Medium
Low
```

Y reportarla así:

```text
Debt:
- Severity:
- Location:
- Problem:
- Suggested fix:
- Should block current task: yes/no
```

No toda deuda bloquea una tarea.

---

## 21. Política de diseño

El agente debe respetar el estilo definido:

```text
Minimalista
Premium
Oscuro/elegante
Lenguaje simple para pymes
Sin exceso de animación
Sin estética gamer
Sin template genérico SaaS
```

El diseño debe priorizar:

* legibilidad;
* conversión;
* claridad;
* confianza;
* responsive mobile.

---

## 22. Política de contenido

El agente no debe inventar:

* casos de éxito;
* clientes;
* métricas;
* años de experiencia;
* equipo;
* certificaciones;
* testimonios;
* claims legales;
* garantías.

El copy debe ser fuerte, pero honesto.

---

## 23. Roadmap técnico inicial

Orden esperado de implementación:

```text
1. Inicialización del proyecto.
2. Configuración base.
3. Identidad visual inicial.
4. Landing pública.
5. Formulario de diagnóstico.
6. Supabase schema.
7. Persistencia de leads.
8. Página de gracias.
9. Auth interna.
10. Dashboard de leads.
11. Detalle de lead.
12. Notas internas.
13. Deploy.
14. Dominio.
15. Analytics.
```

No implementar portal cliente antes de validar leads reales.

---

## 24. Regla final para agentes

El agente debe actuar con esta prioridad:

```text
Correctitud > mantenibilidad > claridad > velocidad > estética
```

La estética importa, pero no puede romper arquitectura ni claridad comercial.
