import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  Order, 
  Product, 
  Category, 
  RestaurantTable, 
  User, 
  CashierShift, 
  PettyCashLog, 
  StockMutation, 
  Customer, 
  AuditLog, 
  KitchenTicket,
  OrderItem,
  DiningType,
  OrderStatus
} from "./src/types";

// State persistence in server memory (Simulating PostgreSQL database state)
let categories: Category[] = [
  { id: "cat-1", name: "Makanan Utama", slug: "makanan-utama", icon: "utensils" },
  { id: "cat-2", name: "Minuman Dingin & Panas", slug: "minuman", icon: "coffee" },
  { id: "cat-3", name: "Hidangan Penutup", slug: "dessert", icon: "ice-cream" },
  { id: "cat-4", name: "Camilan Ringan", slug: "snacks", icon: "cookie" }
];

let products: Product[] = [
  {
    id: "p-1",
    name: "Nasi Goreng Wagyu Premium",
    sku: "NGR-WGY-01",
    barcode: "899123456001",
    categoryId: "cat-1",
    description: "Nasi goreng dengan bumbu khas nusantara, potongan daging sapi wagyu MB5, telur mata sapi, dan kerupuk emping.",
    priceCost: 35000,
    priceSell: 68000,
    promoPrice: 59000,
    happyHourActive: true,
    stock: 45,
    minStockAlert: 10,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
    variants: [
      { id: "pv-1-1", name: "Regular", priceCost: 35000, priceSell: 68000, sku: "NGR-WGY-01-R", stock: 25 },
      { id: "pv-1-2", name: "Spicy Extra", priceCost: 36000, priceSell: 72000, sku: "NGR-WGY-01-S", stock: 20 }
    ],
    isAvailable: true
  },
  {
    id: "p-2",
    name: "Ayam Bakar Madu Parahyangan",
    sku: "AYM-BKR-02",
    barcode: "899123456002",
    categoryId: "cat-1",
    description: "Ayam bakar bumbu kuning dengan lumatan madu hutan alami, disajikan dengan nasi hangat, sambal bajak, dan lalapan segar.",
    priceCost: 22000,
    priceSell: 45000,
    happyHourActive: false,
    stock: 30,
    minStockAlert: 8,
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
    variants: [],
    isAvailable: true
  },
  {
    id: "p-3",
    name: "Matcha Latte Kyoto Premium",
    sku: "DRK-MCH-03",
    barcode: "899123456003",
    categoryId: "cat-2",
    description: "Teh hijau matcha asli Kyoto Jepang yang diseduh dengan susu segar pasteurisasi dan sirup gula tebu murni.",
    priceCost: 12000,
    priceSell: 28000,
    happyHourActive: false,
    stock: 80,
    minStockAlert: 15,
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
    variants: [
      { id: "pv-3-1", name: "Hot (Tanpa Es)", priceCost: 12000, priceSell: 28000, sku: "DRK-MCH-03-H", stock: 40 },
      { id: "pv-3-2", name: "Cold (Ice Cup)", priceCost: 13000, priceSell: 30000, sku: "DRK-MCH-03-C", stock: 40 }
    ],
    isAvailable: true
  },
  {
    id: "p-4",
    name: "Ice Lychee Tea Booster",
    sku: "DRK-LYC-04",
    barcode: "899123456004",
    categoryId: "cat-2",
    description: "Teh hitam premium berpadu sirup rasa kelengkeng dan es batu dingin, disajikan lengkap dengan 2 buah leci utuh.",
    priceCost: 6000,
    priceSell: 22000,
    happyHourActive: true,
    promoPrice: 18000,
    stock: 120,
    minStockAlert: 15,
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
    variants: [],
    isAvailable: true
  },
  {
    id: "p-5",
    name: "Signature Lava Cake Gelato",
    sku: "DES-LAV-05",
    barcode: "899123456005",
    categoryId: "cat-3",
    description: "Kue cokelat panggang dengan bagian tengah yang lumer hangat, disajikan berdampingan satu scoop gelato vanilla praline.",
    priceCost: 18000,
    priceSell: 38000,
    happyHourActive: false,
    stock: 25,
    minStockAlert: 5,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
    variants: [],
    isAvailable: true
  },
  {
    id: "p-6",
    name: "Crispy Truffle Fries",
    sku: "SNK-TRF-06",
    barcode: "899123456006",
    categoryId: "cat-4",
    description: "Kentang goreng renyah dipoles minyak truffle putih murni dan taburan keju parmesan impor.",
    priceCost: 10000,
    priceSell: 29000,
    happyHourActive: false,
    stock: 6, // Low stock on purpose to test mutation alerts!
    minStockAlert: 10,
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
    variants: [],
    isAvailable: true
  }
];

