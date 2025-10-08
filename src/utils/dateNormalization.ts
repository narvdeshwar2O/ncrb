export const normalizeDate = (d: Date | undefined | null) =>
  d instanceof Date && !isNaN(d.getTime())
    ? new Date(d.getFullYear(), d.getMonth(), d.getDate())
    : undefined;
