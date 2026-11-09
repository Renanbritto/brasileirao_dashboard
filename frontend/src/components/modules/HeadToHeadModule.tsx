"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { Swords, Sparkles, History, ArrowLeftRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClubCrest } from "@/components/ui/ClubCrest";
import { SeasonOverview, H2HAnalysis, fetchHeadToHead } from "@/lib/api";

interface HeadToHeadModuleProps {
  data: SeasonOverview;
  division: "A" | "B";
  year: number;
  favoriteClubSlug: string;
}

export function HeadToHeadModule({
  data,
  division,
  year,
  favoriteClubSlug,
}: HeadToHeadModuleProps) {
  const [homeSlug, setHomeSlug] = useState<string>(
    favoriteClubSlug || data.standings[0]?.club.slug || "palmeiras"
  );
  const [awaySlug, setAwaySlug] = useState<string>(
    data.standings[1]?.club.slug || "flamengo"
  );
  const [h2h, setH2h] = useState<H2HAnalysis | null>(null);

  useEffect(() => {
    const first = data.standings[0]?.club.slug || "";
    const second = data.standings[1]?.club.slug || "";
    if (
      favoriteClubSlug &&
      data.standings.some((t) => t.club.slug === favoriteClubSlug)
    ) {
      setHomeSlug(favoriteClubSlug);
      setAwaySlug(first === favoriteClubSlug ? second : first);
    } else {
      setHomeSlug(first);
      setAwaySlug(second);
    }
  }, [data, division, year, favoriteClubSlug]);

  useEffect(() => {
    if (!homeSlug || !awaySlug) return;
    fetchHeadToHead(division, year, homeSlug, awaySlug)
      .then(setH2h)
      .catch(() => {});
  }, [division, year, homeSlug, awaySlug]);

  function swapClubs() {
    setHomeSlug(awaySlug);
    setAwaySlug(homeSlug);
  }

  return (
    <div className="space-y-6">
      {/* Matchup Control Bar */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <CardContent className="p-5 pt-5">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Home Club Selector */}
            <div className="flex flex-1 items-center gap-3 w-full">
              <ClubCrest club={h2h?.home_team.club} size="lg" />
              <div className="flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Mandante (Em Casa)
                </span>
                <select
                  value={homeSlug}
                  onChange={(e) => setHomeSlug(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-extrabold text-white focus:border-emerald-500 focus:outline-none"
                >
                  {data.standings.map((t) => (
                    <option key={t.club.slug} value={t.club.slug}>
                      {t.position}º {t.club.name} ({t.points} pts • Casa:{" "}
                      {t.aprov_home}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex flex-col items-center">
              <Button variant="outline" size="sm" onClick={swapClubs}>
                <ArrowLeftRight className="h-4 w-4 text-emerald-400" />
                Inverter Mando
              </Button>
            </div>

            {/* Away Club Selector */}
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="flex-1 text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Visitante (Fora de Casa)
                </span>
                <select
                  value={awaySlug}
                  onChange={(e) => setAwaySlug(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-extrabold text-white focus:border-sky-500 focus:outline-none"
                >
                  {data.standings.map((t) => (
                    <option key={t.club.slug} value={t.club.slug}>
                      {t.position}º {t.club.name} ({t.points} pts • Fora:{" "}
                      {t.aprov_away}%)
                    </option>
                  ))}
                </select>
              </div>
              <ClubCrest club={h2h?.away_team.club} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {h2h && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Termômetro de Poisson & Placares Exatos */}
          <Card className="lg:col-span-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <CardTitle className="text-base sm:text-lg">
                    Simulador de Poisson — Probabilidades & Placares
                  </CardTitle>
                </div>
                <Badge variant="default">Modelo Bivariado</Badge>
              </div>
              <CardDescription>
                Cruza a Força de Ataque/Defesa em Casa do {h2h.home_team.club.name} com a Força Visitante do {h2h.away_team.club.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Expected Goals Strip */}
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <div>
                  <span className="text-xs text-slate-400">
                    xG Esperado ({h2h.home_team.club.short_name})
                  </span>
                  <p className="text-2xl font-black text-emerald-400">
                    {h2h.poisson.expected_home_goals}
                  </p>
                </div>
                <div className="border-x border-slate-800">
                  <span className="text-xs text-slate-400">
                    Ambas Marcam / +2.5 Gols
                  </span>
                  <p className="text-sm font-bold text-amber-300 mt-1.5">
                    BTTS: {h2h.poisson.prob_btts}% • Over 2.5:{" "}
                    {h2h.poisson.prob_over_25}%
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">
                    xG Esperado ({h2h.away_team.club.short_name})
                  </span>
                  <p className="text-2xl font-black text-sky-400">
                    {h2h.poisson.expected_away_goals}
                  </p>
                </div>
              </div>

              {/* 1X2 Probability Bar */}
              <div>
                <div className="mb-1.5 flex justify-between text-xs font-bold">
                  <span className="text-emerald-400">
                    Vitória {h2h.home_team.club.name}: {h2h.poisson.prob_home_win}%
                  </span>
                  <span className="text-slate-300">
                    Empate: {h2h.poisson.prob_draw}%
                  </span>
                  <span className="text-sky-400">
                    Vitória {h2h.away_team.club.name}: {h2h.poisson.prob_away_win}%
                  </span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${h2h.poisson.prob_home_win}%` }}
                  />
                  <div
                    className="bg-slate-500 transition-all"
                    style={{ width: `${h2h.poisson.prob_draw}%` }}
                  />
                  <div
                    className="bg-sky-500 transition-all"
                    style={{ width: `${h2h.poisson.prob_away_win}%` }}
                  />
                </div>
              </div>

              {/* Top 6 Most Likely Scorelines */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Top 6 Placares Exatos Mais Prováveis
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {h2h.poisson.top_scorelines.map((sc, i) => (
                    <div
                      key={sc.score}
                      className={`rounded-xl border p-3 text-center ${
                        i === 0
                          ? "border-emerald-500/50 bg-emerald-500/15"
                          : "border-slate-800 bg-slate-950/60"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        #{i + 1} Mais Provável
                      </span>
                      <p className="mt-0.5 text-lg font-black text-white">
                        {h2h.home_team.club.short_name} {sc.score}{" "}
                        {h2h.away_team.club.short_name}
                      </p>
                      <span className="text-xs font-bold text-emerald-400">
                        {sc.probability}% de chance
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs text-slate-300">
                {h2h.poisson.turf_advantage_note}
              </p>
            </CardContent>
          </Card>

          {/* Right: 6-Axis Radar Chart + Historical Tabus */}
          <div className="space-y-6 lg:col-span-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-sky-400" />
                  <CardTitle className="text-base sm:text-lg">
                    Radar Comparativo de 6 Eixos (&ldquo;Tale of the Tape&rdquo;)
                  </CardTitle>
                </div>
                <CardDescription>
                  Índices normalizados (0–100) comparando o momento e a força estrutural das duas equipes
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-[290px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={h2h.radar}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: "#cbd5e1", fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: "#64748b", fontSize: 9 }}
                      />
                      <Radar
                        name={h2h.home_team.club.name}
                        dataKey="home"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.35}
                      />
                      <Radar
                        name={h2h.away_team.club.name}
                        dataKey="away"
                        stroke="#38bdf8"
                        fill="#38bdf8"
                        fillOpacity={0.35}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Historical H2H & Tabu Card */}
            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-amber-400" />
                  <CardTitle className="text-base">
                    Histórico nos Pontos Corridos & Freguesias (2003–Presente)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                    <span className="text-lg font-black text-white">
                      {h2h.history_h2h.total_matches}
                    </span>
                    <p className="text-[10px] text-slate-400">Jogos</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex flex-col items-center">
                    <span className="text-lg font-black text-emerald-400">
                      {h2h.history_h2h.home_club_wins}
                    </span>
                    <div className="mt-1 flex items-center gap-1">
                      <ClubCrest club={h2h.home_team.club} size="xs" />
                      <p className="text-[10px] text-slate-300">
                        Vit. {h2h.home_team.club.short_name}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                    <span className="text-lg font-black text-slate-300">
                      {h2h.history_h2h.draws}
                    </span>
                    <p className="text-[10px] text-slate-400">Empates</p>
                  </div>
                  <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2.5 flex flex-col items-center">
                    <span className="text-lg font-black text-sky-400">
                      {h2h.history_h2h.away_club_wins}
                    </span>
                    <div className="mt-1 flex items-center gap-1">
                      <ClubCrest club={h2h.away_team.club} size="xs" />
                      <p className="text-[10px] text-slate-300">
                        Vit. {h2h.away_team.club.short_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 space-y-1">
                  <p className="font-semibold text-amber-300">
                    Tabu Vigente: {h2h.history_h2h.tabu_summary}
                  </p>
                  <p className="text-slate-300">
                    Maior Goleada: <strong>{h2h.history_h2h.biggest_rout}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

