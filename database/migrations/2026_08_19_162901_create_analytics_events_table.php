<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_name');
            $table->foreignId('voter_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_hash')->nullable();
            $table->foreignId('nominee_id')->nullable()->constrained()->nullOnDelete();
            $table->json('properties')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('event_name');
            $table->index(['event_name', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
