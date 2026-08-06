# DBM App — Feature Structure (Mapped to UI/UX Design)

This document maps your actual screens (from the design mockups) directly to folders and files. Written for a **junior developer** — if you're building a screen, find it below and you'll know exactly which file to create and what goes in it.

---

## App Overview — 5 Core Modules

Your bottom tab bar has 5 tabs. Each tab = one feature folder.

| Tab (Khmer) | Meaning | Feature Folder |
|---|---|---|
| ទំព័រដើម | Home / Dashboard | `features/dashboard/` |
| ស្តុក | Stock / Inventory | `features/stock/` |
| ការបញ្ជាទិញ | Orders | `features/orders/` |
| អតិថិជន | Customers | `features/customers/` |
| ចំណូល | Income / Revenue | `features/income/` |

Every feature folder follows the **same internal pattern**:

```
features/<feature-name>/
├── screens/       ← full pages the user navigates to
├── components/    ← smaller pieces used only inside this feature's screens
├── hooks/         ← data-fetching / logic for this feature
├── types/         ← TypeScript types for this feature's data
├── constants/     ← static values (status labels, filter options)
└── index.ts       ← exports what other parts of the app are allowed to use
```

---

## 1. Dashboard (ទំព័រដើម)

**What it does:** Landing screen after login. Shows a welcome greeting, a blue summary card with 4 key stats, 4 quick-action cards, and a recent activity list.

```
features/dashboard/
├── screens/
│   └── DashboardScreen.tsx          ← the whole page you see in the mockup
├── components/
│   ├── SummaryStatsCard.tsx         ← the blue card with 4 stat numbers
│   ├── StatItem.tsx                 ← one stat inside SummaryStatsCard (icon + number + label)
│   ├── QuickActionGrid.tsx          ← the 2x2 grid of action cards
│   ├── QuickActionCard.tsx          ← ONE card in that grid (Stock / Orders / Customers / Income)
│   └── RecentActivityList.tsx       ← the list at the bottom
│   └── RecentActivityItem.tsx       ← one row in that list
├── hooks/
│   └── useDashboardSummary.ts       ← fetches the stats + recent activity via React Query
├── types/
│   └── dashboard.types.ts           ← e.g. DashboardStats, ActivityItem
└── index.ts
```

**Junior dev note:** `DashboardScreen.tsx` should be mostly layout — it imports `SummaryStatsCard`, `QuickActionGrid`, and `RecentActivityList` and arranges them. Don't put fetching logic directly in the screen; that belongs in `useDashboardSummary.ts`.

---

## 2. Stock (ស្តុក)

**What it does:** 4 sub-screens accessed via top tabs: Add Stock, Stock History (in/out), Stock List, Low/Expiring Stock.

```
features/stock/
├── screens/
│   ├── AddStockScreen.tsx           ← form: category, item, qty, buy/sell price, dates
│   ├── StockHistoryScreen.tsx       ← in/out transaction log (today/week/month toggle)
│   ├── StockListScreen.tsx          ← searchable grid of all products
│   └── LowStockScreen.tsx           ← items expiring soon (7/15/expired filter tabs)
├── components/
│   ├── StockForm.tsx                ← the actual form fields (used by AddStockScreen)
│   ├── StockTabBar.tsx              ← the 4-tab switcher shown at the top of every stock screen
│   ├── StockHistoryItem.tsx         ← one row: product, +/- qty, time, source
│   ├── ProductCard.tsx              ← product image + name + price + qty (used in StockListScreen)
│   ├── ExpiryBadge.tsx              ← the colored "expires in X days" pill
│   └── StockFilterTabs.tsx          ← today/week/month or 7-day/15-day filter pills
├── hooks/
│   ├── useStockList.ts
│   ├── useStockHistory.ts
│   ├── useLowStock.ts
│   └── useAddStock.ts               ← mutation hook for submitting the form
├── types/
│   └── stock.types.ts               ← Product, StockTransaction, StockFormValues
├── constants/
│   └── stock.constants.ts           ← category options, expiry thresholds (7/15 days)
└── index.ts
```

