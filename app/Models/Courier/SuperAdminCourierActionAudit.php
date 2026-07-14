<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;
use LogicException;

class SuperAdminCourierActionAudit extends Model
{
    use HasFactory;

    public const ACTION_REASSIGNED = 'operations_reassigned';
    public const ACTION_FORCE_TRANSITION = 'operations_force_transition';
    public const ACTION_OPERATIONS_FROZEN = 'operations_frozen';
    public const ACTION_OPERATIONS_UNFROZEN = 'operations_unfrozen';
    public const ACTION_CANCEL_OVERRIDE = 'operations_cancel_override';

    public const FREEZE_ACTIONS = [
        self::ACTION_OPERATIONS_FROZEN,
        self::ACTION_OPERATIONS_UNFROZEN,
    ];

    protected $table = 'superadmin_courier_action_audits';

    public $timestamps = false;

    protected $fillable = [
        'shipment_id',
        'actor_user_id',
        'action_type',
        'from_status',
        'to_status',
        'reason',
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
        static::updating(function (): bool {
            throw new LogicException('SuperAdmin courier action audits are immutable.');
        });

        static::deleting(function (): bool {
            throw new LogicException('SuperAdmin courier action audits are immutable.');
        });
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(CourierShipment::class, 'shipment_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    /**
     * @param array<string, mixed> $metadata
     */
    public static function recordEvent(
        CourierShipment $shipment,
        string $actionType,
        ?string $fromStatus,
        ?string $toStatus,
        ?int $actorUserId,
        string $reason,
        array $metadata = []
    ): self {
        $previousHash = static::query()
            ->where('shipment_id', $shipment->id)
            ->orderByDesc('id')
            ->value('record_hash');

        $payload = [
            'shipment_id' => (int) $shipment->id,
            'action_type' => $actionType,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'actor_user_id' => $actorUserId,
            'reason' => trim($reason),
            'metadata' => static::normalizeMetadata($metadata),
            'previous_hash' => $previousHash,
        ];

        $recordHash = hash('sha256', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return static::query()->create([
            'shipment_id' => $shipment->id,
            'actor_user_id' => $actorUserId,
            'action_type' => $actionType,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'reason' => trim($reason),
            'metadata' => static::normalizeMetadata($metadata),
            'previous_hash' => $previousHash,
            'record_hash' => $recordHash,
            'created_at' => now(),
        ]);
    }

    public static function isShipmentOperationsFrozen(int $shipmentId): bool
    {
        if (! static::auditTableExists()) {
            return false;
        }

        $latestAction = static::query()
            ->where('shipment_id', $shipmentId)
            ->whereIn('action_type', static::FREEZE_ACTIONS)
            ->orderByDesc('id')
            ->value('action_type');

        return $latestAction === static::ACTION_OPERATIONS_FROZEN;
    }

    /**
     * @param array<int, int|string> $shipmentIds
     * @return array<int, bool>
     */
    public static function resolveFrozenMap(array $shipmentIds): array
    {
        $ids = array_values(array_unique(array_map('intval', $shipmentIds)));
        if ($ids === [] || ! static::auditTableExists()) {
            return [];
        }

        $records = static::query()
            ->select(['shipment_id', 'action_type'])
            ->whereIn('shipment_id', $ids)
            ->whereIn('action_type', static::FREEZE_ACTIONS)
            ->orderByDesc('id')
            ->get();

        $result = [];
        foreach ($records as $record) {
            $shipmentId = (int) $record->shipment_id;
            if (array_key_exists($shipmentId, $result)) {
                continue;
            }

            $result[$shipmentId] = $record->action_type === static::ACTION_OPERATIONS_FROZEN;
        }

        return $result;
    }

    protected static function auditTableExists(): bool
    {
        static $exists = null;

        if ($exists === null) {
            $exists = Schema::hasTable('superadmin_courier_action_audits');
        }

        return $exists;
    }

    /**
     * @param array<string, mixed> $metadata
     * @return array<string, mixed>
     */
    protected static function normalizeMetadata(array $metadata): array
    {
        if ($metadata === []) {
            return [];
        }

        ksort($metadata);

        foreach ($metadata as $key => $value) {
            if (is_array($value)) {
                $metadata[$key] = static::normalizeMetadata($value);
            }
        }

        return $metadata;
    }
}
