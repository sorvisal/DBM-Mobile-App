import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CustomerStatsRowProps = {
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  totalSpent: number;
};

type StatType = "customers" | "active" | "orders" | "spent" | null;

export function CustomerStatsRow({
  totalCustomers,
  activeCustomers,
  totalOrders,
  totalSpent,
}: CustomerStatsRowProps) {
  const [selectedStat, setSelectedStat] = useState<StatType>(null);

  const valueStyle = {
    maxFontSizeMultiplier: 1.3,
  } as const;

  const closeModal = () => {
    setSelectedStat(null);
  };

  const getModalData = () => {
    switch (selectedStat) {
      case "customers":
        return {
          icon: "people-outline" as const,
          iconColor: "#2563EB",
          iconBg: "bg-blue-50",
          title: "អតិថិជនសរុប",
          value: totalCustomers.toLocaleString("en-US"),
          description: "ចំនួនអតិថិជនសរុបទាំងអស់",
          suffix: "នាក់",
        };

      case "active":
        return {
          icon: "checkmark-circle-outline" as const,
          iconColor: "#16A34A",
          iconBg: "bg-green-50",
          title: "អតិថិជនសកម្ម",
          value: activeCustomers.toLocaleString("en-US"),
          description: "ចំនួនអតិថិជនដែលកំពុងសកម្ម",
          suffix: "នាក់",
        };

      case "orders":
        return {
          icon: "cart-outline" as const,
          iconColor: "#EA580C",
          iconBg: "bg-orange-50",
          title: "ការបញ្ជាទិញ",
          value: totalOrders.toLocaleString("en-US"),
          description: "ចំនួនការបញ្ជាទិញសរុបរបស់អតិថិជន",
          suffix: "ការបញ្ជាទិញ",
        };

      case "spent":
        return {
          icon: "cash-outline" as const,
          iconColor: "#9333EA",
          iconBg: "bg-purple-50",
          title: "ចំណូលសរុប",
          value: `$${totalSpent.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}`,
          description: "ចំនួនទឹកប្រាក់សរុបដែលអតិថិជនបានចំណាយ",
          suffix: "USD",
        };

      default:
        return null;
    }
  };

  const modalData = getModalData();

  return (
    <>
      <View className="flex-row px-5 pt-3 pb-1 gap-2">
        {/* Total Customers */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelectedStat("customers")}
          className="flex-1 bg-white rounded-2xl p-3 items-center"
        >
          <View className="bg-blue-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
            <Ionicons
              name="people-outline"
              size={24}
              color="#2563EB"
            />
          </View>

          <Text
            className="font-khmerBold text-gray-900 text-2xl text-center"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={{ width: "100%", ...valueStyle }}
          >
            {totalCustomers.toLocaleString("en-US")}
          </Text>

          <Text
            className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center"
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            អតិថិជនសរុប
          </Text>
        </TouchableOpacity>

        {/* Active Customers */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelectedStat("active")}
          className="flex-1 bg-white rounded-2xl p-3 items-center"
        >
          <View className="bg-green-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#16A34A"
            />
          </View>

          <Text
            className="font-khmerBold text-gray-900 text-2xl text-center"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={{ width: "100%", ...valueStyle }}
          >
            {activeCustomers.toLocaleString("en-US")}
          </Text>

          <Text
            className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center"
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            អតិថិជនសកម្ម
          </Text>
        </TouchableOpacity>

        {/* Total Orders */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelectedStat("orders")}
          className="flex-1 bg-white rounded-2xl p-3 items-center"
        >
          <View className="bg-orange-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
            <Ionicons
              name="cart-outline"
              size={24}
              color="#EA580C"
            />
          </View>

          <Text
            className="font-khmerBold text-gray-900 text-2xl text-center"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={{ width: "100%", ...valueStyle }}
          >
            {totalOrders.toLocaleString("en-US")}
          </Text>

          <Text
            className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center"
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            ការបញ្ជាទិញ
          </Text>
        </TouchableOpacity>

        {/* Total Spent */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelectedStat("spent")}
          className="flex-1 bg-white rounded-2xl p-3 items-center"
        >
          <View className="bg-purple-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
            <Ionicons
              name="cash-outline"
              size={24}
              color="#9333EA"
            />
          </View>

          <Text
            className="font-khmerBold text-gray-900 text-2xl text-center"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={{ width: "100%", ...valueStyle }}
          >
            ${totalSpent.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </Text>

          <Text
            className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center"
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            ចំណូលសរុប
          </Text>
        </TouchableOpacity>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={selectedStat !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <Pressable
            className="absolute inset-0"
            onPress={closeModal}
          />

          <View className="w-full bg-white rounded-3xl p-6">
            {modalData && (
              <>
                {/* Close button */}
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={closeModal}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                {/* Icon */}
                <View className="items-center mt-1">
                  <View
                    className={`${modalData.iconBg} w-16 h-16 rounded-full items-center justify-center`}
                  >
                    <Ionicons
                      name={modalData.icon}
                      size={32}
                      color={modalData.iconColor}
                    />
                  </View>

                  {/* Title */}
                  <Text
                    className="font-khmerBold text-gray-900 text-xl mt-4 text-center"
                    maxFontSizeMultiplier={1.2}
                  >
                    {modalData.title}
                  </Text>

                  {/* Value */}
                  <Text
                    className="font-khmerBold text-gray-900 text-4xl mt-3 text-center"
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                    numberOfLines={1}
                  >
                    {modalData.value}
                  </Text>

                  {/* Suffix */}
                  <Text
                    className="font-khmer text-gray-500 text-base mt-1"
                    maxFontSizeMultiplier={1.2}
                  >
                    {modalData.suffix}
                  </Text>

                  {/* Description */}
                  <View className="bg-gray-50 rounded-2xl px-4 py-3 mt-5 w-full">
                    <Text
                      className="font-khmer text-gray-500 text-center text-[15px]"
                      maxFontSizeMultiplier={1.2}
                    >
                      {modalData.description}
                    </Text>
                  </View>

                  {/* Done */}
                  <TouchableOpacity
                    onPress={closeModal}
                    activeOpacity={0.8}
                    className="w-full bg-gray-900 rounded-2xl py-3.5 mt-5 items-center"
                  >
                    <Text className="font-khmerBold text-white text-base">
                      បិទ
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}