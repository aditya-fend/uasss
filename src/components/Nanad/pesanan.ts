'use server';

import { sql } from '../Adi/db';
import { revalidatePath } from 'next/cache';

// Interface untuk struktur data Pesanan
interface Pesanan {
  id: number;
  total_harga: number;
  status_pembayaran: string;
  created_at: string;
}

// Interface untuk struktur detail item di dalam pesanan
interface DetailItem {
  id: number;
  pesanan_id: number;
  produk_id: number;
  nama_produk: string;
  kuantitas: number;
  harga_saat_ini: number;
}

/**
 * 1. READ: Mengambil semua data pesanan
 */
export async function getPesanan(): Promise<{ success: boolean; data: Pesanan[] }> {
  try {
    const data = await sql`
      SELECT id, total_harga, status_pembayaran, created_at 
      FROM pesanan 
      ORDER BY created_at DESC
    ` as Pesanan[];
    
    return { success: true, data };
  } catch (error) {
    console.error('Gagal mengambil data pesanan:', error);
    return { success: false, data: [] };
  }
}

/**
 * 2. READ: Mengambil detail item berdasarkan ID Pesanan
 */
export async function getDetailPesanan(pesananId: number): Promise<{ success: boolean; data: DetailItem[] }> {
  try {
    // Melakukan JOIN dengan tabel produk untuk mendapatkan nama produknya
    const data = await sql`
      SELECT 
        dp.id, 
        dp.pesanan_id, 
        dp.produk_id, 
        COALESCE(p.nama, 'Produk Telah Dihapus') as nama_produk, 
        dp.kuantitas, 
        dp.harga_saat_ini
      FROM detail_pesanan dp
      LEFT JOIN produk p ON dp.produk_id = p.id
      WHERE dp.pesanan_id = ${pesananId}
    ` as DetailItem[];

    return { success: true, data };
  } catch (error) {
    console.error('Gagal mengambil detail pesanan:', error);
    return { success: false, data: [] };
  }
}

/**
 * 3. UPDATE: Mengubah status pembayaran (pending / success / failed)
 */
export async function updateStatusPesanan(id: number, statusBaru: 'pending' | 'success' | 'failed') {
  try {
    await sql`
      UPDATE pesanan
      SET status_pembayaran = ${statusBaru}
      WHERE id = ${id}
    `;

    // Revalidasi halaman pesanan agar data di UI langsung sinkron
    revalidatePath('/pesanan');
    
    return { success: true, message: `Status pesanan #${id} berhasil diubah menjadi ${statusBaru}` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal memperbarui status pesanan' };
  }
}


interface BeliLangsungInput {
  produkId: number;
  kuantitas: number;
}

export async function beliLangsungAction({ produkId, kuantitas }: BeliLangsungInput) {
  try {
    // 1. Ambil data produk untuk cek stok dan harga terkini
    const produk = await sql`
      SELECT nama, harga, stok FROM produk WHERE id = ${produkId}
    `;

    if (produk.length === 0) {
      throw new Error('Produk tidak ditemukan');
    }

    const { harga, stok } = produk[0];

    // 2. Validasi ketersediaan stok
    if (stok < kuantitas) {
      throw new Error(`Stok tidak mencukupi. Sisa stok: ${stok}`);
    }

    // 3. Hitung total harga
    const totalHarga = Number(harga) * kuantitas;

    // 4. Buat pesanan baru
    const pesananBaru = await sql`
      INSERT INTO pesanan (total_harga, status_pembayaran)
      VALUES (${totalHarga}, 'pending')
      RETURNING id
    `;
    
    const pesananId = pesananBaru[0].id;

    // 5. Masukkan ke detail pesanan
    await sql`
      INSERT INTO detail_pesanan (pesanan_id, produk_id, kuantitas, harga_saat_ini)
      VALUES (${pesananId}, ${produkId}, ${kuantitas}, ${harga})
    `;

    // 6. Kurangi stok produk
    await sql`
      UPDATE produk 
      SET stok = stok - ${kuantitas} 
      WHERE id = ${produkId}
    `;

    // Revalidasi data agar halaman katalog dan pesanan diperbarui
    revalidatePath('/');
    revalidatePath('/pesanan');

    return { success: true, message: 'Pesanan berhasil dibuat' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal memproses pembelian' };
  }
}