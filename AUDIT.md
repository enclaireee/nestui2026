# AUDIT — NEST UI 2026

> **STATUS: Fase 2 selesai.** Laporan di bawah adalah temuan Fase 1 (kondisi
> sebelum perbaikan) dan sengaja dibiarkan apa adanya sebagai catatan. Apa yang
> sudah dikerjakan, apa yang belum, dan satu temuan besar yang **tidak** ada di
> audit awal ada di [Hasil Fase 2](#hasil-fase-2) di bagian paling bawah.

Fase 1: investigasi. Tidak ada kode yang diubah.

**Konteks yang saya simpulkan sendiri dari kode** (bukan dari kamu — koreksi kalau salah):
- **Web**: NEST UI 2026, situs kompetisi National Electrical Summit (IME FTUI, Universitas Indonesia).
- **Target user**: mahasiswa S1 & siswa SMA se-Indonesia yang mau ikut MedHack / Healthineer / Healthynovation.
- **Aksi paling penting**: daftar akun → daftar tim → bayar → submit link Google Drive → lihat status di dashboard.
- **Stack**: Next.js 16 (App Router, Turbopack, `cacheComponents`), React 19, Tailwind 3.4, framer-motion, Supabase (auth + Postgres + RLS), deploy Vercel.
- **Live**: belum bisa saya pastikan (lihat Uncertain).

---

## 1. Verdict

Backend-nya jauh lebih matang dari frontend-nya — schema, RLS deny-by-default, RPC `SECURITY DEFINER`, rate limit yang fail-closed khusus admin login, CSP, dan guard CSV formula-injection itu semua kelas produksi beneran, bukan tempelan. Yang belum sepadan adalah lapisan yang dilihat peserta: wizard registrasi 4 langkah dengan 35+ field menyimpan seluruh draft cuma di memori, jadi satu refresh atau session expired = semua isian hilang tanpa peringatan. Ada satu halaman live (`/branding/more-submission`) yang tombol Submit-nya harfiah `console.log` — peserta bisa mengisi form lengkap dan datanya menguap. Secara visual ini bukan "AI slop": ada palet brand yang di-token-kan, aset Figma asli, dan copywriting yang spesifik ke acaranya — masalahnya bukan generik, melainkan tidak konsisten (delapan nilai radius, string kelas tombol yang sama di-paste sebelas kali padahal `.btn-brand` sudah ada). Jarak ke standar profesional: sekitar dua batch kerja terarah — satu batch untuk yang bikin peserta kehilangan data, satu untuk konsistensi + performa.

## 2. Skor

| Area | Skor | Alasan |
|---|---|---|
| Visual | 7/10 | Palet brand khas dan aset asli, bukan template; tapi hierarki antar section rata dan efek shadow-layer dipakai berlebihan. |
| Layout & Spacing | 6/10 | Skala gap konsisten (nyaris semua 4/8px), tapi container width beda-beda per halaman dan `min-h-screen` dipaksa di halaman yang isinya sedikit. |
| Motion | 6/10 | Token easing/duration ada di `lib/motion.ts` dan dipakai; tapi `prefers-reduced-motion` nol dan `duration-300` dipakai untuk semuanya. |
| Alur User | 4/10 | Draft hilang saat refresh, satu halaman submit yang tidak menyimpan apa pun, dan user yang sudah daftar satu lomba terkunci dari lomba lain. |
| UX Completeness | 5/10 | Tidak ada `<label>` satu pun, tidak ada 404 custom, modal tanpa focus trap/Esc, tidak ada toast sukses. |
| Copywriting | 6/10 | Error auth sudah dipetakan ke bahasa manusia (bagus), tapi Inggris/Indonesia campur dan status "pending" tidak dijelaskan artinya. |
| Performa | 4/10 | `aboutbackground.webp` 17 MB dipasang sebagai CSS background di dua halaman, lewat jalur yang tidak dioptimasi Next. |
| Backend | 9/10 | Transaksi atomik lewat RPC, validasi server-side penuh, constraint di DB, pagination admin. |
| Security | 9/10 | RLS deny-all + policy sempit, HMAC session admin, constant-time compare, CSP, rate limit berlapis. |

## 3. Tabel Alur User

### Alur A — Daftar akun → verifikasi → login

| Langkah | Titik gagal | Sekarang terjadi apa | Seharusnya | Severity |
|---|---|---|---|---|
| Isi sign-up | Password lemah | Supabase menolak, pesan sudah diterjemahkan `lib/auth-errors.ts:27` | ✅ sudah benar | — |
| Kirim email | Rate limit proyek | Pesan "ini di sisi kami, bukan kamu" `lib/auth-errors.ts:12` | ✅ sudah benar | — |
| Klik link email | — | Tidak ada `app/auth/confirm/route.ts` di working tree (terhapus, lihat git status) | Verifikasi harus punya route handler | CRITICAL (lihat C-5) |
| Login | Sudah login lalu buka `/auth/login` | Redirect ke `/protected` `lib/supabase/proxy.ts:55` | ✅ sudah benar | — |
| Deep link `/branding/registration` tanpa login | — | Redirect ke `/auth/login`, **tapi tujuan asal tidak disimpan** — setelah login user mendarat di `/protected`, bukan di halaman registrasi | Simpan `?next=` dan kembalikan | MEDIUM |

### Alur B — Registrasi tim (alur inti, 4 langkah, s/d 36 field)

| Langkah | Titik gagal | Sekarang terjadi apa | Seharusnya | Severity |
|---|---|---|---|---|
| 1 Pilih lomba + nama + ukuran tim | Refresh browser | **Semua isian hilang**, balik ke step 1 (`registration-client.tsx:135`, state hanya `useReducer`) | Persist draft ke `sessionStorage` per perubahan | CRITICAL |
| 2 Isi data leader (7 field) | Ada field kosong | Error muncul inline per field ✅, tapi **tidak ada scroll/focus ke error pertama** (`registration-client.tsx:152-155`) | Fokuskan input error pertama | HIGH |
| 3 Isi data 1–4 anggota (7 field × 4 = 28) | Error di anggota ke-4 | Pesan error ada di bawah lipatan layar, tombol Next tetap di bawah — user mengira tombolnya rusak | Scroll ke error + ringkasan error di atas tombol | HIGH |
| 3 | Tutup browser di tengah | Semua hilang | Draft persisted | CRITICAL |
| 4 Review + submit | Klik Submit 5× cepat | Aman: `submitting` men-disable + `disabled:pointer-events-none` (`review-submit.tsx:129-130`), dan DB punya `uq_reg_user_competition` | ✅ sudah benar | — |
| 4 | Koneksi putus saat submit | Server Action reject → `SUBMIT_ERROR` dengan pesan generik; draft **masih utuh di memori** ✅, bisa retry | ✅ tapi pesannya perlu langkah berikutnya | LOW |
| 4 | Session expired saat submit | Balik `"You must be logged in to register a team."` (`actions.ts:26`) — user harus login ulang, dan **draft hilang saat navigasi ke login** | Persist draft dulu, baru arahkan login | CRITICAL |
| 4 | Pendaftaran sudah tutup | Ditolak server (`actions.ts:41`) ✅ — tapi user baru tahu **setelah** mengisi 36 field | Cek `currentFee()` di step 1, sembunyikan lomba yang tutup | HIGH |
| 5 Thank-you | Refresh halaman | Kode registrasi hilang dari layar (hanya di state) | Kode juga ada di dashboard — sudah aman, tapi harus disebut | LOW |
| Setelah selesai, mau daftar lomba **kedua** | — | `/branding/registration` query `.limit(1).maybeSingle()` (`page.tsx:20-24`) → tampil "Already Registered", **user terkunci** meski DB mengizinkan satu tim per (user, lomba) | Filter existing per-kompetisi, bukan per-user | CRITICAL |

### Alur C — Submit tambahan (Entry 2+)

| Langkah | Titik gagal | Sekarang terjadi apa | Seharusnya | Severity |
|---|---|---|---|---|
| Dashboard → "Submit again" | — | Ke `/protected/resubmit/[id]`, ownership dicek 2× (RLS + RPC) ✅ | ✅ sudah benar | — |
| Isi 2 link → Submit | Sukses | `router.push("/protected")` tanpa konfirmasi apa pun (`resubmit-form.tsx:30`) — user tidak yakin tersimpan | Toast / highlight entry baru | MEDIUM |
| Tekan Back setelah submit | — | Form kosong lagi (state client) — aman, tidak ada resubmit | ✅ sudah benar | — |
| Buka `/branding/more-submission` | Halaman **live & prerendered**, tidak di-link dari mana pun | Form dua textarea, tombol Submit menjalankan `console.log("Submit clicked")` (`more-submission-client.tsx:11-17`). **Peserta mengisi, menekan Submit, tidak terjadi apa-apa, data hilang** | Hapus route + komponennya | CRITICAL |

### Alur D — Admin

| Langkah | Titik gagal | Sekarang terjadi apa | Seharusnya | Severity |
|---|---|---|---|---|
| Login admin | Brute force | Rate limit per-IP + global, keduanya fail-closed (`app/admin/login/actions.ts:38-43`) | ✅ sudah benar | — |
| Hapus tim | Klik Delete | Ada konfirmasi (`delete-team-button.tsx`), tapi cek isi pesannya (lihat M-9) | Konfirmasi sebut nama tim + jumlah anggota yang ikut terhapus; tidak ada undo | MEDIUM |
| Export CSV | Hammering | Rate limit 20/10menit + `Cache-Control: no-store` + BOM UTF-8 + guard formula-injection | ✅ sudah benar, ini rapi | — |

## 4. Inventaris Sistem

Diambil langsung dari codebase (`grep` seluruh `app/` + `components/`).

| Kategori | Nilai unik ditemukan | Vonis |
|---|---|---|
| **Border radius** | `rounded-xl`(32×), `rounded-2xl`(27×), `rounded-full`(24×), `rounded-lg`(12×), `rounded-3xl`(5×), `rounded-[2rem]`(4×), `rounded-md`(1×), `rounded-none`(1×) → **8 nilai** | ❌ Tidak ada sistem per-kategori. Tombol primer memakai `rounded-xl` (`auth-form.tsx:65`), `rounded-2xl` (`review-submit.tsx:130`), dan `rounded-full` (`site-header.tsx:95`) — tiga radius untuk satu peran komponen. |
| **Font size** | `text-sm`(90×), `xs`(33), `lg`(18), `2xl`(15), `base`(14), `3xl`(12), `5xl`(11), `xl`(7), `6xl`(7), `4xl`(6), `8xl`(2), `7xl`(2) → **12 langkah** | ⚠️ Skala Tailwind default, jadi konsisten. Tapi `text-6xl` sampai `text-8xl` dipakai berbarengan tanpa aturan display-scale, dan `letter-spacing` tidak pernah di-adjust untuk display text. |
| **Font weight** | `font-medium/semibold/bold/extrabold/black` | ❌ **Semua render identik.** `app/layout.tsx:44-58` hanya punya satu file (`Oddval-Semibold.ttf`) yang di-map ke `weight: "100 900"`. Jadi seluruh hierarki berat huruf di situs ini adalah ilusi — browser mensintesis atau tidak sama sekali. |
| **Warna** | 11 token brand di `globals.css:14-24` ✅ + hex hardcode di 10 lokasi | ⚠️ Sistemnya bagus, penegakannya bocor: `#0C342C` ditulis ulang di `site-header.tsx:57,71,96,127`, `site-footer.tsx:7,22`, `pop-up-template.tsx:40`, `protected/layout.tsx:8,12`; `#0E8057/#076653` di `team-setup.tsx:29`; palet admin sendiri (`#0A2A22`,`#07160F`,`#0A261F`) di `admin-background.tsx:6-7`. |
| **Shadow** | `shadow-sm/md/lg/2xl/inner` + 3 arbitrary glow (`shadow-[0_0_30px_-6px_rgba(227,239,38,0.75)]` `team-setup.tsx:89`, `shadow-[0_8px_20px_-6px_...]` `:179`, `boxShadow` inline `cta.tsx:51`) | ⚠️ Skala Tailwind + tiga one-off. Yang inline di `cta.tsx` tidak lewat token warna sama sekali (`rgba(124, 165, 74, 0.18)` — hijau yang tidak ada di palet). |
| **Durasi animasi** | `duration-300`(35×), `duration-200`(5×), `duration-500`(1×), + framer 0.6s/0.5s/0.4s/0.3s | ⚠️ 300ms jadi default untuk semuanya termasuk micro-interaction hover (harusnya 120–200ms). `duration-500` di satu tempat adalah outlier tanpa alasan. |
| **Spacing** | `gap-1 … gap-24`, seluruhnya di skala 4px. Arbitrary hanya 3: `mt-[60px]`(2×), `pl-[11.6%]`, `p-[2px]` | ✅ **Ini yang paling rapi.** Tidak ada 13px/17px/22px. `pl-[11.6%]` di `hero.tsx:55` punya komentar alasan (align ke lobe SVG) — sah. |

**Kesimpulan inventaris**: spacing dan warna punya sistem nyata. Radius dan font-weight tidak.

## 5. Temuan

### CRITICAL

**C-1. Halaman submit yang tidak menyimpan apa pun** — `app/branding/more-submission/more-submission-client.tsx:11-17`, `components/registration/steps/submission.tsx:12-98`
Route `/branding/more-submission` di-prerender static dan bisa diakses siapa saja. Formnya minta proof of payment + submission link, tombol Submit menjalankan `console.log("Submit clicked")`. Peserta yang menemukan URL ini (share link, riwayat browser, crawler) akan mengisi bukti transfer lalu mengira submission-nya masuk. Tidak ada satu pun link ke halaman ini di codebase — ini sisa prototipe yang ikut ter-deploy.
**Perbaikan**: hapus `app/branding/more-submission/` dan `components/registration/steps/submission.tsx`. Alur asli sudah ditangani `/protected/resubmit/[id]` yang benar. — **Effort: S**

**C-2. Draft registrasi hilang total saat refresh / session expired** — `components/registration/registration-client.tsx:135-143`
Seluruh `RegistrationDraft` (sampai 36 field: 5 orang × 7 field + data tim + 2 link) hanya hidup di `useReducer`. Refresh, tutup tab, klik link eksternal (misal link `@nest_ui` di `person-form.tsx:108` yang membuka Instagram — di mobile ini bisa menggusur tab), atau session Supabase expired saat submit → semua hilang, kembali ke step 1. Ini alur inti produk, diisi di jam-jam deadline.
**Perbaikan** (paling malas yang benar — satu `useEffect`, tanpa library):
```ts
const KEY = "nest-reg-draft";
const [state, dispatch] = useReducer(reducer, undefined, () => ({
  ...initial,
  draft: JSON.parse(sessionStorage.getItem(KEY) ?? "null") ?? emptyDraft(),
}));
useEffect(() => { sessionStorage.setItem(KEY, JSON.stringify(state.draft)); }, [state.draft]);
```
Bersihkan key-nya di `SUBMIT_SUCCESS`. `sessionStorage` (bukan `localStorage`) supaya tidak bocor ke tab/user lain di komputer bersama — ini komputer lab kampus. — **Effort: S**

**C-3. User terkunci dari lomba kedua** — `app/branding/registration/page.tsx:20-24` + `components/registration/already-registered.tsx:23`
Query `.select("team_name, competition").limit(1).maybeSingle()` mengambil registrasi **apa pun** milik user, lalu merender `AlreadyRegistered`. Padahal constraint DB adalah `uq_reg_user_competition` — satu tim per **(user, kompetisi)**, bukan per user. Peserta yang sudah daftar Healthineer secara fisik tidak bisa mendaftar Medhack lewat UI. Copy-nya bahkan menegaskan aturan yang salah: *"Only one team per account."*
**Perbaikan**: halaman registrasi tidak tahu kompetisi mana yang mau dipilih user sampai step 1 selesai, jadi jangan hard-block di level halaman. Ambil semua `competition` milik user, teruskan sebagai prop ke `RegistrationClient`, dan disable kartu lomba yang sudah terdaftar di `team-setup.tsx` dengan badge "Sudah terdaftar → lihat dashboard". — **Effort: M**

**C-4. Background 17 MB di jalur render dua halaman** — `app/branding/aboutpage/page.tsx:21`, `app/protected/layout.tsx:9`
```
17M  public/aboutbackground.webp
```
Dipasang lewat `style={{ backgroundImage: "url(...)" }}`, jadi **melewati `next/image` sepenuhnya** — tidak ada resize, tidak ada srcset, tidak ada lazy. Di koneksi 4G Indonesia (~5 Mbps riil) itu ±27 detik sebelum halaman About terlihat benar, dan halaman dashboard peserta ikut kena. Total `public/` ≈ 48 MB; `misicontainer.webp` 1.3 MB dan tiga logo lomba masing-masing ~500 KB untuk ditampilkan pada 56 px (`team-setup.tsx:102`).
**Perbaikan**: kompres ulang `aboutbackground.webp` ke ≤300 KB pada lebar 1920 (dan varian mobile), atau render lewat `<Image fill priority>` supaya Next mengoptimasi. Turunkan logo lomba ke ≤40 KB. — **Effort: S** (murni aset, tanpa sentuh kode kalau ganti file di tempat)

**C-5. Route konfirmasi email hilang dari working tree** — `git status`
```
D app/auth/confirm/route.ts
D app/auth/confirmed/page.tsx
D app/auth/sign-up-success/page.tsx
D app/auth/error/page.tsx
```
Keempatnya terhapus (belum di-commit). Kalau Supabase Auth masih mengirim link verifikasi ke `/auth/confirm`, setiap pendaftar baru mendarat di 404 — dan 404-nya default Next (lihat H-4), halaman putih tanpa branding. Ini memutus alur paling awal.
**Perbaikan**: konfirmasi apakah penghapusan disengaja. Kalau ya, redirect URL di Supabase Dashboard harus diganti. Kalau tidak, `git restore` keempatnya. — **Effort: S** — ⚠️ butuh keputusanmu, lihat Uncertain.

### HIGH

**H-1. Tombol CTA yang tidak melakukan apa-apa** — `app/branding/mainpage/section/cta.tsx:43-69`
`<button>` "Become Our Partner" tanpa `onClick` dan tanpa `href`. Section ini dirender di **dua** halaman (`mainpage/page.tsx:53` dan `aboutpage/page.tsx:30`), jadi ini CTA mati di dua tempat, tepat di bawah paragraf yang mengajak sponsor menghubungi kalian. Sponsor yang tertarik menekan tombol, tidak terjadi apa-apa, pergi.
**Perbaikan**: jadikan `<a href="mailto:...">` atau link ke form partnership. — **Effort: S**

**H-2. Modal tanpa focus trap, Esc, atau semantik dialog** — `components/registration/pop-up-template.tsx:36-59`
Dipakai untuk konfirmasi logout (`site-header.tsx:143`) dan modal detail kompetisi. Tidak ada `role="dialog"`, `aria-modal`, tidak menutup dengan Esc, tidak menutup saat klik backdrop, fokus tidak dipindah ke dalam modal, dan tidak dikembalikan ke tombol pemicu saat ditutup. Pengguna keyboard bisa nge-tab keluar ke konten di belakang overlay yang tidak terlihat.
**Perbaikan malas yang benar** — pakai `<dialog>` native: `showModal()` memberi focus trap, Esc, dan `::backdrop` gratis dari platform. Kalau tidak mau menyentuh markup: tambah `onClick` di backdrop + `useEffect` listener Esc + `autoFocus` di tombol close (~10 baris). — **Effort: S**

**H-3. Nol `<label>` di seluruh aplikasi** — `components/registration/registration-input.tsx`, `components/registration/steps/person-form.tsx:36-129`, semua form auth
`grep -rn "<label" app components` → tidak ada hasil. Setiap field diidentifikasi hanya lewat `placeholder`, yang **hilang begitu user mulai mengetik**. Di form 7 field berulang untuk 5 orang, user yang di-interrupt lalu kembali tidak tahu kolom mana yang sedang diisi. Screen reader membacakan input tanpa nama. Ini juga alasan `autocomplete` tidak pernah kena — browser tidak bisa autofill nama/email/telepon yang tidak berlabel.
**Perbaikan**: `RegistrationInput` sudah punya wrapper; tambahkan prop `label` yang merender `<label htmlFor>` di atas input, dan `autoComplete` (`name`, `email`, `tel`, `organization`). Placeholder tetap boleh, tapi sebagai contoh isi, bukan sebagai label. — **Effort: M**

**H-4. Tidak ada 404 yang di-desain** — tidak ada `app/not-found.tsx`
Setiap URL salah ketik, setiap link kadaluarsa, dan (kalau C-5 benar) setiap link verifikasi email menampilkan halaman 404 bawaan Next: teks hitam-putih, font sistem, tanpa header, tanpa jalan kembali. Kontras dengan situs hijau-lime di sekitarnya membuatnya terbaca sebagai "situsnya rusak", bukan "URL-nya salah".
**Perbaikan**: `app/not-found.tsx` yang meminjam shell yang sama seperti `app/error.tsx` (yang sudah ada dan sudah rapi) + tombol ke Home dan ke Dashboard. — **Effort: S**

**H-5. Error validasi bisa berada di luar layar** — `components/registration/registration-client.tsx:152-165`
Saat step "members" dengan 4 anggota (≈28 field, tinggi > 3 layar), menekan Next dengan satu field kosong men-dispatch error inline — tapi viewport tidak bergerak. User melihat tombol Next yang seolah tidak merespons.
**Perbaikan**: setelah dispatch error, `document.querySelector('[aria-invalid="true"]')?.focus()`. Satu baris; `aria-invalid` sudah dipasang di semua input (`person-form.tsx:41`). — **Effort: S**

**H-6. Deadline lomba baru ketahuan setelah 36 field** — `app/branding/registration/actions.ts:41-42` vs `components/registration/steps/team-setup.tsx:77-136`
Server menolak submit kalau `currentFee()` sudah null (benar). Tapi picker lomba di step 1 tidak pernah memanggil `currentFee()` — semua lomba tampil sama-sama tersedia. Peserta bisa mengisi seluruh wizard untuk lomba yang sudah tutup, baru ditolak di layar terakhir.
**Perbaikan**: di `team-setup.tsx`, disable kartu yang `currentFee(c.id) === null` dengan label "Pendaftaran ditutup". Sekaligus tampilkan biaya + deadline tier di kartunya — ini informasi yang sekarang baru muncul di step 4 (`review-submit.tsx:44`), padahal menentukan pilihan lomba. — **Effort: S**

**H-7. Sistem tombol yang ada tidak dipakai** — `app/globals.css:90-95` vs 11 lokasi
`.btn-brand` sudah dibuat sebagai single source of truth, dan hanya `auth-form.tsx:65` memakainya. String utilitas yang setara di-paste ulang di: `registration-client.tsx:284,291`, `review-submit.tsx:122,130`, `team-setup.tsx:195`, `already-registered.tsx:27`, `resubmit-form.tsx:111,118`, `protected/page.tsx:145,247`, `theme.tsx:114`, `site-header.tsx:151,157`. Salinan-salinan itu sudah menyimpang: sebagian `rounded-xl`, sebagian `rounded-2xl`, sebagian `hover:scale-105`, sebagian `hover:scale-[1.02]`. Ini persis mekanisme yang membuat sebuah situs terlihat "dirakit" alih-alih "didesain" — dua tombol primer bersebelahan dengan radius dan respons hover berbeda.
**Perbaikan**: ganti kesebelas lokasi jadi `className="btn-brand …"`, dan tambah `.btn-ghost` untuk varian outline lime yang juga di-paste 4×. — **Effort: M**

**H-8. Hierarki font-weight tidak ada secara fisik** — `app/layout.tsx:44-58`
Satu file `Oddval-Semibold.ttf` di-deklarasikan `weight: "100 900"`. Konsekuensinya `font-medium`, `font-bold`, `font-extrabold`, dan `font-black` — yang dipakai di ratusan tempat untuk membedakan judul dari body — semuanya menggambar glyph yang sama persis. Semua teks tampil satu bobot. Itu sebabnya (bersama F-1 di bawah) semua section terasa punya bobot visual setara.
**Perbaikan**: minta file Regular + Bold dari desainer dan daftarkan per-weight. Sampai itu ada, jangan bergantung pada weight untuk hierarki — pakai size dan warna. — **Effort: S** (kodenya sepele; blockernya aset)

**H-9. `prefers-reduced-motion` tidak ada sama sekali** — seluruh codebase
Nol hasil. Situs ini punya animasi scroll-reveal (`lib/motion.ts`), slide header, transisi step wizard, hover-scale di setiap tombol, dan marquee sponsor yang berjalan terus-menerus (`tailwind.config.ts:animation.marquee`, 20s infinite). Untuk pengguna dengan gangguan vestibular, marquee yang tidak bisa dihentikan itu masalah nyata, bukan preferensi.
**Perbaikan**: satu blok di `globals.css` — `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }`, plus `useReducedMotion()` dari framer-motion di `motion.ts`. — **Effort: S**

### MEDIUM

**M-1. Dua file route yang 95% identik** — `app/branding/registration/page.tsx` vs `app/branding/registration/sma/page.tsx`
Berbeda persis satu baris: `<RegistrationClient />` vs `<RegistrationClient category="sma" />`. Sisanya (SVG background, dua floater, cek auth, cek existing) disalin utuh. Setiap perbaikan pada C-3 harus dikerjakan dua kali.
**Perbaikan**: `app/branding/registration/[[...category]]/page.tsx`, atau ekstrak shell latar ke satu komponen. — **Effort: S**

**M-2. Tiga query berurutan di dashboard** — `app/protected/page.tsx:64-95`
`registrations` → `team_members` → `submissions`, sekuensial. Query 2 dan 3 tidak saling bergantung dan bisa di-`Promise.all`. Lebih baik lagi: admin sudah punya view `admin_registrations_detail` yang melakukan join ini di DB — versi peserta belum ada.
**Perbaikan**: minimal `Promise.all([members, subs])` — hemat satu round-trip. — **Effort: S**

**M-3. Status "pending" tanpa penjelasan** — `components/status-badge.tsx`, `app/protected/page.tsx:276`
Peserta melihat badge kuning "pending" tanpa tahu berapa lama verifikasi, siapa yang memverifikasi, atau apa yang harus dilakukan kalau berubah jadi "rejected". "rejected" khususnya: tidak ada alasan, tidak ada jalur banding, tidak ada tombol perbaiki.
**Perbaikan**: helper text di bawah badge per status. Untuk `rejected`, tampilkan kontak panitia dan link "Submit again". — **Effort: S**

**M-4. Tidak ada umpan balik sukses di mana pun** — `components/registration/resubmit-form.tsx:29-31`
Submit berhasil → `router.push("/protected")`. Halaman berganti, tidak ada konfirmasi. Pola yang sama di seluruh aplikasi: tidak ada satu pun toast.
**Perbaikan**: `?submitted=1` di URL tujuan + banner sekali-tampil di dashboard. Tidak perlu library toast. — **Effort: S**

**M-5. Judul wizard 60px di layar 360px** — `components/registration/registration-client.tsx:178`
`text-6xl md:text-7xl` — tanpa varian mobile, "Member Registration" jadi tiga baris setinggi ~180px, mendorong seluruh form ke bawah lipatan sebelum user melihat satu field pun. Sama di `already-registered.tsx:15` (`text-5xl`) dan `more-submission/page.tsx:32`.
**Perbaikan**: `text-3xl sm:text-5xl md:text-7xl`. — **Effort: S**

**M-6. Redirect setelah login tidak mengembalikan ke tujuan** — `lib/supabase/proxy.ts:48-52`
Deep link ke `/branding/registration` tanpa sesi → dilempar ke `/auth/login`, lalu setelah login mendarat di `/protected`. User harus menavigasi ulang.
**Perbaikan**: `url.searchParams.set("next", pathname)` saat redirect, dan hormati di form login. — **Effort: S**

**M-7. Teks judul sebagai path SVG raksasa** — `app/branding/mainpage/section/competition.tsx:9-90`
"Our COMPETITION" adalah satu `<path>` sepanjang ±8 KB di dalam bundle JS client. Tidak bisa diseleksi, tidak terbaca screen reader, tidak terindeks mesin pencari, dan ikut dikirim ulang di setiap page load. Tidak ada `<title>`/`aria-label` di `<svg>`-nya.
**Perbaikan**: kalau tampilannya wajib begitu, jadikan file `.svg` statis yang dirender lewat `<Image alt="Our Competition">` — keluar dari bundle JS, masuk cache browser. — **Effort: S**

**M-8. Kilat "--" pada countdown** — `app/branding/mainpage/section/hero.tsx:12,99-101`
`useCountdown` mengembalikan `null` di render pertama, jadi hero — elemen paling atas halaman utama — menampilkan `-- Days -- Hours -- Minutes` sampai efek jalan. Posisinya absolut jadi tidak ada layout shift ✅, tapi kesan pertamanya adalah data yang belum termuat.
**Perbaikan**: hitung nilai awal secara sinkron di `useState` initializer; hidrasi mungkin beda satu menit dari server, tapi ini `"use client"` tanpa SSR value yang perlu dicocokkan. — **Effort: S**

**M-9. Konfirmasi hapus dan konfirmasi logout memakai copy generik** — `components/site-header.tsx:147`
`content="Are you sure you want to log out?"` — persis pola "Apakah Anda yakin?" yang tidak memberi tahu apa yang hilang. Untuk logout dampaknya kecil; periksa `delete-team-button.tsx` untuk memastikan penghapusan tim (aksi destruktif, cascade ke seluruh anggota, tanpa undo) menyebut nama tim dan jumlah anggota.
**Perbaikan**: konfirmasi hapus harus berbunyi "Hapus tim *Nama Tim* beserta 4 anggotanya? Tindakan ini tidak bisa dibatalkan." — **Effort: S**

**M-10. Bahasa campur tanpa aturan** — `lib/registrations/validate.ts:23`, `config.ts:6`, `app/branding/aboutpage/sections/documentation.tsx`
UI berbahasa Inggris, tapi: `"Major / Jurusan is required."`, tipe `Category = "mahasiswa" | "sma"` bocor ke URL `/branding/registration/sma`, komponen bernama `Dokumentasi`, dan `sanitize` menghasilkan pesan Inggris untuk audiens Indonesia. Bukan salah — tapi belum ada keputusan.
**Perbaikan**: pilih satu bahasa untuk UI peserta (saya sarankan Indonesia, karena audiensnya siswa SMA se-Indonesia) dan konsisten. — **Effort: M**

### LOW

**L-1. Komponen mati** — `components/registration/steps/submission.tsx` (ikut terhapus bersama C-1), berisi juga `<a href="#">Example</a>` yang menuju ke mana-mana.
**L-2. Komentar duplikat** — `app/branding/mainpage/section/theme.tsx:5-6`, baris identik dua kali.
**L-3. `duration-500` sebatang kara** — satu-satunya di codebase; selaraskan ke 300 atau beri alasan.
**L-4. Warna di luar palet** — `cta.tsx:49`, `rgba(124, 165, 74, 0.18)`, hijau yang tidak ada di 11 token brand.
**L-5. Micro-interaction terlalu lambat** — `duration-300` untuk hover tombol (35 lokasi). Patokan hover adalah 120–200ms; 300ms terasa berat, terutama digabung dengan `hover:scale-105`.
**L-6. Sitemap hanya 2 URL** — `app/sitemap.ts:8-11`. Halaman registrasi memang sengaja tidak diindeks, tapi kalau nanti ada halaman guidebook/FAQ publik, ingat menambahkannya.

## 6. Yang Sudah Bagus

Ini bukan basa-basi — beberapa bagian di sini di atas rata-rata proyek kepanitiaan kampus dan bahkan di atas sebagian produk komersial:

- **Model keamanan backend.** RLS deny-by-default dengan tepat satu policy `select` sempit, semua tulis lewat RPC `SECURITY DEFINER` yang `EXECUTE`-nya hanya diberikan ke `service_role`, plus pencabutan privilege eksplisit di atas RLS. `lib/supabase/admin.ts:1` memakai `import "server-only"` sehingga secret key mustahil bocor ke bundle — build gagal kalau ada yang salah import.
- **Rate limiting yang dipikirkan, bukan disalin.** Fail-open untuk form registrasi (limit itu anti-spam; error DB tidak boleh mengunci peserta saat deadline) dan fail-closed untuk login admin (limit itu satu-satunya pertahanan brute-force). Perbedaan itu didokumentasikan di `lib/rate-limit.ts:8-14`. Ditambah key global yang tidak terikat IP karena XFF bisa dipalsukan.
- **`csvSafe()`** (`lib/sanitize.ts:37-42`) — guard formula-injection CSV. Kebanyakan orang tidak tahu kelas kerentanan ini ada.
- **Constant-time compare** untuk kredensial admin, dan token sesi HMAC-SHA256 lewat Web Crypto tanpa menambah satu dependency pun.
- **CSP dengan komentar jujur** (`next.config.ts:3-14`) yang menjelaskan mengapa `unsafe-inline` diterima dan kapan harus di-upgrade. Ini catatan keputusan, bukan alasan.
- **`friendlyAuthError()`** — memetakan pesan developer Supabase ke copy yang memberi tahu langkah berikutnya, dengan fallback yang tidak menyembunyikan error asli. `lib/auth-errors.ts:12` khususnya bagus: memberi tahu user bahwa rate limit email itu masalah panitia, bukan kesalahan mereka.
- **Validasi tiga lapis** — client (UX), Server Action (`validateDraft` dipanggil ulang), dan constraint di dalam fungsi Postgres. Ditambah unique constraint, foreign key `on delete cascade`, dan insert atomik.
- **Skala spacing bersih.** Hampir 130 nilai gap/padding, semuanya di skala 4px, hanya tiga arbitrary value dan salah satunya (`pl-[11.6%]`) punya komentar alasan geometris. Sangat sedikit codebase yang selurus ini.
- **Matcher proxy yang ketat** dengan alasan tertulis (`proxy.ts:26-33`) — menghindari `getUser()` blocking di setiap halaman publik. Itu perbaikan performa nyata yang sudah dikerjakan.
- **SEO dasar lengkap**: metadataBase, template title, OG + Twitter image, `icon.png`, robots dengan disallow area privat, sitemap.
- **Ada `error.tsx` DAN `global-error.tsx`** dengan komentar yang menjelaskan bedanya. Mayoritas proyek tidak punya satu pun.

## 7. Uncertain

1. **`/auth/confirm` dkk sengaja dihapus?** Empat file auth ada di `git status` sebagai deleted tapi belum di-commit. Kalau flow verifikasi email dipindah ke tempat lain, C-5 bukan masalah. Kalau belum — setiap pendaftar baru mendarat di 404. **Saya butuh jawabanmu sebelum menyentuh ini.**
2. **"Satu tim per akun" itu aturan panitia atau bug?** DB-nya per-(user,kompetisi); UI-nya per-user; copy-nya bilang per-user. Dua dari tiga bisa salah. Kalau aturannya memang satu lomba per orang, C-3 turun jadi LOW (cuma perlu constraint DB yang cocok).
3. **`/branding/more-submission` — sisa prototipe atau fitur yang belum selesai?** Saya asumsikan sisa, karena `/protected/resubmit/[id]` sudah melakukan hal yang sama dengan benar.
4. **Tombol "Become Our Partner" harus ke mana?** Email panitia, form, atau WhatsApp?
5. **Sudah live atau belum, dan di domain apa?** `NEXT_PUBLIC_SITE_URL` menentukan sitemap/OG. Kalau sudah live saya ingin mengukur Core Web Vitals asli, bukan menaksir dari ukuran aset.
6. **Efek shadow-layer** (`theme.tsx:29-35,40-52,90-96` — setiap heading dirender dua kali, satu blur-[10px] di belakang) — pilihan desain atau tambalan? Efeknya oke, tapi biayanya menggandakan node teks yang dibaca screen reader (tanpa `aria-hidden` di layer bayangan) dan `blur()` besar itu mahal saat scroll. Saya taruh di sini, bukan di Temuan, karena hasil visualnya memang disengaja.
7. **Bahasa target.** Saya condong ke Indonesia untuk UI peserta; tapi kalau ada peserta internasional, Inggris tetap benar dan yang perlu diperbaiki hanya kebocoran istilah Indonesia.

## 8. Rencana Eksekusi

Empat batch, bisa di-review terpisah. Batch 1 dan 2 adalah yang sebenarnya penting.

### Batch 1 — Stop the bleeding (impact tinggi, effort rendah)
Semuanya S, tidak ada yang menyentuh arsitektur.
1. Hapus `/branding/more-submission` + `steps/submission.tsx` (C-1)
2. Persist draft ke `sessionStorage` (C-2)
3. Kompres `aboutbackground.webp` + logo lomba (C-4)
4. Tambah `app/not-found.tsx` (H-4)
5. Perbaiki tombol "Become Our Partner" (H-1) — **butuh jawaban Uncertain #4**
6. Focus ke error pertama saat validasi gagal (H-5)
7. Blok `prefers-reduced-motion` (H-9)

### Batch 2 — Alur peserta tidak boleh menjebak
1. Perbaiki kunci lomba kedua (C-3) — **butuh jawaban Uncertain #2**
2. Pulihkan atau alihkan flow konfirmasi email (C-5) — **butuh jawaban Uncertain #1**
3. Disable lomba yang sudah tutup + tampilkan biaya di step 1 (H-6)
4. `<label>` + `autoComplete` di semua field (H-3)
5. Modal jadi `<dialog>` native (H-2)
6. Redirect `?next=` setelah login (M-6)
7. Konfirmasi hapus yang menyebut isinya (M-9)

### Batch 3 — Konsistensi visual
1. Migrasi 11 tombol ke `.btn-brand` + tambah `.btn-ghost` (H-7)
2. Tetapkan sistem radius: pill untuk aksi, `xl` untuk input, `2xl` untuk kartu, `[2rem]` untuk panel — lalu tegakkan
3. Ganti 10 hex hardcode ke token (inventaris §4)
4. Font weight asli (H-8) — **blocker: butuh file font dari desainer**
5. Turunkan durasi hover ke 150ms (L-5), rapikan `duration-500` (L-3)
6. Ukuran judul responsif (M-5)

### Batch 4 — Polish
Query dashboard paralel (M-2), helper text status (M-3), umpan balik sukses (M-4), gabung dua route registrasi (M-1), judul SVG keluar dari bundle (M-7), countdown sinkron (M-8), keputusan bahasa (M-10), sisa LOW.

---

---

# Hasil Fase 2

Dikerjakan dalam satu sesi. Semua Uncertain terjawab dari dalam repo sendiri —
tidak ada yang perlu ditebak:

| Pertanyaan Fase 1 | Jawabannya ada di | Kesimpulan |
|---|---|---|
| `/auth/confirm` sengaja dihapus? | `components/sign-up-form.tsx:27` — *"Email confirmation is off in Supabase, so signUp already returns a valid session"* | **Ya, sengaja.** C-5 dicoret, tidak dipulihkan. |
| "Satu tim per akun" aturan atau bug? | `BACKEND.md:79-81` — `uq_reg_user_competition on (user_id, competition)` | **Bug UI.** DB mengizinkan satu tim per lomba. C-3 diperbaiki sesuai DB. |
| Tombol partner ke mana? | `components/site-footer.tsx:66` | `mailto:nestui.ft@gmail.com`. |
| `/branding/more-submission` sisa prototipe? | Tidak ada satu pun link ke sana; `/protected/resubmit/[id]` sudah melakukan hal yang sama dengan benar | **Sisa prototipe.** Dihapus. |

## Temuan baru yang tidak ada di audit Fase 1

**Seluruh situs merender di client — `BAILOUT_TO_CLIENT_SIDE_RENDERING`.**

Ini ketahuan saat verifikasi, bukan saat baca kode, dan dampaknya lebih besar
dari gambar 17 MB. `<body>` yang dikirim server **kosong** untuk hampir semua
halaman:

```
$ curl -s localhost:3000/ | sed 's/.*<body[^>]*>//'
<div hidden=""><!--$--><!--/$--></div><!--$?--><template id="B:0"></template>
<script>$RX("B:0","BAILOUT_TO_CLIENT_SIDE_RENDERING")</script>
```

Penyebabnya `AppShell` — client component yang memanggil `usePathname()` dan
membungkus **seluruh** `children` di root layout. Di bawah `cacheComponents`,
pathname dihitung sebagai data request-time, jadi Suspense yang membungkusnya
(dan berarti setiap halaman) gagal di-prerender. Label `○ (Static)` di output
build tetap muncul, tapi bohong.

Perbaikannya: chrome dipilih per-subtree oleh layout server, bukan oleh client
component yang membaca pathname — `components/site-chrome.tsx`,
`app/branding/layout.tsx`, `app/auth/layout.tsx`, `app/protected/layout.tsx`.
`components/app-shell.tsx` dihapus.

Hasil terukur, sebelum → sesudah (teks yang benar-benar ada di HTML dari server):

| Route | Sebelum | Sesudah |
|---|---|---|
| `/` | 1 char (bailout) | **2423 chars** |
| `/branding/mainpage` | 1 char (bailout) | **2423 chars** |
| `/branding/aboutpage` | 2388 chars | 2388 chars |
| `/auth/login` | 0 char, 0 `<input>` (bailout) | **379 chars, form lengkap** |
| `/auth/sign-up` | 0 char (bailout) | **373 chars** |

Bailout sekarang **0 di semua route**.

## Selesai

**CRITICAL** — semua kecuali C-5 (yang ternyata bukan bug):
- **C-1** `/branding/more-submission` + `steps/submission.tsx` dihapus.
- **C-2** Draft wizard persist ke `sessionStorage` (`registration-client.tsx`), restore lewat effect biar tidak hydration mismatch, dihapus saat submit sukses. `sessionStorage` bukan `localStorage` — komputer lab dipakai bergantian.
- **C-3** `components/registration/registration-page.tsx` mengambil semua registrasi user; picker menandai lomba yang sudah diambil, bukan memblokir halaman. `AlreadyRegistered` sekarang hanya muncul kalau **semua** lomba yang terbuka sudah diambil, dan menampilkan daftar timnya.
- **C-4** `public/` **48 MB → 1.2 MB**. `aboutbackground.webp` 17 MB → 48 KB (2160px → 1440px, q72). QR code sengaja **lossless** saja (percobaan palet 2-warna sempat merusaknya — diperiksa dengan membuka hasilnya, bukan diasumsikan).

**HIGH** — semua kecuali H-8:
- **H-1** CTA partner jadi `mailto:` sungguhan + `cta.tsx` jadi server component (tidak ada state, tidak perlu dikirim ke browser).
- **H-2** `PopUpTemplate` jadi `<dialog>` native + `showModal()` → focus trap, Esc, top-layer, focus restore, semuanya dari platform.
- **H-3** `RegistrationInput` sekarang punya `label` / `hint` / `error` ber-`useId`; semua field registrasi & auth dapat `<label>` dan `autocomplete` yang benar.
- **H-4** `app/not-found.tsx` yang di-desain.
- **H-5** `focusFirstError()` — fokus + scroll ke `[aria-invalid="true"]` pertama.
- **H-6** Kartu lomba disable + beri label kalau `currentFee()` null (tutup) atau sudah terdaftar, dan **menampilkan biaya di step 1** — sebelumnya baru muncul di step 4.
- **H-7** `.btn-brand` / `.btn-ghost` / `.btn-ghost-muted` di `globals.css`; 15 string tombol yang di-paste diganti.
- **H-9** Blok `prefers-reduced-motion` di `globals.css` (terverifikasi ada di CSS hasil build).

**MEDIUM / LOW**: M-1 (dua route registrasi digabung), M-2 (query dashboard paralel), M-3 (helper text per status, termasuk jalan keluar untuk `rejected`), M-4 (konfirmasi sukses `?submitted=1` + skeleton dashboard yang sebentuk dengan konten asli), M-5 (ukuran judul responsif), M-6 (`?next=` end-to-end + `safeNextPath()` dipulihkan **dengan test open-redirect**), M-7 (`role="img"` + `aria-label` di SVG judul), M-9 (konfirmasi hapus menyebut nama tim + jumlah anggota + konsekuensi), L-2, L-3, L-4, L-5 (hover 300ms → 150ms), hex → token di 10 lokasi.

**Bonus**: `npm run lint` tadinya melaporkan **8.729 masalah** karena `eslint .` ikut men-scan `.next/`. Sekarang **0**.

## Sengaja TIDAK dikerjakan

1. **H-8 font-weight** — butuh file Oddval Regular/Bold dari desainer. Sampai itu ada, seluruh `font-bold`/`font-extrabold` tetap render identik. **Ini blocker desain, bukan kode.**
2. **M-10 keputusan bahasa** — mengubah seluruh UI ke Indonesia itu keputusan produk, bukan polish. Copy baru yang saya tulis mengikuti bahasa yang ada (Inggris).
3. **M-8 countdown** — saya *sempat* memperbaikinya dengan menyemai `Date.now()` di initializer, lalu **membatalkannya**: itu membuat hero (elemen LCP) keluar dari prerender. Sekarang placeholder `00` yang jelas-jelas placeholder (dim + pulse, jumlah glyph sama jadi tidak reflow). Trade-off ini didokumentasikan di `hero.tsx:20-27`.
4. **Skenario yang butuh login** — persistensi draft, picker lomba, dan dialog logout terverifikasi lewat build + tipe + markup yang dirender, bukan lewat klik sungguhan dengan akun peserta. Kalau kamu mau saya jalankan alur registrasi utuh dengan akun tes, bilang saja.

## Verifikasi

```
next build          ✓ compiled, TypeScript clean, 22 route ter-prerender
eslint .            ✓ 0 problems  (dari 8.729)
lib/*.test.ts       ✓ sanitize ok / auth errors ok / fee tiers ok
route sweep         ✓ 10 route: status benar, bailout 0 di semua
public/             48 MB → 1.2 MB
```

Backup gambar asli ada di scratchpad sesi ini kalau ada yang mau dibandingkan.
