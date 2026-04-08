<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_vendor_cod_capabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_workspace_id')->nullable()->constrained('team_user_service_workspaces')->nullOnDelete();
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 30)->default('not_requested');
            $table->timestamp('requested_at')->nullable();
            $table->text('requested_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('decision_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique('vendor_user_id', 'cvc_vendor_unique');
            $table->index(['status', 'requested_at'], 'cvc_status_requested_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_vendor_cod_capabilities');
    }
};
