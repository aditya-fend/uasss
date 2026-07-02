'use server';

import { sql } from '@/components/Adi/db';
import { revalidatePath } from 'next/cache';

// Interface untuk validasi data input
interface ProdukInput {
  nama: string;
  harga: number;
  stok: number;
  asal_negara: string;
}

/**
 * 1. CREATE: Menambahkan produk baru
 */
export async function createProduk(data: ProdukInput) {
  try {
    if (!data.nama || !data.harga || !data.asal_negara) {
      throw new Error('Semua field wajib diisi kecuali stok');
    }

    await sql`
      INSERT INTO produk (nama, harga, stok, asal_negara)
      VALUES (${data.nama}, ${data.harga}, ${data.stok}, ${data.asal_negara})
    `;

    // Refresh halaman katalog dan tambah produk agar datanya paling baru
    revalidatePath('/katalog');
    revalidatePath('/tambah-produk');
    
    return { success: true, message: 'Produk berhasil ditambahkan!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menambahkan produk' };
  }
}

/**
 * 2. READ: Mengambil satu produk berdasarkan ID (untuk form edit)
 */
export async function getProdukById(id: number) {
  try {
    const rows = await sql`SELECT * FROM produk WHERE id = ${id}`;
    if (rows.length === 0) return { success: false, data: null };
    
    return { success: true, data: rows[0] };
  } catch (error) {
    return { success: false, data: null };
  }
}

/**
 * 3. UPDATE: Memperbarui data produk
 */
export async function updateProduk(id: number, data: ProdukInput) {
  try {
    await sql`
      UPDATE produk
      SET nama = ${data.nama}, harga = ${data.harga}, stok = ${data.stok}, asal_negara = ${data.asal_negara}
      WHERE id = ${id}
    `;

    revalidatePath('/katalog');
    revalidatePath('/tambah-produk');
    
    return { success: true, message: 'Produk berhasil diperbarui!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal memperbarui produk' };
  }
}

/**
 * 4. DELETE: Menghapus produk
 */
export async function deleteProduk(id: number) {
  try {
    await sql`DELETE FROM produk WHERE id = ${id}`;

    revalidatePath('/katalog');
    revalidatePath('/tambah-produk');
    
    return { success: true, message: 'Produk berhasil dihapus!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghapus produk' };
  }
}