"use client";

import React from "react";
import {
  Trophy,
  Flame,
  TrendingUp,
  Target,
  Plane,
  Swords,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
} from "lucide-react";
import { ModuleKey } from "@/components/layout/DashboardHeader";

interface DashboardSidebarProps {
  activeModule: ModuleKey;
  setActiveModule: (mod: ModuleKey) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  division: "A" | "B";
  currentRound: number;
  isCurrentSeason: boolean;
}

export const MODULES_LIST: {
  key: ModuleKey;
  shortTitle: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isHot?: boolean;
}[] = [
  {
    key: "live",
    shortTitle: "Temporada Atual",
    label: "1. Temporada Atual & Simulador",
    sublabel: "Ao Vivo • Monte Carlo • SOS • Conta do Chá",
    icon: Flame,
    isHot: true,
  },
  {
    key: "rounds",
    shortTitle: "Turnos & Rodadas",
    label: "2. Turnos & Corrida por Rodada",
    sublabel: "Bump Chart • Cavalo Paraguaio • 45/64 pts",
    icon: TrendingUp,
  },
  {
    key: "tactics",
    shortTitle: "Raio-X Tático",
    label: "3. Raio-X Tático & Eficiência",
    sublabel: "Quadrantes xG • Relógio do Gol • Reação",
    icon: Target,
  },
  {
    key: "geo",
    shortTitle: "Mando & Viagens",
    label: "4. Mando, Horários & Viagens",
    sublabel: "Casa vs Fora • Sintético • Km Voados",
    icon: Plane,
  },
  {
    key: "h2h",
    shortTitle: "Confronto Direto",
    label: "5. Confronto Direto & Poisson",
    sublabel: "Tale of the Tape • Radar • Tabus",
    icon: Swords,
  },
  {
    key: "history",
    shortTitle: "Ponte Série A ↔ B",
    label: "6. Ponte Série A ↔ B (2003+)",
    sublabel: "Efeito Gangorra • Bate e Volta • Promovidos",
    icon: History,
  },
];

export function DashboardSidebar({
  activeModule,
  setActiveModule,
  isCollapsed,
  setIsCollapsed,
  division,
  currentRound,
  isCurrentSeason,
}: DashboardSidebarProps) {
  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[72px]" : "w-72"
      }`}
    >
      {/* Top Brand + Collapse Button */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-3.5">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-500 shadow-md shadow-emerald-500/20">
              <Trophy className="h-5 w-5 text-slate-950" />
            </div>
            <div className="truncate">
              <p className="text-sm font-black tracking-tight text-white">
                BRASILEIRÃO <span className="text-emerald-400">PRO</span>
              </p>
              <p className="text-[10px] font-medium text-slate-400">
                Série A & B Intelligence
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white ${
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

      {/* Section Title */}
      {!isCollapsed && (
        <div className="px-4 pt-4 pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Módulos de Análise
          </span>
        </div>
      )}

      {/* Navigation Modules List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2.5 py-3">
        {MODULES_LIST.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.key;

          return (
            <button
              key={mod.key}
              onClick={() => setActiveModule(mod.key)}
              title={isCollapsed ? `${mod.label} — ${mod.sublabel}` : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl border text-left transition-all ${
                isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
              } ${
                isActive
                  ? "border-emerald-500/60 bg-emerald-500/15 text-white shadow-md shadow-emerald-950/40"
                  : "border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/70 hover:text-slate-200"
              }`}
            >
              {/* Left Active Bar Indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400" />
              )}

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-bold">
                      {mod.label}
                    </span>
                    {mod.isHot && (
                      <span className="shrink-0 rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-rose-400 border border-rose-500/30">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400 group-hover:text-slate-300">
                    {mod.sublabel}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Live Status Footer inside Sidebar */}
      <div className="border-t border-slate-800/80 p-3">
        {isCollapsed ? (
          <div
            title={
              isCurrentSeason
                ? `Série ${division} Ao Vivo • Rodada ${currentRound}/38`
                : `Série ${division} • 38/38 Rodadas`
            }
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 py-2"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span className="text-[10px] font-extrabold text-white">
              R{currentRound}
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <Radio className="h-3 w-3 animate-pulse" />
                {isCurrentSeason ? "TEMPORADA AO VIVO" : "EDIÇÃO HISTÓRICA"}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-200">
                Série {division}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white">
              Rodada {currentRound} de 38 concluída
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                style={{ width: `${Math.round((currentRound / 38) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
