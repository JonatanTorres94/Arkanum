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
  // Required
  fullName: z.string().min(2, "Ingresá tu nombre completo"),
  email: z.string().email("Ingresá un email válido"),
  industry: z.enum(INDUSTRY_OPTIONS, "Seleccioná un rubro"),
  processToImprove: z.string().min(10, "Describí el proceso (mínimo 10 caracteres)"),
  currentProblem: z.string().min(10, "Describí el problema (mínimo 10 caracteres)"),
  urgency: z.enum(URGENCY_OPTIONS, "Seleccioná una opción"),
  budget: z.enum(BUDGET_OPTIONS, "Seleccioná una opción"),

  // Optional — strings accept "" from empty inputs without error
  company: z.string().optional(),
  role: z.string().optional(),
  whatsapp: z.string().optional(),
  companySize: z.string().optional(),
  currentTools: z.array(z.enum(TOOL_OPTIONS)).optional(),
  // weeklyHoursLost uses z.string (not enum) so "" from unselected <select> passes
  weeklyHoursLost: z.string().optional(),
  additionalMessage: z.string().optional(),

  // Honeypot — must be empty on submit; bots fill it, humans don't
  website: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
