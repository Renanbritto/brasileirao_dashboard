"use client";

import React from "react";
import {
  Trophy,
  Radio,
  Flame,
  TrendingUp,
  Target,
  Plane,
  Swords,
  History,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Club } from "@/lib/api";

export type ModuleKey =
  | "live"
  | "rounds"
  | "tactics"
  | "geo"
  | "h2h"
  | "history";

interface DashboardHeaderProps {
  division: "A" | "B";
  setDivision: (div: "A" | "B") => void;
  year: number;
  setYear: (yr: number) => void;
  activeModule: ModuleKey;
  setActiveModule: (mod: ModuleKey) => void;
  clubs: Club[];
  favoriteClubSlug: string;
  setFavoriteClubSlug: (slug: string) => void;
  currentRound: number;
  isCurrentSeason: boolean;
}

const MODULES: {
  key: ModuleKey;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isHot?: boolean;
}[] = [
  {
    key: "live",
    label: "1. Temporada Atual & Simulador",
    sublabel: "Ao Vivo • Monte Carlo • SOS • Conta do Chá",
    icon: Flame,
    isHot: true,
  },
  {
    key: "rounds",
    label: "2. Turnos & Corrida por Rodada",
    sublabel: "Bump Chart • Cavalo Paraguaio • 45/64 pts",
    icon: TrendingUp,
  },
  {
    key: "tactics",
    label: "3. Raio-X Tático & Eficiência",
    sublabel: "Quadrantes xG • Relógio do Gol • Reação",
    icon: Target,
  },
  {
    key: "geo",
    label: "4. Mando, Horários & Viagens",
    sublabel: "Casa vs Fora • Sintético • Km Voados",
    icon: Plane,
  },
  {
    key: "h2h",
    label: "5. Confronto Direto & Poisson",
    sublabel: "Tale of the Tape • Radar • Tabus",
    icon: Swords,
  },
  {
    key: "history",
    label: "6. Ponte Série A ↔ B (2003+)",
    sublabel: "Efeito Gangorra • Bate e Volta • Promovidos",
    icon: History,
  },
];

export function DashboardHeader({
  division,
  setDivision,
  year,
  setYear,
  activeModule,
  setActiveModule,
  clubs,
  favoriteClubSlug,
  setFavoriteClubSlug,
  currentRound,
  isCurrentSeason,
}: DashboardHeaderProps) {
  const favClub = clubs.find((c) => c.slug === favoriteClubSlug);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
        {/* Top Row: Brand + Global Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Brand & Live Status */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-500 shadow-lg shadow-emerald-500/20">
              <Trophy className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  BRASILEIRÃO <span className="text-emerald-400">ANALYTICS</span>
                </h1>
                <Badge variant="default" className="gap-1.5 px-2.5 py-0.5">
                  <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                  {isCurrentSeason
                    ? `AO VIVO • RODADA ${currentRound}/38`
                    : `TEMPORADA ${year} (38/38)`}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Inteligência Tática, Simulação de Monte Carlo (10.000 cenários) e Ponte Histórica Série A ↔ B
              </p>
            </div>
          </div>

          {/* Global Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Division Switcher */}
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/90 p-1">
              <button
                onClick={() => setDivision("A")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  division === "A"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>🏆</span> SÉRIE A
              </button>
              <button
                onClick={() => setDivision("B")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  division === "B"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>🔥</span> SÉRIE B
              </button>
            </div>

            {/* Season Selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Edição:
              </span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none"
              >
                <option value={2026} className="bg-slate-900 text-emerald-400">
                  🔴 2026 — Temporada Atual (R32/38 Ao Vivo)
                </option>
                <option value={2025} className="bg-slate-900 text-slate-200">
                  2025 — Temporada Completa (38/38)
                </option>
                <option value={2024} className="bg-slate-900 text-slate-200">
                  2024 — Temporada Completa (38/38)
                </option>
              </select>
            </div>

            {/* Highlight "Meu Clube" Selector */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Meu Clube:
              </span>
              {favClub && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/40"
                  style={{ backgroundColor: favClub.primary_color }}
                />
              )}
              <select
                value={favoriteClubSlug}
                onChange={(e) => setFavoriteClubSlug(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  Todos (Sem destaque fixo)
                </option>
                {clubs.map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-slate-900 text-slate-100">
                    {c.name} ({c.short_name} - {c.state_uf})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Row: 6 Module Navigation Pills */}
        <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.key;
            return (
              <button
                key={mod.key}
                onClick={() => setActiveModule(mod.key)}
                className={`group flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-all ${
                  isActive
                    ? "border-emerald-500/60 bg-emerald-500/15 text-white shadow-md shadow-emerald-950/50"
                    : "border-slate-800/70 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span>{mod.label}</span>
                    {mod.isHot && (
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-rose-400 border border-rose-500/30">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-300">
                    {mod.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
