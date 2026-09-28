import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TONE = {
  neutral: { text: "text-primary", chip: "bg-primary/10" },
  good: { text: "text-[#0ca30c]", chip: "bg-[#0ca30c]/10" },
  warning: { text: "text-[#8a5a00] dark:text-[#fab219]", chip: "bg-[#fab219]/15" },
  critical: { text: "text-[#d03b3b]", chip: "bg-[#d03b3b]/10" },
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  tone?: keyof typeof TONE;
  hint?: string;
}) {
  const { text, chip } = TONE[tone];

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className={cn("text-3xl font-semibold tabular-nums", text)}>{value}</span>
          )}
          {hint && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", chip)}>
          <Icon className={cn("size-5", text)} />
        </div>
      </CardContent>
    </Card>
  );
}
