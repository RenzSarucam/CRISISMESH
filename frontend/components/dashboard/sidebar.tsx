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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
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
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2" aria-label="Dashboard">
      {NAV.filter((item) => !item.adminOnly || role === "admin").map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarShell({
  role,
  children,
}: {
  role: Role;
  children?: React.ReactNode;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <LogoMark className="size-6" />
        <span className="text-sm font-semibold tracking-tight">CrisisMesh Command</span>
      </div>
      <DashboardNav role={role} />
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
