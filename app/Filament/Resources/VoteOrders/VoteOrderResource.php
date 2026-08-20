<?php

namespace App\Filament\Resources\VoteOrders;

use App\Enums\VoteOrderStatus;
use App\Filament\Resources\VoteOrders\Pages\ListVoteOrders;
use App\Models\User;
use App\Models\VoteOrder;
use App\Services\Audit\AdminAuditor;
use App\Services\Payments\RefundService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Throwable;

class VoteOrderResource extends Resource
{
    protected static ?string $model = VoteOrder::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBanknotes;

    protected static ?string $navigationLabel = 'Orders & Payments';

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
                TextColumn::make('reference')->searchable()->copyable()->limit(14),
                TextColumn::make('voter.display_name')->label('Voter')->searchable(),
                TextColumn::make('nominee.display_name')->label('Nominee')->searchable(),
                TextColumn::make('vote_qty')->label('Votes')->numeric(),
                TextColumn::make('amount_minor')
                    ->label('Amount (ETB)')
                    ->formatStateUsing(fn (int $state): string => number_format($state / 100, 2)),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (VoteOrderStatus $state): string => match ($state) {
                        VoteOrderStatus::Success => 'success',
                        VoteOrderStatus::Failed, VoteOrderStatus::Expired => 'danger',
                        VoteOrderStatus::Refunded => 'gray',
                        default => 'warning',
                    }),
                TextColumn::make('paymentAttempts.gateway_reference')
                    ->label('Gateway refs')
                    ->listWithLineBreaks()
                    ->limitList(2)
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options(collect(VoteOrderStatus::cases())->mapWithKeys(
                        fn (VoteOrderStatus $status) => [$status->value => $status->value],
                    )),
            ])
            ->recordActions([
                Action::make('refund')
                    ->label('Refund')
                    ->icon(Heroicon::OutlinedArrowUturnLeft)
                    ->color('danger')
                    ->visible(fn (VoteOrder $record): bool => $record->status === VoteOrderStatus::Success)
                    ->requiresConfirmation()
                    ->modalDescription('This reverses the votes on the ledger, recalculates the leaderboard and voids the raffle entry. It cannot be undone.')
                    ->schema([
                        Textarea::make('reason')
                            ->label('Reason (required, audited)')
                            ->required()
                            ->minLength(5),
                    ])
                    ->action(function (VoteOrder $record, array $data): void {
                        $admin = auth()->guard('web')->user();
                        abort_unless($admin instanceof User, 403);

                        try {
                            app(RefundService::class)->reverse($record, $data['reason'], $admin);

                            app(AdminAuditor::class)->record(
                                'order.refunded',
                                $record,
                                before: ['status' => VoteOrderStatus::Success->value],
                                after: ['status' => VoteOrderStatus::Refunded->value],
                                reason: $data['reason'],
                            );

                            Notification::make()->title('Order refunded and votes reversed.')->success()->send();
                        } catch (Throwable $exception) {
                            Notification::make()->title('Refund failed')->body($exception->getMessage())->danger()->send();
                        }
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListVoteOrders::route('/'),
        ];
    }
}
