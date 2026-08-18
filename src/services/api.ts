import { Platform } from 'react-native';

import { API_BASE_URL, httpDelete, httpDownloadBlob, httpGet, httpGetPaginated, httpPost, httpPut, resolveMediaUrl } from '@/services/http';
import { cacheGet, cacheSet, CacheTTL } from '@/services/cache';
import type {
  AppNotification,
  Category,
  ChangePasswordRequest,
  CreateUserRequest,
  CreateCustomerRequest,
  CreateOrderRequest,
  CreateProductRequest,
  CreatePurchaseOrderRequest,
  CreateStockMovementRequest,
  Customer,
  GoogleSignInRequest,
  GoogleLinkRequest,
  LoginRequest,
  LoginResponse,
  NotificationListParams,
  Order,
  OrderStatus,
  Paginated,
  PaymentStatus,
  Product,
  ProductListParams,
  ProductSummary,
  PurchaseOrder,
  ReceivablesSummary,
  RegisterRequest,
  RevenuePoint,
  RevenueSummary,
  StockMovement,
  StockMovementType,
  Supplier,
  Tokens,
  UpdateProductRequest,
  UpdateProfileRequest,
  UpdateUserRequest,
  User,
  UserRole,
  AdminUserDto,
  ResetPasswordRequest,
} from '@/types/api';

type UploadFileInput = { uri: string; name: string; type: string };

/** Converts a picked image into something FormData can actually send.
 *  Native RN understands `{ uri, name, type }`; on web the picker returns a
 *  `blob:` URI which must be fetched into a real File first. */
async function toFormFilePart(file: UploadFileInput): Promise<Blob> {
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    return new File([blob], file.name, { type: file.type || blob.type || 'image/jpeg' });
  }
  return { uri: file.uri, name: file.name, type: file.type } as unknown as Blob;
}

/* ── Backend DTOs (raw API shapes) ── */
type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: BackendUserDto;
};

/** Response of `POST /auth/google` — accepts the app's own contract as well as
 *  the existing token pair convention so the client stays compatible either way. */
type BackendGoogleAuthResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user: BackendGoogleUserDto;
};

type BackendGoogleUserDto = {
  id: number | string;
  username?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  storeName?: string | null;
  role?: string;
  picture?: string | null;
  avatarUrl?: string | null;
};

type BackendUserDto = {
  id: number;
  username: string;
  fullName: string;
  phone: string | null;
  storeName: string | null;
  role: string;
  isGoogleLinked?: boolean;
};

type BackendProductDto = {
  id: number;
  sku: string;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  costPrice: number;
  stockQty: number;
  lowStockThreshold: number;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  photoPath: string | null;
};

type BackendCategoryDto = { id: number; name: string };

type BackendStockMovementDto = {
  id: number;
  productId: number;
  productName: string;
  type: string;
  quantity: number;
  referenceType: string;
  referenceId: number | null;
  note: string | null;
  createdAt: string;
};

type BackendCustomerDto = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  status: string;
  balance: number;
  createdAt: string;
  photoPath: string | null;
};

type BackendCustomerStatsDto = { orderCount: number; balance: number; totalSpent: number };
type BackendCustomerDetailDto = { customer: BackendCustomerDto; stats: BackendCustomerStatsDto };

type BackendOrderItemDto = { productId: number; productName: string; qty: number; unitPrice: number; lineTotal: number };
type BackendOrderDto = {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  status: string;
  paymentStatus: string;
  deliveryAddress: string | null;
  driverName: string | null;
  driverPhone: string | null;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  lines: BackendOrderItemDto[];
};

type BackendPurchaseLineDto = { productId: number; productName: string; qty: number; unitCost: number; lineTotal: number };
type BackendPurchaseOrderDto = {
  id: number;
  code: string;
  supplierName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  lines: BackendPurchaseLineDto[];
};

type BackendSupplierDto = { id: number; name: string; contactPerson: string | null; phone: string | null; address: string | null; photoPath: string | null };

