'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { hapusItemKeranjang, prosesCheckoutKeranjang } from './keranjang';

interface ClientActionsProps {
  mode: 'hapus' | 'checkout';
  idTarget?: number;
}

export default function ClientKeranjangActions({ mode, idTarget }: ClientActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errPesan, setErrPesan] = useState('');

  // Penanganan Hapus Item tunggal
  const handleHapus = () => {
    if (!idTarget) return;
    startTransition(async () => {
      await hapusItemKeranjang(idTarget);
    });
  };

  // Penanganan Checkout Keranjang masal
  const handleCheckout = () => {
    setErrPesan('');
    startTransition(async () => {
      const res = await prosesCheckoutKeranjang();
      if (res.success) {
        // Alihkan otomatis ke riwayat pesanan setelah checkout sukses
        router.push('/pesanan');
      } else {
        setErrPesan(res.message);
      }
    });
  };

  if (mode === 'hapus') {
    return (
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

  return (
    <div className="space-y-3">
      {errPesan && (
        <p className="text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 p-2 rounded tracking-wide">
          {errPesan}
        </p>
      )}
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