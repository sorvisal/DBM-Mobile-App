export type StockFormValues = {
  productId: string;
  quantity: string;
  sellPrice: string;
};

export type StockFormErrors = {
  productId?: string;
  quantity?: string;
  sellPrice?: string;
};

export type StockFormStatus = "idle" | "loading_product" | "submitting" | "success";
