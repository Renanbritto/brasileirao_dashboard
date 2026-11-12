"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { MODULES_LIST } from "@/components/layout/DashboardSidebar";
import { SoccerBallLogo } from "@/components/ui/SoccerBallLogo";
import { useTheme } from "@/context/ThemeContext";

export type ModuleKey =
  | "live"
  | "rounds"
  | "tactics"
  | "geo"
  | "h2h"
  | "history";

interface DashboardHeaderProps {
  year: number;
  activeModule: ModuleKey;
  currentRound: number;
  isCurrentSeason: boolean;
}

export function DashboardHeader({
  year,
  activeModule,
  currentRound,
  isCurrentSeason,
}: DashboardHeaderProps) {
  const currentMod =
    MODULES_LIST.find((m) => m.key === activeModule) || MODULES_LIST[0];
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#05070d]/90 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-[1640px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Left: Brand Identity + Module Context + Live Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent border border-emerald-400/35 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.22)]">
            <SoccerBallLogo className="h-5 w-5" />
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

        {/* Right: Theme Toggle */}
        <div className="flex items-center shrink-0">
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
