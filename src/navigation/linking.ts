export const linking = {
  prefixes: ["dbmapp://"],
  config: {
    screens: {
      Splash: "splash",
      Onboarding: "onboarding",
      Main: {
        screens: {
          Dashboard: "dashboard",
          Stock: "stock",
          Orders: "orders",
          Customers: "customers",
          Income: "income",
        },
      },
    },
  },
};
