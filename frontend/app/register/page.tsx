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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoMark } from "@/components/logo";
import { useRegisterMutation } from "@/hooks/use-auth-forms";
import { useSession } from "@/hooks/use-session";
import { ApiClientError } from "@/lib/api/client";

// Role select is intentionally limited to citizen/responder — the backend
// rejects "admin" on /auth/register per docs/contract.md.
const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
    role: z.enum(["citizen", "responder"], { message: "Select a role" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const register = useRegisterMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "citizen",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "citizen" ? "/home" : "/dashboard");
    }
  }, [loading, user, router]);

  async function onSubmit(values: FormValues) {
    try {
      const { user: newUser } = await register.mutateAsync(values);
      toast.success(`Account created. Welcome, ${newUser.name}`);
      router.replace(newUser.role === "citizen" ? "/home" : "/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof FormValues, { message: messages[0] });
          }
        }
      }
      const message =
        err instanceof ApiClientError ? err.message : "Could not create account. Please try again.";
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2">
            <LogoMark className="size-6" />
            <span className="text-sm font-semibold tracking-tight">CrisisMesh</span>
          </div>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join CrisisMesh as a citizen or responder.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="responder">Responder</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
