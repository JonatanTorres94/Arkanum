export async function register() {
  // Only validate in the Node.js runtime (not Edge) and only once at startup.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length === 0) return;

  // Never log values — only key names.
  const message = `[startup] Missing required environment variables: ${missing.join(", ")}`;

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  } else {
    console.warn(message);
  }
}
