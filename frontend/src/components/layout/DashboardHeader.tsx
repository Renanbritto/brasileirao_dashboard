"use client";

import React from "react";
import {
  Trophy,
  Radio,
  Star,
  Calendar,
  Shield,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const ActiveIcon = currentMod.icon;
  const seasonPct = Math.round((currentRound / 38) * 100);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl shadow-[0_14px_34px_-12px_rgba(0,0,0,0.9)]">
      {/* ====================================================================
          TIER 1: CABEÇALHO PRINCIPAL (BRAND + MÓDULO ATIVO + STATUS DA RODADA)
         ==================================================================== */}
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-sky-500/[0.04]">
        <div className="mx-auto flex max-w-[1640px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          {/* Left: Brand Identity + Active Module Title */}
          <div className="flex items-center gap-3.5">
            {/* Brand Emblem */}
            <div className="flex items-center gap-2.5 pr-3.5 border-r border-white/[0.08]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-amber-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <Trophy className="h-5 w-5 text-zinc-950" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-extrabold tracking-wider text-white leading-none">
                  BRASILEIRÃO <span className="text-emerald-400">ANALYTICS</span>
                </p>
                <p className="mt-1 text-[10px] font-medium text-zinc-400 leading-none">
                  Série A & B Intelligence
                </p>
              </div>
            </div>

            {/* Active Module Context */}
            <div className="flex items-center gap-3">
              <div className="obsidian-subcard flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-emerald-400/30 text-emerald-400">
                <ActiveIcon className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-white sm:text-base md:text-lg leading-tight">
                  {currentMod.label}
                </h1>
                <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                  {currentMod.sublabel}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Live Championship Status & Progress */}
          <div className="flex items-center gap-3">
            <Badge variant="default" className="gap-1.5 px-3 py-1">
              <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
              {isCurrentSeason
                ? `AO VIVO • RODADA ${currentRound}/38`
                : `EDIÇÃO ${year} • ENCERRADA (38/38)`}
            </Badge>

            <div className="obsidian-well hidden md:flex items-center gap-2.5 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Progresso:
              </span>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/70 border border-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                  style={{ width: `${seasonPct}%` }}
                />
              </div>
              <span className="text-[11px] font-extrabold text-emerald-400">
                {seasonPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TIER 2: BARRA DE FILTROS GLOBAIS (ABAIXO DO CABEÇALHO)
         ==================================================================== */}
      <div className="bg-[#080b13]/90">
        <div className="mx-auto flex max-w-[1640px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Left & Center: All Filters Aligned Horizontally */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Label */}
            <div className="flex items-center gap-1.5 pr-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Filtros:</span>
            </div>

            {/* 1. Division Switcher (Série A / Série B) */}
            <div className="obsidian-well inline-flex items-center rounded-xl p-1">
              <button
                onClick={() => setDivision("A")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold tracking-wide transition-all ${
                  division === "A"
                    ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_12px_rgba(16,185,129,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                SÉRIE A
              </button>
              <button
                onClick={() => setDivision("B")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold tracking-wide transition-all ${
                  division === "B"
                    ? "bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_12px_rgba(245,158,11,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                SÉRIE B
              </button>
            </div>

            {/* 2. Season / Edition Selector */}
            <div className="obsidian-well flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:border-white/15">
              <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Edição:
              </span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="cursor-pointer bg-transparent text-xs font-bold text-white focus:outline-none"
              >
                <option value={2026} className="bg-[#090c14] text-emerald-400">
                  2026 — Temporada Atual (R32/38 Ao Vivo)
                </option>
                <option value={2025} className="bg-[#090c14] text-zinc-200">
                  2025 — Temporada Completa (38/38)
                </option>
                <option value={2024} className="bg-[#090c14] text-zinc-200">
                  2024 — Temporada Completa (38/38)
                </option>
              </select>
            </div>

            {/* 3. Highlight "Meu Clube" Selector */}
            <div className="obsidian-well flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:border-amber-400/30">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Meu Clube:
              </span>
              {favClub ? (
                <ClubCrest club={favClub} size="xs" />
              ) : (
                <Shield className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
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
              {favoriteClubSlug && (
                <button
                  onClick={() => setFavoriteClubSlug("")}
                  title="Remover destaque do clube"
                  className="ml-1 rounded-md p-0.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Quick Context Reference Pills */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="obsidian-subcard rounded-lg px-2.5 py-1">
              Corte G4:{" "}
              <strong className="text-emerald-400">
                {division === "A" ? "62 pts" : "64 pts"}
              </strong>
            </span>
            <span className="obsidian-subcard rounded-lg px-2.5 py-1">
              Fuga Z4:{" "}
              <strong className="text-rose-400">
                {division === "A" ? "45 pts" : "44 pts"}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
