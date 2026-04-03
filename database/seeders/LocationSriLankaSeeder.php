<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSriLankaSeeder extends Seeder
{
    private const COUNTRY_ISO2 = 'LK';
    private const COUNTRY_ISO3 = 'LKA';

    public function run(): void
    {
        $countryId = $this->upsertCountry();

        $provinceRows = $this->parseRowsFromSql(database_path('locations/provinces.sql'));
        $districtRows = $this->parseRowsFromSql(database_path('locations/districts.sql'));
        $cityRows = $this->parseRowsFromSql(database_path('locations/cities.sql'));

        if (empty($provinceRows) || empty($districtRows) || empty($cityRows)) {
            $this->command?->warn('Sri Lanka location SQL files were not parsed. Check files in database/locations.');
            return;
        }

        $provinceIdByLegacyId = $this->upsertProvinces($countryId, $provinceRows);
        $districtIdByLegacyId = $this->upsertDistricts($districtRows, $provinceIdByLegacyId);
        $cityCount = $this->upsertCities($cityRows, $districtIdByLegacyId);

        $this->command?->info('Sri Lanka location data synced. Provinces: '
            . count($provinceIdByLegacyId)
            . ', Districts: '
            . count($districtIdByLegacyId)
            . ', Cities: '
            . $cityCount
            . '.');
    }

    private function upsertCountry(): int
    {
        $now = now();

        DB::table('location_countries')->updateOrInsert(
            ['iso2' => self::COUNTRY_ISO2],
            [
                'iso3' => self::COUNTRY_ISO3,
                'name_en' => 'Sri Lanka',
                'name_native' => null,
                'currency_code' => 'LKR',
                'phone_code' => '+94',
                'is_active' => true,
                'updated_at' => $now,
                'created_at' => $now,
            ]
        );

        return (int) DB::table('location_countries')
            ->where('iso2', self::COUNTRY_ISO2)
            ->value('id');
    }

    private function upsertProvinces(int $countryId, array $rows): array
    {
        $now = now();
        $payload = [];
        $legacyIdToRef = [];

        foreach ($rows as $row) {
            $legacyId = (int) ($row['id'] ?? 0);
            $nameEn = (string) ($row['name_en'] ?? '');

            if ($legacyId <= 0 || $nameEn === '') {
                continue;
            }

            $externalRef = $this->externalRef('PROVINCE', $legacyId);
            $legacyIdToRef[$legacyId] = $externalRef;

            $payload[] = [
                'country_id' => $countryId,
                'external_ref' => $externalRef,
                'name_en' => $nameEn,
                'name_si' => $this->nullableString($row['name_si'] ?? null),
                'name_ta' => $this->nullableString($row['name_ta'] ?? null),
                'updated_at' => $now,
                'created_at' => $now,
            ];
        }

        if (!empty($payload)) {
            DB::table('location_provinces')->upsert(
                $payload,
                ['external_ref'],
                ['country_id', 'name_en', 'name_si', 'name_ta', 'updated_at']
            );
        }

        $provinceIdByRef = DB::table('location_provinces')
            ->whereIn('external_ref', array_values($legacyIdToRef))
            ->pluck('id', 'external_ref')
            ->all();

        $result = [];
        foreach ($legacyIdToRef as $legacyId => $externalRef) {
            if (!isset($provinceIdByRef[$externalRef])) {
                continue;
            }

            $result[$legacyId] = (int) $provinceIdByRef[$externalRef];
        }

        return $result;
    }

    private function upsertDistricts(array $rows, array $provinceIdByLegacyId): array
    {
        $now = now();
        $payload = [];
        $legacyIdToRef = [];

        foreach ($rows as $row) {
            $legacyId = (int) ($row['id'] ?? 0);
            $legacyProvinceId = (int) ($row['province_id'] ?? 0);
            $provinceId = $provinceIdByLegacyId[$legacyProvinceId] ?? null;
            $nameEn = (string) ($row['name_en'] ?? '');

            if ($legacyId <= 0 || !$provinceId || $nameEn === '') {
                continue;
            }

            $externalRef = $this->externalRef('DISTRICT', $legacyId);
            $legacyIdToRef[$legacyId] = $externalRef;

            $payload[] = [
                'province_id' => $provinceId,
                'external_ref' => $externalRef,
                'name_en' => $nameEn,
                'name_si' => $this->nullableString($row['name_si'] ?? null),
                'name_ta' => $this->nullableString($row['name_ta'] ?? null),
                'updated_at' => $now,
                'created_at' => $now,
            ];
        }

        if (!empty($payload)) {
            DB::table('location_districts')->upsert(
                $payload,
                ['external_ref'],
                ['province_id', 'name_en', 'name_si', 'name_ta', 'updated_at']
            );
        }

        $districtIdByRef = DB::table('location_districts')
            ->whereIn('external_ref', array_values($legacyIdToRef))
            ->pluck('id', 'external_ref')
            ->all();

        $result = [];
        foreach ($legacyIdToRef as $legacyId => $externalRef) {
            if (!isset($districtIdByRef[$externalRef])) {
                continue;
            }

            $result[$legacyId] = (int) $districtIdByRef[$externalRef];
        }

        return $result;
    }

    private function upsertCities(array $rows, array $districtIdByLegacyId): int
    {
        $now = now();
        $payload = [];

        foreach ($rows as $row) {
            $legacyId = (int) ($row['id'] ?? 0);
            $legacyDistrictId = (int) ($row['district_id'] ?? 0);
            $districtId = $districtIdByLegacyId[$legacyDistrictId] ?? null;
            $nameEn = (string) ($row['name_en'] ?? '');

            if ($legacyId <= 0 || !$districtId || $nameEn === '') {
                continue;
            }

            $payload[] = [
                'district_id' => $districtId,
                'external_ref' => $this->externalRef('CITY', $legacyId),
                'name_en' => $nameEn,
                'name_si' => $this->nullableString($row['name_si'] ?? null),
                'name_ta' => $this->nullableString($row['name_ta'] ?? null),
                'sub_name_en' => $this->nullableString($row['sub_name_en'] ?? null),
                'sub_name_si' => $this->nullableString($row['sub_name_si'] ?? null),
                'sub_name_ta' => $this->nullableString($row['sub_name_ta'] ?? null),
                'postcode' => $this->nullableString($row['postcode'] ?? null),
                'latitude' => $this->nullableDecimal($row['latitude'] ?? null),
                'longitude' => $this->nullableDecimal($row['longitude'] ?? null),
                'updated_at' => $now,
                'created_at' => $now,
            ];
        }

        $count = 0;
        foreach (array_chunk($payload, 500) as $chunk) {
            DB::table('location_cities')->upsert(
                $chunk,
                ['external_ref'],
                [
                    'district_id',
                    'name_en',
                    'name_si',
                    'name_ta',
                    'sub_name_en',
                    'sub_name_si',
                    'sub_name_ta',
                    'postcode',
                    'latitude',
                    'longitude',
                    'updated_at',
                ]
            );

            $count += count($chunk);
        }

        return $count;
    }

    private function parseRowsFromSql(string $filePath): array
    {
        if (!is_file($filePath)) {
            return [];
        }

        $sql = file_get_contents($filePath);
        if ($sql === false || $sql === '') {
            return [];
        }

        $rows = [];
        preg_match_all('/INSERT\s+INTO\s+`[^`]+`\s*\(([^)]+)\)\s*VALUES\s*(.+?);/is', $sql, $statements, PREG_SET_ORDER);

        foreach ($statements as $statement) {
            $columns = array_map(
                static fn ($column) => trim($column, " \t\n\r\0\x0B`"),
                explode(',', (string) $statement[1])
            );

            preg_match_all('/\((.*?)\)(?:,|$)/s', (string) $statement[2], $tuples);

            foreach ($tuples[1] as $tuple) {
                $values = str_getcsv((string) $tuple, ',', "'", '\\');
                if (count($values) !== count($columns)) {
                    continue;
                }

                $normalizedValues = array_map([$this, 'normalizeSqlValue'], $values);
                $rows[] = array_combine($columns, $normalizedValues);
            }
        }

        return $rows;
    }

    private function normalizeSqlValue(?string $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);
        if (strcasecmp($trimmed, 'NULL') === 0) {
            return null;
        }

        return $trimmed;
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $stringValue = trim((string) $value);
        return $stringValue === '' ? null : $stringValue;
    }

    private function nullableDecimal(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (float) $value : null;
    }

    private function externalRef(string $entityType, int $legacyId): string
    {
        return self::COUNTRY_ISO2 . '-' . $entityType . '-' . $legacyId;
    }
}
