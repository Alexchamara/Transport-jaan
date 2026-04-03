<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_districts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained('location_provinces')->cascadeOnDelete();
            $table->string('external_ref', 64)->nullable()->unique();
            $table->string('name_en', 120);
            $table->string('name_si', 120)->nullable();
            $table->string('name_ta', 120)->nullable();
            $table->timestamps();

            $table->unique(['province_id', 'name_en'], 'location_districts_province_name_en_uq');
            $table->index(['province_id', 'name_si'], 'location_districts_province_name_si_idx');
            $table->index(['province_id', 'name_ta'], 'location_districts_province_name_ta_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_districts');
    }
};
