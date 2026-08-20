<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->json('name');
            $table->string('slug')->unique();
            $table->json('description')->nullable();
            $table->string('image_path')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('status')->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('nominees', function (Blueprint $table) {
            $table->id();
            $table->string('display_name');
            $table->string('handle')->unique();
            $table->string('share_slug')->unique();
            $table->string('image_path')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->string('city')->nullable();
            $table->string('social_profile_url')->nullable();
            $table->json('bio')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('enriched_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('category_nominee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('nominee_id')->constrained()->cascadeOnDelete();

            $table->unique(['category_id', 'nominee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_nominee');
        Schema::dropIfExists('nominees');
        Schema::dropIfExists('categories');
    }
};
