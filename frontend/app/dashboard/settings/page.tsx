"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/dashboard/badges";
import { useSession } from "@/hooks/use-session";

// docs/contract.md has no PUT /auth/me or /users/{id} endpoint for updating
// one's own profile, so this stays read-only rather than shipping a form
// that would silently fail against the backend. Flagged as a contract gap.
export default function SettingsPage() {
  const { user } = useSession();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account details.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">Profile</CardTitle>
          <CardDescription>
            Profile editing isn&apos;t available yet — docs/contract.md doesn&apos;t define an endpoint for
            updating your own account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <p className="text-sm">{user?.name ?? "—"}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <p className="text-sm">{user?.email ?? "—"}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phone</Label>
            <p className="text-sm">{user?.phone ?? "Not provided"}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            {user && <RoleBadge role={user.role} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
