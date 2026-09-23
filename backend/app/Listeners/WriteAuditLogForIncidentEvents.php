<?php

namespace App\Listeners;

use App\Events\IncidentCreated;
use App\Events\IncidentVerified;
use App\Services\AuditLogService;

class WriteAuditLogForIncidentEvents
{
    public function __construct(private AuditLogService $auditLog) {}

    public function handleCreated(IncidentCreated $event): void
    {
        $this->auditLog->log($event->actor, AuditLogService::INCIDENT_CREATED, 'Incident', $event->incident->id);
    }

    public function handleVerified(IncidentVerified $event): void
    {
        $action = $event->rejected ? AuditLogService::INCIDENT_REJECTED : AuditLogService::INCIDENT_VERIFIED;
        $this->auditLog->log($event->actor, $action, 'Incident', $event->incident->id);
    }
}
