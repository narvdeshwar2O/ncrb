export type ActData = {
  code: string;
  section: string;
};

export type SectionOption = {
  value: string;
  label: string;
};

async function fetchSections(): Promise<ActData[]> {
  try {
    const res = await fetch("/assets/data/section/section.json");
    if (!res.ok) {
      throw new Error("Failed to fetch section");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching sections:", error);
    return [];
  }
}


export async function fetchSectionOptions(): Promise<SectionOption[]> {
  const rawActs = await fetchSections();
  return rawActs.map((act) => ({
    value: act.code,
    label: `${act.code}`,
  }));
}
