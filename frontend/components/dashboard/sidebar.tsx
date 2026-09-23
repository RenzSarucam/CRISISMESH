"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  FileWarning,
  Siren,
  Package,
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  ScrollText,
  Activity,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/map", label: "Live Map", icon: Map },
  { href: "/dashboard/incidents", label: "Incidents", icon: FileWarning },
  { href: "/dashboard/sos", label: "SOS", icon: Siren },
  { href: "/dashboard/resources", label: "Resources", icon: Package },
  { href: "/dashboard/evacuation-centers", label: "Evacuation Centers", icon: Building2 },
  { href: "/dashboard/responders", label: "Responders", icon: ShieldCheck },
  { href: "/dashboard/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ScrollText, adminOnly: true },
  { href: "/dashboard/system-status", label: "System Status", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({
  role,
  onNavigate,
  collapsed = false,
}: {
  role: Role;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2" aria-label="Dashboard">
      {NAV.filter((item) => !item.adminOnly || role === "admin").map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname?.startsWith(item.href);
        const Icon = item.icon;
        const link = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </Link>
        );

        if (!collapsed) return link;

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export function SidebarShell({
  role,
  collapsed,
  onToggleCollapsed,
  children,
}: {
  role: Role;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children?: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-card transition-[width] duration-200 ease-in-out md:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2 border-b px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <LogoMark className="size-6 shrink-0" />
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight">
            CrisisMesh Command
          </span>
        )}
      </div>
      <DashboardNav role={role} collapsed={collapsed} />
      <div className={cn("border-t p-2", collapsed && "flex justify-center")}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(!collapsed && "w-full justify-start gap-2.5 px-3")}
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4 shrink-0" />
              ) : (
                <PanelLeftClose className="size-4 shrink-0" />
              )}
              {!collapsed && <span className="text-sm text-muted-foreground">Collapse</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
        </Tooltip>
      </div>
      {children}
    </aside>
  );
}

export function MobileSidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <LogoMark className="size-6" />
        CrisisMesh Command
      </span>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
        <X className="size-4" />
      </Button>
    </div>
  );
}
