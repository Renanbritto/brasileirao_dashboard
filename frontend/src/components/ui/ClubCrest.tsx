"use client";

import React, { useState } from "react";

interface ClubLike {
  slug?: string;
  name?: string;
  short_name?: string;
  primary_color?: string;
}

interface ClubCrestProps {
  club?: ClubLike | null;
  slug?: string;
  name?: string;
  shortName?: string;
  primaryColor?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}

const SIZE_CONFIG: Record<
  "xs" | "sm" | "md" | "lg" | "xl",
  { dim: number; text: string; wrapper: string }
> = {
  xs: { dim: 18, text: "text-[8px]", wrapper: "w-[18px] h-[18px]" },
  sm: { dim: 24, text: "text-[10px]", wrapper: "w-6 h-6" },
  md: { dim: 32, text: "text-xs", wrapper: "w-8 h-8" },
  lg: { dim: 44, text: "text-sm", wrapper: "w-11 h-11" },
  xl: { dim: 56, text: "text-base", wrapper: "w-14 h-14" },
};

export function ClubCrest({
  club,
  slug,
  name,
  shortName,
  primaryColor,
  size = "sm",
  className = "",
}: ClubCrestProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedSlug = slug || club?.slug || "";
  const resolvedName = name || club?.name || "Clube";
  const resolvedShort = shortName || club?.short_name || "CLB";
  const resolvedColor = primaryColor || club?.primary_color || "#334155";

  const isPreset = typeof size === "string" && size in SIZE_CONFIG;
  const config = isPreset
    ? SIZE_CONFIG[size as "xs" | "sm" | "md" | "lg" | "xl"]
    : {
        dim: typeof size === "number" ? size : 24,
        text: "text-xs",
        wrapper: "",
      };

  const styleDim = !isPreset
    ? {
        width: `${typeof size === "number" ? size : 24}px`,
        height: `${typeof size === "number" ? size : 24}px`,
      }
    : undefined;

  if (!resolvedSlug || hasError) {
    return (
      <span
        style={{ backgroundColor: resolvedColor, ...styleDim }}
        className={`inline-flex shrink-0 items-center justify-center rounded-lg font-black text-white shadow-sm ring-1 ring-white/20 select-none ${
          isPreset ? config.wrapper : ""
        } ${config.text} ${className}`}
        title={resolvedName}
      >
        {resolvedShort}
      </span>
    );
  }

  return (
    <span
      style={styleDim}
      className={`relative inline-flex shrink-0 items-center justify-center select-none ${
        isPreset ? config.wrapper : ""
      } ${className}`}
      title={resolvedName}
    >
      <img
        src={`/crests/${resolvedSlug}.png`}
        alt={resolvedName}
        width={config.dim}
        height={config.dim}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-110"
      />
    </span>
  );
}
