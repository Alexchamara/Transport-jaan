<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            // Stores the vendor-submitted renewal data until admin approves
            $table->string('pending_license_no', 100)->nullable()->after('nic_photo_path');
            $table->date('pending_license_expiry')->nullable()->after('pending_license_no');
            $table->string('pending_license_photo_path', 191)->nullable()->after('pending_license_expiry');

            // Tracks where the renewal is in the review workflow
            $table->enum('license_review_status', ['pending_review', 'approved', 'rejected'])
                  ->nullable()
                  ->after('pending_license_photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'pending_license_no',
                'pending_license_expiry',
                'pending_license_photo_path',
                'license_review_status',
            ]);
        });
    }
};
