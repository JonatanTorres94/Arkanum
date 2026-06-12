interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900 p-6 ${className}`}>
      {children}
    </div>
  );
}
