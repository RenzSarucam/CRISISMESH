<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EvacuationCenter;
use App\Models\Incident;
use App\Models\SosRequest;
use App\Models\SyncOperation;
use App\Models\User;
use App\Support\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function statistics()
    {
        $activeIncidents = Incident::whereNotIn('status', ['RESOLVED', 'DISMISSED'])->count();
        $activeSos = SosRequest::whereNotIn('status', ['RESOLVED', 'CANCELLED'])->count();
        $unverifiedReports = Incident::where('verification_status', 'UNVERIFIED')->count();
        $respondersOnline = User::where('role', 'responder')
            ->where('last_active_at', '>=', now()->subMinutes(5))
            ->count();

        $capacityTotals = EvacuationCenter::selectRaw('COALESCE(SUM(capacity),0) as total_capacity, COALESCE(SUM(current_occupancy),0) as total_occupancy')
            ->first();
        $evacuationCapacityRemaining = max(
            0,
            (int) $capacityTotals->total_capacity - (int) $capacityTotals->total_occupancy
        );

        $offlineDevices = User::whereNotNull('device_id')
            ->where(function ($q) {
                $q->whereNull('last_active_at')->orWhere('last_active_at', '<', now()->subMinutes(15));
            })
            ->count();

        $syncErrors = SyncOperation::where('status', 'FAILED')->count();

        $incidentsOverTime = Incident::selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => ['date' => $row->date, 'count' => (int) $row->count])
            ->values();

        $incidentsByType = Incident::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(fn ($row) => ['type' => $row->type, 'count' => (int) $row->count])
            ->values();

        $incidentsBySeverity = Incident::selectRaw('severity, COUNT(*) as count')
            ->groupBy('severity')
            ->get()
            ->map(fn ($row) => ['severity' => $row->severity, 'count' => (int) $row->count])
            ->values();

        $sosResponseTimes = SosRequest::whereNotNull('acknowledged_at')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'minutes' => round($row->created_at->diffInSeconds($row->acknowledged_at) / 60, 1),
            ])
            ->values();

        $verificationBreakdown = Incident::selectRaw('verification_status as status, COUNT(*) as count')
            ->groupBy('verification_status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status, 'count' => (int) $row->count])
            ->values();

        return $this->success([
            'active_incidents' => $activeIncidents,
            'active_sos' => $activeSos,
            'unverified_reports' => $unverifiedReports,
            'responders_online' => $respondersOnline,
            'evacuation_capacity_remaining' => $evacuationCapacityRemaining,
            'offline_devices' => $offlineDevices,
            'sync_errors' => $syncErrors,
            'incidents_over_time' => $incidentsOverTime,
            'incidents_by_type' => $incidentsByType,
            'incidents_by_severity' => $incidentsBySeverity,
            'sos_response_time_minutes' => $sosResponseTimes,
            'verification_breakdown' => $verificationBreakdown,
        ]);
    }
}
