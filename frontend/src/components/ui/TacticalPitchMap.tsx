"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Crosshair,
  Sparkles,
  AlertTriangle,
  Flame,
  Snowflake,
  Zap,
  Thermometer,
  TrendingUp,
  Activity,
} from "lucide-react";
import { StandingTeam } from "@/lib/api";
import { ClubCrest } from "@/components/ui/ClubCrest";

interface TacticalPitchMapProps {
  teams: StandingTeam[];
  favoriteClubSlug: string;
}

type ThermalTier = "hot" | "warm" | "cold";

interface CorridorItem {
  id: "left" | "center" | "right";
  name: string;
  shortName: string;
  pct: number;
  goals: number;
  tier: ThermalTier;
  tierLabel: string;
  tierColor: string;
  tierBorder: string;
  tierBg: string;
  gradientId: string;
  glowColor: string;
  y: number;
  h: number;
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

  // Compute thermal classification dynamically for Attack corridors
  const attackCorridors = useMemo<CorridorItem[]>(() => {
    if (!atk) return [];

    const raw = [
      { id: "left" as const, name: "Corredor Esquerdo", shortName: "Esquerdo", pct: atk.left_pct, goals: atk.goals_left, y: 40, h: 195 },
      { id: "center" as const, name: "Corredor Central", shortName: "Centro", pct: atk.center_pct, goals: atk.goals_center, y: 242, h: 196 },
      { id: "right" as const, name: "Corredor Direito", shortName: "Direito", pct: atk.right_pct, goals: atk.goals_right, y: 445, h: 195 },
    ];

    // Rank descending
    const sorted = [...raw].sort((a, b) => b.pct - a.pct);
    const hotId = sorted[0]?.id;
    const warmId = sorted[1]?.id;

    return raw.map((c) => {
      if (c.id === hotId) {
        return {
          ...c,
          tier: "hot" as ThermalTier,
          tierLabel: "ZONA QUENTE • FLUXO PRINCIPAL",
          tierColor: "#f87171",
          tierBorder: "rgba(239, 68, 68, 0.85)",
          tierBg: "rgba(239, 68, 68, 0.25)",
          gradientId: "thermalGradHot",
          glowColor: "#ef4444",
        };
      }
      if (c.id === warmId) {
        return {
          ...c,
          tier: "warm" as ThermalTier,
          tierLabel: "ZONA MORNA • FLUXO REGULAR",
          tierColor: "#fcd34d",
          tierBorder: "rgba(245, 158, 11, 0.85)",
          tierBg: "rgba(245, 158, 11, 0.20)",
          gradientId: "thermalGradWarm",
          glowColor: "#f59e0b",
        };
      }
      return {
        ...c,
        tier: "cold" as ThermalTier,
        tierLabel: "ZONA FRIA • SUB-EXPLORADA",
        tierColor: "#7dd3fc",
        tierBorder: "rgba(56, 189, 248, 0.8)",
        tierBg: "rgba(56, 189, 248, 0.16)",
        gradientId: "thermalGradCold",
        glowColor: "#0284c7",
      };
    });
  }, [atk]);

