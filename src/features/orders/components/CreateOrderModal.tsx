import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Keyboard,
} from "react-native";
import { OrderSearchDropdown } from "../components/OrderSearchDropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DateField } from "../../stock/components/DateField";
import { Dropdown } from "../../stock/components/Dropdown";
import { useStockList } from "../../stock/hooks/useStockList";
import { useCustomerList } from "../../customers/hooks/useCustomerList";

import {
  AddressAutocomplete,
  type AddressResult,
} from "@/components/AddressAutocomplete";

type CreateOrderValues = {
  code: string;
  customerId: string;
  customerName: string;
  date: Date | null;
  productId: string;
  item: string;
  price: string;
  quantity: string;
  address: string;
  imageUrl: string;
};

const generateCode = () => {
  const now = new Date();

  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const seq = String(
    Math.floor(Math.random() * 900) + 100
  );

  return `OD-${yy}${mm}${dd}-${seq}`;
};

const initialValues: CreateOrderValues = {
  code: "",
  customerId: "",
  customerName: "",
  date: null,
  productId: "",
  item: "",
  price: "",
  quantity: "",
  address: "",
  imageUrl: "",
};

type CreateOrderModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateOrderValues) => void;
};

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
        {label}{" "}
        {required && (
          <Text className="text-red-500">
            *
          </Text>
        )}
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

