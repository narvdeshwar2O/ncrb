// Updated types.ts with fixed section filtering logic
export interface SlipNestedData {
  [state: string]: {
    [district: string]: {
      [act: string]: {
        [gender: string]: {
          // Added gender level
          [section: string]: {
            arrest_act: string;
            arrest_section: string;
            arresty_received_tp: number;
            convicted_received_tp: number;
            externee_received_tp: number;
            deportee_received_tp: number;
            uifp_received_tp: number;
            suspect_received_tp: number;
            udb_received_tp: number;
            absconder_received_tp: number;
          };
        };
      };
    };
  };
}

export interface SlipDailyData {
  date: string;
  data: {
    state: SlipNestedData;
  };
}

export interface SlipRecord {
  date: string;
  state: string;
  district: string;
  act: string;
  gender: string; // Added gender field
  section: string;
  Arrested: number;
  Convicted: number;
  Externee: number;
  Deportee: number;
  UIFP: number;
  Suspect: number;
  UDB: number;
  Absconder: number;
  total: number;
}

export const STATUS_KEYS = [
  "Arrested",
  "Convicted",
  "Externee",
  "Deportee",
  "UIFP",
  "Suspect",
  "UDB",
  "Absconder",
  "Total",
] as const;

export const STATUS_KEY_MAP: Record<string, string> = {
  arrested: "arresty_received_tp",
  convicted: "convicted_received_tp",
  externee: "externee_received_tp",
  deportee: "deportee_received_tp",
  uifp: "uifp_received_tp",
  suspect: "suspect_received_tp",
  udb: "deadbody_received_tp", // Note: mapping UDB to deadbody_received_tp
  absconder: "absconder_received_tp",
  total: "total_received_tp",
};

export type StatusKey = (typeof STATUS_KEYS)[number];


export interface SlipTableRow {
  state: string;
  district?: string;
  act?: string;
  gender?: string; // Added gender field
  section?: string;
  total?: number;
  [key: string]: number | string | undefined;
}

// Updated utility functions

// Extract all genders from nested data
export function extractGenders(data: SlipDailyData[]): string[] {
  const gendersSet = new Set<string>();

  data.forEach((dayData) => {
    if (dayData.data && dayData.data.state) {
      Object.values(dayData.data.state).forEach((districts) => {
        Object.values(districts).forEach((acts) => {
          Object.values(acts).forEach((genders) => {
            Object.keys(genders).forEach((gender) => {
              gendersSet.add(gender);
            });
          });
        });
      });
    }
  });

  return Array.from(gendersSet).sort();
}

// Extract sections for given states, districts, acts, and genders
export function extractSections(
  data: SlipDailyData[],
  states: string[],
  districts: string[],
  acts: string[],
  genders: string[]
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
                  genders.forEach((gender) => {
                    if (dayData.data.state[state][district][act][gender]) {
                      Object.keys(
                        dayData.data.state[state][district][act][gender]
                      ).forEach((section) => {
                        sectionsSet.add(section);
                      });
                    }
                  });
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
            Object.entries(actData).forEach(([gender, genderData]) => {
              Object.entries(genderData).forEach(([section, sectionData]) => {
                // Aggregate the data (handles both array and object formats)
                const aggregatedMetrics = aggregateArrayMetrics(sectionData);

                const record: SlipRecord = {
                  date: dayData.date,
                  state,
                  district,
                  act,
                  gender, // Added gender field
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
      });
    }
  });

  return records;
}



