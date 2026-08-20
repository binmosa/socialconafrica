<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $words = fake()->unique()->words(2, true);
        $name = is_array($words) ? implode(' ', $words) : $words;

        return [
            'name' => ['en' => ucwords($name), 'am' => ucwords($name)],
            'slug' => Str::slug($name),
            'description' => null,
            'sort_order' => 0,
            'status' => 'ACTIVE',
        ];
    }
}
