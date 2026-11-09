"use client";

import React from "react";
import { Trophy, Calendar, Shield, X } from "lucide-react";
import { ClubCrest } from "@/components/ui/ClubCrest";
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
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isCurrentSeason ? `Rodada ${currentRound}/38` : `Edição ${year}`}
          </div>
        </div>

        {/* Right: Clean, Unified Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Division Switcher (Série A / Série B) */}
          <div className="flex items-center rounded-xl bg-black/40 border border-white/[0.08] p-0.5 shadow-inner">
            <button
              onClick={() => setDivision("A")}
              className={`rounded-lg px-2.5 sm:px-3.5 py-1 text-xs font-black transition-all ${
                division === "A"
                  ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Série A
            </button>
            <button
              onClick={() => setDivision("B")}
              className={`rounded-lg px-2.5 sm:px-3.5 py-1 text-xs font-black transition-all ${
                division === "B"
                  ? "bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Série B
            </button>
          </div>

          {/* Edition / Year Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl bg-black/40 border border-white/[0.08] px-2.5 py-1 text-xs text-zinc-300 hover:border-white/20 transition-colors">
            <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="cursor-pointer bg-transparent font-bold text-zinc-200 focus:outline-none"
            >
              <option value={2026} className="bg-[#090c14] text-emerald-400">
                2026 (Ao Vivo)
              </option>
              <option value={2025} className="bg-[#090c14] text-zinc-200">
                2025
              </option>
              <option value={2024} className="bg-[#090c14] text-zinc-200">
                2024
              </option>
            </select>
          </div>

          {/* Highlight "Meu Clube" Selector */}
          <div
            className={`flex items-center gap-2 rounded-xl bg-black/40 border px-2.5 py-1 text-xs transition-colors ${
              favClub
                ? "border-amber-400/40 bg-amber-500/10 text-amber-300"
                : "border-white/[0.08] text-zinc-300 hover:border-white/20"
            }`}
          >
            {favClub ? (
              <ClubCrest club={favClub} size="xs" />
            ) : (
              <Shield className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            )}
            <select
              value={favoriteClubSlug}
              onChange={(e) => setFavoriteClubSlug(e.target.value)}
              className="cursor-pointer bg-transparent font-bold text-zinc-200 focus:outline-none max-w-[120px] sm:max-w-[160px] truncate"
            >
              <option value="" className="bg-[#090c14] text-zinc-400">
                Meu Clube
              </option>
              {clubs.map((c) => (
                <option
                  key={c.slug}
                  value={c.slug}
                  className="bg-[#090c14] text-zinc-100"
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
        </div>
      </div>
    </header>
  );
}
