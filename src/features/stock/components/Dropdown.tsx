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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { androidInputStyle } from "@/theme/inputStyles";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  placeholder: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function Dropdown({
  placeholder,
  options,
  value,
  onChange,
  searchable = false,
  searchPlaceholder = "ស្វែងរក...",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const insets = useSafeAreaInsets();

  const selectedLabel = options.find(
    (item) => item.value === value
  )?.label;

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return options;
    }

    return options.filter((item) =>
      item.label.toLowerCase().includes(term)
    );
  }, [options, search]);

  const handleOpen = () => {
    setSearch("");
    setOpen(true);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setSearch("");
    setOpen(false);
  };

  const handleSelect = (itemValue: string) => {
    // Select first
    onChange(itemValue);

    // Then close
    setSearch("");
    setOpen(false);

    // Hide keyboard after selection
    requestAnimationFrame(() => {
      Keyboard.dismiss();
    });
  };

  return (
    <>
      {/* =====================================================
          DROPDOWN BUTTON
      ====================================================== */}
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.7}
        className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 h-11"
      >
        <Text
          className={`font-khmer text-lg flex-1 ${
            selectedLabel
              ? "text-gray-800"
              : "text-gray-400"
          }`}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {selectedLabel ?? placeholder}
        </Text>

        <Ionicons
          name="chevron-down"
          size={16}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {/* =====================================================
          MODAL
      ====================================================== */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        {/* Same structure as AssignDriverModal */}
        <KeyboardAvoidingView
          className="flex-1 bg-black/30 justify-end"
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
          keyboardVerticalOffset={0}
        >
          {/* =================================================
              BOTTOM SHEET
          ================================================== */}
          <View
            className="bg-white rounded-t-2xl overflow-hidden"
            style={{
              maxHeight: "85%",
              paddingBottom: Math.max(
                insets.bottom,
                16
              ),
            }}
          >
            {/* =================================================
                HEADER
            ================================================== */}
            <View className="flex-row items-center bg-blue-600 justify-between px-5 pt-4 pb-3">
              <Text
                className="font-khmerBold text-white text-xl flex-1"
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}
              >
                {placeholder}
              </Text>

              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* =================================================
                SEARCH
            ================================================== */}
            {searchable && (
              <View className="px-5 pt-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-11">
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
                    className="flex-1 ml-2 font-khmer text-lg text-gray-800"
                    style={androidInputStyle}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    blurOnSubmit={false}
                  />
                </View>
              </View>
            )}

            {/* =================================================
                LIST
            ================================================== */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              contentContainerStyle={{
                paddingBottom: 8,
              }}
              ListEmptyComponent={
                <View className="items-center justify-center py-12 px-5">
                  <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center">
                    <Ionicons
                      name="search-outline"
                      size={28}
                      color="#D1D5DB"
                    />
                  </View>

                  <Text className="font-khmer text-gray-400 text-lg text-center mt-3">
                    មិនមានទិន្នន័យ
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected =
                  item.value === value;

                return (
                  <TouchableOpacity
                    onPress={() =>
                      handleSelect(item.value)
                    }
                    activeOpacity={0.65}
                    className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100"
                  >
                    <View className="flex-1 mr-3">
                      <Text
                        className={`font-khmer text-xl ${
                          isSelected
                            ? "text-blue-600"
                            : "text-gray-800"
                        }`}
                        numberOfLines={2}
                        maxFontSizeMultiplier={1.3}
                      >
                        {item.label}
                      </Text>
                    </View>

                    {isSelected && (
                      <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center">
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#2563EB"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}