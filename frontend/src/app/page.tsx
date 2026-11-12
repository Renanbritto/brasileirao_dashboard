"use client";

import React, { useState, useEffect } from "react";
import {
  DashboardHeader,
  ModuleKey,
} from "@/components/layout/DashboardHeader";
import { DashboardFilterBar } from "@/components/layout/DashboardFilterBar";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { LiveSeasonModule } from "@/components/modules/LiveSeasonModule";
import { RoundsTurnsModule } from "@/components/modules/RoundsTurnsModule";
import { TacticsEfficiencyModule } from "@/components/modules/TacticsEfficiencyModule";
import { GeoContextModule } from "@/components/modules/GeoContextModule";
import { HeadToHeadModule } from "@/components/modules/HeadToHeadModule";
import { HistoryBridgeModule } from "@/components/modules/HistoryBridgeModule";
import { SeasonOverview, fetchSeasonOverview } from "@/lib/api";

export default function BrasileiraoDashboardPage() {
  const [division, setDivision] = useState<"A" | "B">("A");
  const [year, setYear] = useState<number>(2026);
  const [activeModule, setActiveModule] = useState<ModuleKey>("live");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [favoriteClubSlug, setFavoriteClubSlug] = useState<string>("");
  const [overview, setOverview] = useState<SeasonOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchSeasonOverview(division, year)
      .then((res) => {
        if (mounted) {
          setOverview(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Falha ao conectar com a API FastAPI (porta 8000)."
          );
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [division, year]);

  const clubsInDivision = overview?.standings.map((t) => t.club) || [];
  const currentRound = overview?.season.current_round ?? 38;
  const totalRounds = overview?.season.total_rounds ?? 38;
  const isCurrentSeason = overview?.season.is_current ?? true;

  return (
    <div className="obsidian-canvas flex min-h-screen text-zinc-100">
      {/* Left Collapsible Sidebar Navigation */}
      <DashboardSidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        division={division}
        year={year}
        currentRound={currentRound}
        totalRounds={totalRounds}
        isCurrentSeason={isCurrentSeason}
      />

      {/* Right Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          year={year}
          activeModule={activeModule}
          currentRound={currentRound}
          isCurrentSeason={isCurrentSeason}
        />

        <main className="mx-auto w-full max-w-[1640px] flex-1 px-4 pt-6 pb-8 sm:px-6">
          <DashboardFilterBar
            division={division}
            setDivision={setDivision}
            year={year}
            setYear={setYear}
            clubs={clubsInDivision}
            favoriteClubSlug={favoriteClubSlug}
            setFavoriteClubSlug={setFavoriteClubSlug}
            className="mb-8"
          />
          {loading && !overview ? (
            <div className="obsidian-glass flex h-72 flex-col items-center justify-center rounded-2xl p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-zinc-300">
                Carregando motor analítico da Série {division} ({year})...
              </p>
            </div>
          ) : error && !overview ? (
            <div className="obsidian-kpi-rose rounded-2xl border p-6 text-center">
              <p className="text-base font-bold text-rose-300">{error}</p>
              <p className="mt-1 text-xs text-zinc-400">
                Verifique se o servidor FastAPI está rodando em{" "}
                <code className="font-mono text-emerald-400">http://localhost:8000</code>
              </p>
            </div>
          ) : overview ? (
            <>
              {activeModule === "live" && (
                <LiveSeasonModule
                  data={overview}
                  division={division}
                  year={year}
                  favoriteClubSlug={favoriteClubSlug}
                />
              )}
              {activeModule === "rounds" && (
                <RoundsTurnsModule
                  data={overview}
                  division={division}
                  favoriteClubSlug={favoriteClubSlug}
                />
              )}
              {activeModule === "tactics" && (
                <TacticsEfficiencyModule
                  data={overview}
                  division={division}
                  year={year}
                  favoriteClubSlug={favoriteClubSlug}
                />
              )}
              {activeModule === "geo" && (
                <GeoContextModule
                  data={overview}
                  division={division}
                  year={year}
                  favoriteClubSlug={favoriteClubSlug}
                />
              )}
              {activeModule === "h2h" && (
                <HeadToHeadModule
                  data={overview}
                  division={division}
                  year={year}
                  favoriteClubSlug={favoriteClubSlug}
                />
              )}
              {activeModule === "history" && (
                <HistoryBridgeModule
                  favoriteClubSlug={favoriteClubSlug}
                  division={division}
                  year={year}
                />
              )}
            </>
          ) : null}
        </main>

        <footer className="border-t border-white/[0.06] bg-[#05070d]/80 backdrop-blur-xl py-4 text-center text-xs text-zinc-500">
          <div className="mx-auto max-w-[1640px] px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong className="text-zinc-300">Futebol Analytics (Série A & B)</strong> — Obsidian Glass Design System • Next.js 15 + shadcn/ui + FastAPI
            </span>
            <span className="font-mono text-[11px]">
              Monte Carlo (10k cenários) • Modelo de Poisson • Distância Aérea Haversine
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
