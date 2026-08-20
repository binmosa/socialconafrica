<?php

namespace App\Filament\Resources\Voters;

use App\Enums\VoterRiskStatus;
use App\Enums\VoterStatus;
use App\Filament\Resources\Voters\Pages\EditVoter;
use App\Filament\Resources\Voters\Pages\ListVoters;
use App\Models\Voter;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class VoterResource extends Resource
{
    protected static ?string $model = Voter::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    public static function canCreate(): bool
    {
        return false; // voters register themselves
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('display_name')->required(),
            TextInput::make('phone')->disabled()->helperText('Verified phone — changed only through support/linking flows.'),
            TextInput::make('email')->disabled(),
            Select::make('status')
                ->options(collect(VoterStatus::cases())->mapWithKeys(
                    fn (VoterStatus $status) => [$status->value => $status->value],
                ))
                ->required(),
            Select::make('risk_status')
                ->options(collect(VoterRiskStatus::cases())->mapWithKeys(
                    fn (VoterRiskStatus $status) => [$status->value => $status->value],
                ))
                ->required()
                ->helperText('STEP_UP_REQUIRED holds payments until verification; BLOCKED stops voting entirely.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('display_name')->searchable(),
                TextColumn::make('phone')->searchable(),
                TextColumn::make('email')->searchable()->toggleable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (VoterStatus $state): string => $state === VoterStatus::Active ? 'success' : 'gray'),
                TextColumn::make('risk_status')
                    ->badge()
                    ->color(fn (VoterRiskStatus $state): string => match ($state) {
                        VoterRiskStatus::Normal => 'success',
                        VoterRiskStatus::StepUpRequired => 'warning',
                        VoterRiskStatus::Blocked => 'danger',
                    }),
                TextColumn::make('vote_orders_count')->counts('voteOrders')->label('Orders'),
                TextColumn::make('auth_identities_count')->counts('authIdentities')->label('Logins'),
                TextColumn::make('last_login_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('risk_status')
                    ->options(collect(VoterRiskStatus::cases())->mapWithKeys(
                        fn (VoterRiskStatus $status) => [$status->value => $status->value],
                    )),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListVoters::route('/'),
            'edit' => EditVoter::route('/{record}/edit'),
        ];
    }
}
