import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { api, invalidateStockCache, invalidateStockHistoryCache } from "@/services";
import type { StockFormValues, StockFormErrors, StockFormStatus } from "../types/stock-form.types";
import { mapApiProduct, notifyNewProduct, mergeNewProductIntoCache } from "./useStockList";

const BASE_VALUES: StockFormValues = {
  productId: "",
  quantity: "",
  sellPrice: "",
};

function validate(values: StockFormValues): StockFormErrors {
  const errors: StockFormErrors = {};

  if (!values.productId) {
    errors.productId = "សូមជ្រើសរើសផលិតផល";
  }

  if (!values.quantity) {
    errors.quantity = "សូមបញ្ចូលចំនួនស្តុក";
  } else {
    const qty = Number(values.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.quantity = "ចំនួនស្តុកត្រូវតែធំជាង 0";
    }
  }

  if (!values.sellPrice) {
    errors.sellPrice = "សូមបញ្ចូលតម្លៃលក់";
  } else {
    const price = Number(values.sellPrice);
    if (!Number.isFinite(price) || price < 0) {
      errors.sellPrice = "តម្លៃលក់មិនអាចតិចជាង 0 បានទេ";
    }
  }

  return errors;
}

export function useStockForm(onSuccess?: () => void) {
  const [values, setValues] = useState<StockFormValues>(BASE_VALUES);
  const [errors, setErrors] = useState<StockFormErrors>({});
  const [status, setStatus] = useState<StockFormStatus>("idle");

  const updateField = useCallback(
    (key: keyof StockFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      // Clear field error on change
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [errors]
  );

  const handleProductSelect = useCallback((productId: string) => {
    setValues((prev) => ({ ...prev, productId }));
    setErrors((prev) => ({ ...prev, productId: undefined }));
  }, []);

  const reset = useCallback(() => {
    setValues(BASE_VALUES);
    setErrors({});
    setStatus("idle");
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Show first error as alert
      const firstError = Object.values(validationErrors).find(Boolean);
      if (firstError) {
        Alert.alert("កែសម្រួល", firstError);
      }
      return;
    }

    setStatus("submitting");

    try {
      const quantity = Number(values.quantity);
      const sellPrice = Number(values.sellPrice);

      const existingProduct = await api.products.get(values.productId);

      await api.products.update(values.productId, {
        name: existingProduct.name,
        sku: existingProduct.sku,
        categoryId: existingProduct.categoryId,
        costPrice: existingProduct.costPrice,
        salePrice: sellPrice,
        lowStockThreshold: existingProduct.lowStockThreshold,
        stock: existingProduct.stock,
        imageUrl: existingProduct.imageUrl,
        expiryDate: existingProduct.expiryDate,
        isActive: existingProduct.isActive,
      });

      await api.stock.createMovement({
        productId: values.productId,
        type: "in",
        quantity,
      });

      const updatedProduct = await api.products.get(values.productId);
      const stockProduct = mapApiProduct(updatedProduct as Parameters<typeof mapApiProduct>[0], 0);

      invalidateStockCache();
      invalidateStockHistoryCache();

      notifyNewProduct(stockProduct);
      mergeNewProductIntoCache(stockProduct).catch(() => {});

      setStatus("success");

      Alert.alert(
        "ជោគជ័យ",
        "បានបញ្ចូលស្តុកជោគជ័យ",
        [{ text: "OK", onPress: reset }]
      );

      onSuccess?.();
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data;
      if (__DEV__) {
        console.error("[STOCK FORM] Submit failed:", status, backendMessage || error);
      }
      setStatus("idle");

      Alert.alert(
        "បរាជ័យ",
        status === 400 && backendMessage
          ? String(backendMessage)
          : "មិនអាចបញ្ចូលស្តុកបានទេ។ សូមព្យាយាមម្តងទៀត។"
      );
    }
  }, [values, onSuccess, reset]);

  return {
    values,
    errors,
    status,
    updateField,
    handleProductSelect,
    submit,
    reset,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
  };
}
