"use server";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/ssr-client";

export async function signOutAction(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
