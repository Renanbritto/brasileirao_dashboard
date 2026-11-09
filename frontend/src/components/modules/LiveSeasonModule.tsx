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

  // Fan Calculator ("Conta do Chá") state
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
      // Fallback local if needed
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
        // Zebra / Chaos mode!
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
      if (pos <= 4) return "border-l-4 border-l-emerald-500 bg-emerald-500/5";
      if (pos <= 6) return "border-l-4 border-l-sky-500 bg-sky-500/5";
      if (pos <= 12) return "border-l-4 border-l-indigo-500/80";
      if (pos >= 17) return "border-l-4 border-l-rose-500 bg-rose-500/5";
      return "border-l-4 border-l-slate-700";
    } else {
      if (pos <= 4) return "border-l-4 border-l-emerald-500 bg-emerald-500/5";
      if (pos >= 17) return "border-l-4 border-l-rose-500 bg-rose-500/5";
      return "border-l-4 border-l-slate-700";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Líder • Série {division}
              </span>
              <Trophy className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-xl font-extrabold text-white">
                  {leader?.club.name}
                </p>
                <p className="text-xs text-slate-400">
                  {leader?.points} pts ({leader?.aproveitamento}% aprov.) • +
                  {(leader?.points || 0) - (runnerUp?.points || 0)} pts sobre o 2º
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400">
                  {leader?.prob_title}%
                </span>
                <p className="text-[10px] text-slate-400">Chance Título</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                {division === "A" ? "Corte Libertadores (G4)" : "Corte do Acesso (G4)"}
              </span>
              <Sparkles className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-xl font-extrabold text-white">
                  4º {g4Cutoff?.club.name} ({g4Cutoff?.points} pts)
                </p>
                <p className="text-xs text-slate-400">
                  Número Mágico Histórico:{" "}
                  <strong className="text-sky-300">
                    {data.season.magic_g4_pts} pts
                  </strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-sky-400">
                  {g4Cutoff?.prob_g4}%
                </span>
                <p className="text-[10px] text-slate-400">Prob. G4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Fronteira da Degola (16º × 17º)
              </span>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-base font-extrabold text-white">
                  16º {z4FirstOut?.club.short_name} ({z4FirstOut?.points}p) vs 17º{" "}
                  {z4FirstIn?.club.short_name} ({z4FirstIn?.points}p)
                </p>
                <p className="text-xs text-slate-400">
                  Corte Seguro:{" "}
                  <strong className="text-rose-300">
                    {data.season.magic_escape_z4_pts} pts
                  </strong>{" "}
                  (98,2% salvos)
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-rose-400">
                  {z4FirstIn?.prob_z4}%
                </span>
                <p className="text-[10px] text-slate-400">Risco Z4 (17º)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Tensão da Rodada {data.season.current_round + (data.season.is_current ? 1 : 0)}
              </span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-xl font-extrabold text-white">
                  {sixPointersCount} Jogos de &ldquo;6 Pontos&rdquo;
                </p>
                <p className="text-xs text-slate-400">
                  Faltam{" "}
                  <strong className="text-amber-300">
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
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg">
                    Tabela & Probabilidades Monte Carlo (10.000 Cenários)
                  </CardTitle>
                  {simulatedStandings && (
                    <Badge variant="warning" className="animate-pulse">
                      Simulação Aplicada ({simulatedCount}J)
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Alterne entre a tabela geral, o recorte de momento (últimas 5 rodadas) e o desempenho Casa/Fora
                </CardDescription>
              </div>

              {/* Table View Mode Switcher */}
              <div className="inline-flex flex-wrap rounded-lg border border-slate-800 bg-slate-950 p-1">
                {(
                  [
                    { key: "overall", label: "Geral" },
                    { key: "form5", label: "🔥 Últimos 5J (Momento)" },
                    { key: "home", label: "🏠 Casa" },
                    { key: "away", label: "✈️ Fora" },
                  ] as { key: TableFilterMode; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTableMode(tab.key)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      tableMode === tab.key
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-2">
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
                      <TableCell className="text-center font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-slate-100">
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
                            <Minus className="h-2.5 w-2.5 text-slate-600" />
                          )}
                        </div>
                      </TableCell>

                      {/* Club Info */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white shadow-sm"
                            style={{ backgroundColor: team.club.primary_color }}
                          >
                            {team.club.short_name}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white text-xs sm:text-sm">
                                {team.club.name}
                              </span>
                              {isFav && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              )}
                              {team.club.turf_type === "Sintético" && (
                                <span
                                  title="Estádio com Gramado Sintético"
                                  className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-semibold text-emerald-300"
                                >
                                  Sint.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* P, J, V, SG, % */}
                      <TableCell className="text-center font-extrabold text-white">
                        {ptsShow}
                      </TableCell>
                      <TableCell className="text-center text-xs text-slate-400">
                        {gamesShow}
                      </TableCell>
                      <TableCell className="text-center text-xs text-slate-300">
                        {winsShow}
                      </TableCell>
                      <TableCell
                        className={`text-center text-xs font-semibold ${
                          team.goal_diff > 0
                            ? "text-emerald-400"
                            : team.goal_diff < 0
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-slate-300">
                        {aprovShow}%
                      </TableCell>

                      {/* Form Last 5 Pills */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {team.form_last_5.map((res, i) => (
                            <span
                              key={i}
                              className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-extrabold ${
                                res === "V"
                                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                                  : res === "E"
                                  ? "bg-slate-700/60 text-slate-300"
                                  : "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* Title / G4 Probabilities */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
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
                            <span className="text-[10px] font-medium text-amber-300">
                              🏆 {team.prob_title}% tít.
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Z4 Relegation Risk */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-xs font-bold ${
                              team.prob_z4 >= 50
                                ? "text-rose-400"
                                : team.prob_z4 >= 15
                                ? "text-amber-400"
                                : "text-slate-500"
                            }`}
                          >
                            {team.prob_z4}%
                          </span>
                          <div className="mt-0.5 h-1.5 w-14 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                team.prob_z4 >= 50
                                  ? "bg-rose-500"
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
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                rem.difficulty === "PEDREIRA"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : rem.difficulty === "EQUILIBRADO"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
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
            <div className="mt-3 flex flex-wrap items-center gap-4 px-5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span>
                  {division === "A"
                    ? "G4 — Libertadores Direta (1º–4º)"
                    : "G4 — Acesso à Série A (1º–4º)"}
                </span>
              </div>
              {division === "A" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                    <span>G6 — Pré-Libertadores (5º–6º)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
                    <span>Sul-Americana (7º–12º)</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
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
        <Card className="xl:col-span-5 border-emerald-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-base sm:text-lg">
                  Simulador da Rodada {data.round_matches[0]?.round_number || 33} (&ldquo;Secador Oficial&rdquo;)
                </CardTitle>
              </div>
              {isSimulating && (
                <span className="text-xs text-emerald-400 animate-pulse">
                  Recalculando...
                </span>
              )}
            </div>
            <CardDescription>
              Altere os placares abaixo e veja a Tabela e as Probabilidades Monte Carlo mudarem em tempo real!
            </CardDescription>

            {/* Quick Simulator Action Buttons */}
            <div className="mt-2 flex flex-wrap gap-2">
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

          <CardContent className="space-y-2.5 max-h-[680px] overflow-y-auto pr-2">
            {data.round_matches.map((match) => {
              const score = simScores[match.id] || { home: "", away: "" };
              const isFavMatch =
                match.home_club.slug === favoriteClubSlug ||
                match.away_club.slug === favoriteClubSlug;

              return (
                <div
                  key={match.id}
                  className={`rounded-xl border p-3 transition-all ${
                    isFavMatch
                      ? "border-amber-400/60 bg-amber-500/10"
                      : match.is_six_pointer
                      ? "border-emerald-500/30 bg-slate-900/90"
                      : "border-slate-800 bg-slate-950/60"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      📅 {match.kickoff_slot} • 🏟️ {match.stadium}
                    </span>
                    {match.is_six_pointer && (
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                        🔥 {match.six_pointer_label}
                      </span>
                    )}
                  </div>

                  {/* Teams & Score Inputs */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Home Club */}
                    <div className="flex flex-1 items-center justify-end gap-2 text-right">
                      <div>
                        <p className="text-xs font-bold text-white">
                          {match.home_club.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {match.home_position}º lugar
                        </p>
                      </div>
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white"
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
                        className="h-9 w-11 rounded-lg border border-slate-700 bg-slate-900 text-center text-sm font-extrabold text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">×</span>
                      <input
                        type="number"
                        min={0}
                        max={9}
                        placeholder="-"
                        value={score.away}
                        onChange={(e) =>
                          handleScoreChange(match.id, "away", e.target.value)
                        }
                        className="h-9 w-11 rounded-lg border border-slate-700 bg-slate-900 text-center text-sm font-extrabold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Away Club */}
                    <div className="flex flex-1 items-center gap-2 text-left">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white"
                        style={{ backgroundColor: match.away_club.primary_color }}
                      >
                        {match.away_club.short_name}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {match.away_club.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {match.away_position}º lugar
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pre-match Probabilities Bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Mandante {match.pred_home_win}%</span>
                      <span>Empate {match.pred_draw}%</span>
                      <span>Visitante {match.pred_away_win}%</span>
                    </div>
                    <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${match.pred_home_win}%` }}
                      />
                      <div
                        className="bg-slate-500"
                        style={{ width: `${match.pred_draw}%` }}
                      />
                      <div
                        className="bg-sky-500"
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
        <Card className="lg:col-span-5 border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amber-400" />
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
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Selecione o Clube:
                </label>
                <select
                  value={calcClubSlug}
                  onChange={(e) => setCalcClubSlug(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                >
                  {data.standings.map((t) => (
                    <option key={t.club.slug} value={t.club.slug}>
                      {t.position}º {t.club.name} ({t.points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Objetivo / Meta:
                </label>
                <select
                  value={calcTarget}
                  onChange={(e) => {
                    setCalcTarget(e.target.value);
                    setCalcCustomPts(undefined);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Z4">
                    {division === "A"
                      ? "🛡️ Escapar do Z4 (45 pts)"
                      : "🛡️ Permanência Série B (44 pts)"}
                  </option>
                  <option value="SULA">
                    {division === "A"
                      ? "🌎 Sul-Americana (47 pts)"
                      : "📈 Metade Superior (50 pts)"}
                  </option>
                  <option value="G6">
                    {division === "A"
                      ? "⚡ Pré-Libertadores G6 (57 pts)"
                      : "🔥 Briga pelo Acesso Top 6 (60 pts)"}
                  </option>
                  <option value="G4">
                    {division === "A"
                      ? "🏆 Libertadores Direta G4 (62 pts)"
                      : "🚀 Acesso à Série A G4 (64 pts)"}
                  </option>
                  <option value="TITULO">
                    👑 Título ({division === "A" ? "77 pts" : "72 pts"})
                  </option>
                </select>
              </div>
            </div>

            {calcResult && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      Meta: <strong className="text-white">{calcResult.target_label}</strong> (
                      {calcResult.target_points} pts)
                    </p>
                    <p className="text-lg font-extrabold text-white mt-0.5">
                      Precisa somar{" "}
                      <span className="text-amber-400">
                        +{calcResult.points_needed} pontos
                      </span>{" "}
                      em {calcResult.remaining_games} jogos
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
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                    <span className="text-xl font-black text-emerald-400">
                      {calcResult.wins_needed}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-300">
                      Vitórias
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-900 p-2.5">
                    <span className="text-xl font-black text-slate-200">
                      {calcResult.draws_needed}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Empates
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5">
                    <span className="text-xl font-black text-rose-300">
                      {calcResult.losses_allowed}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Derrotas (Margem)
                    </p>
                  </div>
                </div>

                {/* Comparison Bars */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Aproveitamento Exigido na Reta Final:</span>
                      <strong className="text-amber-400">
                        {calcResult.required_aproveitamento}%
                      </strong>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{
                          width: `${Math.min(100, calcResult.required_aproveitamento)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Aproveitamento Atual no Campeonato:</span>
                      <strong className="text-emerald-400">
                        {calcResult.current_aproveitamento}%
                      </strong>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(100, calcResult.current_aproveitamento)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2.5">
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
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-400" />
                <CardTitle className="text-base sm:text-lg">
                  Dificuldade do Calendário Restante (Strength of Schedule — SOS)
                </CardTitle>
              </div>
              <Badge variant="info">Rodadas 33 a 38</Badge>
            </div>
            <CardDescription>
              Quem enfrenta um &ldquo;corredor polonês&rdquo; e quem tem a tabela mais acessível nas 6 rodadas finais (C = Casa, F = Fora, 🔥 = Jogo de 6 Pontos)
            </CardDescription>
          </CardHeader>

          <CardContent className="max-h-[410px] overflow-y-auto">
            <div className="space-y-2">
              {[...activeStandings]
                .sort((a, b) => b.sos_score - a.sos_score)
                .map((team) => {
                  const isFav = team.club.slug === favoriteClubSlug;
                  return (
                    <div
                      key={team.club.slug}
                      className={`flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center sm:justify-between ${
                        isFav
                          ? "border-amber-400/60 bg-amber-500/10"
                          : "border-slate-800/80 bg-slate-950/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-black text-white"
                          style={{ backgroundColor: team.club.primary_color }}
                        >
                          {team.club.short_name}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {team.position}º {team.club.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Índice SOS:{" "}
                            <strong
                              className={
                                team.sos_score >= 60
                                  ? "text-rose-400"
                                  : team.sos_score >= 45
                                  ? "text-amber-300"
                                  : "text-emerald-400"
                              }
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
                            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold ${
                              rem.difficulty === "PEDREIRA"
                                ? "border-rose-500/30 bg-rose-500/15 text-rose-200"
                                : rem.difficulty === "EQUILIBRADO"
                                ? "border-amber-500/30 bg-amber-500/15 text-amber-200"
                                : "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                            }`}
                          >
                            <span className="text-slate-400">R{rem.round}:</span>
                            <span className="font-bold">{rem.opponent_short}</span>
                            <span className="opacity-75">({rem.venue})</span>
                            {rem.is_six_pointer && <span title="Jogo de 6 Pontos">🔥</span>}
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
