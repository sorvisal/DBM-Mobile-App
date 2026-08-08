import { useRef, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type DatePickerModalProps = {
  visible: boolean;
  initialDate?: Date;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

function WheelColumn({
  data,
  selectedIndex,
  onChangeIndex,
}: {
  data: string[];
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, index));
    onChangeIndex(clamped);
  };

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={handleMomentumEnd}
      contentContainerStyle={{
        paddingVertical: (ITEM_HEIGHT * (VISIBLE_ROWS - 1)) / 2,
      }}
      contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
      className="flex-1"
      style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}
    >
      {data.map((item, index) => {
        const distance = Math.abs(index - selectedIndex);
        return (
          <View key={item + index} style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
            <Text
              className={`font-khmer ${
                distance === 0
                  ? "text-gray-900 text-2xl font-bold"
                  : distance === 1
                  ? "text-gray-500 text-2xl"
                  : "text-gray-400 text-2xl"
              }`}
            >
              {item}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function DatePickerModal({ visible, initialDate, onCancel, onConfirm }: DatePickerModalProps) {
  const base = initialDate ?? new Date();

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 21 }, (_, i) => String(base.getFullYear() - 10 + i));

  const [dayIndex, setDayIndex] = useState(base.getDate() - 1);
  const [monthIndex, setMonthIndex] = useState(base.getMonth());
  const [yearIndex, setYearIndex] = useState(10); // middle of the 21-year range

  const handleOk = () => {
    const year = Number(years[yearIndex]);
    const date = new Date(year, monthIndex, dayIndex + 1);
    onConfirm(date);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/30 items-center justify-center px-8">
        <View className="bg-white rounded-2xl w-full max-w-xs overflow-hidden">
          <View className="relative">
            {/* selection band */}
            <View
              pointerEvents="none"
              className="absolute left-0 right-0 border-t border-b border-gray-400"
              style={{ top: ITEM_HEIGHT * ((VISIBLE_ROWS - 1) / 2), height: ITEM_HEIGHT }}
            />

            <View className="flex-row px-4 pt-0">
              <WheelColumn data={days} selectedIndex={dayIndex} onChangeIndex={setDayIndex} />
              <WheelColumn data={MONTHS} selectedIndex={monthIndex} onChangeIndex={setMonthIndex} />
              <WheelColumn data={years} selectedIndex={yearIndex} onChangeIndex={setYearIndex} />
            </View>
          </View>

          <View className="flex-row border-t border-gray-200">
            <TouchableOpacity onPress={onCancel} className="flex-1 items-center justify-center py-3.5">
              <Text className="font-khmer text-gray-500 text-2xl">CANCEL</Text>
            </TouchableOpacity>
            <View className="w-px bg-gray-100" />
            <TouchableOpacity onPress={handleOk} className="flex-1 items-center justify-center py-3.5">
              <Text className="font-khmerBold text-blue-600 text-2xl">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}