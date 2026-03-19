<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_user_service_workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('service_key', 80);
            $table->string('name', 160)->nullable();
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->timestamps();

            $table->unique(['vendor_user_id', 'service_key'], 'team_user_service_workspaces_vendor_service_unique');
            $table->index(['service_key', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_user_service_workspaces');
    }
};
