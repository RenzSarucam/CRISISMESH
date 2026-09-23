<?php

namespace App\Services;

/**
 * Pluggable "AI" suggestion service.
 *
 * IMPORTANT: this service never verifies anything. It only offers a
 * best-effort, non-authoritative CATEGORIZATION SUGGESTION to help a human
 * (citizen/responder/admin) fill in a report faster. All verification of
 * incidents remains a human responsibility (see IncidentPolicy / verify
 * endpoint). No external API calls are made here; this is a naive
 * keyword-heuristic placeholder so a real LLM provider can be swapped in
 * later behind the same interface without touching callers.
 *
 * Interface contract:
 *   categorize(string $text): array{type: string, severity: string, summary: string, confidence: float}
 */
class AiSuggestionService
{
    /**
     * @var array<string, list<string>>
     */
    private const TYPE_KEYWORDS = [
        'FIRE' => ['fire', 'smoke', 'burning', 'flames'],
        'FLOOD' => ['flood', 'water rising', 'submerged', 'overflow'],
        'MEDICAL' => ['injured', 'medical', 'unconscious', 'bleeding', 'sick', 'heart attack'],
        'LANDSLIDE' => ['landslide', 'mudslide', 'collapsed hill', 'erosion'],
        'ROAD_BLOCKAGE' => ['road block', 'blocked road', 'impassable', 'debris on road'],
        'POWER_OUTAGE' => ['power outage', 'blackout', 'no electricity', 'power line down'],
        'WATER_SHORTAGE' => ['no water', 'water shortage', 'water supply'],
        'MISSING_PERSON' => ['missing', 'lost person', 'cannot find'],
        'SECURITY' => ['robbery', 'assault', 'security threat', 'looting'],
        'EARTHQUAKE' => ['earthquake', 'tremor', 'shaking'],
        'STORM' => ['storm', 'typhoon', 'strong winds', 'heavy rain'],
    ];

    /**
     * @var list<string>
     */
    private const CRITICAL_KEYWORDS = ['dying', 'trapped', 'unconscious', 'critical', 'severe', 'fatal'];

    /**
     * @var list<string>
     */
    private const HIGH_KEYWORDS = ['urgent', 'serious', 'injured', 'spreading', 'rising fast'];

    /**
     * Naive keyword-based heuristic categorizer. No network calls.
     *
     * @return array{type: string, severity: string, summary: string, confidence: float}
     */
    public function categorize(string $text): array
    {
        $haystack = mb_strtolower($text);

        [$type, $typeHits] = $this->matchType($haystack);
        $severity = $this->matchSeverity($haystack);
        $confidence = $typeHits > 0 ? min(0.4 + ($typeHits * 0.15), 0.9) : 0.2;

        return [
            'type' => $type,
            'severity' => $severity,
            'summary' => $this->summarize($text),
            'confidence' => round($confidence, 2),
        ];
    }

    /**
     * @return array{0: string, 1: int}
     */
    private function matchType(string $haystack): array
    {
        $best = 'OTHER';
        $bestHits = 0;

        foreach (self::TYPE_KEYWORDS as $type => $keywords) {
            $hits = 0;
            foreach ($keywords as $keyword) {
                if (str_contains($haystack, $keyword)) {
                    $hits++;
                }
            }
            if ($hits > $bestHits) {
                $best = $type;
                $bestHits = $hits;
            }
        }

        return [$best, $bestHits];
    }

    private function matchSeverity(string $haystack): string
    {
        foreach (self::CRITICAL_KEYWORDS as $keyword) {
            if (str_contains($haystack, $keyword)) {
                return 'CRITICAL';
            }
        }

        foreach (self::HIGH_KEYWORDS as $keyword) {
            if (str_contains($haystack, $keyword)) {
                return 'HIGH';
            }
        }

        return 'MEDIUM';
    }

    private function summarize(string $text): string
    {
        $trimmed = trim(preg_replace('/\s+/', ' ', $text) ?? '');

        return mb_strlen($trimmed) > 140 ? mb_substr($trimmed, 0, 137).'...' : $trimmed;
    }
}
