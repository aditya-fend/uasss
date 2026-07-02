import { sql } from '../Adi/db';
import ClientKeranjangActions from './ClientKeranjangActions';

interface ItemKeranjang {
  id: number;
  produk_id: number;
  nama: string;
  harga: number;
  kuantitas: number;
  asal_negara: string;
}

export default async function HalamanKeranjang() {
  // Ambil isi keranjang dengan teknik JOIN ke tabel produk
  const dataKeranjang = await sql`
    SELECT 
      k.id, 
      k.produk_id, 
      p.nama, 
      p.harga, 
      k.kuantitas, 
      p.asal_negara
    FROM keranjang k
    JOIN produk p ON k.produk_id = p.id
    ORDER BY k.created_at DESC
  ` as ItemKeranjang[];

  // Hitung total ringkasan belanja
  const subTotal = dataKeranjang.reduce((acc, item) => acc + (Number(item.harga) * item.kuantitas), 0);

  return (
    <main className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="border-b border-zinc-900 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white uppercase">Keranjang Belanja</h1>
        <p className="text-xs text-zinc-500 mt-1">Kelola item pilihan Anda sebelum melakukan pembayaran.</p>
      </div>

      {dataKeranjang.length === 0 ? (
        /* KONDISI KERANJANG KOSONG */
        <div className="w-full text-center py-24 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/30">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">Keranjang Anda Kosong</p>
          <p className="text-[11px] text-zinc-500 mt-1">Silakan pilih produk menarik di halaman katalog utama.</p>
        </div>
      ) : (
        /* AREA KONTEN KERANJANG */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LIST ITEM (KIRI) */}
          <div className="lg:col-span-2 space-y-4">
            {dataKeranjang.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-5 bg-zinc-950 border border-zinc-900 rounded-xl gap-4"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {item.asal_negara}
                  </span>
                  <h3 className="text-sm font-medium text-zinc-200 mt-2 truncate">{item.nama}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Rp {Number(item.harga).toLocaleString('id-ID')} x {item.kuantitas}
                  </p>
                </div>

                {/* Harga Sub-Total Per Item & Tombol Tindakan */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="text-sm font-semibold text-white">
                    Rp {(Number(item.harga) * item.kuantitas).toLocaleString('id-ID')}
                  </span>
                  
                  {/* Komponen Client untuk aksi hapus */}
                  <ClientKeranjangActions mode="hapus" idTarget={item.id} />
                </div>
              </div>
            ))}
          </div>

          {/* RINGKASAN TOTAL & CHECKOUT (KANAN) */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6 sticky top-6">
            <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Ringkasan Transaksi</h2>
            
            <div className="space-y-3 border-t border-b border-zinc-900 py-4">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Total Item</span>
                <span className="text-zinc-200">{dataKeranjang.reduce((sum, i) => sum + i.kuantitas, 0)} unit</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs font-medium text-white">Total Harga</span>
                <span className="text-lg font-bold text-white tracking-tight">
                  Rp {subTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Komponen Client untuk aksi Checkout massal */}
            <ClientKeranjangActions mode="checkout" />
          </div>

        </div>
      )}
    </main>
  );
}