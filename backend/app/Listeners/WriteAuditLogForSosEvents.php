<?php

namespace App\Listeners;

use App\Events\SosAcknowledged;
use App\Events\SosCreated;
use App\Events\SosResolved;
use App\Services\AuditLogService;

class WriteAuditLogForSosEvents
{
    public function __construct(private AuditLogService $auditLog) {}

    public function handleCreated(SosCreated $event): void
    {
        $this->auditLog->log($event->sos->user, AuditLogService::SOS_CREATED, 'SosRequest', $event->sos->id);
    }

    public function handleAcknowledged(SosAcknowledged $event): void
    {
        $this->auditLog->log($event->actor, AuditLogService::SOS_ACKNOWLEDGED, 'SosRequest', $event->sos->id);
    }

    public function handleResolved(SosResolved $event): void
    {
        $this->auditLog->log($event->actor, AuditLogService::SOS_RESOLVED, 'SosRequest', $event->sos->id);
    }
}
