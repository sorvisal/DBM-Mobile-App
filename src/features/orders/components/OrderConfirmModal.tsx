import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type OrderConfirmModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function OrderConfirmModal({ visible, onConfirm, onCancel }: OrderConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/30 items-center justify-center px-8">
        <View className="bg-white rounded-2xl w-full max-w-xs p-6 items-center">
          <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
          </View>

          <Text className="font-khmerBold text-gray-900 text-base text-center">
            បញ្ជាក់ការទិញជោគជ័យ!
          </Text>
          <Text className="font-khmer text-gray-400 text-xs text-center mt-1.5">
            តើអ្នកចង់បញ្ជាក់ការទិញនេះឬទេ ដើម្បីចាប់ផ្តើមដឹកជញ្ជូន?
          </Text>

          <TouchableOpacity
            onPress={onConfirm}
            className="bg-blue-600 rounded-xl h-12 items-center justify-center w-full mt-5"
          >
            <Text className="font-khmerBold text-white text-sm">យល់ព្រម</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} className="items-center justify-center w-full mt-2 py-2">
            <Text className="font-khmer text-gray-400 text-xs">បោះបង់</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}