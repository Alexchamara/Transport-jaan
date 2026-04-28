<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_customer_email_dispatches', function (Blueprint $table) {
            $table->string('channel', 20)->default('email')->after('event_type')->index();
            $table->foreignId('recipient_user_id')->nullable()->after('recipient_kind')->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('vendor_user_id')->nullable()->after('tracking_event_id')->index();
            $table->string('provider_message_id', 191)->nullable()->after('sent_at')->index();
            $table->string('provider_event', 64)->nullable()->after('provider_message_id')->index();
            $table->string('failed_reason_code', 64)->nullable()->after('provider_event')->index();
            $table->timestamp('provider_event_at')->nullable()->after('failed_reason_code');
            $table->json('delivery_meta')->nullable()->after('provider_event_at');

            $table->index(['shipment_id', 'event_type', 'channel'], 'courier_email_dispatch_shipment_event_channel_idx');
            $table->index(['channel', 'status', 'queued_at'], 'courier_email_dispatch_channel_status_queue_idx');
        });
    }

    public function down(): void
    {
        Schema::table('courier_customer_email_dispatches', function (Blueprint $table) {
            $table->dropIndex('courier_email_dispatch_shipment_event_channel_idx');
            $table->dropIndex('courier_email_dispatch_channel_status_queue_idx');
            $table->dropConstrainedForeignId('recipient_user_id');
            $table->dropColumn([
                'channel',
                'vendor_user_id',
                'provider_message_id',
                'provider_event',
                'failed_reason_code',
                'provider_event_at',
                'delivery_meta',
            ]);
        });
    }
};

