<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use LogicException;

class CourierVendorCodCapabilityAudit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'courier_vendor_cod_capability_id',
        'vendor_user_id',
        'service_workspace_id',
        'category',
        'event_type',
        'from_status',
        'to_status',
        'actor_user_id',
        'note',
        'metadata',
        'previous_hash',
        'record_hash',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(function () {
            throw new LogicException('CourierVendorCodCapabilityAudit records are immutable and cannot be updated.');
        });

        static::deleting(function () {
            throw new LogicException('CourierVendorCodCapabilityAudit records are immutable and cannot be deleted.');
        });
    }

    public function capability()
    {
        return $this->belongsTo(CourierVendorCodCapability::class, 'courier_vendor_cod_capability_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public static function recordEvent(
        CourierVendorCodCapability $capability,
        string $eventType,
        ?string $fromStatus = null,
        ?string $toStatus = null,
        ?int $actorUserId = null,
        ?string $note = null,
        array $metadata = []
    ): self {
        $previousHash = self::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->orderByDesc('id')
            ->value('record_hash');

        $note = $note !== null ? trim($note) : null;
        if ($note === '') {
            $note = null;
        }

        $canonicalPayload = [
            'capability_id' => (int) $capability->id,
            'vendor_user_id' => (int) $capability->vendor_user_id,
            'service_workspace_id' => (int) ($capability->service_workspace_id ?? 0) ?: null,
            'category' => CourierVendorCodCapability::normalizeCategory((string) $capability->category),
            'event_type' => trim($eventType) !== '' ? trim($eventType) : 'cod_capability_event',
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'actor_user_id' => $actorUserId > 0 ? $actorUserId : null,
            'note' => $note,
            'metadata' => is_array($metadata) ? $metadata : [],
            'previous_hash' => $previousHash,
            'created_at' => now()->toDateTimeString(),
        ];

        $recordHash = self::computeRecordHash($canonicalPayload);

        return self::query()->create([
            'courier_vendor_cod_capability_id' => (int) $capability->id,
            'vendor_user_id' => (int) $capability->vendor_user_id,
            'service_workspace_id' => (int) ($capability->service_workspace_id ?? 0) ?: null,
            'category' => CourierVendorCodCapability::normalizeCategory((string) $capability->category),
            'event_type' => trim($eventType) !== '' ? trim($eventType) : 'cod_capability_event',
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'actor_user_id' => $actorUserId > 0 ? $actorUserId : null,
            'note' => $note,
            'metadata' => is_array($metadata) ? $metadata : [],
            'previous_hash' => $previousHash,
            'record_hash' => $recordHash,
            'created_at' => now(),
        ]);
    }

    public static function buildHashPayloadFromAudit(self $audit, ?string $previousHash = null): array
    {
        $note = $audit->note !== null ? trim((string) $audit->note) : null;
        if ($note === '') {
            $note = null;
        }

        return [
            'capability_id' => (int) $audit->courier_vendor_cod_capability_id,
            'vendor_user_id' => (int) $audit->vendor_user_id,
            'service_workspace_id' => (int) ($audit->service_workspace_id ?? 0) ?: null,
            'category' => CourierVendorCodCapability::normalizeCategory((string) $audit->category),
            'event_type' => trim((string) $audit->event_type) !== '' ? trim((string) $audit->event_type) : 'cod_capability_event',
            'from_status' => $audit->from_status,
            'to_status' => $audit->to_status,
            'actor_user_id' => (int) ($audit->actor_user_id ?? 0) ?: null,
            'note' => $note,
            'metadata' => is_array($audit->metadata) ? $audit->metadata : [],
            'previous_hash' => $previousHash,
            'created_at' => $audit->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public static function computeRecordHash(array $payload): string
    {
        $canonicalPayload = self::canonicalize($payload);

        return hash(
            'sha256',
            json_encode($canonicalPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    private static function canonicalize($value)
    {
        if (!is_array($value)) {
            return $value;
        }

        $isSequential = array_keys($value) === range(0, count($value) - 1);
        if ($isSequential) {
            return array_map(static fn ($item) => self::canonicalize($item), $value);
        }

        ksort($value);

        foreach ($value as $key => $item) {
            $value[$key] = self::canonicalize($item);
        }

        return $value;
    }
}
