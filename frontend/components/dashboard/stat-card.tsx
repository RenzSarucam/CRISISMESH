import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  tone?: "neutral" | "good" | "warning" | "critical";
  hint?: string;
}) {
  const toneClass = {
    neutral: "text-foreground",
    good: "text-[#0ca30c]",
    warning: "text-[#8a5a00] dark:text-[#fab219]",
    critical: "text-[#d03b3b]",
  }[tone];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className={cn("text-2xl font-semibold tabular-nums", toneClass)}>{value}</div>
        )}
        {hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
