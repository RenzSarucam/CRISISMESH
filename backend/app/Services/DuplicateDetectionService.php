<?php

namespace App\Services;

use App\Models\Incident;
use Carbon\Carbon;

class DuplicateDetectionService
{
    private const RADIUS_METERS = 150;

    private const WINDOW_MINUTES = 30;

    /**
     * Find other incidents of the same type within ~150m and 30 minutes of the given incident.
     * Returns a list of possibly-duplicate incident ids. Does NOT auto-merge anything.
     *
     * @return list<string>
     */
    public function findPossibleDuplicates(Incident $incident): array
    {
        $windowStart = Carbon::parse($incident->created_at)->subMinutes(self::WINDOW_MINUTES);
        $windowEnd = Carbon::parse($incident->created_at)->addMinutes(self::WINDOW_MINUTES);

        $candidates = Incident::query()
            ->where('id', '!=', $incident->id)
            ->where('type', $incident->type)
            ->whereBetween('created_at', [$windowStart, $windowEnd])
            ->get(['id', 'latitude', 'longitude']);

        return $candidates
            ->filter(fn ($candidate) => $this->haversineMeters(
                $incident->latitude,
                $incident->longitude,
                $candidate->latitude,
                $candidate->longitude
            ) <= self::RADIUS_METERS)
            ->pluck('id')
            ->values()
            ->all();
    }

    private function haversineMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
