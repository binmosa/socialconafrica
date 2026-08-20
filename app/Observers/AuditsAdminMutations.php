<?php

namespace App\Observers;

use App\Services\Audit\AdminAuditor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Safety-net auditing: any create/update/delete performed while an admin
 * session is active is recorded with before/after values.
 */
class AuditsAdminMutations
{
    public function __construct(private readonly AdminAuditor $auditor) {}

    public function created(Model $model): void
    {
        $this->recordIfAdmin('created', $model, null, $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        unset($changes['updated_at']);

        if ($changes === []) {
            return;
        }

        $before = array_intersect_key($model->getOriginal(), $changes);

        $this->recordIfAdmin('updated', $model, $before, $changes);
    }

    public function deleted(Model $model): void
    {
        $this->recordIfAdmin('deleted', $model, $model->getOriginal(), null);
    }

    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    private function recordIfAdmin(string $action, Model $model, ?array $before, ?array $after): void
    {
        if (! Auth::guard('web')->check()) {
            return;
        }

        $this->auditor->record($action, $model, before: $before, after: $after);
    }
}
