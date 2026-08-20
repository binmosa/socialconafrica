<?php

namespace App\Filament\Resources\RaffleDraws\Pages;

use App\Filament\Resources\RaffleDraws\RaffleDrawResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListRaffleDraws extends ListRecords
{
    protected static string $resource = RaffleDrawResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
