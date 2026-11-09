"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Calculator,
  Gamepad2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Trophy,
  Star,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  SeasonOverview,
  StandingTeam,
  FanCalculatorResult,
  fetchFanCalculator,
  simulateRoundScores,
} from "@/lib/api";

interface LiveSeasonModuleProps {
  data: SeasonOverview;
  division: "A" | "B";
  year: number;
  favoriteClubSlug: string;
}

type TableFilterMode = "overall" | "form5" | "home" | "away";

export function LiveSeasonModule({
  data,
  division,
  year,
  favoriteClubSlug,
}: LiveSeasonModuleProps) {
  const [tableMode, setTableMode] = useState<TableFilterMode>("overall");
  const [simScores, setSimScores] = useState<
    Record<number, { home: number | ""; away: number | "" }>
  >({});
  const [simulatedStandings, setSimulatedStandings] = useState<
    StandingTeam[] | null
  >(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [calcClubSlug, setCalcClubSlug] = useState<string>(
    favoriteClubSlug || data.standings[0]?.club.slug || "palmeiras"
  );
  const [calcTarget, setCalcTarget] = useState<string>("Z4");
  const [calcCustomPts, setCalcCustomPts] = useState<number | undefined>(
    undefined
  );
  const [calcResult, setCalcResult] = useState<FanCalculatorResult | null>(
    null
  );

  useEffect(() => {
    if (favoriteClubSlug) {
      const existsInDiv = data.standings.some(
        (t) => t.club.slug === favoriteClubSlug
      );
      if (existsInDiv) {
        setCalcClubSlug(favoriteClubSlug);
      }
    } else if (data.standings.length > 0) {
      setCalcClubSlug(data.standings[0].club.slug);
    }
    setSimulatedStandings(null);
    setSimScores({});
  }, [data, division, year, favoriteClubSlug]);

  useEffect(() => {
    if (!calcClubSlug) return;
    fetchFanCalculator(division, year, calcClubSlug, calcTarget, calcCustomPts)
      .then(setCalcResult)
      .catch(() => {});
  }, [division, year, calcClubSlug, calcTarget, calcCustomPts]);

  const activeStandings = simulatedStandings || data.standings;

  const displayedStandings = useMemo(() => {
    const list = [...activeStandings];
    if (tableMode === "form5") {
      return list.sort(
        (a, b) =>
          b.points_last_5 - a.points_last_5 || b.goal_diff - a.goal_diff
      );
    }
    if (tableMode === "home") {
      return list.sort(
        (a, b) => b.home_points - a.home_points || b.aprov_home - a.aprov_home
      );
    }
    if (tableMode === "away") {
      return list.sort(
        (a, b) => b.away_points - a.away_points || b.aprov_away - a.aprov_away
      );
    }
    return list;
  }, [activeStandings, tableMode]);

  const leader = activeStandings[0];
  const runnerUp = activeStandings[1];
  const g4Cutoff = activeStandings[3];
  const z4FirstOut = activeStandings[15];
  const z4FirstIn = activeStandings[16];
  const sixPointersCount = data.round_matches.filter(
    (m) => m.is_six_pointer
  ).length;

  async function applySimulation(
    nextScores: Record<number, { home: number | ""; away: number | "" }>
  ) {
    const validScores = Object.entries(nextScores)
      .filter(([, v]) => v.home !== "" && v.away !== "")
      .map(([mId, v]) => ({
        match_id: Number(mId),
        home_score: Number(v.home),
        away_score: Number(v.away),
      }));

    if (validScores.length === 0) {
      setSimulatedStandings(null);
      return;
    }

    setIsSimulating(true);
    try {
      const res = await simulateRoundScores(division, year, validScores);
      setSimulatedStandings(res.simulated_standings);
    } catch {
      // Fallback
    } finally {
      setIsSimulating(false);
    }
  }

  function handleScoreChange(
    matchId: number,
    side: "home" | "away",
    value: string
  ) {
    const parsed =
      value === "" ? "" : Math.max(0, Math.min(9, parseInt(value, 10) || 0));
    const current = simScores[matchId] || { home: "", away: "" };
    const updatedMatch = {
      ...current,
      [side]: parsed,
    };
    if (parsed !== "" && updatedMatch[side === "home" ? "away" : "home"] === "") {
      updatedMatch[side === "home" ? "away" : "home"] = 0;
    }
    const next = { ...simScores, [matchId]: updatedMatch };
    setSimScores(next);
    applySimulation(next);
  }

  function fillAiPredictions(zebraMode = false) {
    const next: Record<number, { home: number; away: number }> = {};
    data.round_matches.forEach((m) => {
      if (!zebraMode) {
        if (m.pred_home_win >= 50) next[m.id] = { home: 2, away: 0 };
        else if (m.pred_home_win >= 42) next[m.id] = { home: 2, away: 1 };
        else if (m.pred_away_win >= 42) next[m.id] = { home: 0, away: 2 };
        else next[m.id] = { home: 1, away: 1 };
      } else {
        if (m.pred_home_win >= 48) next[m.id] = { home: 0, away: 1 };
        else next[m.id] = { home: 2, away: 2 };
      }
    });
    setSimScores(next);
    applySimulation(next);
  }

  function resetSimulation() {
    setSimScores({});
    setSimulatedStandings(null);
  }

  const simulatedCount = Object.values(simScores).filter(
    (s) => s.home !== "" && s.away !== ""
  ).length;

  function getZoneStyle(pos: number) {
    if (division === "A") {
      if (pos <= 4)
        return "border-l-[3px] border-l-emerald-400 bg-gradient-to-r from-emerald-500/[0.08] to-transparent";
      if (pos <= 6)
        return "border-l-[3px] border-l-sky-400 bg-gradient-to-r from-sky-500/[0.06] to-transparent";
      if (pos <= 12) return "border-l-[3px] border-l-indigo-400/75";
      if (pos >= 17)
        return "border-l-[3px] border-l-rose-500 bg-gradient-to-r from-rose-500/[0.08] to-transparent";
      return "border-l-[3px] border-l-white/10";
    } else {
      if (pos <= 4)
        return "border-l-[3px] border-l-emerald-400 bg-gradient-to-r from-emerald-500/[0.08] to-transparent";
      if (pos >= 17)
        return "border-l-[3px] border-l-rose-500 bg-gradient-to-r from-rose-500/[0.08] to-transparent";
      return "border-l-[3px] border-l-white/10";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Hero Obsidian Glass KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="obsidian-kpi-emerald">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                Líder • Série {division}
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-emerald-400">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-xl font-extrabold tracking-tight text-white">
                  {leader?.club.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  <strong className="font-mono text-zinc-100">
                    {leader?.points} pts
                  </strong>{" "}
                  ({leader?.aproveitamento}%) • +
                  {(leader?.points || 0) - (runnerUp?.points || 0)} pts sobre o 2º
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-black text-emerald-400">
                  {leader?.prob_title}%
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Chance Título
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-sky">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400">
                {division === "A"
                  ? "Corte Libertadores (G4)"
                  : "Corte do Acesso (G4)"}
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-sky-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-xl font-extrabold tracking-tight text-white">
                  4º {g4Cutoff?.club.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Atual: <strong className="font-mono text-zinc-100">{g4Cutoff?.points}p</strong> •
                  Número Mágico:{" "}
                  <strong className="font-mono text-sky-300">
                    {data.season.magic_g4_pts} pts
                  </strong>
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-black text-sky-400">
                  {g4Cutoff?.prob_g4}%
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Prob. G4
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-rose">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-400">
                Fronteira da Degola (16º × 17º)
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-rose-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-lg font-extrabold tracking-tight text-white">
                  16º {z4FirstOut?.club.short_name} ({z4FirstOut?.points}p) × 17º{" "}
                  {z4FirstIn?.club.short_name} ({z4FirstIn?.points}p)
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Corte Seguro:{" "}
                  <strong className="font-mono text-rose-300">
                    {data.season.magic_escape_z4_pts} pts
                  </strong>{" "}
                  (98,2% salvos)
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-black text-rose-400">
                  {z4FirstIn?.prob_z4}%
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Risco Z4 (17º)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-amber">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                Tensão da Rodada{" "}
                {data.season.current_round + (data.season.is_current ? 1 : 0)}
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-xl font-extrabold tracking-tight text-white">
                  {sixPointersCount} Jogos de &ldquo;6 Pontos&rdquo;
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Restam{" "}
                  <strong className="font-mono text-amber-300">
                    {data.season.total_rounds - data.season.current_round} rodadas
                  </strong>{" "}
                  ({(data.season.total_rounds - data.season.current_round) * 3} pts em jogo)
                </p>
              </div>
              <Badge variant="warning">Simulador Ativo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Live Standings Table (Left 7 cols) + Interactive Round Simulator ("Secador Oficial") (Right 5 cols) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Standings + Monte Carlo Probabilities */}
        <Card className="xl:col-span-7">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-base sm:text-lg">
                    Tabela & Probabilidades Monte Carlo (10.000 Cenários)
                  </CardTitle>
                  {simulatedStandings && (
                    <Badge variant="warning" className="animate-pulse font-mono">
                      Simulação ({simulatedCount}J)
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Alterne entre a classificação geral, o recorte de momento (últimas 5 rodadas) e o desempenho Casa/Fora
                </CardDescription>
              </div>

              {/* Table View Mode Switcher Well */}
              <div className="obsidian-well inline-flex flex-wrap rounded-2xl p-1">
                {(
                  [
                    { key: "overall", label: "Geral" },
                    { key: "form5", label: "🔥 Últimos 5J" },
                    { key: "home", label: "🏠 Casa" },
                    { key: "away", label: "✈️ Fora" },
                  ] as { key: TableFilterMode; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTableMode(tab.key)}
                    className={`rounded-xl px-3 py-1 text-xs font-extrabold transition-all ${
                      tableMode === tab.key
                        ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 shadow-[0_2px_12px_rgba(16,185,129,0.4)]"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-0 pb-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Clube</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">J</TableHead>
                  <TableHead className="text-center">V</TableHead>
                  <TableHead className="text-center">SG</TableHead>
                  <TableHead className="text-center">% Aprov</TableHead>
                  <TableHead className="text-center">Momento (5J)</TableHead>
                  <TableHead className="text-right">
                    {division === "A" ? "Título / G4" : "Título / Acesso"}
                  </TableHead>
                  <TableHead className="text-right">Risco Z4</TableHead>
                  <TableHead className="hidden md:table-cell text-center">
                    Próx. 3J (SOS)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedStandings.map((team, idx) => {
                  const isFav = team.club.slug === favoriteClubSlug;
                  const delta =
                    team.sim_position_delta !== undefined
                      ? team.sim_position_delta
                      : team.position_delta;

                  const ptsShow =
                    tableMode === "form5"
                      ? team.points_last_5
                      : tableMode === "home"
                      ? team.home_points
                      : tableMode === "away"
                      ? team.away_points
                      : team.points;

                  const gamesShow =
                    tableMode === "form5"
                      ? 5
                      : tableMode === "home"
                      ? team.home_played
                      : tableMode === "away"
                      ? team.away_played
                      : team.played;

                  const winsShow =
                    tableMode === "form5"
                      ? team.form_last_5.filter((r) => r === "V").length
                      : tableMode === "home"
                      ? team.home_wins
                      : tableMode === "away"
                      ? team.away_wins
                      : team.wins;

                  const aprovShow =
                    tableMode === "form5"
                      ? team.aprov_last_5
                      : tableMode === "home"
                      ? team.aprov_home
                      : tableMode === "away"
                      ? team.aprov_away
                      : team.aproveitamento;

                  return (
                    <TableRow
                      key={team.club.slug}
                      className={`${getZoneStyle(team.position)} ${
                        isFav
                          ? "bg-amber-500/15 ring-1 ring-inset ring-amber-400/50"
                          : ""
                      }`}
                    >
                      {/* Position & Delta */}
                      <TableCell className="text-center font-mono font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-zinc-100">
                            {tableMode === "overall" ? team.position : idx + 1}º
                          </span>
                          {delta > 0 && (
                            <span className="flex items-center text-[10px] font-bold text-emerald-400">
                              <ArrowUpRight className="h-3 w-3" />
                              {delta}
                            </span>
                          )}
                          {delta < 0 && (
                            <span className="flex items-center text-[10px] font-bold text-rose-400">
                              <ArrowDownRight className="h-3 w-3" />
                              {Math.abs(delta)}
                            </span>
                          )}
                          {delta === 0 && (
                            <Minus className="h-2.5 w-2.5 text-zinc-600" />
                          )}
                        </div>
                      </TableCell>

                      {/* Club Info */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-black text-white ring-1 ring-white/25 shadow-sm"
                            style={{ backgroundColor: team.club.primary_color }}
                          >
                            {team.club.short_name}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {team.club.name}
                              </span>
                              {isFav && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              )}
                              {team.club.turf_type === "Sintético" && (
                                <span
                                  title="Estádio com Gramado Sintético"
                                  className="rounded-md border border-emerald-400/30 bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300"
                                >
                                  Sint.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* P, J, V, SG, % */}
                      <TableCell className="text-center font-mono font-extrabold text-white">
                        {ptsShow}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-zinc-400">
                        {gamesShow}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-zinc-300">
                        {winsShow}
                      </TableCell>
                      <TableCell
                        className={`text-center font-mono text-xs font-bold ${
                          team.goal_diff > 0
                            ? "text-emerald-400"
                            : team.goal_diff < 0
                            ? "text-rose-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs font-bold text-zinc-300">
                        {aprovShow}%
                      </TableCell>

                      {/* Form Last 5 Pills */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {team.form_last_5.map((res, i) => (
                            <span
                              key={i}
                              className={`flex h-4 w-4 items-center justify-center rounded-md text-[9px] font-extrabold ${
                                res === "V"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                                  : res === "E"
                                  ? "bg-white/[0.06] text-zinc-300 border border-white/10"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* Title / G4 Probabilities */}
                      <TableCell className="text-right font-mono">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
                            <span>{team.prob_g4}%</span>
                            {team.sim_prob_g4_delta ? (
                              <span
                                className={`text-[10px] ${
                                  team.sim_prob_g4_delta > 0
                                    ? "text-emerald-300"
                                    : "text-rose-400"
                                }`}
                              >
                                ({team.sim_prob_g4_delta > 0 ? "+" : ""}
                                {team.sim_prob_g4_delta}%)
                              </span>
                            ) : null}
                          </div>
                          {team.prob_title >= 1.0 && (
                            <span className="text-[10px] font-semibold text-amber-300">
                              🏆 {team.prob_title}% tít.
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Z4 Relegation Risk */}
                      <TableCell className="text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-xs font-extrabold ${
                              team.prob_z4 >= 50
                                ? "text-rose-400"
                                : team.prob_z4 >= 15
                                ? "text-amber-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {team.prob_z4}%
                          </span>
                          <div className="mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-black/60 border border-white/[0.05]">
                            <div
                              className={`h-full rounded-full ${
                                team.prob_z4 >= 50
                                  ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                                  : team.prob_z4 >= 15
                                  ? "bg-amber-400"
                                  : "bg-emerald-500/40"
                              }`}
                              style={{ width: `${Math.min(100, team.prob_z4)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Next 3 Opponents Semaphore */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {team.remaining_schedule.slice(0, 3).map((rem, idxRem) => (
                            <span
                              key={idxRem}
                              title={`R${rem.round}: vs ${rem.opponent_name} (${rem.opponent_position}º) - ${rem.venue === "C" ? "Casa" : "Fora"} [${rem.difficulty}]`}
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                rem.difficulty === "PEDREIRA"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                                  : rem.difficulty === "EQUILIBRADO"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                              }`}
                            >
                              {rem.opponent_short}({rem.venue})
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Zone Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 px-5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <span>
                  {division === "A"
                    ? "G4 — Libertadores Direta (1º–4º)"
                    : "G4 — Acesso à Série A (1º–4º)"}
                </span>
              </div>
              {division === "A" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                    <span>G6 — Pré-Libertadores (5º–6º)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                    <span>Sul-Americana (7º–12º)</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                <span>
                  {division === "A"
                    ? "Z4 — Rebaixamento Série B (17º–20º)"
                    : "Z4 — Rebaixamento Série C (17º–20º)"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Round Simulator ("Secador Oficial") */}
        <Card className="xl:col-span-5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-emerald-400">
                  <Gamepad2 className="h-4 w-4" />
                </div>
                <CardTitle className="text-base sm:text-lg">
                  Simulador da Rodada {data.round_matches[0]?.round_number || 33}{" "}
                  (&ldquo;Secador Oficial&rdquo;)
                </CardTitle>
              </div>
              {isSimulating && (
                <span className="text-xs font-bold text-emerald-400 animate-pulse">
                  Recalculando...
                </span>
              )}
            </div>
            <CardDescription>
              Altere os placares abaixo e veja a Tabela e as Probabilidades Monte Carlo mudarem em tempo real!
            </CardDescription>

            {/* Quick Simulator Action Buttons */}
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => fillAiPredictions(false)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Palpites IA (Favoritos)
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fillAiPredictions(true)}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Simular Rodada de Zebras
              </Button>
              {simulatedCount > 0 && (
                <Button size="sm" variant="outline" onClick={resetSimulation}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Limpar ({simulatedCount})
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 max-h-[680px] overflow-y-auto pr-2">
            {data.round_matches.map((match) => {
              const score = simScores[match.id] || { home: "", away: "" };
              const isFavMatch =
                match.home_club.slug === favoriteClubSlug ||
                match.away_club.slug === favoriteClubSlug;

              return (
                <div
                  key={match.id}
                  className={`obsidian-subcard rounded-2xl p-3.5 transition-all ${
                    isFavMatch
                      ? "border-amber-400/50 bg-amber-500/10"
                      : match.is_six_pointer
                      ? "border-emerald-400/25"
                      : ""
                  }`}
                >
                  <div className="mb-2.5 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="font-medium">
                      📅 {match.kickoff_slot} • 🏟️ {match.stadium}
                    </span>
                    {match.is_six_pointer && (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-extrabold text-rose-300 border border-rose-400/30">
                        🔥 {match.six_pointer_label}
                      </span>
                    )}
                  </div>

                  {/* Teams & Score Inputs */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Home Club */}
                    <div className="flex flex-1 items-center justify-end gap-2.5 text-right">
                      <div>
                        <p className="text-xs font-extrabold text-white">
                          {match.home_club.name}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-400">
                          {match.home_position}º lugar
                        </p>
                      </div>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white ring-1 ring-white/25 shadow"
                        style={{ backgroundColor: match.home_club.primary_color }}
                      >
                        {match.home_club.short_name}
                      </span>
                    </div>

                    {/* Score Box */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={9}
                        placeholder="-"
                        value={score.home}
                        onChange={(e) =>
                          handleScoreChange(match.id, "home", e.target.value)
                        }
                        className="obsidian-well h-10 w-12 rounded-xl text-center font-mono text-sm font-extrabold text-white transition-colors focus:border-emerald-400 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-zinc-500">×</span>
                      <input
                        type="number"
                        min={0}
                        max={9}
                        placeholder="-"
                        value={score.away}
                        onChange={(e) =>
                          handleScoreChange(match.id, "away", e.target.value)
                        }
                        className="obsidian-well h-10 w-12 rounded-xl text-center font-mono text-sm font-extrabold text-white transition-colors focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    {/* Away Club */}
                    <div className="flex flex-1 items-center gap-2.5 text-left">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white ring-1 ring-white/25 shadow"
                        style={{ backgroundColor: match.away_club.primary_color }}
                      >
                        {match.away_club.short_name}
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-white">
                          {match.away_club.name}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-400">
                          {match.away_position}º lugar
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pre-match Probabilities Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                      <span className="text-emerald-400">
                        Casa {match.pred_home_win}%
                      </span>
                      <span>Empate {match.pred_draw}%</span>
                      <span className="text-sky-400">
                        Fora {match.pred_away_win}%
                      </span>
                    </div>
                    <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/[0.05]">
                      <div
                        className="bg-emerald-400"
                        style={{ width: `${match.pred_home_win}%` }}
                      />
                      <div
                        className="bg-zinc-600"
                        style={{ width: `${match.pred_draw}%` }}
                      />
                      <div
                        className="bg-sky-400"
                        style={{ width: `${match.pred_away_win}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Calculadora do Torcedor ("Conta do Chá") + Dificuldade da Reta Final (SOS) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Calculadora do Torcedor ("A Conta do Chá") */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-amber-400">
                <Calculator className="h-4 w-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Calculadora do Torcedor (&ldquo;A Conta do Chá&rdquo;)
              </CardTitle>
            </div>
            <CardDescription>
              Descubra exatamente quantas vitórias e empates seu clube precisa nos jogos restantes para atingir a meta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Selecione o Clube:
                </label>
                <select
                  value={calcClubSlug}
                  onChange={(e) => setCalcClubSlug(e.target.value)}
                  className="obsidian-well w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
                >
                  {data.standings.map((t) => (
                    <option
                      key={t.club.slug}
                      value={t.club.slug}
                      className="bg-[#090c14]"
                    >
                      {t.position}º {t.club.name} ({t.points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Objetivo / Meta:
                </label>
                <select
                  value={calcTarget}
                  onChange={(e) => {
                    setCalcTarget(e.target.value);
                    setCalcCustomPts(undefined);
                  }}
                  className="obsidian-well w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="Z4" className="bg-[#090c14]">
                    {division === "A"
                      ? "🛡️ Escapar do Z4 (45 pts)"
                      : "🛡️ Permanência Série B (44 pts)"}
                  </option>
                  <option value="SULA" className="bg-[#090c14]">
                    {division === "A"
                      ? "🌎 Sul-Americana (47 pts)"
                      : "📈 Metade Superior (50 pts)"}
                  </option>
                  <option value="G6" className="bg-[#090c14]">
                    {division === "A"
                      ? "⚡ Pré-Libertadores G6 (57 pts)"
                      : "🔥 Briga pelo Acesso Top 6 (60 pts)"}
                  </option>
                  <option value="G4" className="bg-[#090c14]">
                    {division === "A"
                      ? "🏆 Libertadores Direta G4 (62 pts)"
                      : "🚀 Acesso à Série A G4 (64 pts)"}
                  </option>
                  <option value="TITULO" className="bg-[#090c14]">
                    👑 Título ({division === "A" ? "77 pts" : "72 pts"})
                  </option>
                </select>
              </div>
            </div>

            {calcResult && (
              <div className="obsidian-subcard rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-zinc-400">
                      Meta:{" "}
                      <strong className="text-white">
                        {calcResult.target_label}
                      </strong>{" "}
                      (<span className="font-mono">{calcResult.target_points}</span>{" "}
                      pts)
                    </p>
                    <p className="text-lg font-extrabold text-white mt-0.5">
                      Precisa somar{" "}
                      <span className="font-mono text-amber-400">
                        +{calcResult.points_needed} pts
                      </span>{" "}
                      em <span className="font-mono">{calcResult.remaining_games}</span>{" "}
                      jogos
                    </p>
                  </div>
                  <Badge
                    variant={
                      calcResult.verdict_color === "emerald"
                        ? "default"
                        : calcResult.verdict_color === "rose"
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {calcResult.verdict}
                  </Badge>
                </div>

                {/* Combination Boxes */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="obsidian-well rounded-xl border-emerald-400/25 p-2.5">
                    <span className="font-mono text-xl font-black text-emerald-400">
                      {calcResult.wins_needed}
                    </span>
                    <p className="text-[11px] font-semibold text-zinc-300">
                      Vitórias
                    </p>
                  </div>
                  <div className="obsidian-well rounded-xl p-2.5">
                    <span className="font-mono text-xl font-black text-zinc-200">
                      {calcResult.draws_needed}
                    </span>
                    <p className="text-[11px] font-semibold text-zinc-400">
                      Empates
                    </p>
                  </div>
                  <div className="obsidian-well rounded-xl border-rose-400/25 p-2.5">
                    <span className="font-mono text-xl font-black text-rose-300">
                      {calcResult.losses_allowed}
                    </span>
                    <p className="text-[11px] font-semibold text-zinc-400">
                      Derrotas (Margem)
                    </p>
                  </div>
                </div>

                {/* Comparison Bars */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Aproveitamento Exigido na Reta Final:</span>
                      <strong className="font-mono text-amber-400">
                        {calcResult.required_aproveitamento}%
                      </strong>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/60 border border-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{
                          width: `${Math.min(
                            100,
                            calcResult.required_aproveitamento
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Aproveitamento Atual no Campeonato:</span>
                      <strong className="font-mono text-emerald-400">
                        {calcResult.current_aproveitamento}%
                      </strong>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/60 border border-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                        style={{
                          width: `${Math.min(
                            100,
                            calcResult.current_aproveitamento
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed border-t border-white/[0.06] pt-3">
                  💡 {calcResult.explanation} ({calcResult.remaining_home} jogos em
                  Casa e {calcResult.remaining_away} Fora).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strength of Schedule (SOS - Dificuldade da Tabela Restante) */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-sky-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <CardTitle className="text-base sm:text-lg">
                  Dificuldade do Calendário Restante (Strength of Schedule — SOS)
                </CardTitle>
              </div>
              <Badge variant="info" className="font-mono">
                Rodadas 33 a 38
              </Badge>
            </div>
            <CardDescription>
              Quem enfrenta um &ldquo;corredor polonês&rdquo; e quem tem a tabela mais acessível nas 6 rodadas finais (C = Casa, F = Fora, 🔥 = Jogo de 6 Pontos)
            </CardDescription>
          </CardHeader>

          <CardContent className="max-h-[420px] overflow-y-auto pr-2">
            <div className="space-y-2">
              {[...activeStandings]
                .sort((a, b) => b.sos_score - a.sos_score)
                .map((team) => {
                  const isFav = team.club.slug === favoriteClubSlug;
                  return (
                    <div
                      key={team.club.slug}
                      className={`obsidian-subcard flex flex-col gap-2 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between ${
                        isFav
                          ? "border-amber-400/50 bg-amber-500/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white ring-1 ring-white/25"
                          style={{ backgroundColor: team.club.primary_color }}
                        >
                          {team.club.short_name}
                        </span>
                        <div>
                          <p className="text-xs font-extrabold text-white">
                            {team.position}º {team.club.name}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Índice SOS:{" "}
                            <strong
                              className={`font-mono ${
                                team.sos_score >= 60
                                  ? "text-rose-400"
                                  : team.sos_score >= 45
                                  ? "text-amber-300"
                                  : "text-emerald-400"
                              }`}
                            >
                              {team.sos_score}/100
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {team.remaining_schedule.map((rem) => (
                          <div
                            key={rem.round}
                            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${
                              rem.difficulty === "PEDREIRA"
                                ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
                                : rem.difficulty === "EQUILIBRADO"
                                ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
                                : "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                            }`}
                          >
                            <span className="font-mono text-zinc-400">
                              R{rem.round}:
                            </span>
                            <span className="font-extrabold">
                              {rem.opponent_short}
                            </span>
                            <span className="opacity-75">({rem.venue})</span>
                            {rem.is_six_pointer && (
                              <span title="Jogo de 6 Pontos">🔥</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
