// Mengimpor instance koneksi database (sql) dari folder konfigurasi database milik Adi
import { sql } from "@/components/Adi/db";
// Mengimpor komponen client modal tambah keranjang belanja dari folder komponen milik Arum
import TombolKeranjangModal from "@/components/Arum/TombolKeranjangModal";
// Mengimpor komponen client modal beli instan dari folder komponen milik Nanad
import TombolBeliModal from "@/components/Nanad/TombolBeliModal";

// Interface untuk memastikan tipe data objek produk yang diterima dari database agar sesuai standar TypeScript
interface Produk {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  asal_negara: string;
}

// Komponen Server Component asinkronus utama untuk merender dan menyajikan halaman katalog produk
export default async function HalamanKatalog() {
  // Mengambil data produk terbaru langsung dari database Neon
  // Menjalankan query SQL SELECT untuk memuat data properti produk terdaftar dan diurutkan berdasarkan ID terbesar (terbaru)
  const dataProduk = await sql`
    SELECT id, nama, harga, stok, asal_negara 
    FROM produk 
    ORDER BY id DESC
  ` as Produk[];

  return (
    // Kontainer pembungkus utama halaman katalog dengan efek animasi transisi pudar (fade-in) bawaan Tailwind Animate
    <main className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER HALAMAN */}
      {/* Area tata letak judul katalog yang otomatis berganti orientasi dari kolom (mobile) menjadi baris (desktop) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          {/* Judul utama halaman */}
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            Katalog Produk
          </h1>
          {/* Teks sub-judul penjelasan singkat fungsi halaman */}
          <p className="text-xs text-zinc-500 mt-1">
            Menampilkan daftar komoditas global eksklusif yang tersedia.
          </p>
        </div>
        {/* Kotak indikator statis untuk menginformasikan jumlah total item produk yang berhasil di-load dari database */}
        <div className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-md self-start md:self-auto">
          Total: <span className="text-white font-semibold">{dataProduk.length}</span> Produk
        </div>
      </div>

      {/* KONDISI JIKA PRODUK KOSONG */}
      {/* Logika evaluasi kondisional: Jika array dataProduk bernilai kosong (0) */}
      {dataProduk.length === 0 ? (
        // Menampilkan kotak placeholder visual pemberitahuan jika katalog di database belum memiliki data
        <div className="w-full text-center py-24 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/30">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">
            Belum ada produk terdaftar
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Silakan menuju ke halaman Tambah Produk untuk mengisi katalog belanja.
          </p>
        </div>
      ) : (
        // Jalur alternatif (fallback else): Merender grid responsif jika dataProduk berisi minimal 1 item produk
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Melakukan iterasi perulangan pada array dataProduk menggunakan method map */}
          {dataProduk.map((produk) => (
            <div 
              key={produk.id} 
              className="group bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between shadow-lg transition-all duration-300 hover:border-zinc-800"
            >
              {/* Bagian Atas: Info Produk */}
              <div>
                {/* Baris penanda identitas: Memisahkan label asal negara (kiri) dan status kuantitas stok barang (kanan) */}
                <div className="flex items-center justify-between gap-2">
                  {/* Badge teks kecil kapital untuk memperlihatkan negara produksi barang */}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800/60">
                    {produk.asal_negara}
                  </span>
                  {/* Label teks stok: Berwarna abu-abu jika stok tersedia, dan merah menyala jika stok habis (0) */}
                  <span className={`text-[10px] tracking-wide ${produk.stok > 0 ? 'text-zinc-500' : 'text-rose-900 font-medium'}`}>
                    {produk.stok > 0 ? `Stok: ${produk.stok}` : 'Habis'}
                  </span>
                </div>

                {/* Judul Nama Produk dengan efek interaksi hover warna teks dan pemotong string otomatis (truncate) */}
                <h2 className="text-sm font-medium text-zinc-200 mt-4 tracking-wide group-hover:text-white transition-colors truncate" title={produk.nama}>
                  {produk.nama}
                </h2>
                
                {/* Label nominal harga produk yang diformat ke sistem angka mata uang lokal Indonesia */}
                <p className="text-base font-bold text-white mt-1.5 tracking-tight">
                  Rp {Number(produk.harga).toLocaleString('id-ID')}
                </p>
              </div>
              
              {/* Bagian Bawah: Tombol Transaksi Ganda */}
              {/* Area layout pembungkus tombol aksi yang dibatasi garis pemisah transparan border-t */}
              <div className="mt-6 pt-4 border-t border-zinc-900/50 space-y-2">
                {/* 1. Tombol Beli Instan (Warna Putih Solid) */}
                {/* Merender komponen modal checkout milik Nanad dengan menyuplai data properti produk terkait */}
                <TombolBeliModal 
                  produkId={produk.id} 
                  namaProduk={produk.nama} 
                  stokTersedia={produk.stok} 
                />
                
                {/* 2. Tombol Tambah Keranjang (Warna Transparan Berbingkai) */}
                {/* Merender komponen modal tambah keranjang milik Arum dengan menyuplai data properti produk terkait */}
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