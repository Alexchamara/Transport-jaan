<?PHP

// database/migrations/2025_08_26_000000_create_units_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->decimal('price_per_day', 10, 2);
            $table->enum('status', ['Available','Unavailable','Maintenance'])->default('Available');
            $table->unsignedInteger('units_count')->default(1);
            $table->string('mileage')->nullable();        // keep string to show “4,000”
            $table->enum('transmission', ['Auto','Manual'])->nullable();
            $table->string('capacity')->nullable();       // e.g. "5 Person"
            $table->string('fuel_type')->nullable();      // e.g. "Electric"
            $table->string('image_path')->nullable();     // if you later store a car image
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('units');
    }
};