let tables: RestaurantTable[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
  status: "available",
  qrCodeUrl: "" // Will be drawn as dynamic URLs in the system
}));

let users: User[] = [
  { id: "u-1", name: "Alfarizky Owner", email: "owner@kasirdigital.com", role: "owner", isActive: true, pin: "1111", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" },
  { id: "u-2", name: "Sarah Admin", email: "sarah.admin@kasirdigital.com", role: "admin", isActive: true, pin: "2222", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" },
  { id: "u-3", name: "Budi Cashier", email: "budi.kasir@kasirdigital.com", role: "cashier", isActive: true, pin: "3333", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60" },
  { id: "u-4", name: "Chef Joko Kitchen", email: "chef.joko@kasirdigital.com", role: "kitchen_staff", isActive: true, pin: "4444", avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=60" },
  { id: "u-5", name: "Deni Warehouse", email: "deni.stok@kasirdigital.com", role: "warehouse_staff", isActive: true, pin: "5555", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60" }
];

let activeShifts: CashierShift[] = [
  {
    id: "shift-demo-1",
    staffId: "u-3",
    staffName: "Budi Cashier",
    openedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    openingCashFloat: 500000,
    expectedEndingCash: 500000,
    shiftStatus: "open"
  }
];

let pettyCashLogs: PettyCashLog[] = [];

let stockMutations: StockMutation[] = [
  {
    id: "mut-1",
    productId: "p-6",
    productName: "Crispy Truffle Fries",
    type: "opname",
    quantityChange: -4,
    previousStock: 10,
    currentStock: 6,
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    userId: "u-5",
    userName: "Deni Warehouse",
    notes: "Stok Opname - Ditemukan 4 porsi kentang membusuk di freezer."
  }
];

let suppliers = [
  { id: "sup-1", name: "PT Wahana Food Supply", phone: "08123456789", email: "info@wahanafood.co.id", address: "Kawasan Industri Pulo Gadung, Jakarta Timur" },
  { id: "sup-2", name: "Sinar Abadi Sayur Segar", phone: "0219876543", email: "sinarabadi.sayur@gmail.com", address: "Pasar Induk Kramat Jati Blok C, Jakarta" }
];

let customers: Customer[] = [
  { id: "c-1", name: "Thors Customer", phone: "0813444555", email: "thors622@gmail.com", loyaltyPoints: 240, memberLevel: "Gold", totalSpend: 1350000, visitCount: 8 },
  { id: "c-2", name: "Arifin Wijaya", phone: "0819777888", email: "arifin.w@gmail.com", loyaltyPoints: 30, memberLevel: "Silver", totalSpend: 310000, visitCount: 2 }
];

let orders: Order[] = [
  {
    id: "ord-1",
    invoiceNo: "INV-20260522-001",
    diningType: "dine_in",
    tableNumber: 3,
    customerName: "Thors Customer",
    customerId: "c-1",
    items: [
      { id: "oi-1-1", productId: "p-1", productName: "Nasi Goreng Wagyu Premium", variantId: "pv-1-2", variantName: "Spicy Extra", quantity: 1, priceSell: 72000, notes: "Tolong telur dimasak setengah matang ya.", status: "served" },
      { id: "oi-1-2", productId: "p-4", productName: "Ice Lychee Tea Booster", quantity: 1, priceSell: 22000, notes: "", status: "served" }
    ],
    subtotal: 94000,
    discount: 5000,
    tax: 8900,
    serviceCharge: 4450,
    total: 102350,
    status: "completed",
    paymentMethod: "qris",
    cashPaid: 102350,
    cashChange: 0,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    staffId: "u-3",
    paymentDetails: { transactionId: "QRIS-TX-998823" }
  },
  {
    id: "ord-2",
    invoiceNo: "INV-20260522-002",
    diningType: "dine_in",
    tableNumber: 5,
    customerName: "Arifin Wijaya",
    customerId: "c-2",
    items: [
      { id: "oi-2-1", productId: "p-2", productName: "Ayam Bakar Madu Parahyangan", quantity: 2, priceSell: 45000, notes: "Pedas sedang saja.", status: "cooking" },
      { id: "oi-2-2", productId: "p-3", productName: "Matcha Latte Kyoto Premium", variantId: "pv-3-2", variantName: "Cold (Ice Cup)", quantity: 2, priceSell: 30000, notes: "Kurangi es batunya.", status: "ready" }
    ],
    subtotal: 150000,
    discount: 0,
    tax: 15000,
    serviceCharge: 7500,
    total: 172500,
    status: "preparing",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    staffId: "u-3"
  }
];

let auditLogs: AuditLog[] = [
  {
    id: "audit-1",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    userId: "u-3",
    userName: "Budi Cashier",
    role: "cashier",
    action: "OPEN_SHIFT",
    resource: "SHIFT_REGISTER",
    details: "Membuka kas register dengan modal modal awal sebesar Rp 500,000."
  }
];

// Kitchen Display logical queue calculated dynamically
let kitchenTickets: KitchenTicket[] = [
  {
    id: "kit-1",
    orderId: "ord-2",
    invoiceNo: "INV-20260522-002",
    tableNumber: 5,
    diningType: "dine_in",
    items: [
      { itemId: "oi-2-1", productName: "Ayam Bakar Madu Parahyangan", quantity: 2, notes: "Pedas sedang saja." },
      { itemId: "oi-2-2", productName: "Matcha Latte Kyoto Premium", variantName: "Cold (Ice Cup)", quantity: 2, notes: "Kurangi es batunya." }
    ],
    status: "preparing",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    prepMinutesEstimated: 12
  }
];

// SSE Clients broadcaster (Realtime Push)
let sseClients: any[] = [];

function broadcastToClients(event: string, data: any) {
  const payload = JSON.stringify({ event, data });
  sseClients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
}

// RESTAURANT APPS BOOTSTRAP
const app = express();
const PORT = 3000;

app.use(express.json());

// API: Server-Sent Events Gateway
app.get("/api/live-stream", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  
  const client = { id: Date.now(), res };
  sseClients.push(client);
  
  // Send active dataset on initial connection
  res.write(`data: ${JSON.stringify({ event: "connection_established", data: "Realtime link active" })}\n\n`);
  
  req.on("close", () => {
    sseClients = sseClients.filter(c => c.id !== client.id);
  });
});

// API: Authenticate
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { pin, role } = req.body;
  const foundUser = users.find(u => u.pin === pin && (role ? u.role === role : true));
  
  if (!foundUser) {
    return res.status(401).json({ status: "error", message: "PIN yang dimasukkan salah atau role tidak cocok." });
  }
  
  // Log authentication
  const log: AuditLog = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: foundUser.id,
    userName: foundUser.name,
    role: foundUser.role,
    action: "USER_LOGIN",
    resource: "AUTHENTICATION",
    details: `Crew ${foundUser.name} melakukan login ke portal POS.`
  };
  auditLogs.unshift(log);
  
  res.json({ status: "success", user: foundUser });
});

// API: Tables Management
app.get("/api/tables", (req: Request, res: Response) => {
  res.json({ status: "success", tables });
});

app.post("/api/tables/status", (req: Request, res: Response) => {
  const { tableId, status, customerCount, customerName } = req.body;
  const table = tables.find(t => t.id === tableId);
  if (!table) return res.status(404).json({ status: "error", message: "Meja tidak ditemukan." });
  
  table.status = status;
  if (status === "occupied") {
    table.currentSessionId = `sess-${Date.now()}`;
    table.customerCount = customerCount || 2;
  } else if (status === "available") {
    table.currentSessionId = undefined;
    table.customerCount = undefined;
  }
  
  broadcastToClients("table_updated", tables);
  res.json({ status: "success", table });
});

// API: Products CRUD
app.get("/api/products", (req: Request, res: Response) => {
  res.json({ status: "success", products, categories });
});

app.post("/api/products", (req: Request, res: Response) => {
  const newProduct: Product = {
    id: `p-${Date.now()}`,
    ...req.body,
    isAvailable: true
  };
  products.push(newProduct);
  
  res.json({ status: "success", product: newProduct });
});

app.put("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ status: "error", message: "Product not found" });
  
  products[index] = { ...products[index], ...req.body };
  res.json({ status: "success", product: products[index] });
});

