"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-theme";
type AdminTheme = "dark" | "light";

function readStoredTheme(): AdminTheme {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<AdminTheme>(readStoredTheme);

  // Syncs the DOM attribute that the CSS tokens key off — an external
  // system, not React state, so this is a legitimate effect (not a
  // setState-in-effect anti-pattern).
  useEffect(() => {
    document.documentElement.setAttribute("data-admin-theme", theme);
  }, [theme]);

  function handleClick() {
    const next: AdminTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      suppressHydrationWarning
      className="text-xs text-admin-text-muted transition-colors hover:text-admin-text"
    >
      {theme === "dark" ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
