# SocialCon Africa — Award & Paid-Voting Platform
## Full Build Plan: Backend · Frontend · Design System · Voting Algorithm · Security

**Stack:** Laravel 13.x + official React starter kit (Inertia 3, React 19, TypeScript, Tailwind 4, shadcn/ui) [KNOWN — confirmed against laravel.com/docs/13.x, HIGH]

**Tagging convention in this document:** external facts about third-party services/frameworks are tagged. Architecture and design decisions are proposals ([INFERRED] from your requirements), not facts — they are untagged unless they rest on an external claim.

---

# 1. SYSTEM OVERVIEW

```
                        ┌─────────────────────────────┐
                        │        PUBLIC WEB            │
                        │  Home · Nominees · Profile   │
                        │  Vote Flow · Results         │
                        └──────────┬──────────────────┘
                                   │ Inertia (server-driven React)
┌───────────────┐       ┌──────────▼──────────────────┐      ┌──────────────────┐
│ Nominee Portal │──────▶│      LARAVEL 13 CORE        │◀─────│  Admin Panel      │
│ (register,     │       │  Controllers → Actions →    │      │  (committee,      │
│  profile, link)│       │  Services → Models          │      │   moderation,     │
└───────────────┘       └──┬─────────┬─────────┬──────┘      │   finance)        │
                           │         │         │             └──────────────────┘
                    ┌──────▼───┐ ┌───▼─────┐ ┌─▼──────────────┐
                    │ Payment  │ │  OTP    │ │ Social profile │
                    │ Gateway  │ │ Email/  │ │ verification   │
                    │ (webhook │ │ SMS     │ │ (3rd-party API │
                    │  = vote) │ │         │ │  + bio-code)   │
                    └──────────┘ └─────────┘ └────────────────┘
                    MySQL 8 (ledger) · Redis (cache/queues/throttle) · Horizon (queues)
```

**One rule governs everything: a vote exists only if a verified payment webhook created it.** No controller, no frontend action, no admin shortcut writes to the `votes` table. This single invariant is what makes the system "no tricks to vote without payment."

---

# 2. BACKEND PLAN

## 2.1 Foundation

- `laravel new socialcon --react` → official React starter kit (Inertia 3, React 19, Tailwind 4, shadcn/ui) [KNOWN, HIGH]
- PHP 8.4, MySQL 8 (InnoDB, strict mode), Redis for cache + queues + rate-limit buckets, Laravel Horizon for queue monitoring — the same stack profile you already tuned for sa3ada.org, so ops knowledge transfers directly.
- Architecture style: single-Action classes (`App\Actions\Voting\RecordPaidVote`, `App\Actions\Verification\IssueOtp`, …) invoked by thin controllers. Every money- or vote-touching operation is one auditable class with one test file.
- Two auth guards: `web` (nominees — starter-kit auth) and `admin` (staff/committee — separate table, 2FA mandatory). **Public voters are NOT users.** They are `voters` records identified by verified email/phone. No password, no session account — this is what keeps the vote flow to three taps.

## 2.2 Data model

```
award_editions   id, name ("SocialCon Africa 2025"), voting_opens_at, voting_closes_at,
                 committee_opens_at, committee_closes_at,
                 public_weight DECIMAL(3,2) DEFAULT 0.60, committee_weight DECIMAL(3,2) DEFAULT 0.40,
                 -- weights freeze once voting_opens_at passes (enforced in Settings service, audit-logged)
                 vote_unit_price_minor, currency, results_public (bool)

categories       id, edition_id, name, slug, description, sort_order

nominees         id, edition_id, category_id, user_id (nullable → self-registered account),
                 display_name, slug (unique, auto), bio, photo_path, cover_path,
                 country, status ENUM(draft, pending_review, verified, published, suspended),
                 votes_count (denormalized, rebuilt nightly), created_at …

nominee_socials  id, nominee_id, platform ENUM(tiktok, instagram, youtube, x, facebook, linkedin),
                 handle, profile_url, followers_count, verification_method
                 ENUM(bio_code, api_link, manual), verification_code, verified_at, raw_payload JSON

voters           id, identifier (email OR e164 phone, unique), channel ENUM(email, sms),
                 verified_at, last_otp_at, otp_hash, otp_expires_at, otp_attempts,
                 country, created_at

payments         id, uuid, voter_id, nominee_id, provider ENUM(chapa, telebirr, flutterwave, stripe, …),
                 provider_reference (UNIQUE), vote_quantity, unit_price_minor,
                 amount_minor, currency, status ENUM(initiated, pending, paid, failed, refunded),
                 raw_webhook JSON, paid_at
                 -- CHECK: amount_minor = vote_quantity * unit_price_minor

webhook_events   id, provider, provider_reference, event_type, signature_valid (bool),
                 payload JSON, status ENUM(received, processed, ignored, failed),
                 attempts, last_error, received_at, processed_at
                 -- UNIQUE(provider, provider_reference, event_type) → replay-proof inbox (see 2.4.1)

votes            id, payment_id (FK, indexed), nominee_id, voter_id, quantity,
                 edition_id, created_at
                 -- APPEND-ONLY. UNIQUE(payment_id). No update/delete path in code;
                 -- DB user for the app has no DELETE grant on this table.

committee_members id, admin_id, name, weight (default 1.0)

committee_scores id, committee_member_id, nominee_id, score (0–10, 1 dp),
                 comment, locked_at
                 -- UNIQUE(committee_member_id, nominee_id)

audit_logs       id, actor_type, actor_id, action, subject_type, subject_id, diff JSON, ip, created_at
```

Design notes:
- `votes` is a **ledger**, `nominees.votes_count` is a cache. A scheduled `RebuildVoteCounters` job recomputes counters from the ledger and alarms on any drift — drift means tampering or a bug, either way you want a page at 3 a.m.
- `provider_reference UNIQUE` makes webhook processing idempotent at the database level, not just in application logic. Replayed webhooks hit a constraint, not your vote count.
- Money stored in minor units (cents/santim) as integers, never floats.

## 2.3 Voter verification flow (email or phone)

Purpose check, bluntly: since every vote is paid, verification does **not** prevent vote fraud — the payment does. What verification actually buys you: (a) a durable identity to attach receipts and refunds to, (b) dispute/chargeback evidence, (c) analytics dedup, (d) a marketing list. So keep it as light as possible — every extra second here is lost revenue.

