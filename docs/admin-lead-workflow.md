# Arkanum — Admin Lead Workflow Playbook

## 1. Propósito

Este documento describe cómo usar `/admin/leads` como bandeja de trabajo diaria: qué significa cada señal derivada, cómo priorizar, cómo avanzar el estado de un lead y cuándo convertirlo a cliente.

No define código ni schema. Define el criterio de operación humana sobre los datos que el sistema ya calcula.

---

## 2. Rutina diaria sugerida

```
1. Abrir /admin/leads.
2. Filtrar por Seguimiento = Vencido → atender primero.
3. Filtrar por Seguimiento = Hoy → atender segundo.
4. Dentro de cada grupo, ordenar por Prioridad = Alta → Media.
5. Para cada lead: actualizar estado, registrar nota, redefinir fecha de seguimiento.
6. Revisar leads con Prioridad = Alta sin seguimiento definido (Sin acción).
```

El objetivo es que al final del día no quede ningún lead `Vencido` ni ningún lead `Alta prioridad` en estado `Sin acción`.

---

## 3. Prioridad derivada

La prioridad **no se persiste** en base de datos. Se calcula en tiempo real a partir de tres campos del formulario de diagnóstico.

### Algoritmo de scoring

| Campo | Valor | Puntos |
|---|---|---|
| Urgencia | Lo necesitamos cuanto antes | 3 |
| Urgencia | Este mes | 2 |
| Urgencia | En los próximos 3 meses | 1 |
| Urgencia | Estoy explorando opciones | 0 |
| Presupuesto | Más de $5.000.000 | 3 |
| Presupuesto | $1.500.000 a $5.000.000 | 2 |
| Presupuesto | $500.000 a $1.500.000 | 1 |
| Presupuesto | Menos de $500.000 | 0 |
| Presupuesto | No tenemos cifra definida aún | 0 |
| Horas perdidas/sem | Más de 20 horas | 2 |
| Horas perdidas/sem | 10 a 20 horas | 1 |
| Horas perdidas/sem | Menos de 5 / 5 a 10 / No lo sé | 0 |

### Umbrales

| Prioridad | Puntaje |
|---|---|
| Alta | ≥ 5 |
| Media | 2 a 4 |
| Baja | 0 a 1 |

### Ejemplos

| Urgencia | Presupuesto | Horas | Total | Prioridad |
|---|---|---|---|---|
| Lo necesitamos cuanto antes | $1.500.000 a $5.000.000 | cualquiera | 5+ | Alta |
| Este mes | Más de $5.000.000 | cualquiera | 5+ | Alta |
| Este mes | No tenemos cifra definida | — | 2 | Media |
| Estoy explorando | Más de $5.000.000 | — | 3 | Media |
| En los próximos 3 meses | No tenemos cifra definida | — | 1 | Baja |
| Estoy explorando | Menos de $500.000 | — | 0 | Baja |

### Criterio operativo

- **Alta** — contactar el mismo día. Son leads con urgencia real y presupuesto concreto.
- **Media** — contactar dentro de 48 hs. Tienen intención pero falta presupuesto o urgencia.
- **Baja** — agendar para la semana. Están explorando o el ticket es chico; vale registrar nota y programar seguimiento a 7–14 días.

La prioridad puede cambiar si el lead actualiza sus datos en el futuro (si el sistema lo permitiera). Por ahora es estática al momento de la captura.

---

## 4. Seguimiento derivado

El estado de seguimiento **no se persiste**. Se calcula en tiempo real comparando `followUpDate` (fecha agendada) con la fecha local de Argentina.

### Reglas

| Estado | Condición |
|---|---|
| `Vencido` | `followUpDate` existe y es anterior a hoy |
| `Hoy` | `followUpDate` existe y es igual a hoy |
| `Programado` | `followUpDate` existe y es posterior a hoy |
| `Programado` | No hay `followUpDate` pero sí hay `nextAction` definida |
| `Sin acción` | No hay `followUpDate` ni `nextAction` |

### Criterio operativo

- **Vencido** — requiere atención inmediata. El lead tuvo una fecha comprometida que no se cumplió.
- **Hoy** — atender durante el día.
- **Programado** — monitorear. No requiere acción hoy.
- **Sin acción** — todos los leads deberían tener al menos una acción definida. Si está en `Alta` prioridad y en `Sin acción`, es un gap operativo.

### Cómo registrar seguimiento

Desde el detalle del lead (`/admin/leads/[id]`), sección **Seguimiento**:

- **Próxima acción** — texto libre describiendo qué hacer (ej: "Llamar para coordinar diagnóstico técnico").
- **Fecha de seguimiento** — cuándo hacerlo. Sin esta fecha el estado nunca pasa de `Sin acción` o `Programado` a `Hoy` o `Vencido`.

Registrar los dos campos siempre que sea posible. La acción sin fecha no genera alertas.

---

## 5. Estados del lead

Los estados representan el avance del lead en el pipeline comercial. Se cambian manualmente desde el detalle del lead.

| Estado | Significado |
|---|---|
| `Nuevo` | Acaba de entrar. No fue contactado aún. |
| `Contactado` | Se estableció contacto inicial. El lead sabe que Arkanum existe y va a evaluar. |
| `Calificado` | El lead tiene potencial real. Se pasó a evaluación comercial con etapas. |
| `Descartado` | Sin potencial o sin interés. No se persigue más. |

### Transiciones válidas

```
Nuevo → Contactado → Calificado → [etapas calificadas]
Cualquier estado → Descartado (si se descarta en cualquier punto)
```

