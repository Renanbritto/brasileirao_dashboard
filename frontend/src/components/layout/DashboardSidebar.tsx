"use client";

import React from "react";
import {
  Flame,
  TrendingUp,
  Target,
  Plane,
  Swords,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Sun,
  Moon,
} from "lucide-react";
import { ModuleKey } from "@/components/layout/DashboardHeader";
import { SoccerBallLogo } from "@/components/ui/SoccerBallLogo";
import { useTheme } from "@/context/ThemeContext";

interface DashboardSidebarProps {
  activeModule: ModuleKey;
  setActiveModule: (mod: ModuleKey) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  division: "A" | "B";
  year: number;
  currentRound: number;
  totalRounds: number;
  isCurrentSeason: boolean;
}

export const MODULES_LIST: {
  key: ModuleKey;
  label: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  {
    key: "live",
    label: "Temporada Atual",
    shortTitle: "Temporada Atual",
    icon: Flame,
    badge: "Ao Vivo",
  },
  {
    key: "rounds",
    label: "Turnos & Rodadas",
    shortTitle: "Turnos & Rodadas",
    icon: TrendingUp,
  },
  {
    key: "tactics",
    label: "Raio-X Tático",
    shortTitle: "Raio-X Tático",
    icon: Target,
  },
  {
    key: "geo",
    label: "Mando & Viagens",
    shortTitle: "Mando & Viagens",
    icon: Plane,
  },
  {
    key: "h2h",
    label: "Confronto Direto",
    shortTitle: "Confronto Direto",
    icon: Swords,
  },
  {
    key: "history",
    label: "Histórico Série A / B",
    shortTitle: "Histórico Série A / B",
    icon: History,
  },
];

export function DashboardSidebar({
  activeModule,
  setActiveModule,
  isCollapsed,
  setIsCollapsed,
  division,
  year,
  currentRound,
  totalRounds,
  isCurrentSeason,
}: DashboardSidebarProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-white/[0.08] bg-[#06080f]/90 backdrop-blur-2xl transition-all duration-300 ease-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header: Brand + Collapse Button */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-3.5">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent border border-emerald-400/35 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <SoccerBallLogo className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-black tracking-wider uppercase text-white leading-none">
                Brasileirão <span className="text-emerald-400">Glass</span>
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors active:scale-95 ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-emerald-400" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Section Label */}
      {!isCollapsed && (
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Navegação
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {MODULES_LIST.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.key;

          return (
            <div key={mod.key} className="group relative">
              <button
                onClick={() => setActiveModule(mod.key)}
                className={`relative flex w-full items-center gap-2.5 rounded-xl text-left transition-colors duration-150 ${
                  isCollapsed ? "justify-center p-2.5" : "px-3 py-2"
                } ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/25"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-emerald-400"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5">
                    <span className="truncate text-xs font-semibold">
                      {mod.key === "live"
                        ? isCurrentSeason
                          ? "Temporada Atual"
                          : `Temporada ${year}`
                        : mod.label}
                    </span>
                    {mod.key === "live" && (
                      <span
                        className={`shrink-0 rounded-full border px-1.5 py-0.2 text-[9px] font-black uppercase ${
                          isCurrentSeason
                            ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                            : "bg-slate-200/80 border-slate-300 text-slate-700 dark:bg-white/[0.06] dark:border-white/[0.12] dark:text-zinc-300"
                        }`}
                      >
                        {isCurrentSeason ? "Ao Vivo" : "Final"}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Flyout Tooltip when Sidebar is Collapsed */}
              {isCollapsed && (
                <div className="pointer-events-none invisible absolute left-[70px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#090c14] px-3 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  {mod.key === "live"
                    ? isCurrentSeason
                      ? "Temporada Atual"
                      : `Temporada ${year}`
                    : mod.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Theme Toggle Button */}
      <div className="border-t border-white/[0.06] p-2">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
          aria-label={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
          className={`flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-xs font-semibold text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100 transition-colors ${
            isCollapsed ? "justify-center" : "px-3"
          }`}
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span>Modo Claro</span>}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span>Modo Escuro</span>}
            </>
          )}
        </button>
      </div>

      {/* Minimal Footer */}
      <div className="border-t border-white/[0.06] p-2.5">
        {isCollapsed ? (
          <div
            title={`Série ${division} • ${year} • Rodada ${currentRound}/${totalRounds}`}
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <Radio
              className={`h-3 w-3 ${
                isCurrentSeason ? "text-emerald-400 animate-pulse" : "text-zinc-400"
              }`}
            />
            <span className="font-mono text-[9px] font-bold text-zinc-300">
              R{currentRound}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isCurrentSeason ? "bg-emerald-400 animate-pulse" : "bg-zinc-400"
                }`}
              />
              <span className="text-[11px] font-bold text-zinc-300">
                Série {division} • {year}
              </span>
            </div>
            <span
              className={`font-mono text-[11px] font-bold ${
                isCurrentSeason ? "text-emerald-400" : "text-zinc-300"
              }`}
            >
              {isCurrentSeason ? `Rodada ${currentRound}/${totalRounds}` : `${currentRound}/${totalRounds} Final`}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
