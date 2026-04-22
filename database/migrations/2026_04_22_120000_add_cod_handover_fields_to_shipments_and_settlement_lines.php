<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->string('cod_handover_status', 32)->nullable()->after('cod_collection_recorded_at');
            $table->timestamp('cod_handover_recorded_at')->nullable()->after('cod_handover_status');
            $table->foreignId('cod_handover_recorded_by_user_id')->nullable()->after('cod_handover_recorded_at')->constrained('users')->nullOnDelete();
            $table->timestamp('cod_handover_verified_at')->nullable()->after('cod_handover_recorded_by_user_id');
            $table->foreignId('cod_handover_verified_by_user_id')->nullable()->after('cod_handover_verified_at')->constrained('users')->nullOnDelete();
            $table->text('cod_handover_note')->nullable()->after('cod_handover_verified_by_user_id');
            $table->timestamp('cod_manual_settlement_ready_at')->nullable()->after('cod_handover_note');

            $table->index('cod_handover_status');
        });

        Schema::table('courier_cod_settlement_lines', function (Blueprint $table) {
            $table->string('handover_status', 32)->nullable()->after('line_status');
            $table->timestamp('handover_recorded_at')->nullable()->after('handover_status');
            $table->foreignId('handover_recorded_by_user_id')->nullable()->after('handover_recorded_at')->constrained('users')->nullOnDelete();
            $table->timestamp('handover_verified_at')->nullable()->after('handover_recorded_by_user_id');
            $table->foreignId('handover_verified_by_user_id')->nullable()->after('handover_verified_at')->constrained('users')->nullOnDelete();
            $table->string('settlement_cycle_mode', 16)->nullable()->after('handover_verified_by_user_id');

            $table->index('handover_status');
            $table->index('settlement_cycle_mode');
        });
    }

    public function down(): void
    {
        Schema::table('courier_cod_settlement_lines', function (Blueprint $table) {
            $table->dropIndex('courier_cod_settlement_lines_handover_status_index');
            $table->dropIndex('courier_cod_settlement_lines_settlement_cycle_mode_index');
            $table->dropConstrainedForeignId('handover_recorded_by_user_id');
            $table->dropConstrainedForeignId('handover_verified_by_user_id');
            $table->dropColumn([
                'handover_status',
                'handover_recorded_at',
                'handover_verified_at',
                'settlement_cycle_mode',
            ]);
        });

        Schema::table('courier_shipments', function (Blueprint $table) {
            $table->dropIndex('courier_shipments_cod_handover_status_index');
            $table->dropConstrainedForeignId('cod_handover_recorded_by_user_id');
            $table->dropConstrainedForeignId('cod_handover_verified_by_user_id');
            $table->dropColumn([
                'cod_handover_status',
                'cod_handover_recorded_at',
                'cod_handover_verified_at',
                'cod_handover_note',
                'cod_manual_settlement_ready_at',
            ]);
        });
    }
};
