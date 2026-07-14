<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_feature_pricings', function (Blueprint $table) {
            $table->id();

            // FK to vehicles(id)
            $table->foreignId('vehicle_id')
                  ->constrained('vehicles')
                  ->cascadeOnDelete();

            // Two columns: Additional Feature name + price
            $table->string('additional_feature_name', 255);
            $table->decimal('additional_feature_price', 10, 2)->nullable();

            $table->timestamps();

            // No unique constraint
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_feature_pricings');
    }
};
