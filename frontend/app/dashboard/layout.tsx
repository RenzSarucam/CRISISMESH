"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { SidebarShell } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Skeleton } from "@/components/ui/skeleton";

/** Client-side guard for the whole /dashboard route group (spec section 6):
 * unauthenticated visitors go to /login, citizens are bounced to the
 * field-app /home since Command Center is responder/admin only. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "citizen") {
      router.replace("/home");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role === "citizen") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/30">
        <div className="flex w-full max-w-sm flex-col gap-3 p-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-svh overflow-hidden bg-muted/20">
      <SidebarShell role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
