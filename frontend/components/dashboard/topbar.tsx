"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Wifi, WifiOff, ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { logoutRequest } from "@/lib/api/client";
import { useSystemStatus, useBrowserOnline } from "@/hooks/use-system-status";
import { DashboardNav, MobileSidebarHeader } from "@/components/dashboard/sidebar";
import type { Role, User } from "@/types";

function SystemStatusIndicator() {
  const { data, isError, isLoading } = useSystemStatus();
  const browserOnline = useBrowserOnline();

  if (!browserOnline || browserOnline === "offline") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d03b3b]/10 px-2.5 py-1 text-xs font-medium text-[#d03b3b]">
        <WifiOff className="size-3.5" />
        Offline
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        Checking status…
      </span>
    );
  }

  const degraded =
    isError || !data || data.api_status !== "OPERATIONAL" || data.database_status !== "OPERATIONAL";
  const down = isError || !data || data.api_status === "DOWN" || data.database_status === "DOWN";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        down
          ? "bg-[#d03b3b]/10 text-[#d03b3b]"
          : degraded
            ? "bg-[#fab219]/15 text-[#8a5a00] dark:text-[#fab219]"
            : "bg-[#0ca30c]/10 text-[#0ca30c]",
      )}
      role="status"
      aria-live="polite"
      title={
        data
          ? `API: ${data.api_status} · Database: ${data.database_status}`
          : "Unable to reach /system/status"
      }
    >
      <Wifi className="size-3.5" />
      {down ? "OUTAGE" : degraded ? "PARTIAL OUTAGE" : "OPERATIONAL"}
    </span>
  );
}

export function DashboardTopbar({ user }: { user: User }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // logoutRequest already clears local session even if the network call fails
    } finally {
      toast.success("Signed out");
      router.replace("/login");
    }
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <SystemStatusIndicator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[0.65rem]">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left text-xs leading-tight sm:block">
                  <span className="block font-medium">{user.name}</span>
                  <span className="block capitalize text-muted-foreground">{user.role}</span>
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <span className="block truncate">{user.email}</span>
                <RoleHint role={user.role} />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebarHeader onClose={() => setMobileOpen(false)} />
          <DashboardNav role={user.role} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function RoleHint({ role }: { role: Role }) {
  return <span className="block text-[0.65rem] capitalize text-muted-foreground">{role}</span>;
}
