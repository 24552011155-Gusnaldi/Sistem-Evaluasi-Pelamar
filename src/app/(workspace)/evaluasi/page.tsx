"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";
import ApplicantAvatar from "../../../components/ApplicantAvatar";
import { useAppData, type EvaluationResult } from "../../../components/AppProvider";

const positions = ["Product Designer", "Software Engineer", "Data Analyst", "Product Manager", "UI/UX Designer", "Frontend Developer", "Digital Marketing"];
const maxFileBytes = 4 * 1024 * 1024;
type FileStatus = "pending" | "uploading" | "completed" | "failed";
type BatchFile = {
  id: string;
  file: File;
  status: FileStatus;
  message: string;
  result?: EvaluationResult;
};

function readEvaluation(value: unknown): EvaluationResult {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== "object" || first === null) {
    throw new Error("Respons AI tidak memiliki format evaluasi yang valid.");
  }

  const envelope = first as Record<string, unknown>;
  const nested = envelope.data ?? envelope.result ?? envelope.output ?? envelope.body;
  const data = typeof nested === "object" && nested !== null && !Array.isArray(nested)
    ? nested as Record<string, unknown>
    : envelope;
  if (
    typeof data.skor !== "number" ||
    !Number.isFinite(data.skor) ||
    typeof data.ringkasan_ai !== "string" ||
    !Array.isArray(data.kelebihan) ||
    !data.kelebihan.every((item): item is string => typeof item === "string") ||
    !Array.isArray(data.kekurangan) ||
    !data.kekurangan.every((item): item is string => typeof item === "string") ||
    typeof data.evaluasi_lengkap !== "string"
  ) {
    throw new Error("Respons AI tidak memiliki format evaluasi yang valid.");
  }

  const avatarValue = data.foto_url ?? data.url_foto ?? data.avatar_url ?? data.image_url ?? data.photo_url ?? data.avatarUrl ?? data.photoUrl ?? data.photo ?? data.image;
  const avatarUrl = typeof avatarValue === "string" && /^https?:\/\//i.test(avatarValue)
    ? avatarValue
    : undefined;
  return {
    skor: data.skor,
    ringkasan_ai: data.ringkasan_ai,
    kelebihan: data.kelebihan,
    kekurangan: data.kekurangan,
    evaluasi_lengkap: data.evaluasi_lengkap,
    nama: typeof (data.nama ?? data.nama_pelamar ?? data.name) === "string" && String(data.nama ?? data.nama_pelamar ?? data.name).trim()
      ? String(data.nama ?? data.nama_pelamar ?? data.name).trim()
      : undefined,
    avatarUrl,
  };
}

function getApplicantName(fileName: string, result?: EvaluationResult) {
  return result?.nama || fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "Kandidat baru";
}

function scoreColor(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 60) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function statusLabel(status: FileStatus) {
  if (status === "uploading") return "Sedang dievaluasi AI...";
  if (status === "completed") return "Evaluasi selesai";
  if (status === "failed") return "Evaluasi gagal";
  return "Menunggu giliran";
}

