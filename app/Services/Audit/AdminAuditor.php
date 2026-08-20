<?php

namespace App\Services\Audit;

use App\Models\AdminAudit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Primary writer of the permanent admin audit trail. Privileged services
 * call record() explicitly inside their transactions; the mutation
 * observer is the safety net for plain CRUD edits.
 */
class AdminAuditor
{
    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public function record(
        string $action,
        Model|string $object,
        string|int|null $objectId = null,
        ?array $before = null,
        ?array $after = null,
        ?string $reason = null,
    ): AdminAudit {
        if ($object instanceof Model) {
            $objectType = $object->getMorphClass();
            $objectId = $object->getKey();
        } else {
            $objectType = $object;
        }

        return AdminAudit::query()->create([
            'admin_id' => Auth::guard('web')->id(),
            'action' => $action,
            'object_type' => $objectType,
            'object_id' => (string) $objectId,
            'before_json' => $before,
            'after_json' => $after,
            'reason' => $reason,
            'ip' => request()->ip(),
        ]);
    }
}
