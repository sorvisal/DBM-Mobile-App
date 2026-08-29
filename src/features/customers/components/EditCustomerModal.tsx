import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dropdown } from "../../stock/components/Dropdown";
import {
  Customer,
  CustomerStatus,
} from "../types/customer.types";
import {
  AddressAutocomplete,
  type AddressResult,
} from "@/components/AddressAutocomplete";

export type EditCustomerValues = {
  name: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
  description: string;
  status: CustomerStatus;
};

const STATUS_OPTIONS = [
  {
    label: "សកម្ម",
    value: CustomerStatus.Active,
  },
  {
    label: "មិនសកម្ម",
    value: CustomerStatus.Inactive,
  },
];

type EditCustomerModalProps = {
  visible: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (
    values: EditCustomerValues
  ) => void;
};

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="font-khmerMedium text-xl text-gray-900 mb-1.5">
        {label}{" "}
        {required && (
          <Text className="text-red-500">
            *
          </Text>
        )}
      </Text>

      {children}
    </View>
  );
}

const inputStyle = {
  outlineWidth: 0,
  paddingVertical: 0,
  includeFontPadding: false,
  textAlignVertical:
    "center" as const,
};

export function EditCustomerModal({
  visible,
  customer,
  onClose,
  onSubmit,
}: EditCustomerModalProps) {
  const insets = useSafeAreaInsets();
  const [values, setValues] =
    useState<EditCustomerValues>({
      name: "",
      phone: "",
      address: "",
      latitude: "",
      longitude: "",
      description: "",
      status:
        CustomerStatus.Active,
    });

  /*
   * ==========================================
   * PRE-FILL CUSTOMER DATA
   * ==========================================
   */
  useEffect(() => {
    if (!customer) {
      return;
    }

    setValues({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      address:
        customer.location ?? "",
      latitude: "",
      longitude: "",
      description:
        customer.note === "-"
          ? ""
          : customer.note ?? "",
      status:
        customer.status ??
        CustomerStatus.Active,
    });
  }, [customer]);

  /*
   * ==========================================
   * UPDATE FIELD
   * ==========================================
   */
  const update = <
    K extends keyof EditCustomerValues
  >(
    key: K,
    value: EditCustomerValues[K]
  ) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /*
   * ==========================================
   * SUBMIT
   * ==========================================
   */
  const handleSubmit = () => {
    onSubmit(values);
  };

  if (!customer) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/*
       * ========================================
       * KEYBOARD AVOIDING VIEW
       * ========================================
       *
       * iOS:
       *   padding
       *
       * Android:
       *   height
       *
       * This keeps the bottom part of the form
       * visible when the keyboard opens.
       */}
      <KeyboardAvoidingView
        className="flex-1 bg-black/30 justify-end"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? 0
            : 0
        }
      >
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          {/* ====================================
              HEADER
          ==================================== */}
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 bg-blue-600 rounded-t-xl">
            <Text className="font-khmerBold text-white text-xl flex-1 mr-2" numberOfLines={1} maxFontSizeMultiplier={1.3}>
              កែប្រែព័ត៌មានអតិថិជន
            </Text>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Ionicons
                name="close"
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* ====================================
              FORM
          ==================================== */}
          <ScrollView
            className="px-5 pt-4"
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios"
                ? "interactive"
                : "on-drag"
            }
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            {/* CUSTOMER CODE */}
            <FormField label="លេខកូដអតិថិជន">
              <View className="border border-gray-100 bg-gray-50 rounded-xl px-3 h-11 justify-center">
                <Text className="font-khmer text-gray-400 text-xl">
                  {customer.code}
                </Text>
              </View>
            </FormField>

            {/* NAME */}
            <FormField
              label="ឈ្មោះអតិថិជន"
              required
            >
              <TextInput
                value={values.name}
                onChangeText={(value) =>
                  update(
                    "name",
                    value
                  )
                }
                placeholder="បញ្ចូលឈ្មោះអតិថិជន"
                placeholderTextColor="#D1D5DB"
                returnKeyType="next"
                autoCorrect={false}
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={inputStyle}
              />
            </FormField>

            {/* PHONE */}
            <FormField
              label="លេខទូរស័ព្ទ"
              required
            >
              <TextInput
                value={values.phone}
                onChangeText={(value) =>
                  update(
                    "phone",
                    value
                  )
                }
                keyboardType="phone-pad"
                placeholder="012 345 678"
                placeholderTextColor="#D1D5DB"
                returnKeyType="next"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={inputStyle}
              />
            </FormField>

            {/* ADDRESS */}
            <FormField label="អាសយដ្ឋាន">
              <AddressAutocomplete
                value={values.address}
                onChange={(value) =>
                  update(
                    "address",
                    value
                  )
                }
                onSelect={(
                  place: AddressResult
                ) => {
                  setValues(
                    (previous) => ({
                      ...previous,
                      address:
                        place.displayName,
                      latitude:
                        String(
                          place.latitude ??
                            ""
                        ),
                      longitude:
                        String(
                          place.longitude ??
                            ""
                        ),
                    })
                  );
                }}
                placeholder="ភ្នំពេញ, ខណ្ឌចំការមន"
              />
            </FormField>

            {/* STATUS */}
            <FormField
              label="ស្ថានភាព"
              required
            >
              <Dropdown
                placeholder="ជ្រើសរើសស្ថានភាព"
                options={STATUS_OPTIONS}
                value={values.status}
                onChange={(value) =>
                  update(
                    "status",
                    value as CustomerStatus
                  )
                }
              />
            </FormField>

            {/* DESCRIPTION */}
            <FormField label="ការពិពណ៌នា">
              <TextInput
                value={
                  values.description
                }
                onChangeText={(value) =>
                  update(
                    "description",
                    value
                  )
                }
                placeholder="កំណត់ចំណាំបន្ថែម"
                placeholderTextColor="#D1D5DB"
                multiline
                textAlignVertical="top"
                className="font-khmer border border-gray-200 rounded-xl px-3 py-2.5 text-lg text-gray-800 h-20"
                style={{
                  paddingVertical: 8,
                  includeFontPadding:
                    false,
                  textAlignVertical:
                    "top",
                  outlineWidth: 0,
                }}
              />
            </FormField>

            {/* SAVE */}
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-600 rounded-xl h-12 items-center justify-center mt-2 mb-8"
              activeOpacity={0.8}
            >
              <Text className="font-khmerBold text-white text-xl">
                រក្សាទុក
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}