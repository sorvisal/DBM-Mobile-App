import { useState } from "react";
import { IncomeOverviewScreen } from "./IncomeOverviewScreen";
import { DailyIncomeDetailScreen } from "./DailyIncomeDetailScreen";
import { MonthlyIncomeDetailScreen } from "./MonthlyIncomeDetailScreen";
import { YearlyIncomeDetailScreen } from "./YearlyIncomeDetailScreen";
import { DebtorsScreen } from "./DebtorsScreen";

type ViewState = "overview" | "daily" | "monthly" | "yearly" | "debtors";

export function IncomeScreen() {
  const [view, setView] = useState<ViewState>("overview");

  if (view === "daily") {
    return <DailyIncomeDetailScreen onBack={() => setView("overview")} />;
  }

  if (view === "monthly") {
    return (
      <MonthlyIncomeDetailScreen
        onBack={() => setView("overview")}
        onGoDebtors={() => setView("debtors")}
      />
    );
  }

  if (view === "yearly") {
    return (
      <YearlyIncomeDetailScreen
        onBack={() => setView("overview")}
        onGoDebtors={() => setView("debtors")}
      />
    );
  }

  if (view === "debtors") {
    return <DebtorsScreen 
    onBack={() => setView("overview")} 
    />;
  }

  return (
    <IncomeOverviewScreen
      onGoDaily={() => setView("daily")}
      onGoMonthly={() => setView("monthly")}
      onGoYearly={() => setView("yearly")}
      onGoDebtors={() => setView("debtors")}
    />
  );
}