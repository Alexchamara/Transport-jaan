<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierCodSettlementSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'is_cod_enabled',
        'settlement_cycle_days',
        'holding_days',
        'reserve_percentage',
        'minimum_payout_amount',
        'currency_code',
        'notes',
        'updated_by_user_id',
        'metadata',
    ];

    protected $casts = [
        'is_cod_enabled' => 'boolean',
        'settlement_cycle_days' => 'integer',
        'holding_days' => 'integer',
        'reserve_percentage' => 'decimal:2',
        'minimum_payout_amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    public static function defaults(): array
    {
        return [
            'is_cod_enabled' => true,
            'settlement_cycle_days' => 7,
            'holding_days' => 2,
            'reserve_percentage' => 0,
            'minimum_payout_amount' => 0,
            'currency_code' => 'LKR',
            'notes' => null,
            'metadata' => [],
        ];
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }
}
