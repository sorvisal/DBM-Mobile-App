import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { androidInputStyle } from "@/theme/inputStyles";

type DeliveryMethod = "delivery" | "pickup";

type AssignDriverValues = {
  method: DeliveryMethod;
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

export function AssignDriverModal({
  visible,
  onCancel,
  onSubmit,
  loading,
}: AssignDriverModalProps) {
  const [method, setMethod] =
    useState<DeliveryMethod>("delivery");

  const [driverName, setDriverName] =
    useState("");

  const [driverPhone, setDriverPhone] =
    useState("");

  const [vehiclePlate, setVehiclePlate] =
    useState("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setMethod("delivery");
      setDriverName("");
      setDriverPhone("");
      setVehiclePlate("");
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit({
      method,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      vehiclePlate: vehiclePlate.trim(),
    });
  };

  const isDelivery = method === "delivery";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-black/30 justify-end"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View
          className="bg-white rounded-t-2xl p-5 max-h-[90%]"
          style={{
            paddingBottom: Math.max(
              insets.bottom,
              16
            ),
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 8,
            }}
          >
            {/* HEADER */}
            <View className="items-center mb-5">
              <View className="w-10 h-1 rounded-full bg-gray-200 mb-4" />

              <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-2">
                <Ionicons
                  name="cube-outline"
                  size={30}
                  color="#2563EB"
                />
              </View>

              <Text
                className="font-khmerBold text-gray-900 text-2xl text-center"
                maxFontSizeMultiplier={1.3}
              >
                កំណត់ការទទួលទំនិញ
              </Text>

              <Text
                className="font-khmer text-gray-400 text-lg mt-1 text-center"
                maxFontSizeMultiplier={1.3}
              >
                ជ្រើសរើសរបៀបទទួលទំនិញ
              </Text>
            </View>

            {/* DELIVERY METHOD */}
            <Text className="font-khmerBold text-gray-900 text-xl mb-3">
              របៀបទទួលទំនិញ
            </Text>

            <View className="flex-row gap-3 mb-5">
              {/* DELIVERY */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setMethod("delivery")
                }
                className={`flex-1 rounded-2xl border-2 p-4 ${
                  method === "delivery"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="items-center">
                  <Ionicons
                    name="bicycle-outline"
                    size={32}
                    color={
                      method === "delivery"
                        ? "#2563EB"
                        : "#6B7280"
                    }
                  />

                  <Text
                    className={`font-khmerBold text-lg mt-2 ${
                      method === "delivery"
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    ដឹកជញ្ជូន
                  </Text>

                  <Text className="font-khmer text-gray-400 text-sm mt-1 text-center">
                    អ្នកដឹកជញ្ជូន
                  </Text>
                </View>
              </TouchableOpacity>

              {/* PICKUP */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setMethod("pickup")
                }
                className={`flex-1 rounded-2xl border-2 p-4 ${
                  method === "pickup"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="items-center">
                  <Ionicons
                    name="storefront-outline"
                    size={32}
                    color={
                      method === "pickup"
                        ? "#16A34A"
                        : "#6B7280"
                    }
                  />

                  <Text
                    className={`font-khmerBold text-lg mt-2 ${
                      method === "pickup"
                        ? "text-green-600"
                        : "text-gray-700"
                    }`}
                  >
                    ទីតាំងផ្ទាល់
                  </Text>

                  <Text className="font-khmer text-gray-400 text-sm mt-1 text-center">
                    មកដល់ទីតាំងដេប៉ូ
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* DELIVERY FORM */}
            {isDelivery && (
              <>
                <Text className="font-khmerMedium text-gray-900 text-xl mb-1.5">
                  ឈ្មោះអ្នកដឹកជញ្ជូន{" "}
                  <Text className="text-red-500">
                    *
                  </Text>
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

                {/* <Text className="font-khmerMedium text-gray-900 text-xl mb-1.5">
                  ផ្លាកលេខយានយន្ត
                </Text>

                <TextInput
                  value={vehiclePlate}
                  onChangeText={setVehiclePlate}
                  placeholder="បញ្ចូលផ្លាកលេខយានយន្ត"
                  placeholderTextColor="#9CA3AF"
                  className="font-khmer bg-gray-100 rounded-xl px-4 h-12 mb-4 text-lg text-gray-800"
                  style={androidInputStyle}
                /> */}
              </>
            )}

            {/* PICKUP INFO */}
            {!isDelivery && (
              <View className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5">
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#16A34A"
                  />

                  <Text className="font-khmerBold text-green-700 text-lg ml-2">
                    ទិញទំនិញផ្ទាល់
                  </Text>
                </View>

                <Text className="font-khmer text-green-600 text-base mt-2">
                  អតិថិជនមកទទួលទំនិញនៅទីតាំងដេប៉ូផ្ទាល់។                 
                </Text>
              </View>
            )}

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                loading ||
                (isDelivery &&
                  !driverName.trim())
              }
              activeOpacity={0.8}
              className={`rounded-xl h-12 items-center justify-center w-full ${
                isDelivery
                  ? "bg-blue-600"
                  : "bg-green-600"
              }`}
            >
              <Text className="font-khmerBold text-white text-xl">
                {isDelivery
                  ? "ចាប់ផ្តើមដឹកជញ្ជូន"
                  : "បញ្ចប់"}
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              className="items-center justify-center w-full mt-2 py-2"
            >
              <Text className="font-khmer text-gray-400 text-xl">
                បោះបង់
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}