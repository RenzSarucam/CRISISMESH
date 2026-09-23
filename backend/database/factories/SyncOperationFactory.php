<?php

namespace Database\Factories;

use App\Models\SyncOperation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SyncOperation>
 */
class SyncOperationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'device_id' => (string) Str::uuid(),
            'operation_id' => 'op-'.Str::random(12),
            'type' => fake()->randomElement([
                SyncOperation::TYPE_CREATE_INCIDENT,
                SyncOperation::TYPE_CREATE_SOS,
                SyncOperation::TYPE_UPDATE_INCIDENT,
            ]),
            'payload' => [],
            'status' => fake()->randomElement([
                SyncOperation::STATUS_PENDING,
                SyncOperation::STATUS_APPLIED,
                SyncOperation::STATUS_FAILED,
            ]),
            'processed_at' => now(),
        ];
    }
}
