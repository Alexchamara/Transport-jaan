<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('multi_model_journeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('reference')->unique();
            $table->string('status')->default('pending'); // pending, confirmed, in_progress, completed, cancelled
            $table->integer('total_legs')->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->decimal('advance_amount', 10, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->string('payment_option')->nullable(); // full, advance
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('payment_status')->default('pending'); // pending, paid, partial
            $table->string('slip_number')->nullable();
            $table->string('slip_path')->nullable();
            $table->json('customer_data')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('reference');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('multi_model_journeys');
    }
};
