import * as Print from "expo-print";
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

import type { MonthlyIncomeSummary } from "../types/income.types";

export const REPORT_DIRECTORY = "reports";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type GenerateMonthlyIncomeReportInput = {
  month: number;
  year: number;
  summary: MonthlyIncomeSummary;
};

export type IncomeReportPdfResult = {
  uri: string;
  fileName: string;
  html: string;
};

export type MonthlyIncomeReportResult = IncomeReportPdfResult;

/**
 * Shared across income report PDFs.
 * Escapes a value so it is safe to embed in HTML.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Shared across income report PDFs.
 * Formats a number as a USD amount, e.g. "$54.30".
 */
export function formatCurrency(value: number): string {
  return `$${Number(value || 0).toFixed(2)}`;
}

/**
 * Shared across income report PDFs.
 * Formats a Date as "17 Sep 2026".
 */
export function formatGeneratedDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const monthAbbr = MONTH_NAMES[date.getMonth()].slice(0, 3);
  return `${day} ${monthAbbr} ${date.getFullYear()}`;
}

/**
 * Dynamic PDF file name based on the SELECTED month/year.
 *
 * Examples:
 *  month 9,  year 2026 -> "Monthly-Income-Report-2026-09.pdf"
 *  month 10, year 2026 -> "Monthly-Income-Report-2026-10.pdf"
 */
export function monthlyIncomeReportFileName(
  month: number,
  year: number
): string {
  const mm = String(month).padStart(2, "0");
  return `Monthly-Income-Report-${year}-${mm}.pdf`;
}

