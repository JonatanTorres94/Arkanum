interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function PremiumCard({ children, className = "", glow = false }: PremiumCardProps) {
  return (
    <div
      className={`rounded-xl card-depth card-glow-hover p-6 ${glow ? "glow-border" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
