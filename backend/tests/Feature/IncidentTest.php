<?php

namespace Tests\Feature;

use App\Models\Incident;
use App\Models\SyncOperation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class IncidentTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_incident(): void
    {
        $citizen = User::factory()->citizen()->create();

        $response = $this->actingAs($citizen)->postJson('/api/v1/incidents', [
            'type' => 'FIRE',
            'title' => 'Fire near market',
            'description' => 'Large fire spreading fast',
            'latitude' => 7.0707,
            'longitude' => 125.6087,
            'severity' => 'HIGH',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $this->assertDatabaseHas('incidents', ['title' => 'Fire near market', 'reporter_id' => $citizen->id]);
    }

    public function test_incident_creation_with_client_uuid_and_duplicate_sync_operation_id_does_not_duplicate(): void
    {
        $citizen = User::factory()->citizen()->create();
        $clientUuid = (string) Str::uuid();
        $operationId = 'op-'.uniqid();

        $payload = [
            'device_id' => null,
            'operations' => [
                [
                    'operation_id' => $operationId,
                    'type' => 'CREATE_INCIDENT',
                    'payload' => [
                        'uuid' => $clientUuid,
                        'type' => 'FLOOD',
                        'title' => 'Flooded street',
                        'latitude' => 7.07,
                        'longitude' => 125.60,
                        'severity' => 'MEDIUM',
                    ],
                ],
            ],
        ];

        $first = $this->actingAs($citizen)->postJson('/api/v1/sync', $payload);
        $first->assertStatus(200);

        $this->assertEquals(1, Incident::where('uuid', $clientUuid)->count());
        $this->assertEquals(1, SyncOperation::where('operation_id', $operationId)->count());

        // Replay the exact same sync operation.
        $second = $this->actingAs($citizen)->postJson('/api/v1/sync', $payload);
        $second->assertStatus(200);

        $this->assertEquals(1, Incident::where('uuid', $clientUuid)->count());
        $this->assertEquals(1, SyncOperation::where('operation_id', $operationId)->count());
        $this->assertTrue($second->json('data.results.0.replayed'));
    }

    public function test_admin_can_verify_incident(): void
    {
        $admin = User::factory()->admin()->create();
        $incident = Incident::factory()->create(['verification_status' => 'UNVERIFIED']);

        $response = $this->actingAs($admin)->postJson("/api/v1/incidents/{$incident->id}/verify", [
            'verification_status' => 'ADMIN_VERIFIED',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('incidents', [
            'id' => $incident->id,
            'verification_status' => 'ADMIN_VERIFIED',
        ]);
        $this->assertDatabaseHas('incident_confirmations', [
            'incident_id' => $incident->id,
            'user_id' => $admin->id,
        ]);
    }

    public function test_responder_cannot_update_incident_they_are_not_allowed_to_verify_returns_403(): void
    {
        // Citizens cannot verify incidents at all, regardless of ownership.
        $citizen = User::factory()->citizen()->create();
        $incident = Incident::factory()->create();

        $response = $this->actingAs($citizen)->postJson("/api/v1/incidents/{$incident->id}/verify", [
            'verification_status' => 'COMMUNITY_CONFIRMED',
        ]);

        $response->assertStatus(403);
    }

    public function test_citizen_sees_rounded_location_on_others_incident_but_exact_on_own(): void
    {
        $citizen = User::factory()->citizen()->create();
        $other = User::factory()->citizen()->create();

        $ownIncident = Incident::factory()->create([
            'reporter_id' => $citizen->id,
            'latitude' => 7.070712345,
            'longitude' => 125.608712345,
        ]);

        $othersIncident = Incident::factory()->create([
            'reporter_id' => $other->id,
            'latitude' => 7.070712345,
            'longitude' => 125.608712345,
        ]);

        $ownResponse = $this->actingAs($citizen)->getJson("/api/v1/incidents/{$ownIncident->id}");
        $ownResponse->assertStatus(200);
        $this->assertEquals(7.070712345, $ownResponse->json('data.latitude'));

        $othersResponse = $this->actingAs($citizen)->getJson("/api/v1/incidents/{$othersIncident->id}");
        $othersResponse->assertStatus(200);
        $this->assertEquals(7.071, $othersResponse->json('data.latitude'));
    }
}
