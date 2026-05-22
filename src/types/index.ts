export type UserRole = 'owner' | 'admin' | 'cashier' | 'kitchen_staff' | 'warehouse_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  pin: string; // Cashier short PIN for easy switches
  avatarUrl?: string;
}

export interface Permission {
  name: string;
  description: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentSessionId?: string;
  customerCount?: number;
  qrCodeUrl: string; // Base64 or canvas source
}

export interface TableSession {
  id: string;
  tableId: string;
  startTime: string;
  endTime?: string;
  customerName?: string;
  status: 'active' | 'completed';
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Regular", "Large" or "Extra Hot Spice"
  priceCost: number; // For margin reporting
  priceSell: number;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  description: string;
  priceCost: number;
  priceSell: number;
  promoPrice?: number;
  happyHourActive: boolean;
  stock: number;
  minStockAlert: number;
  imageUrl: string;
  variants: ProductVariant[];
  ingredients?: Array<{ name: string; qtyRequired: number; unit: string }>;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon identifier
}

export type DiningType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'voided' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  priceSell: number;
  notes?: string;
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'voided';
}

export interface Order {
  id: string;
  invoiceNo: string;
  diningType: DiningType;
  tableNumber?: number;
  customerName?: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number; // Default e.g. 10%
  serviceCharge: number; // e.g. 5%
  total: number;
  status: OrderStatus;
  paymentMethod?: 'cash' | 'debit' | 'qris' | 'split';
  paymentDetails?: {
    splitMethods?: Array<{ method: string; amount: number }>;
    transactionId?: string;
    cardIssuer?: string;
  };
  cashPaid?: number;
  cashChange?: number;
  createdAt: string;
  updatedAt: string;
  staffId: string;
  isHold?: boolean;
  holdLabel?: string;
  voidReason?: string;
  shiftId?: string;
}

export interface KitchenTicketItem {
  itemId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  notes?: string;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  invoiceNo: string;
  tableNumber?: number;
  diningType: DiningType;
  items: KitchenTicketItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  updatedAt: string;
  prepMinutesEstimated: number;
  completedAt?: string;
}

export interface CashierShift {
  id: string;
  staffId: string;
  staffName: string;
  openedAt: string;
  closedAt?: string;
  openingCashFloat: number;
  expectedEndingCash?: number;
  actualDeclaredCash?: number;
  cashDifference?: number;
  shiftStatus: 'open' | 'closed' | 'reconciled';
  summary?: {
    cashSales: number;
    qrisSales: number;
    debitSales: number;
    totalRefunds: number;
    cashInflow: number; // petty cash add
    cashOutflow: number; // petty cash take
  };
}

export interface PettyCashLog {
  id: string;
  shiftId: string;
  timestamp: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  reason: string;
  loggedBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface StockMutation {
  id: string;
  productId: string;
  productName: string;
  type: 'stock_in' | 'stock_out' | 'mutation_add' | 'mutation_sub' | 'opname' | 'sales_deduction';
  quantityChange: number;
  previousStock: number;
  currentStock: number;
  timestamp: string;
  userId: string;
  userName: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  memberLevel: 'Silver' | 'Gold' | 'Platinum';
  totalSpend: number;
  visitCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  resource: string;
  details: string;
}
