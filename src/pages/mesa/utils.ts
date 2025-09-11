// components/slip-capture/utils.ts
import {
  SlipDailyData,
  SlipFilters,
  SlipRecord,
  StatusKey,
  STATUS_KEY_MAP,
} from "./types";

// Extract all states from nested data
export function extractStates(data: SlipDailyData[]): string[] {
  const statesSet = new Set<string>();

  data.forEach((dayData) => {
    if (dayData.data && dayData.data.state) {
      Object.keys(dayData.data.state).forEach((state) => {
        statesSet.add(state);
      });
    }
  });

  return Array.from(statesSet).sort();
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
    if (dayData.data && dayData.data.state) {
      states.forEach((state) => {
        if (dayData.data.state[state]) {
          districts.forEach((district) => {
            if (dayData.data.state[state][district]) {
              acts.forEach((act) => {
                if (dayData.data.state[state][district][act]) {
                  Object.keys(dayData.data.state[state][district][act]).forEach(
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
    if (dayData.data && dayData.data.state) {
      Object.entries(dayData.data.state).forEach(([state, stateData]) => {
        Object.entries(stateData).forEach(([district, districtData]) => {
          Object.entries(districtData).forEach(([act, actData]) => {
            Object.entries(actData).forEach(([section, sectionData]) => {
              // Aggregate the data (handles both array and object formats)
              const aggregatedMetrics = aggregateArrayMetrics(sectionData);

              const record: SlipRecord = {
                date: dayData.date,
                state,
                district,
                act,
                section,
                Arrested: aggregatedMetrics.arresty_received_tp || 0,
                Convicted: aggregatedMetrics.convicted_received_tp || 0,
                Externee: aggregatedMetrics.externee_received_tp || 0,
                Deportee: aggregatedMetrics.deportee_received_tp || 0,
                UIFP: aggregatedMetrics.uifp_received_tp || 0,
                Suspect: aggregatedMetrics.suspect_received_tp || 0,
                UDB: aggregatedMetrics.udb_received_tp || 0,
                Absconder: aggregatedMetrics.absconder_received_tp || 0,
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

  // Helper function to remove trailing "(digits)" from a string
  const stripTrailingCode = (str: string) => str.replace(/\(\d+\)$/, "").trim();

  const statesLower = states.map((s) => s.toLowerCase());
  const districtsLower = districts.map((d) => d.toLowerCase());
  const actsLower = acts.map((a) => stripTrailingCode(a).toLowerCase());
  const sectionsLower = sections.map((sec) => sec.toLowerCase());
  const statusesLower = statuses.map((st) => st.toLowerCase());

  // Multiple approaches to handle different date formats
  let fromDate = null;
  let toDate = null;

  if (dateRange.from) {
    const fromInput = dateRange.from as any;
    if (typeof fromInput === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(fromInput)) {
        fromDate = fromInput;
      } else {
        const d = new Date(fromInput);
        fromDate =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0");
      }
    } else if (fromInput instanceof Date) {
      fromDate =
        fromInput.getFullYear() +
        "-" +
        String(fromInput.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(fromInput.getDate()).padStart(2, "0");
    } else {
      const d = new Date(fromInput);
      if (!isNaN(d.getTime())) {
        fromDate =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0");
      }
    }
  }

  if (dateRange.to) {
    const toInput = dateRange.to as any;
    if (typeof toInput === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(toInput)) {
        toDate = toInput;
      } else {
        const d = new Date(toInput);
        toDate =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0");
      }
    } else if (toInput instanceof Date) {
      toDate =
        toInput.getFullYear() +
        "-" +
        String(toInput.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(toInput.getDate()).padStart(2, "0");
    } else {
      const d = new Date(toInput);
      if (!isNaN(d.getTime())) {
        toDate =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0");
      }
    }
  }

  const filteredData = [];

  for (const entry of allData) {
    // Handle entry date - normalize it too
    let entryDateStr: string | null = null;
    const entryDate = entry.date as any;

    if (typeof entryDate === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
        entryDateStr = entryDate;
      } else {
        const d = new Date(entryDate);
        entryDateStr =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0");
      }
    } else if (entryDate instanceof Date) {
      entryDateStr =
        entryDate.getFullYear() +
        "-" +
        String(entryDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(entryDate.getDate()).padStart(2, "0");
    } else {
      const d = new Date(entryDate);
      if (!isNaN(d.getTime())) {
        entryDateStr =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0");
      }
    }

    // Date range filtering with INCLUSIVE boundaries
    if (fromDate && entryDateStr && entryDateStr < fromDate) {
      continue;
    }

    if (toDate && entryDateStr && entryDateStr > toDate) {
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
        continue;
      }

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
          continue;
        }

        const filteredActs = {};
        let districtHasData = false;

        // Process each act
        for (const [actName, sectionsData] of Object.entries(actsData)) {
          const actCleanLower = stripTrailingCode(actName).toLowerCase();

          // Apply act filter
          if (actsLower.length > 0 && !actsLower.includes(actCleanLower)) {
            continue;
          }

          const filteredSections = {};
          let actHasData = false;

          // If no section filter, include all sections as-is
          if (sectionsLower.length === 0) {
            for (const [sectionName, sectionData] of Object.entries(
              sectionsData
            )) {
              // Apply status filter - aggregate the data first
              const aggregatedMetrics = aggregateArrayMetrics(sectionData);

              let includeSection = true;
              if (statusesLower.length > 0) {
                includeSection = statusesLower.some((statusKey) => {
                  const mappedDataKey = STATUS_KEY_MAP[statusKey];
                  if (!mappedDataKey) return false;
                  const metricValue = aggregatedMetrics[mappedDataKey];
                  return metricValue && metricValue > 0;
                });
              }

              if (includeSection) {
                let filteredMetrics = {};
                if (statusesLower.length > 0) {
                  statusesLower.forEach((statusKey) => {
                    const mappedDataKey = STATUS_KEY_MAP[statusKey];
                    if (
                      mappedDataKey &&
                      aggregatedMetrics[mappedDataKey] !== undefined
                    ) {
                      filteredMetrics[mappedDataKey] =
                        aggregatedMetrics[mappedDataKey];
                    }
                  });
                  const nonStatusFields = ["arrest_act", "arrest_section"];
                  nonStatusFields.forEach((field) => {
                    if (aggregatedMetrics[field] !== undefined) {
                      filteredMetrics[field] = aggregatedMetrics[field];
                    }
                  });
                } else {
                  filteredMetrics = aggregatedMetrics;
                }

                // Convert back to array format to maintain consistency with new format
                filteredSections[sectionName] = Array.isArray(sectionData)
                  ? [filteredMetrics]
                  : filteredMetrics;
                actHasData = true;
                districtHasData = true;
                stateHasData = true;
                entryHasMatchingData = true;
              }
            }
          } else {
            // WITH section filter - aggregate matching sections by filter value
            const sectionAggregates = new Map();

            // Initialize aggregates for each filter section
            sectionsLower.forEach((filterSection) => {
              sectionAggregates.set(filterSection, {
                matchingSections: [],
                aggregatedMetrics: {},
              });
            });

            // Find all sections that match any filter
            for (const [sectionName, sectionData] of Object.entries(
              sectionsData
            )) {
              const sectionParts = sectionName
                .toLowerCase()
                .split(/[\/,]/)
                .map((part) => part.trim())
                .filter((part) => part.length > 0);

              // Check which filters this section matches
              const matchingFilters = sectionsLower.filter((filterSection) => {
                // Direct match with full section name
                if (sectionName.toLowerCase().includes(filterSection)) {
                  return true;
                }
                // Match with any part of delimited section
                return sectionParts.some(
                  (part) =>
                    part === filterSection || part.includes(filterSection)
                );
              });

              if (matchingFilters.length > 0) {
                // Aggregate the data first (handles both array and object)
                const aggregatedMetrics = aggregateArrayMetrics(sectionData);

                // If this section matches any filter, add it to those aggregates
                matchingFilters.forEach((filterSection) => {
                  const aggregate = sectionAggregates.get(filterSection);
                  if (!aggregate) return;

                  // Apply status filter
                  let includeSection = true;
                  if (statusesLower.length > 0) {
                    includeSection = statusesLower.some((statusKey) => {
                      const mappedDataKey = STATUS_KEY_MAP[statusKey];
                      if (!mappedDataKey) return false;
                      const metricValue = aggregatedMetrics[mappedDataKey];
                      return metricValue && metricValue > 0;
                    });
                  }

                  if (!includeSection) return;

                  aggregate.matchingSections.push(sectionName);

                  // Initialize aggregated metrics if first section
                  if (Object.keys(aggregate.aggregatedMetrics).length === 0) {
                    Object.entries(aggregatedMetrics).forEach(
                      ([key, value]) => {
                        if (typeof value === "number") {
                          aggregate.aggregatedMetrics[key] = 0;
                        } else {
                          aggregate.aggregatedMetrics[key] = value;
                        }
                      }
                    );
                  }

                  // Add numeric values to aggregate
                  Object.entries(aggregatedMetrics).forEach(([key, value]) => {
                    if (typeof value === "number") {
                      aggregate.aggregatedMetrics[key] =
                        (aggregate.aggregatedMetrics[key] || 0) + value;
                    }
                  });
                });
              }
            }

            // Create filtered sections from aggregates
            sectionAggregates.forEach((aggregate, filterSection) => {
              if (aggregate.matchingSections.length === 0) return;

              // Filter metrics based on status selection
              let filteredMetrics = {};
              if (statusesLower.length > 0) {
                statusesLower.forEach((statusKey) => {
                  const mappedDataKey = STATUS_KEY_MAP[statusKey];
                  if (
                    mappedDataKey &&
                    aggregate.aggregatedMetrics[mappedDataKey] !== undefined
                  ) {
                    filteredMetrics[mappedDataKey] =
                      aggregate.aggregatedMetrics[mappedDataKey];
                  }
                });
                const nonStatusFields = ["arrest_act", "arrest_section"];
                nonStatusFields.forEach((field) => {
                  if (aggregate.aggregatedMetrics[field] !== undefined) {
                    filteredMetrics[field] = aggregate.aggregatedMetrics[field];
                  }
                });
              } else {
                filteredMetrics = aggregate.aggregatedMetrics;
              }

              // Use the filter section as the key, but add a note about aggregation
              const displayKey =
                aggregate.matchingSections.length === 1
                  ? aggregate.matchingSections[0]
                  : filterSection;

              // Preserve original format - if any original data was array, keep as array
              const shouldBeArray = aggregate.matchingSections.some(
                (sectionName) => Array.isArray(sectionsData[sectionName])
              );

              filteredSections[displayKey] = shouldBeArray
                ? [filteredMetrics]
                : filteredMetrics;
              actHasData = true;
              districtHasData = true;
              stateHasData = true;
              entryHasMatchingData = true;
            });
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

  return filteredData;
}

// Helper function to aggregate metrics from array format or handle single object
function aggregateArrayMetrics(sectionData: any): any {
  const aggregated = {
    arrest_act: "",
    arrest_section: "",
    arresty_received_tp: 0,
    convicted_received_tp: 0,
    externee_received_tp: 0,
    absconder_received_tp: 0,
    deportee_received_tp: 0,
    deadbody_received_tp: 0,
    uifp_received_tp: 0,
    suspect_received_tp: 0,
    udb_received_tp: 0,
  };

  // Handle both array and single object formats
  const dataArray = Array.isArray(sectionData) ? sectionData : [sectionData];

  dataArray.forEach((item: any) => {
    // Skip if item is not an object
    if (!item || typeof item !== "object") return;

    // Take the first non-empty arrest_act and arrest_section
    if (!aggregated.arrest_act && item.arrest_act) {
      aggregated.arrest_act = item.arrest_act;
    }
    if (!aggregated.arrest_section && item.arrest_section) {
      aggregated.arrest_section = item.arrest_section;
    }

    // Sum all numeric fields
    aggregated.arresty_received_tp += item.arresty_received_tp || 0;
    aggregated.convicted_received_tp += item.convicted_received_tp || 0;
    aggregated.externee_received_tp += item.externee_received_tp || 0;
    aggregated.absconder_received_tp += item.absconder_received_tp || 0;
    aggregated.deportee_received_tp += item.deportee_received_tp || 0;
    aggregated.deadbody_received_tp += item.deadbody_received_tp || 0;
    aggregated.uifp_received_tp += item.uifp_received_tp || 0;
    aggregated.suspect_received_tp += item.suspect_received_tp || 0;
    aggregated.udb_received_tp += item.udb_received_tp || 0;
  });

  return aggregated;
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
          Object.values(sections).forEach((sectionData: any) => {
            // Aggregate the data (handles both array and object formats)
            const aggregatedMetrics = aggregateArrayMetrics(sectionData);

            statuses.forEach((status) => {
              // Map UI status → API field
              const fieldKey = STATUS_KEY_MAP[
                status.toLowerCase()
              ] as keyof typeof aggregatedMetrics;

              if (fieldKey && aggregatedMetrics[fieldKey] !== undefined) {
                totals[status] += Number(aggregatedMetrics[fieldKey]) || 0;
              }
            });
          });
        });
      });
    });
  });

  return totals;
}

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
          Object.entries(sections).forEach(([section, sectionData]) => {
            // Aggregate the data (handles both array and object formats)
            const aggregatedMetrics = aggregateArrayMetrics(sectionData);

            statuses.forEach((status) => {
              const metricKey = STATUS_KEY_MAP[status.toLowerCase()];
              if (metricKey && aggregatedMetrics[metricKey] !== undefined) {
                stateAggregate[status] +=
                  Number(aggregatedMetrics[metricKey]) || 0;
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

  return result;
}


export function buildSlipTableDataByDistrict(
  filteredData: SlipDailyData[],
  statuses: StatusKey[],
  selectedStates: string[],
  selectedDistricts: string[] = []
) {
  const districtAggregates = new Map<string, any>();
  const selectedStatesLower = selectedStates.map((s) => s.toLowerCase().trim());

  // First, initialize ALL selected districts with zero values
  if (selectedDistricts.length > 0 && selectedStates.length === 1) {
    selectedDistricts.forEach((district) => {
      const districtKey = `${selectedStates[0].toLowerCase().trim()}__${district
        .toLowerCase()
        .trim()}`;

      const districtData: any = {
        state: selectedStates[0],
        district: district,
      };

      // Initialize all status counts to 0
      statuses.forEach((status) => {
        districtData[status] = 0;
      });

      districtAggregates.set(districtKey, districtData);
    });
  } else {
    // Fallback: initialize from filteredData if no selectedDistricts provided
    filteredData.forEach((entry) => {
      Object.entries(entry.data.state).forEach(([state, districts]) => {
        const stateLower = state.toLowerCase().trim();

        if (!selectedStatesLower.includes(stateLower)) {
          return;
        }

        Object.entries(districts).forEach(([district, acts]) => {
          const districtKey = `${stateLower}__${district.toLowerCase().trim()}`;

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
        });
      });
    });
  }

  // Then aggregate actual data from filteredData
  filteredData.forEach((entry) => {
    Object.entries(entry.data.state).forEach(([state, districts]) => {
      const stateLower = state.toLowerCase().trim();

      if (!selectedStatesLower.includes(stateLower)) {
        return;
      }

      Object.entries(districts).forEach(([district, acts]) => {
        const districtKey = `${stateLower}__${district.toLowerCase().trim()}`;
        const districtAggregate = districtAggregates.get(districtKey);

        if (!districtAggregate) return;

        // Aggregate across all acts and sections for this district
        Object.entries(acts).forEach(([act, sections]) => {
          Object.entries(sections).forEach(([section, sectionData]) => {
            // Aggregate the data (handles both array and object formats)
            const aggregatedMetrics = aggregateArrayMetrics(sectionData);

            statuses.forEach((status) => {
              const metricKey = STATUS_KEY_MAP[status.toLowerCase()];
              if (metricKey && aggregatedMetrics[metricKey] !== undefined) {
                districtAggregate[status] +=
                  Number(aggregatedMetrics[metricKey]) || 0;
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

  console.log("District aggregation result:", result); // Debug log
  return result;
}
