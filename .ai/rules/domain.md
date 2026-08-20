---
paths:
  - 'app/**'
---

# Domain

## Money, ledger, and idempotency invariants
All ETB amounts are stored in **minor units** as unsigned integers (1 vote = 10 ETB = 1000 minor). `vote_ledger_entries` is **append-only** — the model throws on update/delete; totals are corrected by writing reversing entries, never by editing rows. `nominee_vote_counters` is a rebuildable projection: it may only be written inside the same transaction as a ledger insert (via `VoteLedgerService`) or by `CounterRebuilder`. Payment finalization must stay idempotent: unique `ledger_key`, unique `raffle_entries.vote_order_id`, unique `payment_attempts.gateway_reference`, row locks + terminal-status guard in `PaymentConfirmationService`. Never allocate votes from a browser redirect — only from server-confirmed gateway results.

## Guards and module boundaries
Two auth guards: `web` = admins (`User`, Filament at `/admin`), `voter` = voters (`Voter`). Behavior lives in `app/Services/<Module>` (Catalog, Identity, Pricing, Payments, Voting, Leaderboard, Raffle, Settings, Audit); swap-able integrations sit behind interfaces (`PaymentGateway`, `SmsSender`) bound from `config('ace.*')` driver keys. Admin-editable runtime config goes through `SettingsService` (settings table), not `config/`. Cross-module side effects (receipts, analytics, cache busting) are after-commit event listeners — never inside the finalization transaction.