// Updated filter function with fixed section filtering logic

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

      // Aggregate across all districts, acts, genders, and sections for this state
      Object.entries(districts).forEach(([district, acts]) => {
        Object.entries(acts).forEach(([act, genders]) => {
          Object.entries(genders).forEach(([gender, sections]) => {
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

        // Aggregate across all acts, genders and sections for this district
        Object.entries(acts).forEach(([act, genders]) => {
          Object.entries(genders).forEach(([gender, sections]) => {
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
  });

  const result = Array.from(districtAggregates.values()).sort((a, b) => {
    // Sort by state first, then by district
    if (a.state !== b.state) {
      return a.state.localeCompare(b.state);
    }
    return a.district.localeCompare(b.district);
  });
  return result;
}

export function getFilteredRecords(
  data: SlipDailyData[],
  filters: SlipFilters
): SlipRecord[] {
  const filteredData = filterSlipData(data, filters);
  return flattenSlipData(filteredData);
}



// Updated compute totals function with gender support
export function computeTotalsByStatus(
  filteredData: SlipDailyData[],
  statuses: StatusKey[],
  selectedStates: string[]
): Record<StatusKey, number> {
  const totals = statuses.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<StatusKey, number>);

  filteredData.forEach((entry) => {
    selectedStates.forEach((state) => {
      const districts = entry.data.state[state] || {};

      Object.values(districts).forEach((acts) => {
        Object.values(acts).forEach((genders) => {
          Object.values(genders).forEach((sections) => {
            Object.values(sections).forEach((sectionData: any) => {
              const aggregatedMetrics = aggregateArrayMetrics(sectionData);

              statuses.forEach((status) => {
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
  });

  return totals;
}


// FIXED: More precise section matching functions
function sectionContainsAnyFilter(sectionName: string, sectionsLower: string[]): boolean {
  const sectionLower = sectionName.toLowerCase();
  
  return sectionsLower.some(filter => {
    // Split section by common delimiters
    const sectionParts = sectionLower.split(/[\/\\,\s]+/).filter(part => part.trim());
    
    // Check for exact matches first
    if (sectionParts.includes(filter)) {
      return true;
    }
    
    // For more complex patterns like "117(2)", check if any part contains the full filter
    return sectionParts.some(part => {
      // Exact match
      if (part === filter) return true;
      
      // If filter contains parentheses, do exact substring match
      if (filter.includes('(') && filter.includes(')')) {
        return part.includes(filter);
      }
      
      // For simple numeric filters, check if they appear as complete numbers
      if (/^\d+$/.test(filter)) {
        // Use word boundaries to avoid partial matches like "3" matching "303"
        const regex = new RegExp(`(^|[^\\d])${filter}([^\\d]|$)`);
        return regex.test(part);
      }
      
      // For other cases, do substring match but be more careful
      return part.includes(filter) && filter.length >= 2; // Avoid single character matches
    });
  });
}

function sectionContainsAllFilters(sectionName: string, sectionsLower: string[]): boolean {
  const sectionLower = sectionName.toLowerCase();
  
  return sectionsLower.every(filter => {
    // Split section by common delimiters
    const sectionParts = sectionLower.split(/[\/\\,\s]+/).filter(part => part.trim());
    
    // Check for exact matches first
    if (sectionParts.includes(filter)) {
      return true;
    }
    
    // For more complex patterns like "117(2)", check if any part contains the full filter
    return sectionParts.some(part => {
      // Exact match
      if (part === filter) return true;
      
      // If filter contains parentheses, do exact substring match
      if (filter.includes('(') && filter.includes(')')) {
        return part.includes(filter);
      }
      
      // For simple numeric filters, check if they appear as complete numbers
      if (/^\d+$/.test(filter)) {
        // Use word boundaries to avoid partial matches like "3" matching "303"
        const regex = new RegExp(`(^|[^\\d])${filter}([^\\d]|$)`);
        return regex.test(part);
      }
      
      // For other cases, do substring match but be more careful
      return part.includes(filter) && filter.length >= 2; // Avoid single character matches
    });
  });
}

// Helper function to aggregate array metrics (you'll need to implement this based on your existing function)
function aggregateArrayMetrics(sectionData: any) {
  if (Array.isArray(sectionData)) {
    // If it's an array, sum up all the numeric fields
    const result = {
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
    
    sectionData.forEach((item: any) => {
      if (!result.arrest_act && item.arrest_act) result.arrest_act = item.arrest_act;
      if (!result.arrest_section && item.arrest_section) result.arrest_section = item.arrest_section;
      
      result.arresty_received_tp += item.arresty_received_tp || 0;
      result.convicted_received_tp += item.convicted_received_tp || 0;
      result.externee_received_tp += item.externee_received_tp || 0;
      result.absconder_received_tp += item.absconder_received_tp || 0;
      result.deportee_received_tp += item.deportee_received_tp || 0;
      result.deadbody_received_tp += item.deadbody_received_tp || 0;
      result.uifp_received_tp += item.uifp_received_tp || 0;
      result.suspect_received_tp += item.suspect_received_tp || 0;
      result.udb_received_tp += item.udb_received_tp || 0;
    });
    
    return result;
  } else {
    // If it's already an object, return as is
    return sectionData;
  }
}


interface SlipFilters {
  states: string[];
  districts: string[];
  acts: string[];
  sections: string[];
  statuses: string[];
  genders: string[];
  dateRange: {
    from?: string | Date;
    to?: string | Date;
  };
  sectionFilterMode?: "AND" | "OR";
}

export function filterSlipData(allData: SlipDailyData[], filters: SlipFilters) {
  const {
    states,
    districts,
    acts,
    sections,
    statuses,
    genders,
    dateRange,
    sectionFilterMode = "OR", // Changed default to OR for your use case
  } = filters;

  console.log("gender", genders);
  
  // Helper function to remove trailing "(digits)" from a string
  const stripTrailingCode = (str: string) => str.replace(/\(\d+\)$/, "").trim();
  const statesLower = states.map((s) => s.toLowerCase());
  const districtsLower = districts.map((d) => d.toLowerCase());
  const actsLower = acts.map((a) => stripTrailingCode(a).toLowerCase());
  const sectionsLower = sections.map((sec) => sec.toLowerCase());
  const statusesLower = statuses.map((st) => st.toLowerCase());
  const gendersLower = genders.map((g) => g.toLowerCase());

  // Date filtering logic
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
    }
  }

  const filteredData = [];

  for (const entry of allData) {
    // Date filtering logic
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
    }

    // Date range filtering
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
        for (const [actName, gendersData] of Object.entries(actsData)) {
          const actCleanLower = stripTrailingCode(actName).toLowerCase();

          // Apply act filter
          if (actsLower.length > 0 && !actsLower.includes(actCleanLower)) {
            continue;
          }

          const filteredGenders = {};
          let actHasData = false;

          // Process each gender
          for (const [genderName, sectionsData] of Object.entries(
            gendersData
          )) {
            const genderLower = genderName.toLowerCase();

            // Apply gender filter
            if (gendersLower.length > 0) {
              // If genders are selected, only include matching genders
              if (!gendersLower.includes(genderLower)) {
                continue;
              }
            }
            // If no genders are selected, include all genders

            const filteredSections = {};
            let genderHasData = false;

            // FIXED SECTION FILTERING LOGIC
            if (sectionsLower.length === 0) {
              // No section filter - include all sections
              for (const [sectionName, sectionData] of Object.entries(
                sectionsData
              )) {
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

                  filteredSections[sectionName] = Array.isArray(sectionData)
                    ? [filteredMetrics]
                    : filteredMetrics;
                  genderHasData = true;
                }
              }
            } else {
              // WITH SECTION FILTER - FIXED LOGIC

              // Create a single aggregate for matching sections
              let matchingSections: string[] = [];
              let aggregatedMetrics = {
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

              for (const [sectionName, sectionData] of Object.entries(
                sectionsData
              )) {
                let sectionMatches = false;

                if (sectionFilterMode === "AND") {
                  // AND mode: section must contain ALL specified filters
                  sectionMatches = sectionContainsAllFilters(
                    sectionName,
                    sectionsLower
                  );
                } else {
                  // OR mode: section must contain ANY of the specified filters
                  sectionMatches = sectionContainsAnyFilter(
                    sectionName,
                    sectionsLower
                  );
                }

                if (sectionMatches) {
                  matchingSections.push(sectionName);
                  const sectionMetrics = aggregateArrayMetrics(sectionData);

                  // Apply status filter
                  let includeSection = true;
                  if (statusesLower.length > 0) {
                    includeSection = statusesLower.some((statusKey) => {
                      const mappedDataKey = STATUS_KEY_MAP[statusKey];
                      if (!mappedDataKey) return false;
                      const metricValue = sectionMetrics[mappedDataKey];
                      return metricValue && metricValue > 0;
                    });
                  }

                  if (includeSection) {
                    // Set non-numeric fields from first matching section
                    if (
                      !aggregatedMetrics.arrest_act &&
                      sectionMetrics.arrest_act
                    ) {
                      aggregatedMetrics.arrest_act = sectionMetrics.arrest_act;
                    }
                    if (
                      !aggregatedMetrics.arrest_section &&
                      sectionMetrics.arrest_section
                    ) {
                      aggregatedMetrics.arrest_section =
                        sectionMetrics.arrest_section;
                    }

                    // Aggregate numeric fields
                    aggregatedMetrics.arresty_received_tp +=
                      sectionMetrics.arresty_received_tp || 0;
                    aggregatedMetrics.convicted_received_tp +=
                      sectionMetrics.convicted_received_tp || 0;
                    aggregatedMetrics.externee_received_tp +=
                      sectionMetrics.externee_received_tp || 0;
                    aggregatedMetrics.absconder_received_tp +=
                      sectionMetrics.absconder_received_tp || 0;
                    aggregatedMetrics.deportee_received_tp +=
                      sectionMetrics.deportee_received_tp || 0;
                    aggregatedMetrics.deadbody_received_tp +=
                      sectionMetrics.deadbody_received_tp || 0;
                    aggregatedMetrics.uifp_received_tp +=
                      sectionMetrics.uifp_received_tp || 0;
                    aggregatedMetrics.suspect_received_tp +=
                      sectionMetrics.suspect_received_tp || 0;
                    aggregatedMetrics.udb_received_tp +=
                      sectionMetrics.udb_received_tp || 0;
                  }
                }
              }

              if (matchingSections.length > 0) {
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

                // Use a combined key for display
                const displayKey =
                  matchingSections.length === 1
                    ? matchingSections[0]
                    : `Combined(${matchingSections.join(", ")})`;

                // Check if any original section was an array
                const shouldBeArray = matchingSections.some((sectionName) =>
                  Array.isArray(sectionsData[sectionName])
                );

                filteredSections[displayKey] = shouldBeArray
                  ? [filteredMetrics]
                  : filteredMetrics;

                genderHasData = true;
              }
            }

            if (genderHasData) {
              filteredGenders[genderName] = filteredSections;
              actHasData = true;
              districtHasData = true;
              stateHasData = true;
              entryHasMatchingData = true;
            }
          }

          if (actHasData) {
            filteredActs[actName] = filteredGenders;
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

    if (entryHasMatchingData) {
      filteredData.push(filteredEntry);
    }
  }

  return filteredData;
}