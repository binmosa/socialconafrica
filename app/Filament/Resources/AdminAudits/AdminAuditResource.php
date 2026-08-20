<?php

namespace App\Filament\Resources\AdminAudits;

use App\Filament\Resources\AdminAudits\Pages\ListAdminAudits;
use App\Models\AdminAudit;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AdminAuditResource extends Resource
{
    protected static ?string $model = AdminAudit::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    protected static ?string $navigationLabel = 'Audit Log';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('created_at')->dateTime()->sortable(),
                TextColumn::make('admin.name')->label('Admin'),
                TextColumn::make('action')->badge()->searchable(),
                TextColumn::make('object_type')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->searchable(),
                TextColumn::make('object_id'),
                TextColumn::make('reason')->limit(60)->wrap(),
                TextColumn::make('before_json')
                    ->label('Before')
                    ->formatStateUsing(fn ($state): string => json_encode($state, JSON_UNESCAPED_UNICODE) ?: '')
                    ->limit(60)
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('after_json')
                    ->label('After')
                    ->formatStateUsing(fn ($state): string => json_encode($state, JSON_UNESCAPED_UNICODE) ?: '')
                    ->limit(60)
                    ->toggleable(isToggledHiddenByDefault: true),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAdminAudits::route('/'),
        ];
    }
}
