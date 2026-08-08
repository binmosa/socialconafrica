<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agenda_days', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->json('label');
            $table->json('title');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('agenda_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agenda_day_id')->constrained()->cascadeOnDelete();
            $table->time('starts_at');
            $table->time('ends_at')->nullable();
            $table->string('kind');
            $table->string('track')->nullable();
            $table->json('title');
            $table->json('description')->nullable();
            $table->json('location')->nullable();
            $table->string('speaker_name')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agenda_items');
        Schema::dropIfExists('agenda_days');
    }
};
