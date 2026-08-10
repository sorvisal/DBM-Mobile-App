import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { CustomerOrderHistoryList } from "../components/CustomerOrderHistoryList";

type CustomerOrderHistoryScreenProps = {
  customerId: string;
  onBack: () => void;
};

export function CustomerOrderHistoryScreen({ customerId, onBack }: CustomerOrderHistoryScreenProps) {
  const { customer } = useCustomerDetail(customerId);

  if (!customer) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center" style={{ minHeight: 0 }}>
        <Text className="font-khmer text-gray-400 text-sm">រកមិនឃើញអតិថិជន</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={30} color="#1F2937" />
        </TouchableOpacity>

        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">ប្រវត្តិការបញ្ជាទិញ</Text>
        </View>

        <Ionicons name="filter-outline" size={30} color="#1F2937" />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-3 mb-3 flex-row items-center">
          <View
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: customer.avatarColor }}
            className="items-center justify-center"
          >
            <Text className="font-khmerBold text-white text-xl">{customer.initials}</Text>
          </View>
          <View className="ml-3">
            <Text className="font-khmer text-gray-400 text-[18px]">{customer.code}</Text>
            <Text className="font-khmerMedium text-gray-900 text-xl">{customer.name}</Text>
          </View>
        </View>

        <CustomerOrderHistoryList orders={customer.orders} />
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}