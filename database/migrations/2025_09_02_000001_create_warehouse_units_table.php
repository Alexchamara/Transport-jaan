<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('warehouse_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('address');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('total_area', 12, 2)->nullable();
            $table->decimal('capacity', 12, 2)->nullable();
            $table->string('type');
            $table->string('pricing_model');
            $table->decimal('price', 12, 2)->nullable();
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->json('documents')->nullable();
            $table->longText('terms_conditions')->nullable();
            $table->string('terms_pdf_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('approval_status')->default('pending');
                $table->timestamp('approved_at')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_units');
    }
};