No existe transición automática. El operador cambia el estado manualmente evaluando cada lead.

---

## 6. Etapas calificadas

Cuando un lead pasa a `Calificado`, se habilita una segunda dimensión: la **etapa calificada**. Representa el avance dentro del proceso comercial avanzado.

| Etapa | Significado |
|---|---|
| `Discovery pendiente` | Se inició la calificación pero todavía no se hizo el discovery técnico/comercial. |
| `Propuesta pendiente` | Discovery hecho. Falta preparar la propuesta. |
| `Propuesta enviada` | La propuesta fue enviada al cliente. Esperando feedback. |
| `Esperando respuesta del cliente` | El cliente recibió la propuesta y está evaluando. |
| `Aceptado` | El cliente aceptó. Pendiente inicio de proyecto. |
| `Rechazado` | El cliente no avanzó. Puede haber sido precio, timing u otro factor. |
| `Proyecto iniciado` | El proyecto ya arrancó. El lead está en transición a cliente. |

### Flujo típico

```
Discovery pendiente
  → Propuesta pendiente
    → Propuesta enviada
      → Esperando respuesta del cliente
        → Aceptado → Proyecto iniciado
        → Rechazado
```

Un lead puede quedar en cualquier etapa indefinidamente (ej: propuesta enviada y sin respuesta durante semanas). El campo `followUpDate` es el mecanismo para no perder el track.

---

## 7. Atribución

Los campos de atribución se capturan automáticamente cuando el lead completa el formulario de diagnóstico. No son editables.

| Campo | Qué registra |
|---|---|
| `landingPath` | Ruta de la landing desde la que llegó (ej: `/plataforma`) |
| `referrer` | URL de origen antes de entrar al sitio (ej: Google, LinkedIn, un artículo) |
| `utmSource` | Fuente de la campaña (ej: `google`, `instagram`, `newsletter`) |
| `utmMedium` | Medio de la campaña (ej: `cpc`, `social`, `email`) |
| `utmCampaign` | Nombre de la campaña |
| `utmContent` | Variante del anuncio o pieza |
| `utmTerm` | Keyword que disparó el anuncio (campañas de búsqueda) |

### Uso operativo

- Identificar qué canales generan leads de mayor prioridad (cruza filtro Prioridad + filtro UTM source).
- Identificar si una landing específica convierte mejor que otra (filtro landingPath).
- El bloque **Atribución** en `/admin/leads` muestra una distribución agregada de estos campos.

---

## 8. CSV export

El botón **Exportar CSV** en `/admin/leads` descarga todos los leads que pasan los filtros activos.

### Columnas exportadas

| Columna | Fuente |
|---|---|
| Nombre, Email, Empresa, Rol, WhatsApp | Datos de contacto |
| Rubro, Tamaño | Datos de empresa |
| Proceso operativo, Problema actual | Contexto del diagnóstico |
| Herramientas actuales | Lista separada por `;` |
| Horas semanales perdidas, Presupuesto, Urgencia | Contexto operativo |
| Mensaje adicional | Campo libre del formulario |
| Estado | Estado actual del lead |
| Fecha seguimiento | Valor de `followUpDate` (YYYY-MM-DD) |
| Estado seguimiento | Estado derivado en el momento de la exportación (Vencido / Hoy / Programado / Sin acción) |
| Landing path, Referrer, UTM source/medium/campaign/content/term | Atribución |
| Fecha | Fecha de creación en formato es-AR |

### Comportamiento de filtros

El CSV respeta todos los filtros activos al momento de la exportación: estado, prioridad, seguimiento, rubro, tamaño, presupuesto, urgencia, etapa calificada, landing path y UTM source.

Si hay filtros activos, el botón muestra **Exportar CSV (filtrado)**. Si no hay filtros, exporta la lista completa.

---

## 9. Conversión a cliente

La conversión convierte el lead en un **Cliente** dentro del sistema y opcionalmente crea un **Proyecto** asociado.

### Condiciones de elegibilidad

Un lead es elegible para conversión si cumple **todas** las condiciones:

1. Estado = `Calificado`.
2. Etapa calificada = `Aceptado` o `Proyecto iniciado`.
3. No fue convertido previamente.

### Proceso

Desde el detalle del lead (`/admin/leads/[id]`), sección **Conversión a cliente**:

1. El panel aparece solo si el lead es elegible o ya fue convertido.
2. Completar nombre del cliente y, opcionalmente, nombre del proyecto.
3. Confirmar la conversión.

La conversión registra:
- `convertedToClient = true`
- `convertedClientId` — ID del cliente creado
- `convertedProjectId` — ID del proyecto creado (si aplica)
- `convertedAt` — timestamp de la conversión
- `convertedBy` — usuario que ejecutó la acción

### Post-conversión

Después de convertir:

- El lead queda marcado como convertido. El panel muestra los datos de conversión (no el formulario).
- El cliente aparece en `/admin/clients`.
- Si se creó un proyecto, aparece en `/admin/projects`.
- El lead sigue visible en `/admin/leads` para trazabilidad histórica.

---

## 10. Resumen de señales en la tabla

| Señal | Tipo | Persiste en DB |
|---|---|---|
| Estado | Manual | Sí |
| Etapa calificada | Manual | Sí |
| Prioridad | Derivada (urgencia + presupuesto + horas) | No |
| Seguimiento | Derivado (followUpDate vs hoy + nextAction) | No |
| Atribución | Automático (captura en formulario) | Sí |
