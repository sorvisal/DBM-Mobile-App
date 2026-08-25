export type LoginFormValues = {
  username: string;
  password: string;
};

export type RegisterFormValues = {
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  storeName: string;
  password: string;
  confirmPassword: string;
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;