<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EvacuationCenterController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\SosController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ZoneController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/system/status', [SystemController::class, 'status']);

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::get('/incidents', [IncidentController::class, 'index']);
        Route::post('/incidents', [IncidentController::class, 'store']);
        Route::get('/incidents/{incident}', [IncidentController::class, 'show']);
        Route::put('/incidents/{incident}', [IncidentController::class, 'update'])->middleware('role:responder,admin');
        Route::post('/incidents/{incident}/verify', [IncidentController::class, 'verify'])->middleware('role:responder,admin');
        Route::post('/incidents/{incident}/assign', [IncidentController::class, 'assign'])->middleware('role:admin');
        Route::post('/incidents/{incident}/resolve', [IncidentController::class, 'resolve'])->middleware('role:responder,admin');

        Route::get('/sos', [SosController::class, 'index']);
        Route::post('/sos', [SosController::class, 'store'])->middleware('throttle:5,1');
        Route::get('/sos/{sos}', [SosController::class, 'show']);
        Route::post('/sos/{sos}/acknowledge', [SosController::class, 'acknowledge'])->middleware('role:responder,admin');
        Route::post('/sos/{sos}/assign', [SosController::class, 'assign'])->middleware('role:admin');
        Route::post('/sos/{sos}/resolve', [SosController::class, 'resolve'])->middleware('role:responder,admin');

        Route::get('/resources', [ResourceController::class, 'index']);
        Route::post('/resources', [ResourceController::class, 'store'])->middleware('role:admin');
        Route::put('/resources/{resource}', [ResourceController::class, 'update'])->middleware('role:admin');
        Route::delete('/resources/{resource}', [ResourceController::class, 'destroy'])->middleware('role:admin');

        Route::get('/evacuation-centers', [EvacuationCenterController::class, 'index']);
        Route::post('/evacuation-centers', [EvacuationCenterController::class, 'store'])->middleware('role:admin');
        Route::put('/evacuation-centers/{evacuation_center}', [EvacuationCenterController::class, 'update'])->middleware('role:admin');
        Route::delete('/evacuation-centers/{evacuation_center}', [EvacuationCenterController::class, 'destroy'])->middleware('role:admin');

        Route::get('/users', [UserController::class, 'index'])->middleware('role:admin');

        Route::get('/zones', [ZoneController::class, 'index']);
        Route::post('/zones', [ZoneController::class, 'store'])->middleware('role:admin');
        Route::put('/zones/{zone}', [ZoneController::class, 'update'])->middleware('role:admin');

        Route::post('/sync', [SyncController::class, 'store']);

        Route::get('/dashboard/statistics', [DashboardController::class, 'statistics'])->middleware('role:responder,admin');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('role:admin');
    });
});
