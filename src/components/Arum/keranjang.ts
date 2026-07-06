// Menandakan bahwa seluruh fungsi di dalam file ini adalah Server Actions yang dieksekusi eksklusif di sisi server
'use server';

// Mengimpor driver/instance SQL dari konfigurasi database milik Adi
import { sql } from '../Adi/db';
// Mengimpor utilitas Next.js untuk membersihkan cache halaman tertentu secara on-demand
import { revalidatePath } from 'next/cache';

// Mendefinisikan kontrak data (interface) untuk argumen input fungsi tambah ke keranjang
interface TambahKeranjangInput {
  produkId: number;
  kuantitas: number;
}

// Fungsi asinkronus untuk menangani penambahan produk ke dalam keranjang belanja
export async function tambahKeKeranjangAction({ produkId, kuantitas }: TambahKeranjangInput) {
  try {
    // 1. Cek ketersediaan stok produk terlebih dahulu
    // Menjalankan query ke tabel produk untuk memeriksa nama dan sisa stok berdasarkan ID
    const produk = await sql`
      SELECT nama, stok FROM produk WHERE id = ${produkId}
    `;

    // Memeriksa apakah baris data produk ditemukan di database
    if (produk.length === 0) {
      // Melempar error jika ID produk tidak terdaftar
      throw new Error('Produk tidak ditemukan');
    }

    // Mendestrukturisasi data stok dan nama produk dari hasil baris pertama query produk
    const { stok, nama } = produk[0];

    // 2. Cek apakah produk ini sudah ada di dalam keranjang
    // Menjalankan query ke tabel keranjang untuk melihat apakah produk serupa sudah pernah dimasukkan sebelumnya
    const keranjangEksis = await sql`
      SELECT id, kuantitas FROM keranjang WHERE produk_id = ${produkId}
    `;

    // Blok logika jika produk ternyata sudah ada di dalam keranjang belanja
    if (keranjangEksis.length > 0) {
      // Menghitung akumulasi kuantitas baru (jumlah di keranjang saat ini ditambah jumlah input baru)
      const kuantitasBaru = keranjangEksis[0].kuantitas + kuantitas;

      // Validasi agar total di keranjang tidak melebihi stok gudang
      // Menghentikan proses jika jumlah akumulasi baru melampaui sisa stok produk yang tersedia
      if (kuantitasBaru > stok) {
        throw new Error(`Gagal menambahkan. Total di keranjang (${kuantitasBaru}) melebihi stok yang ada (${stok}).`);
      }

      // Update kuantitas jika produk sudah ada di keranjang
      // Memperbarui kolom kuantitas pada baris produk terkait di tabel keranjang
      await sql`
        UPDATE keranjang 
        SET kuantitas = ${kuantitasBaru} 
        WHERE produk_id = ${produkId}
      `;
    } else {
      // Blok logika jika produk belum pernah dimasukkan ke dalam keranjang belanja
      // Validasi kuantitas awal terhadap stok
      // Melempar error jika jumlah input awal yang diminta langsung melebihi kapasitas stok gudang
      if (kuantitas > stok) {
        throw new Error(`Jumlah melebihi stok tersedia (${stok}).`);
      }

      // Insert data baru jika produk belum ada di keranjang
      // Menambahkan baris rekaman baru yang berisi data produk_id dan kuantitas ke tabel keranjang
      await sql`
        INSERT INTO keranjang (produk_id, kuantitas)
        VALUES (${produkId}, ${kuantitas})
      `;
    }

    // Revalidasi data halaman keranjang
    // Memaksa Next.js memperbarui cache data pada rute '/keranjang' agar tampilan UI langsung sinkron
    revalidatePath('/keranjang');

    // Mengembalikan status sukses beserta pesan nama produk yang berhasil masuk ke keranjang
    return { success: true, message: `${nama} berhasil dimasukkan ke keranjang` };
  } catch (error: any) {
    // Menangkap error dan mengembalikannya ke client component dalam bentuk objek response gagal
    return { success: false, message: error.message || 'Gagal menambahkan ke keranjang' };
  }
}


/**
 * A. Hapus item tertentu dari keranjang
 */
// Fungsi asinkronus untuk menghapus satu baris item tertentu dari tabel keranjang belanja
export async function hapusItemKeranjang(keranjangId: number) {
  try {
    // Mengeksekusi query SQL DELETE untuk menghapus item keranjang berdasarkan ID barisnya
    await sql`DELETE FROM keranjang WHERE id = ${keranjangId}`;
    // Membersihkan cache halaman keranjang agar item yang dihapus langsung menghilang dari UI browser
    revalidatePath('/keranjang');
    // Mengembalikan objek status sukses
    return { success: true };
  } catch (error) {
    // Mengembalikan respons gagal jika query penghapusan database mengalami kendala
    return { success: false, message: 'Gagal menghapus item' };
  }
}

