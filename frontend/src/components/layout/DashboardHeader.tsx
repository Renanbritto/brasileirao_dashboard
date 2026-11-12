"use client";

import React from "react";
import { Trophy, Calendar, Shield, X, Sun, Moon } from "lucide-react";
import { ClubCrest } from "@/components/ui/ClubCrest";
import { Club } from "@/lib/api";
import { MODULES_LIST } from "@/components/layout/DashboardSidebar";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#05070d]/90 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-[1640px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Left: Brand Identity + Module Context + Live Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent border border-emerald-400/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Trophy className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-black tracking-wider uppercase text-white hidden sm:inline">
              Brasileirão <span className="text-emerald-400">Analytics</span>
            </span>
            <span className="text-zinc-600 font-light hidden sm:inline">/</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-200 truncate">
              {currentMod.shortTitle}
            </span>
          </div>

          {/* Compact Live Round Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 ${
              isCurrentSeason
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-slate-300 bg-slate-100 text-slate-700 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-zinc-300"
            }`}
          >
            {isCurrentSeason && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {isCurrentSeason ? `Rodada ${currentRound}/38` : `Edição ${year} • Encerrada`}
          </div>
        </div>

        {/* Right: Clean, Unified Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Division Switcher (Série A / Série B) */}
          <div className="flex items-center rounded-xl bg-slate-200 border border-slate-300 p-0.5 shadow-inner dark:bg-black/40 dark:border-white/[0.08]">
            <button
              onClick={() => setDivision("A")}
              className={`rounded-lg px-2.5 sm:px-3.5 py-1 text-xs font-black transition-all ${
                division === "A"
                  ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 shadow-sm"
                  : "text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Série A
            </button>
            <button
              onClick={() => setDivision("B")}
              className={`rounded-lg px-2.5 sm:px-3.5 py-1 text-xs font-black transition-all ${
                division === "B"
                  ? "bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 shadow-sm"
                  : "text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Série B
            </button>
          </div>

          {/* Edition / Year Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-2.5 py-1 text-xs text-slate-800 shadow-sm transition-colors dark:bg-black/40 dark:border-white/[0.08] dark:text-zinc-300 dark:hover:border-white/20">
            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="cursor-pointer bg-transparent font-bold text-slate-800 focus:outline-none dark:text-zinc-200"
            >
              <option value={2026} className="bg-white text-emerald-700 dark:bg-[#090c14] dark:text-emerald-400">
                2026 (Ao Vivo)
              </option>
              <option value={2025} className="bg-white text-slate-800 dark:bg-[#090c14] dark:text-zinc-200">
                2025
              </option>
              <option value={2024} className="bg-white text-slate-800 dark:bg-[#090c14] dark:text-zinc-200">
                2024
              </option>
            </select>
          </div>

          {/* Highlight "Meu Clube" Selector */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-1 text-xs transition-colors shadow-sm ${
              favClub
                ? "border-amber-400/60 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-300"
                : "border-slate-300 bg-white text-slate-800 dark:border-white/[0.08] dark:bg-black/40 dark:text-zinc-300 dark:hover:border-white/20"
            }`}
          >
            {favClub ? (
              <ClubCrest club={favClub} size="xs" />
            ) : (
              <Shield className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-500 shrink-0" />
            )}
            <select
              value={favoriteClubSlug}
              onChange={(e) => setFavoriteClubSlug(e.target.value)}
              className="cursor-pointer bg-transparent font-bold text-slate-800 focus:outline-none max-w-[120px] sm:max-w-[160px] truncate dark:text-zinc-200"
            >
              <option value="" className="bg-white text-slate-500 dark:bg-[#090c14] dark:text-zinc-400">
                Meu Clube
              </option>
              {clubs.map((c) => (
                <option
                  key={c.slug}
                  value={c.slug}
                  className="bg-white text-slate-800 dark:bg-[#090c14] dark:text-zinc-100"
                >
                  {c.name}
                </option>
              ))}
            </select>
            {favoriteClubSlug && (
              <button
                onClick={() => setFavoriteClubSlug("")}
                title="Remover filtro de clube"
                className="rounded p-0.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Theme Toggle Button (Claro / Escuro) */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
            aria-label={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
            className="flex items-center gap-1.5 rounded-xl bg-black/40 border border-white/[0.08] px-2.5 py-1 text-xs font-bold text-zinc-300 hover:text-white hover:border-white/20 transition-all active:scale-95 shadow-sm"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Modo Escuro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
