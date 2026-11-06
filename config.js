/* ===================================================================
   SATU-SATUNYA BERKAS YANG PERLU ANDA UBAH
   Isi dengan alamat aplikasi Anda: alamat dasar yang berakhiran /exec
   TANPA tambahan apa pun (jangan pakai ?staff=1 atau ?page=alumni).
   =================================================================== */
var APP_URL = 'GANTI_DENGAN_ALAMAT_APLIKASI_ANDA';

/* true  = setelah memilih Alumni / Staf, aplikasi mengingat pilihan itu
           dan langsung membukanya pada peluncuran berikutnya. */
var INGAT_PILIHAN = true;

/* Halaman yang dimuat DIAM-DIAM di latar belakang setelah layar pertama siap,
   supaya berpindah ke sana nanti terasa instan. Urutan = urutan dimuat.
   Pilihan: 'alumni', 'staf'. Kosongkan ([]) bila HP cepat panas / RAM kecil. */
var PRAMUAT = ['alumni', 'staf'];

/* HP dengan RAM di bawah angka ini (dalam GB) tidak memuat di latar belakang. */
var PRAMUAT_MIN_RAM = 3;
