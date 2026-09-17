import type { YearlyIncomeSummary } from "../types/income.types";
import {
  MONTH_NAMES,
  escapeHtml,
  formatCurrency,
  formatGeneratedDate,
  generateReportPdfFile,
  type IncomeReportPdfResult,
} from "./generateMonthlyIncomeReport";

export type GenerateYearlyIncomeReportInput = {
  year: number;
  summary: YearlyIncomeSummary;
};

export type YearlyIncomeReportResult = IncomeReportPdfResult;

/**
 * Dynamic PDF file name based on the SELECTED year.
 *
 * Examples:
 *  year 2026 -> "Yearly-Income-Report-2026.pdf"
 *  year 2027 -> "Yearly-Income-Report-2027.pdf"
 */
export function yearlyIncomeReportFileName(year: number): string {
  return `Yearly-Income-Report-${year}.pdf`;
}

/**
 * Formats a monthly chart label as a human-readable month name when the
 * backend returns plain month numbers (1-12). Any other label is kept as-is.
 */
function monthlyRowLabel(label: string): string {
  const monthNumber = Number(label);

  if (
    Number.isInteger(monthNumber) &&
    monthNumber >= 1 &&
    monthNumber <= 12
  ) {
    return MONTH_NAMES[monthNumber - 1];
  }

  return label;
}

export function buildYearlyIncomeReportHtml(
  input: GenerateYearlyIncomeReportInput
): string {
  const { year, summary } = input;

  const generatedLabel = formatGeneratedDate(new Date());

  const monthlyRows = summary.monthlyChart
    .map(
      (point) => `
        <tr>
          <td>${escapeHtml(monthlyRowLabel(point.label))}</td>
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

  const growthPercent = Number(summary.growthPercent || 0);
  const growthDisplay =
    growthPercent > 0 ? `▲${growthPercent}%` : "0%";

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
    padding: 14px 12px;
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
    width: 50%;
    padding: 7px 6px;
  }

  .summary-table .label {
    font-size: 11px;
    opacity: 0.85;
  }

  .summary-table .value {
    font-size: 18px;
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

    <div class="title">របាយការណ៍ចំណូលប្រចាំឆ្នាំ</div>

    <div class="subtitle">Yearly Income Report</div>

    <div class="period">Year: ${escapeHtml(String(year))}</div>

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
      </tr>
      <tr>
        <td>
          <div class="label">កំណើន<br /><span>Growth</span></div>
          <div class="value">${escapeHtml(growthDisplay)}</div>
        </td>
        <td>
          <div class="label">បំណុលសរុប<br /><span>Total Debt</span></div>
          <div class="value">${formatCurrency(summary.totalDebt)}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- =========================================================
       MONTHLY INCOME
  ========================================================= -->

  <div class="section-title">
    ចំណូលប្រចាំខែ
    <span class="english">Monthly Income</span>
  </div>

  <table class="data">
    <thead>
      <tr>
        <th>ខែ</th>
        <th class="right">ចំនួនទឹកប្រាក់</th>
      </tr>
    </thead>
    <tbody>
      ${
        summary.monthlyChart.length > 0
          ? monthlyRows
          : `
      <tr>
        <td colspan="2" class="empty">
          មិនមានទិន្នន័យចំណូលសម្រាប់ឆ្នាំនេះទេ
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

export async function generateYearlyIncomeReport(
  input: GenerateYearlyIncomeReportInput
): Promise<YearlyIncomeReportResult> {
  const html = buildYearlyIncomeReportHtml(input);
  const fileName = yearlyIncomeReportFileName(input.year);

  return generateReportPdfFile(html, fileName);
}