"use client";

import React from "react";
import { Radio, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Club } from "@/lib/api";
import { MODULES_LIST } from "@/components/layout/DashboardSidebar";

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
  clubs: Club[];
  favoriteClubSlug: string;
  setFavoriteClubSlug: (slug: string) => void;
  currentRound: number;
  isCurrentSeason: boolean;
}

export function DashboardHeader({
  division,
  setDivision,
  year,
  setYear,
  activeModule,
  clubs,
  favoriteClubSlug,
  setFavoriteClubSlug,
  currentRound,
  isCurrentSeason,
}: DashboardHeaderProps) {
  const favClub = clubs.find((c) => c.slug === favoriteClubSlug);
  const currentMod =
    MODULES_LIST.find((m) => m.key === activeModule) || MODULES_LIST[0];
  const ActiveIcon = currentMod.icon;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Current Active Module Context */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <ActiveIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                {currentMod.label}
              </h1>
              <Badge variant="default" className="gap-1.5 px-2.5 py-0.5">
                <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                {isCurrentSeason
                  ? `AO VIVO • RODADA ${currentRound}/38`
                  : `TEMPORADA ${year} (38/38)`}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">{currentMod.sublabel}</p>
          </div>
        </div>

        {/* Right: Global Controls Bar */}
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
                <option
                  key={c.slug}
                  value={c.slug}
                  className="bg-slate-900 text-slate-100"
                >
                  {c.name} ({c.short_name} - {c.state_uf})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
