// Menandakan bahwa file ini berjalan di sisi client (browser) agar bisa berinteraksi dengan state dan efek browser
'use client';

// Mengimpor React Hooks yang diperlukan untuk mengelola state lokal, transisi status, dan efek samping komponen
import { useState, useTransition, useEffect } from 'react';
// Mengimpor hook useRouter untuk memicu perpindahan/navigasi halaman secara dinamis di Next.js
import { useRouter } from 'next/navigation';
// Mengimpor komponen ikon dari lucide-react untuk melengkapi kebutuhan visual UI tombol
import { PlusCircle, X, Plus, Minus } from 'lucide-react';
// Mengimpor fungsi Server Action untuk mendaftarkan barang baru ke dalam database tabel keranjang
import { tambahKeKeranjangAction } from './keranjang';

// Mendefinisikan tipe data (interface) untuk properti (props) yang diterima oleh komponen ini
interface TombolKeranjangModalProps {
  produkId: number;
  namaProduk: string;
  stokTersedia: number;
}

// Komponen utama untuk tombol tambah ke keranjang yang memicu modal pengaturan kuantitas barang
export default function TombolKeranjangModal({ produkId, namaProduk, stokTersedia }: TombolKeranjangModalProps) {
  // Inisialisasi router untuk kebutuhan navigasi halaman programatik
  const router = useRouter();
  // State bolean untuk mengontrol tampilan visibilitas modal (terbuka atau tertutup)
  const [isOpen, setIsOpen] = useState(false);
  // State untuk melacak jumlah kuantitas barang yang ingin ditambahkan (default awal bernilai 1)
  const [kuantitas, setKuantitas] = useState(1);
  // State string untuk menampung pesan kesalahan jika proses validasi gagal terpenuhi
  const [errorPesan, setErrorPesan] = useState('');
  // useTransition digunakan agar status pemrosesan asinkronus Server Action terpantau tanpa mengunci UI utama
  const [isPending, startTransition] = useTransition();

  // Efek samping untuk mereset kuantitas menjadi 1 dan membersihkan pesan error setiap kali modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setKuantitas(1);
      setErrorPesan('');
    }
  }, [isOpen]);

  // Fungsi untuk menambah atau mengurangi nilai kuantitas item produk di dalam modal
  const handleKuantitasChange = (tipe: 'tambah' | 'kurang') => {
    // Menghapus pesan error yang sedang aktif sebelum kalkulasi baru berjalan
    setErrorPesan('');
    if (tipe === 'tambah') {
      // Menaikkan kuantitas hanya jika jumlahnya masih berada di bawah batas stok tersedia
      if (kuantitas < stokTersedia) setKuantitas(kuantitas + 1);
      // Menampilkan pesan peringatan jika user mencoba menambah item melebihi kapasitas stok gudang
      else setErrorPesan('Mencapai batas stok yang tersedia');
    } else {
      // Mengurangi jumlah kuantitas dengan batas minimal 1 item produk
      if (kuantitas > 1) setKuantitas(kuantitas - 1);
    }
  };

  // Fungsi untuk memproses dan mengirimkan data kuantitas produk terpilih ke sisi server
  const handleKonfirmasiKeranjang = () => {
    // Menghapus pesan error sisa proses sebelumnya
    setErrorPesan('');
    
    // Membungkus aksi asinkronus ke dalam startTransition agar status isPending berubah jadi true sewaktu proses berjalan
    startTransition(async () => {
      const res = await tambahKeKeranjangAction({ produkId, kuantitas });
      
      // Mengecek apakah operasi tambah item berhasil di sisi server database
      if (res.success) {
        // Menutup jendela modal jika sukses
        setIsOpen(false);
        // Mengarahkan rute browser pengguna langsung ke halaman daftar keranjang belanja
        router.push('/keranjang');
      } else {
        // Menyimpan pesan error kegagalan dari server ke state lokal untuk ditampilkan di UI
        setErrorPesan(res.message);
      }
    });
  };

  return (
    <>
      {/* TOMBOL TRIGGER (OUTLINED STYLE) */}
      {/* Tombol memicu modal jika stok > 0, dan dikunci secara permanen (disabled) jika stok barang habis */}
      <button
        onClick={() => stokTersedia > 0 && setIsOpen(true)}
        disabled={stokTersedia <= 0}
        className="w-full flex items-center justify-center gap-2 bg-transparent border border-zinc-800 text-zinc-300 py-2.5 px-4 rounded-md text-xs font-semibold tracking-wider uppercase transition duration-200 hover:bg-zinc-900 hover:text-white active:scale-[0.99] disabled:border-zinc-950 disabled:text-zinc-700 disabled:cursor-not-allowed"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        {stokTersedia > 0 ? 'Tambah ke Keranjang' : 'Habis'}
      </button>

      {/* MODAL OVERLAY */}
      {/* Merender seluruh backdrop modal ke dalam DOM hanya jika state isOpen bernilai true */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          {/* KONTEN MODAL */}
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Tombol Silang Pojok Kanan Atas */}
            {/* Berfungsi untuk membatalkan proses dan menutup modal secara instan */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Modal */}
            <div className="mb-6">
              <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-medium">Atur Jumlah Item</span>
              <h3 className="text-base font-semibold text-white mt-1 truncate">{namaProduk}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Stok tersedia: {stokTersedia} unit</p>
            </div>

            {/* Error Message */}
            {/* Kotak pesan ini akan muncul otomatis ke UI jika variabel string errorPesan terisi */}
            {errorPesan && (
              <div className="mb-4 p-2.5 bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 rounded tracking-wide">
                {errorPesan}
              </div>
            )}

            {/* PENGATUR KUANTITAS */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-md p-2 mb-6">
              {/* Tombol Kurang: Dikunci apabila kuantitas menyentuh angka 1 atau ketika server sedang sibuk menyimpan */}
              <button
                type="button"
                disabled={kuantitas <= 1 || isPending}
                onClick={() => handleKuantitasChange('kurang')}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              {/* Menampilkan jumlah kuantitas terkini yang sedang dipilih oleh user */}
              <span className="text-sm font-bold text-white w-12 text-center select-none">
                {kuantitas}
              </span>

              {/* Tombol Tambah: Dikunci apabila kuantitas menyentuh batas stok maksimal atau ketika server sedang sibuk menyimpan */}
              <button
                type="button"
                disabled={kuantitas >= stokTersedia || isPending}
                onClick={() => handleKuantitasChange('tambah')}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* TOMBOL AKSI */}
            <div className="flex gap-3">
              {/* Tombol Batal: Menutup modal secara manual dan dinonaktifkan jika proses transaksi sedang berjalan */}
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white py-2.5 rounded-md text-xs font-medium tracking-wide transition"
              >
                Batal
              </button>
              {/* Tombol Masukkan: Menjalankan submit data dan bertukar teks menjadi 'Menyimpan...' saat isPending bernilai true */}
              <button
                type="button"
                disabled={isPending}
                onClick={handleKonfirmasiKeranjang}
                className="flex-1 bg-white text-black hover:bg-zinc-200 py-2.5 rounded-md text-xs font-semibold tracking-wide uppercase transition disabled:bg-zinc-800 disabled:text-zinc-600"
              >
                {isPending ? 'Menyimpan...' : 'Masukkan'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}