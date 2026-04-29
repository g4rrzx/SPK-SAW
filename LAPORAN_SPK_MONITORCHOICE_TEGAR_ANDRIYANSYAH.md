# LAPORAN PROYEK
## Sistem Pendukung Keputusan Pemilihan Monitor Terbaik
## Metode Simple Additive Weighting (SAW)

---

## Identitas Mahasiswa

- **Nama**: Tegar Andriyansyah  
- **NIM**: 231011402038  
- **Kelas**: 06 TPLP 006  
- **Mata Kuliah**: Sistem Pengambil Keputusan  
- **Judul Proyek**: Rekomendasi Monitor Terbaik metode SPK

---

## Abstrak

Proyek ini membangun sistem pendukung keputusan (SPK) berbasis web untuk membantu pemilihan monitor terbaik secara objektif menggunakan metode **Simple Additive Weighting (SAW)**. Sistem menggunakan 10 data monitor dummy dan 5 kriteria penilaian, yaitu harga, resolusi, refresh rate, ukuran layar, dan garansi. Proses SAW dilakukan melalui tahapan normalisasi, pembobotan, lalu perankingan berdasarkan nilai preferensi tertinggi. Implementasi dibangun menggunakan HTML, CSS, JavaScript (Vanilla), dan Bootstrap agar ringan, responsif, serta mudah dipresentasikan pada kebutuhan akademik.

---

## BAB I - Pendahuluan

### 1.1 Latar Belakang
Pemilihan monitor sering dilakukan secara subjektif tanpa metode kuantitatif yang jelas. Akibatnya, keputusan dapat kurang optimal karena tidak mempertimbangkan semua kriteria secara terstruktur. Dengan SPK metode SAW, setiap alternatif monitor dapat dihitung nilainya secara sistematis.

### 1.2 Rumusan Masalah
1. Bagaimana membangun sistem web sederhana untuk merekomendasikan monitor terbaik?
2. Bagaimana menerapkan metode SAW pada data monitor dengan kriteria cost dan benefit?
3. Bagaimana menampilkan hasil perhitungan secara transparan dan mudah dipahami?

### 1.3 Tujuan
1. Membangun aplikasi SPK pemilihan monitor berbasis web responsif.
2. Mengimplementasikan metode SAW dari input bobot hingga ranking akhir.
3. Menyediakan hasil perhitungan (normalisasi dan nilai preferensi) yang dapat dipresentasikan.

### 1.4 Batasan Masalah
- Data bersifat dummy (10 monitor), statis di frontend.
- Tidak ada login, database, atau API eksternal.
- Bobot dimasukkan user dan wajib total = 1.00.
- Hasil ditampilkan dalam bentuk ranking dan rekomendasi terbaik.

---

## BAB II - Landasan Teori

### 2.1 Sistem Pendukung Keputusan (SPK)
SPK adalah sistem yang membantu pengambil keputusan dengan memanfaatkan data dan model perhitungan untuk menghasilkan rekomendasi yang rasional.

### 2.2 Metode Simple Additive Weighting (SAW)
SAW adalah metode penjumlahan terbobot dari nilai kinerja tiap alternatif terhadap seluruh kriteria.

#### a) Normalisasi
- Untuk **Benefit**:  
  \[
  R_{ij} = \frac{X_{ij}}{\max(X_j)}
  \]
- Untuk **Cost**:  
  \[
  R_{ij} = \frac{\min(X_j)}{X_{ij}}
  \]

#### b) Nilai Preferensi
\[
V_i = \sum_{j=1}^{n}(W_j \times R_{ij})
\]

Alternatif dengan nilai \(V_i\) terbesar menjadi rekomendasi terbaik.

### 2.3 Kriteria dan Bobot
| Kode | Kriteria | Tipe | Bobot |
|---|---|---|---:|
| C1 | Harga | Cost | 0.25 |
| C2 | Resolusi | Benefit | 0.25 |
| C3 | Refresh Rate | Benefit | 0.20 |
| C4 | Ukuran Layar | Benefit | 0.15 |
| C5 | Garansi | Benefit | 0.15 |

Total bobot = **1.00**.

---

## BAB III - Analisis dan Perancangan Sistem

