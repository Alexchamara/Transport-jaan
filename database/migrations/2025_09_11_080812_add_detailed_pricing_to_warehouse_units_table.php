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
        Schema::table('warehouse_units', function (Blueprint $table) {
            $table->decimal('monthly_rate', 10, 2)->nullable()->after('price');
            $table->decimal('security_deposit', 10, 2)->nullable()->after('monthly_rate');
            $table->decimal('setup_fee', 10, 2)->nullable()->after('security_deposit');
            $table->decimal('tax_rate', 5, 4)->nullable()->after('setup_fee');
            $table->decimal('total_amount', 10, 2)->nullable()->after('tax_rate');
            $table->decimal('tax_amount', 10, 2)->nullable()->after('total_amount');
            $table->decimal('final_amount', 10, 2)->nullable()->after('tax_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouse_units', function (Blueprint $table) {
            $table->dropColumn([
                'monthly_rate', 
                'security_deposit', 
                'setup_fee', 
                'tax_rate', 
                'total_amount', 
                'tax_amount', 
                'final_amount'
            ]);
        });
    }
};
