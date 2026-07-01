"use client";

import { useActionState, useState } from "react";
import CountryDropdown from "./CountryDropdown";
import { tambahProdukAction } from "./produk";

export default function AddProductPage() {
  // Mengaitkan Server Action dengan state formulir
  const [state, formAction, isPending] = useActionState(tambahProdukAction, null);
  // State lokal untuk menyimpan negara terpilih dari CountryDropdown
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* HEADER HALAMAN */}
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-2xl font-bold tracking-widest uppercase text-black">
          Tambah Produk baru
        </h1>
        <p className="text-xs tracking-wide text-gray-400 uppercase mt-2">
          Masukkan detail informasi barang untuk katalog toko.
        </p>
      </div>

      {/* FORMULIR UTAMA */}
      <form action={formAction} className="space-y-8">
        
        {/* NOTIFIKASI STATUS */}
        {state && (
          <div 
            className={`text-xs uppercase tracking-widest p-4 rounded-none transition-all duration-300 ${
              state.success 
                ? "bg-black text-white border border-black" 
                : "bg-gray-50 text-gray-500 border border-gray-200"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="space-y-6">
          {/* INPUT: NAMA BARANG */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
              Nama Barang
            </label>
            <input
              type="text"
              name="nama"
              required
              placeholder="CONTOH: ESSENTIAL OVERSIZED T-SHIRT"
              className="w-full bg-white text-sm text-black border border-gray-200 py-3.5 px-4 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-gray-300"
            />
          </div>

          {/* INPUT KEMBAR: HARGA & STOK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Harga (IDR)
              </label>
              <input
                type="number"
                name="harga"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full bg-white text-sm text-black border border-gray-200 py-3.5 px-4 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Jumlah Stok
              </label>
              <input
                type="number"
                name="stok"
                min="0"
                required
                placeholder="0"
                className="w-full bg-white text-sm text-black border border-gray-200 py-3.5 px-4 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* INPUT: ASAL NEGARA (DROPDOWN) */}
          <div className="pt-2">
            <CountryDropdown 
              onSelectCountry={(countryName) => setSelectedCountry(countryName)} 
            />
            {/* Input tersembunyi untuk mengirim nilai negara ke Server Action via FormData */}
            <input 
              type="hidden" 
              name="asal_negara" 
              value={selectedCountry} 
              required 
            />
          </div>
        </div>

        {/* TOMBOL SUBMIT */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isPending || !selectedCountry}
            className="w-full md:w-auto md:px-12 bg-black text-white text-xs font-medium uppercase tracking-widest py-4 hover:bg-gray-900 transition-colors rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Sedang Menyimpan..." : "Simpan Produk"}
          </button>
        </div>

      </form>
    </div>
  );
}