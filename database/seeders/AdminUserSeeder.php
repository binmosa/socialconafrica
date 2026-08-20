<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Local/dev admin for the Filament panel. Not for production use.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'ACE Admin',
                'password' => 'password',
                'role' => 'admin',
            ],
        );
    }
}
