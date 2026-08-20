<?php

namespace App\Services\Catalog;

use App\Models\Nominee;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class NomineeSearchService
{
    /**
     * Partial-match search over active nominees by name, @handle, or category.
     *
     * @return Collection<int, Nominee>
     */
    public function search(?string $query, ?string $categorySlug = null): Collection
    {
        return Nominee::query()
            ->active()
            ->with('categories')
            ->when($categorySlug, fn (Builder $q) => $q->whereHas(
                'categories',
                fn (Builder $c) => $c->where('slug', $categorySlug),
            ))
            ->when($query, function (Builder $q) use ($query): void {
                $term = ltrim(trim($query), '@');

                $q->where(function (Builder $inner) use ($term): void {
                    $inner->where('display_name', 'like', "%{$term}%")
                        ->orWhere('handle', 'like', "%{$term}%")
                        ->orWhereHas('categories', function (Builder $c) use ($term): void {
                            $c->where('name', 'like', "%{$term}%");
                        });
                });
            })
            ->orderBy('display_name')
            ->get();
    }
}
