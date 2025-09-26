export const dataTypeOptions = [
  "enrol",
  "hit",
  "nohit",
  "delete",
  "total",
] as const;

export type dataTypeKey = (typeof dataTypeOptions)[number];
