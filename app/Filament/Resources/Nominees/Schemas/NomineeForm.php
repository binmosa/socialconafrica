<?php

namespace App\Filament\Resources\Nominees\Schemas;

use App\Models\Category;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class NomineeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Identity')
                    ->columns(2)
                    ->components([
                        TextInput::make('display_name')
                            ->required()
                            ->live(onBlur: true)
                            ->afterStateUpdated(function ($state, $set, $get): void {
                                if (blank($get('handle'))) {
                                    $set('handle', Str::slug((string) $state));
                                }
                                if (blank($get('share_slug'))) {
                                    $set('share_slug', Str::slug((string) $state));
                                }
                            }),
                        TextInput::make('handle')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->prefix('@'),
                        TextInput::make('share_slug')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->prefix('/vote/')
                            ->helperText('Stable share URL — do not change after voting opens.'),
                        Select::make('status')
                            ->options(['ACTIVE' => 'Active', 'HIDDEN' => 'Hidden'])
                            ->default('ACTIVE')
                            ->required(),
                        TextInput::make('city'),
                        TextInput::make('social_profile_url')->url(),
                        Select::make('categories')
                            ->relationship('categories', 'id')
                            ->getOptionLabelFromRecordUsing(fn (Category $record): string => $record->getTranslation('name', 'en'))
                            ->multiple()
                            ->preload()
                            ->required()
                            ->columnSpanFull(),
                        FileUpload::make('image_path')
                            ->image()
                            ->directory('nominees')
                            ->columnSpanFull(),
                    ]),
                Section::make('Bio')
                    ->columns(2)
                    ->components([
                        Textarea::make('bio.en')->label('Bio (English)'),
                        Textarea::make('bio.am')->label('Bio (Amharic)'),
                    ]),
            ]);
    }
}