// API: Shifts controller
app.get("/api/shifts/status", (req: Request, res: Response) => {
  const openShift = activeShifts.find(s => s.shiftStatus === "open");
  res.json({ status: "success", openShift });
});

app.post("/api/shifts/open", (req: Request, res: Response) => {
  const { staffId, staffName, floatAmount } = req.body;
  const openShift = activeShifts.find(s => s.shiftStatus === "open");
  if (openShift) return res.status(400).json({ status: "error", message: "Sudah ada shift aktif." });
  
  const newShift: CashierShift = {
    id: `shift-${Date.now()}`,
    staffId,
    staffName,
    openedAt: new Date().toISOString(),
    openingCashFloat: floatAmount,
    expectedEndingCash: floatAmount,
    shiftStatus: "open"
  };
  activeShifts.unshift(newShift);
  
  const log: AuditLog = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: staffId,
    userName: staffName,
    role: "cashier",
    action: "OPEN_SHIFT",
    resource: "CASH_DRAWER",
    details: `Membuka Kasir Baru dengan Kas Laci Rp ${floatAmount}.`
  };
  auditLogs.unshift(log);
  
  broadcastToClients("shift_updated", { openShift: newShift });
  res.json({ status: "success", openShift: newShift });
});

app.post("/api/shifts/close", (req: Request, res: Response) => {
  const { actualDeclaredCash, discrepancyNotes } = req.body;
  const openShift = activeShifts.find(s => s.shiftStatus === "open");
  if (!openShift) return res.status(400).json({ status: "error", message: "Tidak ada shift aktif yang terbuka." });
  
  // Calculate total cash sales in this shift
  const shiftOrders = orders.filter(o => o.shiftId === openShift.id && o.status === "completed");
  const cashSales = shiftOrders
    .filter(o => o.paymentMethod === "cash")
    .reduce((sum, o) => sum + o.total, 0);
  const qrisSales = shiftOrders
    .filter(o => o.paymentMethod === "qris")
    .reduce((sum, o) => sum + o.total, 0);
  const debitSales = shiftOrders
    .filter(o => o.paymentMethod === "debit")
    .reduce((sum, o) => sum + o.total, 0);
  
  const cashIn = pettyCashLogs
    .filter(p => p.shiftId === openShift.id && p.type === "cash_in")
    .reduce((sum, p) => sum + p.amount, 0);
  const cashOut = pettyCashLogs
    .filter(p => p.shiftId === openShift.id && p.type === "cash_out")
    .reduce((sum, p) => sum + p.amount, 0);
    
  const expectedEndingCash = openShift.openingCashFloat + cashSales + cashIn - cashOut;
  const difference = actualDeclaredCash - expectedEndingCash;
  
  openShift.closedAt = new Date().toISOString();
  openShift.expectedEndingCash = expectedEndingCash;
  openShift.actualDeclaredCash = actualDeclaredCash;
  openShift.cashDifference = difference;
  openShift.shiftStatus = "closed";
  openShift.summary = {
    cashSales,
    qrisSales,
    debitSales,
    totalRefunds: 0,
    cashInflow: cashIn,
    cashOutflow: cashOut
  };
  
  const audit: AuditLog = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: openShift.staffId,
    userName: openShift.staffName,
    role: "cashier",
    action: "CLOSE_SHIFT",
    resource: "CASH_DRAWER",
    details: `Tutup shift. Fisik: Rp ${actualDeclaredCash}. Selisih: Rp ${difference}. Catatan: ${discrepancyNotes || "-"}`
  };
  auditLogs.unshift(audit);
  
  broadcastToClients("shift_updated", { openShift: null });
  res.json({ status: "success", closedShift: openShift });
});

