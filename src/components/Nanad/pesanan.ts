// Menandakan bahwa seluruh fungsi dalam file ini adalah Server Actions yang berjalan di sisi server
'use server';

// Mengimpor instance koneksi database (sql) dari folder db milik Adi
import { sql } from '../Adi/db';
// Mengimpor fungsi revalidatePath dari Next.js untuk membersihkan cache halaman tertentu secara on-demand
import { revalidatePath } from 'next/cache';

// Mendefinisikan struktur data (interface) untuk objek Pesanan
interface Pesanan {
  id: number;
  total_harga: number;
  status_pembayaran: string;
  created_at: string;
}

// Mendefinisikan struktur data (interface) untuk objek DetailItem pesanan
interface DetailItem {
  id: number;
  pesanan_id: number;
  produk_id: number;
  nama_produk: string;
  kuantitas: number;
  harga_saat_ini: number;
}

// Fungsi asinkronus untuk mengambil semua data pesanan dari database
export async function getPesanan(): Promise<{ success: boolean; data: Pesanan[] }> {
  try {
    // Menjalankan query SQL untuk mengambil kolom tertentu dari tabel pesanan dan diurutkan dari yang terbaru
    const data = await sql`
      SELECT id, total_harga, status_pembayaran, created_at 
      FROM pesanan 
      ORDER BY created_at DESC
    ` as Pesanan[];
    
    // Mengembalikan objek status sukses beserta data pesanan yang didapatkan
    return { success: true, data };
  } catch (error) {
    // Menampilkan pesan error di konsol server jika query gagal eksekusi
    console.error('Gagal mengambil data pesanan:', error);
    // Mengembalikan objek status gagal dengan data array kosong
    return { success: false, data: [] };
  }
}

// Fungsi asinkronus untuk mengambil detail item berdasarkan ID pesanan tertentu
export async function getDetailPesanan(pesananId: number): Promise<{ success: boolean; data: DetailItem[] }> {
  try {
    // Menjalankan query SQL dengan LEFT JOIN untuk mengambil detail pesanan sekaligus nama produknya
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

    // Mengembalikan objek status sukses beserta data detail pesanan
    return { success: true, data };
  } catch (error) {
    // Menampilkan pesan error di konsol server jika query gagal eksekusi
    console.error('Gagal mengambil detail pesanan:', error);
    // Mengembalikan objek status gagal dengan data array kosong
    return { success: false, data: [] };
  }
}

// Fungsi asinkronus untuk memperbarui status pembayaran dari suatu pesanan
export async function updateStatusPesanan(id: number, statusBaru: 'pending' | 'success' | 'failed') {
  try {
    // Menjalankan query SQL untuk memperbarui kolom status_pembayaran berdasarkan ID pesanan
    await sql`
      UPDATE pesanan
      SET status_pembayaran = ${statusBaru}
      WHERE id = ${id}
    `;

    // Memperbarui cache Next.js untuk rute '/pesanan' agar data terbaru langsung muncul di browser
    revalidatePath('/pesanan');
    
    // Mengembalikan objek status sukses beserta pesan konfirmasi
    return { success: true, message: `Status pesanan #${id} berhasil diubah menjadi ${statusBaru}` };
  } catch (error: any) {
    // Mengembalikan objek status gagal beserta pesan error yang terjadi
    return { success: false, message: error.message || 'Gagal memperbarui status pesanan' };
  }
}

// Mendefinisikan struktur data input untuk fungsi beli langsung
interface BeliLangsungInput {
  produkId: number;
  kuantitas: number;
}

// Fungsi asinkronus untuk memproses pembelian produk secara langsung (checkout cepat)
export async function beliLangsungAction({ produkId, kuantitas }: BeliLangsungInput) {
  try {
    // 1. Ambil data produk untuk cek stok dan harga terkini
    const produk = await sql`
      SELECT nama, harga, stok FROM produk WHERE id = ${produkId}
    `;

    // Memeriksa apakah produk yang dicari ada di database atau tidak
    if (produk.length === 0) {
      // Melempar error jika produk tidak ditemukan
      throw new Error('Produk tidak ditemukan');
    }

    // Mengambil nilai harga dan stok dari hasil query produk pertama
    const { harga, stok } = produk[0];

    // 2. Validasi ketersediaan stok
    if (stok < kuantitas) {
      // Melempar error jika jumlah yang dibeli melebihi stok yang tersedia
      throw new Error(`Stok tidak mencukupi. Sisa stok: ${stok}`);
    }

    // 3. Hitung total harga dengan mengonversi tipe data harga ke Number
    const totalHarga = Number(harga) * kuantitas;

    // 4. Buat pesanan baru
    const pesananBaru = await sql`
      INSERT INTO pesanan (total_harga, status_pembayaran)
      VALUES (${totalHarga}, 'pending')
      RETURNING id
    `;
    
    // Mengambil ID pesanan baru yang baru saja di-insert dari klausul RETURNING id
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

    // Memperbarui cache untuk halaman beranda atau katalog utama
    revalidatePath('/');
    // Memperbarui cache untuk halaman daftar pesanan
    revalidatePath('/pesanan');

    // Mengembalikan objek status sukses jika seluruh proses transaksi berhasil tanpa hambatan
    return { success: true, message: 'Pesanan berhasil dibuat' };
  } catch (error: any) {
    // Mengembalikan objek status gagal beserta pesan error dari validasi atau kegagalan query database
    return { success: false, message: error.message || 'Gagal memproses pembelian' };
  }
}