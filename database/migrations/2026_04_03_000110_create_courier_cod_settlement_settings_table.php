<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_cod_settlement_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_cod_enabled')->default(true);
            $table->unsignedSmallInteger('settlement_cycle_days')->default(7);
            $table->unsignedSmallInteger('holding_days')->default(2);
            $table->decimal('reserve_percentage', 5, 2)->default(0);
            $table->decimal('minimum_payout_amount', 12, 2)->default(0);
            $table->string('currency_code', 3)->default('LKR');
            $table->text('notes')->nullable();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_cod_settlement_settings');
    }
};
