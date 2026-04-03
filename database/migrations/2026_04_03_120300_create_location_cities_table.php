<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained('location_districts')->cascadeOnDelete();
            $table->string('external_ref', 64)->nullable()->unique();
            $table->string('name_en', 120);
            $table->string('name_si', 120)->nullable();
            $table->string('name_ta', 120)->nullable();
            $table->string('sub_name_en', 120)->nullable();
            $table->string('sub_name_si', 120)->nullable();
            $table->string('sub_name_ta', 120)->nullable();
            $table->string('postcode', 12)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();

            $table->index(['district_id', 'name_en'], 'location_cities_district_name_en_idx');
            $table->index(['district_id', 'sub_name_en'], 'location_cities_district_sub_name_en_idx');
            $table->index('postcode', 'location_cities_postcode_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_cities');
    }
};
