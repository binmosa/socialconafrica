<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name.en')
                    ->label('Name (English)')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(function ($state, $set, $get): void {
                        if (blank($get('slug'))) {
                            $set('slug', Str::slug((string) $state));
                        }
                    }),
                TextInput::make('name.am')
                    ->label('Name (Amharic)')
                    ->required(),
                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true),
                Select::make('status')
                    ->options(['ACTIVE' => 'Active', 'HIDDEN' => 'Hidden'])
                    ->default('ACTIVE')
                    ->required(),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Textarea::make('description.en')->label('Description (English)')->columnSpanFull(),
                Textarea::make('description.am')->label('Description (Amharic)')->columnSpanFull(),
            ]);
    }
}
