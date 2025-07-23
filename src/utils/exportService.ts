// src/utils/exportService.ts

import html2canvas from "html2canvas";
import {
  exportToCSV as baseExportToCSV,
  printHTMLElement,
} from "./exportHelpers";
import { config } from "@/config";

/**
 * Options for the Excel export functionality.
 */
interface ExcelExportOptions {
  element: HTMLDivElement | null;
  filename: string;
  // 1. REMOVE apiEndpoint FROM THE INTERFACE
  // apiEndpoint: string;
  data: {
    headers: string[];
    rows: (string | number)[][];
    meta: Record<string, any>;
  };
}

// ... (printComponent and exportToCSV functions are correct) ...
export function printComponent(
  element: HTMLDivElement | null,
  documentTitle: string
) {
  printHTMLElement(element, documentTitle);
}
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  baseExportToCSV(filename, headers, rows);
}

/**
 * Handles capturing a component as an image and sending it to a backend service to generate an Excel file.
 * @param options - The configuration object for the Excel export.
 */
export async function exportToExcel(
  options: ExcelExportOptions
): Promise<void> {
  // 2. REMOVE apiEndpoint FROM THE DESTRUCTURING
  const { element, filename, data } = options;

  if (!element) {
    console.error(
      "Export to Excel failed: The target element is not available."
    );
    return;
  }

  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const imageBase64 = canvas.toDataURL("image/png");

    // This line correctly uses the centralized config, so it doesn't need to change.
    const resp = await fetch(config.api.saveChartEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, ...data }),
    });

    if (!resp.ok) {
      throw new Error(
        `Server responded with ${resp.status}: ${await resp.text()}`
      );
    }

    const blob = await resp.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Excel export process failed:", err);
  }
}

// src/utils/exportService.ts

// ... (keep all your existing code, like printComponent, exportToCSV, etc.)

/**
 * Exports a raw 2D array of data to a CSV file without adding headers automatically.
 * This is ideal for custom reports that have multiple sections or complex layouts.
 * @param filename - The desired name for the downloadable CSV file.
 * @param data - A 2D array of pre-formatted data (rows and cells).
 */
export function exportRawDataToCSV(
  filename: string,
  data: (string | number)[][]
): void {
  // Convert the 2D array into a single CSV string.
  // Each cell is wrapped in quotes to handle commas and other special characters.
  const csvContent = data
    .map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell ?? ""); // Handle null/undefined cells
          // Escape double quotes by replacing them with two double quotes
          const escapedCell = cellStr.replace(/"/g, '""');
          return `"${escapedCell}"`; // Wrap every cell in double quotes
        })
        .join(",")
    )
    .join("\n");

  // Create a Blob containing the CSV data with the correct MIME type
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a temporary link to trigger the file download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
