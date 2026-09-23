<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private AuditLogService $auditLog) {}

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'phone' => $data['phone'] ?? null,
            'emergency_contact' => $data['emergency_contact'] ?? null,
            'last_active_at' => now(),
        ]);

        $token = $user->createToken('crisismesh')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Registered successfully', 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        if (! Auth::once(['email' => $data['email'], 'password' => $data['password']])) {
            return $this->error('Invalid credentials', [], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $user->forceFill(['last_active_at' => now()])->save();

        if (! empty($data['device_id'])) {
            $user->forceFill(['device_id' => $data['device_id']])->save();
        }

        $token = $user->createToken('crisismesh')->plainTextToken;

        $this->auditLog->log($user, AuditLogService::USER_LOGIN, 'User', $user->id, $request);
        if ($user->isAdmin()) {
            $this->auditLog->log($user, AuditLogService::ADMIN_LOGIN, 'User', $user->id, $request);
        }

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Logged in successfully');
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success([], 'Logged out successfully');
    }

    public function me(Request $request)
    {
        return $this->success(new UserResource($request->user()));
    }
}
