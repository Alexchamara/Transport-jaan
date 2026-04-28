<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use ZxcvbnPhp\Zxcvbn;

class PasswordStrength implements Rule
{
    private int $minScore;

    public function __construct(int $minScore = 3)
    {
        $this->minScore = $minScore;
    }

    public function passes($attribute, $value): bool
    {
        if (!is_string($value) || $value === '') {
            return false;
        }

        $result = (new Zxcvbn())->passwordStrength($value);
        $score = (int) ($result['score'] ?? 0);

        return $score >= $this->minScore;
    }

    public function message(): string
    {
        return 'Password must be at least Good.';
    }
}
