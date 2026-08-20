<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

/**
 * Permanent audit trail of privileged admin actions. Never edited or deleted.
 *
 * @property int $id
 * @property int|null $admin_id
 * @property string $action
 * @property string $object_type
 * @property string $object_id
 * @property array<string, mixed>|null $before_json
 * @property array<string, mixed>|null $after_json
 * @property string|null $reason
 * @property string|null $ip
 */
#[Fillable(['admin_id', 'action', 'object_type', 'object_id', 'before_json', 'after_json', 'reason', 'ip'])]
class AdminAudit extends Model
{
    public const UPDATED_AT = null;

    protected static function booted(): void
    {
        static::updating(function (): never {
            throw new LogicException('Admin audit records are immutable.');
        });

        static::deleting(function (): never {
            throw new LogicException('Admin audit records cannot be deleted.');
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'before_json' => 'array',
            'after_json' => 'array',
        ];
    }
}
