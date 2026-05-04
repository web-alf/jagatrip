# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage following Materi LP #2 — update copy on all existing sections, add two new sections (AudienceSection & IncludesSection), replace the hero poster card with `jagatrip-hero.png`, and reorder sections to match the PDF structure.

**Architecture:** All section components are standalone `.astro` files in `src/components/sections/home/`. Two new components are created from scratch. Existing components receive copy and structural updates only — no shared state or data layer changes required. `index.astro` is updated last to reflect the new import order.

**Tech Stack:** Astro 5, Tailwind CSS, TypeScript (frontmatter only). No new dependencies.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/components/sections/home/HomeHero.astro` | Modify | New copy, 2 CTAs, social proof bar, replace card with `jagatrip-hero.png` |
| `src/components/sections/home/ProblemSection.astro` | Modify | New copy: pain points, closing hook, quote |
| `src/components/sections/home/AboutSection.astro` | Modify | Add filosofi nama (JAGAT + TRIP), tagline, differentiation copy |
| `src/components/sections/home/AudienceSection.astro` | **Create** | 6 target audience cards in 2×3 grid |
| `src/components/sections/home/WhySection.astro` | Modify | Add "5 ALASAN WAJIB IKUT" label, update reason titles/descs |
| `src/components/sections/home/BenefitSection.astro` | Modify | Add closing line "5 Hari yang Bisa Mengubah 5 Tahun..." |
| `src/components/sections/home/IncludesSection.astro` | **Create** | 13 inclusions in 2-col grid, catatan penting box |
| `src/components/sections/home/PricingSection.astro` | Modify | Remove inclusions block (moved to IncludesSection), keep pricing cards |
| `src/components/sections/home/CtaBannerSection.astro` | Modify | New copy: event badge, CLASS CONFIDENTIAL headline |
| `src/pages/index.astro` | Modify | Import new components, reorder all sections |

**Unchanged:** `TimelineSection.astro`, `FaqSection.astro`, `AgendaTableSection.astro`

---

## Task 1: Update HomeHero.astro

**Files:**
- Modify: `src/components/sections/home/HomeHero.astro`

- [ ] **Step 1: Replace the entire file content**

```astro
---
import { waLink } from '../../../data/site';
const wa = waLink('Malaysia-Thailand', '24-28 Juni 2026');
---

<section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-jaga-bg">
  <div class="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-jaga-orange via-transparent to-transparent"></div>

  <div class="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">

    <!-- Left: text -->
    <div class="lg:w-1/2 text-center lg:text-left">

      <!-- Badge -->
      <span class="inline-block py-2 px-5 rounded-full bg-gray-900 text-white font-bold text-sm mb-6 tracking-widest uppercase shadow-sm">
        ✨ JAGATRIP INSIDER SERIES 2026 ✨
      </span>

      <!-- H1 -->
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-2">
        JAGATRIP WORLD EXPEDITION
      </h1>
      <p class="text-2xl md:text-3xl font-black text-jaga-orange mb-6 tracking-tight">
        Ekspedisi Benchmarking Internasional
      </p>

      <!-- Subheadline -->
      <p class="text-xl md:text-2xl text-gray-800 font-bold mb-4 leading-snug">
        Dunia adalah Ruang Kelas Terbesar.<br/>
        Yuk Belajar Langsung dari Sumbernya!
      </p>

      <!-- Body -->
      <p class="text-base md:text-lg text-gray-500 mb-8 leading-relaxed">
        Program Edu-Tourism eksklusif bagi para praktisi pendidikan Indonesia yang ingin melakukan
        <strong class="text-gray-700">BENCHMARKING</strong> langsung ke sekolah-sekolah terbaik dunia —
        bukan sekadar jalan-jalan, tapi perjalanan yang mengubah cara kamu memimpin.
      </p>

      <!-- Event info badges -->
      <div class="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
        <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm text-sm font-semibold text-gray-700">
          <span>📅</span>
          <span>24–28 Juni 2026</span>
          <span class="text-gray-400">·</span>
          <span>Malaysia &amp; Thailand</span>
        </div>
        <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm text-sm font-semibold text-gray-700">
          <span>✈️</span>
          <span>5 Hari 4 Malam</span>
          <span class="text-gray-400">·</span>
          <span>Kuala Lumpur → Hatyai</span>
        </div>
      </div>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block bg-jaga-orange hover:bg-jaga-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_10px_30px_rgba(255,107,53,0.3)] hover:shadow-[0_15px_40px_rgba(255,107,53,0.4)] transition-all duration-300 transform hover:-translate-y-1 text-center"
        >
          Daftar Sekarang →
        </a>
        <a
          href="#itinerary"
          class="inline-block border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 text-center"
        >
          Lihat Itinerary ↓
        </a>
      </div>

      <!-- Social proof bar -->
      <div class="inline-block bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl">
        ★★★★★ Dipercaya oleh 200+ Praktisi Pendidikan Indonesia | Certified by PT Jagatrip Mitra Edukasi
      </div>
    </div>

    <!-- Right: poster image -->
    <div class="lg:w-1/2 w-full max-w-md mx-auto lg:max-w-none">
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        class="block relative w-full rounded-[2.5rem] shadow-2xl overflow-hidden group"
      >
        <img
          src="/jagatrip-hero.png"
          alt="Poster JAGATRIP Ekspedisi Benchmarking Internasional 24-28 Juni 2026"
          class="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
          width="600"
          height="800"
        />
      </a>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Verify build compiles**

