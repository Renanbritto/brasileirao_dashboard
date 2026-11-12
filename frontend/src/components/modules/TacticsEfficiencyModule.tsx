"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Target, Clock, Shield, Flame, RefreshCw, Compass } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartTooltipCard,
  ClubMetricTooltip,
} from "@/components/ui/ChartTooltip";
import { ClubCrest } from "@/components/ui/ClubCrest";
import { TacticalPitchMap } from "@/components/ui/TacticalPitchMap";
import { SeasonOverview } from "@/lib/api";

interface TacticsEfficiencyModuleProps {
  data: SeasonOverview;
  division?: "A" | "B";
  year?: number;
  favoriteClubSlug: string;
}

export function TacticsEfficiencyModule({
  data,
  division,
  year,
  favoriteClubSlug,
}: TacticsEfficiencyModuleProps) {
  const [timingMode, setTimingMode] = useState<"scored" | "conceded">("scored");

  const avgXg = useMemo(() => {
    if (data.benchmarks?.avg_xg_per_game) return data.benchmarks.avg_xg_per_game;
    const sum = data.standings.reduce((acc, t) => acc + t.xg_per_game, 0);
    return Number((sum / Math.max(1, data.standings.length)).toFixed(2));
  }, [data]);

  const avgXga = useMemo(() => {
    if (data.benchmarks?.avg_xga_per_game) return data.benchmarks.avg_xga_per_game;
    const sum = data.standings.reduce((acc, t) => acc + t.xga_per_game, 0);
    return Number((sum / Math.max(1, data.standings.length)).toFixed(2));
  }, [data]);

  const { xDomain, yDomain } = useMemo(() => {
    const xVals = data.standings.map((t) => t.xg_per_game);
    const yVals = data.standings.map((t) => t.xga_per_game);
    const minX = Math.max(0.3, Math.floor((Math.min(...xVals, avgXg) - 0.12) * 10) / 10);
    const maxX = Math.ceil((Math.max(...xVals, avgXg) + 0.12) * 10) / 10;
    const minY = Math.max(0.3, Math.floor((Math.min(...yVals, avgXga) - 0.12) * 10) / 10);
    const maxY = Math.ceil((Math.max(...yVals, avgXga) + 0.12) * 10) / 10;
    return {
      xDomain: [minX, maxX] as [number, number],
      yDomain: [minY, maxY] as [number, number],
    };
  }, [data.standings, avgXg, avgXga]);

  const scatterData = useMemo(() => {
    return data.standings.map((t) => ({
      name: t.club.short_name,
      fullName: t.club.name,
      slug: t.club.slug,
      xgPerGame: t.xg_per_game,
      xgaPerGame: t.xga_per_game,
      points: t.points,
      quadrant: t.tactical_quadrant,
      color: t.club.primary_color,
    }));
  }, [data.standings]);

  const overperformanceData = useMemo(() => {
    return [...data.standings]
      .sort((a, b) => b.xg_overperformance - a.xg_overperformance)
      .map((t) => ({
        name: t.club.short_name,
        fullName: t.club.name,
        slug: t.club.slug,
        diff: t.xg_overperformance,
        gf: t.goals_for,
        xg: t.xg_for,
        shotsPerGoal: t.shots_per_goal,
      }));
  }, [data.standings]);

  const reiDosAcrescimos = useMemo(() => {
    return [...data.standings].sort(
      (a, b) => b.goals_85_plus - a.goals_85_plus
    )[0];
  }, [data.standings]);

  const maisLetal = useMemo(() => {
    return [...data.standings].sort(
      (a, b) => a.shots_per_goal - b.shots_per_goal
    )[0];
  }, [data.standings]);

  const muralhaDefensiva = useMemo(() => {
    return [...data.standings].sort(
      (a, b) => b.clean_sheets - a.clean_sheets
    )[0];
  }, [data.standings]);

  const reiDaVirada = useMemo(() => {
    return [...data.standings].sort(
      (a, b) => b.comeback_points - a.comeback_points
    )[0];
  }, [data.standings]);

  function getHeatCellStyle(val: number, isScored: boolean) {
    if (isScored) {
      if (val >= 11) return "bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold dark:bg-emerald-500/40 dark:text-emerald-100 dark:border-emerald-400/50";
      if (val >= 8) return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30";
      if (val >= 5) return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700";
      return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800";
    } else {
      if (val >= 11) return "bg-rose-100 text-rose-900 border-rose-300 font-extrabold dark:bg-rose-500/40 dark:text-rose-100 dark:border-rose-400/50";
      if (val >= 8) return "bg-rose-50 text-rose-800 border-rose-200 font-bold dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/30";
      if (val >= 5) return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700";
      return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top 4 Tactical KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="obsidian-kpi-emerald">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                Ataque Mais Cirúrgico
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-emerald-400">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              {maisLetal?.club.name}
            </p>
            <p className="text-xs text-zinc-400">
              Precisa de apenas{" "}
              <strong className="font-mono text-emerald-300">
                {maisLetal?.shots_per_goal} chutes
              </strong>{" "}
              para marcar 1 gol ({maisLetal?.goals_for} gols em {maisLetal?.xg_for} xG)
            </p>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-sky">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400">
                Muralha Defensiva (Clean Sheets)
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-sky-400">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              {muralhaDefensiva?.club.name} ({muralhaDefensiva?.clean_sheets} jogos)
            </p>
            <p className="text-xs text-zinc-400">
              Saiu sem sofrer gol em{" "}
              <strong className="font-mono text-sky-300">
                {muralhaDefensiva?.clean_sheet_rate}%
              </strong>{" "}
              das partidas ({muralhaDefensiva?.shots_conceded_per_goal} chutes sofridos/gol)
            </p>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-amber">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                Rei dos Acréscimos (85&apos;+)
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              {reiDosAcrescimos?.club.name} ({reiDosAcrescimos?.goals_85_plus} gols)
            </p>
            <p className="text-xs text-zinc-400">
              Marcou{" "}
              <strong className="font-mono text-amber-300">
                {reiDosAcrescimos?.goals_76_90} gols
              </strong>{" "}
              nos 15 minutos finais (76&apos;–90+&apos;)
            </p>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-purple">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400">
                Poder de Reação (Viradas)
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-purple-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              {reiDaVirada?.club.name} (+{reiDaVirada?.comeback_points} pts)
            </p>
            <p className="text-xs text-zinc-400">
              Pontos conquistados após sair atrás no placar (desperdiçou{" "}
              {reiDaVirada?.points_dropped_leading} pts vencendo)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Tático no Gramado: Por Onde Atacam & Por Onde Mais Tomam Gol */}
      <Card className="obsidian-glass border border-white/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base sm:text-lg">
              Mapa Tático no Gramado — Por Onde Mais Atacam & Por Onde Tomam Gol
            </CardTitle>
          </div>
          <CardDescription>
            Visualização geoespacial das vias de construção ofensiva, zonas de finalização na área e setores de fragilidade defensiva
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <TacticalPitchMap
            teams={data.standings}
            favoriteClubSlug={favoriteClubSlug}
          />
        </CardContent>
      </Card>

      {/* Main Row: Quadrante Tático (xG vs xGA) + Overperformance xG */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Scatter Plot 4 Quadrants */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Quadrante Tático: Criação Ofensiva (xG/Jogo) × Solidez Defensiva (xGA/Jogo)
            </CardTitle>
            <CardDescription>
              Eixo X: Gols Esperados Criados por Jogo (maior = mais volume ofensivo) | Eixo Y Invertido: Gols Esperados Sofridos (topo = defesa mais sólida)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 25, bottom: 15, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="xgPerGame"
                    name="xG Criado / Jogo"
                    domain={xDomain}
                    stroke="#94a3b8"
                    fontSize={11}
                    label={{
                      value: "Volume Ofensivo (xG Pró / Jogo) →",
                      position: "bottom",
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="xgaPerGame"
                    name="xGA Sofrido / Jogo"
                    reversed
                    domain={yDomain}
                    stroke="#94a3b8"
                    fontSize={11}
                    label={{
                      value: "← Defesa Mais Sólida (Menor xGA)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                  />
                  <ZAxis type="number" dataKey="points" range={[90, 260]} />
                  <Tooltip
                    cursor={{ stroke: "#64748b", strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <ChartTooltipCard className="min-w-[215px]">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-white/10">
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                {d.name}
                              </p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {d.fullName}
                              </p>
                            </div>
                            <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-extrabold text-slate-800 dark:bg-white/10 dark:text-white">
                              {d.points} pts
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-[11px]">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-600 dark:text-zinc-300">
                                xG Pró / Jogo:
                              </span>
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                {d.xgPerGame}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-600 dark:text-zinc-300">
                                xGA Contra / Jogo:
                              </span>
                              <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                                {d.xgaPerGame}
                              </span>
                            </div>
                            <div className="pt-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                              Perfil:{" "}
                              <strong className="text-slate-800 dark:text-zinc-200">
                                {d.quadrant}
                              </strong>
                            </div>
                          </div>
                        </ChartTooltipCard>
                      );
                    }}
                  />
                  <ReferenceLine
                    x={avgXg}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: `Média Ataque (${avgXg.toFixed(2)})`,
                      fill: "#64748b",
                      fontSize: 10,
                    }}
                  />
                  <ReferenceLine
                    y={avgXga}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: `Média Defesa (${avgXga.toFixed(2)})`,
                      fill: "#64748b",
                      fontSize: 10,
                    }}
                  />
                  <Scatter name="Clubes" data={scatterData}>
                    {scatterData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          entry.slug === favoriteClubSlug
                            ? "#fbbf24"
                            : entry.xgPerGame >= avgXg && entry.xgaPerGame <= avgXga
                            ? "#10b981"
                            : entry.xgaPerGame <= avgXga
                            ? "#38bdf8"
                            : entry.xgPerGame >= avgXg
                            ? "#f59e0b"
                            : "#f43f5e"
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overperformance xG (Gols Reais - xG) */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Eficiência de Finalização (Gols Reais − xG Esperado)
            </CardTitle>
            <CardDescription>
              Verde = letalidade acima do esperado | Vermelho = desperdiça muitas chances claras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overperformanceData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    width={38}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.06)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <ClubMetricTooltip
                          shortName={d.name}
                          fullName={d.fullName}
                          badgeText={`${d.diff > 0 ? "+" : ""}${d.diff} gols`}
                          isPositive={d.diff >= 0}
                          isFavorite={d.slug === favoriteClubSlug}
                          rows={[
                            {
                              label: "Gols Reais vs. xG",
                              value: `${d.gf} Gols / ${d.xg} xG`,
                            },
                            {
                              label: "Eficiência de Chute",
                              value: `${d.shotsPerGoal} chutes/gol`,
                            },
                          ]}
                        />
                      );
                    }}
                  />
                  <ReferenceLine x={0} stroke="#475569" />
                  <Bar dataKey="diff" radius={[0, 4, 4, 0]}>
                    {overperformanceData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          entry.slug === favoriteClubSlug
                            ? "#fbbf24"
                            : entry.diff >= 0
                            ? "#10b981"
                            : "#f43f5e"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relógio do Gol (Heatmap de Minutagem) & Impacto de Troca de Técnico */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Relógio do Gol — Heatmap de Minutagem (0&apos; a 90+&apos;)
                </CardTitle>
                <CardDescription>
                  Distribuição de gols por janela de 15 minutos + coluna especial do &ldquo;Apagar das Luzes&rdquo; (85&apos;+)
                </CardDescription>
              </div>

              <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-950">
                <button
                  onClick={() => setTimingMode("scored")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    timingMode === "scored"
                      ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Gols Marcados (Pró)
                </button>
                <button
                  onClick={() => setTimingMode("conceded")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    timingMode === "conceded"
                      ? "bg-rose-600 text-white shadow-sm dark:bg-rose-500 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Gols Sofridos (Contra)
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="max-h-[420px] overflow-y-auto">
            <div className="grid grid-cols-9 gap-1.5 text-center text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-800">
              <div className="col-span-2 text-left pl-2">Clube</div>
              <div>0-15&apos;</div>
              <div>16-30&apos;</div>
              <div>31-45+&apos;</div>
              <div>46-60&apos;</div>
              <div>61-75&apos;</div>
              <div>76-90+&apos;</div>
              <div className="text-amber-400">85&apos;+</div>
            </div>

            <div className="mt-2 space-y-1.5">
              {data.standings.map((t) => {
                const isScored = timingMode === "scored";
                const b = isScored
                  ? [
                      t.goals_0_15,
                      t.goals_16_30,
                      t.goals_31_45,
                      t.goals_46_60,
                      t.goals_61_75,
                      t.goals_76_90,
                    ]
                  : [
                      t.ga_0_15,
                      t.ga_16_30,
                      t.ga_31_45,
                      t.ga_46_60,
                      t.ga_61_75,
                      t.ga_76_90,
                    ];
                const late85 = isScored ? t.goals_85_plus : t.ga_85_plus;
                const isFav = t.club.slug === favoriteClubSlug;

                return (
                  <div
                    key={t.club.slug}
                    className={`grid grid-cols-9 items-center gap-1.5 rounded-lg p-1 text-center text-xs ${
                      isFav ? "bg-amber-500/15 ring-1 ring-amber-400/50" : ""
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-2 text-left pl-1">
                      <ClubCrest club={t.club} size="xs" />
                      <span className="truncate font-semibold text-slate-900 dark:text-slate-200">
                        {t.club.name}
                      </span>
                    </div>
                    {b.map((val, i) => (
                      <div
                        key={i}
                        className={`rounded border py-1.5 text-xs ${getHeatCellStyle(
                          val,
                          isScored
                        )}`}
                      >
                        {val}
                      </div>
                    ))}
                    <div className="rounded border border-amber-400 bg-amber-100 py-1.5 font-extrabold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300">
                      {late85}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Efeito Troca de Técnico & Disciplina */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-base sm:text-lg">
                Efeito &ldquo;Fato Novo&rdquo; (Troca de Técnico)
              </CardTitle>
            </div>
            <CardDescription>
              Comparativo de aproveitamento antes vs. depois da mudança de comando técnico na temporada
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5 max-h-[420px] overflow-y-auto">
            {(() => {
              const coachChangedTeams = data.standings
                .filter((t) => t.coach_changes > 0)
                .sort(
                  (a, b) =>
                    b.aprov_after_coach -
                    b.aprov_before_coach -
                    (a.aprov_after_coach - a.aprov_before_coach)
                );

              if (coachChangedTeams.length === 0) {
                return (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400">
                    Nenhuma troca de comando técnico registrada nesta temporada.
                  </div>
                );
              }

              return coachChangedTeams.map((t) => {
                const diff = +(
                  t.aprov_after_coach - t.aprov_before_coach
                ).toFixed(1);
                const isFav = t.club.slug === favoriteClubSlug;
                return (
                  <div
                    key={t.club.slug}
                    className={`rounded-xl border p-3 shadow-sm ${
                      isFav
                        ? "border-amber-400/50 bg-amber-500/10"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ClubCrest club={t.club} size="sm" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t.club.name}
                        </span>
                      </div>
                      <Badge variant={diff >= 0 ? "default" : "destructive"}>
                        {diff > 0 ? `+${diff}%` : `${diff}%`} pós-troca
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Antes: {t.aprov_before_coach}%</span>
                      <span>→</span>
                      <span
                        className={`font-semibold ${
                          diff >= 0
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        Depois: {t.aprov_after_coach}%
                      </span>
                      <span>
                        ({t.coach_changes}x {t.coach_changes === 1 ? "troca" : "trocas"})
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

