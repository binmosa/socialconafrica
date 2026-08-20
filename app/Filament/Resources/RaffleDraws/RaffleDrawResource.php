<?php

namespace App\Filament\Resources\RaffleDraws;

use App\Enums\RaffleDrawStatus;
use App\Filament\Resources\RaffleDraws\Pages\CreateRaffleDraw;
use App\Filament\Resources\RaffleDraws\Pages\EditRaffleDraw;
use App\Filament\Resources\RaffleDraws\Pages\ListRaffleDraws;
use App\Models\RaffleDraw;
use App\Models\User;
use App\Services\Audit\AdminAuditor;
use App\Services\Raffle\DrawExecutor;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Throwable;

class RaffleDrawResource extends Resource
{
    protected static ?string $model = RaffleDraw::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedGift;

    protected static ?string $navigationLabel = 'Raffle Draws';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('week_key')
                ->required()
                ->unique(ignoreRecord: true)
                ->placeholder('2026-W34'),
            Select::make('status')
                ->options(collect(RaffleDrawStatus::cases())->mapWithKeys(
                    fn (RaffleDrawStatus $status) => [$status->value => $status->value],
                ))
                ->default(RaffleDrawStatus::Scheduled->value)
                ->disabledOn('edit')
                ->helperText('Lifecycle moves via the scheduler and the actions on the list page.'),
            DateTimePicker::make('opens_at')->required()->timezone(config('ace.timezone')),
            DateTimePicker::make('closes_at')->required()->timezone(config('ace.timezone'))->label('Entry cutoff'),
            DateTimePicker::make('draw_at')->required()->timezone(config('ace.timezone')),
            Repeater::make('prize_config')
                ->columns(3)
                ->schema([
                    Select::make('tier')
                        ->options(['PHONE' => 'PHONE', 'GRAND' => 'GRAND', 'CASH' => 'CASH', 'VOUCHER' => 'VOUCHER'])
                        ->required(),
                    TextInput::make('label')->required(),
                    TextInput::make('count')->numeric()->minValue(1)->required(),
                ])
                ->default([
                    ['tier' => 'PHONE', 'label' => 'Smartphone', 'count' => 7],
                    ['tier' => 'GRAND', 'label' => 'Premium Smartphone', 'count' => 1],
                ])
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('opens_at', 'desc')
            ->columns([
                TextColumn::make('week_key')->searchable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (RaffleDrawStatus $state): string => match ($state) {
                        RaffleDrawStatus::Open => 'success',
                        RaffleDrawStatus::Closed, RaffleDrawStatus::Drawn => 'warning',
                        RaffleDrawStatus::Published => 'info',
                        RaffleDrawStatus::Cancelled => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('opens_at')->dateTime(timezone: 'Africa/Addis_Ababa')->sortable(),
                TextColumn::make('closes_at')->label('Cutoff')->dateTime(timezone: 'Africa/Addis_Ababa'),
                TextColumn::make('entries_count')->counts('entries')->label('Entries'),
                TextColumn::make('winners_count')->counts('winners')->label('Winners'),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn (RaffleDraw $record): bool => in_array(
                        $record->status,
                        [RaffleDrawStatus::Scheduled, RaffleDrawStatus::Open],
                        true,
                    )),
                Action::make('closeEntries')
                    ->label('Close entries')
                    ->icon(Heroicon::OutlinedLockClosed)
                    ->color('warning')
                    ->visible(fn (RaffleDraw $record): bool => $record->status === RaffleDrawStatus::Open)
                    ->requiresConfirmation()
                    ->action(function (RaffleDraw $record): void {
                        $record->update(['status' => RaffleDrawStatus::Closed]);
                        Notification::make()->title('Entries closed.')->success()->send();
                    }),
                Action::make('executeDraw')
                    ->label('Execute draw')
                    ->icon(Heroicon::OutlinedSparkles)
                    ->color('danger')
                    ->visible(fn (RaffleDraw $record): bool => $record->status === RaffleDrawStatus::Closed)
                    ->requiresConfirmation()
                    ->modalDescription('Randomly selects the winners from eligible entries. Winners are stored privately until you publish them.')
                    ->schema([
                        Textarea::make('reason')->label('Note (audited)')->required()->minLength(3),
                    ])
                    ->action(function (RaffleDraw $record, array $data): void {
                        $admin = auth()->guard('web')->user();
                        abort_unless($admin instanceof User, 403);

                        try {
                            $executed = app(DrawExecutor::class)->execute($record, $admin);

                            app(AdminAuditor::class)->record(
                                'raffle.drawn',
                                $executed,
                                after: $executed->audit_metadata,
                                reason: $data['reason'],
                            );

                            Notification::make()
                                ->title('Draw executed')
                                ->body('Seed '.($executed->audit_metadata['seed'] ?? '?').' over '.($executed->audit_metadata['entry_count'] ?? 0).' entries. Review the winners, then publish.')
                                ->success()
                                ->send();
                        } catch (Throwable $exception) {
                            Notification::make()->title('Draw failed')->body($exception->getMessage())->danger()->send();
                        }
                    }),
                Action::make('publishWinners')
                    ->label('Publish winners')
                    ->icon(Heroicon::OutlinedMegaphone)
                    ->color('info')
                    ->visible(fn (RaffleDraw $record): bool => $record->status === RaffleDrawStatus::Drawn)
                    ->requiresConfirmation()
                    ->modalDescription('Publishes masked winner names on the public Winners page.')
                    ->action(function (RaffleDraw $record): void {
                        $admin = auth()->guard('web')->user();
                        abort_unless($admin instanceof User, 403);

                        $published = app(DrawExecutor::class)->publish($record, $admin);

                        app(AdminAuditor::class)->record('raffle.published', $published);

                        Notification::make()->title('Winners published.')->success()->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListRaffleDraws::route('/'),
            'create' => CreateRaffleDraw::route('/create'),
            'edit' => EditRaffleDraw::route('/{record}/edit'),
        ];
    }
}
