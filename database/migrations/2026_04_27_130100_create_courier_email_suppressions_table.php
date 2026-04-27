<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_email_suppressions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email', 190)->index();
            $table->string('reason', 64)->nullable();
            $table->string('source', 64)->nullable();
            $table->string('provider_event', 64)->nullable()->index();
            $table->string('provider_message_id', 191)->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamp('suppressed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['vendor_user_id', 'email'], 'courier_email_suppressions_vendor_email_idx');
            $table->index(['email', 'expires_at'], 'courier_email_suppressions_email_expires_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_email_suppressions');
    }
};

