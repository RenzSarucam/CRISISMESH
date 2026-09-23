<?php

namespace Database\Factories;

use App\Models\IncidentConfirmation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<IncidentConfirmation>
 */
class IncidentConfirmationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'role_at_time' => fake()->randomElement(['citizen', 'responder', 'admin']),
            'type' => fake()->randomElement([IncidentConfirmation::TYPE_CONFIRM, IncidentConfirmation::TYPE_REJECT]),
            'note' => fake()->optional()->sentence(),
            'created_at' => now(),
        ];
    }
}
