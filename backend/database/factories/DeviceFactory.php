<?php

namespace Database\Factories;

use App\Models\Device;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Device>
 */
class DeviceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => 'cm-device-'.Str::uuid(),
            'device_name' => fake()->randomElement(['Pixel 7', 'iPhone 14', 'Galaxy S22', 'Redmi Note 12']),
            'platform' => fake()->randomElement(['android', 'ios', 'web']),
            'last_seen_at' => now(),
            'last_sync_at' => now(),
        ];
    }
}
