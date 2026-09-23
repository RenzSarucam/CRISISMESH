<?php

namespace Database\Factories;

use App\Models\EvacuationCenter;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<EvacuationCenter>
 */
class EvacuationCenterFactory extends Factory
{
    private const CENTER_LAT = 7.0707;

    private const CENTER_LNG = 125.6087;

    public function definition(): array
    {
        $capacity = fake()->numberBetween(50, 1000);

        return [
            'uuid' => (string) Str::uuid(),
            'name' => fake()->city().' Evacuation Center',
            'address' => fake()->streetAddress().', Davao City',
            'latitude' => self::CENTER_LAT + fake()->randomFloat(6, -0.05, 0.05),
            'longitude' => self::CENTER_LNG + fake()->randomFloat(6, -0.05, 0.05),
            'capacity' => $capacity,
            'current_occupancy' => fake()->numberBetween(0, $capacity),
            'contact' => fake()->phoneNumber(),
            'status' => fake()->randomElement(['OPEN', 'FULL', 'CLOSED', 'UNKNOWN']),
            'facilities' => fake()->randomElements(['water', 'medical', 'power', 'restrooms', 'kitchen'], 3),
            'verified' => fake()->boolean(80),
        ];
    }
}
