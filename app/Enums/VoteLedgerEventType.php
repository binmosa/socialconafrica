<?php

namespace App\Enums;

enum VoteLedgerEventType: string
{
    case PurchaseCredit = 'PURCHASE_CREDIT';
    case RefundDebit = 'REFUND_DEBIT';
    case AdminAdjustment = 'ADMIN_ADJUSTMENT';
    case Reconciliation = 'RECONCILIATION';
}
