"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoPulse } from "@/components/logo";
import { MeshBackground } from "@/components/mesh-background";
import { useLoginMutation } from "@/hooks/use-auth-forms";
import { useSession } from "@/hooks/use-session";
import { ApiClientError } from "@/lib/api/client";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const login = useLoginMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "citizen" ? "/home" : "/dashboard");
    }
  }, [loading, user, router]);

  async function onSubmit(values: FormValues) {
    try {
      const { user: loggedInUser } = await login.mutateAsync(values);
      toast.success(`Welcome back, ${loggedInUser.name}`);
      router.replace(loggedInUser.role === "citizen" ? "/home" : "/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Could not sign in. Please try again.";
      toast.error(message);
    }
  }

  return (
    <div className="dark cm-dark relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4 text-foreground">
      <MeshBackground />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

      <div className="relative z-10 flex flex-col items-center gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700">
        <LogoPulse />
        <span className="text-lg font-semibold tracking-tight">CrisisMesh</span>
        <span className="text-xs text-muted-foreground">Communication when the network fails.</span>
      </div>

      <Card className="relative z-10 w-full max-w-sm border-white/10 bg-card/90 shadow-2xl shadow-black/40 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
        <CardHeader>
          <CardTitle>Sign in to CrisisMesh</CardTitle>
          <CardDescription>For citizens, responders, and administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
