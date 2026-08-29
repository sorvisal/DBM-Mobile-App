import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateField } from "../../stock/components/DateField";
import { Dropdown } from "../../stock/components/Dropdown";
import { useStockList } from "../../stock/hooks/useStockList";
import { useCustomerList } from "../../customers/hooks/useCustomerList";
import {
  AddressAutocomplete,
  type AddressResult,
} from "@/components/AddressAutocomplete";
import { Header } from "@/components/layout/Header";
import { useResponsive } from "@/hooks/useResponsive";
import { api, invalidateOrderCache } from "@/services";

type CreateOrderScreenProps = {
  onBack: () => void;
};

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

const generateCode = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `OD-${yy}${mm}${dd}-${seq}`;
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4">
      <Text className="font-khmerBold text-xl text-gray-900 mb-4">
        {title}
      </Text>
      {children}
    </View>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="font-khmerMedium text-xl text-gray-900 mb-1.5">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      {children}
    </View>
  );
}

const androidInputStyle = {
  paddingVertical: 0,
  includeFontPadding: false,
  textAlignVertical: "center" as const,
};

const PAYMENT_METHODS = [
  { label: "សាច់ប្រាក់", value: "cash" },
  { label: "ធនាគារ", value: "bank" },
  { label: "ផ្សេងទៀត", value: "other" },
];

