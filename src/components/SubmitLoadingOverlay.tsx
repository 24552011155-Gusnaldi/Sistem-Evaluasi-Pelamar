"use client";

import { useEffect, useState } from "react";

const loadingMessages = [
  "Mengunggah dokumen CV...",
  "Mengekstrak data pengalaman dan keahlian...",
  "AI sedang mengevaluasi kecocokan profil...",
  "Menyusun laporan akhir...",
];

interface SubmitLoadingOverlayProps {
  isVisible: boolean;
}

export default function SubmitLoadingOverlay({ isVisible }: SubmitLoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % loadingMessages.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      aria-label="Sedang memproses pengajuan"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-md animate-[evaluation-modal-fade-in_200ms_ease-out_both] motion-reduce:animate-none"
      role="status"
    >
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/60 bg-white/90 px-7 py-9 text-center shadow-[0_24px_80px_-20px_rgba(15,23,42,0.35)]">
        <div className="relative mb-6 grid size-20 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border-[3px] border-indigo-100" />
          <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 border-r-indigo-400 animate-spin motion-reduce:animate-none" />
          <span className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet-300 animate-[spin_1.8s_linear_infinite_reverse] motion-reduce:animate-none" />
          <span className="size-2.5 rounded-full bg-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.65)]" />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
          Mohon tunggu
        </p>
        <p
          className="min-h-12 text-base font-semibold leading-6 text-slate-800 animate-[loading-message-in_300ms_ease-out_both] motion-reduce:animate-none"
          key={messageIndex}
        >
          {loadingMessages[messageIndex]}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Proses ini mungkin membutuhkan waktu beberapa saat.
        </p>
      </div>
    </div>
  );
}
