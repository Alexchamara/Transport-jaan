<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('superadmin_courier_pricing_governance_audits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users', 'id', 'scpga_vendor_user_id_foreign')->cascadeOnDelete();
            $table->string('pricing_category', 20);
            $table->foreignId('actor_user_id')->nullable()->constrained('users', 'id', 'scpga_actor_user_id_foreign')->nullOnDelete();
            $table->string('action_type', 120);
            $table->json('from_state')->nullable();
            $table->json('to_state')->nullable();
            $table->text('reason');
            $table->json('metadata')->nullable();
            $table->string('previous_hash', 64)->nullable();
            $table->string('record_hash', 64);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['vendor_user_id', 'pricing_category', 'created_at'], 'scpga_vendor_category_created_idx');
            $table->index('actor_user_id', 'scpga_actor_idx');
            $table->unique('record_hash', 'scpga_record_hash_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('superadmin_courier_pricing_governance_audits');
    }
};
