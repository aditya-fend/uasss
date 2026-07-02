'use server';

import { sql } from '../Adi/db';
import { revalidatePath } from 'next/cache';

interface TambahKeranjangInput {
  produkId: number;
  kuantitas: number;
}

export async function tambahKeKeranjangAction({ produkId, kuantitas }: TambahKeranjangInput) {
  try {
    // 1. Cek ketersediaan stok produk terlebih dahulu
    const produk = await sql`
      SELECT nama, stok FROM produk WHERE id = ${produkId}
    `;

    if (produk.length === 0) {
      throw new Error('Produk tidak ditemukan');
    }

    const { stok, nama } = produk[0];

    // 2. Cek apakah produk ini sudah ada di dalam keranjang
    const keranjangEksis = await sql`
      SELECT id, kuantitas FROM keranjang WHERE produk_id = ${produkId}
    `;

    if (keranjangEksis.length > 0) {
      const kuantitasBaru = keranjangEksis[0].kuantitas + kuantitas;

      // Validasi agar total di keranjang tidak melebihi stok gudang
      if (kuantitasBaru > stok) {
        throw new Error(`Gagal menambahkan. Total di keranjang (${kuantitasBaru}) melebihi stok yang ada (${stok}).`);
      }

      // Update kuantitas jika produk sudah ada di keranjang
      await sql`
        UPDATE keranjang 
        SET kuantitas = ${kuantitasBaru} 
        WHERE produk_id = ${produkId}
      `;
    } else {
      // Validasi kuantitas awal terhadap stok
      if (kuantitas > stok) {
        throw new Error(`Jumlah melebihi stok tersedia (${stok}).`);
      }

      // Insert data baru jika produk belum ada di keranjang
      await sql`
        INSERT INTO keranjang (produk_id, kuantitas)
        VALUES (${produkId}, ${kuantitas})
      `;
    }

    // Revalidasi data halaman keranjang
    revalidatePath('/keranjang');

    return { success: true, message: `${nama} berhasil dimasukkan ke keranjang` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menambahkan ke keranjang' };
  }
}


/**
 * A. Hapus item tertentu dari keranjang
 */
export async function hapusItemKeranjang(keranjangId: number) {
  try {
    await sql`DELETE FROM keranjang WHERE id = ${keranjangId}`;
    revalidatePath('/keranjang');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus item' };
  }
}

/**
 * B. Proses CHECKOUT dari semua isi keranjang
 */
export async function prosesCheckoutKeranjang() {
  try {
    // 1. Ambil semua item di keranjang beserta detail info produknya
    const listKeranjang = await sql`
      SELECT k.id as keranjang_id, k.kuantitas, p.id as produk_id, p.nama, p.harga, p.stok
      FROM keranjang k
      JOIN produk p ON k.produk_id = p.id
    `;

    if (listKeranjang.length === 0) {
      throw new Error('Keranjang Anda kosong');
    }

    // 2. Validasi apakah stok semua produk mencukupi sebelum memproses
    for (const item of listKeranjang) {
      if (item.stok < item.kuantitas) {
        throw new Error(`Stok produk "${item.nama}" tidak mencukupi. Sisa stok: ${item.stok}`);
      }
    }

    // 3. Hitung total harga keseluruhan isi keranjang
    const totalHarga = listKeranjang.reduce((sum, item) => sum + (Number(item.harga) * item.kuantitas), 0);

    // 4. Buat data pesanan induk baru
    const pesananBaru = await sql`
      INSERT INTO pesanan (total_harga, status_pembayaran)
      VALUES (${totalHarga}, 'pending')
      RETURNING id
    `;
    const pesananId = pesananBaru[0].id;

    // 5. Masukkan masing-masing produk ke detail_pesanan & potong stok di database
    for (const item of listKeranjang) {
      // Simpan detail item pesanan
      await sql`
        INSERT INTO detail_pesanan (pesanan_id, produk_id, kuantitas, harga_saat_ini)
        VALUES (${pesananId}, ${item.produk_id}, ${item.kuantitas}, ${item.harga})
      `;

      // Kurangi stok di katalog produk
      await sql`
        UPDATE produk 
        SET stok = stok - ${item.kuantitas} 
        WHERE id = ${item.produk_id}
      `;
    }

    // 6. Kosongkan seluruh isi keranjang belanja karena checkout berhasil
    await sql`DELETE FROM keranjang`;

    // Revalidasi cache rute terkait agar UI sinkron
    revalidatePath('/');
    revalidatePath('/keranjang');
    revalidatePath('/pesanan');

    return { success: true, message: 'Checkout berhasil!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal memproses checkout' };
  }
}