  // Compute thermal classification dynamically for Defense corridors
  const defenseCorridors = useMemo<CorridorItem[]>(() => {
    if (!def) return [];

    const raw = [
      { id: "left" as const, name: "Flanco Esquerdo Def.", shortName: "Flanco Esq.", pct: def.left_conceded_pct, goals: Math.round((currentTeam.goals_against * def.left_conceded_pct) / 100), y: 40, h: 195 },
      { id: "center" as const, name: "Miolo / Zaga Central", shortName: "Zaga Central", pct: def.center_conceded_pct, goals: Math.round((currentTeam.goals_against * def.center_conceded_pct) / 100), y: 242, h: 196 },
      { id: "right" as const, name: "Flanco Direito Def.", shortName: "Flanco Dir.", pct: def.right_conceded_pct, goals: Math.round((currentTeam.goals_against * def.right_conceded_pct) / 100), y: 445, h: 195 },
    ];

    // Rank descending: highest conceded % is critical alert (hot), lowest is safe (cold)
    const sorted = [...raw].sort((a, b) => b.pct - a.pct);
    const hotId = sorted[0]?.id;
    const warmId = sorted[1]?.id;

    return raw.map((c) => {
      if (c.id === hotId) {
        return {
          ...c,
          tier: "hot" as ThermalTier,
          tierLabel: "CRÍTICO • MAIOR VULNERABILIDADE",
          tierColor: "#fda4af",
          tierBorder: "rgba(244, 63, 94, 0.9)",
          tierBg: "rgba(244, 63, 94, 0.28)",
          gradientId: "defDangerHot",
          glowColor: "#f43f5e",
        };
      }
      if (c.id === warmId) {
        return {
          ...c,
          tier: "warm" as ThermalTier,
          tierLabel: "ATENÇÃO • RISCO MÉDIO",
          tierColor: "#fde047",
          tierBorder: "rgba(245, 158, 11, 0.85)",
          tierBg: "rgba(245, 158, 11, 0.20)",
          gradientId: "defDangerWarm",
          glowColor: "#f59e0b",
        };
      }
      return {
        ...c,
        tier: "cold" as ThermalTier,
        tierLabel: "SEGURO • MENOR PRESSÃO",
        tierColor: "#7dd3fc",
        tierBorder: "rgba(56, 189, 248, 0.8)",
        tierBg: "rgba(56, 189, 248, 0.16)",
        gradientId: "defDangerCold",
        glowColor: "#0284c7",
      };
    });
  }, [def, currentTeam]);

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
        <div className="space-y-3 xl:col-span-8">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#072415] p-3 sm:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.65)]">
            {/* Direction Indicator */}
            <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-zinc-300">
              <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-emerald-300">
                Campo Defensivo
              </span>
              <span className="flex items-center gap-1.5 font-mono text-zinc-200">
                {mode === "attack" ? "Direção de Ataque →" : "← Pressão Adversária"}
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-950/60 px-2 py-0.5 text-sky-300">
                Campo Ofensivo (Gol Rival)
              </span>
            </div>

            {/* SVG Pitch Canvas */}
            <div className="relative aspect-[105/68] w-full">
              <svg
                viewBox="0 0 1050 680"
                className="h-full w-full select-none"
                style={{ filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.5))" }}
              >
                <defs>
                  {/* Rich Vibrant Football Pitch Lawn Stripes */}
                  <pattern
                    id="turf-stripes"
                    width="105"
                    height="680"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect x="0" y="0" width="52.5" height="680" fill="#135c32" />
                    <rect x="52.5" y="0" width="52.5" height="680" fill="#186d3d" />
                  </pattern>

                  {/* Pitch Lighting Vignette */}
                  <radialGradient id="turf-spotlight" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
                  </radialGradient>

                  {/* Obsidian Glass Gradient Base */}
                  <linearGradient id="obsidianGlassShine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                    <stop offset="25%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
                  </linearGradient>

                  {/* Attack Thermal Gradients (Quente, Morno, Frio) */}
                  <linearGradient id="thermalGradHot" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#ef4444" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0.62" />
                  </linearGradient>

                  <linearGradient id="thermalGradWarm" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.06" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.52" />
                  </linearGradient>

                  <linearGradient id="thermalGradCold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.06" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.45" />
                  </linearGradient>

                  {/* Defense Danger Gradients */}
                  <linearGradient id="defDangerHot" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#e11d48" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#be123c" stopOpacity="0.68" />
                  </linearGradient>

                  <linearGradient id="defDangerWarm" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.06" />
                    <stop offset="50%" stopColor="#ea580c" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#c2410c" stopOpacity="0.52" />
                  </linearGradient>

                  <linearGradient id="defDangerCold" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.06" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.45" />
                  </linearGradient>
                </defs>

                {/* Pitch Background Turf with Rich Green Stripes */}
                <rect x="0" y="0" width="1050" height="680" rx="16" fill="url(#turf-stripes)" />
                <rect x="0" y="0" width="1050" height="680" rx="16" fill="url(#turf-spotlight)" pointerEvents="none" />

