<?php

namespace App\Filament\Resources\VoteLedgerEntries\Pages;

use App\Filament\Resources\VoteLedgerEntries\VoteLedgerEntryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListVoteLedgerEntries extends ListRecords
{
    protected static string $resource = VoteLedgerEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
