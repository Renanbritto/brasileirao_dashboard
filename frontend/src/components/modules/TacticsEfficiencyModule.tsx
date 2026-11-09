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
import { Target, Clock, Shield, Flame, RefreshCw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeasonOverview } from "@/lib/api";

interface TacticsEfficiencyModuleProps {
  data: SeasonOverview;
  favoriteClubSlug: string;
}

export function TacticsEfficiencyModule({
  data,
  favoriteClubSlug,
}: TacticsEfficiencyModuleProps) {
  const [timingMode, setTimingMode] = useState<"scored" | "conceded">("scored");

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
      if (val >= 11) return "bg-emerald-500/40 text-emerald-100 font-extrabold border-emerald-400/50";
      if (val >= 8) return "bg-emerald-500/20 text-emerald-200 font-bold border-emerald-500/30";
      if (val >= 5) return "bg-slate-800/80 text-slate-200 border-slate-700";
      return "bg-slate-900/50 text-slate-400 border-slate-800";
    } else {
      if (val >= 11) return "bg-rose-500/40 text-rose-100 font-extrabold border-rose-400/50";
      if (val >= 8) return "bg-rose-500/20 text-rose-200 font-bold border-rose-500/30";
      if (val >= 5) return "bg-slate-800/80 text-slate-200 border-slate-700";
      return "bg-slate-900/50 text-slate-400 border-slate-800";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top 4 Tactical KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-emerald-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400">
                🎯 Ataque Mais Cirúrgico
              </span>
              <Target className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {maisLetal?.club.name}
            </p>
            <p className="text-xs text-slate-400">
              Precisa de apenas{" "}
              <strong className="text-emerald-300">
                {maisLetal?.shots_per_goal} chutes
              </strong>{" "}
              para marcar 1 gol ({maisLetal?.goals_for} gols em {maisLetal?.xg_for} xG)
            </p>
          </CardContent>
        </Card>

        <Card className="border-sky-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-sky-400">
                🧱 Muralha Defensiva (Clean Sheets)
              </span>
              <Shield className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {muralhaDefensiva?.club.name} ({muralhaDefensiva?.clean_sheets} jogos)
            </p>
            <p className="text-xs text-slate-400">
              Saiu sem sofrer gol em{" "}
              <strong className="text-sky-300">
                {muralhaDefensiva?.clean_sheet_rate}%
              </strong>{" "}
              das partidas ({muralhaDefensiva?.shots_conceded_per_goal} chutes sofridos/gol)
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-400">
                ⏱️ Rei dos Acréscimos (85&apos;+)
              </span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {reiDosAcrescimos?.club.name} ({reiDosAcrescimos?.goals_85_plus} gols)
            </p>
            <p className="text-xs text-slate-400">
              Marcou{" "}
              <strong className="text-amber-300">
                {reiDosAcrescimos?.goals_76_90} gols
              </strong>{" "}
              nos 15 minutos finais (76&apos;–90+&apos;)
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-400">
                🔥 Poder de Reação (Viradas)
              </span>
              <Flame className="h-4 w-4 text-purple-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {reiDaVirada?.club.name} (+{reiDaVirada?.comeback_points} pts)
            </p>
            <p className="text-xs text-slate-400">
              Pontos conquistados após sair atrás no placar (desperdiçou{" "}
              {reiDaVirada?.points_dropped_leading} pts vencendo)
            </p>
          </CardContent>
        </Card>
      </div>

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
                    domain={[0.8, 2.1]}
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
                    domain={[0.7, 1.9]}
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
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs shadow-xl">
                          <p className="font-bold text-white">
                            {d.fullName} ({d.points} pts)
                          </p>
                          <p className="text-emerald-400">
                            xG Pró/Jogo: {d.xgPerGame}
                          </p>
                          <p className="text-sky-400">
                            xGA Contra/Jogo: {d.xgaPerGame}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-300">
                            Perfil: <strong>{d.quadrant}</strong>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    x={1.38}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: "Média Ataque",
                      fill: "#64748b",
                      fontSize: 10,
                    }}
                  />
                  <ReferenceLine
                    y={1.18}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: "Média Defesa",
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
                            : entry.xgPerGame >= 1.38 && entry.xgaPerGame <= 1.18
                            ? "#10b981"
                            : entry.xgaPerGame <= 1.18
                            ? "#38bdf8"
                            : entry.xgPerGame >= 1.38
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
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                    formatter={(val: number, _n, props) => [
                      `${val > 0 ? "+" : ""}${val} gols (${props.payload.gf} Gols / ${props.payload.xg} xG • ${props.payload.shotsPerGoal} chutes/gol)`,
                      props.payload.fullName,
                    ]}
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
                  ⏱️ Relógio do Gol — Heatmap de Minutagem (0&apos; a 90+&apos;)
                </CardTitle>
                <CardDescription>
                  Distribuição de gols por janela de 15 minutos + coluna especial do &ldquo;Apagar das Luzes&rdquo; (85&apos;+)
                </CardDescription>
              </div>

              <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  onClick={() => setTimingMode("scored")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    timingMode === "scored"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ⚽ Gols Marcados (Pró)
                </button>
                <button
                  onClick={() => setTimingMode("conceded")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    timingMode === "conceded"
                      ? "bg-rose-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🥅 Gols Sofridos (Contra)
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
              <div className="text-amber-400">🔥 85&apos;+</div>
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
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-black text-white"
                        style={{ backgroundColor: t.club.primary_color }}
                      >
                        {t.club.short_name}
                      </span>
                      <span className="truncate font-semibold text-slate-200">
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
                    <div className="rounded border border-amber-500/40 bg-amber-500/15 py-1.5 font-extrabold text-amber-300">
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
            {data.standings
              .filter((t) => t.coach_changes > 0)
              .map((t) => {
                const diff = +(
                  t.aprov_after_coach - t.aprov_before_coach
                ).toFixed(1);
                return (
                  <div
                    key={t.club.slug}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-black text-white"
                          style={{ backgroundColor: t.club.primary_color }}
                        >
                          {t.club.short_name}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {t.club.name}
                        </span>
                      </div>
                      <Badge variant={diff >= 0 ? "default" : "destructive"}>
                        {diff > 0 ? `+${diff}%` : `${diff}%`} pós-troca
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Antes: {t.aprov_before_coach}%</span>
                      <span>→</span>
                      <span className="font-semibold text-emerald-300">
                        Depois: {t.aprov_after_coach}%
                      </span>
                      <span>({t.coach_changes}x trocas)</span>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

