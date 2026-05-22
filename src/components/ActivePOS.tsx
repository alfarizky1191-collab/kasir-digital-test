import React, { useState, useEffect } from "react";
import { 
  Search, Grid, Flame, ShoppingCart, Percent, Trash2, CreditCard, 
  Receipt, Plus, Minus, Key, Users, ArrowLeftRight, ArrowRight, 
  HelpCircle, CheckCircle, Calculator, MapPin, Tag, Pause, Play, Save, FileText, Lock
} from "lucide-react";
import { Product, Category, Order, RestaurantTable, CashierShift } from "../types";

interface POSProps {
  products: Product[];
  categories: Category[];
  tables: RestaurantTable[];
  activeShift: CashierShift | null;
  onOpenShift: (float: number) => void;
  onCloseShift: (cash: number, notes: string) => void;
  onTriggerCheckout: (payload: any) => void;
  onPostPettyCash: (payload: any) => void;
  orders: Order[];
}

export default function ActivePOS({
  products,
  categories,
  tables,
  activeShift,
  onOpenShift,
  onCloseShift,
  onTriggerCheckout,
  onPostPettyCash,
  orders
}: POSProps) {
  // POS States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [diningType, setDiningType] = useState<'dine_in' | 'takeaway' | 'delivery'>("dine_in");
  const [customerName, setCustomerName] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  
  // Checkout Modal trigger
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | 'qris' | 'split'>("cash");
  const [cashReceived, setCashReceived] = useState<string>("0");
  
  // Shift Controls State
  const [shiftOpeningFloat, setShiftOpeningFloat] = useState(500000);
  const [registerDeclareCash, setRegisterDeclareCash] = useState(0);
  const [registerDeclareNotes, setRegisterDeclareNotes] = useState("");
  
  // Modals
  const [shiftOpeningOpen, setShiftOpeningOpen] = useState(false);
  const [shiftClosingOpen, setShiftClosingOpen] = useState(false);
  const [pettyCashOpen, setPettyCashOpen] = useState(false);
  const [pettyAmount, setPettyAmount] = useState(50000);
  const [pettyType, setPettyType] = useState<'cash_in' | 'cash_out'>("cash_out");
  const [pettyReason, setPettyReason] = useState("");
  
  // Hold/Tahan States
  const [holdLabel, setHoldLabel] = useState("");
  
  // Split bill helper state
  const [splitCount, setSplitCount] = useState(2);
  const [splitMethodDetail, setSplitMethodDetail] = useState<any[]>([]);

  // Printer receipt modal
  const [receiptPreviewOrder, setReceiptPreviewOrder] = useState<Order | null>(null);

  // Variant selector popover
  const [variantSelectorProduct, setVariantSelectorProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!activeShift) {
      setShiftOpeningOpen(true);
    } else {
      setShiftOpeningOpen(false);
    }
  }, [activeShift]);

  // Handle SKU Barcode queries
  const handleBarcodeKeyScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const match = products.find(p => p.barcode === searchQuery || p.sku.toLowerCase() === searchQuery.toLowerCase());
      if (match) {
        handleAddToCart(match);
        setSearchQuery("");
      }
    }
  };

  const handleAddToCart = (product: Product, variant?: any) => {
    if (!product.isAvailable) return;
    
    // If has variants and none selected yet, open popup
    if (product.variants.length > 0 && !variant) {
      setVariantSelectorProduct(product);
      return;
    }

    const key = variant ? `${product.id}-${variant.id}` : product.id;
    const existing = cart.find(item => item.cartKey === key);

    if (existing) {
      setCart(cart.map(item => 
        item.cartKey === key ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        cartKey: key,
        productId: product.id,
        productName: product.name,
        variantId: variant?.id,
        variantName: variant?.name,
        quantity: 1,
        priceSell: variant ? variant.priceSell : (product.promoPrice || product.priceSell),
        notes: "",
        imageUrl: product.imageUrl
      }]);
    }
    setVariantSelectorProduct(null);
  };

  const handleQuantityChange = (key: string, delta: number) => {
    const item = cart.find(c => c.cartKey === key);
    if (!item) return;
    
    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      setCart(cart.filter(c => c.cartKey !== key));
    } else {
      setCart(cart.map(c => 
        c.cartKey === key ? { ...c, quantity: nextQty } : c
      ));
    }
  };

  const handleItemNoteMutation = (key: string, value: string) => {
    setCart(cart.map(c => 
      c.cartKey === key ? { ...c, notes: value } : c
    ));
  };

  // Pricing formula blocks
  const subtotal = cart.reduce((sum, item) => sum + (item.priceSell * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const serviceCharge = Math.round((subtotal - discountAmount) * 0.05); // 5%
  const tax = Math.round((subtotal - discountAmount + serviceCharge) * 10); // 10%
  const total = subtotal - discountAmount + serviceCharge + tax;

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    onTriggerCheckout({
      diningType,
      tableNumber: selectedTable,
      customerName: customerName || `Tahan (${holdLabel || "No Label"})`,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      serviceCharge,
      total,
      isHold: true,
      holdLabel: holdLabel || "Tahan Tanpa Label"
    });
    setCart([]);
    setHoldLabel("");
    setSelectedTable(null);
    setCustomerName("");
  };

  const handleOrderCheckoutSubmit = () => {
    if (cart.length === 0) return;
    
    const checkoutPayload = {
      diningType,
      tableNumber: selectedTable,
      customerName,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      serviceCharge,
      total,
      paymentMethod,
      cashPaid: Number(cashReceived) || total,
      cashChange: Math.max(0, (Number(cashReceived) || total) - total),
      isHold: false
    };

    onTriggerCheckout(checkoutPayload);
    
    // Set for receipt preview
    const invoiceNo = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-PND`;
    setReceiptPreviewOrder({
      id: "preview-id",
      invoiceNo,
      diningType,
      tableNumber: selectedTable || undefined,
      customerName: customerName || "Pelanggan POS",
      items: cart.map(it => ({ ...it, status: "pending" })),
      subtotal,
      discount: discountAmount,
      tax,
      serviceCharge,
      total,
      paymentMethod,
      cashPaid: Number(cashReceived) || total,
      cashChange: Math.max(0, (Number(cashReceived) || total) - total),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      staffId: activeShift?.staffId || "u-3"
    });

    // Reset registers
    setCart([]);
    setSelectedTable(null);
    setCustomerName("");
    setDiscountPercent(0);
    setCheckoutModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.barcode.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      
      {/* SHIFT BAR OVERVIEW */}
      <div className="lg:col-span-12 glass-panel text-slate-300 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LACI POS: <strong className="text-white font-mono">{activeShift ? activeShift.staffName : "TUTUP"}</strong></span>
          {activeShift && (
            <span className="text-slate-400 font-mono text-[11px] border-l border-white/10 pl-3">
              Mulai: {new Date(activeShift.openedAt).toLocaleTimeString()} (Float: Rp {activeShift.openingCashFloat.toLocaleString("id")})
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {activeShift ? (
            <>
              <button 
                onClick={() => setPettyCashOpen(true)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-xs font-mono transition-all cursor-pointer"
              >
                PETTY CASH
              </button>
              <button 
                onClick={() => setShiftClosingOpen(true)}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
              >
                <Lock size={12} /> CLS SHIFT
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShiftOpeningOpen(true)}
              className="px-3 py-1 bg-emerald-505 hover:bg-emerald-600 text-white rounded-lg text-xs font-mono transition-all cursor-pointer"
            >
              BUKA REGISTER KASIR
            </button>
          )}
        </div>
      </div>

      {/* LEFT: PRODUCTS CATALOG PANEL */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Barcode / Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari menu, SKU, atau scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeKeyScan}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl md:text-sm font-sans focus:outline-none focus:border-orange-500 backdrop-blur-sm"
            />
          </div>

          <div className="flex gap-1">
            {/* Dining type filters */}
            {(['dine_in', 'takeaway', 'delivery'] as const).map(type => (
              <button
                key={type}
                onClick={() => setDiningType(type)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase font-mono transition-all cursor-pointer ${
                  diningType === type
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Categories sliding strip */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-white/5 border border-white/10 text-slate-350 hover:bg-white/10"
            }`}
          >
            Semua Menu
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 border border-white/10 text-slate-350 hover:bg-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dynamic products layout list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map(prod => (
            <button
              key={prod.id}
              onClick={() => handleAddToCart(prod)}
              className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-left shadow-lg hover:border-white/20 hover:scale-[1.01] transition-all relative overflow-hidden group flex flex-col justify-between h-48 cursor-pointer ${
                !prod.isAvailable ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              {prod.promoPrice && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider z-10 animate-pulse">
                  HAPPY HOUR PROMO
                </span>
              )}
              
              <div className="space-y-2">
                <div className="h-24 w-full rounded-xl overflow-hidden bg-white/5 relative">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {prod.stock <= prod.minStockAlert && (
                    <div className="absolute inset-0 bg-amber-500/10 flex items-end p-1.5 text-[9px] text-amber-300 font-mono font-bold bg-gradient-to-t from-black/80">
                      STOK MENIPIS: {prod.stock}
                    </div>
                  )}
                </div>
                
                <h4 className="text-xs font-sans font-bold text-white line-clamp-1">
                  {prod.name}
                </h4>
              </div>

              <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase">{prod.sku}</span>
                <span className="text-xs font-mono font-extrabold text-white">
                  Rp {(prod.promoPrice || prod.priceSell).toLocaleString("id")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: CART SYSTEM PANEL */}
      <div className="lg:col-span-5 glass-panel rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-xs font-sans font-bold text-white uppercase flex items-center gap-1">
              <ShoppingCart size={14} className="text-slate-450" /> Keranjang Belanja ({cart.length})
            </span>
            <button 
              onClick={() => setCart([])}
              className="text-slate-400 hover:text-orange-550 text-[10px] font-mono uppercase cursor-pointer"
            >
              CLEAR
            </button>
          </div>

          {diningType === "dine_in" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">PILIH NOMOR MEJA</label>
                <select
                  value={selectedTable || ""}
                  onChange={(e) => setSelectedTable(Number(e.target.value) || null)}
                  className="w-full bg-white/5 border border-white/10 p-1.5 rounded-lg text-xs font-mono text-white focus:outline-none"
                >
                  <option value="" className="text-slate-800">-- TANPA MEJA --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.number} className="text-slate-800">
                      Meja {t.number} ({t.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">NAMA PELANGGAN</label>
                <input
                  type="text"
                  placeholder="e.g. Budi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-1.5 rounded-lg text-xs font-sans text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <ShoppingCart size={32} className="mx-auto text-slate-650" />
              <p className="text-xs font-sans">Belum ada item dalam struk belanja</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.cartKey} className="text-xs border-b border-white/5 pb-2 space-y-1.5 font-sans">
                  <div className="flex justify-between font-sans text-slate-200 font-bold">
                    <span>
                      {item.productName}
                      {item.variantName && <span className="text-[10px] text-orange-400 font-mono ml-1.5">({item.variantName})</span>}
                    </span>
                    <span className="font-mono text-white">
                      Rp {(item.priceSell * item.quantity).toLocaleString("id")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleQuantityChange(item.cartKey, -1)}
                        className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.cartKey, 1)}
                        className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Tambahkan catatan (eg. pedas)..."
                      value={item.notes}
                      onChange={(e) => handleItemNoteMutation(item.cartKey, e.target.value)}
                      className="flex-1 bg-white/5 px-2 py-1 rounded text-[10px] text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FINANCIAL SUMMARY TOTALS */}
        <div className="border-t border-white/10 pt-3 space-y-2 text-xs font-sans">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono">Rp {subtotal.toLocaleString("id")}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">Diskon Global (%) <Percent size={12} /></span>
            <input 
              type="number"
              min="0"
              max="50"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Math.min(50, Number(e.target.value) || 0))}
              className="w-12 text-right bg-white/5 p-1 rounded font-mono text-xs border border-white/10 text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Service Charge (5%)</span>
            <span className="font-mono">Rp {serviceCharge.toLocaleString("id")}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>PPN Pajak (10%)</span>
            <span className="font-mono">Rp {tax.toLocaleString("id")}</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-2">
            <span>TOTAL TAGIHAN</span>
            <span className="font-mono text-orange-500 text-base font-extrabold">Rp {total.toLocaleString("id")}</span>
          </div>

          {/* CONTROL BOX: PAY AND HOLD */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="col-span-1 space-y-1">
              <input
                type="text"
                placeholder="Id Tahan..."
                value={holdLabel}
                onChange={(e) => setHoldLabel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-2 py-1.5 rounded-lg text-[10px] font-mono text-white focus:outline-none"
              />
              <button 
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
                className="w-full py-2 bg-white/10 hover:bg-white/15 disabled:bg-white/5 text-slate-350 disabled:text-slate-500 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Pause size={10} /> HOLD
              </button>
            </div>

            <button
              onClick={() => {
                setCashReceived(String(total));
                setCheckoutModalOpen(true);
              }}
              disabled={cart.length === 0 || !activeShift}
              className="col-span-3 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-white/5 disabled:text-slate-500 text-white rounded-xl text-xs font-bold uppercase transition-all tracking-wide shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard size={16} /> PROSES BAYAR & KDS CETAK
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: VARIANT SELECTOR */}
      {variantSelectorProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-900">PILIH VARIAN PRODUK</h3>
            <p className="text-xs text-slate-500">{variantSelectorProduct.name}</p>
            <div className="space-y-2">
              {variantSelectorProduct.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleAddToCart(variantSelectorProduct, v)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-red-500/30 hover:bg-red-50/20 flex justify-between items-center text-xs"
                >
                  <span className="font-semibold text-slate-800">{v.name}</span>
                  <span className="font-mono text-slate-500">Rp {v.priceSell.toLocaleString("id")}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setVariantSelectorProduct(null)}
              className="w-full py-2 border rounded-xl text-slate-500 font-mono text-xs"
            >
              BATAL
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODAL: PROCESS SETTLEMENT & CHECKOUT */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase">Input Metode Pembayaran</h3>
              <p className="text-slate-400 text-xs">Atur split tagihan, scan QRIS atau input diskon khusus karyawan</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['cash', 'debit', 'qris', 'split'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setPaymentMethod(m);
                    if (m === 'split') {
                      setSplitMethodDetail([
                        { method: "Cash", amount: Math.round(total / 2) },
                        { method: "QRIS", amount: Math.round(total / 2) }
                      ]);
                    }
                  }}
                  className={`py-3 rounded-xl text-xs font-mono font-bold uppercase border transition-all ${
                    paymentMethod === m
                      ? "bg-slate-900 text-white border-transparent"
                      : "bg-slate-50 text-slate-600 border-slate-100 font-normal hover:bg-slate-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">TUNAI DI TERIMA</label>
                  <input
                    type="text"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono text-base font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[total, total + 10000, total + 20000, 50000, 100000].map((val, i) => (
                    <button
                      key={i}
                      onClick={() => setCashReceived(String(val))}
                      className="px-2 py-1.5 bg-white border rounded text-[10px] font-mono font-medium hover:border-slate-300 text-slate-600"
                    >
                      Rp {val.toLocaleString("id")}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>KEMBALIAN CASH:</span>
                  <span className="font-mono text-emerald-600 font-extrabold text-base">
                    Rp {Math.max(0, Number(cashReceived) - total).toLocaleString("id")}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'qris' && (
              <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between text-xs gap-4">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-800 block">SIMULASI QRIS RESTO</span>
                  <p className="text-slate-400 text-[10px]">Tamu men-scan kode QR dinamis di EDC POS terminal.</p>
                </div>
                {/* Simulated QR block layout */}
                <div className="w-20 h-20 bg-slate-950 rounded-lg p-1.5 flex flex-wrap items-center justify-center flex-none">
                  <div className="w-6 h-6 bg-white shrink-0 m-0.5" />
                  <div className="w-6 h-6 bg-white shrink-0 m-0.5" />
                  <div className="w-6 h-6 bg-white shrink-0 m-0.5" />
                  <div className="w-6 h-6 bg-white shrink-0 m-0.5" />
                </div>
              </div>
            )}

            {paymentMethod === 'split' && (
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-xs font-mono">
                <span className="font-bold text-slate-800 block uppercase">Pecah Pembayaran</span>
                {splitMethodDetail.map((sp, ix) => (
                  <div key={ix} className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-500 font-bold">{sp.method} Portion:</span>
                    <input
                      type="number"
                      value={sp.amount}
                      onChange={(e) => {
                        const copy = [...splitMethodDetail];
                        copy[ix].amount = Number(e.target.value) || 0;
                        setSplitMethodDetail(copy);
                      }}
                      className="w-28 text-right bg-white p-1 rounded font-mono border"
                    />
                  </div>
                ))}
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-600">Terdistribusi: Rp {splitMethodDetail.reduce((sm, i)=>sm+i.amount,0).toLocaleString("id")}</span>
                  <span className="text-red-500">Target Total: Rp {total.toLocaleString("id")}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 py-2.5 border rounded-xl text-slate-500 font-mono text-xs"
              >
                KEMBALI
              </button>
              <button 
                onClick={handleOrderCheckoutSubmit}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase"
              >
                SELESAIKAN ORDER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: THERMAL INVOICE RECEIPT PREVIEW (AUTHENTIC PREVISUALIZATION) */}
      {receiptPreviewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center pb-1 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase">PRINTER INVOICE TICKET</span>
              <button 
                onClick={() => setReceiptPreviewOrder(null)}
                className="text-slate-400 hover:text-white text-xs font-mono uppercase"
              >
                CLOSE
              </button>
            </div>

            {/* Simulated 80mm Cashier Roll with glass effect */}
            <div className="bg-white text-slate-950 p-4 rounded-lg font-mono text-[10px] space-y-3 leading-relaxed shadow-inner">
              <div className="text-center font-bold">
                <span className="text-sm block">KASIR DIGITAL PREMIUM</span>
                <span className="text-[9px] font-normal block text-slate-500">Kawasan Gourmet Raya No 88, Jakarta</span>
                <span className="text-[9px] font-normal block text-slate-500">Telp: 0812-3456-7890</span>
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 space-y-0.5">
                <div>INV NO : {receiptPreviewOrder.invoiceNo}</div>
                <div>TANGGAL: {new Date(receiptPreviewOrder.createdAt).toLocaleString()}</div>
                <div>KASIR  : {activeShift ? activeShift.staffName : "Budi Cashier"}</div>
                {receiptPreviewOrder.tableNumber && <div>MEJA   : {receiptPreviewOrder.tableNumber}</div>}
                <div>PELANGGAN: {receiptPreviewOrder.customerName}</div>
                <div>TIPE   : {receiptPreviewOrder.diningType.toUpperCase()}</div>
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 space-y-1">
                {receiptPreviewOrder.items.map((it, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-bold">
                      <span>{it.quantity}x {it.productName}</span>
                      <span>{(it.priceSell * it.quantity).toLocaleString("id-ID")}</span>
                    </div>
                    {it.variantName && <div className="text-slate-500 italic pl-3">-{it.variantName}</div>}
                    {it.notes && <div className="text-slate-500 text-[9px] pl-3">*{it.notes}</div>}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>{receiptPreviewOrder.subtotal.toLocaleString("id")}</span>
                </div>
                {receiptPreviewOrder.discount > 0 && (
                  <div className="flex justify-between text-red-650 font-bold">
                    <span>SEEDED DISK ({discountPercent}%)</span>
                    <span>-{receiptPreviewOrder.discount.toLocaleString("id")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>SVC CHG (5%)</span>
                  <span>{receiptPreviewOrder.serviceCharge.toLocaleString("id")}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAX PPN (10%)</span>
                  <span>{receiptPreviewOrder.tax.toLocaleString("id")}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-dashed mt-1 pt-1 text-slate-900">
                  <span>TOTAL TAGIHAN</span>
                  <span>Rp {receiptPreviewOrder.total.toLocaleString("id")}</span>
                </div>
                <div className="flex justify-between text-slate-500 leading-none">
                  <span>METODE BAYAR</span>
                  <span>{receiptPreviewOrder.paymentMethod?.toUpperCase() || "CASH"}</span>
                </div>
                <div className="flex justify-between text-slate-500 leading-none">
                  <span>DITERIMA</span>
                  <span>{receiptPreviewOrder.cashPaid?.toLocaleString("id")}</span>
                </div>
                <div className="flex justify-between text-slate-500 leading-none">
                  <span>KEMBALIAN</span>
                  <span>{receiptPreviewOrder.cashChange?.toLocaleString("id")}</span>
                </div>
              </div>

              <div className="text-center text-[8px] text-slate-400 border-t border-dashed pt-2">
                Terima kasih atas kunjungan Anda!<br />
                Sistem didorong oleh Next-Laravel Enterprise Cloud
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-1 px-3 bg-red-500 text-white rounded text-xs font-mono"
              >
                CETAK STRUK
              </button>
              <button 
                onClick={() => setReceiptPreviewOrder(null)}
                className="flex-1 py-1 border text-slate-450 rounded text-xs font-mono"
              >
                TUTUP WINDOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: OPEN SHIFT MODAL INITIALIZER */}
      {shiftOpeningOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center space-y-2">
              <Calculator size={36} className="mx-auto text-red-500" />
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase">Input Modal Awal Register</h3>
              <p className="text-xs text-slate-400">Kasir wajib menginputkan modal laci awal register sebelum memulai shift.</p>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">MODAL AWAL DI LACI (FLOAT)</label>
              <input
                type="number"
                value={shiftOpeningFloat}
                onChange={(e) => setShiftOpeningFloat(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border px-3 py-2 rounded-xl text-center font-mono font-bold text-slate-800 text-lg"
              />
            </div>

            <button
              onClick={() => {
                onOpenShift(shiftOpeningFloat);
                setShiftOpeningOpen(false);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold uppercase transition"
            >
              KONFIRMASI BUKA KASIR
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODAL: CLOSE SHIFT MODAL OUTBOUND */}
      {shiftClosingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase">Input Rekonsiliasi Kas Laci</h3>
              <p className="text-xs text-slate-400">Input lembar uang tunai laci untuk mencatat selisih tutup register.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">TOTAL FISIK KAS REGISTER</label>
                <input
                  type="number"
                  value={registerDeclareCash}
                  onChange={(e) => setRegisterDeclareCash(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border px-3 py-2 rounded-xl text-center font-mono font-bold text-slate-800 text-lg"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">CATATAN SELISIH ATAU PETTY RECONCILE</label>
                <textarea
                  placeholder="e.g. Kas laci pas, tidak ada nominal rusak."
                  value={registerDeclareNotes}
                  onChange={(e) => setRegisterDeclareNotes(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-sans text-slate-700 h-16 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShiftClosingOpen(false)}
                className="flex-1 py-2 border rounded-xl text-slate-500 font-mono text-xs"
              >
                BATAL
              </button>
              <button 
                onClick={() => {
                  onCloseShift(registerDeclareCash, registerDeclareNotes);
                  setShiftClosingOpen(false);
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-650 text-white rounded-xl text-xs font-bold uppercase"
              >
                PRINT & RECONCILE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: PETTY CASH LOG FORM (CASH IN / CASH OUT) */}
      {pettyCashOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase">Input Mutasi Petty Cash</h3>
              <p className="text-xs text-slate-400">Catat setiap kas darurat laci yang diambil untuk operasional.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">TIPE ENTRANCE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPettyType("cash_in")}
                    className={`py-1.5 rounded-lg text-xs font-medium font-mono ${
                      pettyType === "cash_in" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    CASH IN (MASUK)
                  </button>
                  <button
                    onClick={() => setPettyType("cash_out")}
                    className={`py-1.5 rounded-lg text-xs font-medium font-mono ${
                      pettyType === "cash_out" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    CASH OUT (KELUAR)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold font-mono">NOMINAL MUTASI (Rp)</label>
                <input
                  type="number"
                  value={pettyAmount}
                  onChange={(e) => setPettyAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border px-3 py-2 rounded-xl text-center font-mono font-bold text-slate-800 text-base"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">KEPERLUAN KAS DARURAT</label>
                <input
                  type="text"
                  placeholder="e.g. Beli sabun pel lantai, beli es batu kristal"
                  value={pettyReason}
                  onChange={(e) => setPettyReason(e.target.value)}
                  className="w-full bg-slate-50 border px-3 py-2 rounded-xl text-xs font-sans text-slate-700"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setPettyCashOpen(false)}
                className="flex-1 py-1.5 border rounded-xl text-slate-550 font-mono text-xs"
              >
                KEMBALI
              </button>
              <button 
                onClick={() => {
                  onPostPettyCash({ amount: pettyAmount, type: pettyType, reason: pettyReason, loggedBy: activeShift?.staffName || "Staff POS" });
                  setPettyAmount(50000);
                  setPettyReason("");
                  setPettyCashOpen(false);
                }}
                className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase"
              >
                POSTING DRAW
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
