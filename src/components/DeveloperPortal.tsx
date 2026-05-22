import { useState } from 'react';
import { Database, FileCode, Code, Server, Check, Copy, ArrowRight, AppWindow, ShieldCheck, Zap } from 'lucide-react';
import { laravelTemplates } from '../data/laravelTemplates';

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'laravel' | 'deployment'>('architecture');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <div className="glass-panel text-white rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Database size={150} className="text-orange-500" />
        </div>
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Zap size={12} className="animate-pulse" />
            ENTERPRISE ARCHITECTURE DECK
          </div>
          <h2 className="text-3xl font-sans font-bold tracking-tight text-white leading-tight">
            Developer Blueprint & Laravel Integration
          </h2>
          <p className="text-slate-350 text-xs sm:text-sm">
            Tinjau skema PostgreSQL, backend API Laravel 12 (SOLID Service-Repository Pattern), events Reverb, setup PWA offline, dan skenario sinkronisasi real-time multi-outlet.
          </p>
        </div>

        {/* Inner Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-white/10 pt-6">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all duration-200 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Server size={14} />
            SYSTEM ARCHITECTURE & FLOWS
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all duration-200 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Database size={14} />
            POSTGRES TABLE SCHEMA (19 ENTITIES)
          </button>
          <button
            onClick={() => setActiveTab('laravel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all duration-200 cursor-pointer ${
              activeTab === 'laravel'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Code size={14} />
            LARAVEL 12 + NEXT.JS SOURCE CODES
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all duration-200 cursor-pointer ${
              activeTab === 'deployment'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            <AppWindow size={14} />
            DEPLOYMENT & SCALING MANUAL
          </button>
        </div>
      </div>

      {/* 1. Architecture Flow Deck */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel text-white rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-md font-mono text-white font-bold flex items-center gap-2">
                <Server className="text-orange-400" size={18} />
                Modular Full-Stack SaaS Architecture Layout
              </h3>
              <div className="border border-white/10 rounded-xl p-4 bg-slate-950/70 backdrop-blur-md font-mono text-xs overflow-x-auto space-y-2 whitespace-pre text-slate-300">
                {`[CLIENT SIDE: Next.js or React SPA / PWA Application]
     │
     ├── (GraphQL / REST API Requests with JWT Bearer Token)
     ▼
[GATEWAY & SECURITY: Nginx Reverse Proxy / JWT Sanctum Middleware]
     │
     ├── (Rate Limiting: Max 60 reqs/min per IP)
     ▼
[BACKEND SERVICE: Laravel 12 REST API Framework]
     ├── HTTP Routes Router ──► Validation (FormRequest API Rules)
     ├── Controller Router   ──► Service Tier (Business calculations)
     └── Repository Tier     ──► Spatie RBAC Check & DB Transactions
     │
     ├─► [DATABASE STORE: PostgreSQL DB Cluster] (UUID Primary Keys, Read Replicas)
     ├─► [CACHE & QUEUES: Redis Server Cluster] (Store Caching & Async Jobs)
     └─► [WEBSOCKET BROADCASTER: Laravel Reverb] ──► Instant SSE/WS push to KDS / POS`}
              </div>
              <p className="text-slate-350 text-xs leading-relaxed">
                Sistem ini didesain menggunakan **SOLID Principles** di mana data logic dipisah sepenuhnya dari HTTP controller. Model transaksi dibungkus dalam blok `DB::transaction` untuk menjamin keamanan saldo kas register/shift dan mutasi inventory stok barang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel text-white rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="p-2 w-max bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="text-sm font-sans font-bold text-white">OAuth2 & API Security Checks</h4>
                <p className="text-slate-350 text-xs leading-relaxed">
                  Menggunakan Laravel Sanctum dengan cookie HTTP-Only yang secure, mencegah serangan XSS melalui local storage token leakage. Disertai throttling login untuk menghadapi serangan Brute-Force PIN kasir.
                </p>
              </div>

              <div className="glass-panel text-white rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="p-2 w-max bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <Zap size={18} />
                </div>
                <h4 className="text-sm font-sans font-bold text-white">PWA Offline Mode Capable</h4>
                <p className="text-slate-350 text-xs leading-relaxed">
                  Sistem Next.js dikombinasikan dengan Workbox service worker untuk menyimpan cache menu aset secara lokal. Integrasi IndexedDB memastikan kasir tetap bisa menginput order saat kehilangan sinyal internet.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel text-white rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-mono text-white font-bold tracking-wider">CORE ARCHITECTURE FLOWS</h3>
            <div className="space-y-4">
              <div className="flex gap-3 text-xs">
                <div className="flex-none w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-bold text-white">Scan & Customer Order</h4>
                  <p className="text-slate-400 mt-1">Pelanggan men-scan QR code unik meja. Browser me-load menu dari cache offline PWA, user menambahkan pesanan ke keranjang lalu checkout tanpa login.</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex-none w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-bold text-white">Queue & KDS Dispatching</h4>
                  <p className="text-slate-400 mt-1">Laravel Reverb WebSocket memancarkan payload transaksi baru ke terminal Kitchen Display System (KDS) dan mencetak struk kasir melalui Thermal Print Queue.</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex-none w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-bold text-white">Inventory Mutator Logs</h4>
                  <p className="text-slate-400 mt-1">Setiap porsi makanan yang dipacking atau terjual mendepresiasi mutasi stok produk secara real-time. Jika di bawah threshold, notifikasi low-stock dipancarkan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full SQL Tables schemas */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-panel text-white rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-md font-sans text-white font-bold flex items-center gap-2">
              <Database className="text-orange-500" size={18} />
              PostgreSQL Relation Setup
            </h3>
            <p className="text-slate-350 text-xs leading-relaxed">
              Skema ini disiapkan untuk melayani POS multi-outlet skala SaaS enterprise. Menggunakan PostgreSQL UUID v4 sebagai kunci utama untuk integritas sinkronisasi offline-online.
            </p>
            <div className="space-y-3.5 text-xs">
              <div className="pb-3 border-b border-white/5">
                <span className="font-mono text-orange-400 font-bold uppercase">indexing Strategy</span>
                <p className="text-slate-400 mt-1">Semua query pencarian barcode, invoice_no, dan foreign key dipasangi B-Tree Indexing guna optimasi response time database di bawah 15ms.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <span className="font-mono text-orange-400 font-bold uppercase">Soft Delete Security</span>
                <p className="text-slate-400 mt-1">Komponen produk, transaksi penjualan, dan database user memanfaatkan soft deletes. Penghapusan records hanya mengaktifkan flag `deleted_at` untuk audit keuangan.</p>
              </div>
              <div>
                <span className="font-mono text-orange-400 font-bold uppercase">UUID Primary Keys</span>
                <p className="text-slate-400 mt-1">Menghindari kebocoran ID beruntun auto-increment, sekaligus memudahkan batch inserts offline dari client terminal tanpa resiko primary key conflict.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel text-white rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-mono text-white font-bold uppercase tracking-wider">19 ENTITIES RELATION GRID DESIGN</h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="font-bold text-orange-400 uppercase text-[11px] block tracking-wide border-b border-white/5 pb-1">USERS & RBAC</span>
                  <ul className="text-slate-300 space-y-1 mt-1.5 list-disc list-inside col font-semibold">
                    <li>users</li>
                    <li>roles</li>
                    <li>permissions</li>
                    <li>model_has_roles</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-orange-400 uppercase text-[11px] block tracking-wide border-b border-white/5 pb-1">INVENTORY CORE</span>
                  <ul className="text-slate-300 space-y-1 mt-1.5 list-disc list-inside col font-semibold">
                    <li>products</li>
                    <li>categories</li>
                    <li>product_variants</li>
                    <li>suppliers</li>
                    <li>inventory_logs</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-orange-400 uppercase text-[11px] block tracking-wide border-b border-white/5 pb-1">SALES & POS</span>
                  <ul className="text-slate-300 space-y-1 mt-1.5 list-disc list-inside col font-semibold">
                    <li>orders</li>
                    <li>order_items</li>
                    <li>customers</li>
                    <li>cashier_shifts</li>
                    <li>cash_flows</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 backdrop-blur-md border border-white/10">
                <span className="text-slate-300 font-bold block text-xs mb-2">Foreign Key Constraints Example:</span>
                <div className="text-slate-400 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
{`orders.customer_id ────► references customers.id (ON DELETE SET NULL)
order_items.order_id ────► references orders.id (ON DELETE CASCADE)
order_items.variant_id ──► references product_variants.id (ON DELETE SET NULL)
inventory_logs.product_id ────► references products.id (ON DELETE CASCADE)`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Laravel Code Reference Panel */}
      {activeTab === 'laravel' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2">
            <div className="glass-panel text-white rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-mono text-slate-450 font-bold block mb-3 uppercase tracking-wider">FILE LISTS (Laravel 12 API)</span>
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {laravelTemplates.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl flex items-start gap-2.5 transition-all duration-150 cursor-pointer ${
                      selectedFileIndex === idx
                        ? 'bg-orange-500/10 border border-orange-500/35 text-white shadow-md'
                        : 'border border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FileCode size={16} className="mt-0.5 text-slate-400 flex-none" />
                    <div>
                      <span className="text-xs font-bold block break-all font-mono leading-tight">{file.fileName}</span>
                      <span className="text-[10px] text-slate-450 block uppercase mt-1 font-mono">{file.group}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="glass-panel text-white border border-white/10 rounded-2xl p-4 space-y-2.5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    {laravelTemplates[selectedFileIndex].fileName}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    {laravelTemplates[selectedFileIndex].description}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(laravelTemplates[selectedFileIndex].code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-mono font-bold transition shadow-md shadow-orange-500/15 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div className="bg-slate-950/70 border border-white/10 rounded-2xl pt-2 pb-4 px-4 font-mono text-[11px] overflow-x-auto whitespace-pre max-h-[500px]">
                <code className="text-slate-300 leading-normal">
                  {laravelTemplates[selectedFileIndex].code}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Deployment Manual & Guides */}
      {activeTab === 'deployment' && (
        <div className="glass-panel text-white border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
              <Server className="text-orange-500" size={20} />
              Enterprise Production Deployment Blueprint
            </h3>
            <p className="text-slate-305 text-sm">
              Ikuti standarditas deployment ini untuk menjamin uptime transaksi POS mencapai 99.99% di scale Serverless Cloud Run / AWS ECS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
                <span className="font-mono text-orange-400 font-bold text-xs uppercase flex items-center gap-2">
                  <ArrowRight size={14} />
                  1. QUEUE WORKERS & SINKRONISASI
                </span>
                <p className="text-slate-350 text-xs leading-relaxed">
                  Proses-proses berat seperti pencetakan struk penjualan, sync point loyalitas customer, notifikasi alert stok menipis, dan pengiriman email laporan audit harian didelegasikan sepenuhnya ke Laravel Queue.
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-white/5 font-mono text-[11px] text-slate-305">
                  php artisan queue:work --queue=high,default,low --tries=3
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
                <span className="font-mono text-orange-400 font-bold text-xs uppercase flex items-center gap-2">
                  <ArrowRight size={14} />
                  2. LARAVEL REVERB WEBSOCKET SERVER
                </span>
                <p className="text-slate-350 text-xs leading-relaxed">
                  Gunakan Reverb terpanggang bawaan Laravel 11/12 yang efisien. Reverb menangani ribuan koneksi bersamaan antara customer tablet menu, KDS dapur, dan laci POS dengan konsumsi RAM yang sangat minim.
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-white/5 font-mono text-[11px] text-slate-305">
                  php artisan reverb:start --host=0.0.0.0 --port=8080
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
                <span className="font-mono text-orange-400 font-bold text-xs uppercase flex items-center gap-2">
                  <ArrowRight size={14} />
                  3. REDIS DATABASE REPLICATION & CACHING
                </span>
                <p className="text-slate-350 text-xs leading-relaxed">
                  Untuk performa pencarian katalog menu di bawah 5ms, simpan manifest payload produk di Redis Cache. Gunakan Redis Replication jika anda memiliki beberapa cabang restoran yang melakukan sinkronisasi satu database pusat PostgreSQL.
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-white/5 font-mono text-[11px] text-slate-305">
                  CACHE_DRIVER=redis<br />
                  QUEUE_CONNECTION=redis<br />
                  SESSION_DRIVER=redis
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
                <span className="font-mono text-orange-400 font-bold text-xs uppercase flex items-center gap-2">
                  <ArrowRight size={14} />
                  4. DOCKER SAAS ENVIRONMENT CONFIGS
                </span>
                <p className="text-slate-350 text-xs leading-relaxed">
                  SaaS POS dikemas menggunakan Docker Container dengan pemisahan service PHP-FPM, Nginx, PostgreSQL, dan Redis Cluster.
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-white/5 font-mono text-[11px] text-slate-305">
                  docker-compose up -d --build
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
