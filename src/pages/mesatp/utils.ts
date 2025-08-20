// components/slip-capture/utils.ts
import {
  SlipDailyData,
  SlipFilters,
  SlipRecord,
  StatusKey,
  SlipNestedData,
  STATUS_KEY_MAP,
} from "./types";

// Extract all states from nested data
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

// Extract sections for given states, districts, and acts
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

export function filterSlipData(allData: SlipDailyData[], filters: SlipFilters) {
  const { states, districts, acts, sections, statuses, dateRange } = filters;
  const from = dateRange.from ? new Date(dateRange.from) : null;
  const to = dateRange.to ? new Date(dateRange.to) : null;

  // Helper function to remove trailing "(digits)" from a string
  const stripTrailingCode = (str: string) => str.replace(/\(\d+\)$/, "").trim();

  const statesLower = states.map((s) => s.toLowerCase());
  const districtsLower = districts.map((d) => d.toLowerCase());
  const actsLower = acts.map((a) => stripTrailingCode(a).toLowerCase());
  const sectionsLower = sections.map((sec) => sec.toLowerCase());
  const statusesLower = statuses.map((st) => st.toLowerCase());

  // console.log("Starting filterSlipData with filters:", filters);
  // console.log("Filter arrays:", { statesLower, districtsLower, actsLower, sectionsLower, statusesLower });

  const filteredData = [];

  for (const entry of allData) {
    // console.log("Processing entry date:", entry.date);
    const entryDate = new Date(entry.date);

    // Date range filtering
    if (from && entryDate < from) {
      // console.log(`Entry date ${entry.date} is before from date ${from}`);
      continue;
    }

    if (to && entryDate > to) {
      // console.log(`Entry date ${entry.date} is after to date ${to}`);
      continue;
    }

    // Build filtered entry
    const filteredEntry = {
      date: entry.date,
      data: {
        state: {},
      },
    };

    let entryHasMatchingData = false;

    // Process each state
    for (const [stateName, districtsData] of Object.entries(entry.data.state)) {
      const stateLower = stateName.toLowerCase();

      // Apply state filter
      if (statesLower.length > 0 && !statesLower.includes(stateLower)) {
        // console.log(`Skipping state "${stateName}" - not in filter`);
        continue;
      }

      // console.log(`✓ Processing state: "${stateName}"`);
      const filteredDistricts = {};
      let stateHasData = false;

      // Process each district
      for (const [districtName, actsData] of Object.entries(districtsData)) {
        const districtLower = districtName.toLowerCase();

        // Apply district filter
        if (
          districtsLower.length > 0 &&
          !districtsLower.includes(districtLower)
        ) {
          // console.log(`Skipping district "${districtName}" - not in filter`);
          continue;
        }

        // console.log(`✓ Processing district: "${districtName}"`);
        const filteredActs = {};
        let districtHasData = false;

        // Process each act
        for (const [actName, sectionsData] of Object.entries(actsData)) {
          const actCleanLower = stripTrailingCode(actName).toLowerCase();

          // Apply act filter
          if (actsLower.length > 0 && !actsLower.includes(actCleanLower)) {
            // console.log(`Skipping act "${actName}" - not in filter`);
            continue;
          }

          // console.log(`✓ Processing act: "${actName}"`);
          const filteredSections = {};
          let actHasData = false;

          // Process each section
          for (const [sectionName, metrics] of Object.entries(sectionsData)) {
            const sectionLower = sectionName.toLowerCase();

            // Apply section filter - THIS IS THE KEY FIX
            if (
              sectionsLower.length > 0 &&
              !sectionsLower.includes(sectionLower)
            ) {
              // console.log(`Skipping section "${sectionName}" - not in filter list [${sectionsLower.join(', ')}]`);
              continue;
            }

            // console.log(`✓ Processing section: "${sectionName}"`);

            // Apply status filter
            let includeSection = true;
            if (statusesLower.length > 0) {
              includeSection = statusesLower.some((statusKey) => {
                const mappedDataKey = STATUS_KEY_MAP[statusKey];

                if (!mappedDataKey) {
                  // console.log(`No mapping found for status "${statusKey}"`);
                  return false;
                }

                const metricValue = metrics[mappedDataKey];
                // console.log(
                //   `Checking status "${statusKey}" (mapped to "${mappedDataKey}") with value ${metricValue} in section "${sectionName}"`
                // );

                return metricValue && metricValue > 0;
              });
            }

            if (includeSection) {
              // console.log(`✓ Including section "${sectionName}" in filtered results`);

              // Filter metrics to only include selected statuses
              let filteredMetrics = {};

              if (statusesLower.length > 0) {
                // Only include the specific status fields that were selected
                statusesLower.forEach((statusKey) => {
                  const mappedDataKey = STATUS_KEY_MAP[statusKey];
                  if (mappedDataKey && metrics[mappedDataKey] !== undefined) {
                    filteredMetrics[mappedDataKey] = metrics[mappedDataKey];
                  }
                });

                // Also include non-status fields like arrest_act and arrest_section
                const nonStatusFields = ["arrest_act", "arrest_section"];
                nonStatusFields.forEach((field) => {
                  if (metrics[field] !== undefined) {
                    filteredMetrics[field] = metrics[field];
                  }
                });

                // console.log(`Filtered metrics for section "${sectionName}":`, filteredMetrics);
              } else {
                // No status filter, include all metrics
                filteredMetrics = metrics;
              }

              filteredSections[sectionName] = filteredMetrics;
              actHasData = true;
              districtHasData = true;
              stateHasData = true;
              entryHasMatchingData = true;
            } else {
              // console.log(`✗ Excluding section "${sectionName}" - no matching status data`);
            }
          }

          if (actHasData) {
            filteredActs[actName] = filteredSections;
          }
        }

        if (districtHasData) {
          filteredDistricts[districtName] = filteredActs;
        }
      }

      if (stateHasData) {
        filteredEntry.data.state[stateName] = filteredDistricts;
      }
    }

    // Only add entry if it has matching data
    if (entryHasMatchingData) {
      filteredData.push(filteredEntry);
    }
  }

  // console.log("All filtered data:", filteredData);
  // console.log("Filtered data length:", filteredData.length);

  return filteredData;
}

