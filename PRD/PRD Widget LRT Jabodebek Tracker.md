# **Product Requirement Document (PRD)**

## **Widget Android LRT Jabodebek Real-Time Arrival Tracker**

### **1\. Ringkasan Produk & Tujuan**

* **Nama Produk:** LRT Jabodebek Live Widget  
* **Platform:** Android (Widget Native di Home Screen)  
* **Teknologi Utama:** Kotlin, Jetpack Glance (Android AppWidget), Jetpack DataStore  
* **Tujuan Utama:** Memungkinkan pengguna melihat estimasi waktu kedatangan kereta LRT Jabodebek berikutnya secara *real-time* ("![][image1] menit lagi") langsung dari beranda HP tanpa perlu membuka aplikasi secara manual.

### **2\. Arsitektur Data & Klasifikasi Jalur**

Secara prinsip dasar database dan logika penayangan, seluruh rute LRT Jabodebek dikelompokkan ke dalam **2 Kategori Utama Arah Perjalanan**:

1. **Arah Menuju Dukuh Atas BSI (Inbound / Ke Pusat Kota)**  
   * Menampung kedatangan dari rute **Harjamukti ![][image2] Dukuh Atas BSI** dan **Jati Mulya ![][image2] Dukuh Atas BSI**.  
   * Menampilkan kereta dengan *destination badge*: Dukuh Atas BSI.  
2. **Arah Berasal dari Dukuh Atas BSI (Outbound / Ke Luar Kota)**  
   * Menampung keberangkatan dari **Dukuh Atas BSI ![][image2] Harjamukti** dan **Dukuh Atas BSI ![][image2] Jati Mulya**.  
   * Menampilkan kereta dengan *destination badge*: Harjamukti dan Jati Mulya.

### **3\. Spesifikasi Fitur Utama**

#### **3.1. Konfigurasi Widget (Widget Setup Activity)**

* **Pemilihan Stasiun:** Saat widget pertama kali dipasang di *home screen*, muncul layar konfigurasi sederhana untuk memilih stasiun keberangkatan pengguna (misal: "Cawang", "Kuningan", "Bekasi Barat").  
* **Filter Utama:** Opsi memilih untuk menampilkan **Arah Menuju Dukuh Atas**, **Arah Dari Dukuh Atas**, atau **Keduanya (Combined Dual-Card)**.  
* **Penyimpanan Preferensi:** Pilihan stasiun disimpan menggunakan **Jetpack DataStore** agar cepat dibaca saat widget menggambar ulang UI.

#### **3.2. Tampilan Widget & Kalkulasi *Real-Time***

* **Kalkulasi Hitung Mundur (*Countdown Engine*):**  
  * Widget membaca waktu sistem lokal (LocalTime.now()).  
  * Widget membandingkan waktu sistem dengan jam jadwal di station\_index untuk stasiun yang dipilih.  
  * Mengambil **2 kereta berikutnya** yang akan tiba untuk masing-masing arah.  
  * Format Tampilan: \[Ikon Kereta\] \[Tujuan\] • X min lagi (Contoh: 🚆 Jati Mulya • 4 min).  
* **Indikator Animasi / Berkedip (\< 2 Menit):**  
  * Jika waktu tiba kereta tersisa ![][image3] **menit** (misal: 1 menit lagi / Tiba sekarang), ikon kereta pada jadwal tersebut akan berubah warna menjadi *Primary Blue Pulsing* / berkedip untuk memberi sinyal kedatangan.

#### **3.3. Manual & Auto Refresh**

* **Auto Refresh Engine:** Memanfaatkan WorkManager / AlarmManager untuk memperbarui kalkulasi menit setiap 1-2 menit.  
* **Tombol Refresh Manual:** Ikon tombol putar (*sync/refresh icon*) kecil di pojok widget untuk memaksa kalkulasi pembaruan instan saat diklik pengguna.

### **4\. UI/UX & Panduan Desain (Design Guidelines)**

#### **4.1. Gaya Visual & Material**

