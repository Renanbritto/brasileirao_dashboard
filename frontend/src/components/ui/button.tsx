import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_4px_18px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-emerald-400",
        destructive:
          "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_18px_rgba(244,63,94,0.3)] hover:from-rose-400 hover:to-rose-500",
        outline:
          "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:backdrop-blur-md dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-white",
        secondary:
          "border border-amber-300 bg-amber-50 text-amber-900 shadow-sm hover:bg-amber-100 dark:border-white/10 dark:bg-[#111622]/90 dark:text-zinc-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-amber-400/30 dark:hover:bg-[#171e2e]",
        ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-xl px-3.5 text-xs",
        lg: "h-10 rounded-xl px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
