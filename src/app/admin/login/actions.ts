"use server";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/ssr-client";

export async function signInAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." };
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Credenciales inválidas." };
  }

  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!allowedEmails.includes(data.user.email ?? "")) {
    await supabase.auth.signOut();
    return { error: "No tenés acceso al panel de administración." };
  }

  redirect("/admin/leads");
}
