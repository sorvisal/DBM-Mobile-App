import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AssignDriverValues = {
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
};

type AssignDriverModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: AssignDriverValues) => void;
  loading: boolean;
};

const androidInputStyle = {
  paddingVertical: 0,
  includeFontPadding: false,
  textAlignVertical: "center" as const,
};

export function AssignDriverModal({ visible, onCancel, onSubmit, loading }: AssignDriverModalProps) {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");

  useEffect(() => {
    if (visible) {
      setDriverName("");
      setDriverPhone("");
      setVehiclePlate("");
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        className="flex-1 bg-black/30 justify-end"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="bg-white rounded-t-2xl p-5 pb-8">
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full bg-gray-200 mb-4" />
            <View className="w-14 h-14 rounded-full bg-teal-50 items-center justify-center mb-2">
              <Ionicons name="bicycle" size={30} color="#0D9488" />
            </View>
            <Text className="font-khmerBold text-gray-900 text-2xl">កំណត់ការដឹកជញ្ជូន</Text>
            <Text className="font-khmer text-gray-400 text-lg mt-1">
              បញ្ចូលព័ត៌មានអ្នកដឹកជញ្ជូន ដើម្បីចាប់ផ្តើមដឹកជញ្ជូន
            </Text>
          </View>

          <Text className="font-khmerMedium text-gray-900 text-xl mb-1.5">
            ឈ្មោះអ្នកដឹកជញ្ជូន <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={driverName}
            onChangeText={setDriverName}
            placeholder="បញ្ចូលឈ្មោះអ្នកដឹកជញ្ជូន"
            placeholderTextColor="#9CA3AF"
            className="font-khmer bg-gray-100 rounded-xl px-4 h-12 mb-4 text-lg text-gray-800"
            style={androidInputStyle}
          />

          <Text className="font-khmerMedium text-gray-900 text-xl mb-1.5">
            ទូរស័ព្ទអ្នកដឹកជញ្ជូន
          </Text>
          <TextInput
            value={driverPhone}
            onChangeText={setDriverPhone}
            placeholder="បញ្ចូលលេខទូរស័ព្ទ"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            className="font-khmer bg-gray-100 rounded-xl px-4 h-12 mb-4 text-lg text-gray-800"
            style={androidInputStyle}
          />
          <TouchableOpacity
            onPress={() => onSubmit({ driverName, driverPhone, vehiclePlate })}
            disabled={loading || !driverName.trim()}
            className="bg-blue-600 rounded-xl h-12 items-center justify-center w-full"
          >
            <Text className="font-khmerBold text-white text-xl">រក្សាទុក</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} disabled={loading} className="items-center justify-center w-full mt-2 py-2">
            <Text className="font-khmer text-gray-400 text-xl">បោះបង់</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