**Junior dev note:** `StockTabBar.tsx` is reused across all 4 stock screens — build it once as a component that takes `activeTab` + `onTabChange` props, don't rebuild the tab UI in each screen.

---

## 3. Orders (ការបញ្ជាទិញ)

**What it does:** Order list with filters, tapping an order opens its detail, which shows a status stepper (pending → confirmed → done) and action buttons.

```
features/orders/
├── screens/
│   ├── OrderListScreen.tsx          ← search + status filter tabs + list of order cards
│   └── OrderDetailScreen.tsx        ← single order: customer info, items, totals, stepper
├── components/
│   ├── OrderCard.tsx                ← one row in OrderListScreen (order #, status, amount)
│   ├── OrderStatusBadge.tsx         ← colored pill: pending/confirmed/done/cancelled
│   ├── OrderFilterTabs.tsx          ← "all / pending / in progress / done" tabs
│   ├── OrderStepper.tsx             ← the 3-dot progress line (order → confirm → complete)
│   ├── OrderItemRow.tsx             ← one product line inside the order (name, qty, price)
│   ├── OrderSummary.tsx             ← subtotal / delivery / total block
│   └── OrderConfirmModal.tsx        ← the "✓ Order confirmed!" success popup
├── hooks/
│   ├── useOrderList.ts
│   ├── useOrderDetail.ts
│   └── useUpdateOrderStatus.ts      ← mutation for confirm/complete/cancel actions
├── types/
│   └── order.types.ts               ← Order, OrderItem, OrderStatus (union type)
├── constants/
│   └── order.constants.ts           ← status labels + colors mapping
└── index.ts
```

**Junior dev note:** `OrderStatus` should be a TypeScript union type (`'pending' | 'confirmed' | 'done' | 'cancelled'`), and `OrderStatusBadge` + `OrderStepper` both read from it — so status colors/labels are defined **once** in `order.constants.ts`, not duplicated in each component.

---

## 4. Customers (អតិថិជន)

**What it does:** Customer list with summary stats, tapping a customer opens their profile + order history.

```
features/customers/
├── screens/
│   ├── CustomerListScreen.tsx       ← stats row + search + list of customer cards
│   └── CustomerDetailScreen.tsx     ← profile info + stats + order history + action buttons
├── components/
│   ├── CustomerStatsRow.tsx         ← the 4 stat cards at top (total, active, orders, revenue)
│   ├── CustomerCard.tsx             ← one row: avatar, name, status, phone, orders, amount
│   ├── CustomerAvatar.tsx           ← colored circle with initials (reusable)
│   ├── CustomerInfoCard.tsx         ← name/phone/location block on detail screen
│   ├── CustomerSpendingCard.tsx     ← orders count + total spent block
│   ├── CustomerActionButtons.tsx    ← call / message / delete row
│   └── CustomerOrderHistoryList.tsx ← list of past orders for this customer
├── hooks/
│   ├── useCustomerList.ts
│   └── useCustomerDetail.ts
├── types/
│   └── customer.types.ts            ← Customer, CustomerStatus
└── index.ts
```

**Junior dev note:** `CustomerAvatar.tsx` (colored circle + initials) is used in both `CustomerCard` and `CustomerDetailScreen` — build it as its own small component instead of copy-pasting the initials logic twice.

---

## 5. Income (ចំណូល)

**What it does:** Revenue dashboard with time-range tabs (today/week/month/year), summary cards, a bar chart, and a list of customers who owe money (debtors).

```
features/income/
├── screens/
│   ├── IncomeOverviewScreen.tsx     ← main screen: time tabs + summary cards + chart + debtors
│   ├── DailyIncomeDetailScreen.tsx  ← drill-down: one day's orders
│   └── MonthlyIncomeDetailScreen.tsx← drill-down: one month's chart + orders
├── components/
│   ├── IncomeTimeTabs.tsx           ← today/week/month/year/custom tabs
│   ├── IncomeSummaryCard.tsx        ← "today's income $250" style card (with % change)
│   ├── OutstandingDebtCard.tsx      ← the red "unpaid $1,200" alert card
│   ├── RevenueBarChart.tsx          ← the weekly/monthly bar chart
│   ├── DebtorListItem.tsx           ← one customer who owes money
│   └── IncomeOrderRow.tsx           ← one order line inside a daily breakdown
├── hooks/
│   ├── useIncomeSummary.ts
│   ├── useDailyIncome.ts
│   ├── useMonthlyIncome.ts
│   └── useDebtors.ts
├── types/
│   └── income.types.ts              ← IncomeSummary, DebtorEntry
└── index.ts
```

