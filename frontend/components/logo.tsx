import { cn } from "@/lib/utils";

/**
 * CrisisMesh mark: a shield (protection/command) containing a small mesh
 * network graph (three linked nodes) -- the two ideas the product is built
 * on. Pure `currentColor` strokes/fills so it drops into light/dark and the
 * dark sidebar without a separate variant.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-6", className)}
      aria-hidden="true"
    >
      <path
        d="M20 3 L34 8 V19 C34 27.5 28 33.8 20 37 C12 33.8 6 27.5 6 19 V8 Z"
        fill="currentColor"
        className="text-primary"
      />
      <g stroke="var(--color-primary-foreground)" strokeWidth="1.6" strokeLinecap="round">
        <line x1="14.5" y1="24" x2="20" y2="14.5" />
        <line x1="25.5" y1="24" x2="20" y2="14.5" />
        <line x1="14.5" y1="24" x2="25.5" y2="24" />
      </g>
      <circle cx="20" cy="14.5" r="2.6" fill="var(--color-primary-foreground)" />
      <circle cx="14.5" cy="24" r="2.6" fill="var(--color-primary-foreground)" />
      <circle cx="25.5" cy="24" r="2.6" fill="var(--color-primary-foreground)" />
    </svg>
  );
}

/**
 * Login/splash-sized lockup: the mark with two "signal" rings expanding
 * outward from the top node, evoking a broadcast reaching out when the
 * network is down. Respects prefers-reduced-motion via motion-safe:.
 */
export function LogoPulse({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <span
        className="motion-safe:animate-ping absolute size-16 rounded-full bg-primary/15"
        style={{ animationDuration: "2.4s" }}
      />
      <span
        className="motion-safe:animate-ping absolute size-12 rounded-full bg-primary/20"
        style={{ animationDuration: "2.4s", animationDelay: "0.4s" }}
      />
      <LogoMark className="relative size-14 drop-shadow-sm" />
    </div>
  );
}
