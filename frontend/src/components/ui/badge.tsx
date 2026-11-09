import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-all backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-emerald-400/35 bg-emerald-500/15 text-emerald-300 shadow-[inset_0_1px_0_rgba(52,211,153,0.25),0_0_14px_rgba(16,185,129,0.2)]",
        secondary:
          "border-white/10 bg-white/[0.06] text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
        destructive:
          "border-rose-400/35 bg-rose-500/15 text-rose-300 shadow-[inset_0_1px_0_rgba(251,113,133,0.25),0_0_14px_rgba(244,63,94,0.2)]",
        warning:
          "border-amber-400/35 bg-amber-500/15 text-amber-300 shadow-[inset_0_1px_0_rgba(251,191,36,0.25),0_0_14px_rgba(245,158,11,0.2)]",
        info:
          "border-sky-400/35 bg-sky-500/15 text-sky-300 shadow-[inset_0_1px_0_rgba(56,189,248,0.25),0_0_14px_rgba(14,165,233,0.2)]",
        outline: "border-white/15 bg-transparent text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
