import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { StockStackNavigator } from "./StockStackNavigator";

type Props = {
  activeTab: string;
};

export function MainTabNavigator({ activeTab }: Props) {
  switch (activeTab) {
    case "stock":
      return <StockStackNavigator />;

    case "dashboard":
    default:
      return <DashboardScreen />;
  }
}