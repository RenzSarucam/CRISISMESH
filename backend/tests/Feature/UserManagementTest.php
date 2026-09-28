<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_responder(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $response = $this->actingAs($admin)->postJson('/api/v1/users', [
            'name' => 'New Responder',
            'email' => 'new.responder@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'responder',
            'phone' => '+15551234567',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.role', 'responder');
        $response->assertJsonPath('data.email', 'new.responder@example.com');
        $this->assertDatabaseHas('users', [
            'email' => 'new.responder@example.com',
            'role' => 'responder',
        ]);

        // Creating a user must never mint a session for the admin's browser —
        // this is an admin action, not a login.
        $response->assertJsonMissingPath('data.token');
    }

    public function test_non_admin_cannot_create_a_user(): void
    {
        $responder = User::factory()->create(['role' => User::ROLE_RESPONDER]);

        $response = $this->actingAs($responder)->postJson('/api/v1/users', [
            'name' => 'New Responder',
            'email' => 'blocked@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'responder',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('users', ['email' => 'blocked@example.com']);
    }

    public function test_create_user_rejects_duplicate_email(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->actingAs($admin)->postJson('/api/v1/users', [
            'name' => 'Duplicate',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'responder',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }
}
