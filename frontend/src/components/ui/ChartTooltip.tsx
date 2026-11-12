"use client";

import React from "react";

export interface RechartsTooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, any>;
}

interface ChartTooltipCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartTooltipCard({
  children,
  className = "",
}: ChartTooltipCardProps) {
  return (
    <div
      className={`min-w-[195px] rounded-xl border border-slate-200/90 bg-white/95 p-3 text-xs text-slate-900 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-[#0b1120]/95 dark:text-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}

interface SeriesTooltipProps {
  active?: boolean;
  payload?: RechartsTooltipPayloadItem[];
  label?: string | number;
  labelFormatter?: (
    label: string | number,
    payload: RechartsTooltipPayloadItem[]
  ) => string;
  valueFormatter?: (
    value: string | number,
    item: RechartsTooltipPayloadItem
  ) => string;
  sortByValue?: "asc" | "desc";
  className?: string;
}

export function SeriesTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  sortByValue,
  className = "",
}: SeriesTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const items = sortByValue
    ? [...payload].sort((a, b) => {
        const va = Number(a.value ?? 0);
        const vb = Number(b.value ?? 0);
        return sortByValue === "asc" ? va - vb : vb - va;
      })
    : payload;

  const headerText =
    labelFormatter && label !== undefined
      ? labelFormatter(label, payload)
      : label !== undefined
      ? String(label)
      : "";

  return (
    <ChartTooltipCard className={className}>
      {headerText && (
        <p className="mb-2 border-b border-slate-100 pb-1.5 text-xs font-extrabold tracking-tight text-slate-900 dark:border-white/10 dark:text-white">
          {headerText}
        </p>
      )}
      <div className="space-y-1.5">
        {items.map((entry, idx) => {
          const val = entry.value ?? "";
          const formattedVal = valueFormatter
            ? valueFormatter(val, entry)
            : String(val);
          const dotColor = entry.color || "#10b981";
          return (
            <div
              key={`${String(entry.dataKey ?? entry.name ?? idx)}-${idx}`}
              className="flex items-center justify-between gap-4 text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {entry.name}
                </span>
              </div>
              <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                {formattedVal}
              </span>
            </div>
          );
        })}
      </div>
    </ChartTooltipCard>
  );
}

interface ClubMetricTooltipRow {
  label: string;
  value: string;
}

interface ClubMetricTooltipProps {
  shortName: string;
  fullName: string;
  badgeText: string;
  isPositive: boolean;
  isFavorite?: boolean;
  rows: ClubMetricTooltipRow[];
}

export function ClubMetricTooltip({
  shortName,
  fullName,
  badgeText,
  isPositive,
  isFavorite = false,
  rows,
}: ClubMetricTooltipProps) {
  return (
    <ChartTooltipCard className="min-w-[225px]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-white/10">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {shortName}
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {fullName}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2 py-1 font-mono text-xs font-extrabold ${
            isFavorite
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : isPositive
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
          }`}
        >
          {badgeText}
        </span>
      </div>
      <div className="mt-2 space-y-1 text-[11px]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 text-slate-600 dark:text-zinc-300"
          >
            <span>{row.label}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </ChartTooltipCard>
  );
}
