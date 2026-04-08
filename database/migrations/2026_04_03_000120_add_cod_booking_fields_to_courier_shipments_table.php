<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->boolean('is_cod_enabled')->default(false)->after('declared_value');
            $table->decimal('cod_requested_amount', 12, 2)->nullable()->after('is_cod_enabled');
            $table->string('cod_requested_method', 40)->nullable()->after('cod_requested_amount');
            $table->foreignId('cod_capability_id')->nullable()->after('cod_requested_method')->constrained('courier_vendor_cod_capabilities')->nullOnDelete();
            $table->json('cod_policy_snapshot')->nullable()->after('cod_capability_id');

            $table->index('is_cod_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->dropIndex('courier_shipments_is_cod_enabled_index');
            $table->dropConstrainedForeignId('cod_capability_id');
            $table->dropColumn([
                'is_cod_enabled',
                'cod_requested_amount',
                'cod_requested_method',
                'cod_policy_snapshot',
            ]);
        });
    }
};
