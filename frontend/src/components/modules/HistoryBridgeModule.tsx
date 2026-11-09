"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  History,
  Repeat,
  ShieldCheck,
  TrendingDown,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HistoryBridgeData, fetchHistoryBridge } from "@/lib/api";

interface HistoryBridgeModuleProps {
  favoriteClubSlug: string;
}

export function HistoryBridgeModule({
  favoriteClubSlug,
}: HistoryBridgeModuleProps) {
  const [bridge, setBridge] = useState<HistoryBridgeData | null>(null);

  useEffect(() => {
    fetchHistoryBridge()
      .then(setBridge)
      .catch(() => {});
  }, []);

  if (!bridge) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-slate-400">
          Carregando série histórica da Ponte Série A ↔ Série B (2003–Presente)...
        </CardContent>
      </Card>
    );
  }

  const years = [
    2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 Historical Insights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="obsidian-kpi-amber">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                🎢 Maior Índice Ioiô (Gangorra)
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-amber-400">
                <Repeat className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              {bridge.yo_yo_ranking[0]?.name} (
              <span className="font-mono">{bridge.yo_yo_ranking[0]?.yo_yo_index}</span> transições)
            </p>
            <p className="text-xs text-zinc-400">
              {bridge.yo_yo_ranking[0]?.promotions_to_a} acessos e{" "}
              {bridge.yo_yo_ranking[0]?.relegations_to_b} quedas nos pontos corridos
            </p>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-emerald">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                👑 Sobrevivência do Campeão da B
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              <span className="font-mono text-emerald-400">76,0%</span> permanecem na Série A
            </p>
            <p className="text-xs text-zinc-400">
              Média de <strong className="font-mono text-zinc-200">48,4 pts</strong> (12º lugar) no ano seguinte ao título da B
            </p>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-rose">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-400">
                ⚠️ O Drama do 4º Colocado da B
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-rose-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              <span className="font-mono text-rose-400">59,0%</span> caem de volta no 1º ano
            </p>
            <p className="text-xs text-zinc-400">
              Subir em 4º lugar rende média de apenas <strong className="font-mono text-zinc-200">40,6 pts</strong> na Série A
            </p>
          </CardContent>
        </Card>

        <Card className="obsidian-kpi-sky">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400">
                🔄 Taxa de &ldquo;Bate e Volta&rdquo;
              </span>
              <div className="obsidian-well flex h-8 w-8 items-center justify-center rounded-xl text-sky-400">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2.5 text-lg font-extrabold text-white">
              Apenas <span className="font-mono text-sky-400">36,5%</span> voltam de imediato
            </p>
            <p className="text-xs text-zinc-400">
              63,5% dos rebaixados da Série A levam 2+ anos para subir (ou caem à C)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Matrix: Trajetória de Divisão (Série A <-> Série B <-> Série C) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-base sm:text-lg">
                Matriz de Trajetória Entre Divisões (2015–2026) — A Ponte Série A ↔ B ↔ C
              </CardTitle>
            </div>
            <Badge variant="default">Efeito Gangorra</Badge>
          </div>
          <CardDescription>
            Acompanhe ano a ano a divisão e colocação final de cada clube: Verde = Série A | Âmbar = Série B | Vermelho = Série C
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-14 gap-1.5 pb-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 text-center">
              <div className="col-span-2 text-left pl-2">Clube (Ioiô)</div>
              {years.map((yr) => (
                <div key={yr}>{yr}</div>
              ))}
            </div>

            <div className="mt-2 space-y-1.5">
              {bridge.trajectories.map((row) => {
                const isFav = row.club.slug === favoriteClubSlug;
                return (
                  <div
                    key={row.club.slug}
                    className={`grid grid-cols-14 items-center gap-1.5 rounded-lg p-1 text-center text-xs ${
                      isFav ? "bg-amber-500/15 ring-1 ring-amber-400/50" : ""
                    }`}
                  >
                    <div className="col-span-2 flex items-center justify-between pr-2 text-left pl-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-black text-white"
                          style={{ backgroundColor: row.club.primary_color }}
                        >
                          {row.club.short_name}
                        </span>
                        <span className="truncate font-bold text-white">
                          {row.club.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-amber-400">
                        {row.club.yo_yo_index}x
                      </span>
                    </div>

                    {years.map((yr) => {
                      const cell = row.history.find((h) => h.year === yr);
                      if (!cell) {
                        return (
                          <div
                            key={yr}
                            className="rounded border border-slate-800 bg-slate-900 py-1.5 text-[10px] text-slate-500"
                          >
                            -
                          </div>
                        );
                      }
                      const badgeStyle =
                        cell.division === "A"
                          ? cell.outcome === "CAMPEAO"
                            ? "border-emerald-400 bg-emerald-500/35 text-white font-black"
                            : cell.outcome === "REBAIXADO"
                            ? "border-rose-500/50 bg-rose-500/20 text-rose-200 font-bold"
                            : "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                          : cell.division === "B"
                          ? cell.outcome === "ACESSO"
                            ? "border-sky-400 bg-sky-500/30 text-sky-100 font-extrabold"
                            : "border-amber-500/30 bg-amber-500/15 text-amber-200"
                          : "border-rose-500/40 bg-rose-950/60 text-rose-300";

                      return (
                        <div
                          key={yr}
                          title={`${yr}: Série ${cell.division} - ${cell.position}º lugar (${cell.points} pts) [${cell.outcome}]`}
                          className={`rounded border py-1 text-[10px] ${badgeStyle}`}
                        >
                          <span>{cell.division}</span>{" "}
                          <span className="opacity-85">({cell.position}º)</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Row: Sobrevivência dos Promovidos (1º ao 4º da B) + Destino dos Rebaixados ("Bate e Volta") */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Survival of Promoted Clubs by Seed */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Sobrevivência dos Recém-Promovidos na Série A (Por Posição de Acesso na B)
            </CardTitle>
            <CardDescription>
              Subir como Campeão da Série B vs. subir em 4º lugar faz diferença? Os dados históricos de 20 anos provam que sim!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bridge.promoted_survival_by_seed}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="seed_label"
                    stroke="#94a3b8"
                    fontSize={11}
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
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="survival_rate_a"
                    name="% Permanência na Série A"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="immediate_relegation_rate"
                    name="% Queda Imediata de Volta à B"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bridge.promoted_survival_by_seed.map((s) => (
                <div
                  key={s.promoted_position}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 text-xs"
                >
                  <div className="flex justify-between font-bold text-white">
                    <span>{s.seed_label}</span>
                    <span className="text-emerald-400">
                      Média: {s.avg_points_in_a} pts ({s.avg_finish_in_a}º)
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Exemplos: {s.notable_examples}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relegated Clubs Destiny + Historical Cutoffs */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                O Peso da Queda: Destino dos Rebaixados da Série A (2006–2025)
              </CardTitle>
              <CardDescription>
                O que acontece com os 4 clubes que caem para a Série B a cada temporada?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bridge.relegated_destiny.map((d) => (
                <div
                  key={d.category}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      {d.category}
                    </span>
                    <span
                      className="font-black"
                      style={{ color: d.color }}
                    >
                      {d.percentage}% ({d.count} clubes)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${d.percentage}%`,
                        backgroundColor: d.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Evolução da Nota de Corte (Título, G4, Acesso B e Z4)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[195px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bridge.historical_cutoffs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                    <YAxis
                      domain={[35, 92]}
                      stroke="#94a3b8"
                      fontSize={10}
                      tickFormatter={(v) => `${v}p`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "10px",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line
                      type="monotone"
                      dataKey="champ_pts"
                      name="Campeão Série A"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="serie_b_access_pts"
                      name="Corte Acesso B (4º)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="z4_escape_pts"
                      name="Salvo Z4 (16º)"
                      stroke="#f43f5e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

