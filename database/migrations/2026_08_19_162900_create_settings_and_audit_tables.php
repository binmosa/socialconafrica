<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('admin_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('object_type');
            $table->string('object_id');
            $table->json('before_json')->nullable();
            $table->json('after_json')->nullable();
            $table->text('reason')->nullable();
            $table->string('ip')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['object_type', 'object_id']);
            $table->index(['admin_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audits');
        Schema::dropIfExists('settings');
    }
};
