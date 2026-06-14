import { z } from "zod";

export const noteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "La nota debe tener al menos 2 caracteres.")
    .max(2000, "Máximo 2000 caracteres."),
});

export type NoteFormData = z.infer<typeof noteSchema>;
