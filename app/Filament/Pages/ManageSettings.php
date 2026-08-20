<?php

namespace App\Filament\Pages;

use App\Models\NomineeVoteCounter;
use App\Models\Setting;
use App\Models\User;
use App\Services\Audit\AdminAuditor;
use App\Services\Settings\SettingsService;
use App\Services\Voting\CounterRebuilder;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

/**
 * @property-read Schema $form
 */
class ManageSettings extends Page
{
    protected string $view = 'filament.pages.manage-settings';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $title = 'Platform Settings';

    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = [];

    public function mount(SettingsService $settings): void
    {
        $this->form->fill([
            'voting_opens_at' => $settings->get('voting.opens_at'),
            'voting_closes_at' => $settings->get('voting.closes_at'),
            'payments_paused' => $settings->paymentsPaused(),
            'raffle_enabled' => $settings->raffleEnabled(),
            'tie_break_rule' => $settings->tieBreakRule(),
            'raffle_default_cutoff_time' => $settings->raffleDefaultCutoffTime(),
            'raffle_default_draw_time' => $settings->raffleDefaultDrawTime(),
            'raffle_default_prize_config' => $settings->raffleDefaultPrizeConfig(),
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Form::make([
                    Section::make('Voting window')
                        ->description('Times are entered in the business timezone ('.config('ace.timezone').').')
                        ->columns(2)
                        ->components([
                            DateTimePicker::make('voting_opens_at')->timezone(config('ace.timezone')),
                            DateTimePicker::make('voting_closes_at')->timezone(config('ace.timezone')),
                        ]),
                    Section::make('Kill switches')
                        ->columns(2)
                        ->components([
                            Toggle::make('payments_paused')
                                ->label('Pause payments')
                                ->helperText('Shows a friendly banner instead of the pay button.'),
                            Toggle::make('raffle_enabled')
                                ->label('Raffle enabled')
                                ->helperText('When off, successful votes still count but create no draw entries.'),
                        ]),
                    Section::make('Leaderboard')
                        ->components([
                            Select::make('tie_break_rule')
                                ->options([
                                    'earliest_total' => 'Earliest to reach the tied total, then nominee ID',
                                    'nominee_id' => 'Stable nominee ID only',
                                ])
                                ->required(),
                        ]),
                    Section::make('Raffle defaults')
                        ->columns(2)
                        ->components([
                            TextInput::make('raffle_default_cutoff_time')
                                ->label('Friday cutoff time (HH:MM)')
                                ->required(),
                            TextInput::make('raffle_default_draw_time')
                                ->label('Friday draw time (HH:MM)')
                                ->required(),
                            Repeater::make('raffle_default_prize_config')
                                ->label('Default weekly prizes')
                                ->columns(3)
                                ->schema([
                                    Select::make('tier')
                                        ->options(['PHONE' => 'PHONE', 'GRAND' => 'GRAND', 'CASH' => 'CASH', 'VOUCHER' => 'VOUCHER'])
                                        ->required(),
                                    TextInput::make('label')->required(),
                                    TextInput::make('count')->numeric()->minValue(1)->required(),
                                ])
                                ->columnSpanFull(),
                        ]),
                ])
                    ->livewireSubmitHandler('save')
                    ->footer([
                        Actions::make([
                            Action::make('save')
                                ->label('Save settings')
                                ->submit('save')
                                ->keyBindings(['mod+s']),
                            Action::make('rebuildCounters')
                                ->label('Rebuild vote counters from ledger')
                                ->color('warning')
                                ->requiresConfirmation()
                                ->modalDescription('Recomputes every cached counter from the append-only ledger. Safe to run during live voting.')
                                ->action(function (): void {
                                    $summary = app(CounterRebuilder::class)->rebuild();

                                    app(AdminAuditor::class)->record(
                                        'counters.rebuilt',
                                        NomineeVoteCounter::class,
                                        after: $summary,
                                    );

                                    Notification::make()
                                        ->title('Counters rebuilt from ledger ('.$summary['counters'].' rows).')
                                        ->success()
                                        ->send();
                                }),
                        ]),
                    ]),
            ])
            ->statePath('data');
    }

    public function save(SettingsService $settings): void
    {
        $data = $this->form->getState();

        $admin = auth()->guard('web')->user();
        $adminId = $admin instanceof User ? $admin->id : null;

        $settings->set('voting.opens_at', $data['voting_opens_at'], $adminId);
        $settings->set('voting.closes_at', $data['voting_closes_at'], $adminId);
        $settings->set('payments.paused', (bool) $data['payments_paused'], $adminId);
        $settings->set('raffle.enabled', (bool) $data['raffle_enabled'], $adminId);
        $settings->set('leaderboard.tie_break_rule', $data['tie_break_rule'], $adminId);
        $settings->set('raffle.default_cutoff_time', $data['raffle_default_cutoff_time'], $adminId);
        $settings->set('raffle.default_draw_time', $data['raffle_default_draw_time'], $adminId);
        $settings->set('raffle.default_prize_config', $data['raffle_default_prize_config'], $adminId);

        app(AdminAuditor::class)->record('settings.updated', Setting::class, after: $data);

        Notification::make()->title('Settings saved.')->success()->send();
    }
}
