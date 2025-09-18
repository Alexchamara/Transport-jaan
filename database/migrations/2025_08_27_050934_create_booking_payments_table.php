<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();

            $table->enum('method', ['Credit Card','PayPal','Bank Transfer'])->index();
            $table->enum('option', ['full','advance'])->default('full');

            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->enum('status', ['pending','paid','failed'])->default('pending')->index();

            // Bank transfer extras
            $table->string('slip_number')->nullable();
            $table->string('slip_path')->nullable(); // stored file path

            $table->string('tx_reference')->nullable(); // gateway txn/ref if any

            $table->timestamps();

            $table->index(['booking_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_payments');
    }
};
