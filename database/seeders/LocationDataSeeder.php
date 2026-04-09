<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationDataSeeder extends Seeder
{
    public function run(): void
    {
        $base = database_path('locations');

        $sriLankaId = $this->seedSriLanka();
        $this->seedProvinces($base . '/provinces.sql', $sriLankaId);
        $this->seedDistricts($base . '/districts.sql');
        $this->seedCities($base . '/cities.sql');
    }

    private function seedSriLanka(): int
    {
        $existing = DB::table('location_countries')->where('iso2', 'LK')->first();
        if ($existing) {
            $this->command->info('location_countries: Sri Lanka already exists (id=' . $existing->id . ').');
            return (int) $existing->id;
        }

        $id = DB::table('location_countries')->insertGetId([
            'iso2'          => 'LK',
            'iso3'          => 'LKA',
            'name_en'       => 'Sri Lanka',
            'name_native'   => 'ශ්‍රී ලංකාව',
            'currency_code' => 'LKR',
            'phone_code'    => '+94',
            'is_active'     => 1,
        ]);

        $this->command->info('Inserted Sri Lanka into location_countries (id=' . $id . ').');
        return (int) $id;
    }

    private function parseInsertRows(string $file, array $columns): array
    {
        if (!file_exists($file)) {
            $this->command->warn("File not found: {$file}");
            return [];
        }

        $sql = file_get_contents($file);
        $rows = [];

        // Match all INSERT INTO ... VALUES (...) blocks
        preg_match_all('/INSERT INTO `\w+` \([^)]+\) VALUES\s*([\s\S]*?);/i', $sql, $matches);

        foreach ($matches[1] as $valueBlock) {
            // Split individual row tuples
            preg_match_all('/\(([^)]+)\)/', $valueBlock, $tuples);
            foreach ($tuples[1] as $tuple) {
                $values = $this->parseTupleValues($tuple);
                if (count($values) === count($columns)) {
                    $rows[] = array_combine($columns, $values);
                }
            }
        }

        return $rows;
    }

    private function parseTupleValues(string $tuple): array
    {
        $values = [];
        $current = '';
        $inString = false;
        $quoteChar = null;
        $i = 0;
        $len = strlen($tuple);

        while ($i < $len) {
            $char = $tuple[$i];

            if (!$inString && ($char === "'" || $char === '"')) {
                $inString = true;
                $quoteChar = $char;
                $i++;
                continue;
            }

            if ($inString && $char === '\\' && $i + 1 < $len) {
                $current .= $tuple[$i + 1];
                $i += 2;
                continue;
            }

            if ($inString && $char === $quoteChar) {
                $inString = false;
                $quoteChar = null;
                $i++;
                continue;
            }

            if (!$inString && $char === ',') {
                $trimmed = trim($current);
                $values[] = ($trimmed === '' || $trimmed === 'NULL') ? null : $trimmed;
                $current = '';
                $i++;
                continue;
            }

            $current .= $char;
            $i++;
        }

        $trimmed = trim($current);
        $values[] = ($trimmed === '' || $trimmed === 'NULL') ? null : $trimmed;

        return $values;
    }

    private function seedProvinces(string $file, int $countryId): void
    {
        if (DB::table('location_provinces')->count() > 0) {
            $this->command->info('location_provinces already populated, skipping.');
            return;
        }

        $columns = ['id', 'name_en', 'name_si', 'name_ta'];
        $rows = $this->parseInsertRows($file, $columns);

        foreach (array_chunk($rows, 100) as $chunk) {
            $chunk = array_map(fn ($row) => array_merge($row, ['country_id' => $countryId]), $chunk);
            DB::table('location_provinces')->insert($chunk);
        }

        $this->command->info('Seeded ' . count($rows) . ' provinces.');
    }

    private function seedDistricts(string $file): void
    {
        if (DB::table('location_districts')->count() > 0) {
            $this->command->info('location_districts already populated, skipping.');
            return;
        }

        $columns = ['id', 'province_id', 'name_en', 'name_si', 'name_ta'];
        $rows = $this->parseInsertRows($file, $columns);

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('location_districts')->insert($chunk);
        }

        $this->command->info('Seeded ' . count($rows) . ' districts.');
    }

    private function seedCities(string $file): void
    {
        if (!file_exists($file)) {
            $this->command->warn("File not found: {$file}");
            return;
        }

        $before = DB::table('location_cities')->count();

        $sql = file_get_contents($file);

        // Extract just the INSERT INTO block and execute it directly,
        // using INSERT IGNORE to skip any rows that are already present.
        $pos = strpos($sql, 'INSERT INTO `cities`');
        if ($pos === false) {
            $this->command->error('No INSERT INTO `cities` found in cities.sql');
            return;
        }

        $end = strpos($sql, ';', $pos);
        $insertSql = substr($sql, $pos, $end - $pos + 1);

        // Redirect to the correct table and ignore duplicates
        $insertSql = str_replace(
            'INSERT INTO `cities`',
            'INSERT IGNORE INTO `location_cities`',
            $insertSql
        );

        DB::unprepared($insertSql);

        $after = DB::table('location_cities')->count();
        $this->command->info("location_cities: {$after} rows total ({$before} before, " . ($after - $before) . " inserted).");
    }
}
