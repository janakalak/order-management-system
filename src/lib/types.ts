export interface Product {
  id: string;
  productId: string;
  description: string;
  cost: number;
  sellingPrice: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  contact1: string;
  contact2: string;
  email: string;
  totalOrders?: number;
  totalItems?: number;
  totalSpent?: number;
  totalCost?: number;
  totalProfit?: number;
  profitMargin?: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  cost: number;
  discount: number;
  discountType: string;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  date: string;
  status: string;
  trackingNumber: string;
  deliveryService: string;
  packageWeight: number;
  deliveryCharge: number;
  freeDelivery: boolean;
  discount: number;
  discountType: string;
  subTotal: number;
  total: number;
  paidAmount: number;
  note: string;
  isDraft: boolean;
  customerId: string | null;
  customer: Customer | null;
  items: OrderItem[];
  cost?: number;
  profit?: number;
  profitMargin?: number;
}

export interface CashEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  note: string;
}

export interface Settings {
  id: string;
  resetOnConfirm: boolean;
  directPrintOnConfirm: boolean;
  enableLowStockWarning: boolean;
  lowStockLimit: number;
  enableDeliveryOptions: boolean;
  defaultStatus: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

export interface DeliveryService {
  id: string;
  name: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  content: string;
}

export interface SalesData {
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  topProducts: {
    productId: string;
    description: string;
    quantity: number;
    revenue: number;
    cost: number;
    profit: number;
  }[];
}
