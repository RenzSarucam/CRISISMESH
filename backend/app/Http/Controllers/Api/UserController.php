<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use ApiResponse;

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
}
