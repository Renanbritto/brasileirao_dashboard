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
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-white/[0.075] bg-[#06080f]/82 backdrop-blur-3xl shadow-[12px_0_45px_-10px_rgba(0,0,0,0.9)] transition-all duration-300 ease-out ${
        isCollapsed ? "w-[74px]" : "w-72"
      }`}
    >
      {/* Top Brand + Collapse Button */}
      <div className="flex h-[68px] items-center justify-between border-b border-white/[0.065] px-3.5">
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-amber-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Trophy className="h-5 w-5 text-zinc-950" />
            </div>
            <div className="truncate">
              <p className="text-sm font-extrabold tracking-tight text-white">
                BRASILEIRÃO <span className="text-emerald-400">GLASS</span>
              </p>
              <p className="text-[10px] font-medium tracking-wide text-zinc-400">
                Obsidian Intelligence Suite
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          className={`obsidian-subcard flex h-10 w-10 items-center justify-center rounded-xl text-zinc-300 transition-all hover:border-emerald-400/40 hover:text-white active:scale-95 ${
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
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            Módulos de Análise
          </span>
        </div>
      )}

      {/* Navigation Modules List */}
      <nav className="flex-1 space-y-2 px-2.5 py-3">
        {MODULES_LIST.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.key;

          return (
            <div key={mod.key} className="group relative">
              <button
                onClick={() => setActiveModule(mod.key)}
                className={`relative flex w-full items-center gap-3 rounded-2xl border text-left transition-all duration-200 ${
                  isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_-6px_rgba(16,185,129,0.3)]"
                    : "border-transparent text-zinc-400 hover:border-white/[0.08] hover:bg-white/[0.035] hover:text-zinc-100"
                }`}
              >
                {/* Glowing Laser Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.95)]" />
                )}

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-zinc-950 shadow-[0_0_16px_rgba(16,185,129,0.45)]"
                      : "obsidian-well text-zinc-400 group-hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-bold tracking-tight">
                        {mod.label}
                      </span>
                      {mod.isHot && (
                        <span className="shrink-0 rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-rose-300 border border-rose-400/35">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-zinc-400 group-hover:text-zinc-300">
                      {mod.sublabel}
                    </p>
                  </div>
                )}
              </button>

              {/* Floating Obsidian Glass Flyout Tooltip when Sidebar is Collapsed */}
              {isCollapsed && (
                <div className="pointer-events-none invisible absolute left-[78px] top-1/2 z-50 w-64 -translate-y-1/2 translate-x-1 rounded-2xl border border-white/15 bg-[#090c14]/95 p-3 opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-200 group-hover:visible group-hover:translate-x-0 group-hover:opacity-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-white">
                      {mod.label}
                    </span>
                    {mod.isHot && (
                      <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-rose-300 border border-rose-400/30">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">{mod.sublabel}</p>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Live Status Footer inside Sidebar */}
      <div className="border-t border-white/[0.065] p-3">
        {isCollapsed ? (
          <div
            title={
              isCurrentSeason
                ? `Série ${division} Ao Vivo • Rodada ${currentRound}/38`
                : `Série ${division} • 38/38 Rodadas`
            }
            className="obsidian-subcard flex flex-col items-center justify-center gap-1 rounded-xl py-2.5"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span className="font-mono text-[10px] font-extrabold text-white">
              R{currentRound}
            </span>
          </div>
        ) : (
          <div className="obsidian-subcard rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-emerald-400">
                <Radio className="h-3 w-3 animate-pulse" />
                {isCurrentSeason ? "TEMPORADA AO VIVO" : "EDIÇÃO HISTÓRICA"}
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-200">
                Série {division}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white">
              Rodada <span className="font-mono">{currentRound}</span> de{" "}
              <span className="font-mono">38</span> concluída
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                style={{ width: `${Math.round((currentRound / 38) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
