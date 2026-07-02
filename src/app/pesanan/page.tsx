import { sql } from "@/components/Adi/db";
import DaftarPesananClient from "@/components/Nanad/DaftarPesananClient";

// Interface mencocokkan skema database pesanan kamu
interface OrderData {
  id: number;
  total_harga: number;
  status_pembayaran: 'pending' | 'success' | 'failed';
  created_at: Date;
}

export default async function HalamanPesanan() {
  // Ambil semua data pesanan terbaru dari database Neon
  const orders = await sql`
    SELECT id, total_harga, status_pembayaran, created_at 
    FROM pesanan 
    ORDER BY created_at DESC
  ` as OrderData[];

  return (
    <main className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER HALAMAN */}
      <div className="border-b border-zinc-900 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white uppercase">Riwayat Pesanan</h1>
        <p className="text-xs text-zinc-500 mt-1">Daftar rekaman seluruh transaksi masuk beserta status pembayaran.</p>
      </div>

      {orders.length === 0 ? (
        /* KONDISI JIKA BELUM ADA PESANAN */
        <div className="w-full text-center py-24 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/30">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">Belum Ada Transaksi</p>
          <p className="text-[11px] text-zinc-500 mt-1">Pesanan baru akan muncul di sini setelah proses checkout berhasil dilakukan.</p>
        </div>
      ) : (
        /* DAFTAR PESANAN INTERAKTIF (CLIENT COMPONENT) */
        <DaftarPesananClient initialOrders={JSON.parse(JSON.stringify(orders))} />
      )}

    </main>
  );
}