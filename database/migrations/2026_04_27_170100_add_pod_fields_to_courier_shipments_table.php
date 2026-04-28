<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->string('order_number', 120)->nullable()->after('reference');
            $table->string('destination_district', 120)->nullable()->after('recipient_address_id');
            $table->string('destination_nearest_city', 120)->nullable()->after('destination_district');
            $table->string('recipient_alt_phone', 30)->nullable()->after('recipient_contact_id');
            $table->string('recipient_nic', 40)->nullable()->after('recipient_alt_phone');
            $table->string('pod_receiver_name', 180)->nullable()->after('recipient_nic');
            $table->string('pod_receiver_nic', 40)->nullable()->after('pod_receiver_name');

            $table->index(['assigned_vendor_user_id', 'order_number'], 'cs_vendor_order_no_idx');
        });
    }

    public function down(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->dropIndex('cs_vendor_order_no_idx');
            $table->dropColumn([
                'order_number',
                'destination_district',
                'destination_nearest_city',
                'recipient_alt_phone',
                'recipient_nic',
                'pod_receiver_name',
                'pod_receiver_nic',
            ]);
        });
    }
};