                {/* Outer Field Collar Shadow */}
                <rect
                  x="0"
                  y="0"
                  width="1050"
                  height="680"
                  rx="16"
                  fill="none"
                  stroke="#0a381f"
                  strokeWidth="8"
                />

                {/* ========================================================
                    OBSIDIAN-GLASS DEMARCATED ZONES (Rendered on grass)
                   ======================================================== */}
                {mode === "attack" && (
                  <g className="transition-opacity duration-300">
                    {/* Render each corridor as an Obsidian Glass thermal card */}
                    {attackCorridors.map((c) => (
                      <g key={c.id}>
                        {/* Obsidian dark tint for frosted glass depth */}
                        <rect
                          x="475"
                          y={c.y}
                          width="535"
                          height={c.h}
                          rx="14"
                          fill="#05140d"
                          fillOpacity="0.45"
                        />
                        {/* Thermal heat gradient overlay */}
                        <rect
                          x="475"
                          y={c.y}
                          width="535"
                          height={c.h}
                          rx="14"
                          fill={`url(#${c.gradientId})`}
                        />
                        {/* Obsidian glass border */}
                        <rect
                          x="475"
                          y={c.y}
                          width="535"
                          height={c.h}
                          rx="14"
                          fill="none"
                          stroke={c.tierBorder}
                          strokeWidth="1.8"
                        />
                        {/* Top specular glass reflection line */}
                        <line
                          x1="490"
                          y1={c.y + 2}
                          x2="995"
                          y2={c.y + 2}
                          stroke="rgba(255,255,255,0.45)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        {/* Subtle corridor flow arrow indicators */}
                        <path
                          d={`M 530 ${c.y + c.h / 2} L 555 ${c.y + c.h / 2} M 545 ${c.y + c.h / 2 - 8} L 555 ${c.y + c.h / 2} L 545 ${c.y + c.h / 2 + 8}`}
                          stroke={c.tierColor}
                          strokeWidth="2"
                          strokeOpacity="0.45"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    ))}

                    {/* Inside Penalty Box Shot Heat Hotspot */}
                    <g>
                      <rect
                        x="850"
                        y="148"
                        width="165"
                        height="384"
                        rx="12"
                        fill="#f59e0b"
                        fillOpacity="0.16"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      {/* Box top glass sheen */}
                      <line
                        x1="860"
                        y1="150"
                        x2="1005"
                        y2="150"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                )}

                {mode === "defense" && (
                  <g className="transition-opacity duration-300">
                    {/* Render each defensive corridor as an Obsidian Glass danger card */}
                    {defenseCorridors.map((c) => (
                      <g key={c.id}>
                        {/* Obsidian dark tint for frosted glass depth */}
                        <rect
                          x="40"
                          y={c.y}
                          width="480"
                          height={c.h}
                          rx="14"
                          fill="#140608"
                          fillOpacity="0.45"
                        />
                        {/* Thermal heat gradient overlay */}
                        <rect
                          x="40"
                          y={c.y}
                          width="480"
                          height={c.h}
                          rx="14"
                          fill={`url(#${c.gradientId})`}
                        />
                        {/* Obsidian glass border */}
                        <rect
                          x="40"
                          y={c.y}
                          width="480"
                          height={c.h}
                          rx="14"
                          fill="none"
                          stroke={c.tierBorder}
                          strokeWidth="1.8"
                        />
                        {/* Top specular glass reflection line */}
                        <line
                          x1="55"
                          y1={c.y + 2}
                          x2="505"
                          y2={c.y + 2}
                          stroke="rgba(255,255,255,0.45)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        {/* Pressure arrow pointing towards goal */}
                        <path
                          d={`M 480 ${c.y + c.h / 2} L 455 ${c.y + c.h / 2} M 465 ${c.y + c.h / 2 - 8} L 455 ${c.y + c.h / 2} L 465 ${c.y + c.h / 2 + 8}`}
                          stroke={c.tierColor}
                          strokeWidth="2"
                          strokeOpacity="0.45"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    ))}

                    {/* Defensive Box Vulnerability Zone */}
                    <g>
                      <rect
                        x="35"
                        y="148"
                        width="165"
                        height="384"
                        rx="12"
                        fill="#f43f5e"
                        fillOpacity="0.22"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <line
                        x1="45"
                        y1="150"
                        x2="190"
                        y2="150"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                )}

