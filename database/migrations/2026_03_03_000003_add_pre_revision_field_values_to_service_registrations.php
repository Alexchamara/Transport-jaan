<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendor_service_registrations', function (Blueprint $table) {
            $table->json('pre_revision_field_values')->nullable()->after('field_values');
        });
    }

    public function down(): void
    {
        Schema::table('vendor_service_registrations', function (Blueprint $table) {
            $table->dropColumn('pre_revision_field_values');
        });
    }
};
