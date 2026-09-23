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
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateResource, useUpdateResource } from "@/hooks/use-resources";
import { ApiClientError } from "@/lib/api/client";
import type { Availability, Resource, ResourceType } from "@/types";

const RESOURCE_TYPES: ResourceType[] = [
  "WATER",
  "FOOD",
  "MEDICAL",
  "SHELTER",
  "POWER",
  "CHARGING",
  "FUEL",
  "TRANSPORT",
  "RESCUE_EQUIPMENT",
];
const AVAILABILITIES: Availability[] = ["AVAILABLE", "LIMITED", "UNAVAILABLE", "UNKNOWN"];

// Numeric fields stay as strings in the form itself (Input elements produce
// strings) and are only converted to numbers when building the API payload —
// this sidesteps the z.coerce input/output generic mismatch with
// react-hook-form's <FormValues> typing.
const numericString = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((v) => !Number.isNaN(Number(v)), message);

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(RESOURCE_TYPES as [ResourceType, ...ResourceType[]]),
  description: z.string().optional(),
  latitude: numericString("Latitude must be a number").refine(
    (v) => Number(v) >= -90 && Number(v) <= 90,
    "Latitude must be between -90 and 90",
  ),
  longitude: numericString("Longitude must be a number").refine(
    (v) => Number(v) >= -180 && Number(v) <= 180,
    "Longitude must be between -180 and 180",
  ),
  availability: z.enum(AVAILABILITIES as [Availability, ...Availability[]]),
  quantity: z.string().optional(),
  contact: z.string().optional(),
  operating_hours: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
}) {
  const create = useCreateResource();
  const update = useUpdateResource();
  const isEditing = !!resource;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "WATER",
      description: "",
      latitude: "0",
      longitude: "0",
      availability: "AVAILABLE",
      quantity: "",
      contact: "",
      operating_hours: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        resource
          ? {
              name: resource.name,
              type: resource.type,
              description: resource.description ?? "",
              latitude: String(resource.latitude),
              longitude: String(resource.longitude),
              availability: resource.availability,
              quantity: resource.quantity != null ? String(resource.quantity) : "",
              contact: resource.contact ?? "",
              operating_hours: resource.operating_hours ?? "",
            }
          : {
              name: "",
              type: "WATER",
              description: "",
              latitude: "0",
              longitude: "0",
              availability: "AVAILABLE",
              quantity: "",
              contact: "",
              operating_hours: "",
            },
      );
    }
  }, [open, resource, form]);

  async function onSubmit(values: FormValues) {
    const quantity = values.quantity && values.quantity.trim() !== "" ? Number(values.quantity) : null;
    const payload = {
      name: values.name,
      type: values.type,
      description: values.description || null,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      availability: values.availability,
      quantity: quantity != null && Number.isNaN(quantity) ? null : quantity,
      contact: values.contact || null,
      operating_hours: values.operating_hours || null,
    };
    try {
      if (isEditing && resource) {
        await update.mutateAsync({ id: resource.id, ...payload });
        toast.success("Resource updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Resource created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not save resource.");
    }
  }

  const saving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit resource" : "New resource"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update this resource's details." : "Add a resource for responders and citizens to find."}
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
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RESOURCE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replaceAll("_", " ")}
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
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABILITIES.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </FormControl>
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
              name="operating_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating hours</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 8am–5pm daily" {...field} />
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