export function CreateOrderModal({
  visible,
  onClose,
  onSubmit,
}: CreateOrderModalProps) {
  const [values, setValues] =
    useState<CreateOrderValues>(initialValues);

  const {
    data: products,
    isLoading: productsLoading,
  } = useStockList();

  const {
    allCustomers,
    isLoading: customersLoading,
  } = useCustomerList();

  const insets = useSafeAreaInsets();

  // =========================================================
  // OPTIONS
  // =========================================================

  const productOptions = (products ?? []).map((product) => ({
    label: `${product.name} — $${product.sellPrice.toFixed(2)}`,
    value: product.id,
  }));

  const customerOptions = (allCustomers ?? []).map(
    (customer) => ({
      label: customer.name,
      value: customer.id,
    })
  );

  // UPDATE FORM
  const update = (
    key: keyof CreateOrderValues,
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  // RESET / OPEN
  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();

      setValues((prev) => ({
        ...prev,
        code: generateCode(),
      }));
    }
  }, [visible]);
  // CUSTOMER
  const handleSelectCustomer = (
    customerId: string
  ) => {
    const customer = (
      allCustomers ?? []
    ).find(
      (item) => item.id === customerId
    );

    if (!customer) {
      return;
    }

    setValues((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
    }));
  };
  // PRODUCT
  const handleSelectProduct = (
    productId: string
  ) => {
    const product = (
      products ?? []
    ).find(
      (item) => item.id === productId
    );

    if (!product) {
      return;
    }

    setValues((prev) => ({
      ...prev,
      productId: product.id,
      item: product.name,
      price: String(product.sellPrice),
      imageUrl: product.imageUrl ?? "",
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = () => {
    Keyboard.dismiss();

    onSubmit({
      ...values,
      code:
        values.code || generateCode(),
    });

    setValues({
      ...initialValues,
      code: generateCode(),
    });
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* =====================================================
          KEYBOARD HANDLER
      ====================================================== */}
      <View className="flex-1 bg-black/30 justify-end">
        {/* ===================================================
            BOTTOM SHEET
        ==================================================== */}
        <View
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{
            maxHeight: "90%",
            paddingBottom: Math.max(
              insets.bottom,
              16
            ),
          }}
        >
          {/* =================================================
              HEADER
          ================================================== */}
          <View className="flex-row items-center justify-between bg-blue-600 px-5 pt-4 pb-3">
            <View className="flex-1 pr-3">
              <Text
                className="font-khmerBold text-white text-xl"
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}
              >
                បង្កើតការបញ្ជាទិញថ្មី
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* =================================================
              KEYBOARD AWARE FORM
          ================================================== */}
          <KeyboardAwareScrollView
            className="flex-1"
            bottomOffset={24}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom:
                40 + insets.bottom,
            }}
          >
            {/* =================================================
                ORDER INFORMATION
            ================================================== */}

            <FormField label="លេខកូដ">
              <TextInput
                value={values.code}
                onChangeText={(value) =>
                  update("code", value)
                }
                editable={false}
                placeholderTextColor="#D1D5DB"
                returnKeyType="next"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-500 bg-gray-50"
                style={androidInputStyle}
              />
            </FormField>

            {/* =================================================
                CUSTOMER
            ================================================== */}

            <FormField
              label="ឈ្មោះអតិថិជន"
              required
            >
             <OrderSearchDropdown
                placeholder="ជ្រើសរើសអតិថិជន"
                options={customerOptions}
                value={values.customerId || null}
                onChange={handleSelectCustomer}
                searchable
                searchPlaceholder="ស្វែងរកឈ្មោះអតិថិជន..."
              />
            </FormField>

            {/* =================================================
                CUSTOMER DETAILS
            ================================================== */}

            {values.customerId ? (
              <View className="bg-gray-50 rounded-xl p-3 mb-2">
                {(() => {
                  const customer = (
                    allCustomers ?? []
                  ).find(
                    (item) =>
                      item.id ===
                      values.customerId
                  );

                  if (!customer) {
                    return (
                      <Text className="font-khmer text-gray-400 text-base">
                        មិនមានព័ត៌មានបន្ថែម
                      </Text>
                    );
                  }

                  return (
                    <>
                      {customer.phone ? (
                        <Text className="font-khmer text-gray-600 text-lg">
                          ទូរស័ព្ទ៖{" "}
                          {customer.phone}
                        </Text>
                      ) : null}

                      {customer.location ? (
                        <Text className="font-khmer text-gray-600 text-lg mt-1">
                          អាស័យដ្ឋាន៖{" "}
                          {customer.location}
                        </Text>
                      ) : null}

                      {!customer.phone &&
                        !customer.location && (
                          <Text className="font-khmer text-gray-400 text-base">
                            មិនមានព័ត៌មានបន្ថែម
                          </Text>
                        )}
                    </>
                  );
                })()}
              </View>
            ) : null}

            {/* =================================================
                DATE
            ================================================== */}

            <FormField
              label="កាលបរិច្ឆេទ"
              required
            >
              <DateField
                placeholder="ជ្រើសរើសកាលបរិច្ឆេទ"
                value={values.date}
                onChange={(date) =>
                  setValues((prev) => ({
                    ...prev,
                    date,
                  }))
                }
              />
            </FormField>

            {/* =================================================
                PRODUCT
            ================================================== */}

            <FormField
              label="ទំនិញ"
              required
            >
              <OrderSearchDropdown
                placeholder="ជ្រើសរើសទំនិញ"
                options={productOptions}
                value={values.productId || null}
                onChange={handleSelectProduct}
                searchable
                searchPlaceholder="ស្វែងរកឈ្មោះផលិតផល..."
              />
            </FormField>

            {/* =================================================
                PRODUCT DETAILS
            ================================================== */}

            {values.productId ? (
              <View className="bg-gray-50 rounded-xl p-3 mb-2">
                {values.item ? (
                  <Text className="font-khmer text-gray-700 text-lg">
                    ទំនិញ៖{" "}
                    {values.item}
                  </Text>
                ) : null}

                {values.price ? (
                  <Text className="font-khmer text-gray-600 text-lg mt-1">
                    តម្លៃ៖ $
                    {Number(
                      values.price
                    ).toFixed(2)}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* =================================================
                PRICE + QUANTITY
            ================================================== */}

            <View className="flex-row gap-3">
              {/* PRICE */}
              <View className="flex-1">
                <FormField
                  label="តម្លៃ ($)"
                  required
                >
                  <TextInput
                    value={values.price}
                    onChangeText={(value) =>
                      update(
                        "price",
                        value
                      )
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#D1D5DB"
                    returnKeyType="next"
                    className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                    style={androidInputStyle}
                  />
                </FormField>
              </View>

              {/* QUANTITY */}
              <View className="flex-1">
                <FormField
                  label="ចំនួន"
                  required
                >
                  <TextInput
                    value={values.quantity}
                    onChangeText={(value) =>
                      update(
                        "quantity",
                        value
                      )
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                    returnKeyType="done"
                    className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                    style={androidInputStyle}
                  />
                </FormField>
              </View>
            </View>

            {/* =================================================
                ADDRESS
            ================================================== */}

            <FormField label="អាស័យដ្ឋាន">
              <AddressAutocomplete
                value={values.address}
                onChange={(value) =>
                  update(
                    "address",
                    value
                  )
                }
                onSelect={(
                  place: AddressResult
                ) => {
                  setValues((prev) => ({
                    ...prev,
                    address:
                      place.displayName,
                  }));
                }}
                placeholder="បញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន"
              />
            </FormField>

            {/* =================================================
                SUBMIT
            ================================================== */}

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              className="bg-blue-600 rounded-xl h-12 items-center justify-center mt-2 mb-8"
            >
              <Text className="font-khmerBold text-white text-xl">
                រក្សាទុក
              </Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}