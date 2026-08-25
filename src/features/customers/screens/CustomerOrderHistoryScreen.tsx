import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { CustomerOrderHistoryList } from "../components/CustomerOrderHistoryList";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { CustomerInfoCard } from "../components/CustomerInfoCard";

type CustomerOrderHistoryScreenProps = {
  customerId: string;
  onBack: () => void;
};

export function CustomerOrderHistoryScreen({ customerId, onBack }: CustomerOrderHistoryScreenProps) {
  const { customer, isLoading, isRefreshing, error, refresh } = useCustomerDetail(customerId);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-5 pb-5 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-black text-2xl">ប្រវត្តិការបញ្ជាទិញ</Text>
        </View>

        <Ionicons name="filter-outline" size={24} color="black" />
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
            /* Removed the extra wrapper and added a bottom margin so it separates nicely from the list */
            <View className="mb-3">
              <CustomerInfoCard customer={customer} />
            </View>
          }
        />
      )}
    </View>
  );
}