export function buildMonthlyIncomeReportHtml(
  input: GenerateMonthlyIncomeReportInput
): string {
  const { month, year, summary } = input;

  const monthName = MONTH_NAMES[month - 1] ?? String(month);
  const periodLabel = `${monthName} ${year}`;
  const generatedLabel = formatGeneratedDate(new Date());

  const dailyRows = summary.dailyChart
    .map(
      (point) => `
        <tr>
          <td>${escapeHtml(point.label)}</td>
          <td class="right">${formatCurrency(point.amount)}</td>
        </tr>
      `
    )
    .join("");

  const debtorRows = summary.debtors
    .map(
      (debtor) => `
        <tr>
          <td>${escapeHtml(debtor.name)}</td>
          <td class="right">${formatCurrency(debtor.amount)}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<style>
  @page {
    size: A4;
    margin: 16mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: Arial, "Noto Sans Khmer", sans-serif;
    color: #1f2937;
    background: #ffffff;
    font-size: 13px;
    line-height: 1.5;
  }

  .header {
    text-align: center;
    margin-bottom: 6px;
    margin-top: 8px;
  }

  .brand {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 4px;
  }

  .subtitle {
    color: #6b7280;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .period {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-top: 6px;
  }

  .generated {
    color: #9ca3af;
    font-size: 11px;
    margin-top: 2px;
  }

  .divider {
    border-top: 1px solid #e5e7eb;
    margin: 14px 0;
  }

  .summary-card {
    background: #1f2937;
    border-radius: 12px;
    padding: 16px 12px;
    overflow: hidden;
  }

  .summary-table {
    width: 100%;
    border-collapse: collapse;
  }

  .summary-table td {
    text-align: center;
    color: #ffffff;
    vertical-align: top;
    width: 33%;
  }

  .summary-table .label {
    font-size: 11px;
    opacity: 0.85;
  }

  .summary-table .value {
    font-size: 20px;
    font-weight: bold;
    margin-top: 3px;
  }

  .section-title {
    font-size: 15px;
    font-weight: bold;
    margin: 18px 0 8px;
  }

  .section-title .english {
    color: #9ca3af;
    font-size: 11px;
    font-weight: normal;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: 6px;
  }

  table.data {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
  }

  table.data th {
    background: #f3f4f6;
    text-align: left;
    padding: 9px 10px;
    font-size: 12px;
  }

  table.data td {
    padding: 9px 10px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 12px;
  }

  .right {
    text-align: right;
  }

  .empty {
    text-align: center;
    color: #9ca3af;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 12px;
  }

  .total-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px;
    background: #2563eb;
    color: #ffffff;
    padding: 14px 16px;
    margin-top: 18px;
    font-size: 15px;
    font-weight: bold;
  }

  .total-bar .amount {
    font-size: 18px;
  }

  .footer {
    text-align: center;
    color: #9ca3af;
    margin-top: 26px;
    font-size: 11px;
  }
</style>
</head>

<body>

  <!-- =========================================================
       HEADER
  ========================================================= -->

  <div class="header">
    <div class="brand">DBM App</div>

    <div class="title">របាយការណ៍ចំណូលប្រចាំខែ</div>

    <div class="subtitle">Monthly Income Report</div>

    <div class="period">${escapeHtml(periodLabel)}</div>

    <div class="generated">Generated: ${escapeHtml(generatedLabel)}</div>
  </div>

  <div class="divider"></div>

  <!-- =========================================================
       SUMMARY
  ========================================================= -->

  <div class="summary-card">
    <table class="summary-table">
      <tr>
        <td>
          <div class="label">ចំណូលសរុប<br /><span>Total Income</span></div>
          <div class="value">${formatCurrency(summary.totalIncome)}</div>
        </td>
        <td>
          <div class="label">ការបញ្ជាទិញ<br /><span>Orders</span></div>
          <div class="value">${Number(summary.orderCount || 0)}</div>
        </td>
        <td>
          <div class="label">បំណុលសរុប<br /><span>Total Debt</span></div>
          <div class="value">${formatCurrency(summary.totalDebt)}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- =========================================================
       INCOME DETAILS
  ========================================================= -->

  <div class="section-title">
    ចំណូលប្រចាំថ្ងៃ
    <span class="english">Income Details</span>
  </div>

  <table class="data">
    <thead>
      <tr>
        <th>កាលបរិច្ឆេទ</th>
        <th class="right">ចំនួនទឹកប្រាក់</th>
      </tr>
    </thead>
    <tbody>
      ${
        summary.dailyChart.length > 0
          ? dailyRows
          : `
      <tr>
        <td colspan="2" class="empty">
          មិនមានទិន្នន័យចំណូលសម្រាប់ខែនេះទេ
        </td>
      </tr>
      `
      }
    </tbody>
  </table>

  <!-- =========================================================
       CUSTOMERS
  ========================================================= -->

  ${
    summary.debtors.length > 0
      ? `
  <div class="section-title">
    ចំណូលអតិថិជនសរុប
    <span class="english">Customers</span>
  </div>

  <table class="data">
    <thead>
      <tr>
        <th>អតិថិជន</th>
        <th class="right">ចំនួនទឹកប្រាក់</th>
      </tr>
    </thead>
    <tbody>
      ${debtorRows}
    </tbody>
  </table>
  `
      : ""
  }

  <!-- =========================================================
       TOTAL
  ========================================================= -->

  <div class="total-bar">
    <span>សរុបចំណូល / Total Income</span>
    <span class="amount">${formatCurrency(summary.totalIncome)}</span>
  </div>

  <div class="footer">Generated by DBM App</div>

</body>
</html>
`;
}

/**
 * Shared report PDF generator.
 *
 * Renders the HTML to a PDF file with `expo-print`, then on native platforms
 * copies it to a named file in the app cache so the shared/saved file uses the
 * desired dynamic file name.
 */
export async function generateReportPdfFile(
  html: string,
  fileName: string
): Promise<IncomeReportPdfResult> {
  const result = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (!result.uri) {
    throw new Error("PDF URI was not generated");
  }

  /*
   * printToFileAsync names the output file automatically, so copy it to a
   * named file in the app cache on native platforms. Falls back to the raw
   * output (default name) if the copy fails for any reason.
   */
  if (Platform.OS !== "web") {
    try {
      const reportDirectory = new Directory(
        Paths.cache,
        REPORT_DIRECTORY
      );

      if (!reportDirectory.exists) {
        reportDirectory.create({ intermediates: true });
      }

      const destination = new File(reportDirectory, fileName);

      await new File(result.uri).copy(destination, {
        overwrite: true,
      });

      return { uri: destination.uri, fileName, html };
    } catch (error) {
      if (__DEV__) {
        console.error(
          "[IncomeReport] Failed to name PDF file, using default name:",
          error
        );
      }
    }
  }

  return { uri: result.uri, fileName, html };
}

export async function generateMonthlyIncomeReport(
  input: GenerateMonthlyIncomeReportInput
): Promise<MonthlyIncomeReportResult> {
  const html = buildMonthlyIncomeReportHtml(input);
  const fileName = monthlyIncomeReportFileName(input.month, input.year);

  return generateReportPdfFile(html, fileName);
}