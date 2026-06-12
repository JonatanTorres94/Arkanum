import { z } from "zod";

export const INDUSTRY_OPTIONS = [
  "Distribución / mayorista",
  "Logística / repartos",
  "Comercio con stock",
  "E-commerce",
  "Servicios profesionales / consultoría",
  "Otro",
] as const;

export const TOOL_OPTIONS = [
  "Excel / Google Sheets",
  "WhatsApp",
  "Papel",
  "Sistema viejo",
  "Sistema propio",
  "Mercado Pago / bancos",
  "Tiendanube / MercadoLibre / e-commerce",
  "Otro",
] as const;

export const HOURS_LOST_OPTIONS = [
  "Menos de 5 horas por semana",
  "5 a 10 horas",
  "10 a 20 horas",
  "Más de 20 horas",
  "No lo sé",
] as const;

export const URGENCY_OPTIONS = [
  "Estoy explorando opciones",
  "En los próximos 3 meses",
  "Este mes",
  "Lo necesitamos cuanto antes",
] as const;

export const BUDGET_OPTIONS = [
  "Menos de $300.000",
  "$300.000 a $800.000",
  "$800.000 a $2.000.000",
  "Más de $2.000.000",
  "No lo sé, necesito orientación",
] as const;

export const leadSchema = z.object({
  fullName: z.string().min(2, "Ingresá tu nombre completo"),
  company: z.string().min(1, "Ingresá el nombre de tu empresa"),
  role: z.string().min(1, "Ingresá tu cargo o rol"),
  email: z.string().email("Ingresá un email válido"),
  whatsapp: z
    .string()
    .min(8, "Ingresá un número de WhatsApp válido")
    .regex(/^[\d\s\+\-\(\)]+$/, "Solo se permiten números, espacios y +"),
  industry: z.enum(INDUSTRY_OPTIONS, "Seleccioná un rubro"),
  companySize: z.string().min(1, "Ingresá la cantidad aproximada de personas"),
  processToImprove: z
    .string()
    .min(10, "Describí el proceso (mínimo 10 caracteres)"),
  currentTools: z
    .array(z.enum(TOOL_OPTIONS))
    .min(1, "Seleccioná al menos una herramienta"),
  currentProblem: z
    .string()
    .min(10, "Describí el problema (mínimo 10 caracteres)"),
  weeklyHoursLost: z.enum(HOURS_LOST_OPTIONS, "Seleccioná una opción"),
  urgency: z.enum(URGENCY_OPTIONS, "Seleccioná una opción"),
  budget: z.enum(BUDGET_OPTIONS, "Seleccioná una opción"),
  additionalMessage: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
