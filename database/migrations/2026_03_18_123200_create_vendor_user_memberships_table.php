<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_user_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('membership_role', ['owner', 'admin', 'member'])->default('member');
            $table->enum('status', ['active', 'invited', 'suspended', 'revoked'])->default('active');
            $table->json('blocked_service_keys')->nullable();
            $table->foreignId('invited_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('suspended_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();

            $table->unique(['vendor_user_id', 'user_id'], 'team_user_memberships_vendor_user_unique');
            $table->unique('user_id', 'team_user_memberships_user_unique');
            $table->index(['vendor_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_user_memberships');
    }
};
