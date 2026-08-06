import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  placeholder: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
};

export function Dropdown({ placeholder, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 h-11"
      >
        <Text className={`font-khmer text-sm ${selectedLabel ? "text-gray-800" : "text-gray-400"}`}>
          {selectedLabel ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setOpen(false)}
        >
          <Pressable className="bg-white rounded-t-2xl max-h-[60%]" onPress={() => {}}>
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Text className="font-khmerBold text-gray-900 text-sm">{placeholder}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between px-5 py-3.5 border-b border-gray-50"
                  >
                    <Text className={`font-khmer text-sm ${isSelected ? "text-blue-600" : "text-gray-800"}`}>
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color="#2563EB" />}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}