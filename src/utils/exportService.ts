import {
  exportToCSV as baseExportToCSV,
  printHTMLElement,
} from "./exportHelpers";

// for printing only
export function printComponent(
  element: HTMLDivElement | null,
  documentTitle: string
) {
  printHTMLElement(element, documentTitle);
}

// for excel export
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  baseExportToCSV(filename, headers, rows);
}