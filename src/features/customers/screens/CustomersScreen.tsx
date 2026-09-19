import { useEffect, useState } from "react";
import { CustomerListScreen } from "./CustomerListScreen";
import { CustomerDetailScreen } from "./CustomerDetailScreen";
import { CustomerOrderHistoryScreen } from "./CustomerOrderHistoryScreen";

type ViewState =
  | { view: "list" }
  | { view: "detail"; customerId: string }
  | { view: "history"; customerId: string };

type CustomersScreenProps = {
  onChromeChange?: (hidden: boolean) => void;
  /** Deep-link: customer id to open (from a notification). */
  openCustomerId?: string | null;
  /** Called once `openCustomerId` has been consumed. */
  onOpenCustomerHandled?: () => void;
};

export function CustomersScreen({
  onChromeChange,
  openCustomerId,
  onOpenCustomerHandled,
}: CustomersScreenProps) {
  const [state, setState] = useState<ViewState>({ view: "list" });

  useEffect(() => {
    onChromeChange?.(state.view !== "list");
  }, [state.view, onChromeChange]);

  useEffect(() => {
    if (!openCustomerId) return;
    setState({ view: "detail", customerId: openCustomerId });
    onOpenCustomerHandled?.();
  }, [openCustomerId, onOpenCustomerHandled]);

  if (state.view === "detail") {
    return (
      <CustomerDetailScreen
        customerId={state.customerId}
        onBack={() => setState({ view: "list" })}
        onViewHistory={(customerId) => setState({ view: "history", customerId })}
      />
    );
  }

  if (state.view === "history") {
    return (
      <CustomerOrderHistoryScreen
        customerId={state.customerId}
        onBack={() => setState({ view: "detail", customerId: state.customerId })}
      />
    );
  }

  return <CustomerListScreen onSelectCustomer={(customerId) => setState({ view: "detail", customerId })} />;
}