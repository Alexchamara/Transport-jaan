<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('superadmin_courier_action_audits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shipment_id')->constrained('courier_shipments')->cascadeOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action_type', 120);
            $table->string('from_status', 40)->nullable();
            $table->string('to_status', 40)->nullable();
            $table->text('reason');
            $table->json('metadata')->nullable();
            $table->string('previous_hash', 64)->nullable();
            $table->string('record_hash', 64);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['shipment_id', 'created_at'], 'scaa_shipment_created_idx');
            $table->index(['shipment_id', 'action_type'], 'scaa_shipment_action_idx');
            $table->index('actor_user_id', 'scaa_actor_idx');
            $table->unique('record_hash', 'scaa_record_hash_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('superadmin_courier_action_audits');
    }
};
