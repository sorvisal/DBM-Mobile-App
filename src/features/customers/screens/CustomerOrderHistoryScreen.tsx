import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { CustomerOrderHistoryList } from "../components/CustomerOrderHistoryList";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { CustomerInfoCard } from "../components/CustomerInfoCard";
import { DetailLayout } from "../../../layouts/DetailLayout"; // Adjust relative path to match CustomerDetail.tsx

type CustomerOrderHistoryScreenProps = {
  customerId: string;
  onBack: () => void;
};

export function CustomerOrderHistoryScreen({ customerId, onBack }: CustomerOrderHistoryScreenProps) {
  const { customer, isLoading, isRefreshing, error, refresh } = useCustomerDetail(customerId);

  return (
    <DetailLayout title="ប្រវត្តិការបញ្ជាទិញ" onBack={onBack}>
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
            <View className="mb-2 px-2 pt-0">
              <CustomerInfoCard customer={customer} />
            </View>
          }
        />
      )}
    </DetailLayout>
  );
}