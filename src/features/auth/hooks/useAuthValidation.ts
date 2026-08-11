import { FormErrors, LoginFormValues, RegisterFormValues } from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginFormValues): FormErrors<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {};

  if (!values.username.trim()) errors.username = "សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់";
  if (!values.password.trim()) errors.password = "សូមបញ្ចូលពាក្យសម្ងាត់";

  return errors;
}

export function validateRegister(values: RegisterFormValues): FormErrors<RegisterFormValues> {
  const errors: FormErrors<RegisterFormValues> = {};

  if (!values.username.trim()) errors.username = "សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់";

  if (!values.email.trim()) {
    errors.email = "សូមបញ្ចូលអ៊ីមែល";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "អ៊ីមែលមិនត្រឹមត្រូវទេ";
  }

  if (!values.mobile.trim()) errors.mobile = "សូមបញ្ចូលលេខទូរស័ព្ទ";

  if (!values.password.trim()) {
    errors.password = "សូមបញ្ចូលពាក្យសម្ងាត់";
  } else if (values.password.length < 6) {
    errors.password = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ";
  }

  return errors;
}