import { View, Text } from "react-native";

type OrderSummaryProps = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export function OrderSummary({ subtotal, deliveryFee, total }: OrderSummaryProps) {
  return (
    <View className="mt-2">
      <View className="flex-row items-center justify-between py-1">
        <Text className="font-khmer text-gray-500 text-xs">សរុបរង</Text>
        <Text className="font-khmer text-gray-800 text-xs">${subtotal.toFixed(2)}</Text>
      </View>
      <View className="flex-row items-center justify-between py-1">
        <Text className="font-khmer text-gray-500 text-xs">ថ្លៃដឹកជញ្ជូន</Text>
        <Text className="font-khmer text-gray-800 text-xs">${deliveryFee.toFixed(2)}</Text>
      </View>
      <View className="flex-row items-center justify-between pt-2 mt-1 border-t border-gray-100">
        <Text className="font-khmerBold text-gray-900 text-sm">សរុប</Text>
        <Text className="font-khmerBold text-blue-600 text-base">${total.toFixed(2)}</Text>
      </View>
    </View>
  );
}