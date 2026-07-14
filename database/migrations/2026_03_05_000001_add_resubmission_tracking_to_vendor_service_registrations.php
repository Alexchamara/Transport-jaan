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
        Schema::table('vendor_service_registrations', function (Blueprint $table) {
            // Add resubmission tracking columns if they don't exist
            if (!Schema::hasColumn('vendor_service_registrations', 'resubmission_count')) {
                $table->unsignedInteger('resubmission_count')->default(0)->after('reviewed_by');
                $table->timestamp('last_resubmitted_at')->nullable()->after('resubmission_count');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_service_registrations', function (Blueprint $table) {
            if (Schema::hasColumn('vendor_service_registrations', 'resubmission_count')) {
                $table->dropColumn(['resubmission_count', 'last_resubmitted_at']);
            }
        });
    }
};
