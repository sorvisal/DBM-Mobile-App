import { useState, useEffect } from "react";
import { IncomeOverviewScreen } from "./IncomeOverviewScreen";
import { DailyIncomeDetailScreen } from "./DailyIncomeDetailScreen";
import { MonthlyIncomeDetailScreen } from "./MonthlyIncomeDetailScreen";
import { YearlyIncomeDetailScreen } from "./YearlyIncomeDetailScreen";
import { DebtorsScreen } from "./DebtorsScreen";

type ViewState = "overview" | "daily" | "monthly" | "yearly" | "debtors";

type IncomeScreenProps = {
  onChromeChange?: (hidden: boolean) => void;
  isActive?: boolean;
  /** Deep-link: debtor (customer) id to open (from a notification). */
  openDebtorId?: string | null;
  /** Called once `openDebtorId` has been consumed. */
  onOpenDebtorHandled?: () => void;
};

export function IncomeScreen({
  onChromeChange,
  isActive,
  openDebtorId,
  onOpenDebtorHandled,
}: IncomeScreenProps) {
  const [view, setView] = useState<ViewState>("overview");

  // Hide MainLayout header & footer whenever we are inside any detail/sub-screen
  useEffect(() => {
    onChromeChange?.(view !== "overview");
  }, [view, onChromeChange]);

  useEffect(() => {
    if (!openDebtorId) return;
    setView("debtors");
  }, [openDebtorId]);

  if (view === "daily") {
    return <DailyIncomeDetailScreen onBack={() => setView("overview")} />;
  }

  if (view === "monthly") {
    return (
      <MonthlyIncomeDetailScreen
        onBack={() => setView("overview")}
      />
    );
  }

  if (view === "yearly") {
    return <YearlyIncomeDetailScreen onBack={() => setView("overview")} />;
  }

  if (view === "debtors") {
    return (
      <DebtorsScreen
        onBack={() => setView("overview")}
        isActive={isActive}
        openDebtorId={openDebtorId}
        onOpenDebtorHandled={onOpenDebtorHandled}
      />
    );
  }

  return (
    <IncomeOverviewScreen
      isActive={isActive}
      onGoDaily={() => setView("daily")}
      onGoMonthly={() => setView("monthly")}
      onGoYearly={() => setView("yearly")}
      onGoDebtors={() => setView("debtors")}
    />
  );
}