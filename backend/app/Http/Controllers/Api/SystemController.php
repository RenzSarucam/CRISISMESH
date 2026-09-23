<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SyncOperation;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;

class SystemController extends Controller
{
    use ApiResponse;

    public function status()
    {
        $databaseStatus = 'OPERATIONAL';
        try {
            DB::select('select 1');
        } catch (\Throwable $e) {
            $databaseStatus = 'DOWN';
        }

        $composerJson = json_decode(file_get_contents(base_path('composer.json')), true);

        return $this->success([
            'api_status' => 'OPERATIONAL',
            'database_status' => $databaseStatus,
            'app_version' => config('app.version') ?? ($composerJson['version'] ?? 'dev'),
            'server_time' => now()->toIso8601String(),
            'last_synchronization' => SyncOperation::max('processed_at'),
            'active_users' => User::where('last_active_at', '>=', now()->subMinutes(15))->count(),
            'pending_sync_operations' => SyncOperation::where('status', 'PENDING')->count(),
        ]);
    }
}
