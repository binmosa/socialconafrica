<?php

namespace App\Filament\Resources\RaffleDraws\Pages;

use App\Filament\Resources\RaffleDraws\RaffleDrawResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditRaffleDraw extends EditRecord
{
    protected static string $resource = RaffleDrawResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
