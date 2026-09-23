<?php

namespace App\Providers;

use App\Models\EmergencyZone;
use App\Models\EvacuationCenter;
use App\Models\Incident;
use App\Models\Resource;
use App\Models\SosRequest;
use App\Models\User;
use App\Policies\EvacuationCenterPolicy;
use App\Policies\IncidentPolicy;
use App\Policies\ResourcePolicy;
use App\Policies\SosPolicy;
use App\Policies\UserPolicy;
use App\Policies\ZonePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Incident::class, IncidentPolicy::class);
        Gate::policy(SosRequest::class, SosPolicy::class);
        Gate::policy(Resource::class, ResourcePolicy::class);
        Gate::policy(EvacuationCenter::class, EvacuationCenterPolicy::class);
        Gate::policy(EmergencyZone::class, ZonePolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        // Event -> audit-log listener bindings (WriteAuditLogForIncidentEvents,
        // WriteAuditLogForSosEvents) are picked up by Laravel's automatic event
        // discovery from their handle*(SomeEvent $event) method signatures —
        // registering them again here would fire each listener twice per event.

        // Aggressive SOS rate limiting: 5 requests per minute per authenticated user (falls back to IP).
        RateLimiter::for('sos', function ($request) {
            $key = $request->user()?->id ?? $request->ip();

            return Limit::perMinute(5)->by($key);
        });
    }
}
