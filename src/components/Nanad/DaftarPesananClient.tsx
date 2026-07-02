'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getDetailPesanan, updateStatusPesanan } from './pesanan';

interface Order {
  id: number;
  total_harga: number;
  status_pembayaran: 'pending' | 'success' | 'failed';
  created_at: string;
}

interface DetailItem {
  id: number;
  nama_produk: string;
  kuantitas: number;
  harga_saat_ini: number;
}

export default function DaftarPesananClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeDetail, setActiveDetail] = useState<number | null>(null);
  const [itemsDetail, setItemsDetail] = useState<DetailItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fungsi untuk memuat produk yang dibeli di dalam satu nomor pesanan
  const handleToggleDetail = async (orderId: number) => {
    if (activeDetail === orderId) {
      setActiveDetail(null);
      return;
    }

    setLoadingDetail(true);
    setActiveDetail(orderId);
    setItemsDetail([]);

    const res = await getDetailPesanan(orderId);
    if (res.success) {
      setItemsDetail(res.data);
    }
    setLoadingDetail(false);
  };

  // Fungsi untuk memperbarui status pembayaran (Pending / Success / Failed)
  const handleUbahStatus = (orderId: number, statusBaru: 'pending' | 'success' | 'failed') => {
    startTransition(async () => {
      const res = await updateStatusPesanan(orderId, statusBaru);
      if (res.success) {
        // Update state lokal agar UI berubah secara instan
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status_pembayaran: statusBaru } : o));
      }
    });
  };

  // Helper styling warna untuk badge status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-zinc-800 text-zinc-300 bg-zinc-900/40';
      case 'failed':
        return 'border-zinc-900 text-zinc-600 bg-black';
      default:
        return 'border-zinc-800 text-zinc-400 bg-zinc-950';
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden transition-all duration-200"
        >
          {/* BARIS UTAMA DATA PESANAN */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Info Identitas Pesanan */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white tracking-tight">
                  #{order.id}
                </span>
                <span className={`text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 border rounded ${getStatusBadge(order.status_pembayaran)}`}>
                  {order.status_pembayaran}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">
                {new Date(order.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>

            {/* Total Harga & Panel Aksi Kontrol */}
            <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-zinc-900/60">
              <div className="text-left sm:text-right">
                <p className="text-[10px] uppercase text-zinc-500 tracking-wider">Total Nilai</p>
                <p className="text-sm font-bold text-white tracking-tight">
                  Rp {Number(order.total_harga).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Dropdown Pilihan Ubah Status */}
                <select
                  disabled={isPending}
                  value={order.status_pembayaran}
                  onChange={(e) => handleUbahStatus(order.id, e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 px-2 py-1.5 rounded focus:outline-none focus:border-zinc-600 disabled:opacity-40 cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>

                {/* Tombol Tampilkan Detail Barang */}
                <button
                  onClick={() => handleToggleDetail(order.id)}
                  className={`p-2 border rounded transition ${
                    activeDetail === order.id 
                      ? 'bg-white border-white text-black' 
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                  title="Lihat Detail Produk"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDetail === order.id ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* AREA EXPANDABLE: DETAIL ITEM DI DALAM PESANAN */}
          {activeDetail === order.id && (
            <div className="border-t border-zinc-900/80 bg-zinc-950 px-5 py-4 space-y-3">
              <h4 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Item Rincian Pesanan</h4>
              
              {loadingDetail ? (
                <p className="text-xs text-zinc-600 animate-pulse py-2">Memuat item...</p>
              ) : itemsDetail.length > 0 ? (
                <div className="divide-y divide-zinc-900/40">
                  {itemsDetail.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2.5 text-xs">
                      <div className="min-w-0 pr-4">
                        <p className="text-zinc-300 font-medium truncate">{item.nama_produk}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Rp {Number(item.harga_saat_ini).toLocaleString('id-ID')} x {item.kuantitas}
                        </p>
                      </div>
                      <span className="text-zinc-400 font-medium shrink-0">
                        Rp {(Number(item.harga_saat_ini) * item.kuantitas).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 py-1">Gagal mengambil item detail.</p>
              )}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}