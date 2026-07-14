<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_shipment_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_shipment_id')->constrained('courier_shipments')->cascadeOnDelete();
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('provider', 40)->default('payhere')->index();
            $table->string('payment_method', 20)->default('card')->index();
            $table->boolean('is_required')->default(true);
            $table->decimal('amount', 12, 2);
            $table->char('currency_code', 3)->default('LKR');
            $table->string('status', 20)->default('pending')->index();
            $table->string('gateway_order_id', 80)->nullable()->unique();
            $table->string('gateway_payment_id', 80)->nullable()->index();
            $table->string('tx_reference', 120)->nullable()->index();
            $table->string('gateway_status', 120)->nullable();
            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('last_notified_at')->nullable();
            $table->string('failure_reason')->nullable();
            $table->json('gateway_payload')->nullable();
            $table->json('callback_payload')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['courier_shipment_id', 'status']);
            $table->index(['requested_by_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_shipment_payments');
    }
};
