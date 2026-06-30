interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEyebrow({ children, className = "" }: SectionEyebrowProps) {
  return (
    <p
      className={`mb-5 inline-block rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1 text-xs font-medium tracking-wide text-cyan-400 ${className}`}
    >
      {children}
    </p>
  );
}
