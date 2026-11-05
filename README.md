# Seleva | Sistem Evaluasi Pelamar

Dashboard evaluasi pelamar berbasis Next.js App Router, TypeScript, Tailwind CSS, dan webhook n8n.

## Struktur aplikasi

```text
src/
├── app/
│   ├── (workspace)/
│   │   ├── dashboard/page.tsx
│   │   ├── evaluasi/page.tsx
│   │   ├── ringkasan/page.tsx
│   │   ├── users/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   └── evaluate/route.ts
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppProvider.tsx
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   ├── EvaluationDetailModal.tsx
│   └── SubmitLoadingOverlay.tsx
└── lib/
    └── auth.ts
```

Folder `(workspace)` adalah route group dan tidak muncul di URL. Halamannya tersedia di `/dashboard`, `/evaluasi`, `/ringkasan`, dan `/users`.

## Menjalankan secara lokal

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm install
npm run dev
```

Atur `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di `.env.local`. Isi `SESSION_SECRET` dengan nilai acak minimal 32 karakter; contoh untuk membuatnya:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Autentikasi memvalidasi kredensial di server dan menggunakan cookie sesi HttpOnly. Ganti nilai placeholder sebelum menjalankan aplikasi. Untuk penggunaan produksi atau banyak administrator, gunakan penyedia autentikasi dan penyimpanan user yang sesuai.

Saat deploy, siapkan variabel `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET` (minimal 32 karakter), dan `N8N_WEBHOOK_URL` di environment hosting.

## Evaluasi CV dan n8n

Atur `N8N_WEBHOOK_URL` di `.env.local`; nilai default adalah `http://localhost:5678/webhook-test/evaluasi-cv`. Browser mengirim CV ke `/api/evaluate`, lalu server meneruskan form multipart (`posisi` dan `cv_file`) ke n8n agar request tidak bergantung pada CORS browser. File PDF dibatasi 4 MB.

Webhook diharapkan mengembalikan JSON dengan bentuk berikut:

```json
{
  "skor": 85,
  "ringkasan_ai": "Ringkasan evaluasi kandidat.",
  "kelebihan": ["Pengalaman relevan"],
  "kekurangan": ["Keahlian tertentu perlu ditinjau"],
  "evaluasi_lengkap": "Rincian evaluasi."
}
```

Kandidat dan daftar user pada antarmuka saat ini disimpan dalam state frontend; hubungkan ke database untuk penyimpanan permanen.

## Pemeriksaan

```bash
npm run lint
npm run build
```
