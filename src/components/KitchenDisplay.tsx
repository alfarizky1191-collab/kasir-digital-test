import { useState, useEffect } from "react";
import { 
  Clock, Flame, CheckSquare, Bell, Maximize2, AlertCircle, Play, 
  Printer, Check, ListChecks, HelpCircle, Utensils, AudioWaveform
} from "lucide-react";
import { KitchenTicket } from "../types";

interface KDSProps {
  tickets: KitchenTicket[];
  onUpdateStatus: (ticketId: string, status: 'pending' | 'preparing' | 'ready' | 'completed') => void;
}

export default function KitchenDisplay({ tickets, onUpdateStatus }: KDSProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'preparing' | 'ready'>("all");
  const [playingBeepSound, setPlayingBeepSound] = useState(false);

  // Sound generator
  const triggerAudioAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.value = 880; // Peak clear frequency
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Soft volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 250);
      
      setPlayingBeepSound(true);
      setTimeout(() => setPlayingBeepSound(false), 800);
    } catch {
      // Audio context might be restricted by browser until interaction
    }
  };

  // Safe timer calculations
  const getElapsedMinutes = (createdAtString: string) => {
    const elapsedMs = Date.now() - new Date(createdAtString).getTime();
    return Math.floor(elapsedMs / 60000);
  };

  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const handle = setInterval(() => {
      setTicker(t => t + 1);
    }, 10000); // Trigger re-render every 10s for elapsed timers
    return () => clearInterval(handle);
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const filteredTickets = tickets.filter(tk => {
    if (filterStatus === "all") {
      return tk.status !== "completed";
    }
    return tk.status === filterStatus;
  });

  return (
    <div className="glass-panel text-slate-100 rounded-3xl p-6 space-y-6 min-h-[500px] shadow-2xl relative">
      
      {/* KITCHEN SYSTEM CONTROLLER TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold uppercase tracking-wider animate-pulse">
              Active KDS Node
            </span>
            {playingBeepSound && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <AudioWaveform size={12} className="animate-bounce" /> BEEP INCOMING
              </span>
            )}
          </div>
          <h2 className="text-xl font-mono font-bold tracking-tight text-white flex items-center gap-2">
            <Utensils className="text-orange-500" size={20} />
            KITCHEN EXECUTION PANEL (REALTIME)
          </h2>
        </div>

        {/* Toolbar parameters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-[11px] font-mono">
            {(['all', 'pending', 'preparing', 'ready'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all uppercase cursor-pointer ${
                  filterStatus === st
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={triggerAudioAlarm}
            className="p-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-slate-350 hover:text-white transition cursor-pointer"
            title="Simulasikan Notifikasi Alarm Dapur"
          >
            <Bell size={16} />
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="p-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-slate-350 hover:text-white transition flex items-center gap-1 text-xs font-mono cursor-pointer"
          >
            <Maximize2 size={16} /> {fullscreen ? "EXIT FS" : "FULLSCREEN"}
          </button>
        </div>
      </div>

      {/* CHIPS MONITOR & QUEUE STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 shadow-sm hover:border-white/15 transition">
          <span className="text-[9px] text-slate-400 font-mono block">ANTREAN MASUK (PENDING)</span>
          <span className="text-2xl font-mono text-amber-400 font-extrabold block mt-1">
            {tickets.filter(t => t.status === "pending").length}
          </span>
        </div>
        <div className="glass-card rounded-2xl p-4 shadow-sm hover:border-white/15 transition">
          <span className="text-[9px] text-slate-400 font-mono block">SEDANG DALAM PROSES (COOKING)</span>
          <span className="text-2xl font-mono text-orange-400 font-extrabold block mt-1">
            {tickets.filter(t => t.status === "preparing").length}
          </span>
        </div>
        <div className="glass-card rounded-2xl p-4 shadow-sm hover:border-white/15 transition">
          <span className="text-[9px] text-slate-400 font-mono block">HIDANGAN READY SAJI</span>
          <span className="text-2xl font-mono text-emerald-400 font-extrabold block mt-1">
            {tickets.filter(t => t.status === "ready").length}
          </span>
        </div>
        <div className="glass-card rounded-2xl p-4 shadow-sm hover:border-white/15 transition">
          <span className="text-[9px] text-slate-400 font-mono block">RATA-RATA PREP TIME (AVERAGE)</span>
          <span className="text-2xl font-mono text-blue-400 font-extrabold block mt-1">
            9.2 <span className="text-xs font-normal">menit</span>
          </span>
        </div>
      </div>

      {/* TICKETS MONITOR BOARD */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 space-y-3">
          <ListChecks size={40} className="mx-auto text-slate-600" />
          <p className="text-xs text-slate-450 font-mono">DAPUR BERSIH! TIDAK ADA TIKET MASAK YANG AKTIF SAAT INI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map(tk => {
            const elapsed = getElapsedMinutes(tk.createdAt);
            const isLate = elapsed >= tk.prepMinutesEstimated;
            const statusStr: string = tk.status;
            
            return (
              <div 
                key={tk.id} 
                className={`bg-white/5 border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl relative backdrop-blur-md ${
                  isLate && statusStr !== "ready"
                    ? "border-amber-500/50 shadow-amber-950/10"
                    : statusStr === "ready"
                    ? "border-emerald-500/40"
                    : statusStr === "preparing"
                    ? "border-orange-500/30"
                    : "border-white/10"
                }`}
              >
                {/* Visual Accent top ribbon */}
                <div className={`h-1.5 ${
                  statusStr === "ready" ? "bg-emerald-500" : isLate && statusStr !== "ready" ? "bg-amber-500 animate-pulse" : statusStr === "preparing" ? "bg-orange-500" : "bg-blue-500"
                }`} />

                <div className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">{tk.diningType}</span>
                      <h4 className="text-md font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                        MEJA: {tk.tableNumber || "T. OUT / DELV"}
                      </h4>
                      <span className="text-[10px] text-slate-500 block font-mono">{tk.invoiceNo}</span>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded ${
                        isLate && tk.status !== "ready"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold"
                          : "bg-white/10 text-slate-200"
                      }`}>
                        <Clock size={11} />
                        {elapsed}m elapsed
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">Est: {tk.prepMinutesEstimated}m</span>
                    </div>
                  </div>

                  {/* Ticket Dish Items details checklist */}
                  <div className="space-y-3 font-mono text-xs pt-1">
                    {tk.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200">
                            {it.quantity}x <span className="text-sm border-b border-transparent hover:border-white/20">{it.productName}</span>
                          </span>
                          {it.variantName && (
                            <span className="text-[10px] text-red-00 block pl-3 uppercase">[{it.variantName}]</span>
                          )}
                          {it.notes && (
                            <p className="text-[10px] text-amber-400 pl-3 leading-tight italic bg-amber-500/5 px-2 rounded py-0.5 border-l border-amber-500 w-max mt-0.5">
                              * {it.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom kitchen staff actions */}
                <div className="p-4 bg-black/40 border-t border-white/15 flex gap-2">
                  {tk.status === "pending" && (
                    <button
                      onClick={() => onUpdateStatus(tk.id, "preparing")}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-mono font-bold uppercase transition shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      COOK (MULAI MASAK)
                    </button>
                  )}

                  {tk.status === "preparing" && (
                    <button
                      onClick={() => onUpdateStatus(tk.id, "ready")}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1 shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      <Check size={14} /> SIAP SAJI (READY)
                    </button>
                  )}

                  {tk.status === "ready" && (
                    <button
                      onClick={() => onUpdateStatus(tk.id, "completed")}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> SUDAH SERVED (HAPUS)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
