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

  // Use a Map to remove duplicates based on 'Code'
  const uniqueActsMap = new Map<string, ActData>();

  rawActs.forEach((act) => {
    if (!uniqueActsMap.has(act.Code)) {
      uniqueActsMap.set(act.Code, act);
    }
  });

  // Extract unique acts from map and convert to ActOption format
  const uniqueActs = Array.from(uniqueActsMap.values());
  return uniqueActs.map((act) => ({
    value: act.Code,
    label: `${act.Description} (${act.Code})`,
  }));
}
