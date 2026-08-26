import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProductList } from "../hooks/useProductList";
import { androidInputStyle } from "@/theme/inputStyles";

type ProductSelectorProps = {
  value: string | null;
  onChange: (productId: string) => void;
  error?: string;
};

export function ProductSelector({
  value,
  onChange,
  error,
}: ProductSelectorProps) {
  const {
    products,
    isLoading,
    error: loadError,
  } = useProductList();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive),
    [products]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return activeProducts;
    const term = search.toLowerCase();
    return activeProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
    );
  }, [activeProducts, search]);

  const selectedLabel = useMemo(() => {
    const found = activeProducts.find(
      (p) => p.id === value
    );
    if (!found) return null;
    return `${found.name} — ${found.sku}`;
  }, [activeProducts, value]);

  const handleOpen = () => {
    setSearch("");
    setOpen(true);
  };

  const handleSelect = (productId: string) => {
    onChange(productId);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        disabled={isLoading}
        className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 h-11"
      >
        <Text
          className={`font-khmer text-lg flex-1 ${
            selectedLabel
              ? "text-gray-800"
              : "text-gray-400"
          }`}
          numberOfLines={1}
        >
          {isLoading
            ? "កំពុងផ្ទុកផលិតផល..."
            : selectedLabel ?? "ជ្រើសរើសផលិតផល"}
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />
        ) : (
          <Ionicons
            name="chevron-down"
            size={16}
            color="#9CA3AF"
          />
        )}
      </TouchableOpacity>

      {error && (
        <Text className="font-khmer text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}

      {loadError && (
        <Text className="font-khmer text-red-500 text-sm mt-1">
          {loadError}
        </Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-white rounded-t-2xl max-h-[60%]"
            onPress={() => {}}
          >
            <View className="flex-row items-center bg-blue-600 justify-between px-5 py-4 rounded-t-xl">
              <Text className="font-khmerBold text-white text-xl">
                ជ្រើសរើសផលិតផល
              </Text>
              <TouchableOpacity
                onPress={() => setOpen(false)}
              >
                <Ionicons
                  name="close"
                  size={26}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View className="px-5 py-3 border-b border-gray-100">
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="ស្វែងរកផលិតផល..."
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-10 text-lg text-gray-800"
                style={androidInputStyle}
              />
            </View>

            {isLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator
                  size="large"
                  color="#2563EB"
                />
                <Text className="font-khmer text-gray-500 text-sm mt-2">
                  កំពុងផ្ទុកផលិតផល...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View className="items-center py-10">
                    <Text className="font-khmer text-gray-400 text-lg">
                      មិនមានផលិតផល
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected =
                    item.id === value;
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        handleSelect(item.id)
                      }
                      className="flex-row items-center justify-between px-5 py-3.5 border-b border-gray-50"
                    >
                      <View className="flex-1 mr-2">
                        <Text
                          className={`font-khmer text-2xl ${
                            isSelected
                              ? "text-blue-600"
                              : "text-gray-800"
                          }`}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {/* <Text className="font-khmer text-gray-400 text-sm">
                          {item.sku}
                        </Text> */}
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#2563EB"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
