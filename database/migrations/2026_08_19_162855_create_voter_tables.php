<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voters', function (Blueprint $table) {
            $table->id();
            $table->string('display_name');
            $table->string('phone')->nullable()->unique();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('status')->default('ACTIVE');
            $table->string('risk_status')->default('NORMAL');
            $table->char('locale', 2)->default('en');
            $table->timestamp('last_login_at')->nullable();
            $table->foreignId('merged_into_voter_id')->nullable()->constrained('voters')->nullOnDelete();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('auth_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voter_id')->constrained()->cascadeOnDelete();
            $table->string('provider');
            $table->string('provider_subject_id');
            $table->json('provider_metadata')->nullable();
            $table->timestamp('linked_at');
            $table->timestamps();

            $table->unique(['provider', 'provider_subject_id']);
            $table->index('voter_id');
        });

        Schema::create('phone_otps', function (Blueprint $table) {
            $table->id();
            $table->string('phone')->index();
            $table->string('code_hash');
            $table->string('purpose')->default('login');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_otps');
        Schema::dropIfExists('auth_identities');
        Schema::dropIfExists('voters');
    }
};
