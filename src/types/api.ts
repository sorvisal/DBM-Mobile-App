export type OrderStatus = 'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type StockMovementType = 'in' | 'out' | 'adjustment';

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: Record<string, string>;
};

export type UserRole = 'owner' | 'admin' | 'staff' | 'user';

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  storeName?: string;
  avatarUrl?: string;
  createdAt: string;
  googleLinked?: boolean;
};

export type Tokens = {
  accessToken: string;
  /** Optional — backends that only issue a single application JWT omit this. */
  refreshToken?: string;
};

export type Category = {
  id: string;
  name: string;
  productCount: number;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  unit?: string;
  lowStockThreshold: number;
  imageUrl?: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName?: string;
  type: StockMovementType;
  quantity: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  photoPath?: string | null;
  createdAt: string;
};

export type PurchaseOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type PurchaseOrder = {
  id: string;
  code: string;
  supplierId?: string;
  supplierName?: string;
  status: OrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  note?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl?: string;
};
export type Order = {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod?: string;
  deliveryAddress?: string;
  driverName?: string;
  driverPhone?: string;
  note?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  balance: number;
  creditLimit: number;
  totalOrders: number;
  status: 'active' | 'inactive';
  createdAt: string;
  photoPath?: string | null;
  imageUrl?: string | null;
};

export type ProductSummary = {
  total: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryCount: number;
  expiringCount: number;
};

export type RevenueSummary = {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  ordersCount: number;
  averageOrderValue: number;
  range: string;
};

export type RevenuePoint = {
  date: string;
  revenue: number;
};

export type ReceivableItem = {
  customerId: string;
  customerName: string;
  phone?: string;
  balance: number;
};

export type ReceivablesSummary = {
  totalReceivable: number;
  overdueCount: number;
  customers: ReceivableItem[];
};

export type AppNotification = {
  id: string;
  type: 'order' | 'stock' | 'payment' | 'system';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type NotificationListParams = {
  unread?: boolean;
  page?: number;
  pageSize?: number;
};

export type LoginRequest = {
  usernameOrEmail: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  usernameOrEmail: string;
  password: string;
  storeName?: string;
  phone?: string;
};

export type GoogleSignInRequest = {
  /** The Google ID token (JWT) obtained from the native Google Sign-In SDK. */
  idToken: string;
};

export type GoogleLinkRequest = {
  /** Native: the Google ID token (JWT) from the Google Sign-In SDK. */
  idToken?: string;
  /** Web: the signed link token produced by the backend OAuth callback. */
  token?: string;
};

export type LoginResponse = {
  tokens: Tokens;
  user: User;
};

export type UpdateProfileRequest = {
  name?: string;
  phone?: string;
  storeName?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type CreateProductRequest = {
  name: string;
  sku: string;
  categoryId: string;
  costPrice: number;
  salePrice: number;
  unit?: string;
  lowStockThreshold: number;
  stock?: number;
  imageUrl?: string;
  expiryDate?: string;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type ProductListParams = {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
};

export type CreatePurchaseOrderRequest = {
  supplierName: string;
  items: PurchaseOrderItem[];
  note?: string;
};

export type CreateOrderRequest = {
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  deliveryAddress?: string;
  note?: string;
};

export type CreateCustomerRequest = {
  name: string;
  phone?: string;
  address?: string;
  status?: 'active' | 'inactive';
  photo?: { uri: string; name: string; type: string };
};

export type CreateStockMovementRequest = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
};

export type AdminUserDto = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  storeName?: string;
  role: UserRole;
  isActive: boolean;
  googleLinked?: boolean;
  createdAt: string;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  phone?: string;
  storeName?: string;
  role?: UserRole;
};

export type UpdateUserRequest = Partial<CreateUserRequest> & {
  isActive?: boolean;
};

export type ResetPasswordRequest = {
  newPassword: string;
};
