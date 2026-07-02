import { sql } from "@/components/Adi/db";
import TombolKeranjangModal from "@/components/Arum/TombolKeranjangModal";
import TombolBeliModal from "@/components/Nanad/TombolBeliModal";

// Interface untuk memastikan tipe data objek produk dari database
interface Produk {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  asal_negara: string;
}

export default async function HalamanKatalog() {
  // Mengambil data produk terbaru langsung dari database Neon
  const dataProduk = await sql`
    SELECT id, nama, harga, stok, asal_negara 
    FROM produk 
    ORDER BY id DESC
  ` as Produk[];

  return (
    <main className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            Katalog Produk
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Menampilkan daftar komoditas global eksklusif yang tersedia.
          </p>
        </div>
        <div className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-md self-start md:self-auto">
          Total: <span className="text-white font-semibold">{dataProduk.length}</span> Produk
        </div>
      </div>

      {/* KONDISI JIKA PRODUK KOSONG */}
      {dataProduk.length === 0 ? (
        <div className="w-full text-center py-24 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/30">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">
            Belum ada produk terdaftar
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Silakan menuju ke halaman Tambah Produk untuk mengisi katalog belanja.
          </p>
        </div>
      ) : (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataProduk.map((produk) => (
            <div 
              key={produk.id} 
              className="group bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between shadow-lg transition-all duration-300 hover:border-zinc-800"
            >
              {/* Bagian Atas: Info Produk */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800/60">
                    {produk.asal_negara}
                  </span>
                  <span className={`text-[10px] tracking-wide ${produk.stok > 0 ? 'text-zinc-500' : 'text-rose-900 font-medium'}`}>
                    {produk.stok > 0 ? `Stok: ${produk.stok}` : 'Habis'}
                  </span>
                </div>

                <h2 className="text-sm font-medium text-zinc-200 mt-4 tracking-wide group-hover:text-white transition-colors truncate" title={produk.nama}>
                  {produk.nama}
                </h2>
                
                <p className="text-base font-bold text-white mt-1.5 tracking-tight">
                  Rp {Number(produk.harga).toLocaleString('id-ID')}
                </p>
              </div>
              
              {/* Bagian Bawah: Tombol Transaksi Ganda */}
              <div className="mt-6 pt-4 border-t border-zinc-900/50 space-y-2">
                {/* 1. Tombol Beli Instan (Warna Putih Solid) */}
                <TombolBeliModal 
                  produkId={produk.id} 
                  namaProduk={produk.nama} 
                  stokTersedia={produk.stok} 
                />
                
                {/* 2. Tombol Tambah Keranjang (Warna Transparan Berbingkai) */}
                <TombolKeranjangModal 
                  produkId={produk.id} 
                  namaProduk={produk.nama} 
                  stokTersedia={produk.stok} 
                />
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  );
}