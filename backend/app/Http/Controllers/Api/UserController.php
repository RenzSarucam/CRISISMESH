<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogService;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private AuditLogService $auditLog) {}

    /**
     * Admin-only user directory. Also used by the command center for
     * responder-assignment pickers (?role=responder).
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $request->validate([
            'role' => ['sometimes', Rule::in(['citizen', 'responder', 'admin'])],
        ]);

        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        $paginator = $query->orderBy('name')->paginate(50);

        return $this->paginatedResponse(UserResource::class, $paginator);
    }

    /**
     * Admin creates an account directly (responder, citizen, or another
     * admin) — there is no email/invite flow in this MVP, so the admin sets
     * the initial password themselves and shares it out of band.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'phone' => $data['phone'] ?? null,
            'emergency_contact' => $data['emergency_contact'] ?? null,
        ]);

        $this->auditLog->log($request->user(), AuditLogService::USER_CREATED, 'User', $user->id, $request);

        return $this->success(new UserResource($user), 'User created', 201);
    }
}
