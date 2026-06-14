import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/ssr-client";
import type { User } from "@supabase/supabase-js";

function getAllowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  if (!getAllowedEmails().includes(user.email ?? "")) return null;

  return user;
}

export async function verifyAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
