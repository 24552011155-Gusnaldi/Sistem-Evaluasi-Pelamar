import type { Metadata } from "next";
import { AppProvider } from "../components/AppProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seleva | Evaluasi Pelamar",
  description: "Sistem evaluasi CV berbasis AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
