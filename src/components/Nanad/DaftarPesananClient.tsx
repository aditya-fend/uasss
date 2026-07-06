// Menandakan bahwa file ini adalah Client Component yang dieksekusi di browser untuk mendukung state interaktif
'use client';

// Mengimpor React Hooks untuk mengelola state lokal, transisi status asinkronus, dan rendering data
import { useState, useTransition } from 'react';
// Mengimpor ikon-ikon indikator dan navigasi dari library lucide-react
import { ChevronDown, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
// Mengimpor Server Actions untuk mengambil rincian item pesanan dan memperbarui status di database
import { getDetailPesanan, updateStatusPesanan } from './pesanan';

// Mendefinisikan struktur data (interface) untuk objek data Pesanan/Order utama
interface Order {
  id: number;
  total_harga: number;
  status_pembayaran: 'pending' | 'success' | 'failed';
  created_at: string;
}

// Mendefinisikan struktur data (interface) untuk rincian produk di dalam pesanan tersebut
interface DetailItem {
  id: number;
  nama_produk: string;
  kuantitas: number;
  harga_saat_ini: number;
}

// Komponen utama untuk menampilkan daftar riwayat pesanan berserta kontrol manajemen statusnya
export default function DaftarPesananClient({ initialOrders }: { initialOrders: Order[] }) {
  // State untuk menyimpan daftar pesanan yang diinisialisasi dari props data server (Server Component)
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  // State untuk mencatat ID pesanan mana yang rincian produknya sedang dibuka/diperluas (accordion)
  const [activeDetail, setActiveDetail] = useState<number | null>(null);
  // State untuk menampung daftar item produk dari pesanan yang sedang aktif dibuka
  const [itemsDetail, setItemsDetail] = useState<DetailItem[]>([]);
  // State untuk menampilkan indikator loading saat memproses query data detail produk
  const [loadingDetail, setLoadingDetail] = useState(false);
  // useTransition mengontrol status eksekusi Server Action ubah status agar tidak membekukan UI utama
  const [isPending, startTransition] = useTransition();

  // Fungsi untuk memuat produk yang dibeli di dalam satu nomor pesanan
  const handleToggleDetail = async (orderId: number) => {
    // Jika tombol detail pesanan yang sama diklik ulang, tutup area rincian tersebut
    if (activeDetail === orderId) {
      setActiveDetail(null);
      return;
    }

    // Mengaktifkan status loading sebelum melakukan fetch data ke server
    setLoadingDetail(true);
    // Menyetel ID pesanan aktif agar area expandable/accordion terbuka
    setActiveDetail(orderId);
    // Mengosongkan data item rincian sebelumnya agar tidak terjadi ketimpangan visual
    setItemsDetail([]);

    // Memanggil Server Action untuk mengambil data item berdasarkan ID pesanan
    const res = await getDetailPesanan(orderId);
    // Jika server berhasil mengembalikan data rincian
    if (res.success) {
      // Menyimpan data rincian produk ke dalam state lokal itemsDetail
      setItemsDetail(res.data);
    }
    // Mematikan status loading setelah proses fetch selesai
    setLoadingDetail(false);
  };

  // Fungsi untuk memperbarui status pembayaran (Pending / Success / Failed)
  const handleUbahStatus = (orderId: number, statusBaru: 'pending' | 'success' | 'failed') => {
    // Menjalankan proses asinkronus pengubahan status di dalam blok startTransition
    startTransition(async () => {
      // Memanggil Server Action untuk memperbarui kolom status di database
      const res = await updateStatusPesanan(orderId, statusBaru);
      // Jika pembaruan data di database berhasil
      if (res.success) {
        // Update state lokal agar UI berubah secara instan tanpa perlu memuat ulang (refresh) halaman
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status_pembayaran: statusBaru } : o));
      }
    });
  };

  // Helper styling warna kelas CSS Tailwind untuk badge indikator status pembayaran
  const getStatusBadge = (status: string) => {
    switch (status) {
      // Warna redup untuk status pembayaran yang sudah sukses/berhasil
      case 'success':
        return 'border-zinc-800 text-zinc-300 bg-zinc-900/40';
      // Warna sangat gelap untuk status pembayaran yang gagal/batal
      case 'failed':
        return 'border-zinc-900 text-zinc-600 bg-black';
      // Warna netral (default) untuk status yang masih tertunda (pending)
      default:
        return 'border-zinc-800 text-zinc-400 bg-zinc-950';
    }
  };

  return (
    <div className="space-y-4">
      {/* Melakukan mapping/perulangan untuk merender setiap objek di dalam array orders */}
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
                {/* Menampilkan ID unik pesanan */}
                <span className="text-sm font-semibold text-white tracking-tight">
                  #{order.id}
                </span>
                {/* Menampilkan label teks status dengan skema warna dari fungsi getStatusBadge */}
                <span className={`text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 border rounded ${getStatusBadge(order.status_pembayaran)}`}>
                  {order.status_pembayaran}
                </span>
              </div>
              {/* Memformat string tanggal pembuatan pesanan menjadi format lokal Indonesia (id-ID) */}
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
                {/* Memformat nilai angka harga ke format mata uang lokal dengan pemisah ribuan */}
                <p className="text-sm font-bold text-white tracking-tight">
                  Rp {Number(order.total_harga).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Dropdown Pilihan Ubah Status */}
                {/* Dropdown dikunci (disabled) ketika proses transisi Server Action sedang berjalan */}
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
                {/* Mengubah warna tombol secara dinamis bergantung apakah detail pesanan sedang aktif dibuka */}
                <button
                  onClick={() => handleToggleDetail(order.id)}
                  className={`p-2 border rounded transition ${
                    activeDetail === order.id 
                      ? 'bg-white border-white text-black' 
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                  title="Lihat Detail Produk"
                >
                  {/* Efek animasi rotasi ikon panah 180 derajat ke atas saat detail pesanan terbuka */}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDetail === order.id ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* AREA EXPANDABLE: DETAIL ITEM DI DALAM PESANAN */}
          {/* Komponen kontainer detail item hanya akan dirender ke layar jika ID pesanan ini sesuai dengan state activeDetail */}
          {activeDetail === order.id && (
            <div className="border-t border-zinc-900/80 bg-zinc-950 px-5 py-4 space-y-3">
              <h4 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Item Rincian Pesanan</h4>
              
              {/* Logika kondisional: Menampilkan animasi teks jika state loadingDetail bernilai true */}
              {loadingDetail ? (
                <p className="text-xs text-zinc-600 animate-pulse py-2">Memuat item...</p>
              ) : itemsDetail.length > 0 ? (
                // Merender daftar item produk jika data sukses dimuat dan jumlahnya lebih dari 0
                <div className="divide-y divide-zinc-900/40">
                  {itemsDetail.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2.5 text-xs">
                      <div className="min-w-0 pr-4">
                        {/* Nama Produk dengan proteksi teks terlalu panjang (truncate) */}
                        <p className="text-zinc-300 font-medium truncate">{item.nama_produk}</p>
                        {/* Menampilkan rincian harga per unit produk dikali kuantitas pembelian */}
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Rp {Number(item.harga_saat_ini).toLocaleString('id-ID')} x {item.kuantitas}
                        </p>
                      </div>
                      {/* Menampilkan total harga akumulasi (harga dikali kuantitas) untuk item tersebut */}
                      <span className="text-zinc-400 font-medium shrink-0">
                        Rp {(Number(item.harga_saat_ini) * item.kuantitas).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                // Menampilkan pesan fallback jika data item gagal dijangkau atau kosong dari server
                <p className="text-xs text-zinc-600 py-1">Gagal mengambil item detail.</p>
              )}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}