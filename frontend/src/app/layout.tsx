import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600", "700", "800"],
});

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
    <html
      lang="pt-BR"
      className={`dark ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="obsidian-canvas min-h-screen font-sans text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