Run: `bun run build 2>&1 | tail -20`
Expected: No errors. If errors appear, check import paths.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/home/HomeHero.astro
git commit -m "feat: redesign hero — JAGATRIP WORLD EXPEDITION copy + jagatrip-hero.png poster"
```

---

## Task 2: Update ProblemSection.astro

**Files:**
- Modify: `src/components/sections/home/ProblemSection.astro`

- [ ] **Step 1: Replace entire file content**

```astro
---
const problems = [
  'Sekolahmu sudah bagus — tapi kamu ngerasa ada yang kurang dan nggak tahu harus mulai dari mana.',
  'Kamu pengen sistem pendidikan yang lebih modern, tapi referensinya terbatas dan tidak bisa keluar dari "zona nyaman" yang itu-itu aja.',
  'Sudah banyak seminar dan pelatihan, tapi hasilnya belum mengubah kualitas sekolahmu secara nyata.',
  'Kamu ingin tahu bagaimana sekolah-sekolah terbaik dunia membangun budaya belajar yang kuat — tapi akses ke mereka terasa sangat jauh.',
  'Siswa dan guru butuh inspirasi baru — tapi kamu sendiri bingung harus mencari inspirasi itu ke mana.',
  'Ingin mengadopsi praktik terbaik sekolah internasional, tapi tidak punya networking yang tepat untuk memulainya.',
];
---

<section class="py-24 bg-white relative">
  <div class="max-w-5xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Apakah Kamu Mengalami Ini?</h2>
    </div>

    <div class="space-y-4 mb-16">
      {problems.map((problem) => (
        <div class="flex items-start bg-jaga-bg border border-gray-100 p-6 md:p-8 rounded-2xl hover:shadow-md transition-shadow duration-300">
          <span class="text-jaga-orange font-black text-xl mr-5 mt-0.5 shrink-0">✓</span>
          <p class="text-gray-700 text-lg md:text-xl font-medium leading-relaxed">{problem}</p>
        </div>
      ))}
    </div>

    <div class="bg-gray-900 text-white text-center py-6 px-8 rounded-2xl mb-8">
      <p class="text-xl md:text-2xl font-bold">
        Kalau jawabanmu <span class="text-jaga-orange">"IYA"</span> — maka kamu perlu ikut <strong>JAGATRIP To Malaysia &amp; Thailand, 24–28 Juni 2026</strong>
      </p>
    </div>

    <div class="p-10 md:p-12 bg-linear-to-br from-jaga-orange to-orange-500 rounded-3xl text-white shadow-2xl">
      <p class="text-xl md:text-2xl font-bold leading-relaxed italic text-center">
        "Karena ilmu yang paling mahal bukan yang ada di buku teks — melainkan yang tersimpan di balik tembok sekolah-sekolah terbaik yang jarang dibuka untuk umum."
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/ProblemSection.astro
git commit -m "feat: update problem section copy — checkmarks + closing hook dari PDF"
```

---

## Task 3: Update AboutSection.astro

**Files:**
- Modify: `src/components/sections/home/AboutSection.astro`

- [ ] **Step 1: Replace entire file content**

```astro
---
const bullets = [
  'Pengalaman belajar langsung di lapangan (field learning)',
  'Workshop eksklusif bersama praktisi pendidikan di negara-negara kunjungan',
  'Sesi dialog terbuka dengan manajemen sekolah internasional',
  'City tour edukatif destinasi wisata',
  'Networking eksklusif antar sesama praktisi pendidikan Indonesia',
];
---