app.post("/api/shifts/petty", (req: Request, res: Response) => {
  const { amount, type, reason, loggedBy } = req.body;
  const openShift = activeShifts.find(s => s.shiftStatus === "open");
  if (!openShift) return res.status(400).json({ status: "error", message: "Tidak ada shift aktif." });
  
  const pettyLog: PettyCashLog = {
    id: `pety-${Date.now()}`,
    shiftId: openShift.id,
    timestamp: new Date().toISOString(),
    type,
    amount,
    reason,
    loggedBy
  };
  pettyCashLogs.unshift(pettyLog);
  
  // Re-calc shift float expectation
  if (type === "cash_in") {
    openShift.expectedEndingCash = (openShift.expectedEndingCash || openShift.openingCashFloat) + amount;
  } else {
    openShift.expectedEndingCash = (openShift.expectedEndingCash || openShift.openingCashFloat) - amount;
  }
  
  res.json({ status: "success", pettyLog });
});

// API: Customer management
app.get("/api/customers", (req: Request, res: Response) => {
  res.json({ status: "success", customers });
});

app.post("/api/customers", (req: Request, res: Response) => {
  const newCustomer: Customer = {
    id: `c-${Date.now()}`,
    loyaltyPoints: 0,
    memberLevel: "Silver",
    totalSpend: 0,
    visitCount: 1,
    ...req.body
  };
  customers.push(newCustomer);
  res.json({ status: "success", customer: newCustomer });
});

