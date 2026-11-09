"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeasonOverview } from "@/lib/api";

interface RoundsTurnsModuleProps {
  data: SeasonOverview;
  division: "A" | "B";
  favoriteClubSlug: string;
}

type BumpFilter = "top6" | "z6" | "swings" | "custom";

export function RoundsTurnsModule({
  data,
  division,
  favoriteClubSlug,
}: RoundsTurnsModuleProps) {
  const [bumpFilter, setBumpFilter] = useState<BumpFilter>("top6");

  // Select clubs to display on Bump Chart so it stays super legible
  const bumpTeams = useMemo(() => {
    const all = data.standings;
    let selected = all.slice(0, 6);
    if (bumpFilter === "z6") {
      selected = all.slice(14, 20);
    } else if (bumpFilter === "swings") {
      selected = [...all]
        .sort((a, b) => Math.abs(b.delta_turn_aprov) - Math.abs(a.delta_turn_aprov))
        .slice(0, 6);
    }
    if (
      favoriteClubSlug &&
      !selected.some((t) => t.club.slug === favoriteClubSlug)
    ) {
      const fav = all.find((t) => t.club.slug === favoriteClubSlug);
      if (fav) selected = [fav, ...selected.slice(0, 5)];
    }
    return selected;
  }, [data.standings, bumpFilter, favoriteClubSlug]);

  // Transform round progression into Recharts array [{ round: 1, PAL: 2, FLA: 1, ... }]
  const bumpChartData = useMemo(() => {
    const roundsCount = data.season.current_round;
    const rows: Record<string, number>[] = [];
    for (let r = 1; r <= roundsCount; r++) {
      const obj: Record<string, number> = { round: r };
      bumpTeams.forEach((t) => {
        const pt = t.round_progression.find((p) => p.round === r);
        obj[t.club.short_name] = pt ? pt.position : t.position;
      });
      rows.push(obj);
    }
    return rows;
  }, [bumpTeams, data.season.current_round]);

  // Turno Delta sorted (Rei do Returno vs Cavalo Paraguaio)
  const turnDeltaData = useMemo(() => {
    return [...data.standings]
      .sort((a, b) => b.delta_turn_aprov - a.delta_turn_aprov)
      .map((t) => ({
        name: t.club.short_name,
        fullName: t.club.name,
        slug: t.club.slug,
        aprov1: t.aprov_turn_1,
        aprov2: t.aprov_turn_2,
        rank1: t.rank_turn_1,
        rank2: t.rank_turn_2,
        delta: t.delta_turn_aprov,
      }));
  }, [data.standings]);

  const reiDoReturno = turnDeltaData[0];
  const cavaloParaguaio = turnDeltaData[turnDeltaData.length - 1];

  // Robin Hood sorted
  const robinHoodList = useMemo(() => {
    return [...data.standings].sort(
      (a, b) => b.robin_hood_index - a.robin_hood_index
    );
  }, [data.standings]);

  return (
    <div className="space-y-6">
      {/* Highlight Cards: Rei do Returno, Cavalo Paraguaio, Robin Hood */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                🚀 Rei do Returno (Maior Arrancada)
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-xl font-black text-white">
              {reiDoReturno?.fullName}{" "}
              <span className="text-emerald-400">
                (+{reiDoReturno?.delta}% aprov.)
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Saltou de <strong>{reiDoReturno?.aprov1}%</strong> ({reiDoReturno?.rank1}º no 1º turno) para{" "}
              <strong className="text-emerald-300">{reiDoReturno?.aprov2}%</strong> ({reiDoReturno?.rank2}º no 2º turno)
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-500/30 bg-gradient-to-br from-slate-900 to-rose-950/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                📉 Índice &ldquo;Cavalo Paraguaio&rdquo; (Maior Queda)
              </span>
              <TrendingDown className="h-4 w-4 text-rose-400" />
            </div>
            <p className="mt-2 text-xl font-black text-white">
              {cavaloParaguaio?.fullName}{" "}
              <span className="text-rose-400">
                ({cavaloParaguaio?.delta}% aprov.)
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Caiu de <strong>{cavaloParaguaio?.aprov1}%</strong> ({cavaloParaguaio?.rank1}º no 1º turno) para{" "}
              <strong className="text-rose-300">{cavaloParaguaio?.aprov2}%</strong> ({cavaloParaguaio?.rank2}º no 2º turno)
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                🏹 Clube &ldquo;Robin Hood&rdquo; da Edição
              </span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 text-xl font-black text-white">
              {robinHoodList[0]?.club.name}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Rende <strong>{robinHoodList[0]?.aprov_vs_g6}%</strong> contra o G6, mas apenas{" "}
              <strong>{robinHoodList[0]?.aprov_vs_z4}%</strong> contra times do Z4!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bump Chart: Evolução Rodada a Rodada */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">
                🏇 Corrida por Rodada (Bump Chart — 1ª à {data.season.current_round}ª Rodada)
              </CardTitle>
              <CardDescription>
                Trajetória de posição rodada a rodada (1º no topo, 20º na base). A linha tracejada marca a virada do 1º para o 2º turno (Rodada 19).
              </CardDescription>
            </div>

            <div className="inline-flex flex-wrap rounded-lg border border-slate-800 bg-slate-950 p-1">
              {[
                { key: "top6", label: "🏆 Pelotão de Elite (Top 6)" },
                { key: "z6", label: "🚨 Drama do Z4 (15º–20º)" },
                { key: "swings", label: "🎢 Maiores Oscilações (Turnos)" },
              ].map((b) => (
                <button
                  key={b.key}
                  onClick={() => setBumpFilter(b.key as BumpFilter)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    bumpFilter === b.key
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[370px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={bumpChartData}
                margin={{ top: 15, right: 25, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="round"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `R${v}`}
                />
                <YAxis
                  reversed
                  domain={[1, 20]}
                  ticks={[1, 4, 6, 12, 16, 17, 20]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `${v}º`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(r) => `Rodada ${r}`}
                />
                <ReferenceLine
                  x={19}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: "Fim 1º Turno (R19)",
                    fill: "#f59e0b",
                    fontSize: 10,
                    position: "top",
                  }}
                />
                <ReferenceLine y={4} stroke="#10b981" strokeDasharray="2 2" />
                <ReferenceLine y={16.5} stroke="#f43f5e" strokeDasharray="2 2" />
                {bumpTeams.map((t, idx) => {
                  const palette = [
                    "#10b981",
                    "#38bdf8",
                    "#f59e0b",
                    "#f43f5e",
                    "#a855f7",
                    "#eab308",
                  ];
                  const isFav = t.club.slug === favoriteClubSlug;
                  return (
                    <Line
                      key={t.club.short_name}
                      type="monotone"
                      dataKey={t.club.short_name}
                      name={`${t.club.name} (${t.position}º)`}
                      stroke={isFav ? "#fbbf24" : palette[idx % palette.length]}
                      strokeWidth={isFav ? 4 : 2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid: 1º vs 2º Turno Diverging Chart + Curva do Número Mágico */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 1º Turno vs 2º Turno */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-base sm:text-lg">
                1º Turno vs. 2º Turno — Variação de Aproveitamento (Δ%)
              </CardTitle>
            </div>
            <CardDescription>
              Verde = subiu de produção pós-janela de meio de ano (&ldquo;Rei do Returno&rdquo;) | Vermelho = perdeu fôlego no returno (&ldquo;Cavalo Paraguaio&rdquo;)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={turnDeltaData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, _name, props) => [
                      `${value > 0 ? "+" : ""}${value}% (1ºT: ${props.payload.aprov1}% -> 2ºT: ${props.payload.aprov2}%)`,
                      props.payload.fullName,
                    ]}
                  />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                    {turnDeltaData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.slug === favoriteClubSlug
                            ? "#fbbf24"
                            : entry.delta >= 0
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

        {/* Curva Histórica do Número Mágico (45 pts / 64 pts) */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
              <CardTitle className="text-base sm:text-lg">
                Curva Histórica do &ldquo;Número Mágico&rdquo; (2006–Presente)
              </CardTitle>
            </div>
            <CardDescription>
              Probabilidade histórica real de escapar do Z4 ({data.season.magic_escape_z4_pts} pts) e conquistar vaga no G4 ({data.season.magic_g4_pts} pts) na Série {division}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.magic_curves.z4_escape}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="points"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${v} pts`}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="escape_prob"
                    name="% Permanência (Salvo)"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.25}
                  />
                  <Area
                    type="monotone"
                    dataKey="relegated_prob"
                    name="% Risco de Queda"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  🛡️ Fuga Segura do Z4 (Série {division}):
                </span>
                <Badge variant="default">
                  {data.season.magic_escape_z4_pts} pontos (98,2% salvos)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  🚀 {division === "A" ? "Libertadores G4:" : "Acesso Garantido Série A:"}
                </span>
                <Badge variant="info">
                  {data.season.magic_g4_pts} pontos (95,8% garantidos)
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Na era dos pontos corridos com 20 clubes, apenas 2 clubes caíram na Série A somando 45 pontos (Coritiba 2009 e Internacional 2016/Goiás).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
