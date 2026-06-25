// Standardizes free-typed names ("JUAN perez", "maría   josé") to
// "Juan Perez" / "María José" so the same person isn't stored under
// visually inconsistent casing depending on how they typed it.
export function toTitleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s'-])([a-záéíóúñü])/g, (_, boundary: string, letter: string) => boundary + letter.toUpperCase());
}
