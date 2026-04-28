<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_customer_email_dispatches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('courier_shipments')->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained('courier_shipment_payments')->nullOnDelete();
            $table->foreignId('tracking_event_id')->nullable()->constrained('courier_tracking_events')->nullOnDelete();
            $table->string('event_type', 64)->index();
            $table->string('recipient_email', 190)->index();
            $table->string('recipient_kind', 32)->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->unsignedInteger('attempts')->default(0);
            $table->string('dedupe_key', 191)->unique();
            $table->json('payload')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['shipment_id', 'event_type'], 'courier_email_dispatch_shipment_event_idx');
            $table->index(['status', 'queued_at'], 'courier_email_dispatch_status_queue_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_customer_email_dispatches');
    }
};
