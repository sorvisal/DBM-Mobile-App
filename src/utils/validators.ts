export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  return phone.replace(/\s/g, "").length >= 8;
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}
