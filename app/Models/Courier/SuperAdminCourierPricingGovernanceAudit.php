<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

class SuperAdminCourierPricingGovernanceAudit extends Model
{
    use HasFactory;

    public const ACTION_POLICY_UPDATED = 'pricing_policy_updated';
    public const ACTION_APPROVED = 'pricing_publish_approved';
    public const ACTION_REJECTED = 'pricing_publish_rejected';
    public const ACTION_FORCE_PUBLISHED = 'pricing_force_published';
    public const ACTION_ROLLBACK = 'pricing_publish_rolled_back';

    protected $table = 'superadmin_courier_pricing_governance_audits';

    public $timestamps = false;

    protected $fillable = [
        'vendor_user_id',
        'pricing_category',
        'actor_user_id',
        'action_type',
        'from_state',
        'to_state',
        'reason',
        'metadata',
        'previous_hash',
        'record_hash',
        'created_at',
    ];

    protected $casts = [
        'from_state' => 'array',
        'to_state' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(function (): bool {
            throw new LogicException('SuperAdmin pricing governance audits are immutable.');
        });

        static::deleting(function (): bool {
            throw new LogicException('SuperAdmin pricing governance audits are immutable.');
        });
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    /**
     * @param array<string, mixed> $fromState
     * @param array<string, mixed> $toState
     * @param array<string, mixed> $metadata
     */
    public static function recordEvent(
        int $vendorUserId,
        string $pricingCategory,
        string $actionType,
        ?int $actorUserId,
        string $reason,
        array $fromState = [],
        array $toState = [],
        array $metadata = []
    ): self {
        $previousHash = static::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('pricing_category', $pricingCategory)
            ->orderByDesc('id')
            ->value('record_hash');

        $normalizedFromState = static::normalizeNestedArray($fromState);
        $normalizedToState = static::normalizeNestedArray($toState);
        $normalizedMetadata = static::normalizeNestedArray($metadata);

        $payload = [
            'vendor_user_id' => $vendorUserId,
            'pricing_category' => $pricingCategory,
            'action_type' => $actionType,
            'actor_user_id' => $actorUserId,
            'reason' => trim($reason),
            'from_state' => $normalizedFromState,
            'to_state' => $normalizedToState,
            'metadata' => $normalizedMetadata,
            'previous_hash' => $previousHash,
        ];

        $recordHash = hash('sha256', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return static::query()->create([
            'vendor_user_id' => $vendorUserId,
            'pricing_category' => $pricingCategory,
            'actor_user_id' => $actorUserId,
            'action_type' => $actionType,
            'from_state' => $normalizedFromState,
            'to_state' => $normalizedToState,
            'reason' => trim($reason),
            'metadata' => $normalizedMetadata,
            'previous_hash' => $previousHash,
            'record_hash' => $recordHash,
            'created_at' => now(),
        ]);
    }

    /**
     * @param array<string, mixed> $value
     * @return array<string, mixed>
     */
    protected static function normalizeNestedArray(array $value): array
    {
        if ($value === []) {
            return [];
        }

        ksort($value);

        foreach ($value as $key => $item) {
            if (is_array($item)) {
                $value[$key] = static::normalizeNestedArray($item);
            }
        }

        return $value;
    }
}
