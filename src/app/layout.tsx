import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link"; // Mengimpor komponen Link Next.js
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Minimalist Store",
  description: "A clean, monochrome e-commerce experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-white text-black antialiased min-h-screen flex flex-col font-sans">
        
        {/* HEADER / NAVIGATION */}
        <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-widest uppercase">
              MINIMAL.
            </Link>
            <nav className="flex items-center gap-8 text-sm uppercase tracking-wider font-medium text-gray-600">
              <Link href="/produk" className="hover:text-black transition-colors">
                Produk
              </Link>
              <Link href="/keranjang" className="hover:text-black transition-colors">
                Keranjang
              </Link>
              <Link href="/pesanan" className="hover:text-black transition-colors">
                Pesanan
              </Link>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-12">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t border-gray-100 py-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-wide text-gray-400 uppercase">
            <div>© {new Date().getFullYear()} Minimalist Store. All rights reserved.</div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-black transition-colors">Terms</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}