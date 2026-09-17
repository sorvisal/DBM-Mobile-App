import { Alert, FlatList, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DetailLayout } from "../../../layouts/DetailLayout";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { NotificationItem } from "../components/NotificationItem";
import {
  useNotifications,
  refreshNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../hooks/useNotifications";
import { typography } from "@/theme";

type NotificationScreenProps = {
  onClose: () => void;
};

export function NotificationScreen({ onClose }: NotificationScreenProps) {
  const { notifications, unreadCount, isLoading, isRefreshing, error } =
    useNotifications();

  const handleItemPress = async (id: string, read: boolean) => {
    if (read) return;

    try {
      await markAsRead(id);
    } catch (readError) {
      if (__DEV__) {
        console.error("[NOTIFICATION] mark as read failed:", readError);
      }
      Alert.alert("មានបញ្ហា", "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "លុបការជូនដំណឹង",
      "តើអ្នកប្រាកដថាចង់លុបការជូនដំណឹងនេះមែនទេ?",
      [
        {
          text: "បោះបង់",
          style: "cancel",
        },
        {
          text: "លុប",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotification(id);
            } catch (deleteError) {
              if (__DEV__) {
                console.error("[NOTIFICATION] delete failed:", deleteError);
              }
              Alert.alert("មានបញ្ហា", "មិនអាចលុបការជូនដំណឹងបានទេ");
            }
          },
        },
      ]
    );
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      await markAllAsRead();
    } catch (markError) {
      if (__DEV__) {
        console.error("[NOTIFICATION] mark all read failed:", markError);
      }
      Alert.alert("មានបញ្ហា", "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ");
    }
  };

  const markAllReadAction = (
    <TouchableOpacity
      onPress={handleMarkAllRead}
      disabled={unreadCount === 0}
      accessibilityRole="button"
      accessibilityLabel="Mark all as read"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ opacity: unreadCount === 0 ? 0.35 : 1 }}
    >
      <Ionicons name="checkmark-done-outline" size={26} color="#2563EB" />
    </TouchableOpacity>
  );

  return (
    <DetailLayout title="ការជូនដំណឹង" onBack={onClose} rightAction={markAllReadAction}>
      <FlatList
        className="flex-1"
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 16,
          flexGrow: notifications.length === 0 ? 1 : undefined,
        }}
        refreshing={isRefreshing}
        onRefresh={refreshNotifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleItemPress(item.id, item.read)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState
              compact
              text="កំពុងផ្ទុកការជូនដំណឹង..."
            />
          ) : error ? (
            <ErrorState
              compact
              onRetry={() => {
                refreshNotifications().catch(() => {});
              }}
            />
          ) : (
            <EmptyState
              compact
              icon="notifications-off-outline"
              text="មិនមានការជូនដំណឹង"
            />
          )
        }
        ListHeaderComponent={
          notifications.length > 0 ? (
            <Text
              className="font-khmer text-gray-400 text-sm px-4 pt-3 pb-1"
              maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
            >
              {unreadCount > 0
                ? `${unreadCount} មិនទាន់អាន`
                : "ការជូនដំណឹងទាំងអស់"}
            </Text>
          ) : null
        }
      />
    </DetailLayout>
  );
}