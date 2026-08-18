import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderStatus } from "../types/types";

type OrderStepperProps = {
  status: OrderStatus;
};

const STEPS = [
  { key: OrderStatus.Confirmed, label: "បញ្ជាក់", icon: "checkmark" as const },
  { key: OrderStatus.Shipping, label: "កំពុងដឹក", icon: "bicycle" as const },
  { key: OrderStatus.Completed, label: "បញ្ចប់", icon: "checkmark-done" as const },
];

function getStepIndex(status: OrderStatus) {
  if (status === OrderStatus.New || status === OrderStatus.Pending) return -1;
  if (status === OrderStatus.Confirmed) return 0;
  if (status === OrderStatus.Shipping) return 1;
  return 2; // Completed or Cancelled treated as fully passed
}

export function OrderStepper({ status }: OrderStepperProps) {
  const currentIndex = getStepIndex(status);

  return (
    <View className="flex-row items-start">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        const isCompleted = status === OrderStatus.Completed;
        const showAsDone = isDone || (isActive && isCompleted);

        return (
          <View key={step.key} className="flex-1 items-center">
            <View className="flex-row items-center w-full">
              <View
                className={`flex-1 h-0.5 ${
                  index === 0 ? "opacity-0" : isDone || showAsDone ? "bg-green-500" : "bg-gray-200"
                }`}
              />
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${
                  showAsDone ? "bg-green-500" : isActive ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <Ionicons
                  name={showAsDone ? "checkmark" : isActive ? step.icon : "ellipse"}
                  size={showAsDone || isActive ? 16 : 8}
                  color={isActive || showAsDone ? "white" : "#9CA3AF"}
                />
              </View>
              <View
                className={`flex-1 h-0.5 ${
                  index === STEPS.length - 1 ? "opacity-0" : showAsDone ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            </View>
            <Text
              className={`font-khmer text-[14px] mt-1.5 ${
                showAsDone || isActive ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}