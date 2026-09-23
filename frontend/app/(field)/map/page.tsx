"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const FieldMap = dynamic(() => import("@/components/field/field-map").then((m) => m.FieldMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function FieldMapPage() {
  return (
    <div className="h-[calc(100svh-8.5rem)] w-full">
      <FieldMap />
    </div>
  );
}
