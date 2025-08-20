import {
  SlipDailyData,
  SlipFilters,
  SlipRecord,
  StatusKey,
  SlipNestedData,
} from "../pages/slip-capture/types";

export function extractStates(data: SlipDailyData[]): string[] {
  const statesSet = new Set<string>();

  data.forEach((dayData) => {
    if (dayData.data) {
      Object.keys(dayData.data).forEach((state) => {
        statesSet.add(state);
      });
    }
  });

  return Array.from(statesSet).sort();
}

// Extract districts for given states
export function extractDistricts(
  data: SlipDailyData[],
  states: string[]
): string[] {
  const districtsSet = new Set<string>();

  data.forEach((dayData) => {
    if (dayData.data) {
      states.forEach((state) => {
        if (dayData.data[state]) {
          Object.keys(dayData.data[state]).forEach((district) => {
            districtsSet.add(district);
          });
        }
      });
    }
  });

  return Array.from(districtsSet).sort();
}

// Extract acts for given states and districts
export function extractActs(
  data: SlipDailyData[],
  states: string[],
  districts: string[]
): string[] {
  const actsSet = new Set<string>();

  data.forEach((dayData) => {
    if (dayData.data) {
      states.forEach((state) => {
        if (dayData.data[state]) {
          districts.forEach((district) => {
            if (dayData.data[state][district]) {
              Object.keys(dayData.data[state][district]).forEach((act) => {
                actsSet.add(act);
              });
            }
          });
        }
      });
    }
  });

  return Array.from(actsSet).sort();
}

export function extractSections(
  data: SlipDailyData[],
  states: string[],
  districts: string[],
  acts: string[]
): string[] {
  const sectionsSet = new Set<string>();

  data.forEach((dayData) => {
    if (dayData.data) {
      states.forEach((state) => {
        if (dayData.data[state]) {
          districts.forEach((district) => {
            if (dayData.data[state][district]) {
              acts.forEach((act) => {
                if (dayData.data[state][district][act]) {
                  Object.keys(dayData.data[state][district][act]).forEach(
                    (section) => {
                      sectionsSet.add(section);
                    }
                  );
                }
              });
            }
          });
        }
      });
    }
  });

  return Array.from(sectionsSet).sort();
}

// Flatten nested data into records for easier processing
export function flattenSlipData(data: SlipDailyData[]): SlipRecord[] {
  const records: SlipRecord[] = [];

  data.forEach((dayData) => {
    if (dayData.data) {
      Object.entries(dayData.data).forEach(([state, stateData]) => {
        Object.entries(stateData).forEach(([district, districtData]) => {
          Object.entries(districtData).forEach(([act, actData]) => {
            Object.entries(actData).forEach(([section, sectionData]) => {
              const record: SlipRecord = {
                date: dayData.date,
                state,
                district,
                act,
                section,
                Arrested: sectionData.arresty_received_tp || 0,
                Convicted: sectionData.convicted_received_tp || 0,
                Externee: sectionData.externee_received_tp || 0,
                Deportee: sectionData.deportee_received_tp || 0,
                UIFP: sectionData.uifp_received_tp || 0,
                Suspect: sectionData.suspect_received_tp || 0,
                UDB: sectionData.udb_received_tp || 0,
                Absconder: sectionData.absconder_received_tp || 0,
                total: 0, // Will be calculated
              };

              // Calculate total
              record.total =
                record.Arrested +
                record.Convicted +
                record.Externee +
                record.Deportee +
                record.UIFP +
                record.Suspect +
                record.UDB +
                record.Absconder;

              records.push(record);
            });
          });
        });
      });
    }
  });

  return records;
}

// Filter the nested data and return filtered SlipDailyData
export function filterSlipData(
  data: SlipDailyData[],
  filters: SlipFilters
): SlipDailyData[] {
  return data
    .map((dayData) => {
      // Date filter
      if (filters.dateRange.from && filters.dateRange.to) {
        const recordDate = new Date(dayData.date);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);

        if (recordDate < fromDate || recordDate > toDate) {
          return { ...dayData, data: {} }; // Return empty data for filtered out dates
        }
      }

      const filteredData: SlipNestedData = {};

      // Apply nested filtering
      Object.entries(dayData.data).forEach(([state, stateData]) => {
        // State filter
        if (filters.states.length > 0 && !filters.states.includes(state)) {
          return;
        }

        filteredData[state] = {};

        Object.entries(stateData).forEach(([district, districtData]) => {
          // District filter
          if (
            filters.districts.length > 0 &&
            !filters.districts.includes(district)
          ) {
            return;
          }

          filteredData[state][district] = {};

          Object.entries(districtData).forEach(([act, actData]) => {
            // Act filter
            if (filters.acts.length > 0 && !filters.acts.includes(act)) {
              return;
            }

            filteredData[state][district][act] = {};

            Object.entries(actData).forEach(([section, sectionData]) => {
              // Section filter
              if (
                filters.sections.length > 0 &&
                !filters.sections.includes(section)
              ) {
                return;
              }

              filteredData[state][district][act][section] = sectionData;
            });
          });
        });
      });

      return { ...dayData, data: filteredData };
    })
    .filter((dayData) => Object.keys(dayData.data).length > 0);
}

// Get flattened records for computations
export function getFilteredRecords(
  data: SlipDailyData[],
  filters: SlipFilters
): SlipRecord[] {
  const filteredData = filterSlipData(data, filters);
  return flattenSlipData(filteredData);
}

// Compute totals by status from SlipDailyData
export function computeTotalsByStatus(
  filteredData: SlipDailyData[],
  statuses: StatusKey[],
  selectedStates: string[]
): Record<StatusKey, number> {
  const records = flattenSlipData(filteredData);
  const totals: Record<string, number> = {};

  statuses.forEach((status) => {
    if (status === "Total") {
      totals[status] = records.reduce((sum, record) => sum + record.total, 0);
    } else {
      totals[status] = records.reduce((sum, record) => {
        return sum + ((record[status as keyof SlipRecord] as number) || 0);
      }, 0);
    }
  });

  return totals as Record<StatusKey, number>;
}

// Build table data from SlipDailyData
export function buildSlipTableData(
  filteredData: SlipDailyData[],
  statuses: StatusKey[],
  selectedStates: string[]
): any[] {
  const records = flattenSlipData(filteredData);

  // Group by state for table display
  const stateGroups = records.reduce((acc, record) => {
    if (!acc[record.state]) {
      acc[record.state] = [];
    }
    acc[record.state].push(record);
    return acc;
  }, {} as Record<string, SlipRecord[]>);

  return Object.entries(stateGroups).map(([state, records]) => {
    const row: any = { state };

    statuses.forEach((status) => {
      if (status === "Total") {
        row[status] = records.reduce((sum, record) => sum + record.total, 0);
      } else {
        row[status] = records.reduce((sum, record) => {
          return sum + ((record[status as keyof SlipRecord] as number) || 0);
        }, 0);
      }
    });

    return row;
  });
}
