<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_shipments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sender_contact_id')->constrained('courier_contacts')->restrictOnDelete();
            $table->foreignId('recipient_contact_id')->constrained('courier_contacts')->restrictOnDelete();
            $table->foreignId('sender_address_id')->constrained('courier_addresses')->restrictOnDelete();
            $table->foreignId('recipient_address_id')->constrained('courier_addresses')->restrictOnDelete();
            $table->string('service_level', 50);
            $table->string('status', 40)->default('pending')->index();
            $table->date('pickup_date')->nullable();
            $table->time('pickup_window_start')->nullable();
            $table->time('pickup_window_end')->nullable();
            $table->boolean('insurance_required')->default(false);
            $table->decimal('declared_value', 12, 2)->default(0);
            $table->string('currency_code', 3)->default('LKR');
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('actual_cost', 12, 2)->nullable();
            $table->text('delivery_notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();

            $table->index(['pickup_date', 'service_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_shipments');
    }
};
