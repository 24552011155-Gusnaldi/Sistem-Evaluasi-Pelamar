"use client";

import { useEffect } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

interface ApplicantData {
  nama: string;
  posisi: string;
  skor: number;
  ringkasan_ai: string;
  kelebihan: string[];
  kekurangan: string[];
  evaluasi_lengkap: string;
}

interface EvaluationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataApplicant: ApplicantData;
}

function getScoreColor(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 60) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

export default function EvaluationDetailModal({
  isOpen,
  onClose,
  dataApplicant,
}: EvaluationDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm animate-[evaluation-modal-fade-in_240ms_ease-out_both] motion-reduce:animate-none sm:p-6"
      onClick={onClose}
    >
      <div
        aria-labelledby="evaluation-detail-title"
        aria-modal="true"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_-20px_rgba(15,23,42,0.4)] animate-[evaluation-modal-enter_320ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
              Detail evaluasi kandidat
            </p>
            <h2
              className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
              id="evaluation-detail-title"
            >
              {dataApplicant.nama}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{dataApplicant.posisi}</p>
          </div>
          <button
            aria-label="Tutup detail evaluasi"
            className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="max-h-[min(72vh,680px)] space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
          <section aria-label="Skor kandidat" className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Skor kecocokan</p>
              <p className="mt-1 text-xs text-slate-500">Berdasarkan hasil evaluasi AI</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold ${getScoreColor(dataApplicant.skor)}`}
            >
              {dataApplicant.skor}
              <span className="font-medium opacity-70">/ 100</span>
            </span>
          </section>

          <p className="rounded-xl bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-600">
            {dataApplicant.ringkasan_ai}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 aria-hidden="true" size={18} />
                Kelebihan
              </h3>
              <ul className="space-y-2.5">
                {dataApplicant.kelebihan.map((item, index) => (
                  <li className="flex items-start gap-2.5 text-sm leading-5 text-slate-600" key={`${item}-${index}`}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-emerald-500"
                      size={16}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-700">
                <XCircle aria-hidden="true" size={18} />
                Kekurangan
              </h3>
              <ul className="space-y-2.5">
                {dataApplicant.kekurangan.map((item, index) => (
                  <li className="flex items-start gap-2.5 text-sm leading-5 text-slate-600" key={`${item}-${index}`}>
                    <XCircle
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-rose-500"
                      size={16}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section
            aria-label="Evaluasi lengkap"
            className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-4 sm:p-5"
          >
            <h3 className="mb-2 text-sm font-bold text-indigo-950">Evaluasi lengkap</h3>
            <p className="whitespace-pre-line text-sm leading-6 text-indigo-900/80">
              {dataApplicant.evaluasi_lengkap}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