**Junior dev note:** `RevenueBarChart.tsx` should accept generic `data: { label: string; value: number }[]` as a prop — that way the **same** chart component renders both the weekly view (Income screen) and the monthly view (Monthly Detail screen), just with different data passed in.

---

## Shared Components Used Across Multiple Features

These already exist in `components/ui/` and `components/layout/` — **don't recreate them inside a feature folder.**

| Component | Used In |
|---|---|
| `Header` | Every screen (title, back button, notification bell, menu) |
| `SearchBar` | Stock List, Orders List, Customers List |
| `Badge` | Order status, expiry status, customer status |
| `Card` | Base wrapper for stat cards, product cards, customer cards |
| `EmptyState` | Any list screen when there's no data |
| `Skeleton` | Any screen while data is loading |
| `TabBar` (generic pill-tabs) | Stock sub-tabs, Order filter tabs, Income time tabs |
| `Avatar` | Customer avatar, user avatar in header |

**Rule for junior devs:** before building a new component inside a feature folder, check `components/ui/` first — if something similar already exists, extend it with a prop instead of duplicating it.

---

## Navigation Mapping

```
MainTabNavigator (Bottom Tabs — 5 tabs, matches your mockup exactly)
├── DashboardStackNavigator
│   └── DashboardScreen
│
├── StockStackNavigator
│   ├── AddStockScreen
│   ├── StockHistoryScreen
│   ├── StockListScreen
│   └── LowStockScreen
│
├── OrdersStackNavigator
│   ├── OrderListScreen
│   └── OrderDetailScreen
│
├── CustomersStackNavigator
│   ├── CustomerListScreen
│   └── CustomerDetailScreen
│
└── IncomeStackNavigator
    ├── IncomeOverviewScreen
    ├── DailyIncomeDetailScreen
    └── MonthlyIncomeDetailScreen
```

Each tab is its own stack — tapping "Stock" then drilling into "Low Stock" and switching to another tab preserves your place in the Stock stack when you come back.

---

## Quick Reference: "I'm building screen X, where do I start?"

| Screen from the design | File to create first |
|---|---|
| Dashboard home page | `features/dashboard/screens/DashboardScreen.tsx` |
| Add Stock form | `features/stock/screens/AddStockScreen.tsx` + `StockForm.tsx` |
| Stock in/out history | `features/stock/screens/StockHistoryScreen.tsx` |
| Full stock list | `features/stock/screens/StockListScreen.tsx` + `ProductCard.tsx` |
| Low/expiring stock | `features/stock/screens/LowStockScreen.tsx` + `ExpiryBadge.tsx` |
| Orders list | `features/orders/screens/OrderListScreen.tsx` + `OrderCard.tsx` |
| Order detail + status | `features/orders/screens/OrderDetailScreen.tsx` + `OrderStepper.tsx` |
| Customers list | `features/customers/screens/CustomerListScreen.tsx` + `CustomerCard.tsx` |
| Customer profile | `features/customers/screens/CustomerDetailScreen.tsx` |
| Income overview | `features/income/screens/IncomeOverviewScreen.tsx` + `RevenueBarChart.tsx` |
| Debtor list | inside `IncomeOverviewScreen.tsx`, using `DebtorListItem.tsx` |

---

### Recommended Build Order (matches complexity, low → high)

```
1. Shared UI components (Header, Card, Badge, SearchBar, Skeleton)
   ↓
2. Dashboard (simplest screen — validates navigation + theme + layout)
   ↓
3. Customers (list + detail — good practice for list/detail pattern)
   ↓
4. Stock (4 sub-screens — introduces sub-tabs pattern)
   ↓
5. Orders (introduces status stepper + modals)
   ↓
6. Income (most complex — charts + drill-downs, build last)
```
