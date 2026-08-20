<?php

namespace App\Filament\Resources\VoteOrders\Pages;

use App\Filament\Resources\VoteOrders\VoteOrderResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListVoteOrders extends ListRecords
{
    protected static string $resource = VoteOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
