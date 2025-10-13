export const NaNNullCoerce = function <T>(n: T | null | undefined, to: T): T {
  return typeof n == "number"
    ? Number.isNaN(n)
      ? to
      : n ?? to
    : n ?? to
}
