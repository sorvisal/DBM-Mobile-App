import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Customer } from "../types/customer.types";

type CustomerActionButtonsProps = {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
};

export function CustomerActionButtons({ customer, onEdit, onDelete }: CustomerActionButtonsProps) {
  return (
    <View>
      <Text className="font-khmerBold text-gray-900 text-xl mb-2 mt-2">សកម្មភាព</Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${customer.phone.replace(/\s/g, "")}`)}
          className="flex-1 bg-white rounded-2xl py-4 items-center"
        >
          <Ionicons name="call-outline" size={22} color="#2563EB" />
          <Text className="font-khmer text-gray-700 text-[16px] mt-2">ហៅទូរស័ព្ទ</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onEdit} className="flex-1 bg-white rounded-2xl py-4 items-center">
          <Ionicons name="create-outline" size={22} color="#4B5563" />
          <Text className="font-khmer text-gray-700 text-[16px] mt-2">កែប្រែព័ត៌មាន</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} className="flex-1 bg-white rounded-2xl py-4 items-center">
          <Ionicons name="trash-outline" size={22} color="#DC2626" />
          <Text className="font-khmer text-red-500 text-[16px] mt-2">លុបអតិថិជន</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}