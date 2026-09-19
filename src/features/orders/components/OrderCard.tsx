import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Order,
} from "../types/types";
import { OrderStatusBadge } from "./OrderStatusBadge";

const USD_TO_KHR = 4046.81;

type OrderCardProps = {
  order: Order;
  onPress: () => void;
};

const formatUSD = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

const formatKHR = (amount: number) => {
  return `${Math.round(amount).toLocaleString(
    "en-US"
  )} ៛`;
};

export function OrderCard({
  order,
  onPress,
}: OrderCardProps) {

  const isKHRPayment =
    order.paymentMethod === "cash";

  const displayTotal = isKHRPayment
    ? formatKHR(
        order.total * USD_TO_KHR
      )
    : formatUSD(order.total);

  const cardContent = (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >

      <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center">
        <Ionicons
          name="receipt-outline"
          size={26}
          color="#2563EB"
        />
      </View>
      <View className="flex-1 ml-3">
        {/* CODE + STATUS */}

        <View className="flex-row items-center justify-between">
          <Text
            className="font-khmerMedium text-gray-900 text-xl flex-1 mr-2"
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {order.code}
          </Text>

          <OrderStatusBadge
            status={order.status}
          />
        </View>

        {/* CUSTOMER */}

        <Text
          className="font-khmerMedium text-gray-400 text-[17px] mt-1"
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {order.customer.name}
        </Text>

        {/* DATE + TOTAL */}

        <View className="flex-row items-center justify-between mt-1.5">
          <Text
            className="font-khmer text-gray-400 text-[15px]"
            maxFontSizeMultiplier={1.3}
          >
            {order.createdAt}
          </Text>

          {/* TOTAL */}

          <View className="items-end">
            <Text
              className="font-khmerBold text-gray-900 text-xl"
              maxFontSizeMultiplier={1.3}
            >
              {displayTotal}
            </Text>

            {/* Show USD equivalent for KHR */}

            {isKHRPayment && (
              <Text
                className="font-khmer text-gray-400 text-base mt-0.5"
                maxFontSizeMultiplier={1.2}
              >
                ({formatUSD(
                  order.total
                )})
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return cardContent;
}