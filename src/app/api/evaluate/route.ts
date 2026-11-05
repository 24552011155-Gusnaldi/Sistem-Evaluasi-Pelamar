import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../lib/auth";

const webhookUrl = process.env.N8N_WEBHOOK_URL ?? "http://localhost:5678/webhook-test/evaluasi-cv";
const maxUploadBytes = 4 * 1024 * 1024;
const maxRequestBytes = 4.5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = (await cookies()).get("seleva_session")?.value;
    if (!verifySessionToken(session)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const contentLength = Number(request.headers.get("content-length"));
    if (contentLength > maxRequestBytes) {
      return NextResponse.json({ error: "Total request exceeds the 4 MB upload limit" }, { status: 413 });
    }

    let body: BodyInit;
    const headers: HeadersInit = { Accept: "application/json" };
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("cv_file");
      const position = form.get("posisi");
      if (!(file instanceof File) || typeof position !== "string" || !position.trim()) {
        return NextResponse.json({ error: "Provide a position and one CV PDF file" }, { status: 400 });
      }
      if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
        return NextResponse.json({ error: "The uploaded file must be a PDF" }, { status: 400 });
      }
      if (file.size === 0 || file.size > maxUploadBytes) {
        return NextResponse.json({ error: "The PDF must not be empty or exceed 4 MB" }, { status: 413 });
      }

      const webhookForm = new FormData();
      webhookForm.append("posisi", position);
      webhookForm.append("cv_file", file, file.name);
      body = webhookForm;
    } else {
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
      response = await fetch(webhookUrl, { method: "POST", headers, body, cache: "no-store" });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown connection error";
      return NextResponse.json({ error: "Unable to connect to the n8n webhook", detail }, { status: 502 });
    }

    const text = await response.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* n8n may return plain text */ }
    if (!response.ok) {
      return NextResponse.json({
        error: "Webhook returned an error",
        detail: typeof data === "string" ? data : JSON.stringify(data),
      }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown request error";
    return NextResponse.json({ error: "Unable to process evaluation request", detail }, { status: 400 });
  }
}
