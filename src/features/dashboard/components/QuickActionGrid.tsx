import { View } from "react-native";
import { QuickAction } from "../types/dashboard.types";
import { QuickActionCard } from "./QuickActionCard";

type QuickActionGridProps = {
  actions: QuickAction[];
  onPressAction?: (key: string) => void;
};

export function QuickActionGrid({ actions, onPressAction }: QuickActionGridProps) {
  return (
    <View className="flex-row flex-wrap px-5 mt-4 gap-3">
      {actions.map((action) => (
        <QuickActionCard key={action.key} action={action} onPress={() => onPressAction?.(action.key)} />
      ))}
    </View>
  );
}