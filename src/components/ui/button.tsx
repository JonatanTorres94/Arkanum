import Link from "next/link";
import { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const styles: Record<Variant, string> = {
  primary:
    "bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
  secondary:
    "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500",
};

interface ButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <Link
      className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm transition-colors ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
