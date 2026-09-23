"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IncidentFilterBar } from "@/components/dashboard/incidents/incident-filters";
import { IncidentTable } from "@/components/dashboard/incidents/incident-table";
import { IncidentDetailSheet } from "@/components/dashboard/incidents/incident-detail-sheet";
import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { useIncidents, type IncidentFilters } from "@/hooks/use-incidents";
import type { Incident } from "@/types";

export default function IncidentsPage() {
  const [filters, setFilters] = useState<IncidentFilters>({ page: 1 });
  const [selected, setSelected] = useState<Incident | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, isError, error } = useIncidents(filters);

  function selectIncident(incident: Incident) {
    setSelected(incident);
    setSheetOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Incidents</h1>
        <p className="text-sm text-muted-foreground">
          Review, verify, assign, and resolve incoming incident reports.
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t load incidents</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Please try again shortly."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm">All incidents</CardTitle>
          <IncidentFilterBar filters={filters} onChange={setFilters} />
        </CardHeader>
        <CardContent>
          <IncidentTable incidents={data?.items ?? []} loading={isLoading} onSelect={selectIncident} />
          {data && (
            <PaginationBar
              page={data.meta.current_page}
              lastPage={data.meta.last_page}
              total={data.meta.total}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          )}
        </CardContent>
      </Card>

      <IncidentDetailSheet incident={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