export default function EvaluasiPage() {
  const { addApplicant } = useAppData();
  const [position, setPosition] = useState(positions[0]);
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const processedCount = batchFiles.filter((item) => item.status === "completed" || item.status === "failed").length;
  const progress = batchFiles.length ? Math.round((processedCount / batchFiles.length) * 100) : 0;
  const completedFiles = useMemo(() => batchFiles.filter((item) => item.status === "completed" && item.result), [batchFiles]);

  function handleFilesChange(files: FileList | null) {
    const selected = Array.from(files ?? []);
    setErrorMessage("");
    setBatchFiles(selected.map((file, index) => {
      let message = "Menunggu giliran";
      let status: FileStatus = "pending";
      if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
        status = "failed";
        message = "Format file harus PDF.";
      } else if (file.size === 0 || file.size > maxFileBytes) {
        status = "failed";
        message = file.size === 0 ? "File kosong." : "Ukuran file melebihi 4 MB.";
      }
      return { id: `${file.name}-${file.lastModified}-${index}`, file, status, message };
    }));
  }

  function updateFile(id: string, update: Partial<BatchFile>) {
    setBatchFiles((current) => current.map((item) => item.id === id ? { ...item, ...update } : item));
  }

  async function handleBatchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const pendingFiles = batchFiles.filter((item) => item.status === "pending");
    if (!pendingFiles.length) {
      setErrorMessage("Pilih setidaknya satu file PDF yang valid.");
      return;
    }

    setIsLoading(true);
    try {
      for (const item of pendingFiles) {
        updateFile(item.id, { status: "uploading", message: "Sedang dievaluasi AI..." });
        const formData = new FormData();
        formData.append("posisi", position);
        formData.append("cv_file", item.file, item.file.name);

        try {
          const response = await fetch("/api/evaluate", {
            method: "POST",
            body: formData,
          });
          let responseData: unknown;
          try {
            responseData = await response.json();
          } catch {
            throw new Error(`Server mengembalikan respons yang tidak valid (HTTP ${response.status}).`);
          }
          if (!response.ok) {
            const error = responseData as { error?: unknown; detail?: unknown };
            const detail = typeof error.detail === "string" ? ` ${error.detail}` : "";
            throw new Error(`${typeof error.error === "string" ? error.error : `Request gagal (HTTP ${response.status}).`}${detail}`);
          }

          const result = readEvaluation(responseData);
          updateFile(item.id, { status: "completed", message: "Evaluasi selesai", result });
          addApplicant({
            name: getApplicantName(item.file.name, result),
            role: position,
            fileName: item.file.name,
            result,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Tidak dapat menghubungi layanan evaluasi.";
          updateFile(item.id, { status: "failed", message });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Evaluasi kandidat</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Evaluasi CV</h1>
        <p className="mt-2 text-sm text-slate-500">Pilih beberapa dokumen PDF. Setiap CV dikirim satu per satu ke workflow AI.</p>
      </header>

      <form className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-[1.1fr_.9fr]" onSubmit={handleBatchSubmit}>
        <div className="grid content-start gap-2 text-sm font-semibold text-slate-700">
          <label htmlFor="cv-files">Dokumen CV (PDF)</label>
          <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-5 py-7 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
            <input
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={isLoading}
              id="cv-files"
              multiple
              onChange={(event) => {
                handleFilesChange(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
              type="file"
            />
            <span className="grid size-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><UploadCloud size={23} /></span>
            <strong className="mt-4 text-sm text-slate-800">{batchFiles.length ? `${batchFiles.length} file dipilih` : "Pilih beberapa CV berformat PDF"}</strong>
            <span className="mt-1 text-xs text-slate-500">PDF saja · Maksimal 4 MB per file</span>
          </label>
          {batchFiles.length > 0 && (
            <button
              className="justify-self-start text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              disabled={isLoading}
              onClick={() => setBatchFiles([])}
              type="button"
            >
              Hapus semua file
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <label className="grid gap-2 text-sm font-semibold text-slate-700" htmlFor="applicant-position">Posisi yang dilamar
            <select className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50" disabled={isLoading} id="applicant-position" onChange={(event) => setPosition(event.target.value)} value={position}>
              {positions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <div className="flex-1 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">Sebelum mengirim</p>
            <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-500">
              <li className="flex gap-2"><FileText className="shrink-0 text-indigo-500" size={15} />Setiap file dievaluasi terpisah dan berurutan.</li>
              <li className="flex gap-2"><FileText className="shrink-0 text-indigo-500" size={15} />Kandidat yang berhasil akan muncul di Ringkasan Hasil.</li>
            </ul>
          </div>
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isLoading || !batchFiles.some((item) => item.status === "pending")} type="submit">
            {isLoading ? <><LoaderCircle className="animate-spin" size={17} /> Sedang mengevaluasi CV...</> : <><Sparkles size={17} /> {batchFiles.some((item) => item.status === "pending") ? `Evaluasi ${batchFiles.filter((item) => item.status === "pending").length} CV` : "Pilih CV"}</>}
          </button>
        </div>
        {errorMessage && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 lg:col-span-2" role="alert">{errorMessage}</p>}
      </form>

      {batchFiles.length > 0 && (
        <section aria-label="Progres evaluasi CV" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-bold text-slate-900">Progres evaluasi</h2><p className="mt-1 text-xs text-slate-500">{processedCount} dari {batchFiles.length} CV selesai diproses</p></div>
            <span className="text-sm font-bold text-indigo-700">{progress}%</span>
          </div>
          <div aria-label={`Progres ${progress}%`} className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress}>
            <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <ul className="divide-y divide-slate-100">
            {batchFiles.map((item) => (
              <li className="flex min-w-0 items-center gap-3 py-3" key={item.id}>
                <FileText className="shrink-0 text-slate-400" size={17} />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-700">{item.file.name}</span><span className={`mt-0.5 block text-xs ${item.status === "completed" ? "text-emerald-600" : item.status === "failed" ? "text-rose-600" : item.status === "uploading" ? "text-indigo-600" : "text-slate-400"}`}>{item.message || statusLabel(item.status)}</span></span>
                {item.status === "uploading" && <LoaderCircle className="shrink-0 animate-spin text-indigo-600" size={17} />}
                {item.status === "completed" && <CheckCircle2 className="shrink-0 text-emerald-600" size={18} />}
                {item.status === "failed" && <XCircle className="shrink-0 text-rose-600" size={18} />}
                {item.status === "pending" && !isLoading && <span className="shrink-0 text-xs text-slate-400">{statusLabel(item.status)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {completedFiles.map((item) => {
        const result = item.result;
        if (!result) return null;
        const applicantName = getApplicantName(item.file.name, result);
        return (
          <section aria-label={`Hasil evaluasi ${item.file.name}`} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex min-w-0 items-center gap-3">
                <ApplicantAvatar name={applicantName} photoUrl={result.avatarUrl} size={48} />
                <div className="min-w-0"><p className="truncate text-xs font-bold uppercase tracking-wider text-indigo-600">{item.file.name}</p><h2 className="mt-1 truncate text-xl font-bold text-slate-900">{applicantName}</h2></div>
              </div>
              <span className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${scoreColor(result.skor)}`}>Skor {result.skor} / 100</span>
            </div>
            <p className="text-sm leading-7 text-slate-600">{result.ringkasan_ai}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <section><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={18} />Kelebihan</h3><ul className="space-y-2">{result.kelebihan.map((entry, index) => <li className="flex gap-2 text-sm leading-6 text-slate-600" key={`${entry}-${index}`}><CheckCircle2 className="mt-1 shrink-0 text-emerald-500" size={16} />{entry}</li>)}</ul></section>
              <section><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-700"><XCircle size={18} />Kekurangan</h3><ul className="space-y-2">{result.kekurangan.map((entry, index) => <li className="flex gap-2 text-sm leading-6 text-slate-600" key={`${entry}-${index}`}><XCircle className="mt-1 shrink-0 text-rose-500" size={16} />{entry}</li>)}</ul></section>
            </div>
            <section className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4"><h3 className="mb-2 text-sm font-bold text-indigo-950">Evaluasi lengkap</h3><p className="whitespace-pre-line text-sm leading-6 text-indigo-900/80">{result.evaluasi_lengkap}</p></section>
          </section>
        );
      })}
    </div>
  );
}
