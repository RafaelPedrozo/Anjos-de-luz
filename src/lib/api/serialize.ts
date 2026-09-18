export function dateOnly(value: Date) {
  return value.toISOString().split("T")[0]!;
}

export function toNumber(value: { toNumber: () => number } | number) {
  return typeof value === "number" ? value : value.toNumber();
}