type BackendNotificationDto = {
  id: number;
  userId: number | null;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

/* ── Helpers ── */
function mapUserRole(role: string): UserRole {
  const v = role.toLowerCase();
  if (v === 'owner' || v === 'admin' || v === 'staff' || v === 'user') return v;
  return 'user';
}

function mapUser(raw: BackendUserDto): User {
  return {
    id: String(raw.id),
    name: raw.fullName,
    username: raw.username,
    email: '',
    phone: raw.phone ?? undefined,
    role: mapUserRole(raw.role),
    storeName: raw.storeName ?? undefined,
    createdAt: new Date().toISOString(),
    googleLinked: raw.isGoogleLinked ?? false,
  };
}

function mapAuthResponse(raw: BackendAuthResponse): LoginResponse {
  return {
    tokens: { accessToken: raw.accessToken, refreshToken: raw.refreshToken },
    user: mapUser(raw.user),
  };
}

function mapGoogleUser(dto: BackendGoogleUserDto): User {
  // Backend that shares the existing user model (username + fullName).
  if (typeof dto.fullName === 'string' && typeof dto.username === 'string') {
    return mapUser({
      id: Number(dto.id),
      username: dto.username,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      storeName: dto.storeName ?? null,
      role: dto.role ?? 'user',
    });
  }
  // Backend that returns the contract described in GOOGLE_AUTH_SETUP.md:
  // `{ id, email, name, picture }`.
  const email = dto.email ?? '';
  return {
    id: String(dto.id),
    name: dto.name ?? dto.fullName ?? (email.split('@')[0] || 'User'),
    username: email,
    email,
    role: dto.role ? mapUserRole(dto.role) : 'user',
    avatarUrl: dto.picture ?? dto.avatarUrl ?? undefined,
    createdAt: new Date().toISOString(),
  };
}

function mapGoogleAuthResponse(raw: BackendGoogleAuthResponse): LoginResponse {
  const accessToken = raw.token ?? raw.accessToken;
  if (!accessToken) throw new Error('Backend did not return an application token');
  return {
    tokens: { accessToken, refreshToken: raw.refreshToken },
    user: mapGoogleUser(raw.user),
  };
}

function mapProduct(dto: BackendProductDto): Product {
  return {
    id: String(dto.id),
    name: dto.name,
    sku: dto.sku,
    categoryId: String(dto.categoryId),
    category: dto.categoryName,
    costPrice: dto.costPrice,
    salePrice: dto.price,
    stock: dto.stockQty,
    unit: undefined,
    lowStockThreshold: dto.lowStockThreshold,
    expiryDate: dto.expiryDate ?? undefined,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    imageUrl: resolveMediaUrl(dto.photoPath),
  };
}

function mapCategory(dto: BackendCategoryDto, productCount = 0): Category {
  return { id: String(dto.id), name: dto.name, productCount };
}

function mapStockMovement(dto: BackendStockMovementDto): StockMovement {
  return {
    id: String(dto.id),
    productId: String(dto.productId),
    productName: dto.productName || undefined,
    type: dto.type as StockMovementType,
    quantity: dto.quantity,
    balanceAfter: 0,
    note: dto.note ?? undefined,
    createdAt: dto.createdAt,
  };
}

function mapCustomer(dto: BackendCustomerDto, stats?: BackendCustomerStatsDto): Customer {
  return {
    id: String(dto.id),
    name: dto.name,
    phone: dto.phone ?? undefined,
    address: dto.address ?? undefined,
    balance: dto.balance,
    creditLimit: 0,
    totalOrders: stats?.orderCount ?? 0,
    status: dto.status === 'inactive' ? 'inactive' : 'active',
    createdAt: dto.createdAt,
    imageUrl: resolveMediaUrl(dto.photoPath),
  };
}

function mapOrder(dto: BackendOrderDto): Order {
  return {
    id: String(dto.id),
    code: dto.code,
    customerId: String(dto.customerId),
    customerName: dto.customerName,
    status: dto.status as OrderStatus,
    paymentStatus: dto.paymentStatus as PaymentStatus,
    items: dto.lines.map((i) => ({
      productId: String(i.productId),
      productName: i.productName,
      quantity: i.qty,
      unitPrice: i.unitPrice,
      total: i.lineTotal,
    })),
    totalAmount: dto.totalAmount,
    paidAmount: dto.paidAmount,
    paymentMethod: dto.paymentMethod ?? undefined,
    deliveryAddress: dto.deliveryAddress ?? undefined,
    driverName: dto.driverName ?? undefined,
    driverPhone: dto.driverPhone ?? undefined,
    note: dto.deliveryAddress ?? undefined,
    createdAt: dto.createdAt,
    confirmedAt: dto.confirmedAt ?? undefined,
    completedAt: dto.completedAt ?? undefined,
  };
}

function mapPurchaseOrder(dto: BackendPurchaseOrderDto): PurchaseOrder {
  return {
    id: String(dto.id),
    code: dto.code,
    supplierName: dto.supplierName,
    status: dto.status as OrderStatus,
    items: dto.lines.map((i) => ({
      productId: String(i.productId),
      productName: i.productName,
      quantity: i.qty,
      unitPrice: i.unitCost,
      total: i.lineTotal,
    })),
    totalAmount: dto.totalAmount,
    createdAt: dto.createdAt,
    confirmedAt: dto.confirmedAt ?? undefined,
    completedAt: dto.completedAt ?? undefined,
  };
}

function mapAdminUser(dto: BackendUserDto): AdminUserDto {
  return {
    id: String(dto.id),
    username: dto.username,
    fullName: dto.fullName,
    email: '',
    phone: dto.phone ?? undefined,
    storeName: dto.storeName ?? undefined,
    role: mapUserRole(dto.role),
    isActive: true,
    googleLinked: dto.isGoogleLinked ?? false,
    createdAt: new Date().toISOString(),
  };
}

function mapSupplier(dto: BackendSupplierDto): Supplier {
  return {
    id: String(dto.id),
    name: dto.name,
    phone: dto.phone ?? undefined,
    address: dto.address ?? undefined,
    contactPerson: dto.contactPerson ?? undefined,
    photoPath: dto.photoPath,
    createdAt: new Date().toISOString(),
  };
}

function inferNotificationType(title: string, body: string): AppNotification['type'] {
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes('stock') || text.includes('expir')) return 'stock';
  if (text.includes('payment') || text.includes(' paid ') || text.includes('pay')) return 'payment';
  if (text.includes('order')) return 'order';
  return 'system';
}