// Get flattened records for computations
export function getFilteredRecords(
  data: SlipDailyData[],
  filters: SlipFilters
): SlipRecord[] {
  const filteredData = filterSlipData(data, filters);
  console.log("dfsadsafsa", filteredData);
  return flattenSlipData(filteredData);
}

// Compute totals by status from SlipDailyData
export function computeTotalsByStatus(
  filteredData: SlipDailyData[],
  statuses: StatusKey[],
  selectedStates: string[]
): Record<StatusKey, number> {
  // Initialize totals object with all statuses set to 0
  const totals = statuses.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<StatusKey, number>);

  filteredData.forEach((entry) => {
    selectedStates.forEach((state) => {
      const districts = entry.data.state[state] || {};

      Object.values(districts).forEach((acts) => {
        Object.values(acts).forEach((sections) => {
          Object.values(sections).forEach((metrics: any) => {
            statuses.forEach((status) => {
              // Map UI status → API field
              const fieldKey = STATUS_KEY_MAP[
                status.toLowerCase()
              ] as keyof typeof metrics;

              if (fieldKey && metrics[fieldKey] !== undefined) {
                totals[status] += Number(metrics[fieldKey]) || 0;
              }
            });
          });
        });
      });
    });
  });

  return totals;
}
// Add these updated functions to your utils.ts file - replace the existing ones

/**
 * Build slip table data aggregated by state (single row per state)
 * This aggregates across all dates, districts, acts, and sections
 */
export function buildSlipTableDataByState(
  filteredData: SlipDailyData[],
  statuses: StatusKey[],
  selectedStates: string[]
) {
  const stateAggregates = new Map<string, any>();
  const selectedStatesLower = selectedStates.map((s) => s.toLowerCase().trim());

  console.log("Building state-level table data for states:", selectedStates);

  // Initialize aggregates for each selected state
  selectedStates.forEach((state) => {
    const stateLower = state.toLowerCase().trim();
    const stateData: any = { state };

    // Initialize all status counts to 0
    statuses.forEach((status) => {
      stateData[status] = 0;
    });

    stateAggregates.set(stateLower, stateData);
  });

  // Aggregate data across all dates
  filteredData.forEach((entry) => {
    Object.entries(entry.data.state).forEach(([state, districts]) => {
      const stateLower = state.toLowerCase().trim();

      if (!selectedStatesLower.includes(stateLower)) {
        return;
      }

      const stateAggregate = stateAggregates.get(stateLower);
      if (!stateAggregate) return;

      // Aggregate across all districts, acts, and sections for this state
      Object.entries(districts).forEach(([district, acts]) => {
        Object.entries(acts).forEach(([act, sections]) => {
          Object.entries(sections).forEach(([section, metrics]) => {
            statuses.forEach((status) => {
              const metricKey = STATUS_KEY_MAP[status.toLowerCase()];
              if (metricKey && metrics[metricKey] !== undefined) {
                stateAggregate[status] += Number(metrics[metricKey]) || 0;
              }
            });
          });
        });
      });
    });
  });

  const result = Array.from(stateAggregates.values()).sort((a, b) =>
    a.state.localeCompare(b.state)
  );

  console.log("State table data result:", result);
  return result;
}

/**
 * Build slip table data aggregated by district (single row per district)
 * This aggregates across all dates, acts, and sections
 */
export function buildSlipTableDataByDistrict(
  filteredData: SlipDailyData[],
  statuses: StatusKey[],
  selectedStates: string[]
) {
  const districtAggregates = new Map<string, any>();
  const selectedStatesLower = selectedStates.map((s) => s.toLowerCase().trim());

  console.log("Building district-level table data for states:", selectedStates);

  // Aggregate data across all dates
  filteredData.forEach((entry) => {
    Object.entries(entry.data.state).forEach(([state, districts]) => {
      const stateLower = state.toLowerCase().trim();

      if (!selectedStatesLower.includes(stateLower)) {
        return;
      }

      Object.entries(districts).forEach(([district, acts]) => {
        const districtKey = `${stateLower}__${district.toLowerCase().trim()}`;

        // Initialize district aggregate if not exists
        if (!districtAggregates.has(districtKey)) {
          const districtData: any = {
            state,
            district,
          };

          // Initialize all status counts to 0
          statuses.forEach((status) => {
            districtData[status] = 0;
          });

          districtAggregates.set(districtKey, districtData);
        }

        const districtAggregate = districtAggregates.get(districtKey);
        if (!districtAggregate) return;

        // Aggregate across all acts and sections for this district
        Object.entries(acts).forEach(([act, sections]) => {
          Object.entries(sections).forEach(([section, metrics]) => {
            statuses.forEach((status) => {
              const metricKey = STATUS_KEY_MAP[status.toLowerCase()];
              if (metricKey && metrics[metricKey] !== undefined) {
                districtAggregate[status] += Number(metrics[metricKey]) || 0;
              }
            });
          });
        });
      });
    });
  });

  const result = Array.from(districtAggregates.values()).sort((a, b) => {
    // Sort by state first, then by district
    if (a.state !== b.state) {
      return a.state.localeCompare(b.state);
    }
    return a.district.localeCompare(b.district);
  });

  console.log("District table data result:", result.length, "districts");
  return result;
}
