<?php

namespace Database\Factories;

use App\Models\SosRequest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SosRequest>
 */
class SosRequestFactory extends Factory
{
    private const CENTER_LAT = 7.0707;

    private const CENTER_LNG = 125.6087;

    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'latitude' => self::CENTER_LAT + fake()->randomFloat(6, -0.05, 0.05),
            'longitude' => self::CENTER_LNG + fake()->randomFloat(6, -0.05, 0.05),
            'battery_percent' => fake()->numberBetween(2, 100),
            'network_status' => fake()->randomElement(['ONLINE', 'OFFLINE', 'WEAK']),
            'message' => fake()->optional()->sentence(),
            'severity' => 'CRITICAL',
            'status' => fake()->randomElement(['ACTIVE', 'ACKNOWLEDGED', 'RESPONDER_ASSIGNED', 'RESOLVED']),
        ];
    }
}
