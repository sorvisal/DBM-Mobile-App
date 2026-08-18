import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Customer, CustomerStatus } from "../types/customer.types";
import { CustomerAvatar } from "./CustomerAvatar";

type CustomerCardProps = {
  customer: Customer;
  onPress: () => void;
};

export function CustomerCard({ customer, onPress }: CustomerCardProps) {
  const isActive = customer.status === CustomerStatus.Active;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <CustomerAvatar initials={customer.initials} color={customer.avatarColor} source={customer.imageUrl} />

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
            {customer.name}
          </Text>
          <View className={`rounded-full px-2 py-0.5 ${isActive ? "bg-green-50" : "bg-orange-50"}`}>
            <Text className={`font-khmer text-[16px] ${isActive ? "text-green-600" : "text-orange-600"}`}>
              {isActive ? "សកម្ម" : "មិនសកម្ម"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="call-outline" size={11} color="#9CA3AF" />
          <Text className="font-khmer text-gray-400 text-[16px] ml-1">{customer.phone}</Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={11} color="#9CA3AF" />
          <Text className="font-khmer text-gray-400 text-[16px] ml-1" numberOfLines={1}>
            {customer.location}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-1.5">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
            <Text className="font-khmer text-gray-400 text-[16px] ml-1">
              {customer.totalOrders} ការបញ្ជាទិញ
            </Text>
          </View>
          <Text className="font-khmerBold text-gray-900 text-xl">${customer.totalSpent.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}