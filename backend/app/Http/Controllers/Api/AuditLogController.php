<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $paginator = AuditLog::query()->orderByDesc('created_at')->paginate(25);

        return $this->paginatedResponse(AuditLogResource::class, $paginator);
    }
}
