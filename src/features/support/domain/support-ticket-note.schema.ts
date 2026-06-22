import { z } from "zod";

export const supportTicketNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "La nota debe tener al menos 2 caracteres.")
    .max(5000, "Máximo 5000 caracteres."),
});

export type SupportTicketNoteFormData = z.infer<typeof supportTicketNoteSchema>;
