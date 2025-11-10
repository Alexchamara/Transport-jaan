<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('courier_shipments')->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->string('package_type', 50)->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->decimal('length_cm', 8, 2)->nullable();
            $table->decimal('width_cm', 8, 2)->nullable();
            $table->decimal('height_cm', 8, 2)->nullable();
            $table->decimal('declared_value', 12, 2)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_packages');
    }
};
