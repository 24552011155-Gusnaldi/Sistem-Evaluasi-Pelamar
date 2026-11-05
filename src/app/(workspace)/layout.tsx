import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MainLayout from "../../components/MainLayout";
import { verifySessionToken } from "../../lib/auth";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const session = (await cookies()).get("seleva_session")?.value;
  if (!verifySessionToken(session)) redirect("/login");
  return <MainLayout>{children}</MainLayout>;
}
