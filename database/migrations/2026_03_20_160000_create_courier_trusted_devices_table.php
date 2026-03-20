<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_trusted_devices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_user_id');
            $table->unsignedBigInteger('service_workspace_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->string('device_hash', 96);
            $table->string('device_label', 140)->nullable();
            $table->string('last_ip_address', 64)->nullable();
            $table->string('last_ip_prefix', 64)->nullable();
            $table->timestamp('trusted_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['vendor_user_id', 'user_id', 'device_hash'], 'courier_td_vendor_user_hash_uniq');
            $table->index(['vendor_user_id', 'user_id', 'is_active'], 'courier_td_vendor_user_active_idx');
            $table->index(['service_workspace_id', 'is_active'], 'courier_td_workspace_active_idx');

            $table->foreign('vendor_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('service_workspace_id')->references('id')->on('team_user_service_workspaces')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_trusted_devices');
    }
};
