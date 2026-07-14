<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_packages', function (Blueprint $table) {
            $table->string('courier_provider_key', 80)->nullable()->after('package_type');
            $table->string('courier_provider_name', 120)->nullable()->after('courier_provider_key');
            $table->string('service_tier_key', 80)->nullable()->after('courier_provider_name');
            $table->string('service_tier_label', 120)->nullable()->after('service_tier_key');
            $table->string('service_eta', 120)->nullable()->after('service_tier_label');
            $table->decimal('quoted_price_usd', 12, 2)->nullable()->after('service_eta');
        });
    }

    public function down(): void
    {
        Schema::table('courier_packages', function (Blueprint $table) {
            $table->dropColumn([
                'courier_provider_key',
                'courier_provider_name',
                'service_tier_key',
                'service_tier_label',
                'service_eta',
                'quoted_price_usd',
            ]);
        });
    }
};
