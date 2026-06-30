interface BlueprintGridBackgroundProps {
  className?: string;
}

export function BlueprintGridBackground({ className = "" }: BlueprintGridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 blueprint-grid ${className}`}
    />
  );
}
