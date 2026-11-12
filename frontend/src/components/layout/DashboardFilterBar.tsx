"use client";

import React from "react";
import { Calendar, Shield, SlidersHorizontal, X } from "lucide-react";
import { ClubCrest } from "@/components/ui/ClubCrest";
import { Club } from "@/lib/api";

interface DashboardFilterBarProps {
  division: "A" | "B";
  setDivision: (div: "A" | "B") => void;
  year: number;
  setYear: (yr: number) => void;
  clubs: Club[];
  favoriteClubSlug: string;
  setFavoriteClubSlug: (slug: string) => void;
  className?: string;
}

export function DashboardFilterBar({
  division,
  setDivision,
  year,
  setYear,
  clubs,
  favoriteClubSlug,
  setFavoriteClubSlug,
  className = "",
}: DashboardFilterBarProps) {
  const favClub = clubs.find((c) => c.slug === favoriteClubSlug);

  return (
    <section
      aria-label="Filtros da competição"
      className={`obsidian-glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 ${className}`}
    >
      {/* Context Label */}
      <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-zinc-400">
        <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span>Filtros da Competição</span>
      </div>

      {/* Controls: Division + Year + Favorite Club */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
            <option
              value={2026}
              className="bg-white text-emerald-700 dark:bg-[#090c14] dark:text-emerald-400"
            >
              2026 (Ao Vivo)
            </option>
            <option
              value={2025}
              className="bg-white text-slate-800 dark:bg-[#090c14] dark:text-zinc-200"
            >
              2025
            </option>
            <option
              value={2024}
              className="bg-white text-slate-800 dark:bg-[#090c14] dark:text-zinc-200"
            >
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
            className="cursor-pointer bg-transparent font-bold text-slate-800 focus:outline-none max-w-[130px] sm:max-w-[175px] truncate dark:text-zinc-200"
          >
            <option
              value=""
              className="bg-white text-slate-500 dark:bg-[#090c14] dark:text-zinc-400"
            >
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
              className="rounded p-0.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