<section class="py-24 bg-jaga-bg border-t border-gray-200">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <h2 class="text-4xl md:text-6xl font-black text-gray-900 mb-12 tracking-tight">Apa Itu JAGATRIP?</h2>

    <!-- Filosofi nama -->
    <div class="grid grid-cols-2 gap-6 mb-10 text-left max-w-2xl mx-auto">
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-jaga-orange font-black text-xl mb-1">◆ JAGAT</p>
        <p class="text-gray-400 text-sm italic mb-2">(Sanskerta-Jawa Kuno)</p>
        <p class="text-gray-700 font-semibold">= dunia, semesta, alam raya</p>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-jaga-orange font-black text-xl mb-1">◆ TRIP</p>
        <p class="text-gray-400 text-sm italic mb-2">(English - global)</p>
        <p class="text-gray-700 font-semibold">= perjalanan, kunjungan</p>
      </div>
    </div>

    <!-- Tagline -->
    <div class="bg-gray-900 text-white py-4 px-8 rounded-2xl mb-10 inline-block">
      <p class="text-xl md:text-2xl font-black">"Perjalanan ke Seluruh Penjuru Dunia"</p>
    </div>

    <p class="text-xl text-gray-600 mb-8 leading-relaxed">
      JAGATRIP adalah program Edu-Tourism premium yang dirancang khusus untuk para praktisi pendidikan —
      kepala sekolah, guru, pengawas, dan pemangku pendidikan — yang ingin melakukan
      <strong class="text-gray-900">BENCHMARKING</strong> langsung ke sekolah-sekolah terbaik di seluruh dunia.
    </p>

    <!-- Diferensiasi -->
    <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-12 inline-block">
      <p class="text-2xl md:text-3xl font-black text-jaga-orange">
        Bukan sekadar jalan-jalan.<br class="md:hidden"/> Bukan sekadar studi banding biasa.
      </p>
    </div>

    <p class="text-xl text-gray-800 font-bold mb-8">JAGATRIP menggabungkan:</p>

    <div class="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
      {bullets.map((item, i) => (
        <div class={`flex items-start bg-white p-5 rounded-2xl border border-gray-100 shadow-sm${i === bullets.length - 1 ? ' md:col-span-2 md:mx-auto md:w-1/2' : ''}`}>
          <span class="text-jaga-orange font-black text-xl mr-4 shrink-0">✓</span>
          <span class="text-gray-700 font-medium">{item}</span>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/AboutSection.astro
git commit -m "feat: update about section — tambah filosofi nama JAGAT+TRIP dan tagline"
```

---

## Task 4: Create AudienceSection.astro

**Files:**
- Create: `src/components/sections/home/AudienceSection.astro`

- [ ] **Step 1: Create the file**

```astro
---
const audiences = [
  {
    icon: '🏫',
    title: 'Kepala Sekolah',
    desc: 'Yang ingin membawa visi sekolahnya ke level internasional',
  },
  {
    icon: '📚',
    title: 'Guru & Pendidik',
    desc: 'Yang lapar inspirasi dan metode mengajar baru',
  },
  {
    icon: '🔍',
    title: 'Pengawas Pendidikan',
    desc: 'Yang mencari referensi sistem pendidikan terbaik dunia',
  },
  {
    icon: '🏛️',
    title: 'Owner Yayasan',
    desc: 'Yang ingin membangun institusi pendidikan kelas dunia',
  },
  {
    icon: '🎓',
    title: 'Mahasiswa Pendidikan',
    desc: 'Calon pemimpin pendidikan yang ingin melihat dunia lebih luas',
  },
  {
    icon: '🤝',
    title: 'Pemerhati Pendidikan',
    desc: 'Yang aktif berkontribusi pada kemajuan sistem pendidikan Indonesia',
  },
];
---

<section class="py-24 bg-white border-t border-gray-200">
  <div class="max-w-5xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
        Program Ini Dirancang untuk Kamu yang...
      </h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {audiences.map((item) => (
        <div class="bg-jaga-bg border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="text-4xl mb-4">{item.icon}</div>
          <h3 class="text-xl font-black text-jaga-orange mb-2">{item.title}</h3>
          <p class="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/AudienceSection.astro
git commit -m "feat: tambah AudienceSection — 6 kartu target audience grid 2x3"
```

---

## Task 5: Update WhySection.astro

**Files:**
- Modify: `src/components/sections/home/WhySection.astro`

- [ ] **Step 1: Replace entire file content**

```astro
---
const reasons = [
  {
    icon: '🏫',
    title: 'Sistem Pendidikan Kelas Dunia',
    desc: 'Capek lihat sistem sekolah yang itu-itu aja? Di sini kamu akan menyaksikan langsung bagaimana sekolah-sekolah terbaik Malaysia dan Thailand membangun sistem pendidikan yang konsisten, inovatif, dan berdampak — dan kamu akan pulang membawa cetak birunya.',
  },
  {
    icon: '💡',
    title: 'Guru yang Benar-Benar Menginspirasi',
    desc: 'Bagaimana cara membuat guru semangat mengajar dan murid antusias belajar? Jawabannya ada di sekolah yang akan kamu kunjungi. Saksikan budaya belajar yang hidup dan rasakan sendiri perbedaannya.',
  },
  {
    icon: '📱',
    title: 'Teknologi Pendidikan yang Relevan',
    desc: 'Pengen tahu gimana caranya bikin murid melek teknologi tanpa kehilangan esensi belajar? Program JAGATRIP akan membukakan matamu terhadap integrasi teknologi yang tepat guna di ruang kelas nyata.',
  },
  {
    icon: '🤝',
    title: 'Jaringan yang Tidak Ternilai',
    desc: 'Bergabung dengan ratusan praktisi pendidikan terbaik dari Indonesia. Satu koneksi yang tepat bisa membuka puluhan peluang kolaborasi, kemitraan, dan pertumbuhan untuk sekolahmu.',
  },
  {
    icon: '🏆',
    title: 'Rekognisi & Sertifikasi Resmi',
    desc: 'Peserta mendapatkan sertifikat resmi dari PT JAGATRIP MITRA EDUKASI sebagai bukti partisipasi dalam program benchmarking pendidikan internasional.',
  },
];
---

<section id="why" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-6">
    <div class="text-center max-w-4xl mx-auto mb-6">
      <h2 class="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
        Karena Sekolahmu Layak Dapat yang Terbaik
      </h2>
      <p class="text-xl md:text-2xl text-gray-500 font-medium mb-6">
        Satu perjalanan bersama JAGATRIP bisa mengubah cara pandangmu terhadap pendidikan — selamanya.
      </p>
      <span class="inline-block bg-jaga-orange/10 text-jaga-orange font-black text-sm uppercase tracking-widest px-5 py-2 rounded-full">
        5 Alasan Wajib Ikut
      </span>
    </div>

    <div class="mt-16 flex flex-wrap justify-center gap-8">
      {reasons.map((reason) => (
        <div class="bg-jaga-bg p-10 rounded-4xl hover:shadow-2xl transition-all border border-gray-100 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)] text-left">
          <div class="text-4xl mb-6">{reason.icon}</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">{reason.title}</h3>
          <p class="text-gray-600 text-lg leading-relaxed">{reason.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/WhySection.astro
git commit -m "feat: update why section — tambah label '5 Alasan Wajib Ikut' dan copy dari PDF"
```

---

## Task 6: Update BenefitSection.astro

**Files:**
- Modify: `src/components/sections/home/BenefitSection.astro`

- [ ] **Step 1: Replace entire file content**

```astro
---
const benefits = [
  '✈️ Merasakan langsung suasana dan kultur sekolah kelas dunia di Malaysia & Thailand',
  '🏫 Akses eksklusif ke sesi benchmarking & observasi kelas di sekolah internasional pilihan',
  '🎤 Ngobrol langsung (dialog terbuka) dengan kepala sekolah dan staf pengajar top',
  '📚 Workshop intensif: praktik terbaik manajemen sekolah, kurikulum, dan pengembangan guru',
  '🌍 Inspirasi nyata dari sistem pendidikan yang sudah terbukti menghasilkan lulusan berkualitas',
  '📸 Dokumentasi perjalanan profesional yang bisa jadi konten inspiratif untuk sekolahmu',
  '🎁 Merchandise & souvenir eksklusif JAGATRIP Insider Series',
  '🥇 Sertifikat resmi partisipasi program benchmarking internasional',
  '🤝 Membangun network dengan sesama praktisi pendidikan terbaik Indonesia',
  '💡 Oleh-oleh ilmu yang langsung bisa diaplikasikan di sekolahmu setelah pulang',
];
---

<section class="py-24 bg-gray-900 text-white relative overflow-hidden">
  <div class="absolute inset-0 bg-jaga-orange opacity-10"></div>
  <div class="max-w-7xl mx-auto px-6 relative z-10">
    <h2 class="text-4xl md:text-6xl font-black text-center mb-16 tracking-tight text-white">
      Yang Akan Kamu Dapatkan dari <span class="text-jaga-orange">JAGATRIP</span>
    </h2>

    <div class="grid md:grid-cols-2 gap-6 mb-16">
      {benefits.map((benefit) => (
        <div class="flex items-center bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
          <p class="text-lg md:text-xl font-medium text-gray-100">{benefit}</p>
        </div>
      ))}
    </div>

    <div class="text-center max-w-5xl mx-auto bg-linear-to-br from-jaga-orange to-orange-600 p-12 md:p-16 rounded-[3rem] shadow-2xl mb-10">
      <p class="text-3xl md:text-4xl lg:text-5xl font-black mb-0 italic leading-tight text-white">
        "Perjalanan ini bukan pengeluaran. Ini adalah INVESTASI terbaik untuk sekolah dan generasi yang kamu didik."
      </p>
    </div>

    <p class="text-center text-white/70 text-xl md:text-2xl font-bold">
      5 Hari yang Bisa Mengubah 5 Tahun ke Depan Sekolahmu.
    </p>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/BenefitSection.astro
git commit -m "feat: update benefit section — tambah closing line '5 Hari yang Bisa Mengubah 5 Tahun'"
```

---

## Task 7: Create IncludesSection.astro

**Files:**
- Create: `src/components/sections/home/IncludesSection.astro`

- [ ] **Step 1: Create the file**

```astro
---
const includes = [
  { icon: '✈️', label: 'TIKET PESAWAT', desc: 'Round-trip flight ke KLIA (PP)' },
  { icon: '🏨', label: 'HOTEL BINTANG 3', desc: 'Penginapan nyaman selama 4 malam' },
  { icon: '🍽️', label: '10x MAKAN', desc: 'Termasuk sarapan, makan siang, dan makan malam pilihan' },
  { icon: '🥂', label: 'WELCOME DRINK', desc: 'Minuman sambutan di hari pertama' },
  { icon: '🚌', label: 'BUS PARIWISATA LUXURY', desc: 'Transportasi darat Malaysia–Thailand (VIP)' },
  { icon: '📚', label: 'WORKSHOP & SEMINAR KIT', desc: 'Modul, buku, dan alat tulis eksklusif' },
  { icon: '🛍️', label: 'MERCHANDISE JAGATRIP', desc: 'Tas, kaos, dan souvenir eksklusif Insider Series' },
  { icon: '🎁', label: 'DOOR PRIZE', desc: 'Hadiah menarik untuk peserta beruntung' },
  { icon: '🥇', label: 'SERTIFIKAT RESMI', desc: 'Sertifikat benchmarking internasional dari PT Jagatrip Mitra Edukasi' },
  { icon: '📸', label: 'DOKUMENTASI', desc: 'Foto dan video profesional selama perjalanan' },
  { icon: '🗺️', label: 'CITY TOUR', desc: 'Tur kota Kuala Lumpur & Bangkok' },
  { icon: '👨‍🏫', label: 'TOUR LEADER PROFESIONAL', desc: 'Pendamping berpengalaman selama perjalanan' },
  { icon: '🛡️', label: 'ASURANSI PERJALANAN', desc: 'Perlindungan selama program berlangsung' },
];
---

<section class="py-24 bg-white border-t border-gray-200">
  <div class="max-w-5xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
        Semua Sudah Termasuk.
      </h2>
      <p class="text-2xl md:text-3xl font-bold text-jaga-orange">
        Kamu Tinggal Hadir dan Belajar.
      </p>
    </div>

    <div class="grid sm:grid-cols-2 gap-4 mb-10">
      {includes.map((item, i) => (
        <div class={`flex items-start bg-jaga-bg p-5 rounded-xl border border-gray-100${i === includes.length - 1 ? ' sm:col-span-2 sm:max-w-sm sm:mx-auto' : ''}`}>
          <span class="text-2xl mr-4 shrink-0">{item.icon}</span>
          <div>
            <p class="text-gray-900 font-bold leading-tight">{item.label}</p>
            <p class="text-gray-500 text-sm mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div class="bg-orange-50 border border-orange-200 rounded-2xl p-6">
      <p class="text-gray-800 text-base leading-relaxed text-center">
        <span class="font-bold text-jaga-orange uppercase mr-2">CATATAN PENTING:</span>
        Meeting Point Keberangkatan: KLIA (Kuala Lumpur International Airport).
        Tiket pesawat dari kota asal peserta menuju KLIA ditanggung dalam paket.
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/IncludesSection.astro
git commit -m "feat: tambah IncludesSection — 13 item yang sudah termasuk dalam paket"
```

---

## Task 8: Update PricingSection.astro

Remove the inclusions block (moved to `IncludesSection`). Keep only the pricing cards.

**Files:**
- Modify: `src/components/sections/home/PricingSection.astro`

- [ ] **Step 1: Replace entire file content**

```astro
---
import { waLink } from '../../../data/site';
const wa = waLink('Malaysia-Thailand', '24-28 Juni 2026');
---

<section id="pricing" class="py-24 bg-jaga-bg border-t border-gray-200">
  <div class="max-w-3xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
        Investasi Terbaik yang Pernah Kamu Buat untuk Sekolah dan Instansimu
      </h2>
    </div>

    <div class="space-y-6">
      <!-- Early Bird -->
      <div class="bg-linear-to-br from-jaga-orange to-orange-500 p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,107,53,0.3)] text-white relative overflow-hidden border-4 border-white/20">
        <div class="absolute top-0 right-0 bg-white text-jaga-orange font-black py-2 px-6 rounded-bl-2xl text-sm tracking-wider uppercase shadow-md">TERBATAS</div>
        <h3 class="text-3xl font-black mb-2">🔥 EARLY BIRD</h3>
        <p class="mb-6 text-orange-100 font-semibold text-lg border-b border-white/20 pb-4 inline-block">Sampai 10 Juni 2026</p>
        <div class="text-5xl md:text-6xl font-black mb-2 tracking-tight">
          Rp 7.900.000 <span class="text-xl md:text-2xl font-bold text-orange-100">/ orang</span>
        </div>
        <p class="text-base mb-10 text-orange-100 font-medium">All-in (sudah termasuk semua fasilitas)</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" class="block w-full text-center bg-white text-jaga-orange font-black text-xl py-5 rounded-full shadow-xl hover:bg-gray-50 hover:scale-[1.02] transition-all">
          DAFTAR SEKARANG
        </a>
      </div>

      <!-- Harga Normal -->
      <div class="bg-white p-10 rounded-[2.5rem] shadow-lg border border-gray-200 flex justify-between items-center">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">HARGA NORMAL</h3>
          <p class="text-gray-500 font-medium">Berlaku 10 Juni 2026 dst</p>
        </div>
        <div class="text-right">
          <div class="text-3xl font-black text-gray-900">Rp 8.250.000</div>
          <div class="text-sm font-bold text-gray-500">per orang | All-in</div>
        </div>
      </div>

      <p class="text-center text-sm md:text-base text-gray-500 font-medium leading-relaxed px-4">
        Kuota TERBATAS — Hanya untuk Peserta Serius yang Siap Level Up!<br/>
        Early Bird berakhir 10 Juni 2026. Harga normal setelahnya.
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/PricingSection.astro
git commit -m "feat: update pricing section — hapus inclusions block (dipindah ke IncludesSection)"
```

---

## Task 9: Update CtaBannerSection.astro

**Files:**
- Modify: `src/components/sections/home/CtaBannerSection.astro`

- [ ] **Step 1: Replace entire file content**

```astro
---
import { waLink } from '../../../data/site';
const wa = waLink('Malaysia-Thailand', '24-28 Juni 2026');
---

<section class="py-16 md:py-24 bg-white">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <p class="text-gray-500 text-lg font-medium mb-6">Dan sekarang, saatnya kamu ambil langkah pertama.</p>

    <div class="inline-block bg-gray-900 text-white font-black text-sm uppercase tracking-widest px-6 py-3 rounded-full mb-8">
      🔥 PROGRAM PERDANA — JAGATRIP INSIDER SERIES 2026
    </div>

    <div class="bg-jaga-orange rounded-4xl p-10 md:p-14 shadow-xl text-white mb-8">
      <h2 class="text-2xl md:text-3xl font-black mb-3 leading-tight">
        CLASS CONFIDENTIAL:
      </h2>
      <p class="text-xl md:text-2xl font-bold text-orange-100 leading-snug mb-8">
        Rahasia Sekolah Kelas Dunia yang Tidak Diajarkan di Seminar Manapun
      </p>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center bg-white text-jaga-orange font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 whitespace-nowrap"
      >
        Daftar Sekarang →
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/CtaBannerSection.astro
git commit -m "feat: update CTA banner — CLASS CONFIDENTIAL copy dari PDF Section 8"
```

---

## Task 10: Add id="itinerary" to TimelineSection.astro

**Files:**
- Modify: `src/components/sections/home/TimelineSection.astro` line 30

- [ ] **Step 1: Add id to section tag**

Change line 30 from:
```html
<section class="py-24 bg-white">
```
To:
```html
<section id="itinerary" class="py-24 bg-white">
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/home/TimelineSection.astro
git commit -m "fix: tambah id=itinerary ke TimelineSection untuk hero anchor link"
```

---

## Task 11: Update index.astro — New Section Order

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the entire file content**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/layout/Nav.astro';
import Footer from '../components/layout/Footer.astro';
import FloatingWA from '../components/layout/FloatingWA.astro';

import HomeHero           from '../components/sections/home/HomeHero.astro';
import ProblemSection     from '../components/sections/home/ProblemSection.astro';
import AboutSection       from '../components/sections/home/AboutSection.astro';
import AudienceSection    from '../components/sections/home/AudienceSection.astro';
import WhySection         from '../components/sections/home/WhySection.astro';
import BenefitSection     from '../components/sections/home/BenefitSection.astro';
import TimelineSection    from '../components/sections/home/TimelineSection.astro';
import IncludesSection    from '../components/sections/home/IncludesSection.astro';
import PricingSection     from '../components/sections/home/PricingSection.astro';
import CtaBannerSection   from '../components/sections/home/CtaBannerSection.astro';
import FaqSection         from '../components/sections/home/FaqSection.astro';
import AgendaTableSection from '../components/sections/home/AgendaTableSection.astro';

import { travelAgencySchema } from '../data/schemas/travelAgency';
import { breadcrumbSchema }   from '../data/schemas/breadcrumb';
---

<BaseLayout
  title="JAGATRIP — Ekspedisi Benchmarking Internasional"
  description="Program Edu-Tourism premium untuk praktisi pendidikan Indonesia. Benchmarking sekolah-sekolah terbaik dunia. JAGATRIP TO MALAYSIA - THAILAND, 24-28 Juni 2026."
  extraSchemas={[travelAgencySchema(), breadcrumbSchema([])]}
>
  <Nav />

  <main id="main">
    <HomeHero />
    <ProblemSection />
    <AboutSection />
    <AudienceSection />
    <WhySection />
    <BenefitSection />
    <TimelineSection />
    <IncludesSection />
    <PricingSection />
    <CtaBannerSection />
    <FaqSection />
    <AgendaTableSection />
  </main>

  <Footer />
  <FloatingWA />
</BaseLayout>
```

- [ ] **Step 2: Build to verify no errors**

Run: `bun run build 2>&1 | tail -30`
Expected: Build completes with `dist/index.html` generated, zero TypeScript or import errors.

- [ ] **Step 3: Start dev server and verify visually**

Run: `bun run dev`
Open: `http://localhost:4321`

Check in order:
1. Hero shows `jagatrip-hero.png` poster on right, new copy on left
2. Audience section appears after About with 6 cards
3. IncludesSection appears before Pricing with 13 items
4. Pricing section shows only pricing cards (no duplicate inclusions list)
5. CTA banner shows CLASS CONFIDENTIAL copy

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: update index.astro — urutan section baru sesuai PDF, import AudienceSection + IncludesSection"
```
