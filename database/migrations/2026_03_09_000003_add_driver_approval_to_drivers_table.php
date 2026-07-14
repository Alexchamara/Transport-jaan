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
        Schema::table('drivers', function (Blueprint $table) {
            // Track driver approval workflow
            $table->foreignId('driver_approved_by')->after('license_review_status')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('driver_approved_at')->after('driver_approved_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeignIdFor('users', 'driver_approved_by');
            $table->dropColumn(['driver_approved_at']);
        });
    }
};
