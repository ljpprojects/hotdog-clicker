export const NaNNullCoerce = (n: number | null | undefined, to: number = 0) => Number.isNaN(n) ? to : n ?? to
