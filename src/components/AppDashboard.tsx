import { useState, useEffect } from "react";
import { 
  TrendingUp, Users, ShoppingBag, AlertTriangle, Clock, Play, 
  MapPin, CheckCircle2, DollarSign, ArrowUpRight, ArrowDownRight, 
  UserCheck, ShieldAlert 
} from "lucide-react";
import { Order, RestaurantTable, User, AuditLog, CashierShift } from "../types";

interface DashboardProps {
  orders: Order[];
  tables: RestaurantTable[];
  products: any[];
  mutations: any[];
  auditLogs: AuditLog[];
  shifts: CashierShift[];
  onUpdateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved') => void;
}

export default function AppDashboard({
  orders,
  tables,
  products,
  mutations,
  auditLogs,
  shifts,
  onUpdateTableStatus
}: DashboardProps) {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    ordersCount: 0,
    occupancyRate: 0,
    lowStockItems: 0
  });

  const [activeTableDetails, setActiveTableDetails] = useState<string | null>(null);

  useEffect(() => {
    // Collect stats
    const completedOrders = orders.filter(o => o.status === "completed");
    const totalRev = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter(p => p.stock <= p.minStockAlert).length;
    
    const occupiedCount = tables.filter(t => t.status === "occupied").length;
    const occRate = Math.round((occupiedCount / tables.length) * 105);

    setMetrics({
      revenue: totalRev,
      ordersCount: completedOrders.length,
      occupancyRate: occRate,
      lowStockItems: lowStock
    });
  }, [orders, tables, products]);

  // Compute best sellers
  const getBestSellers = () => {
    const counts: { [key: string]: { name: string; qty: number; total: number } } = {};
    orders.filter(o => o.status === "completed").forEach(o => {
      o.items.forEach(it => {
        if (!counts[it.productId]) {
          counts[it.productId] = { name: it.productName, qty: 0, total: 0 };
        }
        counts[it.productId].qty += it.quantity;
        counts[it.productId].total += it.priceSell * it.quantity;
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  };

  const bestSellers = getBestSellers();

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4 hover:border-white/20 transition duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">TOTAL REVENUE (HARI INI)</span>
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-sans font-extrabold text-white tracking-tight">
              Rp {metrics.revenue.toLocaleString("id-ID")}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-450 font-medium">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-white/80">+18.4% dari kemarin</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4 hover:border-white/20 transition duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">PESANAN SELESAI</span>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-450">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-sans font-extrabold text-white tracking-tight">
              {metrics.ordersCount} <span className="text-sm font-normal text-slate-400">transaksi</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <ArrowUpRight size={14} className="text-orange-400" />
              <span>AOV: Rp {(metrics.ordersCount ? Math.round(metrics.revenue / metrics.ordersCount) : 0).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4 hover:border-white/20 transition duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">OCCUPANCY MEJA DISP</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-450">
              <Users size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-sans font-extrabold text-white tracking-tight">
              {metrics.occupancyRate}%
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-450 font-medium">
              <Clock size={14} className="text-slate-400" />
              <span className="text-slate-350">{tables.filter(t => t.status === "occupied").length} dari {tables.length} meja aktif</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4 hover:border-white/20 transition duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">WARN STOK MENIPIS</span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-550">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-sans font-extrabold text-white tracking-tight">
              {metrics.lowStockItems} <span className="text-sm font-normal text-slate-500">menu</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <ShieldAlert size={14} />
              <span>Gudang butuh mutasi inbound</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom SVG Hourly busy index sales graph */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-tight">Analisis Tren Pendapatan</h3>
              <p className="text-slate-400 text-xs">Arus transaksi real-time per jam operasional ditarik dari sensor database</p>
            </div>
            <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full font-mono font-semibold">LIVE SYNCED</span>
          </div>

          <div className="relative h-44 w-full pt-4">
            {/* Embedded interactive beautiful SVG line graph */}
            <svg viewBox="0 0 500 150" className="w-full h-full text-orange-555" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Backing Horizontal Guidelines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              
              {/* Plot points: 09:00, 11:00, 13:00, 15:00, 17:00, 19:00, 21:00 */}
              <path 
                d="M 10 130 C 50 110, 100 20, 150 40 C 200 65, 250 130, 300 95 C 350 70, 400 10, 450 15 C 480 20, 500 40, 500 40 L 500 140 L 10 140 Z" 
                fill="url(#chartGrad)" 
              />
              <path 
                d="M 10 130 C 50 110, 100 20, 150 40 C 200 65, 250 130, 300 95 C 350 70, 400 10, 450 15 C 480 20, 500 40, 500 40" 
                fill="none" 
                stroke="#f97316" 
                strokeWidth="2.5" 
              />
              {/* Hotpoints dots */}
              <circle cx="100" cy="20" r="4" fill="#f97316" stroke="#FFF" strokeWidth="1.5" />
              <circle cx="150" cy="40" r="4" fill="#f97316" stroke="#FFF" strokeWidth="1.5" />
              <circle cx="300" cy="95" r="4" fill="#f97316" stroke="#FFF" strokeWidth="1.5" />
              <circle cx="450" cy="15" r="4" fill="#f97316" stroke="#FFF" strokeWidth="1.5" />
            </svg>
            <div className="absolute top-2 left-26 bg-slate-950/90 border border-white/10 text-white text-[10px] py-1 px-2 rounded font-mono shadow-2xl">
              12:00: Peak Lunch (Rp 1.5M+)
            </div>
            <div className="absolute top-1 left-90 bg-slate-950/90 border border-white/10 text-white text-[10px] py-1 px-2 rounded font-mono shadow-2xl">
              19:00: Peak Dinner (Rp 2.8M+)
            </div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-450 border-t border-white/5 pt-2.5 px-1 pb-1">
            <span>09:00 (Buka)</span>
            <span>12:00 (Lunch)</span>
            <span>15:00 (Slow)</span>
            <span>18:00 (Dinner Prep)</span>
            <span>21:00 (Closing)</span>
          </div>
        </div>

        {/* Best sellers panel */}
        <div className="glass-panel rounded-2xl p-6  space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-tight">Top 4 Produk Terlaris</h3>
            <p className="text-slate-400 text-xs">Peringkat menu dengan tingkat konversi volume order tertinggi</p>
          </div>
          
          <div className="space-y-3 pt-1">
            {bestSellers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Belum ada data penjualan tercatat hari ini.
              </div>
            ) : (
              bestSellers.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition duration-150">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block line-clamp-1">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.qty} porsi terjual</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                    Rp {item.total.toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid Floor Plan : 10 Tables Realtime Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel-heavy rounded-2xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
          
          {/* Decorative faint glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
            <div>
              <h3 className="text-sm font-semibold font-sans text-white uppercase flex items-center gap-2 tracking-tight">
                <MapPin className="text-orange-500 animate-bounce" size={16} />
                Denah Ruangan & Meja Aktif (Layout Digital)
              </h3>
              <p className="text-slate-400 text-xs">Akses klik modul meja untuk memodifikasi status kehadiran tamu</p>
            </div>
            
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-455 animate-pulse" />
                AVAILABLE ({tables.filter(t => t.status === "available").length})
              </span>
              <span className="flex items-center gap-1.5 text-rose-455 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-455" />
                OCCUPIED ({tables.filter(t => t.status === "occupied").length})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                RESERVED ({tables.filter(t => t.status === "reserved").length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2 relative z-10">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => setActiveTableDetails(activeTableDetails === table.id ? null : table.id)}
                className={`p-4 rounded-xl text-center border transition-all duration-300 relative group cursor-pointer backdrop-blur-sm ${
                  table.status === "occupied"
                    ? "bg-rose-500/15 border-rose-500/40 hover:bg-rose-500/25 text-white"
                    : table.status === "reserved"
                    ? "bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/25 text-white"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                }`}
              >
                <div className="space-y-1">
                  <span className="text-slate-400 font-mono text-[10px] block uppercase">Meja</span>
                  <span className={`text-2xl font-mono font-bold block ${
                    table.status === "occupied" ? "text-rose-455" : table.status === "reserved" ? "text-amber-400" : "text-white"
                  }`}>
                    {table.number}
                  </span>
                  <span className="text-[10px] font-mono text-slate-450 block">Cap: {table.capacity}pax</span>
                </div>

                {/* Status Indicator Bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl ${
                  table.status === "occupied" ? "bg-rose-500" : table.status === "reserved" ? "bg-amber-500" : "bg-transparent"
                }`} />

                {/* Table popover tool control */}
                {activeTableDetails === table.id && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 p-2 bg-slate-950/95 border border-white/15 rounded-xl space-y-1.5 shadow-2xl backdrop-blur-md">
                    <span className="text-[9px] text-slate-400 font-mono block">SET STATUS:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateTableStatus(table.id, "available"); setActiveTableDetails(null); }}
                        className="p-1 rounded bg-white/10 border border-white/10 hover:border-white/20 text-[9px] text-white font-mono cursor-pointer"
                      >
                        FREE
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateTableStatus(table.id, "occupied"); setActiveTableDetails(null); }}
                        className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-[9px] text-white font-mono cursor-pointer"
                      >
                        BUSY
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateTableStatus(table.id, "reserved"); setActiveTableDetails(null); }}
                        className="p-1 rounded bg-amber-500 hover:bg-amber-600 text-[9px] text-white font-mono cursor-pointer"
                      >
                        RSV
                      </button>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log / Shifts feed */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase flex items-center gap-1.5 tracking-tight">
                <UserCheck size={16} className="text-orange-500" />
                Audit Logs & Cash Register
              </h3>
              <p className="text-slate-400 text-xs">Jejak pengawasan aktivitas staf dan laci kasir</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Log aktivitas kosong.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="text-xs border-b border-white/5 pb-2.5 space-y-1">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="font-semibold text-slate-350 uppercase">{log.userName} ({log.role})</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="font-semibold text-orange-400 mr-2 bg-orange-500/10 border border-orange-500/20 px-1 py-0.5 rounded font-mono text-[9px]">
                      {log.action}
                    </span>
                    {log.details}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
