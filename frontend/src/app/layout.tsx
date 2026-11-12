import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Futebol Analytics | Série A & B Intelligence Platform",
  description:
    "Plataforma de Sports Analytics do Brasileirão Série A e B: Temporada Atual Ao Vivo, Simulação de Monte Carlo, Raio-X Tático, Geografia e Ponte Histórica 2003–Presente.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`dark ${comfortaa.variable}`} suppressHydrationWarning>
      <body
        className={`${comfortaa.className} obsidian-canvas min-h-screen font-sans text-zinc-100 antialiased transition-colors duration-200`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
