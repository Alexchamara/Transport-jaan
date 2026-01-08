<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CancellationSetting extends Model
{
    protected $fillable = [
        'context',
        'days',
    ];

    protected $casts = [
        'days' => 'integer',
    ];

    // Static method to get cancellation days for a specific context
    public static function getDaysForContext(string $context): int
    {
        $setting = self::where('context', $context)->first();
        return $setting ? $setting->days : 0;
    }

    // Static method to set cancellation days for a specific context
    public static function setDaysForContext(string $context, int $days): self
    {
        return self::updateOrCreate(
            ['context' => $context],
            ['days' => $days]
        );
    }

    // Get all settings as key-value pairs
    public static function getAllSettings(): array
    {
        return self::pluck('days', 'context')->toArray();
    }
}
