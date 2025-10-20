/**
 * Export Utilities for Reports
 * Supports CSV, Excel, and PDF exports
 */

// Export to CSV
/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 */
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// Export to Excel (using CSV format with .xlsx extension)
/**
 * Export data to Excel format
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 * @param sheetName - Name of the Excel sheet
 */
export function exportToExcel<T extends Record<string, unknown>>(data: T[], filename: string, sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // For basic Excel export, we'll use CSV format
  // For advanced features, consider using a library like xlsx
  const headers = Object.keys(data[0]);
  
  let content = `${sheetName}\n`;
  content += headers.join('\t') + '\n';
  content += data.map(row =>
    headers.map(header => row[header] ?? '').join('\t')
  ).join('\n');

  const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

// Export to JSON
/**
 * Export data to JSON format
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 * @param pretty - Whether to format JSON with indentation
 */
export function exportToJSON<T>(data: T[], filename: string, pretty = true) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const jsonContent = pretty 
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `${filename}.json`);
}

// Export to PDF (basic text-based PDF)
/**
 * Export data to PDF format
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 * @param title - Optional title for the PDF document
 */
export function exportToPDF<T extends Record<string, unknown>>(data: T[], filename: string, title?: string) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Create a simple HTML table for printing
  const headers = Object.keys(data[0]);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || filename}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .timestamp { font-size: 12px; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  ${title ? `<h1>${title}</h1>` : ''}
  <table>
    <thead>
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>
      `).join('')}
    </tbody>
  </table>
  <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
</body>
</html>
`;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format data for export (remove unwanted fields, format dates, etc.)
export function formatDataForExport<T extends Record<string, unknown>>(
  data: T[],
  options?: {
    excludeFields?: string[];
    formatDates?: boolean;
    customFormatters?: Record<string, (value: unknown) => unknown>;
  }
): Record<string, unknown>[] {
  return data.map(row => {
    const formatted: Record<string, unknown> = {};
    
    Object.keys(row).forEach(key => {
      // Skip excluded fields
      if (options?.excludeFields?.includes(key)) {
        return;
      }

      let value = row[key];

      // Apply custom formatter if exists
      if (options?.customFormatters?.[key]) {
        value = options.customFormatters[key](value);
      }
      // Format dates
      else if (options?.formatDates && value instanceof Date) {
        value = value.toLocaleString();
      }
      // Format Date strings
      else if (options?.formatDates && typeof value === 'string' && !isNaN(Date.parse(value))) {
        value = new Date(value).toLocaleString();
      }

      formatted[key] = value;
    });

    return formatted;
  });
}

// Generate report summary
/**
 * Generate a summary report from data
 * @param data - Array of objects to summarize
 * @param metrics - Array of metric names to calculate
 */
export function generateReportSummary<T extends Record<string, unknown>>(data: T[], metrics: string[]): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    totalRecords: data.length,
    generatedAt: new Date().toISOString(),
  };

  metrics.forEach(metric => {
    const values = data.map(row => row[metric]).filter(v => typeof v === 'number');
    if (values.length > 0) {
      summary[`${metric}_total`] = values.reduce((a, b) => a + b, 0);
      summary[`${metric}_average`] = values.reduce((a, b) => a + b, 0) / values.length;
      summary[`${metric}_max`] = Math.max(...values);
      summary[`${metric}_min`] = Math.min(...values);
    }
  });

  return summary;
}

// Export with summary
export function exportWithSummary<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  format: 'csv' | 'excel' | 'json',
  metrics?: string[]
) {
  const summary = metrics ? generateReportSummary(data, metrics) : null;
  
  const exportData = summary 
    ? [summary, ...data]
    : data;

  switch (format) {
    case 'csv':
      exportToCSV(exportData, filename);
      break;
    case 'excel':
      exportToExcel(exportData, filename);
      break;
    case 'json':
      exportToJSON(exportData, filename);
      break;
  }
}
