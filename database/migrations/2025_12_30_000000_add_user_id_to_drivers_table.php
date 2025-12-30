<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            // Add user_id to associate drivers with vendors
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
            
            // Add foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Add index for faster queries
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
