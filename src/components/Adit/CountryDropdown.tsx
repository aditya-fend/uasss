"use client";

import { useEffect, useState } from "react";

interface CountryData {
  name: string;
  flag: string; // URL gambar (.svg atau .png dari API)
  iso2: string;
}

interface CountryDropdownProps {
  onSelectCountry?: (countryName: string) => void;
}

// Daftar negara Asia untuk menyaring data global dari CountriesNow
const ASIA_COUNTRIES = [
  "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", 
  "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", 
  "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", 
  "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", 
  "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia", "Singapore", 
  "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", 
  "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"
];

export default function CountryDropdown({ onSelectCountry }: CountryDropdownProps) {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/flag/images")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data dari CountriesNow");
        return res.json();
      })
      .then((body) => {
        // Mengambil array dari properti body.data sesuai struktur respons asli
        const allCountries: CountryData[] = body.data || [];
        
        // Memfilter hanya negara-negara yang masuk dalam daftar wilayah Asia
        const asiaOnly = allCountries.filter((country) =>
          ASIA_COUNTRIES.includes(country.name)
        );

        // Mengurutkan nama negara dari A sampai Z secara alfabetis
        const sorted = asiaOnly.sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelected(val);
    if (onSelectCountry) {
      onSelectCountry(val);
    }
  };

  // Mencari data negara yang sedang dipilih untuk memunculkan bendera di sebelah teks
  const currentCountry = countries.find((c) => c.name === selected);

  return (
    <div className="w-full max-w-xs">
      <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
        Asal Negara
      </label>
      
      <div className="relative flex items-center">
        {/* Render bendera secara dinamis jika ada negara yang dipilih */}
        {currentCountry && (
          <div className="absolute left-3 flex items-center pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentCountry.flag}
              alt={`Bendera ${currentCountry.name}`}
              // Grayscale membuat warna bendera mengikuti tema minimalis hitam-putih Anda
              className="w-5 h-3.5 object-cover border border-gray-100"
            />
          </div>
        )}

        <select
          value={selected}
          onChange={handleChange}
          disabled={loading}
          className={`w-full bg-white text-sm text-black border border-gray-200 py-3 pr-10 appearance-none focus:outline-none focus:border-black transition-colors rounded-none cursor-pointer
            ${currentCountry ? "pl-11" : "pl-4"} 
            ${loading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <option value="">
            {loading ? "Memuat negara..." : "Pilih Negara"}
          </option>
          {countries.map((country) => (
            <option key={country.iso2 || country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>

        {/* Custom Minimalist Arrow Icon (Panah Bawah Tipis) */}
        <div className="absolute right-4 pointer-events-none flex items-center">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}