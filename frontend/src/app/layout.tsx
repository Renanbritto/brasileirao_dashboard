import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brasileirão Analytics | Série A & B Intelligence Platform",
  description:
    "Plataforma de Sports Analytics do Brasileirão Série A e B: Temporada Atual Ao Vivo, Simulação de Monte Carlo, Raio-X Tático, Geografia e Ponte Histórica 2003–Presente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

