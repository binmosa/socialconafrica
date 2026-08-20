<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vote_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vote_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('nominee_id')->constrained()->restrictOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type');
            $table->integer('vote_delta');
            $table->string('reason')->nullable();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ledger_key')->nullable()->unique();
            $table->timestamp('created_at')->nullable();

            $table->index('nominee_id');
            $table->index(['nominee_id', 'category_id']);
            $table->index('vote_order_id');
        });

        Schema::create('nominee_vote_counters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nominee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('total_votes')->default(0);
            $table->timestamp('total_reached_at')->nullable();
            $table->timestamps();

            $table->unique(['nominee_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nominee_vote_counters');
        Schema::dropIfExists('vote_ledger_entries');
    }
};
