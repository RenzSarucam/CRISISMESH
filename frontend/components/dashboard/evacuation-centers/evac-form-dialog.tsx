"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateEvacuationCenter, useUpdateEvacuationCenter } from "@/hooks/use-evacuation-centers";
import { ApiClientError } from "@/lib/api/client";
import type { EvacStatus, EvacuationCenter } from "@/types";

const STATUSES: EvacStatus[] = ["OPEN", "FULL", "CLOSED", "UNKNOWN"];

// Numeric fields stay as strings in the form (Input elements produce
// strings) and are only converted to numbers when building the API payload —
// this sidesteps the z.coerce input/output generic mismatch with
// react-hook-form's <FormValues> typing.
const numericString = (message: string, opts?: { integer?: boolean; min?: number }) =>
  z
    .string()
    .min(1, message)
    .refine((v) => !Number.isNaN(Number(v)), message)
    .refine((v) => !opts?.integer || Number.isInteger(Number(v)), "Must be a whole number")
    .refine((v) => opts?.min === undefined || Number(v) >= opts.min, `Must be at least ${opts?.min}`);

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(2, "Address is required"),
  latitude: numericString("Latitude must be a number").refine(
    (v) => Number(v) >= -90 && Number(v) <= 90,
    "Latitude must be between -90 and 90",
  ),
  longitude: numericString("Longitude must be a number").refine(
    (v) => Number(v) >= -180 && Number(v) <= 180,
    "Longitude must be between -180 and 180",
  ),
  capacity: numericString("Capacity must be a number", { integer: true, min: 0 }),
  current_occupancy: numericString("Occupancy must be a number", { integer: true, min: 0 }),
  contact: z.string().optional(),
  status: z.enum(STATUSES as [EvacStatus, ...EvacStatus[]]),
  facilities: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EvacFormDialog({
  open,
  onOpenChange,
  center,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center: EvacuationCenter | null;
}) {
  const create = useCreateEvacuationCenter();
  const update = useUpdateEvacuationCenter();
  const isEditing = !!center;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      address: "",
      latitude: "0",
      longitude: "0",
      capacity: "0",
      current_occupancy: "0",
      contact: "",
      status: "OPEN",
      facilities: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        center
          ? {
              name: center.name,
              address: center.address,
              latitude: String(center.latitude),
              longitude: String(center.longitude),
              capacity: String(center.capacity),
              current_occupancy: String(center.current_occupancy),
              contact: center.contact ?? "",
              status: center.status,
              facilities: center.facilities.join(", "),
            }
          : {
              name: "",
              address: "",
              latitude: "0",
              longitude: "0",
              capacity: "0",
              current_occupancy: "0",
              contact: "",
              status: "OPEN",
              facilities: "",
            },
      );
    }
  }, [open, center, form]);

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      address: values.address,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      capacity: Number(values.capacity),
      current_occupancy: Number(values.current_occupancy),
      contact: values.contact || null,
      status: values.status,
      facilities: values.facilities
        ? values.facilities.split(",").map((f) => f.trim()).filter(Boolean)
        : [],
    };
    try {
      if (isEditing && center) {
        await update.mutateAsync({ id: center.id, ...payload });
        toast.success("Evacuation center updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Evacuation center created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not save evacuation center.");
    }
  }

  const saving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit evacuation center" : "New evacuation center"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update capacity, status, and details." : "Add a new evacuation center."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_occupancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current occupancy</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="facilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilities (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Restrooms, Medical tent, Power" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : isEditing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
