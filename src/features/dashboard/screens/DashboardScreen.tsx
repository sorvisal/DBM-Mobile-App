import { Fragment } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

const STATS = [
  { icon: "swap-vertical-outline", iconBg: "bg-blue-400", title: "ស្តុកសរុប", value: "1,250", unit: "ឯកតា" },
  { icon: "cash-outline", iconBg: "bg-green-400", title: "ចំណូលថ្ងៃនេះ", value: "$250", unit: "ដុល្លារ" },
  { icon: "warning-outline", iconBg: "bg-orange-400", title: "ស្តុកជិតអស់", value: "15", unit: "មុខ" },
  { icon: "document-text-outline", iconBg: "bg-purple-400", title: "បញ្ចីទិញថ្មីៗ", value: "8", unit: "កម្មង់" },
] as const;

const QUICK_ACTIONS = [
  { icon: "cube-outline", iconBg: "bg-blue-50", iconColor: "#2563EB", title: "ស្តុក", subtitle: "គ្រប់គ្រងស្តុកទំនិញ" },
  { icon: "cart-outline", iconBg: "bg-green-50", iconColor: "#16A34A", title: "ការបញ្ជាទិញ", subtitle: "គ្រប់គ្រងការបញ្ជាទិញ" },
  { icon: "people-outline", iconBg: "bg-purple-50", iconColor: "#9333EA", title: "អតិថិជន", subtitle: "គ្រប់គ្រងអតិថិជន" },
  { icon: "bar-chart-outline", iconBg: "bg-orange-50", iconColor: "#EA580C", title: "ហិរញ្ញវត្ថុ", subtitle: "របាយការណ៍ចំណូល" },
] as const;

const RECENT_ACTIVITY = [
  { icon: "cube-outline", iconBg: "bg-orange-100", iconColor: "#EA580C", title: "ទំនិញ 5 ប្រភេទបានបញ្ចូល", time: "10 នាទីមុន" },
  { icon: "document-outline", iconBg: "bg-red-100", iconColor: "#DC2626", title: "ទំនិញ 3 មុខបានទិញចេញ", time: "1 ម៉ោងមុន" },
  { icon: "cart-outline", iconBg: "bg-blue-100", iconColor: "#2563EB", title: "មានការបញ្ជាទិញថ្មី 3 កន្លែង", time: "2 ម៉ោងមុន" },
] as const;

export function DashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>

      {/* Greeting */}
      <View className="px-5 pt-2 pb-4">
        <Text className="font-khmerBold text-2xl text-gray-900">
          សួស្ដី, វិសាល 👋
        </Text>
        <Text className="font-khmer text-2xl text-gray-400 mt-0.5">
          សូមស្វាគមន៍មកកាន់{" "}
          <Text className="font-bold text-2xl text-gray-400">DBM App</Text>
        </Text>
      </View>

      {/* Summary Stats Card */}
      <View className="mx-5 bg-blue-600 rounded-2xl p-4">
        <View className="flex-row items-center gap-1.5 mb-4">
          <View className="bg-white/30 rounded-full p-1">
            <Feather name="trending-up" size={24} color="rgba(255,255,255,0.85)" />
          </View>
          <Text className="font-khmerMedium text-white/85 text-2xl">
            សង្ខេបព័ត៌មានប្រចាំថ្ងៃ
          </Text>
        </View>

        <View className="flex-row items-stretch">
          {STATS.map((stat, index) => (
            <Fragment key={stat.title}>
              <View className="flex-1 items-center">
                <View
                  className={`${stat.iconBg} h-11 w-11 items-center justify-center rounded-full`}
                >
                  <Ionicons name={stat.icon} size={24} color="white" />
                </View>

                <Text
                  className="font-khmer text-white/80 text-[16px] text-center mt-2"
                  numberOfLines={1}
                >
                  {stat.title}
                </Text>

                <Text className="font-khmerBold text-white text-3xl mt-1">
                  {stat.value}
                </Text>

                <Text
                  className="font-khmerMedium text-white/70 text-[16px] text-center mt-1"
                  numberOfLines={1}
                >
                  {stat.unit}
                </Text>
              </View>

              {index !== STATS.length - 1 && (
                <View className="w-px bg-white/20 mx-1 my-1" />
              )}
            </Fragment>
          ))}
        </View>
      </View>
      {/* Quick Action Grid */}
      <View className="flex-row flex-wrap px-5 mt-4 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.title}
            className="w-[47%] bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <View className={`${action.iconBg} w-10 h-10 rounded-full items-center justify-center mb-3`}>
              <Ionicons name={action.icon} size={28} color={action.iconColor} />
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-khmerMedium text-gray-900 text-2xl">{action.title}</Text>
                <Text className="font-khmer text-gray-400 text-[16px] mt-0.5" numberOfLines={1}>
                  {action.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View className="px-5 mt-6 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-khmerMedium text-gray-900 text-2xl">
            ការជូនដំណឹងថ្មីៗ
          </Text>
          <TouchableOpacity className="flex-row items-center gap-1">
            <Text className="font-khmerMedium text-blue-600 text-2xl">មើលទាំងអស់</Text>
            <Ionicons name="chevron-forward" size={12} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl overflow-hidden">
          {RECENT_ACTIVITY.map((item, index) => (
            <View
              key={item.title}
              className={`flex-row items-center px-4 py-3 ${
                index !== RECENT_ACTIVITY.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <View className={`${item.iconBg} w-12 h-12 rounded-full items-center justify-center mr-3`}>
                <Ionicons name={item.icon} size={26} color={item.iconColor} />
              </View>
              <Text className="font-khmer text-gray-800 text-xl flex-1" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="font-khmer text-gray-400 text-xl ml-2">{item.time}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}