<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_countries', function (Blueprint $table) {
            $table->id();
            $table->string('iso2', 2)->unique();
            $table->string('iso3', 3)->nullable();
            $table->string('name_en', 120);
            $table->string('name_native', 120)->nullable();
            $table->string('currency_code', 10)->nullable();
            $table->string('phone_code', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('location_provinces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('location_countries')->cascadeOnDelete();
            $table->string('external_ref', 60)->nullable();
            $table->string('name_en', 100);
            $table->string('name_si', 100)->nullable();
            $table->string('name_ta', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('location_districts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained('location_provinces')->cascadeOnDelete();
            $table->string('external_ref', 60)->nullable();
            $table->string('name_en', 100);
            $table->string('name_si', 100)->nullable();
            $table->string('name_ta', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('location_cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained('location_districts')->cascadeOnDelete();
            $table->string('external_ref', 60)->nullable();
            $table->string('name_en', 100)->nullable();
            $table->string('name_si', 100)->nullable();
            $table->string('name_ta', 100)->nullable();
            $table->string('sub_name_en', 100)->nullable();
            $table->string('sub_name_si', 100)->nullable();
            $table->string('sub_name_ta', 100)->nullable();
            $table->string('postcode', 10)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_cities');
        Schema::dropIfExists('location_districts');
        Schema::dropIfExists('location_provinces');
        Schema::dropIfExists('location_countries');
    }
};
