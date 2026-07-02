import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import '@/app/globals.css'; // Sesuaikan dengan path file CSS global kamu
import { LayoutGrid, PlusCircle, ShoppingBag, Receipt } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Minimalist Store Dashboard',
  description: 'Next.js + Postgres Neon Store Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Data navigasi untuk sidebar
  const navItems = [
    { name: 'Katalog', href: '/', icon: LayoutGrid },
    { name: 'Tambah Produk', href: '/tambah', icon: PlusCircle },
    { name: 'Keranjang', href: '/keranjang', icon: ShoppingBag },
    { name: 'Pesanan', href: '/pesanan', icon: Receipt },
  ];

  return (
    <html lang="id" className="h-full bg-black">
      <body className={`${inter.className} h-full text-zinc-200 antialiased flex`}>
        
        {/* SIDEBAR */}
        <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between p-6 shrink-0">
          <div className="space-y-8">
            {/* Logo / Brand Header */}
            <div className="px-2">
              <span className="text-sm font-bold tracking-widest text-white uppercase">
                STORE.CORE
              </span>
              <p className="text-[10px] text-zinc-600 tracking-wider uppercase mt-0.5">
                Management System
              </p>
            </div>

            {/* Navigasi Menu */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium tracking-wide text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all duration-150 group"
                  >
                    <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Sidebar Ringkas */}
          <div className="px-2 pt-4 border-t border-zinc-900/50">
            <p className="text-[10px] text-zinc-600 tracking-tight">
              &copy; 2026 Engine v1.0
            </p>
          </div>
        </aside>

        {/* AREA KONTEN UTAMA */}
        <div className="flex-1 h-full overflow-y-auto bg-black flex justify-center items-start">
          <div className="w-full max-w-7xl p-8 lg:p-12">
            {children}
          </div>
        </div>

      </body>
    </html>
  );
}