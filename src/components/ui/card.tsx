interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-xl card-depth card-glow-hover p-6 ${className}`}>
      {children}
    </div>
  );
}
