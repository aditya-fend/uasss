// Mengimpor fungsi 'neon' dari SDK serverless Neon untuk berinteraksi dengan database PostgreSQL
import { neon } from '@neondatabase/serverless';

// Memeriksa apakah variabel lingkungan 'DATABASE_URL' sudah dikonfigurasi atau belum
if (!process.env.DATABASE_URL) {
  // Menghentikan eksekusi dan melempar error jika string koneksi database tidak ditemukan
  throw new Error('DATABASE_URL tidak ditemukan di file .env');
}

// Membuat dan mengekspor instance koneksi SQL menggunakan URL database yang telah divalidasi
export const sql = neon(process.env.DATABASE_URL);