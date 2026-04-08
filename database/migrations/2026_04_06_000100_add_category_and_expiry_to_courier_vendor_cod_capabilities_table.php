<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('courier_vendor_cod_capabilities', 'category')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->string('category', 30)->default('domestic');
            });
        }

        if (!Schema::hasColumn('courier_vendor_cod_capabilities', 'expires_at')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->timestamp('expires_at')->nullable();
            });
        }

        if (!$this->indexExists('courier_vendor_cod_capabilities', 'cvc_vendor_category_unique')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->unique(['vendor_user_id', 'category'], 'cvc_vendor_category_unique');
            });
        }

        if ($this->indexExists('courier_vendor_cod_capabilities', 'cvc_vendor_unique')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->dropUnique('cvc_vendor_unique');
            });
        }

        if (!$this->indexExists('courier_vendor_cod_capabilities', 'cvc_category_status_requested_idx')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->index(['category', 'status', 'requested_at'], 'cvc_category_status_requested_idx');
            });
        }

        if (!$this->indexExists('courier_vendor_cod_capabilities', 'cvc_expires_idx')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->index('expires_at', 'cvc_expires_idx');
            });
        }
    }

    public function down(): void
    {
        if ($this->indexExists('courier_vendor_cod_capabilities', 'cvc_category_status_requested_idx')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->dropIndex('cvc_category_status_requested_idx');
            });
        }

        if ($this->indexExists('courier_vendor_cod_capabilities', 'cvc_expires_idx')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->dropIndex('cvc_expires_idx');
            });
        }

        if ($this->indexExists('courier_vendor_cod_capabilities', 'cvc_vendor_category_unique')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->dropUnique('cvc_vendor_category_unique');
            });
        }

        if (!$this->indexExists('courier_vendor_cod_capabilities', 'cvc_vendor_unique')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $table->unique('vendor_user_id', 'cvc_vendor_unique');
            });
        }

        if (Schema::hasColumn('courier_vendor_cod_capabilities', 'category')
            || Schema::hasColumn('courier_vendor_cod_capabilities', 'expires_at')) {
            Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                $drops = [];
                if (Schema::hasColumn('courier_vendor_cod_capabilities', 'category')) {
                    $drops[] = 'category';
                }
                if (Schema::hasColumn('courier_vendor_cod_capabilities', 'expires_at')) {
                    $drops[] = 'expires_at';
                }
                if (count($drops) > 0) {
                    $table->dropColumn($drops);
            if (!$this->indexExists('courier_vendor_cod_capabilities', 'cvc_vendor_category_unique')) {
                Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                    $table->unique(['vendor_user_id', 'category'], 'cvc_vendor_category_unique');
                });
            }

            if ($this->indexExists('courier_vendor_cod_capabilities', 'cvc_vendor_unique')) {
                Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                    $table->dropUnique('cvc_vendor_unique');
                });
            }

            if (!$this->indexExists('courier_vendor_cod_capabilities', 'cvc_category_status_requested_idx')) {
                Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                    $table->index(['category', 'status', 'requested_at'], 'cvc_category_status_requested_idx');
                });
            }

            if (!$this->indexExists('courier_vendor_cod_capabilities', 'cvc_expires_idx')) {
                Schema::table('courier_vendor_cod_capabilities', function (Blueprint $table) {
                    $table->index('expires_at', 'cvc_expires_idx');
                });
            }
    {
        $connection = Schema::getConnection();
        $driver = $connection->getDriverName();

        if ($driver === 'mysql') {
            $database = (string) $connection->getDatabaseName();
            $row = $connection->selectOne(
                'select count(*) as aggregate from information_schema.statistics where table_schema = ? and table_name = ? and index_name = ?',
                [$database, $table, $indexName]
            );

            return ((int) ($row->aggregate ?? 0)) > 0;
        }

        if ($driver === 'sqlite') {
            $rows = $connection->select("PRAGMA index_list('{$table}')");
            foreach ($rows as $row) {
                $name = (string) ($row->name ?? '');
                if ($name === $indexName) {
                    return true;
                }
            }
        }

        return false;
    }
};
