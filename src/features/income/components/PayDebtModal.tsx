import { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/services";
import { androidInputStyle } from "@/theme/inputStyles";

import { DebtorOrder } from "../hooks/useDebtorDetail";

const USD_TO_KHR = 4046.81;

type PayMethod = "cash" | "bank";

const round2 = (value: number) =>
  Math.round(value * 100) / 100;

const money = (value: number) =>
  `$${round2(value || 0).toFixed(2)}`;

const formatKHRInput = (text: string): string => {
  const digitsOnly = text.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  const normalized = digitsOnly.replace(
    /^0+(?=\d)/,
    ""
  );

  return Number(
    normalized
  ).toLocaleString("en-US");
};

const parseKHR = (text: string): number =>
  Number(text.replace(/,/g, "")) || 0;

const formatKHR = (amount: number): string =>
  Math.round(amount).toLocaleString("en-US");

export type PayDebtResult = {
  succeeded: number;
  attempted: number;
  amountUSD: number;
  orderIds: string[];
};

type PayDebtModalProps = {
  visible: boolean;
  customerName?: string;
  orders: DebtorOrder[];
  totalDebt: number;
  onCancel: () => void;
  onPaid: (result: PayDebtResult) => void;
};

export function PayDebtModal({
  visible,
  customerName,
  orders,
  totalDebt,
  onCancel,
  onPaid,
}: PayDebtModalProps) {
  const [method, setMethod] =
    useState<PayMethod>("cash");

  const [amountInput, setAmountInput] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setMethod("cash");
      setAmountInput("");
      setError(null);
      setSubmitting(false);
    }
  }, [visible]);

  const numericPaid =
    method === "cash"
      ? parseKHR(amountInput)
      : Number(amountInput) || 0;

  const paidUSD =
    method === "cash"
      ? round2(numericPaid / USD_TO_KHR)
      : round2(numericPaid);

  const totalDebtUSD = round2(
    Number(totalDebt) || 0
  );

  const remainingAfterUSD = Math.max(
    0,
    round2(totalDebtUSD - paidUSD)
  );

  const breakdown = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) =>
        new Date(
          a.orderDate
        ).getTime() -
        new Date(
          b.orderDate
        ).getTime()
    );

    let remaining = paidUSD;
    const rows: {
      order: DebtorOrder;
      amount: number;
    }[] = [];

    for (const order of sorted) {
      if (remaining <= 0) break;

      const owe = round2(
        order.remainingAmount
      );

      const apply = round2(
        Math.min(owe, remaining)
      );

      if (apply > 0) {
        rows.push({
          order,
          amount: apply,
        });

        remaining = round2(
          remaining - apply
        );
      }
    }

    return rows;
  }, [orders, paidUSD]);

  const displayAmount = (usd: number): string => {
    return method === "cash"
      ? `${formatKHR(
          usd * USD_TO_KHR
        )} ៛`
      : money(usd);
  };

  const validate = (): string | null => {
    if (!amountInput.trim()) {
      return "សូមបញ្ចូលចំនួនប្រាក់ដែលត្រូវសង";
    }

    if (paidUSD <= 0) {
      return "ចំនួនបង់ត្រូវតែធំជាង ០";
    }

    if (paidUSD > totalDebtUSD) {
      return "ចំនួនបង់មិនអាចធំជាងប្រាក់ជំពាក់សរុបបានទេ";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (breakdown.length === 0) return;

    setSubmitting(true);
    setError(null);

    let succeeded = 0;

    try {
      for (const row of breakdown) {
        await api.orders.pay(
          row.order.id,
          row.amount,
          method
        );

        succeeded += 1;
      }
    } catch (err) {
      if (__DEV__) {
        console.error(
          "[PAY DEBT] Payment failed:",
          err
        );
      }

      if (succeeded === 0) {
        setError(
          (err as any)?.response
            ?.data?.message ||
            (err as any)?.message ||
            "ការទូទាត់ប្រាក់បានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។"
        );

        setSubmitting(false);
        return;
      }
    }

    if (__DEV__) {
      console.log(
        "[PAYMENT] Paid",
        succeeded,
        "order(s), amount:",
        paidUSD
      );
    }

    onPaid({
      succeeded,
      attempted: breakdown.length,
      amountUSD: paidUSD,
      orderIds: breakdown.map(
        (row) => row.order.id
      ),
    });

    setSubmitting(false);
  };

  const handleAmountChange = (
    text: string
  ) => {
    if (method === "cash") {
      setAmountInput(
        formatKHRInput(text)
      );
    } else {
      let sanitized = text.replace(
        /[^0-9.]/g,
        ""
      );

      const firstDot =
        sanitized.indexOf(".");

      if (firstDot !== -1) {
        sanitized =
          sanitized.substring(
            0,
            firstDot + 1
          ) +
          sanitized
            .substring(
              firstDot + 1
            )
            .replace(/\./g, "");
      }

      setAmountInput(sanitized);
    }

    if (error) {
      setError(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-black/30 justify-end"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View
          className="bg-white rounded-t-2xl p-5 max-h-[90%]"
          style={{
            paddingBottom: Math.max(
              insets.bottom,
              16
            ),
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 8,
            }}
          >
            {/* HEADER */}

            <View className="items-center mb-5">
              <View className="w-10 h-1 rounded-full bg-gray-200 mb-4" />

              <View className="w-14 h-14 rounded-full bg-green-50 items-center justify-center mb-2">
                <Ionicons
                  name="cash-outline"
                  size={30}
                  color="#16A34A"
                />
              </View>

              <Text
                className="font-khmerBold text-gray-900 text-2xl text-center"
                maxFontSizeMultiplier={1.3}
              >
                សងប្រាក់
              </Text>

              <Text
                className="font-khmer text-gray-400 text-lg mt-1 text-center"
                maxFontSizeMultiplier={1.3}
              >
                {customerName
                  ? `ទូទាត់ប្រាក់ជំពាក់របស់អតិថិជន ${customerName}`
                  : "ទូទាត់ប្រាក់ជំពាក់របស់អតិថិជន"}
              </Text>
            </View>

            {/* SUMMARY */}

            <View className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
              <View className="flex-row justify-between">
                <Text className="font-khmer text-gray-500 text-lg">
                  ប្រាក់ជំពាក់សរុប
                </Text>

                <Text className="font-khmerBold text-red-600 text-lg">
                  {displayAmount(totalDebtUSD)}
                </Text>
              </View>

              {method === "cash" && (
                <View className="flex-row justify-between mt-1">
                  <Text className="font-khmer text-gray-400 text-base">
                    ជាដុល្លារ
                  </Text>

                  <Text className="font-khmer text-gray-400 text-base">
                    {money(totalDebtUSD)}
                  </Text>
                </View>
              )}

              <View className="h-px bg-red-100 my-2" />

              <View className="flex-row justify-between">
                <Text className="font-khmerBold text-gray-700">
                  នៅជំពាក់ក្រោយបង់
                </Text>

                <Text className="font-khmerBold text-gray-900 text-lg">
                  {displayAmount(
                    remainingAfterUSD
                  )}
                </Text>
              </View>
            </View>

            {/* PAYMENT METHOD */}

            <Text className="font-khmerBold text-gray-900 text-xl mb-3">
              វិធីបង់ប្រាក់
            </Text>

            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMethod("cash");
                  setAmountInput("");
                  setError(null);
                }}
                className={`flex-1 rounded-2xl border-2 p-3 ${
                  method === "cash"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="items-center">
                  <Ionicons
                    name="cash-outline"
                    size={26}
                    color={
                      method === "cash"
                        ? "#2563EB"
                        : "#6B7280"
                    }
                  />

                  <Text
                    className={`font-khmerBold text-base mt-1.5 ${
                      method === "cash"
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    លុយខ្មែរ (៛)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMethod("bank");
                  setAmountInput("");
                  setError(null);
                }}
                className={`flex-1 rounded-2xl border-2 p-3 ${
                  method === "bank"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="items-center">
                  <Ionicons
                    name="wallet-outline"
                    size={26}
                    color={
                      method === "bank"
                        ? "#16A34A"
                        : "#6B7280"
                    }
                  />

                  <Text
                    className={`font-khmerBold text-base mt-1.5 ${
                      method === "bank"
                        ? "text-green-600"
                        : "text-gray-700"
                    }`}
                  >
                    លុយដុល្លារ ($)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* AMOUNT */}

            <Text className="font-khmerMedium text-gray-900 text-xl mb-1.5">
              ចំនួនប្រាក់ត្រូវសង{" "}
              {method === "cash"
                ? "(៛)"
                : "($)"}
            </Text>

            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mb-2">
              <TextInput
                value={amountInput}
                onChangeText={
                  handleAmountChange
                }
                keyboardType={
                  method === "cash"
                    ? "number-pad"
                    : "decimal-pad"
                }
                placeholder={
                  method === "cash"
                    ? "0"
                    : "0.00"
                }
                placeholderTextColor="#9CA3AF"
                className="font-khmer flex-1 text-xl text-gray-800"
                style={androidInputStyle}
              />

              <Text className="font-khmer text-gray-400 text-lg ml-2">
                {method === "cash"
                  ? "៛"
                  : "$"}
              </Text>
            </View>

            {method === "cash" &&
              numericPaid > 0 && (
                <Text className="font-khmer text-gray-400 text-base mb-2">
                  ≈ {money(paidUSD)}
                </Text>
              )}

            {/* ALLOCATION BREAKDOWN */}

            {breakdown.length > 0 &&
              paidUSD > 0 && (
                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                  <Text className="font-khmerBold text-gray-700 mb-2">
                    បែងចែកទៅការបញ្ជាទិញ
                  </Text>

                  {breakdown.map((row) => (
                    <View
                      key={row.order.id}
                      className="flex-row justify-between py-1"
                    >
                      <Text className="font-khmer text-gray-500 flex-1 mr-2">
                        {row.order.orderNumber}
                      </Text>

                      <Text className="font-khmerMedium text-gray-800">
                        {displayAmount(
                          row.amount
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

            {/* ERROR */}

            {error && (
              <View className="bg-red-50 rounded-xl px-3 py-2.5 mb-3 flex-row items-center">
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#DC2626"
                />

                <Text className="font-khmer text-red-600 text-base ml-2 flex-1">
                  {error}
                </Text>
              </View>
            )}

            {/* SUBMIT */}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
              className="bg-green-600 rounded-xl h-12 items-center justify-center w-full"
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                />
              ) : (
                <Text className="font-khmerBold text-white text-xl">
                  បញ្ជាក់ការទូទាត់
                </Text>
              )}
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              onPress={onCancel}
              disabled={submitting}
              className="items-center justify-center w-full mt-2 py-2"
            >
              <Text className="font-khmer text-gray-400 text-xl">
                បោះបង់
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}