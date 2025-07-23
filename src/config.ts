// Use import.meta.env for Vite projects
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    saveChartEndpoint: `${API_BASE_URL}/save-chart`,
    // Add other endpoints here as your app grows
  },
};
