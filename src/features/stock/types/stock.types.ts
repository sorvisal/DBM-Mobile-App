export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  expiresAt: string | null;
  status: StockStatus;
}

export interface StockTransaction {
  id: string;
  productId: string;
  type: "in" | "out";
  quantity: number;
  createdAt: string;
}

export interface StockFormValues {
  name: string;
  category: string;
  quantity: string;
  buyPrice: string;
  sellPrice: string;
  expiresAt: string;
}
