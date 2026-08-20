<?php

namespace App\Filament\Resources\Nominees;

use App\Filament\Resources\Nominees\Pages\CreateNominee;
use App\Filament\Resources\Nominees\Pages\EditNominee;
use App\Filament\Resources\Nominees\Pages\ListNominees;
use App\Filament\Resources\Nominees\Schemas\NomineeForm;
use App\Filament\Resources\Nominees\Tables\NomineesTable;
use App\Models\Nominee;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class NomineeResource extends Resource
{
    protected static ?string $model = Nominee::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return NomineeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return NomineesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListNominees::route('/'),
            'create' => CreateNominee::route('/create'),
            'edit' => EditNominee::route('/{record}/edit'),
        ];
    }
}