// API: Orders Checkout Engine
app.post("/api/orders/checkout", (req: Request, res: Response) => {
  const { diningType, tableNumber, customerName, items, subtotal, discount, tax, serviceCharge, total, paymentMethod, cashPaid, cashChange, paymentDetails, holdLabel, isHold } = req.body;
  
  const activeShift = activeShifts.find(s => s.shiftStatus === "open");
  const invoiceNo = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.floor(100+Math.random()*900)}`;
  
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    invoiceNo,
    diningType,
    tableNumber,
    customerName: customerName || (tableNumber ? `Pelanggan Meja ${tableNumber}` : "Dine In"),
    items: items.map((it: any, index: number) => ({
      id: `oi-${Date.now()}-${index}`,
      productId: it.productId,
      productName: it.productName,
      variantId: it.variantId,
      variantName: it.variantName,
      quantity: it.quantity,
      priceSell: it.priceSell,
      notes: it.notes || "",
      status: isHold ? "pending" : "cooking"
    })),
    subtotal,
    discount: discount || 0,
    tax,
    serviceCharge,
    total,
    status: isHold ? "pending" : "preparing",
    paymentMethod,
    cashPaid,
    cashChange,
    paymentDetails,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    staffId: activeShift ? activeShift.staffId : "u-3",
    shiftId: activeShift ? activeShift.id : undefined,
    isHold: isHold || false,
    holdLabel: holdLabel || ""
  };
  
  orders.unshift(newOrder);
  
  // Deduct products inventory and post mutation logs
  if (!isHold) {
    newOrder.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock = Math.max(0, prod.stock - it.quantity);
        
        stockMutations.unshift({
          id: `mut-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          productId: prod.id,
          productName: prod.name,
          type: "sales_deduction",
          quantityChange: -it.quantity,
          previousStock: prevStock,
          currentStock: prod.stock,
          timestamp: new Date().toISOString(),
          userId: activeShift ? activeShift.staffId : "u-3",
          userName: activeShift ? activeShift.staffName : "Budi Cashier",
          notes: `Dipotong otomatis via penjualan ${invoiceNo}`
        });
      }
    });
  }
  
  // If dining table order, set table to occupied
  if (tableNumber && !isHold) {
    const table = tables.find(t => t.number === tableNumber);
    if (table) {
      table.status = "occupied";
      table.currentSessionId = `sess-${Date.now()}`;
      table.customerCount = 2;
    }
  }
  
  // If checkout is fully paid and not held, construct a kitchen ticket for the display
  if (!isHold) {
    const ticket: KitchenTicket = {
      id: `kit-${Date.now()}`,
      orderId: newOrder.id,
      invoiceNo: newOrder.invoiceNo,
      tableNumber: newOrder.tableNumber,
      diningType: newOrder.diningType,
      items: newOrder.items.map(it => ({
        itemId: it.id,
        productName: it.productName,
        variantName: it.variantName,
        quantity: it.quantity,
        notes: it.notes
      })),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prepMinutesEstimated: 12
    };
    kitchenTickets.unshift(ticket);
  }
  
  // Update customer spend profiles if registered
  if (customerName) {
    const cust = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (cust) {
      cust.totalSpend += total;
      cust.visitCount += 1;
      cust.loyaltyPoints += Math.floor(total / 10000); // 1 point per 10k IDR
      
      // Upgrade tiers
      if (cust.totalSpend > 5000000) {
        cust.memberLevel = "Platinum";
      } else if (cust.totalSpend > 1500000) {
        cust.memberLevel = "Gold";
      }
    }
  }
  
  // Log security auditing trace
  const audit: AuditLog = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: activeShift ? activeShift.staffId : "u-3",
    userName: activeShift ? activeShift.staffName : "Budi Cashier",
    role: "cashier",
    action: isHold ? "HOLD_ORDER" : "CHECKOUT_TRANSACTION",
    resource: "ORDERS",
    details: `${isHold ? "Membuat Order Tahan ("+holdLabel+")" : "Melakukan Checkout Kasir"} Nomor: ${invoiceNo}. Nilai: Rp ${total}.`
  };
  auditLogs.unshift(audit);
  
  // Broadcast updates
  broadcastToClients("order_created", { order: newOrder, tables, products, mutations: stockMutations, tickets: kitchenTickets });
  
  res.json({ status: "success", order: newOrder });
});

