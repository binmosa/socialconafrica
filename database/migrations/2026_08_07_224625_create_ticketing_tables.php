<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->json('name');
            $table->json('subtitle')->nullable();
            $table->unsignedInteger('price_minor')->default(0);
            $table->char('currency', 3)->default('USD');
            $table->json('perks')->nullable();
            $table->json('badge')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('addons', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->json('name');
            $table->json('description')->nullable();
            $table->unsignedInteger('price_minor')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->json('note')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('attendees', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->string('organization')->nullable();
            $table->char('locale', 2)->default('en');
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_tier_id')->constrained();
            $table->foreignId('hotel_id')->nullable()->constrained();
            $table->string('status')->default('pending');
            $table->string('payment_method');
            $table->unsignedInteger('subtotal_minor')->default(0);
            $table->unsignedInteger('total_minor')->default(0);
            $table->char('currency', 3)->default('USD');
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('item_type');
            $table->foreignId('addon_id')->nullable()->constrained();
            $table->string('description');
            $table->unsignedInteger('unit_price_minor')->default(0);
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('line_total_minor')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('attendees');
        Schema::dropIfExists('hotels');
        Schema::dropIfExists('addons');
        Schema::dropIfExists('ticket_tiers');
    }
};
