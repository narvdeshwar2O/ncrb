export const categoryOptions = ["tp", "cp", "mesa"] as const;

export type CategoryKey = (typeof categoryOptions)[number];

export const categoryLabelMap: Record<CategoryKey, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "Live Enrollment",
};
