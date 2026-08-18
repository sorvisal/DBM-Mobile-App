import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

type DateFieldProps = {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date) => void;
};

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function DateField({ placeholder, value, onChange }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [displayDate, setDisplayDate] = useState(value ?? new Date());

  useEffect(() => {
    if (value) setDisplayDate(value);
  }, [value]);

  const handleChange = (_: unknown, selectedDate: Date | undefined) => {
    setShowPicker(false);
    if (selectedDate) {
      setDisplayDate(selectedDate);
      onChange(selectedDate);
    }
  };

  const handleOpen = () => {
    setShowPicker(true);
  };

  const handleSubmit = () => {
    setShowPicker(false);
    if (displayDate) onChange(displayDate);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setDisplayDate(value ?? new Date());
  };

  const displayLabel = value ? formatDate(value) : placeholder;

  if (Platform.OS === "android") {
    return (
      <View>
        <TouchableOpacity
          onPress={handleOpen}
          className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 h-11"
        >
          <Text className={`font-khmer text-lg ${value ? "text-gray-800" : "text-gray-400"}`}>
            {displayLabel}
          </Text>
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        {showPicker && (
          <View className="mt-2 border border-gray-200 rounded-xl bg-white overflow-hidden">
            <DateTimePicker
              value={displayDate}
              mode="date"
              display="spinner"
              onChange={handleChange}
              textColor="#111827"
              style={{ height: 200 }}
            />
            <View className="flex-row border-t border-gray-100">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 items-center"
              >
                <Text className="font-khmer text-gray-400 text-lg">បោះបង់</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 py-3 items-center border-l border-gray-100"
              >
                <Text className="font-khmerBold text-blue-600 text-lg">យល់ព្រម</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={handleOpen}
        className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 h-11"
      >
        <Text className={`font-khmer text-lg ${value ? "text-gray-800" : "text-gray-400"}`}>
          {displayLabel}
        </Text>
        <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      {showPicker && (
        <View className="mt-2 border border-gray-200 rounded-xl bg-white overflow-hidden">
          <DateTimePicker
            value={displayDate}
            mode="date"
            display="spinner"
            onChange={handleChange}
            textColor="#111827"
            style={{ height: 200 }}
          />
          <View className="flex-row border-t border-gray-100">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-3 items-center"
            >
              <Text className="font-khmer text-gray-400 text-lg">បោះបង់</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 py-3 items-center border-l border-gray-100"
            >
              <Text className="font-khmerBold text-blue-600 text-lg">យល់ព្រម</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
