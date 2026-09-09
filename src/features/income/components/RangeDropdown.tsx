import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type RevenueRange = "7" | "28" | "90";

const RANGE_LABELS: Record<RevenueRange, string> = {
  '7': '7 ថ្ងៃ',
  '28': '28 ថ្ងៃ',
  '90': '90 ថ្ងៃ',
};

type RangeDropdownProps = {
  value: RevenueRange;
  onChange: (range: RevenueRange) => void;
};

export function RangeDropdown({
  value,
  onChange,
}: RangeDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-gray-100 rounded-full px-3 py-1"
        activeOpacity={0.7}
      >
        <Text className="font-khmer text-gray-600 text-xl">
          {RANGE_LABELS[value]}
        </Text>

        <Ionicons
          name="chevron-down"
          size={12}
          color="#6B7280"
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/20 justify-center items-center"
          onPress={() => setOpen(false)}
        >
          <View
            className="bg-white rounded-2xl py-2 w-40"
            style={{ elevation: 4 }}
          >
            {(Object.keys(RANGE_LABELS) as RevenueRange[]).map(
              (key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`px-4 py-3 ${
                    value === key ? 'bg-blue-50' : ''
                  }`}
                >
                  <Text
                    className={`font-khmer text-base ${
                      value === key
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {RANGE_LABELS[key]}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}