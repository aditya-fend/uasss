'use client';

import { useState, useTransition } from 'react';
import { createProduk } from './produk';
import CountrySelect from './CountryDropdown';

export default function AddProductPage() {
  const [isPending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<{ status: 'sukses' | 'gagal' | null; teks: string }>({
    status: null,
    teks: '',
  });

  const [form, setForm] = useState({
    nama: '',
    harga: '',
    stok: '',
    asal_negara: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPesan({ status: null, teks: '' });

    if (!form.asal_negara) {
      setPesan({ status: 'gagal', teks: 'Silakan pilih asal negara terlebih dahulu.' });
      return;
    }

    startTransition(async () => {
      const res = await createProduk({
        nama: form.nama,
        harga: parseFloat(form.harga),
        stok: parseInt(form.stok) || 0,
        asal_negara: form.asal_negara,
      });

      if (res.success) {
        setPesan({ status: 'sukses', teks: res.message });
        setForm({ nama: '', harga: '', stok: '', asal_negara: '' }); // Reset form
      } else {
        setPesan({ status: 'gagal', teks: res.message });
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">Tambah Produk</h2>
        <p className="text-xs text-zinc-500 mt-1">Masukkan informasi detail produk baru Anda.</p>
      </div>

      {/* Notifikasi Status */}
      {pesan.status && (
        <div
          className={`p-3 mb-6 rounded text-xs tracking-wide transition-all border ${
            pesan.status === 'sukses'
              ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}
        >
          {pesan.teks}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Produk */}
        <div>
          <label className="block text-xs font-medium tracking-wider text-zinc-400 uppercase mb-2">
            Nama Produk
          </label>
          <input
            type="text"
            required
            disabled={isPending}
            placeholder="e.g. Mechanical Keyboard G68"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-200 placeholder-zinc-700 transition duration-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
        </div>

        {/* Harga & Stok (Grid) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium tracking-wider text-zinc-400 uppercase mb-2">
              Harga (IDR)
            </label>
            <input
              type="number"
              required
              disabled={isPending}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-200 placeholder-zinc-700 transition duration-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium tracking-wider text-zinc-400 uppercase mb-2">
              Jumlah Stok
            </label>
            <input
              type="number"
              required
              disabled={isPending}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-200 placeholder-zinc-700 transition duration-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: e.target.value })}
            />
          </div>
        </div>

        {/* Asal Negara (CountrySelect) */}
        <div>
          <CountrySelect
            selectedValue={form.asal_negara}
            onSelect={(negara) => setForm({ ...form, asal_negara: negara })}
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 bg-white text-black py-3 rounded-md text-sm font-medium tracking-wide transition duration-200 hover:bg-zinc-200 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPending ? 'MENGIRIM...' : 'SIMPAN PRODUK'}
        </button>
      </form>
    </div>
  );
}