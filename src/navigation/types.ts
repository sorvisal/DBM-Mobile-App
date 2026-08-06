export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  NotFound: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Stock: undefined;
  Orders: undefined;
  Customers: undefined;
  Income: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type StockStackParamList = {
  AddStock: undefined;
  StockHistory: undefined;
  StockList: undefined;
  LowStock: undefined;
};

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
};

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
};

export type IncomeStackParamList = {
  IncomeOverview: undefined;
  DailyIncomeDetail: { date: string };
  MonthlyIncomeDetail: { month: string };
};
