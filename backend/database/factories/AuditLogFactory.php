<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'action' => fake()->randomElement([
                AuditLogService::USER_LOGIN,
                AuditLogService::INCIDENT_CREATED,
                AuditLogService::INCIDENT_VERIFIED,
                AuditLogService::SOS_CREATED,
                AuditLogService::RESOURCE_UPDATED,
            ]),
            'entity' => fake()->randomElement(['Incident', 'SosRequest', 'User', 'Resource']),
            'entity_id' => (string) fake()->uuid(),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => now(),
        ];
    }
}
