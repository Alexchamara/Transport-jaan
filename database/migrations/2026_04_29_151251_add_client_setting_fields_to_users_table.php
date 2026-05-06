<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->boolean('notify_email')->default(true);
            $table->boolean('notify_sms')->default(false);
            $table->boolean('notify_push')->default(true);
            $table->string('cardholder_name')->nullable();
            $table->string('card_last4', 4)->nullable();
            $table->string('card_brand')->nullable();
            $table->string('expiry_month', 2)->nullable();
            $table->string('expiry_year', 4)->nullable();
            $table->string('language')->default('en');
            $table->string('timezone')->default('Asia/Colombo');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'address_line1',
                'address_line2',
                'city',
                'state',
                'postal_code',
                'notify_email',
                'notify_sms',
                'notify_push',
                'cardholder_name',
                'card_last4',
                'card_brand',
                'expiry_month',
                'expiry_year',
                'language',
                'timezone',
            ]);
        });
    }
};
