export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
  },
  dashboard: {
    summary: "/dashboard/summary",
  },
  stock: {
    list: "/stock",
    add: "/stock",
    history: "/stock/history",
    lowStock: "/stock/low-stock",
  },
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
  },
  customers: {
    list: "/customers",
    detail: (id: string) => `/customers/${id}`,
  },
  income: {
    summary: "/income/summary",
    daily: "/income/daily",
    monthly: "/income/monthly",
    debtors: "/income/debtors",
  },
  geocoding: {
    search: "/geocoding/search",
  },
};
