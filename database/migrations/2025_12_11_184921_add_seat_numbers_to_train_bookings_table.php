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
        Schema::table('train_bookings', function (Blueprint $table) {
            $table->json('seat_numbers')->nullable()->after('total_passengers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('train_bookings', function (Blueprint $table) {
            $table->dropColumn('seat_numbers');
        });
    }
};
