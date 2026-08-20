<?php

namespace App\Filament\Resources\VoteLedgerEntries;

use App\Enums\VoteLedgerEventType;
use App\Filament\Resources\VoteLedgerEntries\Pages\ListVoteLedgerEntries;
use App\Models\Nominee;
use App\Models\User;
use App\Models\VoteLedgerEntry;
use App\Services\Audit\AdminAuditor;
use App\Services\Voting\VoteLedgerService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class VoteLedgerEntryResource extends Resource
{
    protected static ?string $model = VoteLedgerEntry::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBookOpen;

    protected static ?string $navigationLabel = 'Vote Ledger';

    public static function canCreate(): bool
    {
        return false; // adjustments go through the header action below
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
                TextColumn::make('id')->sortable(),
                TextColumn::make('nominee.display_name')->label('Nominee')->searchable(),
                TextColumn::make('event_type')
                    ->badge()
                    ->color(fn (VoteLedgerEventType $state): string => match ($state) {
                        VoteLedgerEventType::PurchaseCredit => 'success',
                        VoteLedgerEventType::RefundDebit => 'danger',
                        default => 'warning',
                    }),
                TextColumn::make('vote_delta')->numeric(),
                TextColumn::make('vote_order_id')->label('Order')->toggleable(),
                TextColumn::make('reason')->limit(40)->toggleable(),
                TextColumn::make('actor.name')->label('Actor')->toggleable(),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('event_type')
                    ->options(collect(VoteLedgerEventType::cases())->mapWithKeys(
                        fn (VoteLedgerEventType $type) => [$type->value => $type->value],
                    )),
            ])
            ->headerActions([
                Action::make('adjust')
                    ->label('Create adjustment')
                    ->icon(Heroicon::OutlinedWrenchScrewdriver)
                    ->requiresConfirmation()
                    ->modalDescription('Adds or removes votes with a permanent, audited ledger entry. Prefer refunds for payment problems.')
                    ->schema([
                        Select::make('nominee_id')
                            ->label('Nominee')
                            ->options(Nominee::query()->orderBy('display_name')->pluck('display_name', 'id'))
                            ->searchable()
                            ->required(),
                        TextInput::make('vote_delta')
                            ->label('Vote delta (negative removes votes)')
                            ->numeric()
                            ->required()
                            ->rule('not_in:0'),
                        Textarea::make('reason')
                            ->label('Reason (required, audited)')
                            ->required()
                            ->minLength(5),
                    ])
                    ->action(function (array $data): void {
                        $admin = auth()->guard('web')->user();
                        abort_unless($admin instanceof User, 403);

                        $nominee = Nominee::query()->whereKey((int) $data['nominee_id'])->firstOrFail();

                        $entry = app(VoteLedgerService::class)->adjust(
                            $nominee,
                            (int) $data['vote_delta'],
                            $data['reason'],
                            $admin,
                        );

                        app(AdminAuditor::class)->record(
                            'ledger.adjusted',
                            $entry,
                            after: ['nominee_id' => $nominee->id, 'vote_delta' => (int) $data['vote_delta']],
                            reason: $data['reason'],
                        );

                        Notification::make()
                            ->title('Adjustment recorded on the ledger.')
                            ->success()
                            ->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListVoteLedgerEntries::route('/'),
        ];
    }
}