                {/* ========================================================
                    OFFICIAL PITCH LINES (White with crisp neon glow)
                   ======================================================== */}
                <g stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.85" fill="none">
                  {/* Outer boundary */}
                  <rect x="35" y="35" width="980" height="610" rx="6" />

                  {/* Halfway line */}
                  <line x1="525" y1="35" x2="525" y2="645" />

                  {/* Center circle & spot */}
                  <circle cx="525" cy="340" r="91.5" />
                  <circle cx="525" cy="340" r="4" fill="#ffffff" />

                  {/* Left Penalty Area (Defensive Box) */}
                  <rect x="35" y="148" width="165" height="384" />
                  <rect x="35" y="248" width="55" height="184" />
                  <circle cx="145" cy="340" r="4" fill="#ffffff" />
                  <path d="M 200 270 A 91.5 91.5 0 0 1 200 410" />
                  {/* Left Goal Cage */}
                  <rect x="15" y="296" width="20" height="88" strokeWidth="1.5" strokeOpacity="0.5" />

                  {/* Right Penalty Area (Attacking Box) */}
                  <rect x="850" y="148" width="165" height="384" />
                  <rect x="960" y="248" width="55" height="184" />
                  <circle cx="905" cy="340" r="4" fill="#ffffff" />
                  <path d="M 850 270 A 91.5 91.5 0 0 0 850 410" />
                  {/* Right Goal Cage */}
                  <rect x="1015" y="296" width="20" height="88" strokeWidth="1.5" strokeOpacity="0.5" />

                  {/* Corner Arcs */}
                  <path d="M 35 55 A 20 20 0 0 0 55 35" />
                  <path d="M 35 625 A 20 20 0 0 1 55 645" />
                  <path d="M 1015 55 A 20 20 0 0 1 995 35" />
                  <path d="M 1015 625 A 20 20 0 0 0 995 645" />
                </g>

                {/* Corridor Separator Dashed Guides */}
                <g stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 8" strokeOpacity="0.30">
                  <line x1="35" y1="242" x2="1015" y2="242" />
                  <line x1="35" y1="445" x2="1015" y2="445" />
                </g>

                {/* ========================================================
                    OBSIDIAN-GLASS HUD PILLS (Dynamic Thermal Badges)
                   ======================================================== */}
                {mode === "attack" && (
                  <g className="font-sans font-bold select-none">
                    {/* Render HUD Pill for each Attack Corridor */}
                    {attackCorridors.map((c) => {
                      const badgeY = c.y + c.h / 2;
                      return (
                        <g key={c.id} transform={`translate(740, ${badgeY})`}>
                          {/* Frosted Obsidian Glass Container */}
                          <rect
                            x="-115"
                            y="-30"
                            width="230"
                            height="60"
                            rx="14"
                            fill="#041109"
                            fillOpacity="0.90"
                            stroke={c.tierBorder}
                            strokeWidth="1.8"
                          />
                          {/* Gloss top highlight */}
                          <line
                            x1="-105"
                            y1="-28"
                            x2="105"
                            y2="-28"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />

                          {/* Tier Badge / Thermal Status */}
                          <circle cx="-95" cy="-12" r="4.5" fill={c.glowColor} />
                          <text
                            x="-85"
                            y="-8"
                            textAnchor="start"
                            fill={c.tierColor}
                            fontSize="10"
                            fontWeight="800"
                            letterSpacing="0.05em"
                          >
                            {c.tierLabel}
                          </text>

                          {/* Corridor Name + Big Value */}
                          <text
                            x="-95"
                            y="14"
                            textAnchor="start"
                            fill="#ffffff"
                            fontSize="14"
                            fontWeight="900"
                          >
                            {c.name.toUpperCase()}
                          </text>

                          <text
                            x="95"
                            y="14"
                            textAnchor="end"
                            fill={c.tierColor}
                            fontSize="16"
                            fontWeight="900"
                          >
                            {c.pct}%
                          </text>

                          <text
                            x="95"
                            y="-8"
                            textAnchor="end"
                            fill="#d1d5db"
                            fontSize="11"
                            fontWeight="700"
                          >
                            {c.goals} Gols
                          </text>
                        </g>
                      );
                    })}

                    {/* Inside Box Shot Tag */}
                    <g transform="translate(932, 340)">
                      <rect
                        x="-55"
                        y="-26"
                        width="110"
                        height="52"
                        rx="12"
                        fill="#062817"
                        fillOpacity="0.92"
                        stroke="#34d399"
                        strokeWidth="1.8"
                      />
                      <line
                        x1="-45"
                        y1="-24"
                        x2="45"
                        y2="-24"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                      <text x="0" y="-8" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="900">
                        NA GRANDE ÁREA
                      </text>
                      <text x="0" y="14" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {atk?.inside_box_pct}% Chutes
                      </text>
                    </g>
                  </g>
                )}

