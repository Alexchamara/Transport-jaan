<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_vendor_client_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained('courier_contacts')->cascadeOnDelete();
            $table->boolean('watchlist')->default(false);
            $table->string('priority_tag', 20)->nullable();
            $table->string('client_tier', 20)->nullable();
            $table->string('account_owner', 120)->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();

            $table->unique(['vendor_user_id', 'contact_id'], 'vendor_courier_client_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_vendor_client_profiles');
    }
};
