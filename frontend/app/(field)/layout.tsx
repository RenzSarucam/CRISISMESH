"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Home, Map, FilePlus2, Siren, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { OfflineBanner } from "@/components/connection-status";

const NAV: { href: string; label: string; icon: typeof Home; danger?: boolean }[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/report", label: "Report", icon: FilePlus2 },
  { href: "/sos", label: "SOS", icon: Siren, danger: true },
  { href: "/profile", label: "Profile", icon: User },
];

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <OfflineBanner />
      <main className="flex-1 pb-20">{children}</main>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card/95 backdrop-blur"
        aria-label="Primary"
      >
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                item.danger
                  ? "text-red-600 dark:text-red-500"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("size-5", item.danger && "size-6")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
