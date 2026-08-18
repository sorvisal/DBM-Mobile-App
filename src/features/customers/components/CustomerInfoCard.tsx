import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Customer, CustomerStatus } from "../types/customer.types";
import { CustomerAvatar } from "./CustomerAvatar";

type CustomerInfoCardProps = {
  customer: Customer;
};

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  const isActive = customer.status === CustomerStatus.Active;

  return (
    <View className="bg-white rounded-2xl p-4 mb-3">
      <View className="flex-row items-start">
        <CustomerAvatar initials={customer.initials} color={customer.avatarColor} size={56} source={customer.imageUrl} />

        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="font-khmerBold text-gray-900 text-xl">{customer.name}</Text>
            <View className={`rounded-full px-2 py-0.5 ml-2 ${isActive ? "bg-green-50" : "bg-orange-50"}`}>
              <Text className={`font-khmer text-[16px] ${isActive ? "text-green-600" : "text-orange-600"}`}>
                {isActive ? "សកម្ម" : "មិនសកម្ម"}
              </Text>
            </View>
          </View>
          <Text className="font-khmer text-gray-400 text-xl mt-0.5">{customer.code}</Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text className="font-khmer text-gray-500 text-xl ml-2">{customer.phone}</Text>
          </View>
          <View className="flex-row items-center mt-1.5">
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text className="font-khmer text-gray-500 text-xl ml-2">{customer.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}