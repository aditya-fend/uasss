// Menandakan bahwa file ini adalah Client Component yang dieksekusi di sisi browser (mendukung state dan efek)
'use client';

// Mengimpor React Hooks yang dibutuhkan untuk manajemen state, transisi, efek samping, dan referensi elemen
import { useState, useTransition, useEffect, useRef } from 'react';
// Mengimpor hook untuk melakukan navigasi halaman di Next.js App Router
import { useRouter } from 'next/navigation';
// Mengimpor ikon-ikon dari library lucide-react untuk kebutuhan UI
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
// Mengimpor fungsi Server Action untuk memproses pembelian langsung ke database
import { beliLangsungAction } from './pesanan';

// Mendefinisikan interface props yang harus diterima oleh komponen TombolBeliModal
interface TombolBeliModalProps {
  produkId: number;
  namaProduk: string;
  stokTersedia: number;
}

// Komponen utama untuk menampilkan tombol beli dan modal konfirmasi pembelian
export default function TombolBeliModal({ produkId, namaProduk, stokTersedia }: TombolBeliModalProps) {
  // Inisialisasi router untuk navigasi antar halaman
  const router = useRouter();
  // State untuk mengontrol visibilitas modal (terbuka atau tertutup)
  const [isOpen, setIsOpen] = useState(false);
  // State untuk melacak jumlah item yang ingin dibeli, default bernilai 1
  const [kuantitas, setKuantitas] = useState(1);
  // State untuk menyimpan dan menampilkan pesan error jika validasi gagal
  const [errorPesan, setErrorPesan] = useState('');
  // useTransition digunakan untuk menangani proses asinkronus (Server Action) tanpa memblokir UI utama
  const [isPending, startTransition] = useTransition();
  // Referensi DOM untuk elemen kontainer modal (bisa digunakan untuk deteksi klik di luar modal)
  const modalRef = useRef<HTMLDivElement>(null);

  // Efek samping untuk mereset jumlah kuantitas dan pesan error setiap kali modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setKuantitas(1);
      setErrorPesan('');
    }
  }, [isOpen]);

  // Efek samping untuk menutup modal secara otomatis ketika pengguna menekan tombol 'Escape' di keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Fungsi untuk menambah atau mengurangi jumlah kuantitas pembelian
  const handleKuantitasChange = (tipe: 'tambah' | 'kurang') => {
    // Menghapus pesan error yang ada sebelum melakukan kalkulasi baru
    setErrorPesan('');
    if (tipe === 'tambah') {
      // Menambah kuantitas jika masih di bawah batas stok yang tersedia
      if (kuantitas < stokTersedia) setKuantitas(kuantitas + 1);
      // Menampilkan pesan error jika user mencoba menambah melebihi stok produk
      else setErrorPesan('Mencapai batas stok yang tersedia');
    } else {
      // Mengurangi kuantitas dengan batas minimal 1 item
      if (kuantitas > 1) setKuantitas(kuantitas - 1);
    }
  };

  // Fungsi untuk mengeksekusi pembelian saat user menekan tombol 'Checkout'
  const handleKonfirmasiBeli = () => {
    // Membersihkan pesan error terdahulu
    setErrorPesan('');
    
    // Menjalankan proses Server Action di dalam startTransition agar status pending terpantau
    startTransition(async () => {
      const res = await beliLangsungAction({ produkId, kuantitas });
      
      // Memeriksa apakah transaksi di sisi server berhasil
      if (res.success) {
        // Menutup modal konfirmasi jika sukses
        setIsOpen(false);
        // Mengarahkan pengguna langsung ke halaman daftar pesanan
        router.push('/pesanan');
      } else {
        // Menampilkan pesan error dari server ke dalam state jika gagal
        setErrorPesan(res.message);
      }
    });
  };

  return (
    <>
      {/* TOMBOL TRIGGER UTAMA */}
      {/* Tombol akan terbuka jika stok > 0, dan dinonaktifkan (disabled) jika stok habis */}
      <button
        onClick={() => stokTersedia > 0 && setIsOpen(true)}
        disabled={stokTersedia <= 0}
        className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 px-4 rounded-md text-xs font-semibold tracking-wider uppercase transition duration-200 hover:bg-zinc-200 active:scale-[0.99] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        {stokTersedia > 0 ? 'Beli Sekarang' : 'Stok Habis'}
      </button>

      {/* MODAL OVERLAY */}
      {/* Hanya merender elemen modal ke DOM jika state isOpen bernilai true */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          {/* KONTEN MODAL */}
          {/* Mengaitkan elemen div dengan modalRef */}
          <div 
            ref={modalRef}
            className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative"
          >
            {/* Tombol Tutup Silang */}
            {/* Berfungsi untuk menutup modal secara instan ketika diklik */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Modal */}
            <div className="mb-6">
              <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-medium">Konfirmasi Pembelian</span>
              <h3 className="text-base font-semibold text-white mt-1 truncate">{namaProduk}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Sisa stok: {stokTersedia} unit</p>
            </div>

            {/* Error Message */}
            {/* Hanya memunculkan kotak pesan error jika string errorPesan tidak kosong */}
            {errorPesan && (
              <div className="mb-4 p-2.5 bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 rounded tracking-wide">
                {errorPesan}
              </div>
            )}

            {/* PENGATUR KUANTITAS */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-md p-2 mb-6">
              {/* Tombol Kurang: Dikunci jika kuantitas bernilai 1 atau sedang memproses transaksi */}
              <button
                type="button"
                disabled={kuantitas <= 1 || isPending}
                onClick={() => handleKuantitasChange('kurang')}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              {/* Menampilkan angka kuantitas terkini yang dipilih pengguna */}
              <span className="text-sm font-bold text-white w-12 text-center select-none">
                {kuantitas}
              </span>

              {/* Tombol Tambah: Dikunci jika kuantitas menyentuh batas stok atau sedang memproses transaksi */}
              <button
                type="button"
                disabled={kuantitas >= stokTersedia || isPending}
                onClick={() => handleKuantitasChange('tambah')}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* TOMBOL AKSI */}
            <div className="flex gap-3">
              {/* Tombol Batal: Mengembalikan state isOpen ke false dan dikunci saat proses loading */}
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white py-2.5 rounded-md text-xs font-medium tracking-wide transition"
              >
                Batal
              </button>
              {/* Tombol Checkout: Memicu fungsi handleKonfirmasiBeli dan menampilkan indikator loading saat isPending true */}
              <button
                type="button"
                disabled={isPending}
                onClick={handleKonfirmasiBeli}
                className="flex-1 bg-white text-black hover:bg-zinc-200 py-2.5 rounded-md text-xs font-semibold tracking-wide uppercase transition disabled:bg-zinc-800 disabled:text-zinc-600"
              >
                {isPending ? 'Memproses...' : 'Checkout'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}