1. Voter enters email or phone on the nominee page.
2. `POST /api/voter/lookup` → if `voters.identifier` exists with `verified_at` → skip straight to payment. Response deliberately does not leak anything beyond `{verified: true|false}`.
3. If new/unverified: Cloudflare Turnstile check [KNOWN — free invisible CAPTCHA product, HIGH], then `IssueOtp`:
   - 6-digit code, stored **hashed** (SHA-256 + app key), 10-minute expiry, max 5 verify attempts, then invalidated.
   - Throttles (Redis): 3 OTP sends / identifier / hour; 10 sends / IP / hour; global circuit-breaker per provider to cap SMS spend if attacked.
4. Delivery — **channel follows the identifier** (decided): input parsed as email → email OTP via a transactional provider (Resend, Postmark, SES — near-zero cost); input parsed as E.164 phone → SMS OTP (Africa's Talking for African networks [KNOWN, MED]; Twilio Verify as global fallback [KNOWN, HIGH]).
   - Consequence you must engineer for [INFERRED, HIGH]: the SMS path lets an attacker choose the expensive channel at will by submitting phone numbers. Defenses: Turnstile before every OTP send, the throttles above, a per-day SMS budget circuit-breaker (setting `sms_daily_budget_minor` — channel auto-degrades to email-only when exhausted, with alert), and an admin kill-switch for the phone channel (see 2.10).
5. `POST /api/voter/verify-otp` → sets `verified_at`, drops a signed, httpOnly, 90-day `voter_token` cookie so returning voters skip both lookup friction and OTP.

## 2.4 Payment integration (the core of "no tricks")

**Provider reality for Ethiopia** — this decides your architecture more than anything else:
- Stripe does not support merchants based in Ethiopia [KNOWN, MED-HIGH — verify current country list before committing].
- The practical local rails are Telebirr and bank wallets; **Chapa** is an Ethiopian aggregator that exposes Telebirr, CBE Birr, and card payments behind one API with redirect checkout + webhooks [KNOWN, MED-HIGH — verify current product surface and settlement terms].
- Diaspora voters (a large share of paid votes for African diaspora-facing awards — [INFERRED]) need international card rails: Flutterwave or a card-capable aggregator [KNOWN that Flutterwave serves pan-African + international collection, MED].
- Conclusion: **build a `PaymentGateway` interface from day one** (`initiate(Payment): RedirectUrl`, `verifyWebhook(Request): WebhookResult`, `confirm(reference): PaymentStatus`) with `ChapaGateway` first and a second gateway pluggable. Do not couple controllers to any provider.

**The vote-purchase sequence (server-authoritative at every step):**

```
1. POST /api/checkout  {nominee_slug, voter_token, quantity}
   → server validates: voting window open, nominee published, voter verified
   → server computes amount = quantity × edition.vote_unit_price_minor   ← price NEVER from client
   → creates payments row (status=initiated, uuid)
   → calls gateway->initiate() → returns provider checkout URL
2. Voter pays on the provider's hosted page (no card data ever touches your server → minimal PCI scope)
3. Provider → POST /webhooks/{provider}
   → verify HMAC signature with provider secret; reject otherwise (log + alert)
   → write raw payload to webhook_events (status=received) — ONE tiny insert — then HTTP 200
     (never do business logic in the webhook request; ACK fast, process durably — see 2.4.1)
4. Queue worker runs SettlePayment(reference) — the single settlement path:
   → SELECT payments WHERE provider_reference = ? FOR UPDATE
   → already paid? → no-op (idempotent). Amount/currency mismatch? → flag, never settle
   → ONE DB transaction: payments.status=paid + INSERT votes (UNIQUE payment_id) + event=processed
   → after commit: dispatch VoteRecorded → counter increment, receipt email, cache bust
5. Voter's return URL polls GET /api/payments/{uuid}/status until paid → confetti + share screen
   (the return redirect is NEVER trusted as proof of payment — only settlement records votes)
```

### 2.4.1 Durability — the settlement pipeline (crash-safe, deadlock-free, exactly-once)

First, the principle that answers most of your scenarios at once: **recovery always rolls forward to completion, never backward.** [COMMON — standard distributed-systems doctrine] A confirmed payment whose vote isn't recorded yet is not "reversed and retried from scratch"; the system simply finishes the settlement, however many crashes it takes. The only backward operation that exists is a refund, and even that is recorded forward (a negative ledger row), never by deleting anything.

**Payment lifecycle (one state machine, one owner):**

```
initiated ──▶ pending ──▶ paid ──▶ [vote row exists = settled]
    │            │                        │
    ▼            ▼                        ▼
 expired      failed                  refunded (negative vote row appended)
```

**The exactly-once mechanism** is not clever code — it's three database facts working together:

1. **Transactional inbox.** The webhook endpoint does one thing: verify the HMAC, insert the raw payload into `webhook_events`, return 200. No business logic in the HTTP request. `UNIQUE(provider, provider_reference, event_type)` means a replayed or duplicated webhook physically cannot create a second event.
2. **One settlement transaction.** A queue worker runs `SettlePayment(reference)`: lock the single payments row (`FOR UPDATE`), and inside **one** DB transaction flip status to `paid`, insert the vote row, mark the event `processed`. Atomic: either all of it committed or none of it exists. A crash mid-transaction rolls back cleanly and the event is still unprocessed, so the worker simply runs it again.
3. **Idempotency by constraint.** `UNIQUE(payment_id)` on votes + the "already paid → no-op" guard means retrying settlement any number of times produces exactly one vote record. At-least-once delivery + idempotent processing = exactly-once effect [COMMON]. Enforced by MySQL, not by application discipline.

**Your scenarios, one by one:**

| # | Scenario | What actually happens | Recovery |
|---|---|---|---|
| 1 | "Vote recorded, then payment rejected" | **Impossible by construction.** The vote row is created only inside settlement of a provider-confirmed payment. There is no code path that writes a vote before `paid`. | Nothing to recover |
| 2 | Voter abandons / card declined | Payment stays `initiated`/`failed`; no vote ever existed | Sweep job marks `initiated` > 24h as `expired`. Zero cleanup |
| 3 | Payment "fails halfway" (ambiguous at provider) | Our row sits in `pending`; **the provider's verify API is the source of truth for money** | `ReconcilePendingPayments` (every 5 min) polls the provider for every `initiated/pending` row > 15 min old → settles or marks failed. Whether the voter's bank actually charged them is the provider's dispute process, not our ledger's problem |
| 4 | Payment completed but webhook lost (network/provider outage) | Provider retries webhooks [COMMON provider behavior], and independently the reconciler polls | Same `SettlePayment` path either way — webhook and reconciler share one code path, so there's exactly one settlement implementation to get right |
| 5 | **Payment completed, system crashes / load spike before vote is stored** | Event is durably in `webhook_events` (or reachable by the reconciler); the settlement transaction either committed fully or rolled back fully — no half-written state is possible | Worker retries with backoff until the transaction commits. Roll forward; the vote *will* be recorded, once |
| 6 | Worker processes the same event twice (race, redeploy) | Second run hits "already `paid` → no-op" or the votes `UNIQUE` constraint | Ignored by design |
| 7 | Vote committed but counter/leaderboard not updated | Ledger (truth) is correct; only the display is stale | Counter updates are after-commit events, retried; nightly `RebuildVoteCounters` recomputes from the ledger and alarms on drift |
| 8 | Refund / chargeback after settlement | Payment → `refunded`; a negative-quantity vote row is appended | Forward-recorded reversal; counts stay honest, history stays complete |

**Why no bottleneck and no deadlock:**

- The settlement transaction locks **exactly one** payments row and inserts into votes (no existing-row locks). One-row locking with a fixed pattern means lock-ordering deadlocks are structurally impossible, not just unlikely [COMMON — deadlocks require cycles across multiple locked rows].
- The hot spot on finale night would be the `nominees.votes_count` row of a popular nominee. So the counter increment is **outside** the money transaction: an after-commit `VoteRecorded` event updates Redis/DB counters asynchronously. Display is cosmetic and self-healing (nightly rebuild); the ledger is truth. The money path never waits on a hot row.
- Settlement transactions are single-digit milliseconds; workers scale horizontally; because every retry is idempotent, workers can be killed, redeployed, or duplicated at any moment with zero risk of double-counting.

**Traceability — every vote answers "prove it":** checkout mints a `payments.uuid` that is carried as metadata to the provider and back in the webhook, so one identifier links checkout → provider transaction → `webhook_events` (raw payload, attempts, `last_error`) → payment transition timestamps → vote row → counter event. The admin reconciliation dashboard surfaces every non-terminal state with its age, and three **invariant monitors** page you when the impossible happens: `paid` with no vote row for > 2 min; `webhook_events` stuck in `received` > 5 min; recount drift ≠ 0. Each of these should permanently read zero — an alarm means a bug or tampering, and either way you want it at 3 a.m., not at the awards ceremony.

Refunds flip status to `refunded` and insert a **negative-quantity vote row** (ledger stays append-only; counters stay honest).

## 2.5 Voting algorithm — 60% public / 40% committee

Per category:

```
public_score(n)    = votes(n) / max_votes_in_category × 100        (0 if category has zero votes)
committee_score(n) = weighted_mean(member scores for n) / 10 × 100  (weights from committee_members)
final_score(n)     = 0.60 × public_score(n) + 0.40 × committee_score(n)
Winner = argmax final_score; tiebreak 1: higher committee_score; tiebreak 2: earlier first vote.
```

**Worked example** (category with 3 nominees, committee scores are the average across members on 1–10):

| Nominee | Paid votes | Public normalized | ×0.6 | Committee avg | Normalized | ×0.4 | **Final** |
|---|---|---|---|---|---|---|---|
| A | 5,000 | 5000/5000 = 100 | 60.0 | 6.5 | 65 | 26.0 | **86.0** |
| B | 3,000 | 3000/5000 = 60 | 36.0 | 9.0 | 90 | 36.0 | **72.0** |
| C | 1,000 | 1000/5000 = 20 | 12.0 | 8.0 | 80 | 32.0 | **44.0** |

The 60% is **not a quota of votes** — you never decide "how many votes make up the 60." You collect all paid votes, normalize within the category (leader = 100), then apply the weight. [COMPUTED] property of this formula: since the committee side spans at most 40 final points, a nominee trailing the public leader by more than 40 normalized public points (here: anyone below 33.3% of the leader's vote count) is mathematically unable to win regardless of committee scores. That is the intended meaning of "60% public."

### 2.5.1 The scoring engine — spec and reference implementation

**The computation, in plain terms (per category):**

1. Sum every nominee's net paid votes from the ledger (`SUM(votes.quantity)` — refunds are negative rows, so nothing special to do).
2. Normalize within the category: leader = 100, everyone else `votes ÷ leader × 100`. Zero-vote category → everyone gets 0.
3. Committee: weighted mean of each nominee's submitted member scores (1–10, member weights from `committee_members.weight`), ×10 → 0–100.
4. `final = public_weight × public + committee_weight × committee`, rounded to 4 decimals.
5. Rank by: final ↓, then committee ↓, then earliest first paid vote ↑, then nominee id ↑. Total ordering — identical inputs always produce the identical ranked list.

**Design rules that make it changeable without breaking:**

- **Pure core, no framework.** `App\Domain\Scoring\*` imports nothing from Laravel — no DB, no clock, no settings lookups. A `ComputeFinalScores` action reads the ledger + ballots into plain arrays and calls the scorer. Purity is what makes the engine exhaustively testable, and testable is what "free of bugs" actually means in practice.
- **Weights are data, not code.** `public_weight` / `committee_weight` live on `award_editions`; a 70/30 edition next year is an admin edit, zero code. Weights **freeze once voting opens** (Settings service refuses the write, audit-logged) — changing the formula mid-competition is goalpost-moving, and the engine should make it impossible rather than merely discouraged.
- **Normalization is a strategy.** Swapping max-based for share-based (or anything else) is one new class + one binding; the interface forces the same contract.
- **Fail loud, never guess.** A nominee with no committee scores throws `IncompleteBallotsException`. The ballot wizard guarantees completeness, so a gap at scoring time is data corruption — silently averaging around it would hide exactly the bug you most need to see.
- **Reproducibility.** `ComputeFinalScores` snapshots into a `results` table: the config used (weights, strategy, precision), a hash of the inputs (vote sums + ballots), and the output. Anyone can re-run the pure function on archived inputs and byte-compare against the published outcome.

**Reference implementation (PHP 8.4):**

```php
// app/Domain/Scoring/ScoringConfig.php
final readonly class ScoringConfig
{
    public function __construct(
        public float $publicWeight,               // from award_editions (e.g. 0.60)
        public float $committeeWeight,            // from award_editions (e.g. 0.40)
        public NormalizationStrategy $normalization,
        public int $precision = 4,
    ) {
        if (abs(($publicWeight + $committeeWeight) - 1.0) > 1e-9) {
            throw new InvalidArgumentException('Weights must sum to 1.0');
        }
    }
}

// app/Domain/Scoring/NormalizationStrategy.php
interface NormalizationStrategy
{
    /** @param  array<int,int> $netVotes nominee_id => net paid votes
     *  @return array<int,float>          nominee_id => 0..100          */
    public function normalize(array $netVotes): array;
}

// app/Domain/Scoring/MaxNormalization.php — default: leader = 100
final class MaxNormalization implements NormalizationStrategy
{
    public function normalize(array $netVotes): array
    {
        $max = $netVotes === [] ? 0 : max($netVotes);

        return array_map(
            static fn (int $v): float => $max > 0 ? ($v / $max) * 100.0 : 0.0,
            $netVotes,
        );
    }
}

// app/Domain/Scoring/CategoryScorer.php — PURE: no DB, no clock, no framework
final readonly class CategoryScorer
{
    public function __construct(private ScoringConfig $config) {}

    /**
     * @param array<int,int>  $netVotes    nominee_id => SUM(votes.quantity), refunds included as negatives
     * @param array<int,list<array{score: float, weight: float}>> $ballots
     *                                     nominee_id => submitted committee scores (1–10) with member weight
     * @param array<int,?int> $firstVoteAt nominee_id => unix ts of first paid vote (null = never voted)
     * @return list<NomineeResult>         ranked, winner first, deterministic
     */
    public function score(array $netVotes, array $ballots, array $firstVoteAt): array
    {
        $public = $this->config->normalization->normalize($netVotes);

        $results = [];
        foreach ($netVotes as $id => $votes) {
            $scores = $ballots[$id]
                ?? throw new IncompleteBallotsException("Nominee {$id} has no committee scores");

            $committee = $this->weightedMean($scores) * 10.0;   // 1–10 → 0–100

            $results[] = new NomineeResult(
                nomineeId:      $id,
                netVotes:       $votes,
                publicScore:    round($public[$id], $this->config->precision),
                committeeScore: round($committee, $this->config->precision),
                finalScore:     round(
                    $this->config->publicWeight    * $public[$id]
                  + $this->config->committeeWeight * $committee,
                    $this->config->precision,
                ),
                firstVoteAt:    $firstVoteAt[$id] ?? null,
            );
        }

        usort($results, static fn (NomineeResult $a, NomineeResult $b): int =>
              [$b->finalScore, $b->committeeScore, $a->firstVoteAt ?? PHP_INT_MAX, $a->nomineeId]
          <=> [$a->finalScore, $a->committeeScore, $b->firstVoteAt ?? PHP_INT_MAX, $b->nomineeId]);

        return $results;
    }

    /** @param list<array{score: float, weight: float}> $scores */
    private function weightedMean(array $scores): float
    {
        $totalWeight = array_sum(array_column($scores, 'weight'));
        if ($totalWeight <= 0.0) {
            throw new IncompleteBallotsException('Zero total committee weight');
        }

        $sum = 0.0;
        foreach ($scores as $s) {
            if ($s['score'] < 1.0 || $s['score'] > 10.0) {
                throw new InvalidScoreException("Score {$s['score']} outside 1–10");
            }
            $sum += $s['score'] * $s['weight'];
        }

        return $sum / $totalWeight;
    }
}
```

**Change matrix — "slightly change it and it still works":**

| Change you'll want someday | What you touch |
|---|---|
| 70/30 instead of 60/40 | Edition field in admin (only before voting opens) — **zero code** |
| Share-based or other normalization | One new class implementing `NormalizationStrategy` + container binding |
| Different tiebreak order | One entry in the `usort` comparator + its test |
| Per-category weights | Move weight columns to `categories`; build `ScoringConfig` per category in the action |
| Score scale (e.g. 1–100) | Wizard input bounds + `weightedMean` bounds + tests |
| Vote caps / diminishing weight | Pre-processing of `$netVotes` in the action — the scorer stays untouched |

**Test strategy — where "free of bug" is earned rather than claimed:**

- **Golden test:** the worked example table above, asserted digit-for-digit. If anyone changes the math, this test names the exact behavioral change in its diff.
- **Property tests (Pest):** scaling every vote count by k changes nothing (scale invariance); the vote leader always receives the full public weight; adding votes to a nominee never lowers their final score (monotonicity); rounding never reorders ranks at the configured precision.
- **Edge tests:** empty category, all-zero votes, single nominee, exact tie resolved through all four tiebreak levels, refund-heavy nominee going net-negative.
- **Mutation testing** with Infection [KNOWN — the standard PHP mutation-testing tool, HIGH] at 100% MSI on `Domain/Scoring` only — a small pure module is the one place the strictest bar is affordable.


- Max-normalization (leader = 100) is the standard formulation and keeps the two components on the same 0–100 scale [COMMON]. Alternative: share-based (`votes/Σvotes`) — punishes crowded categories; I'd reject it. If you want it anyway, it's a one-line change in `ComputeFinalScores`.
- Sequencing (decided): **committee votes after public voting closes** — clean operationally, but only legitimate under one condition: committee scoring is **blind**. The committee portal (2.11) never displays vote counts, rankings, or other members' scores; tallies are revealed to members only after every ballot is submitted or the committee window closes. A committee that can see the public tally while scoring can engineer any winner with its 40% — that's the scandal that kills award shows [INFERRED]. Blindness + per-ballot audit trail is what lets you publish the methodology with a straight face.
- Blunt design flaw you should decide on, not stumble into: unlimited paid votes + max-normalization means **one wealthy backer can buy a category**. That may be exactly the business model (it's how many pageant/award fundraisers work [COMMON]). If you want optics protection, options in ascending order of complexity: publish vote counts transparently; cap counted votes per voter per nominee per day (excess payments become "support," still revenue, capped weight); or diminishing weight (√quantity). **Decided:** cap policy is an admin setting — default unlimited (max revenue), with `per_voter_total` and `per_voter_daily` modes available (see 2.10). Live counts default to hidden, also a setting. One hard rule regardless of mode: caps are enforced **before** payment is taken, never after — you must not accept money for votes you won't count.
- Legal note [INFERRED, LOW — not legal advice, verify with counsel]: outcome depends 40% on judged merit and there's no chance element, so this is a skill/popularity contest, not gambling — but paid-voting contests can trigger consumer-protection and refund rules per jurisdiction, and Telebirr/Chapa acceptable-use policies should be checked for "voting" as a category.

## 2.6 Anti-fraud / hacking tolerance (summary of hard controls)

1. Votes created only inside verified-signature webhook handlers (single invariant).
2. Amount, price, quantity, currency all recomputed/verified server-side; client sends `quantity` only.
3. `UNIQUE(provider_reference)` + `UNIQUE(payment_id)` in votes → replay-proof at DB level.
4. Append-only ledger; app DB user has no `DELETE`/`UPDATE` grant on `votes`; nightly recount-vs-counter alarm.
5. OTP hashed, throttled, expiring; Turnstile before OTP issuance; SMS spend circuit-breaker.
6. Rate limits: checkout 10/min/voter, lookup 20/min/IP; Cloudflare (or similar) in front for L7 DDoS — a voting site with money attached **will** be flooded on the final night [INFERRED, HIGH].
7. Admin: separate guard, mandatory TOTP 2FA, IP allowlist optional, every mutation in `audit_logs`.
8. Webhook endpoints excluded from CSRF but protected by HMAC; all other POSTs CSRF-protected (Inertia default).
9. Secrets in env/manager only; provider secrets rotated per edition.
10. Results computation is a pure function over the ledger — anyone with DB read access can independently re-derive the winner. Auditable beats "trust us."

## 2.7 Nominee registration + social verification

Flow: `Register → email verify (starter kit) → nomination wizard (category, bio, photos, social handles) → social ownership verification → admin review → status=published → personal link live`.

**Social verification — cheap, no per-platform developer apps, two layers:**

- **Layer 1 — Ownership (near-free, no API): bio-code challenge.** On submitting a handle, generate `SCA25-7F3K9Q`; nominee places it in their bio (or a pinned post) for 24h; a queued job fetches the public profile and confirms the code, then `verified_at` is set. This proves control of the account, which is the thing that actually matters, and costs ~nothing. Fetching public pages is rate-limited/blocked by platforms [COMMON], so route fetches through a scraping API (ScraperAPI/Bright Data class of service) [KNOWN such services exist, MED on any specific pricing] — or fall back to admin eyeball verification (30 seconds per nominee; at your scale of hundreds of nominees this is genuinely viable).
- **Layer 2 — Stats (paid, optional): follower counts and engagement** displayed on nominee cards. Third-party influencer-data APIs (Modash, HypeAuditor, Phyllo/InsightIQ class) return public metrics by handle across platforms through one API [KNOWN these products exist, MED; pricing/tiers UNKNOWN — get current quotes]. Phyllo-style "Connect" flows where the creator OAuths their own accounts through the vendor's app also satisfy "no individual app per platform" [KNOWN, MED]. My recommendation: launch with Layer 1 + self-reported follower counts marked "self-reported," add a data API only if sponsors demand certified numbers.

**Auto personal link:** slug generated from display name (`/n/amira-tesfaye`, collision-suffixed), plus `socialconafrica.com/v/{slug}` short redirect for print/stories, plus server-generated QR (endroid/qr-code or simple-qrcode [KNOWN both are established PHP QR packages, MED]) and a downloadable "Vote for me" share kit (pre-sized story/post images with the nominee photo, name, QR — generated once via an image job). Open Graph tags per nominee page so pasted links unfurl with their face and a Vote button. The share kit is your growth engine: nominees do your marketing [INFERRED].

## 2.8 Admin panel

Filament (Laravel admin framework) [KNOWN, HIGH] on the `admin` guard rather than hand-building CRUD in Inertia: nominee review queue, category/edition management, payments + reconciliation dashboard, committee scoring UI (locks at deadline), refunds (with the negative-vote ledger entry), audit log viewer, exports. Committee members get a stripped Filament role that can only score.

## 2.9 API surface (public, all rate-limited)

```
GET  /                         Inertia: Home
GET  /nominees?category=&q=    Inertia: gallery (cursor-paginated)
GET  /n/{slug}                 Inertia: nominee profile
POST /api/voter/lookup         {identifier} → {verified}
POST /api/voter/request-otp    {identifier, turnstile_token}
POST /api/voter/verify-otp     {identifier, code} → sets voter cookie
POST /api/checkout             {nominee_slug, quantity} → {checkout_url}
GET  /api/payments/{uuid}/status
POST /webhooks/{provider}      HMAC-verified, no CSRF
GET  /results                  Inertia: leaderboard (only if results_public setting is on)
```

## 2.10 Runtime configuration — the admin settings layer

**Decided: everything operational is a setting changed from the admin panel, not a deploy.**

```
settings   id, edition_id (nullable = global), key, value JSON, updated_by, updated_at
           UNIQUE(edition_id, key)
```

Launch key set:

| Key | Type | Default |
|---|---|---|
| `voting_enabled` | bool | false |
| `vote_unit_price_minor` | int | *(you set at launch)* |
| `currency` | string | *(you set at launch)* |
| `show_live_counts` | bool | **false** |
| `show_rank` | bool | false |
| `cap_mode` | none · per_voter_total · per_voter_daily | **none** (unlimited) |
| `cap_value` | int | — |
| `channels_enabled` | [email, sms] | both |
| `sms_daily_budget_minor` | int | — (circuit-breaker for OTP spend) |
| `results_public` | bool | false |

Mechanics:
- Typed `Settings` service, Redis-cached, cache busted on save; pushed to React through Inertia shared props, so toggles (voting on/off, count visibility, price) take effect immediately with no deploy.
- Every change is written to `audit_logs` (who, when, old → new). Dangerous toggles (disable voting mid-window, price change) require a confirmation step in Filament.
- **Forward-only semantics:** `payments` snapshots `unit_price_minor` at initiation, so a price change never alters in-flight checkouts; a cap change never retroactively invalidates votes already paid for. Anything else invites refund chaos and accusations of moving goalposts [INFERRED, HIGH].
- Cap enforcement lives at checkout creation (server-side, against the ledger); the webhook re-checks, and the rare race-window overflow is flagged for admin refund rather than silently counted or silently kept.

## 2.11 Committee voting module (internal portal)

Sequence (decided): public voting closes → committee window opens (`committee_opens_at` / `committee_closes_at` settings) → members submit ballots → `ComputeFinalScores` runs.

**Provisioning:**
1. Admin creates each committee member in Filament: name, email, assigned categories, weight.
2. System emails a **single-use, signed invitation link** (72h expiry); on first open the member sets their own password (optional forced TOTP). Pushback on "share their login to their emails": do not email passwords. Plaintext credentials in an inbox are both a real compromise vector and a deniability gift — "someone used the password you emailed me" nullifies your audit trail [COMMON security practice]. The invite link is exactly as smooth for the member and removes both problems.
3. Login at `/committee` — a third auth guard (`committee`), sessions isolated from public voters and admins.

**Ballot wizard** (Inertia flow, mobile-friendly — this is the "pick, vote, next" experience):

```
/committee/welcome     instructions, methodology, progress ring (e.g. 0 / 24 nominees)
→ one step per nominee (grouped by category):
    photo · bio · verified socials · entry content · score input (1–10)
    NO vote counts, NO rankings, NO other members' scores — blind by design
    [Back] [Save & Next]  — every step autosaves a draft; member can leave and resume
→ /committee/review    all scores in one editable table
→ Submit ballot        scores lock (locked_at), on-screen confirmation +
                       emailed receipt containing a hash of the ballot
                       (tamper-evidence the member independently holds)
```

**Schema addendum:** `committee_scores.status ENUM(draft, submitted)`; new table `committee_ballots (id, committee_member_id, edition_id, submitted_at, ballot_hash)`.

**Admin side:** submission-progress dashboard, one-click reminders, window extension (audit-logged). Admins can never edit a member's scores — the only intervention is voiding an entire ballot with a written reason (logged) and re-inviting. That asymmetry is deliberate: editable committee scores make the 40% worthless as evidence [INFERRED].

**Blindness enforcement is structural, not cosmetic:** the committee portal's queries touch nominee content tables only — no code path from the `committee` guard reaches the votes ledger or counters. Tallies and final results are revealed to members only after all ballots are in or the window closes.

## 2.12 Ticketing & attendee registration (reuses the voting money pipeline)

The event sells tiered passes through the same hardened payment machinery as votes — one settlement pipeline to secure, not two.

**Registration wizard (matches the approved site structure):** Personal Info → Select Pass → Accommodation → Add-Ons → Review & Pay. Attendees are their own identity (`attendees`) — NOT voters, NOT nominee accounts; no forced login to buy a ticket.

```
ticket_tiers  id, edition_id, name*, description*, perks* (JSON list), price_minor, currency,
              quota, sold_count, sales_open_at, sales_close_at, badge_color, sort, active
              -- seeded: Friday Free Pass (0) · Creator Pass (199 USD) · All-Access VIP (499 USD)
              -- all admin-editable like everything else; * = translatable (see 2.15)
addons        id, edition_id, name*, description*, price_minor, quota, sold_count, active
              -- seeded: Airport Transfer 40 · City Tour 75 · Advanced Workshop 120 · Gala After-Party 90
hotels        id, name*, description*, sort, active        (informational selection incl. "own stay")
attendees     id, edition_id, first_name, last_name, email, phone, country, company,
              photo_path, locale, created_at
orders        id, uuid, attendee_id, provider, provider_reference UNIQUE, status
              ENUM(initiated, pending, awaiting_transfer, paid, failed, expired, refunded),
              amount_minor, currency, raw_webhook JSON, paid_at
order_items   id, order_id, type ENUM(ticket, addon), reference_id, quantity, unit_price_minor
tickets       id, uuid, order_id, attendee_id, tier_id, qr_signature, status
              ENUM(valid, checked_in, void), checked_in_at, badge_pdf_path
```

Rules:
- **One settlement path.** Orders flow through the identical PaymentGateway interface, webhook inbox, and roll-forward durability of 2.4/2.4.1 — the fulfillment action issues tickets instead of inserting votes, with the same idempotency (`UNIQUE provider_reference`, unique fulfillment per order) and the same invariant monitor (`paid` order with no ticket > 2 min → page).
- **Free pass = a zero-amount order through the same pipeline** via an internal `FreeGateway` that settles instantly. No special-case code path; a free ticket is an order like any other, which keeps quotas, badges, and reporting uniform.
- Server recomputes every total from `ticket_tiers`/`addons` prices — the client sends selections only (same never-trust-amounts rule as voting).
- **Quotas** enforced at checkout (atomic `sold_count` increment guarded by quota, rolled back on expiry) — never sell seat 501 of 500.
- **Bank transfer** (offered on the current site) = `awaiting_transfer`: instructions + reference emailed; admin confirms receipt in Filament (audit-logged) → same fulfillment action fires. Auto-expire unconfirmed transfers after N days (setting).
- PayPal on the existing payment list: verify availability for an Ethiopia-based receiving entity before promising it in the UI [KNOWN PayPal's Ethiopia receiving support is limited, MED — confirm with your corporate structure]; the gateway abstraction makes it a plug-in either way.

## 2.13 Badges, QR codes & check-in

- On fulfillment, each ticket gets a **signed QR**: the code encodes `/t/{ticket_uuid}?s={HMAC}` — the signature is verified server-side at scan, so a screenshot of someone else's forged code fails and the payload contains no personal data.
- A queued `GenerateBadge` job renders a personalized badge PDF per ticket: tier-colored band (`ticket_tiers.badge_color` — Free/Creator/VIP visually distinct at the door), attendee name + organization, photo if uploaded, QR, edition branding — emailed with the receipt and downloadable from the confirmation page. Print-ready A6; Apple/Google Wallet passes are a phase-2 nicety.
- **Check-in:** a staff-only mobile web scanner (admin guard): scan → signature verified → attendee card shown → one-tap check-in flips `valid → checked_in` atomically; a second scan shows "already checked in at HH:MM by <staff>" instead of admitting twice. Check-ins are audit-logged; a live dashboard shows arrivals by tier.
- Agenda "Add to Calendar" buttons are server-generated ICS files per session — no third-party service.

## 2.14 Sponsors & CMS content modules — "editing content is easy" as an architectural rule

Hard rule: **zero hardcoded copy in React components.** Every public string is either a UI-chrome translation key (lang files, 2.15) or a database-backed translatable field managed in Filament. The approved site structure maps to these models (fields marked * are translatable):

```
sponsor_tiers    id, name*, slug (title/platinum/gold/supporting), benefits* (JSON list), sort
sponsors         id, tier_id, name, logo_path, description*, url, sort, active
speakers         id, name, title*, bio*, photo_path, category ENUM(creator_economy,
                 business, policy, technology), socials JSON, featured, sort, active
agenda_days      id, edition_id, date, label*, theme*
agenda_items     id, day_id, starts_at, ends_at, kind ENUM(ceremony, keynote, panel,
                 workshop, break), track ENUM(all, creator_economy, business, policy),
                 title*, description*, location*, speaker_ids JSON, sort
award_categories id, edition_id, name*, description*, icon, sort      ← the six gala categories
leader_messages  id, name, role*, quote*, photo_path, sort            ← PM / AU Chairperson band
testimonials     id, name, role*, company, country, quote*, sort      ← "Voices of Impact"
attend_personas  id, title*, description*, icon, sort                 ← "Who Should Attend" (6 cards)
platform_logos   id, name, logo_path, url, sort                       ← "Featured Platforms" band
content_blocks   edition_id, key, value* (rich JSON)                  ← hero copy, About, Awards-gala
                                                                        details, footer CTA, contact info
form_submissions id, kind ENUM(contact, speaker_application), payload JSON, locale, created_at
```

- Sponsors render from one dataset in both places the structure uses them (homepage band + Sponsors page with tier filter chips); partnership-package cards are `sponsor_tiers.benefits`. Adding a sponsor is a Filament form, not a deploy.
- Award categories drive both the Awards page grid and the voting platform's category structure — one source, no drift between the marketing page and the ballot.
- Contact + Apply-to-Speak forms: Turnstile-protected, throttled, stored in `form_submissions`, forwarded by mail to the team inbox.
- Ticket tiers, add-ons, hotels (2.12) follow the same translatable-and-Filament-managed pattern — the entire Register wizard is content-driven.

## 2.15 Internationalization — English · Amharic (አማርኛ) · French

- **Locale routing:** `/en/...`, `/am/...`, `/fr/...` with a persistent switcher (cookie), English default, `hreflang` tags for SEO. Slugs stay language-neutral (`/am/n/amira-tesfaye`).
- **Two translation layers, no third:** (1) UI chrome — Laravel JSON lang files per locale, shared to React through Inertia props with a `t()` helper; (2) content — translatable model fields stored as per-locale JSON columns via spatie/laravel-translatable [KNOWN — the standard Laravel package for JSON-column attribute translations, HIGH], edited in Filament with per-locale tabs.
- **Fallback chain:** missing am/fr falls back to English at render time (never a blank), and an admin "missing translations" report lists every untranslated field so gaps are a checklist, not a surprise.
- Amharic is written **left-to-right** [KNOWN, HIGH] — none of the three locales needs RTL work. What Amharic does need: an Ethiopic-capable font in the stack (Noto Sans Ethiopic) with tested line-heights, since Ethiopic glyphs run taller than Latin [COMMON typography practice].
- Locale-aware everything downstream: currency/number/date formatting via `Intl`, and transactional messages (OTP, receipts, badges, ticket emails) rendered in the recipient's stored locale.
- Definition of done for any new component: it renders correctly in all three locales with no hardcoded string — enforced by a CI grep for literal copy in `resources/js`.

---

# 3. FRONTEND PLAN (React 19 · Inertia 3 · Tailwind 4 · shadcn/ui)

## 3.1 Pages

| Page | Purpose | Key elements |
|---|---|---|
| **Home** | Publicity + funnel to voting | Full-bleed hero with the deck's identity, countdown to voting close, category strip, "Featured nominees" marquee, sponsor logos, single dominant CTA: **Vote Now** |
| **Nominees (Vote page)** | The showroom | Sticky category filter chips + search; responsive card grid; each card = photo, name, country flag, platform icons w/ follower counts, live vote count (optional toggle), **Vote** button opening the flow directly from the card |
| **Nominee profile** `/n/{slug}` | Conversion page | Cover + portrait hero, verified-badge socials, bio, embedded content, live vote position ("#3 in Creator of the Year"), the **VoteWidget**, share bar (WhatsApp/TikTok/IG/X/copy + QR) |
| **Vote flow** (modal/drawer over profile — never a page navigation) | The money path | 3 steps, detailed below |
| **Nominee registration** | Self-serve onboarding | Starter-kit auth + 4-step wizard (identity → category & bio → media → socials + bio-code instructions), status tracker dashboard |
| **Results** | Post-close | Animated reveal, per-category podium, public/committee split shown per your transparency decision |
| **Committee portal** `/committee` | Internal, blind scoring | Invite-link onboarding, per-nominee wizard with autosave, review table, submit-and-lock, receipt (full spec in 2.11) |

### 3.1.1 Full public sitemap (per the approved content structure — all content from the CMS models in 2.14)

| Page | Composition |
|---|---|
| **Home** | Hero (headline, date, Register Now + Learn More) → Featured Platforms band → About Event → Leaders' Messages (PM of Ethiopia, AU Commission Chairperson) → In Numbers (55 / 100+ / 150+ / 200+) → Featured Speakers rail → Who Should Attend (6 personas) → Voices of Impact testimonials → Partners & Sponsors band → closing Register CTA |
| **Agenda** | Day selector → track filter chips (All / Creator Economy / Business Strategies / Digital Policy) → timeline of sessions (time, kind badge, title, speaker, location, description) each with server-generated Add-to-Calendar ICS → closing Register CTA |
| **Speakers** | Hero copy → search + category chips → speaker card grid → Apply-to-Speak CTA + form |
| **Sponsors** | Hero → tier filter chips (All / Title / Platinum / Gold / Supporting) → sponsor cards → partnership package cards (from tier benefits) → Become-a-Partner CTA |
| **Awards** | Gala hero + narrative → Nominate Now CTA (→ nominee registration) → six award-category cards → Gala Evening details block (time, date, dress code, experience) |
| **Vote** | The nominee gallery (3.1) — award categories shared with the Awards page |
| **Contact** | Form (Turnstile, stored + mailed) → contact info block → social links |
| **Register** | 5-step wizard (2.12): Personal Info → Select Pass (tier cards) → Accommodation → Add-Ons → Review & Pay → confirmation with badge download |
| **Footer** | CTA band + Quick Links + Explore More columns — all `content_blocks` |

## 3.2 The VoteWidget — the whole business in one component

State machine (XState or a typed reducer — this must be exhaustively testable):

```
idle → identify (email/phone input)
     → lookup ──verified──────────────→ quantity
               └─unverified→ otp (6-digit input, resend timer) → quantity
quantity (1 / 5 / 10 / 25 / custom, live price, price from server props)
     → redirecting (provider checkout)
     → returning (poll /status, skeleton + "confirming payment…")
     → success (confetti, updated count animates up, share prompt: "Tell your friends you voted")
     → failure (retry keeps all state; support link)
```

UX rules: returning voter with cookie lands directly on `quantity` — **two taps to pay**. One smart input, not a channel choice: the field parses what's typed — email pattern → email OTP, digits → phone formatting with country-code select (GeoIP default) → SMS OTP. The voter never picks a "verification method"; the identifier is the method (decided). Everything mobile-first; assume ≥85% of traffic is phones [INFERRED from African social-traffic patterns, MED]. Optimistic UI nowhere near money — counts update only after `status=paid`.

## 3.3 Structure & shared plumbing

```
resources/js/
  pages/{home,nominees/index,nominees/show,register/…,results}.tsx
  components/vote/{VoteWidget,OtpInput,QuantityPicker,PaymentStatus}.tsx
  components/nominee/{Card,SocialBadge,ShareBar,QrPoster}.tsx
  components/layout/{PublicNav,Footer,CategoryChips}.tsx
  lib/{currency,phone,analytics}.ts
```

- Inertia shared props: current edition, voting window, unit price, currency, voter cookie state. Deferred props + skeletons (Inertia 3 `defer`) for heavy gallery data [KNOWN Inertia 3 supports deferred props, HIGH].
- Vote counts on gallery: cached server-side (60s Redis) — nobody needs realtime except the profile page, which can poll or use a lightweight broadcast via Laravel Reverb (you've already operated Reverb in production, so it's low-risk for you; but polling every 15s is honestly sufficient and one less moving part on finale night).
- Framer Motion for card entrances, count-up animations, results reveal. Respect `prefers-reduced-motion`.

---

# 4. DESIGN SCHEME & THEME — v2 (supersedes the earlier playful direction)

Direction (decided after reviewing v1 output against the current socialconafrica.com): **premium continental-summit quality** — corporate maturity in the register of a world-class conference brand, with warmth delivered exclusively through the multicolor wordmark identity used as small, disciplined accents. Not playful, not gaming-like. Heads of state and AU leadership appear on this site; the design must be worthy of that company. Delight comes from precision — spacing, type scale, one accent per component, calm micro-interactions — never decoration.

## 4.1 Tokens (Tailwind 4 `@theme`)

```css
@theme {
  /* Neutrals carry the site */
  --color-ink:     #1C1B1A;  /* pill navbar, footers, dark hero overlays */
  --color-charcoal:#3A3835;  /* secondary dark surfaces */
  --color-mist:    #F5F5F4;  /* default section background */
  --color-surface: #FFFFFF;  /* cards, content */
  --color-slate:   #55534F;  /* body text on light */

  /* Accents — small, rare, one per component */
  --color-action:  #E8622C;  /* signal orange: Buy Ticket, Register, Vote, Pay */
  --color-sun:     #F5C518;  /* active-nav underline, rank medals, markers */
  --color-leaf:    #5BA054;  /* category identities + data accents only:   */
  --color-sky:     #3D8FD1;  /*   3px card top-rules, stat numerals, chips */
  --color-coral:   #D95043;
  --color-violet:  #7C5CB8;

  --radius-card: 1rem;
}
```

- **Type:** one geometric-humanist sans family (Poppins-class) with strong weight contrast — Bold display at generous sizes, Regular body, wide-tracked uppercase micro-labels. No decorative faces.
- **The one flourish:** large section headlines may carry a two-color gradient sweep (as the current site's "African Influencer Awards Gala" / "In Numbers" headlines) — the signature warmth moment; everything around it stays neutral.
- **Photography is the energy source:** full-bleed dark-overlay event heroes; nominee/speaker portraits in refined monochrome or subtle duotone with a single color identity element (3px category top-rule or colored footer band). Photography brings the life so the UI stays composed.
- **Component language (evolved from the current site):** floating ink pill navbar with sun-yellow active underline + orange CTA; white 16px-radius cards with soft ambient shadow; pill filter chips (ink = active); vertical timelines with small colored dots; thin outline-circle and circular-text motifs as the only background ornament.
- **Hard visual rules:** one orange action per viewport; accents ≤ ~5% of any screen's area; motion limited to fades/soft parallax/count-ups at 200–300ms (nothing bounces); WCAG AA with ink/slate text on light — accents are graphic elements and large numerals, never body text [COMMON accessibility practice].
- **Success moment:** animated checkmark draw-on + tally count-up + composed share card. No confetti, no particles — applause in a concert hall, not a slot machine.

## 4.2 Producing the visual theme with Claude Design

Use the v2 prompt file (claude-design-prompt-socialcon-v2.md) and attach the screenshots of the current site as the visual baseline alongside it. Iterate screen by screen (gallery card first — it sets the system), and reject on first sight anything that reads gaming-like; drift compounds.

---

# 5. DELIVERY PLAN

**Phase 1 — Money path (weeks 1–3):** starter kit, schema + migrations, PaymentGateway interface + Chapa, OTP service, VoteWidget end-to-end on a seeded nominee page, webhook → ledger → counter, receipts. *Exit test: it is impossible to create a vote row by any request that isn't a signed webhook, proven by Pest tests that attempt every bypass.*

**Phase 2 — Public site + CMS/i18n foundation (weeks 3–5):** content models + translation layers (2.14/2.15) FIRST — retrofitting i18n is misery — then Home, gallery, profile pages rendered from CMS data in all three locales, theme v2 implementation, share kit + QR, OG tags, results page (hidden), Cloudflare + rate limits.

**Phase 3 — Nominee, ticketing & admin (weeks 5–8):** nominee registration wizard, bio-code verification job, Filament admin, committee portal (invite links, blind ballot wizard, submit-and-lock — 2.11), attendee ticketing wizard + orders + quotas (2.12), badge generation + check-in scanner (2.13), sponsors + agenda + speakers CMS (2.14), reconciliation dashboard, audit logs.

**Phase 4 — Hardening (week 9):** load test the finale-night scenario (spike on checkout + webhooks), chaos-test lost webhooks, penetration pass on the money path, second payment provider if diaspora rails confirmed needed.

**Resolved (all admin-configurable via 2.10):** live-count visibility — default hidden; cap policy — default unlimited, cap-per-person and cap-per-person-per-day available; verification channel — follows the identifier the voter enters (email → email OTP, phone → SMS OTP); voting on/off and vote price — admin-set at runtime.

**New conflict to resolve:** the approved Vote-page copy says "One vote per email, per category" — that is a different product from the decided paid-unlimited model. The copy must be rewritten to describe paid voting honestly (e.g. "Verified voting — every vote counts, vote as many times as you like"), or the model changes; shipping copy that contradicts the mechanism is the fastest route to refund demands and public accusations.

**Still open (blocking):** ① launch **default** for vote price + currency — configurable doesn't remove the need for an initial value, and it drives whether you run single-currency (ETB) or dual (ETB + USD for diaspora, which forces the second gateway earlier); ② Chapa settlement terms + acceptable-use review of "paid voting" — verify before writing payment code; ③ SMS provider choice + the daily OTP budget number.
