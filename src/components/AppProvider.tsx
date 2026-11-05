"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type EvaluationResult = {
  skor: number;
  ringkasan_ai: string;
  kelebihan: string[];
  kekurangan: string[];
  evaluasi_lengkap: string;
  nama?: string;
  avatarUrl?: string;
};

export type Applicant = {
  id: string;
  name: string;
  email: string;
  role: string;
  fileName: string;
  score: number;
  recommendation: string;
  summary: string;
  strengths: string[];
  risks: string[];
  fitReason: string;
  addedAt: string;
  avatarUrl?: string;
};

const initialApplicants: Applicant[] = [
  {
    id: "applicant-1", name: "Nadia Putri", email: "nadia.putri@email.com", role: "Product Designer", fileName: "Nadia_Putri_CV.pdf",
    score: 94, recommendation: "Sangat direkomendasikan", summary: "Nadia memiliki pengalaman 5 tahun merancang produk digital end-to-end dengan fokus pada riset pengguna dan design system.",
    strengths: ["Riset dan validasi pengguna", "Figma & design system", "Kolaborasi product team"], risks: ["Pengalaman di B2B masih terbatas"],
    fitReason: "Portofolio dan pengalaman sangat relevan dengan kebutuhan tim.", addedAt: "10 menit lalu",
  },
  {
    id: "applicant-2", name: "Rizky Ramadhan", email: "rizky.r@email.com", role: "Software Engineer", fileName: "CV_Rizky_Ramadhan.pdf",
    score: 89, recommendation: "Direkomendasikan", summary: "Rizky berpengalaman membangun layanan web yang skalabel dengan fokus pada backend.",
    strengths: ["Node.js & TypeScript", "Desain REST API", "Pengalaman sistem skala besar"], risks: ["Pengalaman cloud native perlu dikonfirmasi"],
    fitReason: "Keahlian inti dan pengalaman kerja cocok dengan posisi.", addedAt: "35 menit lalu",
  },
  {
    id: "applicant-3", name: "Siti Rahmawati", email: "siti.rahma@email.com", role: "Data Analyst", fileName: "Siti_Rahmawati_CV.pdf",
    score: 82, recommendation: "Potensial", summary: "Siti memiliki fondasi analitik yang baik dan pengalaman mengubah data operasional menjadi insight.",
    strengths: ["SQL dan dashboarding", "Komunikasi insight", "Dasar statistik yang baik"], risks: ["Dampak bisnis proyek belum terukur"],
    fitReason: "Kompetensi utama sesuai, dengan beberapa hal yang perlu divalidasi.", addedAt: "1 jam lalu",
  },
  {
    id: "applicant-4", name: "Aditya Pratama", email: "aditya.p@email.com", role: "Product Manager", fileName: "Aditya_Pratama_CV.pdf",
    score: 91, recommendation: "Direkomendasikan", summary: "Aditya menunjukkan pengalaman memimpin pengembangan produk dari discovery hingga peluncuran.",
    strengths: ["Product discovery", "Roadmap & prioritas", "Koordinasi lintas fungsi"], risks: ["Pengalaman pada produk enterprise belum terlihat"],
    fitReason: "Pengalaman kepemimpinan produk sangat selaras dengan kebutuhan.", addedAt: "Kemarin",
  },
  {
    id: "applicant-5", name: "Dewi Anggraini", email: "dewi.a@email.com", role: "UI/UX Designer", fileName: "CV_Dewi_Anggraini.pdf",
    score: 58, recommendation: "Belum sesuai", summary: "Dewi memiliki potensi visual yang baik, tetapi pengalaman riset dan proses desain produk perlu ditinjau lebih lanjut.",
    strengths: ["Visual design", "Adobe Creative Suite"], risks: ["Belum ada contoh proses UX", "Portofolio produk digital terbatas"],
    fitReason: "Kemampuan visual tampak kuat, namun kecocokan untuk posisi UX masih rendah.", addedAt: "Kemarin",
  },
];

type AppContextValue = {
  applicants: Applicant[];
  addApplicant: (input: { name: string; role: string; fileName: string; result: EvaluationResult }) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState(initialApplicants);

  const value = useMemo<AppContextValue>(() => ({
    applicants,
    addApplicant: ({ name, role, fileName, result }) => {
      const score = Math.max(0, Math.min(100, result.skor));
      const recommendation = score >= 85 ? "Direkomendasikan" : score >= 70 ? "Perlu ditinjau" : "Tidak sesuai";
      setApplicants((current) => [{
        id: `applicant-${Date.now()}`,
        name,
        email: "Email belum tersedia",
        role,
        fileName,
        score,
        recommendation,
        summary: result.ringkasan_ai,
        strengths: result.kelebihan,
        risks: result.kekurangan,
        fitReason: result.evaluasi_lengkap,
        addedAt: "Baru saja",
        avatarUrl: result.avatarUrl,
      }, ...current]);
    },
  }), [applicants]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppData must be used within AppProvider.");
  return context;
}
