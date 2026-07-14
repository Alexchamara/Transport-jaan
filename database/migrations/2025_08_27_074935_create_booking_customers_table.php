<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('booking_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();

            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country_code', 5)->nullable(); // e.g., "lk"
            
            $table->string('city')->nullable();
            $table->string('zip_code')->nullable();
            $table->unsignedTinyInteger('age')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('booking_customers');
    }
};
