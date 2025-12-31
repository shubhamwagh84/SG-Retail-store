export type ProductType = "Regular" | "Chote item" | "Gift" | "Retail customer" | "Non stick" | "Tamba Pital" | "Future product";

export type Product = {
  id: string;
  name: string;
  /** Size/Pattern/Product Type */
  variant?: string;
  /** Size */
  size?: string;
  /** Pattern */
  pattern?: string;
  /** Product Type (Regular, Gift, etc.) */
  productType?: ProductType;
  /** Design */
  design?: string;
  /** Product type (category) */
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  /** Always keep stock available */
  stockAlwaysNeeded?: boolean;
  /** Average stock needed in shop */
  avgStockNeeded?: number;
  /** Derived or stored status like "ok|low|urgent" */
  reorderStatus?: string;
  /** Freeform notes */
  notes?: string;
  photoUrl?: string;
  updatedAt: string;
};

export type Sale = {
  id: string;
  productId: string;
  qty: number;
  amount: number;
  paymentMethod?: "cash" | "qr_code";
  soldAt: string;
  note?: string;
  user?: string;
};

export type Expense = {
  id: string;
  type: "salary" | "operational_cost" | "stock_purchase" | "other" | "advertisement";
  amount: number;
  paymentMethod: "cash" | "bank";
  description?: string;
  date: string;
  items?: Array<{ productId: string; qty: number }>;
};

export type DayRevenue = {
  date: string;
  cashSales: number;
  qrSales: number;
  totalSales: number;
  expenses: number;
  stockPurchase: number;
};

export type PortalConfig = {
  storageConfigured: boolean;
};
