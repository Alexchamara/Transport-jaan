<?php

namespace App\Services\Courier;

use Illuminate\Support\Facades\Http;

class CourierExchangeRateService
{
    public function latest(string $baseCurrency, array $targetCurrencies = []): array
    {
        $baseCurrency = strtoupper(trim($baseCurrency));
        if ($baseCurrency === '') {
            $baseCurrency = 'LKR';
        }

        $targets = collect($targetCurrencies)
            ->map(fn ($currency) => strtoupper(trim((string) $currency)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $query = [
            'from' => $baseCurrency,
        ];

        if (count($targets) > 0) {
            $query['to'] = implode(',', $targets);
        }

        $response = Http::timeout(8)
            ->acceptJson()
            ->get('https://api.frankfurter.app/latest', $query);

        if (!$response->ok()) {
            return [
                'ok' => false,
                'message' => 'Unable to fetch exchange rates right now.',
            ];
        }

        $payload = $response->json();
        $rates = is_array($payload['rates'] ?? null) ? $payload['rates'] : [];

        if (count($targets) > 0) {
            foreach ($targets as $target) {
                if ($target === $baseCurrency) {
                    $rates[$target] = 1.0;
                }
            }
        } else {
            $rates[$baseCurrency] = 1.0;
        }

        return [
            'ok' => true,
            'base' => $baseCurrency,
            'date' => (string) ($payload['date'] ?? now()->toDateString()),
            'rates' => collect($rates)
                ->map(fn ($value) => round((float) $value, 8))
                ->toArray(),
            'provider' => 'frankfurter.app',
        ];
    }
}
