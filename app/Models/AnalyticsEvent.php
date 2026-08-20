<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $event_name
 * @property int|null $voter_id
 * @property string|null $session_hash
 * @property int|null $nominee_id
 * @property array<string, mixed>|null $properties
 */
#[Fillable(['event_name', 'voter_id', 'session_hash', 'nominee_id', 'properties'])]
class AnalyticsEvent extends Model
{
    public const UPDATED_AT = null;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }
}
