"use client";

import { cn } from "@/lib/utils";

export function Toggle({
  pressed,
  onPressedChange,
  children,
}: {
  pressed: boolean;
  onPressedChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPressedChange}
      className={cn(
        "h-7 rounded-full border px-2.5 text-[0.7rem] font-medium transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-input/20 text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
