"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Plane, Home, Compass, Users, Clock, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeasonOverview } from "@/lib/api";

interface GeoContextModuleProps {
  data: SeasonOverview;
  favoriteClubSlug: string;
}

export function GeoContextModule({
  data,
  favoriteClubSlug,
}: GeoContextModuleProps) {
  const [selectedSlotClub, setSelectedSlotClub] = useState<string>(
    favoriteClubSlug || data.standings[0]?.club.slug || ""
  );

  const mostTraveled = useMemo(() => {
    return [...data.standings].sort((a, b) => b.travel_km - a.travel_km);
  }, [data.standings]);

  const bestVisitor = useMemo(() => {
    return [...data.standings].sort((a, b) => b.aprov_away - a.aprov_away)[0];
  }, [data.standings]);

  const bestHome = useMemo(() => {
    return [...data.standings].sort((a, b) => b.aprov_home - a.aprov_home)[0];
  }, [data.standings]);

  const highestAttendance = useMemo(() => {
    return [...data.standings].sort(
      (a, b) => b.avg_attendance - a.avg_attendance
    )[0];
  }, [data.standings]);

  const turfChartData = useMemo(() => {
    return [...data.standings].map((t) => ({
      name: t.club.short_name,
      fullName: t.club.name,
      isSyntHost: t.club.turf_type === "Sintético",
      Sintetico: t.aprov_synthetic,
      Natural: t.aprov_natural,
    }));
  }, [data.standings]);

  const slotClubObj = useMemo(() => {
    return (
      data.standings.find((t) => t.club.slug === selectedSlotClub) ||
      data.standings[0]
    );
  }, [data.standings, selectedSlotClub]);

  return (
    <div className="space-y-6">
      {/* Top 4 Geo & Stadium KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-emerald-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400">
                🏰 Fortaleza em Casa (Mandante)
              </span>
              <Home className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {bestHome?.club.name} ({bestHome?.aprov_home}%)
            </p>
            <p className="text-xs text-slate-400">
              {bestHome?.home_wins}V {bestHome?.home_draws}E {bestHome?.home_losses}D no{" "}
              <strong className="text-slate-200">
                {bestHome?.club.stadium_name}
              </strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-sky-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-sky-400">
                ✈️ Visitante Mais Indigesto
              </span>
              <Compass className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {bestVisitor?.club.name} ({bestVisitor?.aprov_away}%)
            </p>
            <p className="text-xs text-slate-400">
              Somou{" "}
              <strong className="text-sky-300">
                {bestVisitor?.away_points} pontos
              </strong>{" "}
              fora de casa ({bestVisitor?.away_wins} vitórias longe de seus domínios)
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-400">
                🌎 Maior Desgaste Aéreo (Viagens)
              </span>
              <Plane className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {mostTraveled[0]?.club.name} (
              {mostTraveled[0]?.travel_km.toLocaleString("pt-BR")} km)
            </p>
            <p className="text-xs text-slate-400">
              Equivalente a{" "}
              <strong className="text-amber-300">
                {(mostTraveled[0]?.travel_km / 40075).toFixed(1)} voltas
              </strong>{" "}
              ao redor da Terra na temporada!
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30">
          <CardContent className="p-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-400">
                🏟️ Maior Média de Público
              </span>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <p className="mt-2 text-lg font-extrabold text-white">
              {highestAttendance?.club.name} (
              {highestAttendance?.avg_attendance.toLocaleString("pt-BR")})
            </p>
            <p className="text-xs text-slate-400">
              Taxa de ocupação de{" "}
              <strong className="text-purple-300">
                {highestAttendance?.occupation_rate}%
              </strong>{" "}
              no {highestAttendance?.club.stadium_name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Row: Dumbbell Chart (Mandante vs Visitante) + Ranking de Quilometragem Aérea */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Dumbbell Visual Comparison */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Gráfico Dumbbell (Halteres) — Aproveitamento Mandante vs. Visitante
            </CardTitle>
            <CardDescription>
              A distância entre a esfera Azul (Fora) e a esfera Verde (Casa) revela o quanto cada clube depende do seu estádio
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5 max-h-[450px] overflow-y-auto pr-2">
            {data.standings.map((t) => {
              const leftVal = Math.min(t.aprov_away, t.aprov_home);
              const rightVal = Math.max(t.aprov_away, t.aprov_home);
              const widthVal = Math.max(2, rightVal - leftVal);
              const isFav = t.club.slug === favoriteClubSlug;

              return (
                <div
                  key={t.club.slug}
                  className={`flex items-center gap-3 rounded-lg p-1.5 ${
                    isFav ? "bg-amber-500/15 ring-1 ring-amber-400/50" : ""
                  }`}
                >
                  <div className="flex w-36 shrink-0 items-center gap-2">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-black text-white"
                      style={{ backgroundColor: t.club.primary_color }}
                    >
                      {t.club.short_name}
                    </span>
                    <span className="truncate text-xs font-semibold text-slate-200">
                      {t.club.name}
                    </span>
                  </div>

                  {/* Dumbbell Track (0% to 100%) */}
                  <div className="relative flex-1 h-6 rounded-full bg-slate-900 border border-slate-800">
                    {/* Connecting Bar */}
                    <div
                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-500/70 to-emerald-500/70"
                      style={{
                        left: `${leftVal}%`,
                        width: `${widthVal}%`,
                      }}
                    />
                    {/* Away Dot */}
                    <div
                      title={`Visitante: ${t.aprov_away}%`}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-5 w-9 items-center justify-center rounded-full bg-sky-500 text-[9px] font-extrabold text-slate-950 shadow"
                      style={{ left: `${t.aprov_away}%` }}
                    >
                      {t.aprov_away}%
                    </div>
                    {/* Home Dot */}
                    <div
                      title={`Mandante: ${t.aprov_home}%`}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-5 w-9 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-extrabold text-slate-950 shadow"
                      style={{ left: `${t.aprov_home}%` }}
                    >
                      {t.aprov_home}%
                    </div>
                  </div>

                  <div className="w-16 text-right text-[11px] font-bold text-slate-400">
                    Δ {t.home_away_gap > 0 ? `+${t.home_away_gap}%` : `${t.home_away_gap}%`}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quilometragem Aérea (Fórmula de Haversine) */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-base sm:text-lg">
                  Mapa de Desgaste Geográfico (Km Voados)
                </CardTitle>
              </div>
              <Badge variant="warning">Fórmula Haversine</Badge>
            </div>
            <CardDescription>
              Distância aérea acumulada (ida e volta) partindo das coordenadas reais do estádio de cada clube
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5 max-h-[450px] overflow-y-auto pr-2">
            {mostTraveled.map((t, idx) => {
              const maxKm = mostTraveled[0]?.travel_km || 60000;
              const pct = Math.min(100, (t.travel_km / maxKm) * 100);
              return (
                <div
                  key={t.club.slug}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold">#{idx + 1}</span>
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-black text-white"
                        style={{ backgroundColor: t.club.primary_color }}
                      >
                        {t.club.short_name}
                      </span>
                      <span className="font-bold text-white">{t.club.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({t.club.city}-{t.club.state_uf})
                      </span>
                    </div>
                    <span className="font-extrabold text-amber-400">
                      {t.travel_km.toLocaleString("pt-BR")} km
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Fora: <strong className="text-sky-300">{t.aprov_away}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Gramado Sintético vs Natural + Fator Horário da Partida */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-base sm:text-lg">
                Fator Piso: Gramado Sintético vs. Gramado Natural (% Aproveitamento)
              </CardTitle>
            </div>
            <CardDescription>
              Comparativo de rendimento em arenas de piso sintético (ex: Allianz Parque, Nilton Santos, Ligga Arena, Arena MRV, Arena Condá) vs. piso natural
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[310px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={turfChartData}
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
                    dataKey="Sintetico"
                    name="% no Gramado Sintético"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="Natural"
                    name="% no Gramado Natural"
                    fill="#38bdf8"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rendimento por Horário do Jogo */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-400" />
                <CardTitle className="text-base sm:text-lg">
                  Rendimento por Horário & Arquibancada
                </CardTitle>
              </div>
              <select
                value={slotClubObj?.club.slug || ""}
                onChange={(e) => setSelectedSlotClub(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-white"
              >
                {data.standings.map((t) => (
                  <option key={t.club.slug} value={t.club.slug}>
                    {t.club.name}
                  </option>
                ))}
              </select>
            </div>
            <CardDescription>
              Aproveitamento do {slotClubObj?.club.name} nas grades de horário tradicionais da TV/CBF
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {slotClubObj &&
              Object.entries(slotClubObj.time_slots).map(([slot, pct]) => (
                <div
                  key={slot}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">🕒 {slot}</span>
                    <span
                      className={`font-extrabold ${
                        pct >= 55
                          ? "text-emerald-400"
                          : pct >= 42
                          ? "text-amber-300"
                          : "text-rose-400"
                      }`}
                    >
                      {pct}% de aproveitamento
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 55
                          ? "bg-emerald-500"
                          : pct >= 42
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              ))}

            {slotClubObj && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Estádio & Piso:</p>
                  <p className="font-bold text-white">
                    {slotClubObj.club.stadium_name} ({slotClubObj.club.turf_type})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Público Médio / Ocupação:</p>
                  <p className="font-bold text-emerald-400">
                    {slotClubObj.avg_attendance.toLocaleString("pt-BR")} (
                    {slotClubObj.occupation_rate}%)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
