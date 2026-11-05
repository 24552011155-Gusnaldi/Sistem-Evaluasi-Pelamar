import { NextResponse } from "next/server";
import { createSessionToken, isAuthConfigured, verifyCredentials } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Login admin belum dikonfigurasi di environment server." }, { status: 503 });
  }

  let credentials: unknown;
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan login tidak valid." }, { status: 400 });
  }

  if (typeof credentials !== "object" || credentials === null ||
      !("username" in credentials) || !("password" in credentials) ||
      typeof credentials.username !== "string" || typeof credentials.password !== "string" ||
      !verifyCredentials(credentials.username, credentials.password)) {
    return NextResponse.json({ error: "Username atau password tidak sesuai." }, { status: 401 });
  }

  const { token, maxAge } = createSessionToken(credentials.username);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set("seleva_session", token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
