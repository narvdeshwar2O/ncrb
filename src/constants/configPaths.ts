interface IconfigPath {
  basePath: string;
  filePrefix: string;
  isDaily?: boolean; // for fetching the data on the daily basis
}

export const configMap: Record<string, IconfigPath> = {
  agency: {
    basePath: "/assets/data/enr_report/2025",
    filePrefix: "final_nested_state_district",
    isDaily: true,
  },
  slip_cp: {
    basePath: "/assets/data/slip_capture/2025",
    filePrefix: "final_nested_state_district_acts",
    isDaily: true,
  },
  mesa: {
    basePath: "/assets/data/mesa/2025",
    filePrefix: "final_nested_state_district_acts",
    isDaily: true,
  },
  interpol: {
    basePath: "/assets/data/interpole/2025",
    filePrefix: "ip",
    isDaily: true,
  },
};
