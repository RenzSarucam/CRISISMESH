<?php

namespace Database\Factories;

use App\Models\Incident;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Incident>
 */
class IncidentFactory extends Factory
{
    // Davao City, Philippines
    private const CENTER_LAT = 7.0707;

    private const CENTER_LNG = 125.6087;

    public function definition(): array
    {
        $type = fake()->randomElement(Incident::TYPES);

        return [
            'uuid' => (string) Str::uuid(),
            'type' => $type,
            'title' => ucfirst(strtolower(str_replace('_', ' ', $type))).' reported near '.fake()->streetName(),
            'description' => fake()->sentence(12),
            'latitude' => self::CENTER_LAT + fake()->randomFloat(6, -0.05, 0.05),
            'longitude' => self::CENTER_LNG + fake()->randomFloat(6, -0.05, 0.05),
            'location_accuracy' => fake()->randomFloat(1, 3, 50),
            'severity' => fake()->randomElement(Incident::SEVERITIES),
            'status' => fake()->randomElement(Incident::STATUSES),
            'verification_status' => fake()->randomElement(Incident::VERIFICATION_STATUSES),
            'source' => 'USER',
            'created_offline' => fake()->boolean(20),
            'synced_at' => now(),
        ];
    }
}