### 3.1 Kebutuhan Fungsional
1. Menampilkan data 10 monitor pada tabel responsif.
2. Menerima input bobot 5 kriteria.
3. Memvalidasi bobot (numerik, non-negatif, total = 1.00 dengan toleransi ±0.001).
4. Menghitung SAW (normalisasi, nilai preferensi, ranking).
5. Menampilkan:
   - ranking monitor,
   - rekomendasi terbaik,
   - detail matriks normalisasi dan nilai preferensi (toggle).
6. Reset ke kondisi awal.

### 3.2 Kebutuhan Non-Fungsional
- UI responsif (mobile, tablet, desktop).
- Tidak membutuhkan build tool/backend.
- Perhitungan cepat di sisi browser.
- Struktur kode mudah dipahami untuk evaluasi akademik.

### 3.3 Arsitektur Sistem
Arsitektur bersifat **single-page frontend**:
- `index.html` -> struktur UI
- `assets/css/styles.css` -> styling responsif
- `assets/js/app.js` -> data, validasi, algoritma SAW, rendering hasil

### 3.4 Alur Kerja Sistem
1. Halaman memuat data monitor dan bobot default.
2. User dapat ubah bobot.
3. Klik **Hitung SAW**.
4. Sistem validasi bobot.
5. Jika valid, sistem hitung normalisasi dan nilai preferensi.
6. Sistem urutkan nilai dari tertinggi ke terendah.
7. Sistem tampilkan monitor terbaik.

---

## BAB IV - Implementasi

### 4.1 Teknologi
- HTML5
- CSS3
- Bootstrap 5.3.3
- JavaScript (Vanilla)
- Hosting: GitHub + Vercel

### 4.2 Struktur Data Monitor
Sistem menggunakan 10 alternatif monitor berikut:

| ID | Nama | Harga | Resolusi | Refresh | Ukuran | Garansi |
|---:|---|---:|---:|---:|---:|---:|
| 1 | ViewSonic VX2458 | 1,800,000 | 75 | 75 | 24 | 2 |
| 2 | AOC 24G2SP | 2,500,000 | 75 | 165 | 24 | 2 |
| 3 | LG 27UP850 | 4,800,000 | 100 | 60 | 27 | 3 |
| 4 | Xiaomi Mi 2K | 2,900,000 | 85 | 75 | 27 | 1 |
| 5 | Samsung Odyssey G3 | 2,300,000 | 75 | 144 | 24 | 2 |
| 6 | Dell P2723D | 4,200,000 | 85 | 60 | 27 | 3 |
| 7 | Asus VG279Q1A | 3,100,000 | 75 | 165 | 27 | 2 |
| 8 | HP VH24 | 1,600,000 | 70 | 60 | 24 | 1 |
| 9 | Philips 275E2FAE | 2,700,000 | 85 | 75 | 27 | 2 |
| 10 | BenQ GW2785TC | 3,500,000 | 75 | 60 | 27 | 3 |

### 4.3 Aturan Implementasi Penting
1. **Toleransi bobot**: total bobot diverifikasi dengan toleransi ±0.001.
2. **Input lokal Indonesia**: format desimal koma (contoh `0,25`) didukung.
3. **Penanganan error**:
   - bobot bukan angka,
   - bobot negatif,
   - total bobot tidak sama dengan 1,
   - pembagi nol pada normalisasi.
4. **Tie-break ranking**: jika skor sama, urutan berdasarkan `id` terkecil.
5. **Presisi tampil**: skor ditampilkan hingga 4 desimal.

---

## BAB V - Perhitungan SAW (Detail)

### 5.1 Parameter Normalisasi
Dari dataset:
- \(\min(C1) = 1.600.000\)
- \(\max(C2) = 100\)
- \(\max(C3) = 165\)
- \(\max(C4) = 27\)
- \(\max(C5) = 3\)

### 5.2 Contoh Normalisasi (Alternatif A2 - AOC 24G2SP)
Data A2: harga=2.500.000, resolusi=75, refresh=165, ukuran=24, garansi=2.

\[
R_{21} = 1.600.000 / 2.500.000 = 0.6400
\]
\[
R_{22} = 75 / 100 = 0.7500
\]
\[
R_{23} = 165 / 165 = 1.0000
\]
\[
R_{24} = 24 / 27 = 0.8889
\]
\[
R_{25} = 2 / 3 = 0.6667
\]

