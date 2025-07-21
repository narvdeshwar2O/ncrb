// utils/exportHelpers.ts
/**
 * Escape a value for CSV.
 */
function csvEscape(val: unknown): string {
  const s = String(val ?? "");
  // if contains comma, quote, or newline -> wrap in quotes and escape quotes
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Download rows as a CSV file.
 * @param filename Without path; e.g. "table.csv"
 * @param headers Header row values
 * @param rows Array of rows (arrays of cell values)
 */
export function exportToCSV(
  filename: string,
  headers: (string | number)[],
  rows: (Array<string | number | null | undefined>)[]
) {
  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print the HTML contents of a node.
 * Copies the node.outerHTML into a lightweight print window.
 * Supply optional extraStyles CSS string (print tweaks).
 */
export function printHTMLElement(
  node: HTMLElement | null,
  title = "Print Preview",
  extraStyles = ""
) {
  if (!node) return;
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;

  const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font-family: sans-serif; margin: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 4px 8px; font-size: 12px; text-align: left; }
  th { background: #f1f5f9; }
  .chart-wrapper { width: 100%; }
  @media print {
    body { margin: 0; }
  }
  ${extraStyles}
</style>
</head>
<body>
  ${node.outerHTML}
</body>
</html>
  `;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  // optional: win.close(); // comment out if user may want to reprint
}
