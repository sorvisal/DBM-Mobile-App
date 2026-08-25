import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type YearDropdownProps = {
  value: number;
  onChange: (year: number) => void;
  yearsBack?: number; // how many past years to offer, besides the current year
};

export function YearDropdown({ value, onChange, yearsBack = 4 }: YearDropdownProps) {
  const [open, setOpen] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: yearsBack + 1 }, (_, i) => currentYear - i);
  }, [yearsBack]);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-gray-100 rounded-full px-3 py-1"
        activeOpacity={0.7}
      >
        <Text className="font-khmer text-gray-600 text-xl">{value}</Text>
        <Ionicons name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-black/20 justify-center items-center"
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-2xl py-2 w-40" style={{ elevation: 4 }}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                onPress={() => {
                  onChange(year);
                  setOpen(false);
                }}
                className={`px-4 py-3 ${value === year ? "bg-blue-50" : ""}`}
              >
                <Text
                  className={`font-khmer text-base ${
                    value === year ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}