                {mode === "defense" && (
                  <g className="font-sans font-bold select-none">
                    {/* Render HUD Pill for each Defensive Corridor */}
                    {defenseCorridors.map((c) => {
                      const badgeY = c.y + c.h / 2;
                      return (
                        <g key={c.id} transform={`translate(280, ${badgeY})`}>
                          {/* Frosted Obsidian Glass Container */}
                          <rect
                            x="-125"
                            y="-30"
                            width="250"
                            height="60"
                            rx="14"
                            fill="#170609"
                            fillOpacity="0.92"
                            stroke={c.tierBorder}
                            strokeWidth="1.8"
                          />
                          {/* Gloss top highlight */}
                          <line
                            x1="-115"
                            y1="-28"
                            x2="115"
                            y2="-28"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />

                          {/* Tier Badge / Thermal Status */}
                          <circle cx="-105" cy="-12" r="4.5" fill={c.glowColor} />
                          <text
                            x="-95"
                            y="-8"
                            textAnchor="start"
                            fill={c.tierColor}
                            fontSize="10"
                            fontWeight="800"
                            letterSpacing="0.05em"
                          >
                            {c.tierLabel}
                          </text>

                          {/* Corridor Name + Big Value */}
                          <text
                            x="-105"
                            y="14"
                            textAnchor="start"
                            fill="#ffffff"
                            fontSize="13"
                            fontWeight="900"
                          >
                            {c.name.toUpperCase()}
                          </text>

                          <text
                            x="105"
                            y="14"
                            textAnchor="end"
                            fill={c.tierColor}
                            fontSize="16"
                            fontWeight="900"
                          >
                            {c.pct}%
                          </text>

                          <text
                            x="105"
                            y="-8"
                            textAnchor="end"
                            fill="#fca5a5"
                            fontSize="11"
                            fontWeight="700"
                          >
                            ~{c.goals} Gols Sofridos
                          </text>
                        </g>
                      );
                    })}

                    {/* Def Box Vulnerability Tag */}
                    <g transform="translate(118, 340)">
                      <circle
                        cx="0"
                        cy="0"
                        r="30"
                        fill="#e11d48"
                        fillOpacity="0.92"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <text x="0" y="-4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
                        ALERTA
                      </text>
                      <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
                        DEFESA
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Thermal Scale Legend (Obsidian Glass Bar) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-emerald-400" />
              <span className="font-extrabold uppercase tracking-wider text-zinc-300">
                Gradiente Térmico Espacial:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-950/60 px-2.5 py-1 text-[11px] text-sky-300">
                <Snowflake className="h-3 w-3 text-sky-400" />
                Zona Fria (Baixo Fluxo)
              </span>
              <span className="h-2.5 w-16 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 shadow-sm" />
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/60 px-2.5 py-1 text-[11px] text-amber-300">
                <Zap className="h-3 w-3 text-amber-400" />
                Zona Morna (Regular)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/60 px-2.5 py-1 text-[11px] text-rose-300">
                <Flame className="h-3 w-3 text-rose-400" />
                Zona Quente (Foco Crítico)
              </span>
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
