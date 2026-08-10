import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Customer } from "../types/customer.types";

type CustomerSpendingCardProps = {
  customer: Customer;
};

export function CustomerSpendingCard({ customer }: CustomerSpendingCardProps) {
  return (
    <View>
      <Text className="font-khmerBold text-gray-900 text-xl mb-3">សង្ខេប</Text>

      <View className="flex-row gap-3 mb-5">
        <View className="flex-1 bg-white rounded-2xl p-4 items-center">
          <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mb-2">
            <Ionicons name="bag-handle-outline" size={24} color="#2563EB" />
          </View>
          <Text className="font-khmer text-gray-400 text-[17px]">សរុបការបញ្ជាទិញ</Text>
          <Text className="font-khmerBold text-gray-900 text-2xl mt-0.5">{customer.totalOrders}</Text>
          <Text className="font-khmer text-gray-400 text-[17px]">ការបញ្ជាទិញ</Text>
        </View>

        <View className="flex-1 bg-white rounded-2xl p-4 items-center">
          <View className="w-11 h-11 rounded-full bg-green-50 items-center justify-center mb-2">
            <Ionicons name="cash-outline" size={24} color="#16A34A" />
          </View>
          <Text className="font-khmer text-gray-400 text-[17px]">សរុបប្រាក់</Text>
          <Text className="font-khmerBold text-green-600 text-2xl mt-0.5">${customer.totalSpent.toFixed(2)}</Text>
          <Text className="font-khmer text-gray-400 text-[17px]">សរុប</Text>
        </View>
      </View>

      <Text className="font-khmerBold text-gray-900 text-xl mb-2 mt-3">ព័ត៌មានបន្ថែម</Text>
      <View className="bg-white rounded-2xl p-4 mb-5">
        <View className="flex-row items-center justify-between py-2 border-b border-gray-50">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
            <Text className="font-khmer text-gray-500 text-xl ml-2">ចូលរួមបញ្ជាទិញ</Text>
          </View>
          <Text className="font-khmer text-gray-800 text-xl">{customer.memberSince}</Text>
        </View>

        <View className="flex-row items-center justify-between py-2 border-b border-gray-50">
          <View className="flex-row items-center">
            <Ionicons name="pricetag-outline" size={16} color="#9CA3AF" />
            <Text className="font-khmer text-gray-500 text-xl ml-2">ប្រភេទអតិថិជន</Text>
          </View>
          <Text className="font-khmer text-gray-800 text-xl">{customer.customerType}</Text>
        </View>

        <View className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={16} color="#9CA3AF" />
            <Text className="font-khmer text-gray-500 text-xl ml-2">ការពិពណ៌នា</Text>
          </View>
          <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4" numberOfLines={2}>
            {customer.note}
          </Text>
        </View>
      </View>
    </View>
  );
}