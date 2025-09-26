import { stateWithDistrict } from "@/utils/statesDistricts";

export function getDistrictsForStates(states: string[]) {
  const districts = states.flatMap((state) => stateWithDistrict[state] || []);
  return [...new Set(districts)].sort();
}
