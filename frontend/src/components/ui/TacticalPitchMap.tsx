"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldAlert, Crosshair, Sparkles, AlertTriangle } from "lucide-react";
import { StandingTeam } from "@/lib/api";
import { ClubCrest } from "@/components/ui/ClubCrest";

interface TacticalPitchMapProps {
  teams: StandingTeam[];
  favoriteClubSlug: string;
}

export function TacticalPitchMap({ teams, favoriteClubSlug }: TacticalPitchMapProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    favoriteClubSlug || teams[0]?.club.slug || ""
  );
  const [mode, setMode] = useState<"attack" | "defense">("attack");

  const currentTeam =
    teams.find((t) => t.club.slug === selectedSlug) || teams[0];

  const tactics = currentTeam?.spatial_tactics;
  const atk = tactics?.attack;
  const def = tactics?.defense;

  if (!currentTeam || !tactics) return null;

  return (
    <div className="space-y-4">
      {/* Top Header & Club Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ClubCrest club={currentTeam.club} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="cursor-pointer bg-transparent text-sm sm:text-base font-extrabold text-white focus:outline-none"
              >
                {teams.map((t) => (
                  <option
                    key={t.club.slug}
                    value={t.club.slug}
                    className="bg-[#090c14] text-zinc-100"
                  >
                    {t.position}º {t.club.name} ({t.goals_for} GP / {t.goals_against} GC)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-zinc-400">
              {mode === "attack"
                ? `Análise espacial de construção: fluxo pelos corredores e zonas de finalização`
                : `Mapeamento de vulnerabilidade defensiva: por onde mais sofrem ataques e tomam gol`}
            </p>
          </div>
        </div>

        {/* Mode Toggle: Ataque vs Defesa */}
        <div className="obsidian-well inline-flex self-start rounded-2xl p-1 sm:self-auto">
          <button
            onClick={() => setMode("attack")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
              mode === "attack"
                ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 shadow-[0_2px_12px_rgba(16,185,129,0.4)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            Por Onde Mais Atacam
          </button>
          <button
            onClick={() => setMode("defense")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
              mode === "defense"
                ? "bg-gradient-to-b from-rose-400 to-rose-500 text-zinc-950 shadow-[0_2px_12px_rgba(244,63,94,0.4)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Por Onde Mais Tomam Gol
          </button>
        </div>
      </div>

      {/* Main Pitch + Side Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: 2D Tactical Football Pitch (SVG) */}
        <div className="xl:col-span-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#06140e] p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            {/* Direction Indicator */}
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400">
                Campo Defensivo
              </span>
              <span className="flex items-center gap-1 font-mono text-zinc-300">
                {mode === "attack" ? "Direção de Ataque →" : "← Pressão Adversária"}
              </span>
              <span className="flex items-center gap-1 text-sky-400">
                Campo Ofensivo (Gol Rival)
              </span>
            </div>

            {/* SVG Pitch Canvas */}
            <div className="relative aspect-[105/68] w-full">
              <svg
                viewBox="0 0 1050 680"
                className="h-full w-full select-none"
                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}
              >
                <defs>
                  {/* Subtle Grass Lawn Pattern */}
                  <pattern
                    id="lawn-stripes"
                    width="105"
                    height="680"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect x="0" y="0" width="52.5" height="680" fill="#071b12" />
                    <rect x="52.5" y="0" width="52.5" height="680" fill="#082016" />
                  </pattern>

                  {/* Attack Flow Gradient */}
                  <linearGradient id="atkFlowLeft" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.38" />
                  </linearGradient>
                  <linearGradient id="atkFlowCenter" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.38" />
                  </linearGradient>
                  <linearGradient id="atkFlowRight" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.38" />
                  </linearGradient>

                  {/* Defense Danger Gradient */}
                  <linearGradient id="defDangerLeft" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.08" />
                  </linearGradient>
                  <linearGradient id="defDangerCenter" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="defDangerRight" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.08" />
                  </linearGradient>
                </defs>

                {/* Pitch Background Turf with Stripes */}
                <rect x="0" y="0" width="1050" height="680" rx="16" fill="url(#lawn-stripes)" />

                {/* Tactical Zones Overlay (Rendered UNDER the white pitch markings) */}
                {mode === "attack" && atk && (
                  <g className="transition-opacity duration-300">
                    {/* Top Corridor: Left Wing Attack (y: 25 to 235) */}
                    <rect
                      x="400"
                      y="25"
                      width="600"
                      height="210"
                      fill="url(#atkFlowLeft)"
                      rx="8"
                      className="transition-all"
                    />
                    {/* Middle Corridor: Center Attack (y: 235 to 445) */}
                    <rect
                      x="400"
                      y="235"
                      width="600"
                      height="210"
                      fill="url(#atkFlowCenter)"
                      rx="8"
                      className="transition-all"
                    />
                    {/* Bottom Corridor: Right Wing Attack (y: 445 to 655) */}
                    <rect
                      x="400"
                      y="445"
                      width="600"
                      height="210"
                      fill="url(#atkFlowRight)"
                      rx="8"
                      className="transition-all"
                    />

                    {/* Box Shot Heat Zone */}
                    <rect
                      x="860"
                      y="138"
                      width="165"
                      height="404"
                      fill="#10b981"
                      fillOpacity="0.18"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      rx="4"
                    />
                  </g>
                )}

                {mode === "defense" && def && (
                  <g className="transition-opacity duration-300">
                    {/* Left Flank Conceded (Top left y: 25 to 235) */}
                    <rect
                      x="25"
                      y="25"
                      width="500"
                      height="210"
                      fill={def.danger_channel === "Esquerdo" ? "url(#defDangerLeft)" : "#f43f5e"}
                      fillOpacity={def.danger_channel === "Esquerdo" ? "1" : "0.12"}
                      rx="8"
                    />
                    {/* Center / Goal Area Conceded (Middle y: 235 to 445) */}
                    <rect
                      x="25"
                      y="235"
                      width="500"
                      height="210"
                      fill={def.danger_channel === "Central" ? "url(#defDangerCenter)" : "#f43f5e"}
                      fillOpacity={def.danger_channel === "Central" ? "1" : "0.12"}
                      rx="8"
                    />
                    {/* Right Flank Conceded (Bottom left y: 445 to 655) */}
                    <rect
                      x="25"
                      y="445"
                      width="500"
                      height="210"
                      fill={def.danger_channel === "Direito" ? "url(#defDangerRight)" : "#f43f5e"}
                      fillOpacity={def.danger_channel === "Direito" ? "1" : "0.12"}
                      rx="8"
                    />

                    {/* Critical Conceded Box Area */}
                    <rect
                      x="25"
                      y="138"
                      width="165"
                      height="404"
                      fill="#f43f5e"
                      fillOpacity="0.22"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      rx="4"
                    />
                  </g>
                )}

                {/* ========================================================
                    OFFICIAL PITCH LINES (White with subtle glow)
                   ======================================================== */}
                <g stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.75" fill="none">
                  {/* Outer boundary */}
                  <rect x="25" y="25" width="1000" height="630" rx="4" />

                  {/* Halfway line */}
                  <line x1="525" y1="25" x2="525" y2="655" />

                  {/* Center circle & spot */}
                  <circle cx="525" cy="340" r="91.5" />
                  <circle cx="525" cy="340" r="3.5" fill="#ffffff" />

                  {/* Left Penalty Area (Defensive Box) */}
                  <rect x="25" y="138" width="165" height="404" />
                  <rect x="25" y="248" width="55" height="184" />
                  <circle cx="135" cy="340" r="3.5" fill="#ffffff" />
                  <path d="M 190 270 A 91.5 91.5 0 0 1 190 410" />
                  {/* Left Goal Cage */}
                  <rect x="5" y="296" width="20" height="88" strokeWidth="1.5" strokeOpacity="0.4" />

                  {/* Right Penalty Area (Attacking Box) */}
                  <rect x="860" y="138" width="165" height="404" />
                  <rect x="970" y="248" width="55" height="184" />
                  <circle cx="915" cy="340" r="3.5" fill="#ffffff" />
                  <path d="M 860 270 A 91.5 91.5 0 0 0 860 410" />
                  {/* Right Goal Cage */}
                  <rect x="1025" y="296" width="20" height="88" strokeWidth="1.5" strokeOpacity="0.4" />

                  {/* Corner Arcs */}
                  <path d="M 25 45 A 20 20 0 0 0 45 25" />
                  <path d="M 25 635 A 20 20 0 0 1 45 655" />
                  <path d="M 1025 45 A 20 20 0 0 1 1005 25" />
                  <path d="M 1025 635 A 20 20 0 0 0 1005 655" />
                </g>

                {/* Corridor Separator Dashed Guides */}
                <g stroke="#ffffff" strokeWidth="1" strokeDasharray="6 8" strokeOpacity="0.25">
                  <line x1="25" y1="235" x2="1025" y2="235" />
                  <line x1="25" y1="445" x2="1025" y2="445" />
                </g>

                {/* ========================================================
                    DYNAMIC LABELS & METRICS EMBEDDED INSIDE PITCH
                   ======================================================== */}
                {mode === "attack" && atk && (
                  <g className="font-sans font-bold select-none">
                    {/* Corridor Labels (Left, Center, Right) */}
                    <g transform="translate(680, 115)">
                      <rect x="-80" y="-22" width="160" height="44" rx="10" fill="#09140e" fillOpacity="0.85" stroke="#10b981" strokeWidth="1.5" />
                      <text x="0" y="-3" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="800">
                        CORREDOR ESQUERDO
                      </text>
                      <text x="0" y="15" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {atk.left_pct}% • {atk.goals_left} Gols
                      </text>
                    </g>

                    <g transform="translate(680, 340)">
                      <rect x="-80" y="-22" width="160" height="44" rx="10" fill="#09140e" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="0" y="-3" textAnchor="middle" fill="#7dd3fc" fontSize="13" fontWeight="800">
                        CORREDOR CENTRAL
                      </text>
                      <text x="0" y="15" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {atk.center_pct}% • {atk.goals_center} Gols
                      </text>
                    </g>

                    <g transform="translate(680, 565)">
                      <rect x="-80" y="-22" width="160" height="44" rx="10" fill="#09140e" fillOpacity="0.85" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="0" y="-3" textAnchor="middle" fill="#fde047" fontSize="13" fontWeight="800">
                        CORREDOR DIREITO
                      </text>
                      <text x="0" y="15" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {atk.right_pct}% • {atk.goals_right} Gols
                      </text>
                    </g>

                    {/* Inside Box Shot Tag */}
                    <g transform="translate(942, 340)">
                      <rect x="-48" y="-18" width="96" height="36" rx="8" fill="#065f46" fillOpacity="0.95" stroke="#34d399" strokeWidth="1.5" />
                      <text x="0" y="-2" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="800">
                        NA ÁREA
                      </text>
                      <text x="0" y="13" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
                        {atk.inside_box_pct}% Chutes
                      </text>
                    </g>
                  </g>
                )}

                {mode === "defense" && def && (
                  <g className="font-sans font-bold select-none">
                    {/* Def Corridors Conceded */}
                    <g transform="translate(320, 115)">
                      <rect
                        x="-90"
                        y="-22"
                        width="180"
                        height="44"
                        rx="10"
                        fill="#1f090d"
                        fillOpacity="0.9"
                        stroke={def.danger_channel === "Esquerdo" ? "#f43f5e" : "#fda4af"}
                        strokeWidth={def.danger_channel === "Esquerdo" ? "2.5" : "1"}
                      />
                      <text x="0" y="-3" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="800">
                        FLANCO ESQUERDO DEF.
                      </text>
                      <text x="0" y="15" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {def.left_conceded_pct}% dos gols sofridos
                      </text>
                    </g>

                    <g transform="translate(320, 340)">
                      <rect
                        x="-90"
                        y="-22"
                        width="180"
                        height="44"
                        rx="10"
                        fill="#1f090d"
                        fillOpacity="0.9"
                        stroke={def.danger_channel === "Central" ? "#f43f5e" : "#fda4af"}
                        strokeWidth={def.danger_channel === "Central" ? "2.5" : "1"}
                      />
                      <text x="0" y="-3" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="800">
                        MIOLO / ZAGA CENTRAL
                      </text>
                      <text x="0" y="15" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {def.center_conceded_pct}% dos gols sofridos
                      </text>
                    </g>

                    <g transform="translate(320, 565)">
                      <rect
                        x="-90"
                        y="-22"
                        width="180"
                        height="44"
                        rx="10"
                        fill="#1f090d"
                        fillOpacity="0.9"
                        stroke={def.danger_channel === "Direito" ? "#f43f5e" : "#fda4af"}
                        strokeWidth={def.danger_channel === "Direito" ? "2.5" : "1"}
                      />
                      <text x="0" y="-3" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="800">
                        FLANCO DIREITO DEF.
                      </text>
                      <text x="0" y="15" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {def.right_conceded_pct}% dos gols sofridos
                      </text>
                    </g>

                    {/* Box Vulnerability Marker */}
                    <g transform="translate(108, 340)">
                      <circle cx="0" cy="0" r="28" fill="#e11d48" fillOpacity="0.85" stroke="#ffffff" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">
                        ALERTA
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Detailed Tactical Breakdown Cards */}
        <div className="space-y-4 xl:col-span-4">
          {mode === "attack" && atk && (
            <>
              {/* Primary Channel Card */}
              <div className="obsidian-glass rounded-2xl border border-emerald-500/25 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                    Principal Via de Criação
                  </span>
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="mt-2 text-lg font-black text-white">
                  {atk.primary_channel}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Concentra a maior fatia das ações ofensivas e criação de jogadas de linha de fundo.
                </p>
              </div>

              {/* Shot Distribution */}
              <div className="obsidian-glass rounded-2xl border border-white/10 p-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Origem dos Chutes & Finalizações
                </p>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                      <span>Grande Área (Chutes no Miolo)</span>
                      <strong className="text-emerald-400 font-mono">{atk.inside_box_pct}%</strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${atk.inside_box_pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                      <span>Fora da Área (Longa Distância)</span>
                      <strong className="text-sky-400 font-mono">{atk.outside_box_pct}%</strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${atk.outside_box_pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                      <span>Pequena Área (Dentro dos 5m)</span>
                      <strong className="text-amber-400 font-mono">{atk.six_yard_pct}%</strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${atk.six_yard_pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Types Breakdown */}
              <div className="obsidian-glass rounded-2xl border border-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-2.5">
                  Tipos de Gol Marcados ({currentTeam.goals_for} Gols)
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-emerald-400">
                      {atk.right_foot_goals}
                    </span>
                    <p className="text-[10px] text-zinc-400">Pé Direito</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-sky-400">
                      {atk.left_foot_goals}
                    </span>
                    <p className="text-[10px] text-zinc-400">Pé Esquerdo</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-amber-300">
                      {atk.header_goals}
                    </span>
                    <p className="text-[10px] text-zinc-400">Cabeceios</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-indigo-400">
                      {atk.outside_box_goals}
                    </span>
                    <p className="text-[10px] text-zinc-400">De Fora</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === "defense" && def && (
            <>
              {/* Vulnerability Alert Card */}
              <div className="obsidian-kpi-rose rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-400">
                    Setor Mais Vulnerável
                  </span>
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                </div>
                <p className="mt-2 text-base font-black text-white">
                  {def.vuln_zone}
                </p>
                <p className="mt-1 text-xs text-rose-200/80">
                  {def.vuln_desc}
                </p>
              </div>

              {/* Conceded Sector Distribution */}
              <div className="obsidian-glass rounded-2xl border border-white/10 p-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Distribuição por Onde Tomam Gol
                </p>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                      <span>Flanco Esquerdo da Zaga</span>
                      <strong className="text-rose-400 font-mono">{def.left_conceded_pct}%</strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${def.left_conceded_pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                      <span>Miolo da Grande Área / Zaga Central</span>
                      <strong className="text-rose-400 font-mono">{def.center_conceded_pct}%</strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${def.center_conceded_pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                      <span>Flanco Direito da Zaga</span>
                      <strong className="text-rose-400 font-mono">{def.right_conceded_pct}%</strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${def.right_conceded_pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conceded Origin Type Breakdown */}
              <div className="obsidian-glass rounded-2xl border border-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-2.5">
                  Origem dos Gols Sofridos ({currentTeam.goals_against} GC)
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-rose-400">
                      {def.open_play_conceded}
                    </span>
                    <p className="text-[10px] text-zinc-400">Bola Rolando</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-amber-300">
                      {def.crosses_aerial_conceded}
                    </span>
                    <p className="text-[10px] text-zinc-400">Bolas Cruzadas</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-sky-400">
                      {def.set_pieces_conceded}
                    </span>
                    <p className="text-[10px] text-zinc-400">Bola Parada</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="font-mono text-base font-black text-indigo-400">
                      {def.counter_attacks_conceded}
                    </span>
                    <p className="text-[10px] text-zinc-400">Contra-Ataque</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