export function CreateOrderScreen({ onBack }: CreateOrderScreenProps) {
  const { data: products, isLoading: productsLoading } = useStockList();
  const { allCustomers, isLoading: customersLoading } = useCustomerList();
  const { isSmallPhone } = useResponsive();

  const [code] = useState(generateCode);
  const [date, setDate] = useState<Date | null>(new Date());
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const productOptions = useMemo(
    () =>
      (products ?? []).map((p) => ({
        label: `${p.name} — $${p.sellPrice.toFixed(2)}`,
        value: p.id,
      })),
    [products]
  );

  const customerOptions = useMemo(
    () =>
      (allCustomers ?? []).map((c) => ({
        label: c.name,
        value: c.id,
      })),
    [allCustomers]
  );

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );
  const numericPaid = parseFloat(paidAmount) || 0;
  const remaining = Math.max(0, subtotal - numericPaid);

  const handleSelectCustomer = (id: string) => {
    const customer = (allCustomers ?? []).find((c) => c.id === id);
    if (!customer) return;
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerAddress(customer.location);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.customer;
      return next;
    });
  };

  const handleSelectProduct = (id: string) => {
    const product = (products ?? []).find((p) => p.id === id);
    if (!product) return;

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.sellPrice,
          quantity: 1,
          imageUrl: product.imageUrl ?? "",
        },
      ];
    });

    setSelectedProductId(null);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.product;
      return next;
    });
  };

  const handleIncrementQuantity = (productId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecrementQuantity = (productId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!customerId) e.customer = "សូមជ្រើសរើសអតិថិជន";
    if (orderItems.length === 0) e.product = "សូមជ្រើសរើសទំនិញ";
    if (numericPaid < 0) e.paid = "ចំនួនបង់មិនអាចជាអវិជ្ជមានទេ";
    if (numericPaid > subtotal && subtotal > 0)
      e.paid = "ចំនួនបង់មិនអាចធំជាងសរុបបាន";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const lines = orderItems.map((item) => ({
        productId: Number(item.productId),
        qty: item.quantity,
      }));

      const firstItemName = orderItems[0]?.name ?? "";

      const result = await api.orders.create({
        customerId: Number(customerId),
        lines,
        deliveryAddress: deliveryAddress || "",
        description: note || firstItemName,
      });

      if (numericPaid > 0) {
        try {
          await api.orders.pay(result.id, numericPaid, paymentMethod);
        } catch {
          invalidateOrderCache();
          setSubmitError(
            "ការបង្កើតការបញ្ជាទិញជោគជ័យ ប៉ុន្តែការទូទាត់បានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។"
          );
          setSubmitting(false);
          return;
        }
      }

      invalidateOrderCache();
      onBack();
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញ។ សូមព្យាយាមម្តងទៀត។"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header
        title="បង្កើតការបញ្ជាទិញ"
        onBackPress={onBack}
        variant="white"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Order Information ── */}
          <SectionCard title="ព័ត៌មានការបញ្ជាទិញ">
            <FormField label="លេខកូដ">
              <TextInput
                value={code}
                editable={false}
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-500 bg-gray-50"
                style={androidInputStyle}
              />
            </FormField>
            <FormField label="កាលបរិច្ឆេទ" required>
              <DateField
                placeholder="ជ្រើសរើសកាលបរិច្ឆេទ"
                value={date}
                onChange={setDate}
              />
            </FormField>
          </SectionCard>

          {/* ── Customer Information ── */}
          <SectionCard title="ព័ត៌មានអតិថិជន">
            <FormField label="ឈ្មោះអតិថិជន" required>
              <Dropdown
                placeholder={
                  customersLoading
                    ? "កំពុងផ្ទុកអតិថិជន..."
                    : "ជ្រើសរើសអតិថិជន"
                }
                options={customerOptions}
                value={customerId || null}
                onChange={handleSelectCustomer}
              />
              {errors.customer && (
                <Text className="text-red-500 font-khmer text-sm mt-1">
                  {errors.customer}
                </Text>
              )}
            </FormField>

            {customerId ? (
              <View className="bg-gray-50 rounded-xl p-3 mb-2">
                {customerPhone ? (
                  <Text className="font-khmer text-gray-600 text-lg">
                    ទូរស័ព្ទ៖ {customerPhone}
                  </Text>
                ) : null}
                {customerAddress ? (
                  <Text className="font-khmer text-gray-600 text-lg mt-1">
                    អាសយដ្ឋាន៖ {customerAddress}
                  </Text>
                ) : null}
                {!customerPhone && !customerAddress && (
                  <Text className="font-khmer text-gray-400 text-base">
                    មិនមានព័ត៌មានបន្ថែម
                  </Text>
                )}
              </View>
            ) : null}
          </SectionCard>

          {/* ── Product Information ── */}
          <SectionCard title="ព័ត៌មានទំនិញ">
            <FormField label="ទំនិញ" required>
              <Dropdown
                placeholder={
                  productsLoading
                    ? "កំពុងផ្ទុកទំនិញ..."
                    : "ជ្រើសរើសទំនិញ"
                }
                options={productOptions}
                value={selectedProductId}
                onChange={handleSelectProduct}
              />
              {errors.product && (
                <Text className="text-red-500 font-khmer text-sm mt-1">
                  {errors.product}
                </Text>
              )}
            </FormField>

            {orderItems.map((item) => {
              const imageEl = item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  resizeMode="cover"
                  className="w-14 h-14 rounded-xl bg-gray-100"
                />
              ) : (
                <View className="w-14 h-14 rounded-xl bg-gray-100 items-center justify-center">
                  <Ionicons name="image-outline" size={24} color="#D1D5DB" />
                </View>
              );

              const infoEl = (
                <View className="flex-1 ml-3">
                  <Text
                    className="font-khmerMedium text-gray-900 text-lg"
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.3}
                  >
                    {item.name}
                  </Text>
                  <Text className="font-khmer text-gray-400 text-base mt-0.5" maxFontSizeMultiplier={1.3}>
                    ${item.price.toFixed(2)}
                  </Text>
                </View>
              );

              const stepperEl = (
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => handleDecrementQuantity(item.productId)}
                    className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                  >
                    <Ionicons name="remove" size={18} color="#374151" />
                  </TouchableOpacity>
                  <Text className="font-khmerBold text-gray-900 text-lg w-8 text-center" allowFontScaling={false}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleIncrementQuantity(item.productId)}
                    className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center"
                  >
                    <Ionicons name="add" size={18} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              );

              const subtotalEl = (
                <Text className="font-khmerBold text-gray-900 text-lg ml-3 w-20 text-right" maxFontSizeMultiplier={1.3}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              );

              const removeEl = (
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.productId)}
                  className="ml-2 p-1"
                >
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              );

              if (isSmallPhone) {
                return (
                  <View
                    key={item.productId}
                    className="bg-gray-50 rounded-xl p-3 mb-3"
                  >
                    <View className="flex-row items-center">
                      {imageEl}
                      {infoEl}
                      {removeEl}
                    </View>
                    <View className="flex-row items-center justify-between mt-3">
                      {stepperEl}
                      {subtotalEl}
                    </View>
                  </View>
                );
              }

              return (
                <View
                  key={item.productId}
                  className="flex-row items-center bg-gray-50 rounded-xl p-3 mb-3"
                >
                  {imageEl}
                  {infoEl}
                  {stepperEl}
                  {subtotalEl}
                  {removeEl}
                </View>
              );
            })}
          </SectionCard>

          {/* ── Delivery Information ── */}
          {/* <SectionCard title="ព័ត៌មានការដឹកជញ្ជូន">
            <FormField label="ឈ្មោះអ្នកដឹកជញ្ជូន">
              <TextInput
                value={deliveryName}
                onChangeText={setDeliveryName}
                placeholder="ឈ្មោះអ្នកដឹកជញ្ជូន"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={androidInputStyle}
              />
            </FormField>
            <FormField label="ទូរស័ព្ទដឹកជញ្ជូន">
              <TextInput
                value={deliveryPhone}
                onChangeText={setDeliveryPhone}
                keyboardType="phone-pad"
                placeholder="ទូរស័ព្ទ"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={androidInputStyle}
              />
            </FormField> 
            <FormField label="អាស័យដ្ឋានដឹកជញ្ជូន">
              <AddressAutocomplete
                value={deliveryAddress}
                onChange={setDeliveryAddress}
                onSelect={(place: AddressResult) => {
                  setDeliveryAddress(place.displayName);
                }}
                placeholder="បញ្ចូលអាស័យដ្ឋានដឹកជញ្ជូន"
              />
            </FormField>
          </SectionCard> */}

          {/* ── Payment Information ── */}
          <SectionCard title="ព័ត៌មានការទូទាត់">
            <FormField label="វិធីបង់ប្រាក់">
              <Dropdown
                placeholder="ជ្រើសរើសវិធីបង់ប្រាក់"
                options={PAYMENT_METHODS}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </FormField>
            <FormField label="ចំនួនបង់ ($)">
              <TextInput
                value={paidAmount}
                onChangeText={setPaidAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={androidInputStyle}
              />
              {errors.paid && (
                <Text className="text-red-500 font-khmer text-sm mt-1">
                  {errors.paid}
                </Text>
              )}
            </FormField>
            {subtotal > 0 && (
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Text className="font-khmer text-gray-600 text-base">
                  ទឹកប្រាក់សរុប{" "}
                  <Text className="font-khmerBold text-gray-900">
                    ${remaining.toFixed(2)}
                  </Text>
                </Text>
              </View>
            )}
          </SectionCard>

          {/* ── Note ── */}
          <SectionCard title="កំណត់ចំណាំ">
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="បញ្ចូលកំណត់ចំណាំ..."
              placeholderTextColor="#D1D5DB"
              multiline
              numberOfLines={3}
              className="font-khmer border border-gray-200 rounded-xl px-3 py-3 text-lg text-gray-800"
              style={{ textAlignVertical: "top", minHeight: 80 }}
            />
          </SectionCard>

          {/* ── Order Summary ── */}
          {subtotal > 0 && (
            <SectionCard title="សរុបការបញ្ជាទិញ">
              <View className="flex-row justify-between mb-2">
                <Text className="font-khmer text-gray-600 text-xl">
                  សរុបទឹកប្រាក់
                </Text>
                <Text className="font-khmerBold text-gray-900 text-lg">
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="font-khmer text-gray-600 text-lg">
                  ទឹកប្រាក់ត្រូវបង់
                </Text>
                <Text className="font-khmerBold text-green-600 text-lg">
                  ${numericPaid.toFixed(2)}
                </Text>
              </View>
              <View className="border-t border-gray-200 pt-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="font-khmerBold text-gray-900 text-lg">
                    នៅសល់
                  </Text>
                  <Text
                    className={`font-khmerBold text-lg ${
                      remaining > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    ${remaining.toFixed(2)}
                  </Text>
                </View>
              </View>
            </SectionCard>
          )}

          {/* ── Error ── */}
          {submitError ? (
            <View className="bg-red-50 rounded-2xl p-4 mb-4 mx-1">
              <Text className="font-khmer text-red-600 text-base">
                {submitError}
              </Text>
            </View>
          ) : null}

          {/* ── Submit ── */}
          <View className="px-1 mb-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`rounded-xl h-14 items-center justify-center flex-row gap-2 ${
                submitting ? "bg-blue-400" : "bg-blue-600"
              }`}
              style={{
                shadowColor: "#2563EB",
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {submitting && (
                <ActivityIndicator size="small" color="#FFFFFF" />
              )}
              <Text className="font-khmerBold text-white text-xl">
                {submitting
                  ? "កំពុងបង្កើតការបញ្ជាទិញ..."
                  : "បង្កើតការបញ្ជាទិញ"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
