'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, X, Plus, Minus } from 'lucide-react';
import { tambahKeKeranjangAction } from './keranjang';

interface TombolKeranjangModalProps {
  produkId: number;
  namaProduk: string;
  stokTersedia: number;
}

export default function TombolKeranjangModal({ produkId, namaProduk, stokTersedia }: TombolKeranjangModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [kuantitas, setKuantitas] = useState(1);
  const [errorPesan, setErrorPesan] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      setKuantitas(1);
      setErrorPesan('');
    }
  }, [isOpen]);

  const handleKuantitasChange = (tipe: 'tambah' | 'kurang') => {
    setErrorPesan('');
    if (tipe === 'tambah') {
      if (kuantitas < stokTersedia) setKuantitas(kuantitas + 1);
      else setErrorPesan('Mencapai batas stok yang tersedia');
    } else {
      if (kuantitas > 1) setKuantitas(kuantitas - 1);
    }
  };

  const handleKonfirmasiKeranjang = () => {
    setErrorPesan('');
    
    startTransition(async () => {
      const res = await tambahKeKeranjangAction({ produkId, kuantitas });
      
      if (res.success) {
        setIsOpen(false);
        router.push('/keranjang');
      } else {
        setErrorPesan(res.message);
      }
    });
  };

  return (
    <>
      {/* TOMBOL TRIGGER (OUTLINED STYLE) */}
      <button
        onClick={() => stokTersedia > 0 && setIsOpen(true)}
        disabled={stokTersedia <= 0}
        className="w-full flex items-center justify-center gap-2 bg-transparent border border-zinc-800 text-zinc-300 py-2.5 px-4 rounded-md text-xs font-semibold tracking-wider uppercase transition duration-200 hover:bg-zinc-900 hover:text-white active:scale-[0.99] disabled:border-zinc-950 disabled:text-zinc-700 disabled:cursor-not-allowed"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        {stokTersedia > 0 ? 'Tambah ke Keranjang' : 'Habis'}
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          {/* KONTEN MODAL */}
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-medium">Atur Jumlah Item</span>
              <h3 className="text-base font-semibold text-white mt-1 truncate">{namaProduk}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Stok tersedia: {stokTersedia} unit</p>
            </div>

            {errorPesan && (
              <div className="mb-4 p-2.5 bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 rounded tracking-wide">
                {errorPesan}
              </div>
            )}

            {/* PENGATUR KUANTITAS */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-md p-2 mb-6">
              <button
                type="button"
                disabled={kuantitas <= 1 || isPending}
                onClick={() => handleKuantitasChange('kurang')}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="text-sm font-bold text-white w-12 text-center select-none">
                {kuantitas}
              </span>

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
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white py-2.5 rounded-md text-xs font-medium tracking-wide transition"
              >
                Batal
              </button>
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