function mapNotification(dto: BackendNotificationDto): AppNotification {
  return {
    id: String(dto.id),
    type: inferNotificationType(dto.title, dto.body),
    title: dto.title,
    body: dto.body,
    read: dto.isRead,
    createdAt: dto.createdAt,
  };
}

function toPaginated<T>(items: T[], meta: { page: number; pageSize: number; total: number; totalPages: number } | null): Paginated<T> {
  return {
    items,
    total: meta?.total ?? items.length,
    page: meta?.page ?? 1,
    pageSize: meta?.pageSize ?? items.length,
  };
}

function toId(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function chartRangeFor(range: string): string {
  return range === '12m' || range === '30d' ? range : '7d';
}

function exportPeriodFor(range: string): string {
  if (range === '12m') return 'year';
  if (range === '7d') return 'day';
  return 'month';
}

/* ── Interface ── */
export interface Api {
  auth: {
    register: (req: RegisterRequest) => Promise<LoginResponse>;
    login: (req: LoginRequest) => Promise<LoginResponse>;
    refresh: (refreshToken: string) => Promise<Tokens>;
    logout: () => Promise<void>;
    me: () => Promise<User>;
    updateMe: (req: UpdateProfileRequest) => Promise<User>;
    changePassword: (req: ChangePasswordRequest) => Promise<void>;
    googleLoginUrl: (mode?: 'login' | 'link') => Promise<string>;
    googleCallback: (callbackUrl: string) => Promise<LoginResponse>;
    googleSignIn: (req: GoogleSignInRequest) => Promise<LoginResponse>;
    linkGoogle: (req: GoogleLinkRequest) => Promise<User>;
    unlinkGoogle: () => Promise<User>;
  };
  products: {
    summary: () => Promise<ProductSummary>;
    list: (params: ProductListParams) => Promise<Paginated<Product>>;
    get: (id: string) => Promise<Product>;
    create: (req: CreateProductRequest) => Promise<Product>;
    update: (id: string, req: UpdateProductRequest) => Promise<Product>;
    remove: (id: string) => Promise<void>;
    uploadImage: (file: { uri: string; name: string; type: string }) => Promise<{ url: string }>;
  };
  categories: {
    list: () => Promise<Category[]>;
    create: (name: string) => Promise<Category>;
  };
    stock: {
    movements: (params: { page?: number; pageSize?: number; productId?: string; type?: string; from?: string; to?: string }) => Promise<Paginated<StockMovement>>;
    createMovement: (req: CreateStockMovementRequest) => Promise<StockMovement>;
  };
  purchaseOrders: {
    list: (params: { page?: number; pageSize?: number }) => Promise<Paginated<PurchaseOrder>>;
    get: (id: string) => Promise<PurchaseOrder>;
    create: (req: CreatePurchaseOrderRequest) => Promise<PurchaseOrder>;
    setStatus: (id: string, status: string) => Promise<PurchaseOrder>;
  };
  suppliers: {
    list: () => Promise<Supplier[]>;
    get: (id: string) => Promise<Supplier>;
    create: (req: { name: string; phone?: string; address?: string }) => Promise<Supplier>;
    update: (id: string, req: { name: string; contactPerson?: string | null; phone?: string | null; address?: string | null }) => Promise<Supplier>;
    remove: (id: string) => Promise<void>;
  };
  orders: {
    list: (params: { page?: number; pageSize?: number; status?: string; search?: string }) => Promise<Paginated<Order>>;
    get: (id: string) => Promise<Order>;
    create: (req: CreateOrderRequest) => Promise<Order>;
    confirm: (id: string) => Promise<Order>;
    assignDriver: (id: string, driverName: string, driverPhone?: string) => Promise<Order>;
    pay: (id: string, amount: number, method: string) => Promise<Order>;
    setStatus: (id: string, status: OrderStatus) => Promise<Order>;
  };
  customers: {
    list: (params: { search?: string; status?: string; page?: number; pageSize?: number }) => Promise<Paginated<Customer>>;
    get: (id: string) => Promise<Customer>;
    getOrders: (id: string) => Promise<Order[]>;
    create: (req: CreateCustomerRequest) => Promise<Customer>;
    update: (id: string, req: Partial<CreateCustomerRequest>) => Promise<Customer>;
    remove: (id: string) => Promise<void>;
  };
  reports: {
    revenue: (range: string) => Promise<RevenueSummary>;
    revenueChart: (range: string) => Promise<RevenuePoint[]>;
    receivables: () => Promise<ReceivablesSummary>;
    export: (params: { type: 'excel' | 'pdf'; period: string }) => Promise<{ url: string }>;
  };
  notifications: {
    list: (params?: NotificationListParams) => Promise<Paginated<AppNotification>>;
    markRead: (id: string) => Promise<AppNotification>;
    markAllRead: () => Promise<void>;
  };
  users: {
    list: (params: { search?: string; role?: UserRole; active?: boolean; page?: number; pageSize?: number }) => Promise<Paginated<AdminUserDto>>;
    get: (id: string) => Promise<AdminUserDto>;
    create: (req: CreateUserRequest) => Promise<AdminUserDto>;
    update: (id: string, req: UpdateUserRequest) => Promise<AdminUserDto>;
    remove: (id: string) => Promise<void>;
    resetPassword: (id: string, req: ResetPasswordRequest) => Promise<void>;
  };
}

/* ── Real API ── */
export const realApi: Api = {
  auth: {
    register: async (req) => mapAuthResponse(await httpPost<BackendAuthResponse>('/auth/register', req)),
    login: async (req) => mapAuthResponse(await httpPost<BackendAuthResponse>('/auth/login', req)),
    refresh: async (refreshToken) => {
      const raw = await httpPost<BackendAuthResponse>('/auth/refresh', { refreshToken });
      return { accessToken: raw.accessToken, refreshToken: raw.refreshToken };
    },
    logout: () => httpPost<void>('/auth/logout'),
    me: async () => mapUser(await httpGet<BackendUserDto>('/auth/me')),
    updateMe: async (req) => {
      const mapped = await httpPut<BackendUserDto>('/auth/me', {
        fullName: req.name,
        phone: req.phone,
        storeName: req.storeName,
      });
      return mapUser(mapped);
    },
    changePassword: (req) => httpPut<void>('/auth/me/password', req),
    googleLoginUrl: async (mode) => {
      const origin =
        Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : '';
      const params = new URLSearchParams();
      if (origin) params.set('redirect', origin);
      if (mode === 'link') params.set('mode', 'link');
      const qs = params.toString();
      return `${API_BASE_URL}/auth/google-login${qs ? `?${qs}` : ''}`;
    },
    linkGoogle: async (req) => mapUser(await httpPost<BackendUserDto>('/auth/google/link', req)),
    unlinkGoogle: async () => mapUser(await httpPost<BackendUserDto>('/auth/google/unlink')),
    googleCallback: async (callbackUrl) => {
      const url = new URL(callbackUrl);
      const accessToken = url.searchParams.get('accessToken');
      const refreshToken = url.searchParams.get('refreshToken');
      const displayName = url.searchParams.get('displayName') ?? url.searchParams.get('name');
      const username = url.searchParams.get('username');
      if (accessToken && refreshToken) {
        return {
          tokens: { accessToken, refreshToken },
          user: {
            id: String(url.searchParams.get('userId') ?? 0),
            name: displayName ?? username ?? 'User',
            username: username ?? '',
            email: url.searchParams.get('email') ?? '',
            role: 'user' as UserRole,
            createdAt: new Date().toISOString(),
          },
        };
      }
      const resp = await fetch(callbackUrl, { credentials: 'include' });
      if (resp.ok) {
        const json = await resp.json();
        const payload = json && typeof json === 'object' && 'success' in json ? json.data : json;
        return mapAuthResponse(payload);
      }
      throw new Error('Google callback failed');
    },
    googleSignIn: async (req) => mapGoogleAuthResponse(await httpPost<BackendGoogleAuthResponse>('/auth/google', req)),
  },

   products: {
     summary: async () => {
       const data = await httpGet<{ totalSkus: number; lowStockCount: number; expiringCount: number }>('/products/summary');
       return {
         total: data.totalSkus,
         totalUnits: 0,
         lowStockCount: data.lowStockCount,
         outOfStockCount: 0,
         categoryCount: 0,
         expiringCount: data.expiringCount,
       };
     },
     list: async (params) => {
       const { items, meta } = await httpGetPaginated<BackendProductDto>('/products', {
         params: {
           search: params.search,
           categoryId: toId(params.category),
           lowStock: params.lowStock || undefined,
           page: params.page,
           pageSize: params.pageSize,
         },
       });
       return toPaginated(items.map(mapProduct), meta);
     },
     get: async (id) => {
       const data = await httpGet<BackendProductDto>(`/products/${id}`);
       return mapProduct(data);
     },
     create: async (req) => {
       const data = await httpPost<BackendProductDto>('/products', {
         sku: req.sku,
         name: req.name,
         categoryId: toId(req.categoryId) ?? 0,
         price: req.salePrice,
         costPrice: req.costPrice,
         stockQty: req.stock ?? 0,
         lowStockThreshold: req.lowStockThreshold,
         expiryDate: req.expiryDate ?? null,
         isActive: true,
         photoPath: req.imageUrl ?? null,
       });
       return mapProduct(data);
     },
     update: async (id, req) => {
       const raw = await httpPut<BackendProductDto>(`/products/${id}`, {
         sku: req.sku,
         name: req.name,
         categoryId: toId(req.categoryId),
         price: req.salePrice,
         costPrice: req.costPrice,
         stockQty: req.stock,
         lowStockThreshold: req.lowStockThreshold,
         expiryDate: req.expiryDate ?? null,
         photoPath: req.imageUrl ?? null,
       });
       return mapProduct(raw);
     },
     remove: async (id) => {
       await httpDelete<void>(`/products/${id}`);
     },
      uploadImage: async (file) => {
        const form = new FormData();
        form.append('file', await toFormFilePart(file));
        return httpPost<{ url: string }>('/products/images', form);
      },
  },

   categories: {
     list: async () => {
       const CACHE_KEY = 'categories:list';
       const cached = await cacheGet<Category[]>(CACHE_KEY);
       if (cached) return cached;

       // Fetch categories and product summary in parallel
       const [catData, products] = await Promise.all([
         httpGet<BackendCategoryDto[]>('/categories'),
         httpGetPaginated<BackendProductDto>('/products', { params: { pageSize: 100 } }),
       ]);

       const counts: Record<number, number> = {};
       for (const p of (products.items ?? [])) {
         if (p.isActive) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
       }

       // If there are more products than we fetched, re-fetch with larger page
       // to get accurate counts (rare edge case for very large catalogs)
       let allProducts = products.items ?? [];
       if (products.meta && products.meta.total > 100) {
         const fullProducts = await httpGetPaginated<BackendProductDto>('/products', {
           params: { pageSize: products.meta.total },
         });
         allProducts = fullProducts.items ?? [];
         const accurateCounts: Record<number, number> = {};
         for (const p of allProducts) {
           if (p.isActive) accurateCounts[p.categoryId] = (accurateCounts[p.categoryId] ?? 0) + 1;
         }
         const result = (catData ?? []).map((c) => mapCategory(c, accurateCounts[c.id] ?? 0));
         await cacheSet(CACHE_KEY, result, CacheTTL.VERY_LONG);
         return result;
       }

       const result = (catData ?? []).map((c) => mapCategory(c, counts[c.id] ?? 0));
       await cacheSet(CACHE_KEY, result, CacheTTL.VERY_LONG);
       return result;
     },
     create: async (name) => {
       const data = await httpPost<BackendCategoryDto>('/categories', { name, id: 0 });
       return mapCategory(data, 0);
     },
   },

    stock: {
      movements: async (params) => {
        const { items, meta } = await httpGetPaginated<BackendStockMovementDto>('/stock/movements', {
          params: {
            productId: toId(params.productId),
            type: params.type,
            from: params.from,
            to: params.to,
            page: params.page,
            pageSize: params.pageSize,
          },
        });
        return toPaginated(items.map(mapStockMovement), meta);
      },
     createMovement: async (req) => {
       const data = await httpPost<BackendStockMovementDto>('/stock/movements', {
         productId: toId(req.productId) ?? 0,
         type: req.type === 'adjustment' ? 'in' : req.type,
         quantity: req.quantity,
         note: req.note,
       });
       return mapStockMovement(data);
     },
   },

    purchaseOrders: {
      list: async (params) => {
        const { items, meta } = await httpGetPaginated<BackendPurchaseOrderDto>('/purchase-orders', {
          params: { status: 'all', ...params },
        });
        return toPaginated(items.map(mapPurchaseOrder), meta);
      },
      get: async (id) => {
        const data = await httpGet<BackendPurchaseOrderDto>(`/purchase-orders/${id}`);
        return mapPurchaseOrder(data);
      },
      create: async (req) => {
        const data = await httpPost<BackendPurchaseOrderDto>('/purchase-orders', {
          supplierName: req.supplierName,
          lines: req.items.map((i) => ({ productId: toId(i.productId) ?? 0, qty: i.quantity })),
        });
        return mapPurchaseOrder(data);
      },
      setStatus: async (id, status) => {
        return mapPurchaseOrder(await httpPost<BackendPurchaseOrderDto>(`/purchase-orders/${id}/status`, { status }));
      },
    },

    suppliers: {
      list: async () => {
        return (await httpGet<BackendSupplierDto[]>('/suppliers'))?.map(mapSupplier) ?? [];
      },
      get: async (id) => {
        return mapSupplier(await httpGet<BackendSupplierDto>(`/suppliers/${id}`));
      },
      create: async (req) => {
        return mapSupplier(await httpPost<BackendSupplierDto>('/suppliers', req));
      },
      update: async (id, req) => {
        return mapSupplier(await httpPut<BackendSupplierDto>(`/suppliers/${id}`, req));
      },
      remove: async (id) => {
        await httpDelete<void>(`/suppliers/${id}`);
      },
    },

   orders: {
     list: async (params) => {
       const { items, meta } = await httpGetPaginated<BackendOrderDto>('/orders', {
         params: { status: 'all', ...params },
       });
       return toPaginated(items.map(mapOrder), meta);
     },
     get: async (id) => {
       return mapOrder(await httpGet<BackendOrderDto>(`/orders/${id}`));
     },
     create: async (req) => {
       const data = await httpPost<BackendOrderDto>('/orders', {
         customerId: toId(req.customerId) ?? 0,
         lines: req.items.map((i) => ({ productId: toId(i.productId) ?? 0, qty: i.quantity })),
         deliveryAddress: req.deliveryAddress ?? req.note,
       });
       return mapOrder(data);
     },
     confirm: async (id) => {
       return mapOrder(await httpPost<BackendOrderDto>(`/orders/${id}/confirm`, {}));
     },
     assignDriver: async (id, driverName, driverPhone) => {
       return mapOrder(await httpPost<BackendOrderDto>(`/orders/${id}/assign-driver`, { driverName, driverPhone }));
     },
     pay: async (id, amount, method) => {
       return mapOrder(await httpPost<BackendOrderDto>(`/orders/${id}/payment`, { amount, method }));
     },
     setStatus: async (id, status) => {
       return mapOrder(await httpPost<BackendOrderDto>(`/orders/${id}/status`, { status }));
     },
   },

   customers: {
     list: async (params) => {
       const { items, meta } = await httpGetPaginated<BackendCustomerDto>('/customers', { params });
       return toPaginated(items.map((c) => mapCustomer(c)), meta);
     },
     get: async (id) => {
       const data = await httpGet<BackendCustomerDetailDto>(`/customers/${id}`);
       return mapCustomer(data.customer, data.stats);
     },
     getOrders: async (id) => {
       const orders = await httpGet<BackendOrderDto[]>(`/customers/${id}/orders`);
       return (orders ?? []).map(mapOrder);
     },
      create: async (req) => {
        const body: any = {
          name: req.name,
          phone: req.phone,
          address: req.address,
          status: req.status ?? 'active',
        };
        if (req.photo) {
          const blob = await toFormFilePart(req.photo);
          const reader = new FileReader();
          body.photo = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
        return mapCustomer(await httpPost<BackendCustomerDto>('/customers', body));
      },
      update: async (id, req) => {
        const body: any = {
          name: req.name,
          phone: req.phone,
          address: req.address,
          status: req.status,
        };
        if (req.photo) {
          const blob = await toFormFilePart(req.photo);
          const reader = new FileReader();
          body.photo = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
        return mapCustomer(await httpPut<BackendCustomerDto>(`/customers/${id}`, body));
      },
      remove: async (id) => {
        await httpDelete<void>(`/customers/${id}`);
      },
    },

   reports: {
     revenue: async (range) => {
       let totalRevenue = 0;
       if (range === 'thisMonth') {
         const data = await httpGet<{ revenue: number }>('/reports/revenue', { params: { period: 'month' } });
         totalRevenue = data?.revenue ?? 0;
       } else {
         const points = await httpGet<{ label: string; revenue: number }[]>('/reports/revenue/chart', {
           params: { range: chartRangeFor(range) },
         });
         totalRevenue = (points ?? []).reduce((sum, p) => sum + p.revenue, 0);
       }
       return {
         totalRevenue,
         totalCost: 0,
         netProfit: 0,
         ordersCount: 0,
         averageOrderValue: 0,
         range,
       };
     },
     revenueChart: async (range) => {
       const data = await httpGet<{ label: string; revenue: number }[]>('/reports/revenue/chart', {
         params: { range: chartRangeFor(range) },
       });
       return (data ?? []).map((p) => ({ date: p.label, revenue: p.revenue }));
     },
     receivables: async () => {
       const data = await httpGet<{ customerId: number; customerName: string; balance: number }[]>('/reports/receivables');
       const customers = (data ?? []).map((r) => ({
         customerId: String(r.customerId),
         customerName: r.customerName,
         balance: r.balance,
       }));
       return {
         totalReceivable: customers.reduce((s, c) => s + c.balance, 0),
         overdueCount: 0,
         customers,
       };
     },
      export: async (params) => {
        const blob = await httpDownloadBlob('/reports/export', {
          params: { type: params.type, period: params.period },
        });
        if (blob && Platform.OS === 'web' && typeof URL !== 'undefined') {
          try {
            const objectUrl = (URL as unknown as { createObjectURL: (b: unknown) => string }).createObjectURL(blob);
            return { url: objectUrl };
          } catch {
            return { url: '' };
          }
        }
        return { url: '' };
      },
   },

    notifications: {
      list: async (params) => {
        const data = await httpGet<BackendNotificationDto[]>('/notifications', {
          params: { unread: params?.unread ?? false },
        });
        const items = (data ?? []).map(mapNotification);
        return { items, total: items.length, page: 1, pageSize: items.length };
      },
      markRead: async (id) => {
        await httpPut<void>(`/notifications/${id}/read`, {});
        return { id, type: 'system' as const, title: '', body: '', read: true, createdAt: new Date().toISOString() };
      },
      markAllRead: async () => {
        await httpPut<void>('/notifications/read-all', {});
      },
    },

    users: {
      list: async (params) => {
        const { items, meta } = await httpGetPaginated<BackendUserDto>('/users', {
          params: {
            search: params.search,
            role: params.role,
            active: params.active,
            page: params.page,
            pageSize: params.pageSize,
          },
        });
        return toPaginated(items.map(mapAdminUser), meta);
      },
      get: async (id) => {
        const data = await httpGet<BackendUserDto>(`/users/${id}`);
        return mapAdminUser(data);
      },
      create: async (req) => {
        const data = await httpPost<BackendUserDto>('/users', {
          username: req.username,
          password: req.password,
          fullName: req.fullName,
          email: req.email,
          phone: req.phone,
          storeName: req.storeName,
          role: req.role ?? 'user',
        });
        return mapAdminUser(data);
      },
      update: async (id, req) => {
        const data = await httpPut<BackendUserDto>(`/users/${id}`, {
          fullName: req.fullName,
          email: req.email,
          phone: req.phone,
          storeName: req.storeName,
          role: req.role,
          isActive: req.isActive,
        });
        return mapAdminUser(data);
      },
      remove: async (id) => {
        await httpDelete<void>(`/users/${id}`);
      },
      resetPassword: async (id, req) => {
        await httpPut<void>(`/users/${id}/password`, req);
      },
    },
};

export const api: Api = realApi;
