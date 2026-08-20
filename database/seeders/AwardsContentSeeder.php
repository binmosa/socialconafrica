<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Nominee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AwardsContentSeeder extends Seeder
{
    /**
     * Placeholder catalog mirroring the campaign preview content.
     * Replace nominees with the curated ACE list before voting opens.
     */
    public function run(): void
    {
        $categories = [
            ['en' => 'Lifestyle', 'am' => 'የአኗኗር ዘይቤ'],
            ['en' => 'Technology', 'am' => 'ቴክኖሎጂ'],
            ['en' => 'Food & Culture', 'am' => 'ምግብ እና ባህል'],
            ['en' => 'Comedy', 'am' => 'ኮሜዲ'],
            ['en' => 'Fashion', 'am' => 'ፋሽን'],
            ['en' => 'Health & Fitness', 'am' => 'ጤና እና ስፖርት'],
            ['en' => 'Music', 'am' => 'ሙዚቃ'],
            ['en' => 'Travel', 'am' => 'ጉዞ'],
        ];

        $nominees = [
            ['Hana Digital', 'Addis Ababa', 'Lifestyle'],
            ['Sami Tech', 'Addis Ababa', 'Technology'],
            ['Lili Foodie', 'Hawassa', 'Food & Culture'],
            ['Dawit Comedy', 'Dire Dawa', 'Comedy'],
            ['Meron Fashion', 'Addis Ababa', 'Fashion'],
            ['Abel Fitness', 'Bahir Dar', 'Health & Fitness'],
            ['Selam Music', 'Mekelle', 'Music'],
            ['Yonas Travel', 'Gondar', 'Travel'],
        ];

        $categoryModels = [];

        foreach ($categories as $index => $name) {
            $categoryModels[$name['en']] = Category::query()->updateOrCreate(
                ['slug' => Str::slug($name['en'])],
                ['name' => $name, 'sort_order' => $index, 'status' => 'ACTIVE'],
            );
        }

        foreach ($nominees as [$name, $city, $categoryName]) {
            $handle = Str::slug($name);

            $nominee = Nominee::query()->updateOrCreate(
                ['handle' => $handle],
                [
                    'display_name' => $name,
                    'share_slug' => $handle,
                    'status' => 'ACTIVE',
                    'city' => $city,
                ],
            );

            $nominee->categories()->syncWithoutDetaching([$categoryModels[$categoryName]->id]);
        }
    }
}
