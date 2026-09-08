import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { androidInputStyle } from "@/theme/inputStyles";
import { useStockForm } from "../hooks/useStockForm";
import { useProductDetail } from "../hooks/useProductDetail";
import { ProductSelector } from "./ProductSelector";
import { ProductPreview } from "./ProductPreview";
import { StockSummary } from "./StockSummary";

type StockFormProps = {
  onSuccess?: () => void;
};

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="font-khmerMedium text-xl text-gray-900 mb-1.5">
        {label}
        {required && " *"}
      </Text>

      {children}

      {error && (
        <Text className="font-khmer text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}

export function StockForm({ onSuccess }: StockFormProps) {
  const {
    values,
    errors,
    isSubmitting,
    updateField,
    handleProductSelect,
    submit,
  } = useStockForm(onSuccess);

  const {
    product,
    isLoading: loadingProduct,
    error: productDetailError,
  } = useProductDetail(values.productId || null);

  const isDisabled = isSubmitting || loadingProduct;

  const handleSubmit = () => {
    Keyboard.dismiss();
    submit();
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white px-5 pt-4"
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {/* =========================
          PRODUCT SELECTOR
      ========================== */}
      <FormField
        label="ផលិតផល"
        required
        error={errors.productId}
      >
        <ProductSelector
          value={values.productId || null}
          onChange={handleProductSelect}
        />
      </FormField>

      {/* =========================
          PRODUCT PREVIEW
      ========================== */}
      <ProductPreview
        product={product}
        isLoading={loadingProduct}
        error={productDetailError}
      />

      {/* =========================
          STOCK SUMMARY
      ========================== */}
      <StockSummary
        product={product}
        quantity={values.quantity}
        sellPrice={values.sellPrice}
      />

      {/* =========================
          QUANTITY
      ========================== */}
      <FormField
        label="ចំនួន"
        required
        error={errors.quantity}
      >
        <TextInput
          value={values.quantity}
          onChangeText={(v) =>
            updateField("quantity", v)
          }
          keyboardType="numeric"
          placeholder="បញ្ចូលចំនួន"
          placeholderTextColor="#D1D5DB"
          returnKeyType="next"
          className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
          style={androidInputStyle}
          editable={!isDisabled}
        />
      </FormField>

      {/* =========================
          SELL PRICE
      ========================== */}
      <FormField
        label="តម្លៃលក់ ($)"
        required
        error={errors.sellPrice}
      >
        <TextInput
          value={values.sellPrice}
          onChangeText={(v) =>
            updateField("sellPrice", v)
          }
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#D1D5DB"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
          style={androidInputStyle}
          editable={!isDisabled}
        />
      </FormField>

      {/* =========================
          SUBMIT
      ========================== */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isDisabled}
        activeOpacity={0.8}
        className={`bg-blue-600 rounded-xl h-12 items-center justify-center mt-2 mb-8 ${
          isDisabled ? "opacity-60" : ""
        }`}
      >
        <Text className="font-khmerBold text-white text-2xl">
          {isSubmitting
            ? "កំពុងរក្សាទុក..."
            : "រក្សាទុក"}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}