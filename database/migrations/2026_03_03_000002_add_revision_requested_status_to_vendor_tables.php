<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update vendor_profiles submission_status enum to include revision_requested
        DB::statement("ALTER TABLE vendor_profiles MODIFY COLUMN submission_status ENUM('draft', 'submitted', 'approved', 'rejected', 'revision_requested') DEFAULT 'draft'");

        // Update vendor_service_registrations status enum to include revision_requested
        DB::statement("ALTER TABLE vendor_service_registrations MODIFY COLUMN status ENUM('draft', 'submitted', 'approved', 'rejected', 'revision_requested') DEFAULT 'draft'");

        // Add reviewed_by to vendor_service_registrations
        Schema::table('vendor_service_registrations', function (Blueprint $table) {
            $table->foreignId('reviewed_by')->nullable()->after('reviewed_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE vendor_profiles MODIFY COLUMN submission_status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft'");
        DB::statement("ALTER TABLE vendor_service_registrations MODIFY COLUMN status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft'");

        Schema::table('vendor_service_registrations', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn('reviewed_by');
        });
    }
};
