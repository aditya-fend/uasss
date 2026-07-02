import { neon } from '@neondatabase/serverless';

// Memastikan DATABASE_URL sudah dikonfigurasi di .env
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL tidak ditemukan di file .env');
}

// Inisialisasi fungsi sql untuk melakukan query ke Neon
export const sql = neon(process.env.DATABASE_URL);