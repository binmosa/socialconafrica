<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vote_orders', function (Blueprint $table) {
            $table->id();
            $table->ulid('reference')->unique();
            $table->foreignId('voter_id')->constrained()->restrictOnDelete();
            $table->foreignId('nominee_id')->constrained()->restrictOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('vote_qty');
            $table->unsignedInteger('unit_price_minor');
            $table->unsignedInteger('amount_minor');
            $table->char('currency', 3)->default('ETB');
            $table->string('pricing_version');
            $table->string('status')->default('CREATED');
            $table->timestamp('finalized_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('voter_id');
            $table->index('nominee_id');
            $table->index(['status', 'created_at']);
        });

        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vote_order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway');
            $table->string('gateway_reference')->unique();
            $table->ulid('idempotency_key')->unique();
            $table->string('status')->default('INITIATED');
            $table->unsignedInteger('amount_minor');
            $table->text('redirect_url')->nullable();
            $table->json('gateway_request')->nullable();
            $table->json('gateway_result')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            $table->index('vote_order_id');
            $table->index(['status', 'created_at']);
        });

        Schema::create('payment_webhook_calls', function (Blueprint $table) {
            $table->id();
            $table->string('gateway');
            $table->string('gateway_reference')->nullable()->index();
            $table->json('payload');
            $table->json('headers')->nullable();
            $table->boolean('signature_valid')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->text('error')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhook_calls');
        Schema::dropIfExists('payment_attempts');
        Schema::dropIfExists('vote_orders');
    }
};
