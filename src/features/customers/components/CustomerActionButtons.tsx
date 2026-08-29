import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsive } from "@/hooks/useResponsive";
import { Customer } from "../types/customer.types";

type CustomerActionButtonsProps = {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
};

export function CustomerActionButtons({ customer, onEdit, onDelete }: CustomerActionButtonsProps) {
  const { isSmallPhone } = useResponsive();
  const labelSize = isSmallPhone ? 14 : 16;

  return (
    <View>
      <Text className="font-khmerBold text-gray-900 text-xl mb-2 mt-2" maxFontSizeMultiplier={1.3}>សកម្មភាព</Text>
      <View className="flex-row gap-3 ">
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${customer.phone.replace(/\s/g, "")}`)}
          className="flex-1 bg-white rounded-2xl py-4 items-center border border-gray-50 shadow-black/5 shadow-sm"
        >
          <Ionicons name="call-outline" size={22} color="#2563EB" />
          <Text className="font-khmer text-gray-700 mt-2 text-center" numberOfLines={2} maxFontSizeMultiplier={1.3} style={{ fontSize: labelSize }}>ហៅទូរស័ព្ទ</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onEdit} className="flex-1 bg-white rounded-2xl py-4 items-center border border-gray-50 shadow-black/5 shadow-sm">
          <Ionicons name="create-outline" size={22} color="#4B5563" />
          <Text className="font-khmer text-gray-700 mt-2 text-center" numberOfLines={2} maxFontSizeMultiplier={1.3} style={{ fontSize: labelSize }}>កែប្រែព័ត៌មាន</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} className="flex-1 bg-white rounded-2xl py-4 items-center border border-gray-50 shadow-black/5 shadow-sm">
          <Ionicons name="trash-outline" size={22} color="#DC2626" />
          <Text className="font-khmer text-red-500 mt-2 text-center" numberOfLines={2} maxFontSizeMultiplier={1.3} style={{ fontSize: labelSize }}>លុបអតិថិជន</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}