"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentPosition } from "@/lib/geolocation";
import { createIncidentOffline } from "@/lib/offline/actions";
import { useConnectionState } from "@/hooks/use-connection-state";
import type { IncidentType, Severity } from "@/types";

const INCIDENT_TYPES: IncidentType[] = [
  "MEDICAL",
  "FIRE",
  "FLOOD",
  "LANDSLIDE",
  "ROAD_BLOCKAGE",
  "POWER_OUTAGE",
  "WATER_SHORTAGE",
  "MISSING_PERSON",
  "SECURITY",
  "EARTHQUAKE",
  "STORM",
  "OTHER",
];

const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const schema = z.object({
  type: z.enum(INCIDENT_TYPES as [IncidentType, ...IncidentType[]]),
  title: z.string().min(3, "Title is too short").max(120),
  description: z.string().min(10, "Please describe what you're seeing").max(2000),
  severity: z.enum(SEVERITIES as [Severity, ...Severity[]]),
});

type FormValues = z.infer<typeof schema>;

export default function ReportIncidentPage() {
  const router = useRouter();
  const { state } = useConnectionState();
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { severity: "MEDIUM" },
  });

  async function detectLocation() {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLocation({ lat: pos.latitude, lng: pos.longitude, accuracy: pos.accuracy });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not get your location.");
    } finally {
      setLocating(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!location) {
      toast.error("Please detect your location first.");
      return;
    }
    setSubmitting(true);
    try {
      await createIncidentOffline({
        type: values.type,
        title: values.title,
        description: values.description,
        severity: values.severity,
        latitude: location.lat,
        longitude: location.lng,
        location_accuracy: location.accuracy,
      });
      toast.success(
        state === "OFFLINE" ? "Report saved locally." : "Report submitted.",
      );
      router.push("/home");
    } catch {
      toast.error("Something went wrong saving your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-lg font-semibold">Report Incident</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="type">Incident type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Brief summary" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="What are you seeing? Include any details that could help responders."
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="severity">Severity</Label>
          <Controller
            control={control}
            name="severity"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="severity" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={detectLocation}
            disabled={locating}
          >
            {locating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
            {location
              ? `Location detected (±${Math.round(location.accuracy)}m)`
              : "Detect my location"}
          </Button>
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="mt-2">
          {submitting ? "Submitting…" : "Submit Report"}
        </Button>
      </form>
    </div>
  );
}