/**
 * B. Proses CHECKOUT dari semua isi keranjang
 */
// Fungsi asinkronus untuk memproses checkout massal dari seluruh item yang ada di keranjang belanja
export async function prosesCheckoutKeranjang() {
  try {
    // 1. Ambil semua item di keranjang beserta detail info produknya
    // Menjalankan query gabungan (JOIN) antara tabel keranjang dan produk untuk mendapatkan info harga dan stok terkini
    const listKeranjang = await sql`
      SELECT k.id as keranjang_id, k.kuantitas, p.id as produk_id, p.nama, p.harga, p.stok
      FROM keranjang k
      JOIN produk p ON k.produk_id = p.id
    `;

    // Memeriksa apakah ada item di dalam keranjang untuk diproses
    if (listKeranjang.length === 0) {
      // Menggagalkan checkout jika keranjang ternyata kosong
      throw new Error('Keranjang Anda kosong');
    }

    // 2. Validasi apakah stok semua produk mencukupi sebelum memproses
    // Melakukan perulangan (looping) untuk memvalidasi stok masing-masing barang secara satu per satu
    for (const item of listKeranjang) {
      // Memeriksa jika ada salah satu item yang jumlah belinya melampaui sisa stok riil produk
      if (item.stok < item.kuantitas) {
        // Melempar error spesifik yang menyebutkan nama produk yang stoknya tidak memadai
        throw new Error(`Stok produk "${item.nama}" tidak mencukupi. Sisa stok: ${item.stok}`);
      }
    }

    // 3. Hitung total harga keseluruhan isi keranjang
    // Menggunakan metode Array.reduce untuk mengakumulasikan hasil perkalian harga unit dan kuantitas dari semua item
    const totalHarga = listKeranjang.reduce((sum, item) => sum + (Number(item.harga) * item.kuantitas), 0);

    // 4. Buat data pesanan induk baru
    // Memasukkan entri transaksi baru ke tabel pesanan dengan status awal 'pending'
    const pesananBaru = await sql`
      INSERT INTO pesanan (total_harga, status_pembayaran)
      VALUES (${totalHarga}, 'pending')
      RETURNING id
    `;
    // Mengekstrak ID pesanan baru yang digenerate otomatis melalui klausa RETURNING id
    const pesananId = pesananBaru[0].id;

    // 5. Masukkan masing-masing produk ke detail_pesanan & potong stok di database
    // Melakukan perulangan kembali untuk mendaftarkan rincian item ke pesanan dan memperbarui inventaris produk
    for (const item of listKeranjang) {
      // Simpan detail item pesanan
      // Memasukkan relasi ID pesanan, ID produk, kuantitas, beserta rekaman harga saat transaksi dilakukan
      await sql`
        INSERT INTO detail_pesanan (pesanan_id, produk_id, kuantitas, harga_saat_ini)
        VALUES (${pesananId}, ${item.produk_id}, ${item.kuantitas}, ${item.harga})
      `;

      // Kurangi stok di katalog produk
      // Melakukan operasi pengurangan stok di tabel produk berdasarkan jumlah yang dibeli user
      await sql`
        UPDATE produk 
        SET stok = stok - ${item.kuantitas} 
        WHERE id = ${item.produk_id}
      `;
    }

    // 6. Kosongkan seluruh isi keranjang belanja karena checkout berhasil
    // Menghapus seluruh baris record pada tabel keranjang setelah semua item sukses dipindahkan ke tabel pesanan
    await sql`DELETE FROM keranjang`;

    // Revalidasi cache rute terkait agar UI sinkron
    // Menyegarkan cache halaman beranda/katalog utama
    revalidatePath('/');
    // Menyegarkan cache rute keranjang agar tampil kosong kembali
    revalidatePath('/keranjang');
    // Menyegarkan rute pesanan agar data transaksi teranyar langsung muncul
    revalidatePath('/pesanan');

    // Mengembalikan indikator sukses apabila seluruh alur checkout berhasil diselesaikan
    return { success: true, message: 'Checkout berhasil!' };
  } catch (error: any) {
    // Mengembalikan objek status gagal beserta pesan kesalahan dari setiap lapis validasi atau query
    return { success: false, message: error.message || 'Gagal memproses checkout' };
  }
}