* **Gaya Utama:** **Glassmorphism Minimalis** (Putih semi-transparan dengan *smooth blur background*).  
* **Bentuk:** *Super-rounded corners* (![][image4] radius) khas Material You Android.  
* **Skema Warna:**  
  * **Light Mode:**  
    * Background: \#FAFAFA dengan transparansi 80% (Glassmorphism).  
    * Primary Accent: **LRT Blue** (\#00529B / \#0066CC).  
    * Text/Icon Primary: \#1E1E1E.  
  * **Dark Mode (Adaptive):**  
    * Background: \#121824 dengan transparansi 85%.  
    * Primary Accent: **Sky Blue** (\#4D9EFF).  
    * Text/Icon Primary: \#F0F4F8.

#### **4.2. Layout Mockup (Ukuran Widget ![][image5] Cell)**

\+-------------------------------------------------------------+  
| 📍 Stasiun Cawang                            \[🔄 Refresh\]   |  
|                                                             |  
| 🔹 ARAH DUKUH ATAS BSI                                      |  
|   🚆 \[Blinking \<2min\] Dukuh Atas BSI   1 min lagi  (08:49)  |  
|                                                             |  
| 🔹 ARAH DARI DUKUH ATAS                                     |  
|   🚆 Harjamukti                       5 min lagi  (08:53)  |  
|   🚆 Jati Mulya                       12 min lagi (09:00)  |  
\+-------------------------------------------------------------+

### **5\. Arsitektur Teknis & Pemrograman Native**

* **Bahasa Pemrograman:** **Kotlin** (Android Native)  
* **Widget Framework:** **Jetpack Glance 1.1+**  
  * Glance dipilih karena menggunakan sintaks deklaratif (serupa Jetpack Compose) yang sangat efisien, cepat diproses, serta mengosumsi daya CPU/baterai lebih hemat dibanding RemoteViews tradisional.  
* **Manajemen Data Lokasi & Preferensi:** androidx.datastore:datastore-preferences  
* **Parser Jadwal:** org.json lokal memuat berkas lrt\_jabodebek\_widget\_schedule.json.

### **6\. Logika Pembaruan & Hemat Daya (Performance & Battery)**

1. **Local Computation Only:**  
   * Widget tidak melakukan permintaan HTTP/Internet terus-menerus yang memboroskan baterai. Seluruh kalkulasi menit dihitung secara lokal di perangkat berdasarkan jadwal JSON statis.  
2. **Dynamic Alarm Update:**  
   * Alih-alih membuat *background loop* konstan, widget menjadwalkan Exact Alarm / Glance Update tepat pada waktu keberangkatan kereta berikutnya untuk memperbarui angka hitung mundur secara akurat.

### **7\. Rencana Tahapan Pengembang (Roadmap)**

* **Fase 1 (MVP):**  
  * Implementasi JSON station\_index ke proyek Android Kotlin.  
  * Pembuatan Layar Konfigurasi Stasiun.  
  * Tampilan Widget Jetpack Glance dasar (Light & Dark Mode) dengan klasifikasi 2 arah.  
* **Fase 2 (Animasi & Polishing):**  
  * Penerapan Glassmorphism UI & rounded corner.  
  * Penerapan animasi ikon berkedip untuk kedatangan ![][image3] menit.  
  * Fitur Tap Widget untuk lansung buka aplikasi utama / ganti stasiun cepat.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAABF0lEQVR4XmNgGCqAUVpaWlheXl4SGSsoKHAA5ZiVlZXFQBgmDlIL0gPFGIB6hsnIyHDKycn5AjXvAir+B8WzgOLSSkpK/CA2FH8DqpsBpK3QzcAAQEWWQPwTinNAYlDDZkOxJroenADqwh0gDNR4QkVFRRTo2k5FRUUzEEZXTxAANUeAMNCwv1BvO6GrIRpQ1TCgd8RBGGjIdSBeAxRiQVdDNAC6JgCEgQbdBuInQKyIroYoANQYBDSoAISBbCt5pFglCYBiCxRzxsbGrCAMi1lQrIKSBwij68EJqGYYyEtAjf0gA5DFkWLVA4SR5VAAUDIeqPAOFP8HBTbQdXoweaDhxkCxG1C591A8GZiQ+ZDNGQWjYBQAAAaiV29B2un1AAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAaCAYAAABYQRdDAAAAlUlEQVR4XmNgGAWjYBgCGRkZXXl5eU10cYoA0EBFOTm5NHRxSgEj0NByoItVQBhdklxAE0MZlJSU+BUUFCaCsKKioh66PIMCBIAVAMNrFgn4AhSvUVFREUU3l2QA9L4L0BEFIAzkMqLLkwWobigoPEERZWxszArC6PJkAaCBNsBwDEYXpwhoaWmxUc2FMEATQ0fBMAIA2D8kHyG5oyQAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAaCAYAAADWm14/AAABYUlEQVR4Xu2UvUrDUBiGTwkOIiiCGAhJmz900iWDKLj0AlRU0FEcnES0OnkbOotuOthR8Bq8iQ7uTh2c9PlsjsRDjKW2BEpeeCjnnPf76XcOUapSpXFVGIYLjUbjCV5TOr7v73FUM71DVRRF8wIFbxzHmdP7rHeg63neRtY/dI2qAYvxbQokeXRdd8k0aHG+mvIOLb1fr9dnWb+Q4y7r/1UUmRQIOCCwDWsCR5bpzcq27SmBuDN5B3q/7wYkGPMJ3AtBECyrITwcRr9OA29/XkEpDcRxPC1guKToLUUXTc+g4hpmBPI+k/9c5fwZSwrr4vwGpmFQJUkyQb4rQd6Syin+Q+YU/jmJGrmOKbwlyEY6iSPT+K3SG9CSh0jwYUqbBCuqN77iEfb05SOuBdcU3NWwviDXqRlQKLlHgvbhQSBJUxV8CyiUCPi68JHDthnTr6SoPNhm0ZdwlCq9gUqVxlOfNO1gtoBF5J8AAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAaCAYAAAAue6XIAAACd0lEQVR4Xu2WT4hNURzH74QaESaex/v/j0Kz0JtIIUppwqShbCxYoDRlZkzNbkozi7eyGLJAykJJygqRhT3JRr2shljKyoKEz/f6ndw5c1/TzCA371efznm/f/d7zzn33hcEbWvbf2TpdHpZvV5fIvyYs1QqtbxUKu1x4Frs58zJKpXKRlEsFh/AO5ii8TFBuMPPl2Wz2dXEHxcKhbrw485yuVw3/e4bTyXez5mTJUZstVpdS5MbIpPJrJGP+RH4JPL5fJ9fg3UQG1d8NrEy4ofEgsXSYAd8Noblo3EX82eC1bvp1xDfSewK49u/KlYPCYKGhI6CfK3Eautt+xt6WFqIXSSoPWA3dA6OCyeWo5Gl/oLRYPd6NCc+KZhvD1ocvxlG8S6KPorIMdDWnze2mshpYvVWIHbVmEDU0lqttoL5LSMUi5hO5meNr9SPKRc2COKv8Z2KSGptiRHLUVhJ4iMnLLDtKJfL29TANYkTy7iPmjeCecX1LMScWVeH7yWsd7kWG8X3yj3wsWYrc4k7OxH8FBkK1QXwX3R3rubk7Gd8r1Eoxy4Sio0KmIdY5YZvmqjfWSiMhAEufFgOrbCt8ml8q/QgFH9tsbgHX2wUveSc+R1i+d0PH2BT1O8sMWIlcti4TIOjgvmIQMCgXyCzi/lndgs1U8Zel8t8wIgT29TRks/9z8B3R8z4z2EF4dcKvsfQP60AsxVswjcbm/Q5qBjzXuOF7UqD8bawfg+1U06sbhjfNXwnGa8bd/m9zr/uHzOtij7lGrlwp4h+vSIrGx4D3YDiC/rCzdcSJXY288X68X/G+MDsRuBzQw/jE4Rv9vPa1rak2w/y8iWMtiLjvAAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAdCAYAAADhLp8oAAAB2klEQVR4Xu2WvUvDUBTFU6ouKopSozRt0lYoFJwCLv4B0sEP/MBBByu4OXRyEAodnV0UQaqTqIOLkzgIju5u4ubi7OKi5+h7EC6pNKmClveDQ5P37jt5J8kNtSyD4U+TLBaL/ZSc+Ndks9k1qEHJud/C9/1uz/Oqrus+KL3g/AwalbWxcBxnHKbPMDyh5PxvgZu4ietV9Hk+nx/APm4wdp1KpfqoYH0k1F2rK8NWgiU8BY/F3Ce2bffmcjlbjguSfDq47iNrdT3OV6FXhPYpuahlOjYYzFdgMKNDtRCMa+YpbGDLEuH4OsFvHxt1g+NhoG4KPhXeXIpjbQdjX6nequG0K0ow6ytMAhdeRn2VxwwUJVQYDIf9nHtxe0wZ7FDpdNrhWMRgGh2ujt8DKm4ogv0sQvexPTKZzCwMNpTGlC60CoXCCMqScl0YuDHDWHOLUNuU1aTvvgNBJin4XHrtfOo7NhgMytCh0JMWzHehQblOgh4d0q8fWKB0z8naZqi1exR7lGPwmIb3BCXrIxOlxxgoGCo4FyWcCnWF+nUKfktKx+x93f+xgKEH81PoLaCjZk+sVCr1YL5GyVAarJ3DfFmOC/jhaaDuPUR3Hfm/1WAwGAwGg8Fg+Gk+AAzmn5EaWElWAAAAAElFTkSuQmCC>