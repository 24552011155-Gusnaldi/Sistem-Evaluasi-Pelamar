"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { useAppData } from "../../../components/AppProvider";
import ApplicantAvatar from "../../../components/ApplicantAvatar";
import EvaluationDetailModal from "../../../components/EvaluationDetailModal";
import type { Applicant } from "../../../components/AppProvider";

const scoreTone = (score: number) => score >= 80 ? "bg-emerald-50 text-emerald-700" : score >= 60 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";

function escapeCsvValue(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export default function RingkasanPage() {
  const { applicants } = useAppData();
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("Semua posisi");
  const [minimumScore, setMinimumScore] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const positions = useMemo(() => Array.from(new Set(applicants.map((applicant) => applicant.role))).sort(), [applicants]);
  const filtered = useMemo(() => applicants.filter((applicant) => {
    const matchesQuery = `${applicant.name} ${applicant.email} ${applicant.role}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesPosition = position === "Semua posisi" || applicant.role === position;
    const matchesScore = minimumScore === "" || applicant.score >= Number(minimumScore);
    return matchesQuery && matchesPosition && matchesScore;
  }), [applicants, minimumScore, position, query]);

  function handleExportCSV() {
    const headers = ["Nama", "Email", "Posisi", "Nama File", "Skor", "Rekomendasi", "Ringkasan AI", "Kelebihan", "Kekurangan", "Evaluasi Lengkap", "Ditambahkan"];
    const rows = filtered.map((applicant) => [
      applicant.name,
      applicant.email,
      applicant.role,
      applicant.fileName,
      applicant.score,
      applicant.recommendation,
      applicant.summary,
      applicant.strengths.join(" | "),
      applicant.risks.join(" | "),
      applicant.fitReason,
      applicant.addedAt,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "seleva-ringkasan-pelamar.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Talent pipeline</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ringkasan Hasil</h1><p className="mt-2 text-sm text-slate-500">Tinjau dan filter hasil evaluasi kandidat.</p></div><div className="flex flex-wrap items-center gap-3"><div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500"><strong className="text-slate-800">{filtered.length}</strong> dari {applicants.length} kandidat</div><button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={!filtered.length} onClick={handleExportCSV} type="button"><Download size={16} />Ekspor CSV</button></div></header>
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
        <label className="grid min-w-48 flex-1 gap-1.5 text-xs font-semibold text-slate-600">Cari kandidat<span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100"><Search className="shrink-0 text-slate-400" size={16} /><input className="w-full min-w-0 border-0 bg-transparent text-sm font-normal text-slate-700 outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Nama, email, atau posisi" value={query} /></span></label>
        <label className="grid min-w-48 gap-1.5 text-xs font-semibold text-slate-600">Posisi<select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setPosition(event.target.value)} value={position}><option>Semua posisi</option>{positions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="grid w-full gap-1.5 text-xs font-semibold text-slate-600 sm:w-40">Skor minimal<input className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" max={100} min={0} onChange={(event) => setMinimumScore(event.target.value)} placeholder="0–100" type="number" value={minimumScore} /></label>
        <button className="h-11 rounded-xl px-4 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={!query && position === "Semua posisi" && !minimumScore} onClick={() => { setQuery(""); setPosition("Semua posisi"); setMinimumScore(""); }} type="button">Reset filter</button>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Kandidat</th><th className="px-5 py-4">Posisi</th><th className="px-5 py-4">Skor</th><th className="px-5 py-4">Rekomendasi</th><th className="px-5 py-4">Ditambahkan</th><th className="px-5 py-4">Detail</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map((applicant) => <tr className="transition hover:bg-slate-50/70" key={applicant.id}><td className="px-5 py-4"><div className="flex items-center gap-3"><ApplicantAvatar name={applicant.name} photoUrl={applicant.avatarUrl} /><span><p className="font-semibold text-slate-800">{applicant.name}</p><p className="mt-1 text-xs text-slate-400">{applicant.email}</p></span></div></td><td className="px-5 py-4 text-slate-600">{applicant.role}<span className="mt-1 block text-xs text-slate-400">{applicant.fileName}</span></td><td className="px-5 py-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${scoreTone(applicant.score)}`}>{applicant.score} / 100</span></td><td className="px-5 py-4 text-slate-600">{applicant.recommendation}</td><td className="px-5 py-4 text-slate-500">{applicant.addedAt}</td><td className="px-5 py-4"><button className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50" onClick={() => setSelectedApplicant(applicant)} type="button">Detail / Ringkasan Lengkap</button></td></tr>)}</tbody>
          </table>
          {!filtered.length && <div className="px-5 py-14 text-center"><Search className="mx-auto text-slate-300" size={24} /><p className="mt-3 text-sm font-semibold text-slate-700">Tidak ada kandidat yang cocok</p><p className="mt-1 text-xs text-slate-400">Coba ubah pencarian atau filter.</p></div>}
        </div>
      </section>
      <EvaluationDetailModal
        dataApplicant={selectedApplicant ? {
          nama: selectedApplicant.name,
          posisi: selectedApplicant.role,
          skor: selectedApplicant.score,
          ringkasan_ai: selectedApplicant.summary,
          kelebihan: selectedApplicant.strengths,
          kekurangan: selectedApplicant.risks,
          evaluasi_lengkap: selectedApplicant.fitReason,
        } : {
          nama: "",
          posisi: "",
          skor: 0,
          ringkasan_ai: "",
          kelebihan: [],
          kekurangan: [],
          evaluasi_lengkap: "",
        }}
        isOpen={selectedApplicant !== null}
        onClose={() => setSelectedApplicant(null)}
      />
    </div>
  );
}
