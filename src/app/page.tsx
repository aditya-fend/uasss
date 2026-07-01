import React, { useState, useMemo } from 'react';

// 1. Definisi Interface untuk Produk
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  isNew?: boolean;
}

// 2. Data Dummy Produk
const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Classic White Sneakers',
    category: 'Sepatu',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60',
    rating: 4.8,
    isNew: true,
  },
  {
    id: 2,
    name: 'Minimalist Leather Watch',
    category: 'Aksesoris',
    price: 1200000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    rating: 4.7,
  },
  {
    id: 3,
    name: 'Waterproof Canvas Backpack',
    category: 'Tas',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
    rating: 4.5,
  },
  {
    id: 4,
    name: 'Oversized Cotton Hoodie',
    category: 'Pakaian',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
    rating: 4.6,
    isNew: true,
  },
  {
    id: 5,
    name: 'Running Shoes Volt',
    category: 'Sepatu',
    price: 1350000,
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&auto=format&fit=crop&q=60',
    rating: 4.9,
  },
  {
    id: 6,
    name: 'Premium Sunglasses',
    category: 'Aksesoris',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
    rating: 4.3,
  },
];

const CATEGORIES = ['Semua', 'Pakaian', 'Sepatu', 'Tas', 'Aksesoris'];

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Fungsi Filter dan Cari Produk
  const filteredProducts = useMemo(() => {
    return DUMMY_PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Semua' || product.category === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Helper untuk format rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Katalog Produk Kami
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
            Temukan koleksi terbaik kami dengan kualitas premium dan harga bersahabat.
          </p>
        </div>

        {/* Kontrol: Cari & Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
          {/* Input Search */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Kategori Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Baru
                    </span>
                  )}
                </div>

                {/* Info Produk */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 tracking-wider uppercase mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-base font-bold text-gray-800 line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center mt-2 mb-4">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-xs font-medium text-gray-600 ml-1">
                        {product.rating}
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* Harga */}
                    <p className="text-lg font-extrabold text-gray-900 mb-4">
                      {formatRupiah(product.price)}
                    </p>

                    {/* Tombol Aksi */}
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                      <span>Tambah ke Keranjang</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* State Jika Produk Tidak Ditemukan */
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg font-medium">Produk tidak ditemukan</p>
            <p className="text-gray-400 text-sm mt-1">Coba gunakan kata kunci atau kategori lain.</p>
          </div>
        )}

      </div>
    </div>
  );
}