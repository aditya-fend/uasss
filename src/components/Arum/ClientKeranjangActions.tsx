// Menandakan bahwa file ini berjalan di sisi client (browser) agar bisa menangani interaksi pengguna dan state UI
'use client';

// Mengimpor hook untuk memantau transisi asinkronus dan mengelola state lokal dari React
import { useTransition, useState } from 'react';
// Mengimpor hook useRouter untuk melakukan navigasi halaman di lingkungan Next.js App Router
import { useRouter } from 'next/navigation';
// Mengimpor ikon tempat sampah (Trash2) dari library lucide-react untuk UI tombol hapus
import { Trash2 } from 'lucide-react';
// Mengimpor fungsi Server Actions untuk menghapus item keranjang dan memproses checkout massal di database
import { hapusItemKeranjang, prosesCheckoutKeranjang } from './keranjang';

// Mendefinisikan struktur data (interface) properti yang diterima oleh komponen ini
interface ClientActionsProps {
  mode: 'hapus' | 'checkout';
  idTarget?: number;
}

// Komponen multifungsi untuk menangani aksi hapus item maupun tombol checkout utama keranjang belanja
export default function ClientKeranjangActions({ mode, idTarget }: ClientActionsProps) {
  // Inisialisasi router untuk keperluan pengalihan halaman secara programatik
  const router = useRouter();
  // useTransition digunakan untuk melacak status pemrosesan Server Action tanpa memblokir interaksi UI
  const [isPending, startTransition] = useTransition();
  // State untuk menyimpan dan menampilkan pesan error jika proses checkout mengalami kegagalan
  const [errPesan, setErrPesan] = useState('');

  // Penanganan Hapus Item tunggal
  const handleHapus = () => {
    // Memastikan ID item target ada sebelum mengeksekusi fungsi penghapusan
    if (!idTarget) return;
    // Membungkus Server Action hapus dalam startTransition agar status isPending terpantau
    startTransition(async () => {
      // Memanggil fungsi server untuk menghapus item spesifik berdasarkan ID keranjang
      await hapusItemKeranjang(idTarget);
    });
  };

  // Penanganan Checkout Keranjang masal
  const handleCheckout = () => {
    // Membersihkan pesan error sisa proses sebelumnya
    setErrPesan('');
    // Membungkus Server Action checkout dalam startTransition untuk mengaktifkan status loading UI
    startTransition(async () => {
      // Memanggil fungsi server untuk mengonversi seluruh isi keranjang menjadi transaksi pesanan baru
      const res = await prosesCheckoutKeranjang();
      // Memeriksa apakah transaksi sukses diproses oleh server database
      if (res.success) {
        // Alihkan otomatis ke riwayat pesanan setelah checkout sukses
        router.push('/pesanan');
      } else {
        // Menyimpan pesan kesalahan dari server ke dalam state lokal untuk ditampilkan ke pengguna
        setErrPesan(res.message);
      }
    });
  };

  // Kondisi pencabangan UI: Jika komponen ini dipanggil dengan mode 'hapus'
  if (mode === 'hapus') {
    return (
      // Merender tombol ikon tempat sampah yang dikunci (disabled) ketika proses hapus sedang berlangsung
      <button
        onClick={handleHapus}
        disabled={isPending}
        className="text-zinc-600 hover:text-rose-500 transition disabled:opacity-30"
        title="Hapus dari keranjang"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  }

  // Desain UI default (jika mode bukan 'hapus', melainkan mode 'checkout')
  return (
    <div className="space-y-3">
      {/* Hanya memunculkan paragraf pesan error jika string di dalam state errPesan tidak kosong */}
      {errPesan && (
        <p className="text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 p-2 rounded tracking-wide">
          {errPesan}
        </p>
      )}
      {/* Tombol eksekusi Checkout utama: Teks tombol berubah dinamis dan tombol dikunci otomatis saat isPending bernilai true */}
      <button
        onClick={handleCheckout}
        disabled={isPending}
        className="w-full bg-white text-black py-3 rounded-md text-xs font-semibold tracking-wider uppercase transition duration-200 hover:bg-zinc-200 active:scale-[0.99] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed"
      >
        {isPending ? 'Memproses Checkout...' : 'Lanjutkan ke Checkout'}
      </button>
    </div>
  );
}