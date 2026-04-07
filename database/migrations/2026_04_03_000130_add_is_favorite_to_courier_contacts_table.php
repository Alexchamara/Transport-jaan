<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('courier_contacts')) {
            return;
        }

        if (!Schema::hasColumn('courier_contacts', 'is_favorite')) {
            Schema::table('courier_contacts', function (Blueprint $table) {
                $table->boolean('is_favorite')->default(false)->after('preferred_contact_method');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('courier_contacts')) {
            return;
        }

        if (Schema::hasColumn('courier_contacts', 'is_favorite')) {
            Schema::table('courier_contacts', function (Blueprint $table) {
                $table->dropColumn('is_favorite');
            });
        }
    }
};
