<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SosTest extends TestCase
{
    use RefreshDatabase;

    public function test_sos_creation_triggers_rate_limit_after_threshold(): void
    {
        $citizen = User::factory()->citizen()->create();

        $payload = [
            'latitude' => 7.0707,
            'longitude' => 125.6087,
            'battery_percent' => 42,
        ];

        for ($i = 0; $i < 5; $i++) {
            $response = $this->actingAs($citizen)->postJson('/api/v1/sos', array_merge($payload, [
                'uuid' => (string) Str::uuid(),
            ]));
            $response->assertStatus(201);
        }

        // The 6th request within the same minute must be throttled.
        $sixth = $this->actingAs($citizen)->postJson('/api/v1/sos', array_merge($payload, [
            'uuid' => (string) Str::uuid(),
        ]));

        $sixth->assertStatus(429);
    }
}
