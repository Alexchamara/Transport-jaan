<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_provinces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('location_countries')->cascadeOnDelete();
            $table->string('external_ref', 64)->nullable()->unique();
            $table->string('name_en', 120);
            $table->string('name_si', 120)->nullable();
            $table->string('name_ta', 120)->nullable();
            $table->timestamps();

            $table->unique(['country_id', 'name_en'], 'location_provinces_country_name_en_uq');
            $table->index(['country_id', 'name_si'], 'location_provinces_country_name_si_idx');
            $table->index(['country_id', 'name_ta'], 'location_provinces_country_name_ta_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_provinces');
    }
};
