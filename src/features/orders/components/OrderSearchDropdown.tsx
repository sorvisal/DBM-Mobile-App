import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type OrderSearchDropdownOption = {
  label: string;
  value: string;
};

type OrderSearchDropdownProps = {
  placeholder: string;
  options: OrderSearchDropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function OrderSearchDropdown({
  placeholder,
  options,
  value,
  onChange,
  searchable = false,
  searchPlaceholder = "ស្វែងរក...",
}: OrderSearchDropdownProps) {
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = useMemo(() => {
    return options.find((item) => item.value === value) ?? null;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return options;
    }

    return options.filter((item) =>
      item.label.toLowerCase().includes(keyword)
    );
  }, [options, search]);

  const handleOpen = () => {
    Keyboard.dismiss();

    setSearch("");
    setOpen(true);
  };

  const handleClose = () => {
    Keyboard.dismiss();

    setSearch("");
    setOpen(false);
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);

    setSearch("");
    setOpen(false);

    requestAnimationFrame(() => {
      Keyboard.dismiss();
    });
  };

  return (
    <>
      {/* =====================================================
          SELECT BUTTON
      ====================================================== */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpen}
        className="h-12 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4"
      >
        <Text
          numberOfLines={1}
          className={`flex-1 text-base ${
            selectedOption ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selectedOption?.label ?? placeholder}
        </Text>

        <Ionicons
          name="chevron-down"
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* =====================================================
          SEARCH MODAL
      ====================================================== */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* BACKDROP */}
          <Pressable
            className="absolute inset-0 bg-black/30"
            onPress={handleClose}
          />

          {/* =================================================
              BOTTOM SHEET
          ================================================== */}
          <View
            className="overflow-hidden rounded-t-3xl bg-white"
            style={{
              maxHeight: "82%",
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            {/* HEADER */}
            <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
              <Text className="font-khmerBold text-lg text-gray-900">
                ជ្រើសរើស
              </Text>

              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>

            {/* SEARCH */}
            {searchable && (
              <View className="px-5 pb-3 pt-4">
                <View className="h-11 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color="#9CA3AF"
                  />

                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#9CA3AF"
                    className="ml-2 flex-1 font-khmer text-base text-gray-900"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                  />
                </View>
              </View>
            )}

            {/* LIST */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingBottom: 16,
              }}
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item.value)}
                    className={`min-h-[50px] flex-row items-center justify-between rounded-xl px-4 py-3 ${
                      isSelected ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <Text
                      numberOfLines={2}
                      className={`flex-1 font-khmer text-base ${
                        isSelected
                          ? "font-khmerBold text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color="#2563EB"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <Ionicons
                    name="search-outline"
                    size={34}
                    color="#9CA3AF"
                  />

                  <Text className="mt-3 font-khmer text-gray-400">
                    មិនមានទិន្នន័យ
                  </Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}