<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_reviews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            // client_id references users.id (role=client enforced in app layer)
            $table->foreignId('client_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // 1–5 stars, default 5 (DB check supported in MySQL8+/Postgres)
            $table->unsignedTinyInteger('rating')->default(5)->check('rating between 1 and 5');

            // Optional comment
            $table->text('comment')->nullable();

            $table->timestamps();

            // exactly one review per (vehicle, client)
            $table->unique(['vehicle_id', 'client_id'], 'vr_vehicle_client_unique');

            // helpful for recent-by-vehicle queries
            $table->index(['vehicle_id', 'created_at'], 'vr_vehicle_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_reviews');
    }
};