Nilai preferensi A2:
\[
V_2 = (0.25\times0.6400)+(0.25\times0.7500)+(0.20\times1.0000)+(0.15\times0.8889)+(0.15\times0.6667)
\]
\[
V_2 = 0.7808
\]

### 5.3 Contoh Perbandingan (Alternatif A8 - HP VH24)
Normalisasi A8:
- C1=1.0000, C2=0.7000, C3=0.3636, C4=0.8889, C5=0.3333

Nilai preferensi:
\[
V_8 = 0.6811
\]

Ini menunjukkan bahwa harga murah saja tidak cukup jika kriteria benefit lain (refresh, garansi) lebih rendah.

### 5.4 Hasil Ranking Akhir (Bobot Default)

| Rank | ID | Nama Monitor | Nilai V |
|---:|---:|---|---:|
| 1 | 2 | AOC 24G2SP | 0.7808 |
| 2 | 5 | Samsung Odyssey G3 | 0.7693 |
| 3 | 7 | Asus VG279Q1A | 0.7665 |
| 4 | 1 | ViewSonic VX2458 | 0.7340 |
| 5 | 3 | LG 27UP850 | 0.7061 |
| 6 | 9 | Philips 275E2FAE | 0.7016 |
| 7 | 8 | HP VH24 | 0.6811 |
| 8 | 6 | Dell P2723D | 0.6805 |
| 9 | 10 | BenQ GW2785TC | 0.6745 |
| 10 | 4 | Xiaomi Mi 2K | 0.6413 |

**Rekomendasi sistem**: **AOC 24G2SP** (Rank 1).

---

## BAB VI - Pengujian Sistem

### 6.1 Pengujian Fungsional
Pengujian dilakukan melalui skrip Node test pada `tests/ui-structure.test.js`, mencakup:
1. Viewport meta mobile.
2. Integrasi Bootstrap.
3. Ketersediaan selector utama.
4. Struktur hero menyatu dengan kartu data.
5. Tabel dibungkus `table-responsive`.
6. Aksesibilitas form input.
7. Atribut toggle detail (`aria-controls`, `aria-expanded`).
8. Media query mobile-first.
9. Identitas mahasiswa dan judul sistem tampil.
10. Guard overflow mobile untuk kolom dan tabel.

Hasil: **lulus** (semua test pass pada implementasi terbaru).

### 6.2 Pengujian Deployment
- Source code dipush ke GitHub.
- Deploy production di Vercel (`monitorchoice-skp.vercel.app`).
- Verifikasi HTTP status 200 dan konten live sesuai update terbaru.

---

## BAB VII - Kesimpulan dan Saran

### 7.1 Kesimpulan
1. Sistem SPK pemilihan monitor berhasil dibangun dengan metode SAW.
2. Proses perhitungan berjalan benar dari normalisasi hingga ranking.
3. Hasil rekomendasi dapat dijelaskan secara matematis dan transparan.
4. Sistem telah responsif di mobile dan cocok untuk kebutuhan tugas kuliah.

### 7.2 Saran Pengembangan
1. Menambahkan fitur ekspor PDF laporan hasil ranking.
2. Menambahkan penyimpanan data (database) untuk skenario non-dummy.
3. Menambahkan pembanding metode lain (TOPSIS/AHP) untuk studi komparatif.
4. Menambahkan login per pengguna jika sistem dikembangkan lebih lanjut.

---

## Lampiran A - Cara Menjalankan Sistem

### Lokal
```bash
python3 -m http.server 4173
```
Lalu buka: `http://localhost:4173`

### Online
- GitHub: `https://github.com/g4rrzx/SKP`
- Vercel: `https://monitorchoice-skp.vercel.app`

---

## Lampiran B - Ringkasan Cara Kerja Sistem (Singkat)
1. User isi bobot kriteria.
2. Sistem validasi bobot.
3. Sistem normalisasi semua kriteria sesuai tipe cost/benefit.
4. Sistem hitung skor preferensi setiap monitor.
5. Sistem urutkan skor dan tampilkan rekomendasi terbaik.
