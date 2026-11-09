"use client";

import React from "react";
import { Radio, Star, Calendar, Shield } from "lucide-react";
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
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#05070d]/78 backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.85)]">
      <div className="mx-auto flex max-w-[1640px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Current Active Module Context */}
        <div className="flex items-center gap-3.5">
          <div className="obsidian-subcard flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-emerald-400/30 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
            <ActiveIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                {currentMod.label}
              </h1>
              <Badge variant="default" className="gap-1.5 px-2.5 py-0.5 font-mono">
                <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                {isCurrentSeason
                  ? `AO VIVO • R${currentRound}/38`
                  : `EDIÇÃO ${year} (38/38)`}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">{currentMod.sublabel}</p>
          </div>
        </div>

        {/* Right: Obsidian Glass Global Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Division Switcher Well */}
          <div className="obsidian-well inline-flex rounded-2xl p-1">
            <button
              onClick={() => setDivision("A")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold tracking-wide transition-all ${
                division === "A"
                  ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_14px_rgba(16,185,129,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>🏆</span> SÉRIE A
            </button>
            <button
              onClick={() => setDivision("B")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold tracking-wide transition-all ${
                division === "B"
                  ? "bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_14px_rgba(245,158,11,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>🔥</span> SÉRIE B
            </button>
          </div>

          {/* Season Selector Well */}
          <div className="obsidian-well flex items-center gap-2 rounded-2xl px-3.5 py-1.5 transition-colors hover:border-white/15">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Edição:
            </span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="cursor-pointer bg-transparent text-xs font-bold text-white focus:outline-none"
            >
              <option value={2026} className="bg-[#090c14] text-emerald-400">
                🔴 2026 — Temporada Atual (R32/38 Ao Vivo)
              </option>
              <option value={2025} className="bg-[#090c14] text-zinc-200">
                2025 — Temporada Completa (38/38)
              </option>
              <option value={2024} className="bg-[#090c14] text-zinc-200">
                2024 — Temporada Completa (38/38)
              </option>
            </select>
          </div>

          {/* Highlight "Meu Clube" Selector Well */}
          <div className="obsidian-well flex items-center gap-2 rounded-2xl px-3.5 py-1.5 transition-colors hover:border-amber-400/30">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Meu Clube:
            </span>
            {favClub ? (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/40"
                style={{ backgroundColor: favClub.primary_color }}
              />
            ) : (
              <Shield className="h-3.5 w-3.5 text-zinc-500" />
            )}
            <select
              value={favoriteClubSlug}
              onChange={(e) => setFavoriteClubSlug(e.target.value)}
              className="cursor-pointer bg-transparent text-xs font-extrabold text-amber-300 focus:outline-none"
            >
              <option value="" className="bg-[#090c14] text-zinc-300">
                Todos os Clubes (Visão Geral)
              </option>
              {clubs.map((c) => (
                <option
                  key={c.slug}
                  value={c.slug}
                  className="bg-[#090c14] text-zinc-100"
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
