<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('author_name');
            $table->json('role');
            $table->json('country');
            $table->json('quote');
            $table->string('photo_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('leader_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('title');
            $table->json('quote');
            $table->string('photo_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('attend_personas', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->json('description');
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attend_personas');
        Schema::dropIfExists('leader_messages');
        Schema::dropIfExists('testimonials');
    }
};
