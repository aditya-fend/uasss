"use server";

import { revalidatePath } from "next/cache";

// Pastikan Anda sudah mengonfigurasi koneksi database Anda di file terpisah,
// atau mengimpor pool/sql client dari konfigurasi Neon Anda.
// Contoh di bawah mengasumsikan penggunaan client database standar:
import { db } from "@/components/Adi/db"; 

interface ActionResponse {
  success: boolean;
  message: string;
}

export async function tambahProdukAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Ekstrak data dari FormData
  const nama = formData.get("nama") as string;
  const hargaRaw = formData.get("harga") as string;
  const stokRaw = formData.get("stok") as string;
  const asal_negara = formData.get("asal_negara") as string;

  // 2. Validasi Input Sederhana
  if (!nama || !hargaRaw || !stokRaw || !asal_negara) {
    return { success: false, message: "Semua kolom wajib diisi." };
  }

  const harga = parseFloat(hargaRaw);
  const stok = parseInt(stokRaw, 10);

  if (isNaN(harga) || harga < 0) {
    return { success: false, message: "Harga harus berupa angka dan tidak boleh minus." };
  }

  if (isNaN(stok) || stok < 0) {
    return { success: false, message: "Stok harus berupa angka dan tidak boleh minus." };
  }

  try {
    // 3. Jalankan Query SQL ke database Neon
    // Sintaks ini menggunakan parameterized query ($1, $2, dst) untuk mencegah SQL Injection
    await db.query(
      `INSERT INTO produk (nama, harga, stok, asal_negara) 
       VALUES ($1, $2, $3, $4)`,
      [nama, harga, stok, asal_negara]
    );

    // 4. Bersihkan cache halaman produk agar data terbaru langsung muncul
    revalidatePath("/produk");

    return { 
      success: true, 
      message: "Produk berhasil ditambahkan ke katalog." 
    };

  } catch (error) {
    console.error("Gagal menambahkan produk:", error);
    return { 
      success: false, 
      message: "Terjadi kesalahan pada server saat menyimpan produk." 
    };
  }
}