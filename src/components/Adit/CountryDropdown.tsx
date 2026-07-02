'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

// Interface mencocokkan struktur umum API countries.dev
interface Country {
  code: string; // ISO Code (misal: "ID")
  name: string; // Nama Negara (misal: "Indonesia")
  flag?: string; // Emoji atau URL flag jika tersedia
}

interface CountrySelectProps {
  onSelect: (countryName: string) => void;
  selectedValue?: string;
}

export default function CountrySelect({ onSelect, selectedValue = '' }: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(selectedValue);
  const [loading, setLoading] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data dari API ketika komponen pertama kali dimuat
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://countries.dev/countries?region=Asia');
        const data = await res.json();
        
        // Memetakan data agar sesuai interface (menangani variasi response API)
        const formattedData = data.map((c: any) => ({
          code: c.code || c.alpha2 || c.iso2 || '',
          name: c.name?.common || c.name || '',
          flag: c.flag || ''
        })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedData);
      } catch (error) {
        console.error('Gagal memuat data negara:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Menutup dropdown jika klik di luar area komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter negara berdasarkan kolom pencarian
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (countryName: string) => {
    setSelected(countryName);
    onSelect(countryName);
    setIsOpen(false);
    setSearchTerm(''); // Reset pencarian setelah memilih
  };

  return (
    <div className="w-full max-w-xs" ref={dropdownRef}>
      <label className="block text-xs font-medium tracking-wider text-zinc-400 uppercase mb-2">
        Asal Negara (Asia)
      </label>
      
      <div className="relative">
        {/* Tombol Utama / Trigger */}
        <button
          type="button"
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-200 text-left transition-all duration-200 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">
            {loading ? 'Memuat negara...' : selected || 'Pilih negara asal'}
          </span>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-zinc-950 border border-zinc-800 rounded-md shadow-2xl max-h-60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Input Search */}
            <div className="p-2 border-b border-zinc-900 bg-zinc-950/50 sticky top-0 backdrop-blur-md">
              <input
                type="text"
                placeholder="Cari negara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              />
            </div>

            {/* List Item */}
            <ul className="overflow-y-auto flex-1 divide-y divide-zinc-900/30 scrollbar-thin scrollbar-thumb-zinc-800">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <li key={country.code || country.name}>
                    <button
                      type="button"
                      onClick={() => handleSelect(country.name)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors duration-150 hover:bg-zinc-900 ${
                        selected === country.name 
                          ? 'bg-zinc-900 text-white font-medium' 
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {country.flag && <span className="text-sm">{country.flag}</span>}
                      <span className="truncate">{country.name}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-xs text-center text-zinc-600">
                  Negara tidak ditemukan
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}