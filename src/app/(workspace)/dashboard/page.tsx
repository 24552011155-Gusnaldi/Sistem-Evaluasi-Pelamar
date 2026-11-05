"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, CheckCircle2, Clock3, UsersRound } from "lucide-react";
import { useAppData } from "../../../components/AppProvider";
import ApplicantAvatar from "../../../components/ApplicantAvatar";

const scoreTone = (score: number) => score >= 80 ? "text-emerald-700 bg-emerald-50" : score >= 60 ? "text-amber-700 bg-amber-50" : "text-rose-700 bg-rose-50";

export default function DashboardPage() {
  const { applicants } = useAppData();
  const average = applicants.length ? Math.round(applicants.reduce((total, applicant) => total + applicant.score, 0) / applicants.length) : 0;
  const recommended = applicants.filter((applicant) => applicant.score >= 85).length;
  const metrics = [
    { title: "Total kandidat", value: applicants.length, icon: UsersRound, detail: "Seluruh kandidat yang dievaluasi", tone: "bg-indigo-50 text-indigo-600" },
    { title: "Direkomendasikan", value: recommended, icon: CheckCircle2, detail: "Skor kecocokan minimal 85", tone: "bg-emerald-50 text-emerald-600" },
    { title: "Rata-rata skor", value: `${average}%`, icon: BarChart3, detail: "Rata-rata kecocokan kandidat", tone: "bg-amber-50 text-amber-600" },
    { title: "Posisi dinilai", value: new Set(applicants.map((applicant) => applicant.role)).size, icon: BriefcaseBusiness, detail: "Posisi dengan data kandidat", tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Dashboard rekrutmen</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Selamat datang di Seleva</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Pantau hasil evaluasi dan kelola pipeline kandidat dalam satu workspace.</p></div>
        <Link className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-800 transition hover:bg-indigo-50" href="/evaluasi">Evaluasi CV <ArrowRight size={16} /></Link>
      </section>

      <section aria-label="Ringkasan metrik" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, value, icon: Icon, detail, tone }) => <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={title}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-500">{title}</p><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span></div><p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></article>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kandidat terbaru</p><h2 className="mt-1 text-lg font-bold text-slate-900">Hasil evaluasi terkini</h2></div><Link className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="/ringkasan">Lihat semua <ArrowRight size={15} /></Link></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="pb-3 pr-4 font-semibold">Kandidat</th><th className="pb-3 pr-4 font-semibold">Posisi</th><th className="pb-3 pr-4 font-semibold">Skor</th><th className="pb-3 font-semibold">Ditambahkan</th></tr></thead>
              <tbody>{applicants.slice(0, 5).map((applicant) => <tr className="border-b border-slate-50 last:border-0" key={applicant.id}><td className="py-4 pr-4"><div className="flex items-center gap-3"><ApplicantAvatar name={applicant.name} photoUrl={applicant.avatarUrl} size={34} /><span><p className="font-semibold text-slate-800">{applicant.name}</p><p className="mt-0.5 text-xs text-slate-400">{applicant.email}</p></span></div></td><td className="py-4 pr-4 text-slate-600">{applicant.role}</td><td className="py-4 pr-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${scoreTone(applicant.score)}`}>{applicant.score}</span></td><td className="py-4 text-xs text-slate-500">{applicant.addedAt}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline</p><h2 className="mt-1 text-lg font-bold text-slate-900">Status kandidat</h2>
          <div className="mt-6 space-y-5">{[
            { label: "Direkomendasikan", amount: recommended, color: "bg-emerald-500" },
            { label: "Perlu ditinjau", amount: applicants.filter((applicant) => applicant.score >= 60 && applicant.score < 85).length, color: "bg-amber-400" },
            { label: "Tidak sesuai", amount: applicants.filter((applicant) => applicant.score < 60).length, color: "bg-rose-500" },
          ].map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-600">{item.label}</span><strong className="text-slate-800">{item.amount}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${applicants.length ? item.amount / applicants.length * 100 : 0}%` }} /></div></div>)}</div>
          <div className="mt-7 flex items-center gap-3 rounded-xl bg-slate-50 p-4"><Clock3 className="shrink-0 text-indigo-500" size={18} /><p className="text-xs leading-5 text-slate-500">Data kandidat tersedia pada halaman Ringkasan Hasil.</p></div>
        </div>
      </section>
    </div>
  );
}
