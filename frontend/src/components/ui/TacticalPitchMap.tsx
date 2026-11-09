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
  Eye,
  Layers,
  Activity,
  Target,
  Sliders,
} from "lucide-react";
import { StandingTeam } from "@/lib/api";
import { ClubCrest } from "@/components/ui/ClubCrest";

interface TacticalPitchMapProps {
  teams: StandingTeam[];
  favoriteClubSlug: string;
}

type ThermalTier = "hot" | "warm" | "cold";

interface TacticalSector {
  id: string;
  name: string;
  category: "flank_left" | "center" | "flank_right" | "penalty_box";
  pct: number;
  secondaryStat: string;
  tier: ThermalTier;
  tierLabel: string;
  tierColor: string;
  tierBorder: string;
  tierBg: string;
  description: string;
}

export function TacticalPitchMap({ teams, favoriteClubSlug }: TacticalPitchMapProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    favoriteClubSlug || teams[0]?.club.slug || ""
  );
  const [mode, setMode] = useState<"attack" | "defense">("attack");
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [intensityMode, setIntensityMode] = useState<"high" | "normal">("high");
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const currentTeam =
    teams.find((t) => t.club.slug === selectedSlug) || teams[0];

  const tactics = currentTeam?.spatial_tactics;
  const atk = tactics?.attack;
  const def = tactics?.defense;

  // Determine which corridor is dominant (Hot), secondary (Warm), or minor (Cold)
  const attackRanking = useMemo(() => {
    if (!atk) return { left: "cold", center: "cold", right: "cold" };
    const items = [
      { id: "left", pct: atk.left_pct },
      { id: "center", pct: atk.center_pct },
      { id: "right", pct: atk.right_pct },
    ].sort((a, b) => b.pct - a.pct);

    return {
      [items[0].id]: "hot" as ThermalTier,
      [items[1].id]: "warm" as ThermalTier,
      [items[2].id]: "cold" as ThermalTier,
    };
  }, [atk]);

  // Determine defense vulnerability ranking
  const defenseRanking = useMemo(() => {
    if (!def) return { left: "cold", center: "cold", right: "cold" };
    const items = [
      { id: "left", pct: def.left_conceded_pct },
      { id: "center", pct: def.center_conceded_pct },
      { id: "right", pct: def.right_conceded_pct },
    ].sort((a, b) => b.pct - a.pct);

    return {
      [items[0].id]: "hot" as ThermalTier,
      [items[1].id]: "warm" as ThermalTier,
      [items[2].id]: "cold" as ThermalTier,
    };
  }, [def]);

  // Detailed Sector Cards for Attack
  const attackSectors: TacticalSector[] = useMemo(() => {
    if (!atk) return [];
    return [
      {
        id: "flank_left",
        name: "Asa Esquerda & Linha de Fundo",
        category: "flank_left",
        pct: atk.left_pct,
        secondaryStat: `${atk.goals_left} Gols Marcados`,
        tier: attackRanking.left as ThermalTier,
        tierLabel: attackRanking.left === "hot" ? "Foco Primário (Mancha Incandescente)" : attackRanking.left === "warm" ? "Fluxo Regular" : "Sub-explorado",
        tierColor: attackRanking.left === "hot" ? "#f87171" : attackRanking.left === "warm" ? "#fcd34d" : "#7dd3fc",
        tierBorder: attackRanking.left === "hot" ? "border-rose-500/50" : attackRanking.left === "warm" ? "border-amber-500/50" : "border-sky-500/40",
        tierBg: attackRanking.left === "hot" ? "bg-rose-950/40" : attackRanking.left === "warm" ? "bg-amber-950/40" : "bg-sky-950/40",
        description: "Descidas rápidas de ponta, dribles de linha de fundo e cruzamentos rasteiros para trás.",
      },
      {
        id: "box_finishing",
        name: "Miolo da Grande Área (Finalizações)",
        category: "penalty_box",
        pct: atk.inside_box_pct,
        secondaryStat: `${Math.round((currentTeam.goals_for * atk.inside_box_pct) / 100)} Gols na Área`,
        tier: "hot",
        tierLabel: "Hotspot Letal de Chutes",
        tierColor: "#f87171",
        tierBorder: "border-rose-500/50",
        tierBg: "bg-rose-950/40",
        description: "Concentração máxima de arremates no ponto do pênalti e pequena área.",
      },
      {
        id: "channel_center",
        name: "Faixa Central & Entrada da Área",
        category: "center",
        pct: atk.center_pct,
        secondaryStat: `${atk.goals_center} Gols • ${atk.outside_box_pct}% Chutes de Fora`,
        tier: attackRanking.center as ThermalTier,
        tierLabel: attackRanking.center === "hot" ? "Foco Primário (Mancha Incandescente)" : attackRanking.center === "warm" ? "Fluxo Regular" : "Sub-explorado",
        tierColor: attackRanking.center === "hot" ? "#f87171" : attackRanking.center === "warm" ? "#fcd34d" : "#7dd3fc",
        tierBorder: attackRanking.center === "hot" ? "border-rose-500/50" : attackRanking.center === "warm" ? "border-amber-500/50" : "border-sky-500/40",
        tierBg: attackRanking.center === "hot" ? "bg-rose-950/40" : attackRanking.center === "warm" ? "bg-amber-950/40" : "bg-sky-950/40",
        description: "Articulação por passes verticais entrelinhas e chutes perigosos de média distância.",
      },
      {
        id: "flank_right",
        name: "Asa Direita & Cruzamentos",
        category: "flank_right",
        pct: atk.right_pct,
        secondaryStat: `${atk.goals_right} Gols Marcados`,
        tier: attackRanking.right as ThermalTier,
        tierLabel: attackRanking.right === "hot" ? "Foco Primário (Mancha Incandescente)" : attackRanking.right === "warm" ? "Fluxo Regular" : "Sub-explorado",
        tierColor: attackRanking.right === "hot" ? "#f87171" : attackRanking.right === "warm" ? "#fcd34d" : "#7dd3fc",
        tierBorder: attackRanking.right === "hot" ? "border-rose-500/50" : attackRanking.right === "warm" ? "border-amber-500/50" : "border-sky-500/40",
        tierBg: attackRanking.right === "hot" ? "bg-rose-950/40" : attackRanking.right === "warm" ? "bg-amber-950/40" : "bg-sky-950/40",
        description: "Construção com apoio lateral, ultrapassagens e bolas alçadas em direção ao segundo pau.",
      },
    ];
  }, [atk, attackRanking, currentTeam]);

  // Detailed Sector Cards for Defense
  const defenseSectors: TacticalSector[] = useMemo(() => {
    if (!def) return [];
    return [
      {
        id: "def_left",
        name: "Flanco Esquerdo Defensivo (Lateral)",
        category: "flank_left",
        pct: def.left_conceded_pct,
        secondaryStat: `${Math.round((currentTeam.goals_against * def.left_conceded_pct) / 100)} Gols Sofridos`,
        tier: defenseRanking.left as ThermalTier,
        tierLabel: defenseRanking.left === "hot" ? "Setor Crítico (Vulnerável)" : defenseRanking.left === "warm" ? "Pressão Média" : "Setor Seguro",
        tierColor: defenseRanking.left === "hot" ? "#f87171" : defenseRanking.left === "warm" ? "#fcd34d" : "#7dd3fc",
        tierBorder: defenseRanking.left === "hot" ? "border-rose-500/50" : defenseRanking.left === "warm" ? "border-amber-500/50" : "border-sky-500/40",
        tierBg: defenseRanking.left === "hot" ? "bg-rose-950/40" : defenseRanking.left === "warm" ? "bg-amber-950/40" : "bg-sky-950/40",
        description: "Espaço explorado nas costas do lateral com infiltrações em velocidade adversárias.",
      },
      {
        id: "def_center",
        name: "Miolo de Zaga & Pequena Área",
        category: "center",
        pct: def.center_conceded_pct,
        secondaryStat: `${Math.round((currentTeam.goals_against * def.center_conceded_pct) / 100)} Gols Sofridos`,
        tier: defenseRanking.center as ThermalTier,
        tierLabel: defenseRanking.center === "hot" ? "Setor Crítico (Vulnerável)" : defenseRanking.center === "warm" ? "Pressão Média" : "Setor Seguro",
        tierColor: defenseRanking.center === "hot" ? "#f87171" : defenseRanking.center === "warm" ? "#fcd34d" : "#7dd3fc",
        tierBorder: defenseRanking.center === "hot" ? "border-rose-500/50" : defenseRanking.center === "warm" ? "border-amber-500/50" : "border-sky-500/40",
        tierBg: defenseRanking.center === "hot" ? "bg-rose-950/40" : defenseRanking.center === "warm" ? "bg-amber-950/40" : "bg-sky-950/40",
        description: "Fragilidade no combate frontal e disputas de primeira bola no coração da área.",
      },
      {
        id: "def_right",
        name: "Flanco Direito Defensivo (Lateral)",
        category: "flank_right",
        pct: def.right_conceded_pct,
        secondaryStat: `${Math.round((currentTeam.goals_against * def.right_conceded_pct) / 100)} Gols Sofridos`,
        tier: defenseRanking.right as ThermalTier,
        tierLabel: defenseRanking.right === "hot" ? "Setor Crítico (Vulnerável)" : defenseRanking.right === "warm" ? "Pressão Média" : "Setor Seguro",
        tierColor: defenseRanking.right === "hot" ? "#f87171" : defenseRanking.right === "warm" ? "#fcd34d" : "#7dd3fc",
        tierBorder: defenseRanking.right === "hot" ? "border-rose-500/50" : defenseRanking.right === "warm" ? "border-amber-500/50" : "border-sky-500/40",
        tierBg: defenseRanking.right === "hot" ? "bg-rose-950/40" : defenseRanking.right === "warm" ? "bg-amber-950/40" : "bg-sky-950/40",
        description: "Vulnerabilidade em bolas alçadas em diagonal e cruzamentos do ponta adversário.",
      },
      {
        id: "def_types",
        name: "Padrão de Origem dos Gols Sofridos",
        category: "penalty_box",
        pct: Math.round(((def.open_play_conceded + def.crosses_aerial_conceded) / (currentTeam.goals_against || 1)) * 100),
        secondaryStat: `${def.open_play_conceded} Bola Rolando • ${def.crosses_aerial_conceded} Aéreos`,
        tier: "warm",
        tierLabel: "Perfil de Finalizações Sofridas",
        tierColor: "#fcd34d",
        tierBorder: "border-amber-500/50",
        tierBg: "bg-amber-950/40",
        description: `${def.open_play_conceded} gols de bola rolando, ${def.crosses_aerial_conceded} bolas cruzadas e ${def.set_pieces_conceded} de bola parada.`,
      },
    ];
  }, [def, defenseRanking, currentTeam]);

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
                ? `Manchas de calor orgânicas: distribuição da densidade de criação e finalizações`
                : `Manchas térmicas de vulnerabilidade: zonas com maior incidência de gols sofridos`}
            </p>
          </div>
        </div>

        {/* Controls: Mode Toggle + Intensity Toggle + Grid Toggle */}
        <div className="flex flex-wrap items-center gap-2">
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

          {/* Intensity Toggle */}
          <button
            onClick={() => setIntensityMode(intensityMode === "high" ? "normal" : "high")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              intensityMode === "high"
                ? "border-amber-500/50 bg-amber-950/40 text-amber-300 shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
                : "border-white/10 bg-black/30 text-zinc-400 hover:text-white"
            }`}
            title="Alternar intensidade do brilho térmico das manchas"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            Manchas: {intensityMode === "high" ? "Intensas (Vivas)" : "Moderadas"}
          </button>

          {/* Grid lines toggle */}
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              showGridLines
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : "border-white/10 bg-black/30 text-zinc-400 hover:text-white"
            }`}
            title="Alternar linhas demarcatórias de setores táticos"
          >
            <Layers className="h-3.5 w-3.5" />
            Setores Táticos
          </button>
        </div>
      </div>

      {/* Main Pitch + Side Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: 2D Tactical Football Pitch (SVG with Organic High-Intensity Heat Blobs) */}
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

                  {/* Gaussian Blur Filters: Dual Layer (Outer Bloom + Razor Core) */}
                  <filter id="heat-bloom" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation={intensityMode === "high" ? "22" : "28"} result="blur" />
                  </filter>
                  <filter id="heat-core" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation={intensityMode === "high" ? "12" : "18"} result="blur" />
                  </filter>
                  <filter id="heat-nucleus" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                  </filter>

                  {/* ========================================================
                      ULTRA-STRONG THERMAL GRADIENTS (VIVAS & INCANDESCENTES)
                     ======================================================== */}
                  {/* White-Hot Nuclear Core (Epicentro Máximo) */}
                  <radialGradient id="mancha-blazing-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="18%" stopColor="#fff275" stopOpacity="1" />
                    <stop offset="42%" stopColor="#ff4500" stopOpacity="1" />
                    <stop offset="70%" stopColor="#e50914" stopOpacity="0.90" />
                    <stop offset="90%" stopColor="#990000" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#135c32" stopOpacity="0" />
                  </radialGradient>

                  {/* Intense Hot Attack Stain (Frequência Alta - Vermelho/Laranja Forte) */}
                  <radialGradient id="mancha-hot-vivid" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff066" stopOpacity="1" />
                    <stop offset="28%" stopColor="#ff5500" stopOpacity="1" />
                    <stop offset="60%" stopColor="#e50914" stopOpacity="0.92" />
                    <stop offset="85%" stopColor="#b20710" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#135c32" stopOpacity="0" />
                  </radialGradient>

                  {/* Intense Warm Attack Stain (Frequência Média - Âmbar Dourado Vivo) */}
                  <radialGradient id="mancha-warm-vivid" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff8b3" stopOpacity="1" />
                    <stop offset="30%" stopColor="#ffaa00" stopOpacity="1" />
                    <stop offset="65%" stopColor="#ff7700" stopOpacity="0.88" />
                    <stop offset="88%" stopColor="#cc5500" stopOpacity="0.40" />
                    <stop offset="100%" stopColor="#135c32" stopOpacity="0" />
                  </radialGradient>

                  {/* Intense Cold / Mild Stain (Menor Frequência - Ciano / Azul Elétrico Vivo) */}
                  <radialGradient id="mancha-cold-vivid" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#e0ffff" stopOpacity="1" />
                    <stop offset="25%" stopColor="#00e5ff" stopOpacity="1" />
                    <stop offset="60%" stopColor="#0091ea" stopOpacity="0.88" />
                    <stop offset="85%" stopColor="#01579b" stopOpacity="0.40" />
                    <stop offset="100%" stopColor="#0f3d24" stopOpacity="0" />
                  </radialGradient>

                  {/* Ultra-Strong Defense Critical Vulnerability Stain (Carmesim Alerta Puro) */}
                  <radialGradient id="mancha-def-critical-vivid" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="18%" stopColor="#ff0055" stopOpacity="1" />
                    <stop offset="48%" stopColor="#d50032" stopOpacity="1" />
                    <stop offset="75%" stopColor="#990022" stopOpacity="0.85" />
                    <stop offset="92%" stopColor="#660011" stopOpacity="0.40" />
                    <stop offset="100%" stopColor="#135c32" stopOpacity="0" />
                  </radialGradient>

                  {/* Defense Medium Warning Stain (Laranja Alerta) */}
                  <radialGradient id="mancha-def-warning-vivid" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff080" stopOpacity="1" />
                    <stop offset="32%" stopColor="#ff6600" stopOpacity="1" />
                    <stop offset="65%" stopColor="#ea580c" stopOpacity="0.85" />
                    <stop offset="88%" stopColor="#9a3412" stopOpacity="0.40" />
                    <stop offset="100%" stopColor="#135c32" stopOpacity="0" />
                  </radialGradient>

                  {/* Defense Safe / Low Pressure Stain */}
                  <radialGradient id="mancha-def-safe-vivid" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="70%" stopColor="#0284c7" stopOpacity="0.55" />
                    <stop offset="90%" stopColor="#0369a1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#135c32" stopOpacity="0" />
                  </radialGradient>
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
                    HIGH-INTENSITY ORGANIC HEATMAP LAYER: MANCHAS FORTES
                   ======================================================== */}
                {mode === "attack" && (
                  <g className="transition-opacity duration-300">
                    {/* PASS 1: AMBIENT HEAT BLOOM (Halo suave ao redor) */}
                    <g filter="url(#heat-bloom)" opacity={intensityMode === "high" ? "0.95" : "0.75"}>
                      {/* Corredor Esquerdo */}
                      {attackRanking.left === "hot" && (
                        <>
                          <ellipse cx="880" cy="100" rx="145" ry="85" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="940" cy="90" rx="100" ry="68" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="840" cy="180" rx="115" ry="75" fill="url(#mancha-hot-vivid)" />
                          <ellipse cx="680" cy="120" rx="135" ry="78" fill="url(#mancha-hot-vivid)" />
                          <ellipse cx="580" cy="140" rx="105" ry="62" fill="url(#mancha-warm-vivid)" />
                        </>
                      )}
                      {attackRanking.left === "warm" && (
                        <>
                          <ellipse cx="860" cy="110" rx="125" ry="75" fill="url(#mancha-warm-vivid)" />
                          <ellipse cx="920" cy="95" rx="90" ry="58" fill="url(#mancha-warm-vivid)" />
                          <ellipse cx="710" cy="130" rx="110" ry="68" fill="url(#mancha-warm-vivid)" />
                        </>
                      )}
                      {attackRanking.left === "cold" && (
                        <>
                          <ellipse cx="820" cy="120" rx="95" ry="58" fill="url(#mancha-cold-vivid)" />
                          <ellipse cx="680" cy="140" rx="85" ry="52" fill="url(#mancha-cold-vivid)" />
                        </>
                      )}

                      {/* Corredor Central */}
                      {attackRanking.center === "hot" && (
                        <>
                          <ellipse cx="800" cy="340" rx="135" ry="95" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="710" cy="340" rx="125" ry="85" fill="url(#mancha-hot-vivid)" />
                          <ellipse cx="600" cy="340" rx="110" ry="70" fill="url(#mancha-warm-vivid)" />
                        </>
                      )}
                      {attackRanking.center === "warm" && (
                        <>
                          <ellipse cx="780" cy="340" rx="110" ry="75" fill="url(#mancha-warm-vivid)" />
                          <ellipse cx="660" cy="340" rx="95" ry="65" fill="url(#mancha-warm-vivid)" />
                        </>
                      )}
                      {attackRanking.center === "cold" && (
                        <>
                          <ellipse cx="740" cy="340" rx="90" ry="58" fill="url(#mancha-cold-vivid)" />
                          <ellipse cx="630" cy="340" rx="80" ry="52" fill="url(#mancha-cold-vivid)" />
                        </>
                      )}

                      {/* Corredor Direito */}
                      {attackRanking.right === "hot" && (
                        <>
                          <ellipse cx="880" cy="580" rx="145" ry="85" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="940" cy="590" rx="100" ry="68" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="840" cy="500" rx="115" ry="75" fill="url(#mancha-hot-vivid)" />
                          <ellipse cx="680" cy="560" rx="135" ry="78" fill="url(#mancha-hot-vivid)" />
                          <ellipse cx="580" cy="540" rx="105" ry="62" fill="url(#mancha-warm-vivid)" />
                        </>
                      )}
                      {attackRanking.right === "warm" && (
                        <>
                          <ellipse cx="860" cy="570" rx="125" ry="75" fill="url(#mancha-warm-vivid)" />
                          <ellipse cx="920" cy="585" rx="90" ry="58" fill="url(#mancha-warm-vivid)" />
                          <ellipse cx="710" cy="550" rx="110" ry="68" fill="url(#mancha-warm-vivid)" />
                        </>
                      )}
                      {attackRanking.right === "cold" && (
                        <>
                          <ellipse cx="820" cy="560" rx="95" ry="58" fill="url(#mancha-cold-vivid)" />
                          <ellipse cx="680" cy="540" rx="85" ry="52" fill="url(#mancha-cold-vivid)" />
                        </>
                      )}

                      {/* Hotspot de Finalizações na Grande Área */}
                      <ellipse cx="925" cy="340" rx="110" ry="85" fill="url(#mancha-blazing-core)" />
                      <ellipse cx="965" cy="310" rx="75" ry="55" fill="url(#mancha-hot-vivid)" />
                      <ellipse cx="965" cy="370" rx="75" ry="55" fill="url(#mancha-hot-vivid)" />
                    </g>

                    {/* PASS 2: RAZOR-SHARP INCANDESCENT CORE (Núcleo denso, forte e vívido) */}
                    <g filter="url(#heat-core)" opacity={intensityMode === "high" ? "1" : "0.85"}>
                      {attackRanking.left === "hot" && (
                        <>
                          <ellipse cx="880" cy="100" rx="95" ry="55" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="940" cy="90" rx="65" ry="40" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="840" cy="180" rx="75" ry="45" fill="url(#mancha-hot-vivid)" />
                          <ellipse cx="680" cy="120" rx="85" ry="48" fill="url(#mancha-hot-vivid)" />
                        </>
                      )}
                      {attackRanking.right === "hot" && (
                        <>
                          <ellipse cx="880" cy="580" rx="95" ry="55" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="940" cy="590" rx="65" ry="40" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="840" cy="500" rx="75" ry="45" fill="url(#mancha-hot-vivid)" />
                          <ellipse cx="680" cy="560" rx="85" ry="48" fill="url(#mancha-hot-vivid)" />
                        </>
                      )}
                      {attackRanking.center === "hot" && (
                        <>
                          <ellipse cx="800" cy="340" rx="90" ry="60" fill="url(#mancha-blazing-core)" />
                          <ellipse cx="710" cy="340" rx="80" ry="50" fill="url(#mancha-hot-vivid)" />
                        </>
                      )}

                      {/* Núcleo Incandescente na Área */}
                      <ellipse cx="925" cy="340" rx="70" ry="50" fill="url(#mancha-blazing-core)" />
                      <ellipse cx="975" cy="340" rx="45" ry="32" fill="url(#mancha-blazing-core)" />
                    </g>

                    {/* PASS 3: WHITE-HOT INTENSE NUCLEI (Pontos de fusão térmica máxima) */}
                    {intensityMode === "high" && (
                      <g filter="url(#heat-nucleus)" opacity="0.95">
                        {attackRanking.left === "hot" && (
                          <ellipse cx="885" cy="100" rx="35" ry="18" fill="#ffffff" opacity="0.85" />
                        )}
                        {attackRanking.right === "hot" && (
                          <ellipse cx="885" cy="580" rx="35" ry="18" fill="#ffffff" opacity="0.85" />
                        )}
                        {attackRanking.center === "hot" && (
                          <ellipse cx="800" cy="340" rx="35" ry="22" fill="#ffffff" opacity="0.85" />
                        )}
                        <ellipse cx="925" cy="340" rx="28" ry="18" fill="#ffffff" opacity="0.90" />
                      </g>
                    )}
                  </g>
                )}

                {mode === "defense" && (
                  <g className="transition-opacity duration-300">
                    {/* PASS 1: DEFENSE AMBIENT HEAT BLOOM */}
                    <g filter="url(#heat-bloom)" opacity={intensityMode === "high" ? "0.95" : "0.75"}>
                      {/* Defesa: Flanco Esquerdo */}
                      {defenseRanking.left === "hot" && (
                        <>
                          <ellipse cx="140" cy="110" rx="140" ry="85" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="80" cy="100" rx="100" ry="68" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="180" cy="180" rx="115" ry="75" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="280" cy="130" rx="125" ry="75" fill="url(#mancha-def-warning-vivid)" />
                        </>
                      )}
                      {defenseRanking.left === "warm" && (
                        <>
                          <ellipse cx="150" cy="120" rx="115" ry="75" fill="url(#mancha-def-warning-vivid)" />
                          <ellipse cx="260" cy="140" rx="100" ry="62" fill="url(#mancha-def-warning-vivid)" />
                        </>
                      )}
                      {defenseRanking.left === "cold" && (
                        <>
                          <ellipse cx="180" cy="130" rx="95" ry="58" fill="url(#mancha-def-safe-vivid)" />
                        </>
                      )}

                      {/* Defesa: Miolo da Zaga & Gol Sofrido */}
                      {defenseRanking.center === "hot" && (
                        <>
                          <ellipse cx="120" cy="340" rx="135" ry="95" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="75" cy="340" rx="95" ry="68" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="220" cy="340" rx="120" ry="80" fill="url(#mancha-def-critical-vivid)" />
                        </>
                      )}
                      {defenseRanking.center === "warm" && (
                        <>
                          <ellipse cx="130" cy="340" rx="110" ry="78" fill="url(#mancha-def-warning-vivid)" />
                          <ellipse cx="210" cy="340" rx="95" ry="68" fill="url(#mancha-def-warning-vivid)" />
                        </>
                      )}
                      {defenseRanking.center === "cold" && (
                        <>
                          <ellipse cx="140" cy="340" rx="90" ry="60" fill="url(#mancha-def-safe-vivid)" />
                        </>
                      )}

                      {/* Defesa: Flanco Direito */}
                      {defenseRanking.right === "hot" && (
                        <>
                          <ellipse cx="140" cy="570" rx="140" ry="85" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="80" cy="580" rx="100" ry="68" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="180" cy="500" rx="115" ry="75" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="280" cy="550" rx="125" ry="75" fill="url(#mancha-def-warning-vivid)" />
                        </>
                      )}
                      {defenseRanking.right === "warm" && (
                        <>
                          <ellipse cx="150" cy="560" rx="115" ry="75" fill="url(#mancha-def-warning-vivid)" />
                          <ellipse cx="260" cy="540" rx="100" ry="62" fill="url(#mancha-def-warning-vivid)" />
                        </>
                      )}
                      {defenseRanking.right === "cold" && (
                        <>
                          <ellipse cx="180" cy="550" rx="95" ry="58" fill="url(#mancha-def-safe-vivid)" />
                        </>
                      )}

                      {/* Marca do Pênalti Defensivo */}
                      <ellipse cx="135" cy="340" rx="90" ry="70" fill="url(#mancha-def-critical-vivid)" />
                    </g>

                    {/* PASS 2: DEFENSE RAZOR CORE */}
                    <g filter="url(#heat-core)" opacity={intensityMode === "high" ? "1" : "0.85"}>
                      {defenseRanking.left === "hot" && (
                        <>
                          <ellipse cx="140" cy="110" rx="90" ry="55" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="80" cy="100" rx="60" ry="40" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="180" cy="180" rx="75" ry="48" fill="url(#mancha-def-critical-vivid)" />
                        </>
                      )}
                      {defenseRanking.right === "hot" && (
                        <>
                          <ellipse cx="140" cy="570" rx="90" ry="55" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="80" cy="580" rx="60" ry="40" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="180" cy="500" rx="75" ry="48" fill="url(#mancha-def-critical-vivid)" />
                        </>
                      )}
                      {defenseRanking.center === "hot" && (
                        <>
                          <ellipse cx="120" cy="340" rx="90" ry="60" fill="url(#mancha-def-critical-vivid)" />
                          <ellipse cx="75" cy="340" rx="60" ry="42" fill="url(#mancha-def-critical-vivid)" />
                        </>
                      )}
                      <ellipse cx="135" cy="340" rx="60" ry="45" fill="url(#mancha-def-critical-vivid)" />
                    </g>

                    {/* PASS 3: DEFENSE WHITE-HOT DANGER NUCLEUS */}
                    {intensityMode === "high" && (
                      <g filter="url(#heat-nucleus)" opacity="0.95">
                        {defenseRanking.left === "hot" && (
                          <ellipse cx="140" cy="110" rx="30" ry="18" fill="#ffffff" opacity="0.85" />
                        )}
                        {defenseRanking.right === "hot" && (
                          <ellipse cx="140" cy="570" rx="30" ry="18" fill="#ffffff" opacity="0.85" />
                        )}
                        {defenseRanking.center === "hot" && (
                          <ellipse cx="120" cy="340" rx="32" ry="20" fill="#ffffff" opacity="0.85" />
                        )}
                        <ellipse cx="135" cy="340" rx="25" ry="16" fill="#ffffff" opacity="0.90" />
                      </g>
                    )}
                  </g>
                )}

                {/* ========================================================
                    SUBTLE OBSIDIAN-GLASS TACTICAL SECTOR GRID (TOGGLEABLE)
                   ======================================================== */}
                {showGridLines && (
                  <g stroke="rgba(255,255,255,0.22)" strokeDasharray="5 7" strokeWidth="1.2" fill="none">
                    {/* Attacking Half Sub-corridors */}
                    <line x1="525" y1="210" x2="1015" y2="210" />
                    <line x1="525" y1="470" x2="1015" y2="470" />
                    {/* Vertical Sector Lines (Intermediária / Linha de Entrada da Área) */}
                    <line x1="720" y1="35" x2="720" y2="645" />
                    <line x1="850" y1="35" x2="850" y2="148" />
                    <line x1="850" y1="532" x2="850" y2="645" />

                    {/* Defensive Half Sub-corridors */}
                    <line x1="35" y1="210" x2="525" y2="210" />
                    <line x1="35" y1="470" x2="525" y2="470" />
                    <line x1="330" y1="35" x2="330" y2="645" />
                  </g>
                )}

                {/* ========================================================
                    OFFICIAL PITCH LINES (White with crisp neon glow)
                   ======================================================== */}
                <g stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.88" fill="none">
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

                {/* ========================================================
                    OBSIDIAN-GLASS FLOATING PINS (Clean, No Collisions)
                   ======================================================== */}
                {mode === "attack" && (
                  <g className="font-sans select-none">
                    {/* Left Flank Floating Pin */}
                    <g transform="translate(680, 58)">
                      <rect
                        x="-85"
                        y="-18"
                        width="170"
                        height="36"
                        rx="12"
                        fill="#05140b"
                        fillOpacity="0.92"
                        stroke={attackRanking.left === "hot" ? "#ef4444" : attackRanking.left === "warm" ? "#f59e0b" : "#0284c7"}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="-68"
                        cy="0"
                        r="4"
                        fill={attackRanking.left === "hot" ? "#ef4444" : attackRanking.left === "warm" ? "#f59e0b" : "#38bdf8"}
                      />
                      <text x="-56" y="-2" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                        CORREDOR ESQ.
                      </text>
                      <text
                        x="-56"
                        y="10"
                        fill={attackRanking.left === "hot" ? "#fca5a5" : attackRanking.left === "warm" ? "#fde047" : "#7dd3fc"}
                        fontSize="11"
                        fontWeight="900"
                      >
                        {atk?.left_pct}% • {atk?.goals_left} Gols
                      </text>
                    </g>

                    {/* Center Channel Floating Pin */}
                    <g transform="translate(640, 340)">
                      <rect
                        x="-85"
                        y="-18"
                        width="170"
                        height="36"
                        rx="12"
                        fill="#05140b"
                        fillOpacity="0.92"
                        stroke={attackRanking.center === "hot" ? "#ef4444" : attackRanking.center === "warm" ? "#f59e0b" : "#0284c7"}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="-68"
                        cy="0"
                        r="4"
                        fill={attackRanking.center === "hot" ? "#ef4444" : attackRanking.center === "warm" ? "#f59e0b" : "#38bdf8"}
                      />
                      <text x="-56" y="-2" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                        FAIXA CENTRAL
                      </text>
                      <text
                        x="-56"
                        y="10"
                        fill={attackRanking.center === "hot" ? "#fca5a5" : attackRanking.center === "warm" ? "#fde047" : "#7dd3fc"}
                        fontSize="11"
                        fontWeight="900"
                      >
                        {atk?.center_pct}% • {atk?.goals_center} Gols
                      </text>
                    </g>

                    {/* Right Flank Floating Pin */}
                    <g transform="translate(680, 622)">
                      <rect
                        x="-85"
                        y="-18"
                        width="170"
                        height="36"
                        rx="12"
                        fill="#05140b"
                        fillOpacity="0.92"
                        stroke={attackRanking.right === "hot" ? "#ef4444" : attackRanking.right === "warm" ? "#f59e0b" : "#0284c7"}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="-68"
                        cy="0"
                        r="4"
                        fill={attackRanking.right === "hot" ? "#ef4444" : attackRanking.right === "warm" ? "#f59e0b" : "#38bdf8"}
                      />
                      <text x="-56" y="-2" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                        CORREDOR DIR.
                      </text>
                      <text
                        x="-56"
                        y="10"
                        fill={attackRanking.right === "hot" ? "#fca5a5" : attackRanking.right === "warm" ? "#fde047" : "#7dd3fc"}
                        fontSize="11"
                        fontWeight="900"
                      >
                        {atk?.right_pct}% • {atk?.goals_right} Gols
                      </text>
                    </g>

                    {/* Inside Box Shot Finishing Hotspot Pin */}
                    <g transform="translate(935, 175)">
                      <rect
                        x="-65"
                        y="-18"
                        width="130"
                        height="36"
                        rx="12"
                        fill="#140608"
                        fillOpacity="0.94"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                      />
                      <circle cx="-50" cy="0" r="4" fill="#f43f5e" />
                      <text x="-40" y="-2" fill="#fda4af" fontSize="9" fontWeight="900" letterSpacing="0.05em">
                        FINALIZAÇÕES
                      </text>
                      <text x="-40" y="10" fill="#ffffff" fontSize="11" fontWeight="900">
                        {atk?.inside_box_pct}% na Área
                      </text>
                    </g>
                  </g>
                )}

                {mode === "defense" && (
                  <g className="font-sans select-none">
                    {/* Left Defensive Flank Pin */}
                    <g transform="translate(240, 58)">
                      <rect
                        x="-85"
                        y="-18"
                        width="170"
                        height="36"
                        rx="12"
                        fill="#18070a"
                        fillOpacity="0.94"
                        stroke={defenseRanking.left === "hot" ? "#f43f5e" : defenseRanking.left === "warm" ? "#f59e0b" : "#0284c7"}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="-68"
                        cy="0"
                        r="4"
                        fill={defenseRanking.left === "hot" ? "#f43f5e" : defenseRanking.left === "warm" ? "#f59e0b" : "#38bdf8"}
                      />
                      <text x="-56" y="-2" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                        FLANCO ESQ. DEF.
                      </text>
                      <text
                        x="-56"
                        y="10"
                        fill={defenseRanking.left === "hot" ? "#fda4af" : defenseRanking.left === "warm" ? "#fde047" : "#7dd3fc"}
                        fontSize="11"
                        fontWeight="900"
                      >
                        {def?.left_conceded_pct}% Gols Sofridos
                      </text>
                    </g>

                    {/* Center Defensive Box Pin */}
                    <g transform="translate(260, 340)">
                      <rect
                        x="-85"
                        y="-18"
                        width="170"
                        height="36"
                        rx="12"
                        fill="#18070a"
                        fillOpacity="0.94"
                        stroke={defenseRanking.center === "hot" ? "#f43f5e" : defenseRanking.center === "warm" ? "#f59e0b" : "#0284c7"}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="-68"
                        cy="0"
                        r="4"
                        fill={defenseRanking.center === "hot" ? "#f43f5e" : defenseRanking.center === "warm" ? "#f59e0b" : "#38bdf8"}
                      />
                      <text x="-56" y="-2" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                        MIOLO DA ZAGA
                      </text>
                      <text
                        x="-56"
                        y="10"
                        fill={defenseRanking.center === "hot" ? "#fda4af" : defenseRanking.center === "warm" ? "#fde047" : "#7dd3fc"}
                        fontSize="11"
                        fontWeight="900"
                      >
                        {def?.center_conceded_pct}% Gols Sofridos
                      </text>
                    </g>

                    {/* Right Defensive Flank Pin */}
                    <g transform="translate(240, 622)">
                      <rect
                        x="-85"
                        y="-18"
                        width="170"
                        height="36"
                        rx="12"
                        fill="#18070a"
                        fillOpacity="0.94"
                        stroke={defenseRanking.right === "hot" ? "#f43f5e" : defenseRanking.right === "warm" ? "#f59e0b" : "#0284c7"}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="-68"
                        cy="0"
                        r="4"
                        fill={defenseRanking.right === "hot" ? "#f43f5e" : defenseRanking.right === "warm" ? "#f59e0b" : "#38bdf8"}
                      />
                      <text x="-56" y="-2" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                        FLANCO DIR. DEF.
                      </text>
                      <text
                        x="-56"
                        y="10"
                        fill={defenseRanking.right === "hot" ? "#fda4af" : defenseRanking.right === "warm" ? "#fde047" : "#7dd3fc"}
                        fontSize="11"
                        fontWeight="900"
                      >
                        {def?.right_conceded_pct}% Gols Sofridos
                      </text>
                    </g>

                    {/* Defensive Box Vulnerability Callout */}
                    <g transform="translate(118, 340)">
                      <circle cx="0" cy="0" r="28" fill="#e11d48" fillOpacity="0.94" stroke="#ffffff" strokeWidth="2" />
                      <text x="0" y="-3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">
                        ALERTA
                      </text>
                      <text x="0" y="11" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
                        ZAGA
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Thermal Scale Legend (Organic Manchas Indicator) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-emerald-400" />
              <span className="font-extrabold uppercase tracking-wider text-zinc-300">
                Densidade Térmica das Manchas:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-950/60 px-2.5 py-1 text-[11px] text-sky-300">
                <Snowflake className="h-3 w-3 text-sky-400" />
                Mancha Ciano (Frequência Suave / Segura)
              </span>
              <span className="h-2.5 w-16 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 shadow-sm" />
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/60 px-2.5 py-1 text-[11px] text-amber-300">
                <Zap className="h-3 w-3 text-amber-400" />
                Mancha Dourada (Fluxo Regular)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/60 px-2.5 py-1 text-[11px] text-rose-300">
                <Flame className="h-3 w-3 text-rose-400" />
                Mancha Vermelha (Foco Incandescente / Crítico)
              </span>
            </div>
          </div>

          {/* Detailed Granular Sector Breakdown Cards (Direct User Request) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Detalhamento dos Setores no Gramado
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {mode === "attack" ? "Distribuição de Criação e Finalizações" : "Vulnerabilidade por Setor"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(mode === "attack" ? attackSectors : defenseSectors).map((s) => (
                <div
                  key={s.id}
                  onMouseEnter={() => setHoveredSector(s.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className={`rounded-2xl border p-3.5 transition-all cursor-default ${
                    hoveredSector === s.id
                      ? "border-emerald-400 bg-black/60 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                      : "border-white/10 bg-black/35 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{s.name}</span>
                    <span
                      className="font-mono text-sm font-black"
                      style={{ color: s.tierColor }}
                    >
                      {s.pct}%
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">{s.secondaryStat}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border ${s.tierBorder} ${s.tierBg}`}
                      style={{ color: s.tierColor }}
                    >
                      {s.tierLabel}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tactical Breakdown Cards */}
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
