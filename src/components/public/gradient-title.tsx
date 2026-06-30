type GradientVariant = "default" | "accent";

const variants: Record<GradientVariant, string> = {
  default: "from-slate-50 via-slate-100 to-slate-300",
  accent: "from-cyan-400 to-indigo-400",
};

interface GradientTitleProps {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  className?: string;
  variant?: GradientVariant;
}

export function GradientTitle({
  as: Tag = "h2",
  children,
  className = "",
  variant = "default",
}: GradientTitleProps) {
  return (
    <Tag
      className={`bg-gradient-to-br ${variants[variant]} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </Tag>
  );
}
