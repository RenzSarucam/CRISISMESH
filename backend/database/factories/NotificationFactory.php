<?php

namespace Database\Factories;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['INCIDENT_UPDATE', 'SOS_UPDATE', 'SYSTEM']),
            'title' => fake()->sentence(4),
            'body' => fake()->sentence(15),
            'read_at' => fake()->boolean(50) ? now() : null,
            'data' => [],
        ];
    }
}
