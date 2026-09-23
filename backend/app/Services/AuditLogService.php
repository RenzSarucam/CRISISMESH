<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogService
{
    // Canonical action names used across the app.
    public const USER_LOGIN = 'USER_LOGIN';

    public const INCIDENT_CREATED = 'INCIDENT_CREATED';

    public const INCIDENT_VERIFIED = 'INCIDENT_VERIFIED';

    public const INCIDENT_REJECTED = 'INCIDENT_REJECTED';

    public const SOS_CREATED = 'SOS_CREATED';

    public const SOS_ACKNOWLEDGED = 'SOS_ACKNOWLEDGED';

    public const SOS_RESOLVED = 'SOS_RESOLVED';

    public const RESOURCE_UPDATED = 'RESOURCE_UPDATED';

    public const USER_ROLE_CHANGED = 'USER_ROLE_CHANGED';

    public const ADMIN_LOGIN = 'ADMIN_LOGIN';

    /**
     * Write an audit log entry, capturing ip/user-agent from the current request when available.
     */
    public function log(?User $user, string $action, ?string $entity = null, ?string $entityId = null, ?Request $request = null): AuditLog
    {
        $request ??= request();

        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
