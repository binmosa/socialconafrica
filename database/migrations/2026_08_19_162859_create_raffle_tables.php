<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raffle_draws', function (Blueprint $table) {
            $table->id();
            $table->string('week_key')->unique();
            $table->timestamp('opens_at');
            $table->timestamp('closes_at');
            $table->timestamp('draw_at');
            $table->string('status')->default('SCHEDULED');
            $table->json('prize_config');
            $table->json('audit_metadata')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('raffle_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('raffle_draw_id')->constrained()->cascadeOnDelete();
            $table->foreignId('voter_id')->constrained()->restrictOnDelete();
            $table->foreignId('vote_order_id')->unique()->constrained()->restrictOnDelete();
            $table->string('status')->default('ELIGIBLE');
            $table->timestamp('created_at')->nullable();

            $table->index(['raffle_draw_id', 'voter_id']);
            $table->index(['raffle_draw_id', 'status']);
        });

        Schema::create('raffle_winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('raffle_draw_id')->constrained()->cascadeOnDelete();
            $table->foreignId('raffle_entry_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('voter_id')->constrained()->restrictOnDelete();
            $table->string('prize_tier');
            $table->string('prize_label');
            $table->timestamp('selected_at');
            $table->timestamp('published_at')->nullable();
            $table->string('status')->default('SELECTED');
            $table->timestamps();

            $table->unique(['raffle_draw_id', 'voter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raffle_winners');
        Schema::dropIfExists('raffle_entries');
        Schema::dropIfExists('raffle_draws');
    }
};
