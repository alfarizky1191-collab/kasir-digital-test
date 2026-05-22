import { useState, useEffect } from "react";
import { 
  Menu, ShoppingBag, Search, Plus, Minus, ArrowRight, Clock, Check, 
  MapPin, RotateCcw, Sparkles, Send, BellRing, PhoneCall
} from "lucide-react";
import { Product, Category, Order, RestaurantTable } from "../types";

interface CustomerProps {
  products: Product[];
  categories: Category[];
  onTriggerCheckout: (payload: any) => void;
  orders: Order[];
}

export default function MTableOrdering({
  products,
  categories,
  onTriggerCheckout,
  orders
}: CustomerProps) {
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [activePromoBanner, setActivePromoBanner] = useState(0);

  // Live order tracker
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Banner slideshow
  useEffect(() => {
    const handle = setInterval(() => {
      setActivePromoBanner(b => (b + 1) % 2);
    }, 4000);
    return () => clearInterval(handle);
  }, []);

  const handleAddToCart = (product: Product, variant?: any) => {
    // Standardize to regular variant if none specified
    const targetVariant = variant || (product.variants.length > 0 ? product.variants[0] : null);
    const key = targetVariant ? `${product.id}-${targetVariant.id}` : product.id;
    
    const existing = cart.find(c => c.cartKey === key);
    if (existing) {
      setCart(cart.map(c => 
        c.cartKey === key ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, {
        cartKey: key,
        productId: product.id,
        productName: product.name,
        variantId: targetVariant?.id,
        variantName: targetVariant?.name,
        quantity: 1,
        priceSell: targetVariant ? targetVariant.priceSell : (product.promoPrice || product.priceSell),
        notes: "",
        imageUrl: product.imageUrl
      }]);
    }
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.cartKey === key) {
        const qty = c.quantity + delta;
        return qty <= 0 ? null : { ...c, quantity: qty };
      }
      return c;
    }).filter(Boolean));
  };

  const handleNoteUpdate = (key: string, note: string) => {
    setCart(cart.map(c => 
      c.cartKey === key ? { ...c, notes: note } : c
    ));
  };

  const totalItemsCount = cart.reduce((sm, i) => sm + i.quantity, 0);
  const subtotal = cart.reduce((sm, i) => sm + (i.priceSell * i.quantity), 0);
  const serviceCharge = Math.round(subtotal * 0.05); // 5%
  const tax = Math.round((subtotal + serviceCharge) * 0.10); // 10%
  const grandTotal = subtotal + serviceCharge + tax;

  const handleCheckoutSubmit = () => {
    if (cart.length === 0 || !selectedTableNum) return;
    
    const finalOrder = {
      diningType: "dine_in",
      tableNumber: selectedTableNum,
      customerName: customerName || `Tamu Meja ${selectedTableNum}`,
      items: cart,
      subtotal,
      discount: 0,
      tax,
      serviceCharge,
      total: grandTotal,
      paymentMethod: "qris", // QRIS self checkout default
      cashPaid: grandTotal,
      cashChange: 0,
      isHold: false
    };

    onTriggerCheckout(finalOrder);
    
    // Switch customer to real-time activity status progress monitor
    setActiveOrder({
      invoiceNo: `INV-QR-${Date.now().toString().slice(-4)}`,
      tableNumber: selectedTableNum,
      customerName: customerName || `Tamu Meja ${selectedTableNum}`,
      items: cart,
      total: grandTotal,
      status: "pending"
    });

    setCart([]);
    setCartOpen(false);
  };

  const filtered = products.filter(p => {
    const mCat = activeCategory === "all" || p.categoryId === activeCategory;
    const mSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return mCat && mSearch && p.isAvailable;
  });

  return (
    <div className="max-w-md mx-auto glass-panel-heavy min-h-[600px] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl font-sans relative">
      
      {/* 1. TABLE QR LANDING GATEWAY */}
      {!selectedTableNum && (
        <div className="flex-1 p-6 space-y-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-3xl border border-orange-500/20 flex items-center justify-center text-orange-400 animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-sans font-extrabold text-white leading-tight">Digital Menu & Table QR ordering</h2>
            <p className="text-slate-300 text-xs">Simulasikan kedatangan tamu dengan memilih kode nomor meja di bawah ini.</p>
          </div>

          <div className="w-full space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase font-bold">Pilihan Nomor Meja Aktif</label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setSelectedTableNum(num)}
                    className="py-3 rounded-xl border border-white/10 bg-white/5 text-white hover:border-orange-500 hover:text-orange-400 font-mono font-bold text-xs transition duration-150 cursor-pointer"
                  >
                    M-{num}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase font-bold">Nama Tamu Pemesan (Opsional)</label>
              <input
                type="text"
                placeholder="e.g. Arifin, Thors..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl text-xs font-sans text-white text-center focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDER PROGRESS MONITOR */}
      {selectedTableNum && activeOrder && (
        <div className="flex-1 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6 text-center pt-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto relative">
              <Clock size={40} className="animate-spin text-emerald-400" />
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase bg-emerald-500/15 text-emerald-450 font-mono font-bold w-max mx-auto px-2.5 py-1 rounded-full border border-emerald-500/20">
                MEJA {selectedTableNum} • SEDANG DISIAPKAN INDEKS
              </div>
              <h3 className="text-lg font-sans font-bold text-white leading-tight">Order Masuk ke Dapur!</h3>
              <p className="text-slate-400 text-xs">Pesanan anda sedang diverifikasi juru masak KDS.</p>
            </div>

            {/* Simulated culinary prep progress bar */}
            <div className="space-y-1.5 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-350">
                <span>ESTIMASI SAJI: 12 MENIT</span>
                <span>STATE: PENDING COOK</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-emerald-555 transition-all duration-1000 w-[20%]" />
              </div>
            </div>

            {/* List ordered items */}
            <div className="space-y-2 text-left pt-2">
              <span className="text-[9px] font-mono text-slate-400 block border-b border-white/5 pb-1.5 uppercase font-bold">Pesanan Anda:</span>
              <div className="space-y-1 text-xs">
                {activeOrder.items.map((it: any, ix: number) => (
                  <div key={ix} className="flex justify-between font-semibold">
                    <span className="text-slate-300">{it.quantity}x {it.productName}</span>
                    <span className="font-mono text-white">Rp {(it.priceSell * it.quantity).toLocaleString("id")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6">
            <button
              onClick={() => {
                setActiveOrder(null);
                setCart([]);
              }}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              ORDER MENU TAMBAHAN
            </button>
            <button
              onClick={() => setSelectedTableNum(null)}
              className="w-full py-2 text-slate-450 text-xs font-mono uppercase cursor-pointer"
            >
              KELUAR SESSION MEJA
            </button>
          </div>
        </div>
      )}

      {/* 3. CORE CUSTOMER MENU AND CART DRAWER */}
      {selectedTableNum && !activeOrder && (
        <div className="flex-1 flex flex-col justify-between h-full">
          
          {/* DIGITAL MENU HEADER */}
          <div className="bg-white/5 border-b border-white/10 p-4 shrink-0 flex justify-between items-center relative">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500 text-white rounded-xl">
                <Menu size={16} />
              </div>
              <div>
                <h3 className="text-xs font-sans font-bold text-white">DIGITAL MENU MEJA {selectedTableNum}</h3>
                <span className="text-[10px] text-slate-400 block font-mono">Arus Order Realtime KDS</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTableNum(null)}
              className="text-[10px] text-slate-400 hover:text-white font-mono uppercase cursor-pointer"
            >
              SWITCH MEJA
            </button>
          </div>

          {/* SLIDESHOW PROMO PROMO ADVERTISING BANNER */}
          <div className="p-4 shrink-0">
            <div className="h-28 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 p-4 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={80} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/20 uppercase font-bold tracking-wider w-max block">
                  PROMO HAPPY HOUR
                </span>
                <h4 className="text-sm font-sans font-black tracking-tight leading-tight">
                  Truffle Fries & Lychee Booster Cuma Rp 35k!
                </h4>
              </div>
              <span className="text-[9px] font-mono text-white/80 block mt-1 font-semibold">Selesai s/d Pukul 17:00 • Kuota terbatas</span>
            </div>
          </div>

          {/* DIGITAL CATEGORY FILTER & SEARCH SECTION */}
          <div className="px-4 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari menu favoritmu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 rounded-lg text-xs font-sans text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-semibold transition cursor-pointer ${
                  activeCategory === "all" ? "bg-orange-500 text-white shadow-lg" : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                }`}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-semibold transition cursor-pointer ${
                    activeCategory === cat.id ? "bg-orange-500 text-white shadow-lg" : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* DIGITAL CATALOG GRID LIST */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[300px]">
            {filtered.map(p => (
              <div 
                key={p.id} 
                className="bg-white/5 border border-white/10 rounded-2xl p-3 flex gap-3 text-left shadow-lg hover:border-white/15 transition backdrop-blur-sm"
              >
                <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden shrink-0 relative">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-sans font-bold text-white">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">{p.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-xs font-mono font-extrabold text-white">
                      Rp {(p.promoPrice || p.priceSell).toLocaleString("id")}
                    </span>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold font-mono rounded-lg flex items-center gap-1 transition shadow-md shadow-orange-500/15 cursor-pointer"
                    >
                      <Plus size={11} /> TAMBAH
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FLOATING ACTION BOTTOM DRAWER: BASKET STRIP */}
          {totalItemsCount > 0 && (
            <div className="bg-black/60 backdrop-blur-md border-t border-white/10 p-4 shrink-0 text-white flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="font-mono text-xs block text-slate-400">{totalItemsCount} menu dalam keranjang</span>
                <span className="font-mono font-bold text-white uppercase tracking-tight text-sm">
                  Est: Rp {grandTotal.toLocaleString("id")}
                </span>
              </div>

              <button
                onClick={() => setCartOpen(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold font-mono rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                LIHAT KERANJANG <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* SLIDE-IN POPUP CART DRAWER MONITOR */}
          {cartOpen && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-30 flex flex-col justify-end">
              <div className="bg-[#0c0c0e] border-t border-white/10 rounded-t-3xl max-h-[80%] overflow-y-auto p-5 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-xs font-sans font-bold text-white uppercase flex items-center gap-1">
                    <ShoppingBag size={14} className="text-slate-400" /> Konfirmasi Pesanan Anda
                  </span>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="text-slate-400 hover:text-orange-500 text-[10px] font-mono uppercase cursor-pointer"
                  >
                    KEMBALI
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto">
                  {cart.map(it => (
                    <div key={it.cartKey} className="text-xs border-b border-white/5 pb-2 space-y-1.5">
                      <div className="flex justify-between text-slate-205 font-semibold">
                        <span>{it.productName}</span>
                        <span className="font-mono text-white">
                          Rp {(it.priceSell * it.quantity).toLocaleString("id")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => updateQuantity(it.cartKey, -1)}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white">{it.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(it.cartKey, 1)}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Instruksi koki (eg. telur setengah matang)..."
                          value={it.notes}
                          onChange={(e) => handleNoteUpdate(it.cartKey, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/5 p-1 rounded text-[10px] text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals detail */}
                <div className="space-y-1.5 text-xs font-mono pt-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Layanan (5%)</span>
                    <span>Rp {serviceCharge.toLocaleString("id")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN Restoran (10%)</span>
                    <span>Rp {tax.toLocaleString("id")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1.5">
                    <span>TOTAL PEMBAYARAN</span>
                    <span className="text-orange-500 text-sm">Rp {grandTotal.toLocaleString("id")}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCheckoutSubmit}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer"
                  >
                    SCAN QRIS & CHECKOUT SEKARANG <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
