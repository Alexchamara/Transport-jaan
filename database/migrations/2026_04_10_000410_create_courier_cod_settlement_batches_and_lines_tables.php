<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_cod_settlement_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_reference', 64)->unique();
            $table->string('category', 20)->index();
            $table->string('status', 30)->default('draft')->index();
            $table->string('reconciliation_status', 30)->default('balanced')->index();
            $table->string('currency_code', 3)->default('LKR');
            $table->date('cycle_start_date')->index();
            $table->date('cycle_end_date')->index();
            $table->unsignedInteger('shipment_count')->default(0);
            $table->decimal('gross_cod_amount', 14, 2)->default(0);
            $table->decimal('reserve_amount', 14, 2)->default(0);
            $table->decimal('net_payout_amount', 14, 2)->default(0);
            $table->decimal('discrepancy_amount', 14, 2)->default(0);
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users', 'id', 'settlement_batches_generated_by_fk')->nullOnDelete();
            $table->foreignId('reconciled_by_user_id')->nullable()->constrained('users', 'id', 'settlement_batches_reconciled_by_fk')->nullOnDelete();
            $table->foreignId('exported_by_user_id')->nullable()->constrained('users', 'id', 'settlement_batches_exported_by_fk')->nullOnDelete();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('reconciled_at')->nullable();
            $table->timestamp('exported_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index(['cycle_start_date', 'cycle_end_date'], 'settlement_batches_cycle_idx');
        });

        Schema::create('courier_cod_settlement_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_cod_settlement_batch_id')
                ->constrained('courier_cod_settlement_batches', 'id', 'settlement_lines_batch_fk')
                ->cascadeOnDelete();
            $table->foreignId('shipment_id')
                ->constrained('courier_shipments', 'id', 'settlement_lines_shipment_fk')
                ->restrictOnDelete();
            $table->foreignId('vendor_user_id')
                ->nullable()
                ->constrained('users', 'id', 'settlement_lines_vendor_fk')
                ->nullOnDelete();
            $table->foreignId('cod_capability_id')
                ->nullable()
                ->constrained('courier_vendor_cod_capabilities', 'id', 'settlement_lines_capability_fk')
                ->nullOnDelete();
            $table->string('line_status', 30)->default('pending_reconciliation')->index();
            $table->string('currency_code', 3)->default('LKR');
            $table->decimal('requested_cod_amount', 14, 2)->default(0);
            $table->decimal('collected_cod_amount', 14, 2)->default(0);
            $table->decimal('reserve_amount', 14, 2)->default(0);
            $table->decimal('payout_amount', 14, 2)->default(0);
            $table->decimal('discrepancy_amount', 14, 2)->default(0);
            $table->string('dispute_status', 20)->nullable()->index();
            $table->string('dispute_reason', 255)->nullable();
            $table->text('dispute_note')->nullable();
            $table->foreignId('reconciled_by_user_id')
                ->nullable()
                ->constrained('users', 'id', 'settlement_lines_reconciled_by_fk')
                ->nullOnDelete();
            $table->timestamp('reconciled_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['courier_cod_settlement_batch_id', 'shipment_id'], 'settlement_batch_shipment_unique');
            $table->index(['courier_cod_settlement_batch_id', 'line_status'], 'settlement_batch_status_idx');
            $table->index(['courier_cod_settlement_batch_id', 'dispute_status'], 'settlement_batch_dispute_idx');
            $table->index(['vendor_user_id', 'line_status'], 'settlement_vendor_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_cod_settlement_lines');
        Schema::dropIfExists('courier_cod_settlement_batches');
    }
};
