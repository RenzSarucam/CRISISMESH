<?php

namespace Database\Factories;

use App\Models\EmergencyZone;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<EmergencyZone>
 */
class EmergencyZoneFactory extends Factory
{
    private const CENTER_LAT = 7.0707;

    private const CENTER_LNG = 125.6087;

    public function definition(): array
    {
        $lat = self::CENTER_LAT + fake()->randomFloat(6, -0.05, 0.05);
        $lng = self::CENTER_LNG + fake()->randomFloat(6, -0.05, 0.05);

        $polygon = [
            [$lat, $lng],
            [$lat + 0.01, $lng],
            [$lat + 0.01, $lng + 0.01],
            [$lat, $lng + 0.01],
        ];

        return [
            'uuid' => (string) Str::uuid(),
            'name' => fake()->streetName().' '.fake()->randomElement(['Zone', 'District', 'Area']),
            'type' => fake()->randomElement(EmergencyZone::TYPES),
            'polygon' => $polygon,
            'description' => fake()->sentence(10),
            'active' => fake()->boolean(85),
        ];
    }
}
