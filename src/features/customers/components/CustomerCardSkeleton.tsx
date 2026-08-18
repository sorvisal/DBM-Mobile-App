import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SKELETON_COLOR = "bg-gray-200";

export function CustomerCardSkeleton() {
  return (
    <TouchableOpacity
      disabled
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-12 h-12 rounded-full bg-gray-200" />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <View className={`h-5 rounded-full w-32 ${SKELETON_COLOR}`} />
          <View className={`h-5 w-16 rounded-full ${SKELETON_COLOR}`} />
        </View>
        <View className={`h-4 rounded-full w-24 mt-2 ${SKELETON_COLOR}`} />
        <View className={`h-4 rounded-full w-20 mt-1.5 ${SKELETON_COLOR}`} />
        <View className="flex-row justify-between mt-2">
          <View className={`h-4 rounded-full w-28 ${SKELETON_COLOR}`} />
          <View className={`h-5 rounded-full w-16 ${SKELETON_COLOR}`} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function DebtorListItemSkeleton() {
  return (
    <TouchableOpacity
      disabled
      className="flex-row items-center bg-white rounded-2xl p-3 mb-2"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-9 h-9 rounded-full bg-gray-200" />
      <View className="flex-1 ml-3">
        <View className={`h-5 rounded-full w-40 ${SKELETON_COLOR}`} />
        <View className={`h-4 rounded-full w-20 mt-2 ${SKELETON_COLOR}`} />
      </View>
      <View className="items-end">
        <View className={`h-5 w-16 rounded-full ${SKELETON_COLOR}`} />
        <View className={`h-3.5 w-12 mt-1.5 rounded-full ${SKELETON_COLOR}`} />
      </View>
    </TouchableOpacity>
  );
}

export function ProductCardSkeleton() {
  return (
    <TouchableOpacity
      disabled
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-12 h-16 rounded-xl bg-gray-200" />
      <View className="flex-1 ml-3">
        <View className={`h-5 rounded-full w-36 ${SKELETON_COLOR}`} />
        <View className={`h-4 rounded-full w-16 mt-2 ${SKELETON_COLOR}`} />
        <View className={`h-4 rounded-full w-48 mt-1.5 ${SKELETON_COLOR}`} />
      </View>
      <View className="items-end">
        <View className={`h-7 w-10 rounded-full ${SKELETON_COLOR}`} />
        <View className={`h-4 w-8 mt-1 rounded-full ${SKELETON_COLOR}`} />
      </View>
    </TouchableOpacity>
  );
}

export function OrderCardSkeleton() {
  return (
    <TouchableOpacity
      disabled
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-11 h-11 rounded-xl bg-gray-200" />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <View className={`h-5 rounded-full w-28 ${SKELETON_COLOR}`} />
          <View className={`h-5 w-16 rounded-full ${SKELETON_COLOR}`} />
        </View>
        <View className={`h-4 rounded-full w-32 mt-2 ${SKELETON_COLOR}`} />
        <View className="flex-row justify-between mt-1.5">
          <View className={`h-4 rounded-full w-20 ${SKELETON_COLOR}`} />
          <View className={`h-5 w-16 rounded-full ${SKELETON_COLOR}`} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function IncomeOrderSkeleton() {
  return (
    <TouchableOpacity
      disabled
      className="flex-row items-center bg-white rounded-2xl p-3 mb-2"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-10 h-10 rounded-xl bg-gray-200" />
      <View className="flex-1 ml-3">
        <View className={`h-5 rounded-full w-24 ${SKELETON_COLOR}`} />
        <View className={`h-4 rounded-full w-20 mt-2 ${SKELETON_COLOR}`} />
        <View className={`h-4 rounded-full w-28 mt-1.5 ${SKELETON_COLOR}`} />
      </View>
      <View className="items-end">
        <View className={`h-5 w-14 rounded-full ${SKELETON_COLOR} mb-1`} />
        <View className={`h-5 w-16 rounded-full ${SKELETON_COLOR}`} />
      </View>
    </TouchableOpacity>
  );
}

