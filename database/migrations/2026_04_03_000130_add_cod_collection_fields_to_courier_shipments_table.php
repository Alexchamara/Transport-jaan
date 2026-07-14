<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->string('cod_collection_status', 40)->nullable()->after('cod_policy_snapshot');
            $table->decimal('cod_collected_amount', 12, 2)->nullable()->after('cod_collection_status');
            $table->timestamp('cod_collection_recorded_at')->nullable()->after('cod_collected_amount');

            $table->index('cod_collection_status');
        });
    }

    public function down(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->dropIndex('courier_shipments_cod_collection_status_index');
            $table->dropColumn([
                'cod_collection_status',
                'cod_collected_amount',
                'cod_collection_recorded_at',
            ]);
        });
    }
};
