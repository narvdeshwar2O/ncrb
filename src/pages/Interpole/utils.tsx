import { InterpoleDailyData } from "./Types";

export interface Country {
  code: number;
  description: string;
  name: string;
}

export async function fetchCountriesName(): Promise<Country[]> {
  const res = await fetch("/assets/data/country_names/country_code.json");
  if (!res.ok) {
    throw new Error(`Failed to fetch countries: ${res.statusText}`);
  }

  const data: { code: number; description: string }[] = await res.json();
  return data.map((item) => ({
    ...item,
    name: `${item.description}`,
  }));
}

export default function getTopCountriesByDateRange(
  allData: InterpoleDailyData[],
  from: Date,
  to: Date
) {
  const totals: Record<string, number> = {};

  allData.forEach((day) => {
    const dayDate = new Date(day.date);
    if (dayDate >= from && dayDate <= to) {
      day.data.forEach(({ country, count }) => {
        totals[country] = (totals[country] || 0) + count;
      });
    }
  });

  const countries = Object.entries(totals).map(([country, total]) => ({
    country,
    total,
  }));

  const sorted = [...countries].sort((a, b) => b.total - a.total);

  return {
    top5: sorted.slice(0, 5),
    bottom5: sorted.slice(-5).reverse(), // ensure ascending order for bottom
  };
}
