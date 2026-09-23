<?php

namespace Database\Factories;

use App\Models\Resource;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Resource>
 */
class ResourceFactory extends Factory
{
    private const CENTER_LAT = 7.0707;

    private const CENTER_LNG = 125.6087;

    public function definition(): array
    {
        $type = fake()->randomElement(Resource::TYPES);

        return [
            'uuid' => (string) Str::uuid(),
            'name' => ucfirst(strtolower(str_replace('_', ' ', $type))).' point - '.fake()->streetName(),
            'type' => $type,
            'description' => fake()->sentence(8),
            'latitude' => self::CENTER_LAT + fake()->randomFloat(6, -0.05, 0.05),
            'longitude' => self::CENTER_LNG + fake()->randomFloat(6, -0.05, 0.05),
            'availability' => fake()->randomElement(Resource::AVAILABILITIES),
            'quantity' => fake()->numberBetween(0, 500),
            'contact' => fake()->phoneNumber(),
            'operating_hours' => '24/7',
            'verified' => fake()->boolean(70),
            'last_updated_at' => now(),
        ];
    }
}
