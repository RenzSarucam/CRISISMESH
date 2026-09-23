<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\EmergencyZone;
use App\Models\EvacuationCenter;
use App\Models\Incident;
use App\Models\Resource;
use App\Models\SosRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a realistic Davao City demo dataset.
     */
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@crisismesh.test',
            'password' => bcrypt('password'),
        ]);

        $responders = User::factory()->responder()->count(3)->create();

        $citizens = User::factory()->citizen()->count(10)->create();

        $allReporters = $citizens->concat($responders)->concat([$admin]);

        Incident::factory(30)->create()->each(function (Incident $incident) use ($allReporters) {
            $incident->update(['reporter_id' => $allReporters->random()->id]);
        });

        foreach (range(1, 10) as $i) {
            SosRequest::factory()->create(['user_id' => $citizens->random()->id]);
        }

        Resource::factory(15)->create();

        EvacuationCenter::factory(5)->create();

        EmergencyZone::factory(5)->create();

        AuditLog::factory(20)->create()->each(function (AuditLog $log) use ($allReporters) {
            $log->update(['user_id' => $allReporters->random()->id]);
        });

        $this->command?->info('');
        $this->command?->info('=== CrisisMesh demo credentials ===');
        $this->command?->info('Admin:     admin@crisismesh.test / password');
        $this->command?->info('Responder: '.$responders->first()->email.' / password');
        $this->command?->info('Citizen:   '.$citizens->first()->email.' / password');
        $this->command?->info('====================================');
    }
}
