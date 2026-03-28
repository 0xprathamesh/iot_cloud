export type RangePreset = "24h" | "7d" | "30d" | "all";

export function rangeFromPreset(preset: RangePreset): { start?: string; end?: string } {
  const end = new Date();
  if (preset === "all") return {};
  const start = new Date(end);
  if (preset === "24h") start.setHours(start.getHours() - 24);
  else if (preset === "7d") start.setDate(start.getDate() - 7);
  else start.setDate(start.getDate() - 30);
  return { start: start.toISOString(), end: end.toISOString() };
}
