import { View } from "react-native";

import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { CustomerOrderHistoryList } from "../components/CustomerOrderHistoryList";

import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/states";

import { CustomerInfoCard } from "../components/CustomerInfoCard";
import { DetailLayout } from "../../../layouts/DetailLayout";

type CustomerOrderHistoryScreenProps = {
  customerId: string;
  onBack: () => void;
};

export function CustomerOrderHistoryScreen({
  customerId,
  onBack,
}: CustomerOrderHistoryScreenProps) {
  const {
    customer,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useCustomerDetail(customerId);
  if (isLoading && !customer) {
    return (
      <DetailLayout
        title="ប្រវត្តិការបញ្ជាទិញ"
        onBack={onBack}
      >
        <LoadingState
          text="កំពុងផ្ទុកប្រវត្តិការបញ្ជាទិញ..."
        />
      </DetailLayout>
    );
  }

  if (error && !customer) {
    return (
      <DetailLayout
        title="ប្រវត្តិការបញ្ជាទិញ"
        onBack={onBack}
      >
        <ErrorState onRetry={refresh} />
      </DetailLayout>
    );
  }

  if (!customer) {
    return (
      <DetailLayout
        title="ប្រវត្តិការបញ្ជាទិញ"
        onBack={onBack}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ minHeight: 0 }}
        >
          <EmptyState
            icon="person-outline"
            text="រកមិនឃើញអតិថិជន"
          />
        </View>
      </DetailLayout>
    );
  }

  return (
    <DetailLayout
      title="ប្រវត្តិការបញ្ជាទិញ"
      onBack={onBack}
    >
      <CustomerOrderHistoryList
        orders={customer.orders ?? []}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refresh}
        onRetry={refresh}
        ListHeaderComponent={
          <View className="mb-2 px-2 pt-0">
            <CustomerInfoCard
              customer={customer}
            />
          </View>
        }
      />
    </DetailLayout>
  );
}