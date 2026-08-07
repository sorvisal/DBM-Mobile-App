import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderStatus }  from "../types/types";

type OrderStepperProps = {
  status: OrderStatus;
};

const STEPS = [
  { key: OrderStatus.Confirmed, label: "បញ្ជាក់" },
  { key: OrderStatus.Shipping, label: "កំពុងដឹក" },
  { key: OrderStatus.Completed, label: "បានបញ្ចប់" },
];

function getStepIndex(status: OrderStatus) {
  if (status === OrderStatus.Pending) return -1;
  if (status === OrderStatus.Confirmed) return 0;
  if (status === OrderStatus.Shipping) return 1;
  return 2;
}

export function OrderStepper({ status }: OrderStepperProps) {
  const currentIndex = getStepIndex(status);

  return (
    <View className="flex-row items-center">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex || (index === currentIndex && status === OrderStatus.Completed) || (status === OrderStatus.Completed);
        const isActive = index === currentIndex && status !== OrderStatus.Completed;
        const isUpcoming = index > currentIndex;

        return (
          <View key={step.key} className="flex-1 items-center">
            <View className="flex-row items-center w-full">
              {index !== 0 && (
                <View className={`flex-1 h-0.5 ${index <= currentIndex ? "bg-green-500" : "bg-gray-200"}`} />
              )}
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  isDone
                    ? "bg-green-500"
                    : isActive
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color="white" />
                ) : (
                  <View className={`w-2 h-2 rounded-full ${isUpcoming ? "bg-gray-400" : "bg-white"}`} />
                )}
              </View>
              {index !== STEPS.length - 1 && (
                <View className={`flex-1 h-0.5 ${index < currentIndex ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </View>
            <Text
              className={`font-khmer text-[10px] mt-1.5 ${
                isDone || isActive ? "text-gray-900" : "text-gray-400"
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