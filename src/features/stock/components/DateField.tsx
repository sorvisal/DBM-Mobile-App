import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DatePickerModal } from "./DatePickerModal";

type DateFieldProps = {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date) => void;
};

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function DateField({ placeholder, value, onChange }: DateFieldProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 h-11"
      >
        <Text className={`font-khmer text-sm ${value ? "text-gray-800" : "text-gray-400"}`}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <DatePickerModal
        visible={pickerVisible}
        initialDate={value ?? undefined}
        onCancel={() => setPickerVisible(false)}
        onConfirm={(date) => {
          onChange(date);
          setPickerVisible(false);
        }}
      />
    </>
  );
}