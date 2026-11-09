"use client";

import React, { useState, useEffect } from "react";
import {
  DashboardHeader,
  ModuleKey,
} from "@/components/layout/DashboardHeader";
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
  const currentRound = overview?.season.current_round || 32;
  const isCurrentSeason = overview?.season.is_current ?? true;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Left Collapsible Sidebar Navigation */}
      <DashboardSidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        division={division}
        currentRound={currentRound}
        isCurrentSeason={isCurrentSeason}
      />

      {/* Right Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          division={division}
          setDivision={setDivision}
          year={year}
          setYear={setYear}
          activeModule={activeModule}
          clubs={clubsInDivision}
          favoriteClubSlug={favoriteClubSlug}
          setFavoriteClubSlug={setFavoriteClubSlug}
          currentRound={currentRound}
          isCurrentSeason={isCurrentSeason}
        />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
          {loading && !overview ? (
            <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-slate-300">
                Carregando motor analítico da Série {division} ({year})...
              </p>
            </div>
          ) : error && !overview ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-6 text-center">
              <p className="text-base font-bold text-rose-300">{error}</p>
              <p className="mt-1 text-xs text-slate-400">
                Verifique se o servidor FastAPI está rodando em{" "}
                <code className="text-emerald-400">http://localhost:8000</code>
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
                  favoriteClubSlug={favoriteClubSlug}
                />
              )}
              {activeModule === "geo" && (
                <GeoContextModule
                  data={overview}
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
                <HistoryBridgeModule favoriteClubSlug={favoriteClubSlug} />
              )}
            </>
          ) : null}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-[1600px] px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              🇧🇷 <strong>Brasileirão Analytics (Série A & B)</strong> — Next.js 15 +
              shadcn/ui + Recharts + Python FastAPI
            </span>
            <span>
              Motor Matemático: Simulação de Monte Carlo (10k cenários) • Modelo de
              Poisson • Distância Aérea Haversine
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
