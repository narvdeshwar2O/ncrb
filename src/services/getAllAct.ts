export type ActData = {
  Code: string;
  Description: string;
};

export type ActOption = {
  value: string;
  label: string;
};

async function fetchRawActs(): Promise<ActData[]> {
  try {
    const res = await fetch("/assets/data/acts/acts_full.json");
    if (!res.ok) {
      throw new Error("Failed to fetch acts");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching acts:", error);
    return [];
  }
}


export async function fetchActOptions(): Promise<ActOption[]> {
  const rawActs = await fetchRawActs();
  return rawActs.map((act) => ({
    value: act.Code,
    label: `${act.Description} (${act.Code})`,
  }));
}
