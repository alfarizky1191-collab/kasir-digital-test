import { useState } from "react";
import { 
  Package, ArrowDown, ArrowUp, Plus, Search
} from "lucide-react";
import { Product, StockMutation } from "../types";

interface InventoryProps {
  products: Product[];
  mutations: StockMutation[];
  onTriggerMutation: (payload: any) => void;
}

export default function InventoryManager({
  products,
  mutations,
  onTriggerMutation
}: InventoryProps) {
  const [mutateModalOpen, setMutateModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [mutationType, setMutationType] = useState<'stock_in' | 'stock_out' | 'mutation_add' | 'mutation_sub' | 'opname'>("stock_in");
  const [mutationQty, setMutationQty] = useState(10);
  const [mutationNotes, setMutationNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleMutationSubmit = () => {
    if (!selectedProductId || mutationQty <= 0) return;
    
    // Resolve positive or negative offsets
    const delta = ['stock_in', 'mutation_add'].includes(mutationType) 
      ? mutationQty 
      : -mutationQty;

    onTriggerMutation({
      productId: selectedProductId,
      type: mutationType,
      quantityChange: delta,
      notes: mutationNotes,
      userId: "u-5",
      userName: "Deni Warehouse"
    });

    setMutateModalOpen(false);
    setSelectedProductId("");
    setMutationNotes("");
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="glass-panel text-white rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-sans font-bold text-white uppercase flex items-center gap-1.5">
            <Package className="text-orange-500" size={16} />
            Warehouse Management Ledger
          </h3>
          <p className="text-slate-300 text-xs">Kelola rantai pasok bahan baku makanan kering, kalengan, minuman, dan audit stok opname</p>
        </div>

        <button
          onClick={() => {
            if (products.length > 0) setSelectedProductId(products[0].id);
            setMutateModalOpen(true);
          }}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-orange-500/20"
        >
          <Plus size={14} /> ADJUSTMENT STOK
        </button>
      </div>

      {/* SEARCH BAR & ALERT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* STOCK TABLE */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari SKU atau nama porsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 rounded-xl text-xs font-sans text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            
            <div className="px-2.5 py-1 text-[11px] font-mono text-orange-400 bg-orange-500/10 rounded-lg border border-orange-500/10">
              LOW WARNINGS: {products.filter(p => p.stock <= p.minStockAlert).length} MENU
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-300 border-b border-white/10">
                  <th className="p-3 font-semibold uppercase tracking-wider">SKU / BARCODE</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">NAMA BAHAN/MENU</th>
                  <th className="p-3 text-right font-semibold uppercase tracking-wider">MOCK COST</th>
                  <th className="p-3 text-right font-semibold uppercase tracking-wider">STOK FISIK</th>
                  <th className="p-3 text-center font-semibold uppercase tracking-wider">STATUS AMAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map(p => {
                  const isLow = p.stock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      <td className="p-3 font-mono font-bold text-slate-400">{p.sku}</td>
                      <td className="p-3 font-bold text-white">{p.name}</td>
                      <td className="p-3 text-right font-mono text-xs text-slate-300">Rp {p.priceCost.toLocaleString("id")}</td>
                      <td className="p-3 text-right font-mono font-extrabold text-white">{p.stock} porsi</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-405 border border-emerald-500/20 uppercase font-semibold">
                            Fully Stocked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT MUTATIONS LIST */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-xs font-mono text-white font-bold uppercase tracking-wider">Recent Mutation History</h3>
            <p className="text-slate-400 text-[10px]">Log pelacakan real-time mutasi keluar masuk laci warehouse</p>
          </div>

          <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
            {mutations.map((mut) => {
              const isAdd = mut.quantityChange > 0;
              return (
                <div key={mut.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-sans space-y-1">
                  <div className="flex justify-between items-center font-mono text-[9px]">
                    <span className="font-bold text-slate-350 uppercase">{mut.userName}</span>
                    <span className="text-slate-405">{new Date(mut.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="font-bold text-white line-clamp-1">{mut.productName}</div>
                  
                  <div className="flex justify-between items-center pt-1 border-t border-dashed border-white/10">
                    <span className="text-slate-400">Mutasi:</span>
                    <span className={`font-mono font-extrabold flex items-center ${isAdd ? "text-emerald-400" : "text-amber-400"}`}>
                      {isAdd ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                      {mut.quantityChange} (Prev: {mut.previousStock} ➔ Curr: {mut.currentStock})
                    </span>
                  </div>

                  {mut.notes && (
                    <div className="text-[10px] text-slate-400 italic font-mono mt-0.5">
                      *{mut.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* POPUP ADJUSTMENT STOK MODAL */}
      {mutateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#060608]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0b0d] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Input Penyesuaian Gudang</h3>
              <p className="text-xs text-slate-405">Pilih menu dan masukkan kuantiti penyesuaian logistik gudang.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">PILIH ITEM BAHAN MENU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-xs font-semibold text-white focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="text-slate-800">
                      [{p.sku}] - {p.name} (Stok: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">TIPE MUTASI PENYESUAIAN</label>
                <select
                  value={mutationType}
                  onChange={(e) => setMutationType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
                >
                  <option value="stock_in" className="text-slate-800">STOCK IN (BARANG MASUK / SUPPLY)</option>
                  <option value="opname" className="text-slate-800">STOCK OPNAME GUDANG (AUDIT FISIK)</option>
                  <option value="mutation_sub" className="text-slate-800">MUTASI KELUAR KE DAPUR (KDS TRANSFER)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">QUANTITY ADJUSTMENT</label>
                <input
                  type="number"
                  value={mutationQty}
                  onChange={(e) => setMutationQty(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-center font-mono font-bold text-white text-base focus:outline-none focus:border-orange-550"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">CATATAN MUTASI WAREHOUSE</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound supply PT Wahana"
                  value={mutationNotes}
                  onChange={(e) => setMutationNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-orange-550"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setMutateModalOpen(false)}
                className="flex-1 py-1.5 border border-white/10 rounded-xl text-slate-400 font-mono text-xs cursor-pointer hover:bg-white/5"
              >
                BATAL
              </button>
              <button 
                onClick={handleMutationSubmit}
                className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                POST MUTATION
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