// API: Kitchen Dispatcher
app.get("/api/kitchen/tickets", (req: Request, res: Response) => {
  res.json({ status: "success", tickets: kitchenTickets });
});

app.post("/api/kitchen/status", (req: Request, res: Response) => {
  const { ticketId, status } = req.body;
  const ticket = kitchenTickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ status: "error", message: "Kitchen ticket not found." });
  
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  if (status === "completed") {
    ticket.completedAt = new Date().toISOString();
  }
  
  // Reflect status into the main parent order items as well
  const originalOrder = orders.find(o => o.id === ticket.orderId);
  if (originalOrder) {
    if (status === "completed") {
      originalOrder.status = "ready";
      originalOrder.items.forEach(it => { it.status = "ready"; });
    } else if (status === "preparing") {
      originalOrder.status = "preparing";
      originalOrder.items.forEach(it => { it.status = "cooking"; });
    }
  }
  
  broadcastToClients("kitchen_updated", { tickets: kitchenTickets, orders });
  res.json({ status: "success", ticket });
});

// API: Mutation Inventory Log
app.get("/api/inventory/mutations", (req: Request, res: Response) => {
  res.json({ status: "success", mutations: stockMutations, suppliers });
});

app.post("/api/inventory/mutate", (req: Request, res: Response) => {
  const { productId, type, quantityChange, notes, userId, userName } = req.body;
  const prod = products.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ status: "error", message: "Produk tidak terdaftar." });
  
  const prevStock = prod.stock;
  prod.stock = Math.max(0, prod.stock + quantityChange);
  
  const newMut: StockMutation = {
    id: `mut-${Date.now()}`,
    productId,
    productName: prod.name,
    type,
    quantityChange,
    previousStock: prevStock,
    currentStock: prod.stock,
    timestamp: new Date().toISOString(),
    userId: userId || "u-5",
    userName: userName || "Deni Warehouse",
    notes: notes || "Mutasi manual log gudang"
  };
  
  stockMutations.unshift(newMut);
  broadcastToClients("inventory_updated", { products, mutations: stockMutations });
  res.json({ status: "success", mutation: newMut });
});

// API: Audit trail logs
app.get("/api/audit-logs", (req: Request, res: Response) => {
  res.json({ status: "success", auditLogs });
});

// API: Static analytical aggregates
app.get("/api/analytics/summary", (req: Request, res: Response) => {
  const completedOrders = orders.filter(o => o.status === "completed");
  const totalSubtotal = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTax = completedOrders.reduce((sum, o) => sum + o.tax, 0);
  const totalService = completedOrders.reduce((sum, o) => sum + o.serviceCharge, 0);
  
  // Payment breakdowns
  const paymentBreakdown = {
    cash: completedOrders.filter(o => o.paymentMethod === "cash").reduce((sm, o) => sm + o.total, 0),
    qris: completedOrders.filter(o => o.paymentMethod === "qris").reduce((sm, o) => sm + o.total, 0),
    debit: completedOrders.filter(o => o.paymentMethod === "debit").reduce((sm, o) => sm + o.total, 0)
  };
  
  // Busiest hours
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, "0")}:00`, amount: 0, ordersCount: 0 }));
  completedOrders.forEach(o => {
    const hr = new Date(o.createdAt).getHours();
    hours[hr].amount += o.total;
    hours[hr].ordersCount += 1;
  });
  
  res.json({
    status: "success",
    metrics: {
      totalRevenue,
      subtotal: totalSubtotal,
      totalTax,
      totalService,
      completedOrdersCount: completedOrders.length
    },
    paymentBreakdown,
    hourlyBusyChart: hours.filter(h => h.ordersCount > 0 || [9,12,15,18,21].includes(Number(h.hour.slice(0,2))))
  });
});

async function startServer() {
  // Vite dev mode handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise SaaS-POS Engine active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
