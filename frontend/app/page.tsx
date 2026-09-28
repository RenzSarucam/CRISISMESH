"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { LogoMark } from "@/components/logo";

export default function RootPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role === "citizen") {
      router.replace("/home");
    } else {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Redirect decisions here are near-instant (a local IndexedDB read), but
  // this is the very first paint of the app (PWA start_url, bare-domain
  // visits) -- rendering nothing made a slow network or a cold dev-server
  // compile look like the app had failed to load at all.
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background text-foreground">
      <LogoMark className="size-10 motion-safe:animate-pulse" />
      <span className="text-sm text-muted-foreground">Loading CrisisMesh…</span>
    </div>
  );
}
