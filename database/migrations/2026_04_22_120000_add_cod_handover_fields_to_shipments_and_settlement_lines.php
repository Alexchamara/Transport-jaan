<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('courier_shipments')) {
            $shipmentColumns = [
                'cod_handover_status' => Schema::hasColumn('courier_shipments', 'cod_handover_status'),
                'cod_handover_recorded_at' => Schema::hasColumn('courier_shipments', 'cod_handover_recorded_at'),
                'cod_handover_recorded_by_user_id' => Schema::hasColumn('courier_shipments', 'cod_handover_recorded_by_user_id'),
                'cod_handover_verified_at' => Schema::hasColumn('courier_shipments', 'cod_handover_verified_at'),
                'cod_handover_verified_by_user_id' => Schema::hasColumn('courier_shipments', 'cod_handover_verified_by_user_id'),
                'cod_handover_note' => Schema::hasColumn('courier_shipments', 'cod_handover_note'),
                'cod_manual_settlement_ready_at' => Schema::hasColumn('courier_shipments', 'cod_manual_settlement_ready_at'),
            ];

            Schema::table('courier_shipments', function (Blueprint $table) use ($shipmentColumns) {
                if (!$shipmentColumns['cod_handover_status']) {
                    $table->string('cod_handover_status', 32)->nullable();
                }
                if (!$shipmentColumns['cod_handover_recorded_at']) {
                    $table->timestamp('cod_handover_recorded_at')->nullable();
                }
                if (!$shipmentColumns['cod_handover_recorded_by_user_id']) {
                    $table->foreignId('cod_handover_recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                }
                if (!$shipmentColumns['cod_handover_verified_at']) {
                    $table->timestamp('cod_handover_verified_at')->nullable();
                }
                if (!$shipmentColumns['cod_handover_verified_by_user_id']) {
                    $table->foreignId('cod_handover_verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                }
                if (!$shipmentColumns['cod_handover_note']) {
                    $table->text('cod_handover_note')->nullable();
                }
                if (!$shipmentColumns['cod_manual_settlement_ready_at']) {
                    $table->timestamp('cod_manual_settlement_ready_at')->nullable();
                }
            });

            if (
                Schema::hasColumn('courier_shipments', 'cod_handover_status')
                && !$this->hasIndex('courier_shipments', 'courier_shipments_cod_handover_status_index')
            ) {
                Schema::table('courier_shipments', function (Blueprint $table) {
                    $table->index('cod_handover_status');
                });
            }
        }

        if (Schema::hasTable('courier_cod_settlement_lines')) {
            $lineColumns = [
                'handover_status' => Schema::hasColumn('courier_cod_settlement_lines', 'handover_status'),
                'handover_recorded_at' => Schema::hasColumn('courier_cod_settlement_lines', 'handover_recorded_at'),
                'handover_recorded_by_user_id' => Schema::hasColumn('courier_cod_settlement_lines', 'handover_recorded_by_user_id'),
                'handover_verified_at' => Schema::hasColumn('courier_cod_settlement_lines', 'handover_verified_at'),
                'handover_verified_by_user_id' => Schema::hasColumn('courier_cod_settlement_lines', 'handover_verified_by_user_id'),
                'settlement_cycle_mode' => Schema::hasColumn('courier_cod_settlement_lines', 'settlement_cycle_mode'),
            ];

            Schema::table('courier_cod_settlement_lines', function (Blueprint $table) use ($lineColumns) {
                if (!$lineColumns['handover_status']) {
                    $table->string('handover_status', 32)->nullable();
                }
                if (!$lineColumns['handover_recorded_at']) {
                    $table->timestamp('handover_recorded_at')->nullable();
                }
                if (!$lineColumns['handover_recorded_by_user_id']) {
                    $table->foreignId('handover_recorded_by_user_id')->nullable();
                    $table->foreign('handover_recorded_by_user_id', 'ccsl_handover_rec_uid_fk')->references('id')->on('users')->nullOnDelete();
                }
                if (!$lineColumns['handover_verified_at']) {
                    $table->timestamp('handover_verified_at')->nullable();
                }
                if (!$lineColumns['handover_verified_by_user_id']) {
                    $table->foreignId('handover_verified_by_user_id')->nullable();
                    $table->foreign('handover_verified_by_user_id', 'ccsl_handover_ver_uid_fk')->references('id')->on('users')->nullOnDelete();
                }
                if (!$lineColumns['settlement_cycle_mode']) {
                    $table->string('settlement_cycle_mode', 16)->nullable();
                }
            });

            if (
                Schema::hasColumn('courier_cod_settlement_lines', 'handover_status')
                && !$this->hasIndex('courier_cod_settlement_lines', 'courier_cod_settlement_lines_handover_status_index')
            ) {
                Schema::table('courier_cod_settlement_lines', function (Blueprint $table) {
                    $table->index('handover_status');
                });
            }

            if (
                Schema::hasColumn('courier_cod_settlement_lines', 'settlement_cycle_mode')
                && !$this->hasIndex('courier_cod_settlement_lines', 'courier_cod_settlement_lines_settlement_cycle_mode_index')
            ) {
                Schema::table('courier_cod_settlement_lines', function (Blueprint $table) {
                    $table->index('settlement_cycle_mode');
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('courier_cod_settlement_lines')) {
            if ($this->hasIndex('courier_cod_settlement_lines', 'courier_cod_settlement_lines_handover_status_index')) {
                Schema::table('courier_cod_settlement_lines', function (Blueprint $table) {
                    $table->dropIndex('courier_cod_settlement_lines_handover_status_index');
                });
            }
            if ($this->hasIndex('courier_cod_settlement_lines', 'courier_cod_settlement_lines_settlement_cycle_mode_index')) {
                Schema::table('courier_cod_settlement_lines', function (Blueprint $table) {
                    $table->dropIndex('courier_cod_settlement_lines_settlement_cycle_mode_index');
                });
            }

            $this->dropForeignIfExists('courier_cod_settlement_lines', 'handover_recorded_by_user_id');
            $this->dropForeignIfExists('courier_cod_settlement_lines', 'handover_verified_by_user_id');

            Schema::table('courier_cod_settlement_lines', function (Blueprint $table) {
                foreach ([
                    'handover_status',
                    'handover_recorded_at',
                    'handover_recorded_by_user_id',
                    'handover_verified_at',
                    'handover_verified_by_user_id',
                    'settlement_cycle_mode',
                ] as $column) {
                    if (Schema::hasColumn('courier_cod_settlement_lines', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('courier_shipments')) {
            if ($this->hasIndex('courier_shipments', 'courier_shipments_cod_handover_status_index')) {
                Schema::table('courier_shipments', function (Blueprint $table) {
                    $table->dropIndex('courier_shipments_cod_handover_status_index');
                });
            }

            $this->dropForeignIfExists('courier_shipments', 'cod_handover_recorded_by_user_id');
            $this->dropForeignIfExists('courier_shipments', 'cod_handover_verified_by_user_id');

            Schema::table('courier_shipments', function (Blueprint $table) {
                foreach ([
                    'cod_handover_status',
                    'cod_handover_recorded_at',
                    'cod_handover_recorded_by_user_id',
                    'cod_handover_verified_at',
                    'cod_handover_verified_by_user_id',
                    'cod_handover_note',
                    'cod_manual_settlement_ready_at',
                ] as $column) {
                    if (Schema::hasColumn('courier_shipments', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            $rows = DB::select(
                'SHOW INDEX FROM `' . $table . '` WHERE Key_name = ?',
                [$indexName]
            );

            return !empty($rows);
        }

        return false;
    }

    private function dropForeignIfExists(string $table, string $column): void
    {
        if (!Schema::hasColumn($table, $column)) {
            return;
        }

        try {
            Schema::table($table, function (Blueprint $tableBlueprint) use ($column) {
                $tableBlueprint->dropForeign([$column]);
            });
        } catch (\Throwable $exception) {
            // Intentionally ignored to keep rollback idempotent.
        }
    }
};
