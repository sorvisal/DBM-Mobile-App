import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { CustomerOrderHistoryList } from "../components/CustomerOrderHistoryList";
import { CustomerAvatar } from "../components/CustomerAvatar";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";

type CustomerOrderHistoryScreenProps = {
  customerId: string;
  onBack: () => void;
};

export function CustomerOrderHistoryScreen({ customerId, onBack }: CustomerOrderHistoryScreenProps) {
  const { customer, isLoading, isRefreshing, error, refresh } = useCustomerDetail(customerId);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">ប្រវត្តិការបញ្ជាទិញ</Text>
        </View>

        <Ionicons name="filter-outline" size={24} color="#1F2937" />
      </View>

      {isLoading && !customer ? (
        <LoadingState text="កំពុងផ្ទុកប្រវត្តិការបញ្ជាទិញ..." />
      ) : error && !customer ? (
        <ErrorState onRetry={refresh} />
      ) : !customer ? (
        <View className="flex-1 items-center justify-center" style={{ minHeight: 0 }}>
          <EmptyState icon="person-outline" text="រកមិនឃើញអតិថិជន" />
        </View>
      ) : (
        <CustomerOrderHistoryList
          orders={customer.orders}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          error={error}
          onRefresh={refresh}
          onRetry={refresh}
          ListHeaderComponent={
            <View className="bg-white rounded-2xl p-3 mb-3 flex-row items-center">
              <CustomerAvatar initials={customer.initials} color={customer.avatarColor} size={40} source={customer.imageUrl} />
              <View className="ml-3">
                <Text className="font-khmer text-gray-400 text-[18px]">{customer.code}</Text>
                <Text className="font-khmerMedium text-gray-900 text-xl">{customer.name}</Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}
