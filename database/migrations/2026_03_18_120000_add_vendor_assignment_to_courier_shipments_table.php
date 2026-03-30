<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->foreignId('assigned_vendor_user_id')
                ->nullable()
                ->after('requested_by_user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('assigned_vendor_registration_id')
                ->nullable()
                ->after('assigned_vendor_user_id')
                ->constrained('vendor_service_registrations')
                ->nullOnDelete();

            $table->string('assignment_category', 20)
                ->nullable()
                ->after('status')
                ->index();

            $table->string('assignment_status', 20)
                ->default('unassigned')
                ->after('assignment_category')
                ->index();

            $table->timestamp('assigned_at')
                ->nullable()
                ->after('assignment_status');
        });
    }

    public function down(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_vendor_registration_id');
            $table->dropConstrainedForeignId('assigned_vendor_user_id');
            $table->dropColumn([
                'assignment_category',
                'assignment_status',
                'assigned_at',
            ]);
        });
    }
};
