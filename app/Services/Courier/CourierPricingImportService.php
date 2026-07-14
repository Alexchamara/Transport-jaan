<?php

namespace App\Services\Courier;

use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Smalot\PdfParser\Parser;

class CourierPricingImportService
{
    private const FIELD_ALIASES = [
        'city' => [
            'city',
            'town',
            'destination_city',
            'dest_city',
            'destination',
            'location',
            'area_name',
        ],
        'zone' => [
            'zone',
            'zone_name',
            'area_zone',
            'destination_zone',
            'delivery_zone',
            'region',
        ],
        'originZone' => [
            'origin_zone',
            'from_zone',
            'pickup_zone',
            'source_zone',
        ],
        'destinationZone' => [
            'destination_zone',
            'to_zone',
            'drop_zone',
            'receiver_zone',
            'zone_to',
            'zone',
        ],
        'serviceLevel' => [
            'service',
            'service_level',
            'service_tier',
            'delivery_type',
            'sla',
            'speed',
        ],
        'basePrice' => [
            'base_price',
            'base_rate',
            'base',
            'first_kg',
            'firstkg',
            'fixed_rate',
            'amount',
            'price',
            'rate',
        ],
        'perKgPrice' => [
            'per_kg',
            'perkg',
            'additional_kg',
            'addl_kg',
            'extra_kg',
            'each_kg',
            'per_kg_price',
        ],
        'minPrice' => [
            'min_price',
            'minimum',
            'minimum_price',
            'floor_price',
        ],
        'priorityMultiplier' => [
            'priority_multiplier',
            'multiplier',
            'priority_mult',
            'tier_multiplier',
        ],
        'slaDays' => [
            'sla_days',
            'promised_sla_days',
            'days',
            'eta_days',
        ],
    ];

    public function preview(UploadedFile $file, string $pricingCategory = 'domestic', array $serviceCatalog = []): array
    {
        $pricingCategory = in_array($pricingCategory, ['domestic', 'international'], true) ? $pricingCategory : 'domestic';

        $extracted = $this->extractRowsFromFile($file);
        $fieldMap = $this->detectFieldMap($extracted['headers']);
        $buildResult = $this->buildPatchFromRows(
            $extracted['rows'],
            $fieldMap,
            $pricingCategory,
            $serviceCatalog
        );

        $patch = $this->sanitizePatch($buildResult['patch'], $pricingCategory, $serviceCatalog);

        $mappedHeaders = array_filter($fieldMap, fn ($value) => is_string($value) && $value !== '');
        $mappedHeaderLookup = array_flip($mappedHeaders);
        $unmappedHeaders = [];
        foreach ($extracted['headers'] as $header) {
            if (!isset($mappedHeaderLookup[$header])) {
                $unmappedHeaders[] = $header;
            }
        }

        $warnings = array_values(array_unique(array_filter(array_merge(
            $extracted['warnings'],
            $buildResult['warnings'],
            count($unmappedHeaders) > 0 ? ['Some columns were not mapped automatically.'] : []
        ))));

        $confidence = $this->calculateConfidence(
            $extracted['detectedFormat'],
            (int) $buildResult['rowsScanned'],
            (int) $buildResult['rowsParsed'],
            $fieldMap,
            $patch,
            $buildResult['conflicts']
        );

        return [
            'detectedFormat' => $extracted['detectedFormat'],
            'fileName' => (string) $file->getClientOriginalName(),
            'confidence' => $confidence,
            'requiresManualReview' => $confidence < 0.75
                || count($buildResult['conflicts']) > 0
                || $extracted['detectedFormat'] === 'pdf',
            'rowsScanned' => (int) $buildResult['rowsScanned'],
            'rowsParsed' => (int) $buildResult['rowsParsed'],
            'mappedFields' => $fieldMap,
            'unmappedHeaders' => $unmappedHeaders,
            'warnings' => $warnings,
            'conflicts' => $buildResult['conflicts'],
            'sampleRows' => $buildResult['sampleRows'],
            'patch' => $patch,
            'summary' => [
                'zoneCount' => count($patch['zoneMaster']),
                'categoryCount' => count($patch['categories']),
                'laneCount' => count($patch['laneMatrix']['rows']),
            ],
        ];
    }

    public function sanitizePatch(array $patch, string $pricingCategory = 'domestic', array $serviceCatalog = []): array
    {
        $pricingCategory = in_array($pricingCategory, ['domestic', 'international'], true) ? $pricingCategory : 'domestic';
        $allowedServiceKeys = $this->allowedServiceKeys($serviceCatalog);
        $defaultServiceKey = $allowedServiceKeys[0] ?? 'economy';

        $zoneRows = is_array($patch['zoneMaster'] ?? null) ? $patch['zoneMaster'] : [];
        $normalizedZonesByKey = [];
        foreach ($zoneRows as $index => $zoneRow) {
            $row = is_array($zoneRow) ? $zoneRow : [];
            $zoneKey = $this->normalizeZoneKey((string) ($row['key'] ?? $row['label'] ?? ''));
            if ($zoneKey === '') {
                continue;
            }

            $zoneLabel = trim((string) ($row['label'] ?? ''));
            if ($zoneLabel === '') {
                $zoneLabel = $this->humanizeKey($zoneKey);
            }

            $normalizedZonesByKey[$zoneKey] = [
                'key' => $zoneKey,
                'label' => $zoneLabel,
                'isActive' => (bool) ($row['isActive'] ?? true),
                'sortOrder' => max(1, (int) ($row['sortOrder'] ?? ($index + 1))),
            ];
        }

        $zoneMaster = array_values($normalizedZonesByKey);
        usort($zoneMaster, fn ($a, $b) => (int) $a['sortOrder'] <=> (int) $b['sortOrder']);

        $categoryRows = is_array($patch['categories'] ?? null) ? $patch['categories'] : [];
        $normalizedCategories = [];
        foreach ($categoryRows as $index => $item) {
            $row = is_array($item) ? $item : [];
            $serviceLevelKey = $this->normalizeServiceLevelKey((string) ($row['serviceLevelKey'] ?? ''));
            if (!in_array($serviceLevelKey, $allowedServiceKeys, true)) {
                $serviceLevelKey = $defaultServiceKey;
            }

            $label = trim((string) ($row['label'] ?? ''));
            if ($label === '') {
                $label = 'Imported Tier ' . ($index + 1);
            }

            $cityLabel = $this->normalizeCityLabel((string) ($row['city'] ?? ''));

            $signature = strtolower($serviceLevelKey . '|' . $label . '|' . $cityLabel);
            $normalizedCategories[$signature] = [
                'id' => trim((string) ($row['id'] ?? "{$pricingCategory}_import_tier_{$index}")) ?: "{$pricingCategory}_import_tier_{$index}",
                'label' => $label,
                'serviceLevelKey' => $serviceLevelKey,
                'slaDays' => max(1, (int) ($row['slaDays'] ?? 1)),
                'basePrice' => max(0, (float) ($row['basePrice'] ?? 0)),
                'perKgPrice' => max(0, (float) ($row['perKgPrice'] ?? 0)),
                'minPrice' => max(0, (float) ($row['minPrice'] ?? 0)),
                'priorityMultiplier' => max(0.1, (float) ($row['priorityMultiplier'] ?? 1)),
                'city' => $cityLabel,
            ];
        }

        $laneInput = is_array($patch['laneMatrix'] ?? null) ? $patch['laneMatrix'] : [];
        $laneRows = is_array($laneInput['rows'] ?? null) ? $laneInput['rows'] : [];
        $normalizedLanes = [];
        foreach ($laneRows as $index => $item) {
            $row = is_array($item) ? $item : [];
            $serviceLevelKey = $this->normalizeServiceLevelKey((string) ($row['serviceLevelKey'] ?? ''));
            if (!in_array($serviceLevelKey, $allowedServiceKeys, true)) {
                $serviceLevelKey = $defaultServiceKey;
            }

            $originZone = $this->normalizeZoneKey((string) ($row['originZone'] ?? '*'));
            $destinationZone = $this->normalizeZoneKey((string) ($row['destinationZone'] ?? '*'));
            if ($originZone === '') {
                $originZone = '*';
            }
            if ($destinationZone === '') {
                $destinationZone = '*';
            }

            $distanceFrom = max(0, (float) ($row['distanceFromKm'] ?? 0));
            $distanceTo = isset($row['distanceToKm']) && $row['distanceToKm'] !== '' && $row['distanceToKm'] !== null
                ? max($distanceFrom, (float) $row['distanceToKm'])
                : null;

            $signature = implode('|', [
                $originZone,
                $destinationZone,
                $serviceLevelKey,
                (string) $distanceFrom,
                $distanceTo === null ? '' : (string) $distanceTo,
            ]);

            $normalizedLanes[$signature] = [
                'id' => trim((string) ($row['id'] ?? "{$pricingCategory}_import_lane_{$index}")) ?: "{$pricingCategory}_import_lane_{$index}",
                'originZone' => $originZone,
                'destinationZone' => $destinationZone,
                'serviceLevelKey' => $serviceLevelKey,
                'distanceFromKm' => $distanceFrom,
                'distanceToKm' => $distanceTo,
                'distanceBaseKm' => max(0, (float) ($row['distanceBaseKm'] ?? 0)),
                'perKmPrice' => max(0, (float) ($row['perKmPrice'] ?? 0)),
                'distanceSurcharge' => max(0, (float) ($row['distanceSurcharge'] ?? 0)),
                'distanceMultiplier' => max(0.1, (float) ($row['distanceMultiplier'] ?? 1)),
                'basePrice' => max(0, (float) ($row['basePrice'] ?? 0)),
                'perKgPrice' => max(0, (float) ($row['perKgPrice'] ?? 0)),
                'minPrice' => max(0, (float) ($row['minPrice'] ?? 0)),
                'priorityMultiplier' => max(0.1, (float) ($row['priorityMultiplier'] ?? 1)),
                'isActive' => (bool) ($row['isActive'] ?? true),
                'city' => $this->normalizeCityLabel((string) ($row['city'] ?? '')),
            ];
        }

        $cityZoneMapRows = is_array($patch['cityZoneMap'] ?? null) ? $patch['cityZoneMap'] : [];
        $normalizedCityZoneMap = [];
        foreach ($cityZoneMapRows as $entry) {
            $row = is_array($entry) ? $entry : [];
            $cityLabel = $this->normalizeCityLabel((string) ($row['city'] ?? ''));
            $cityKey = $this->normalizeCityKey((string) ($row['cityKey'] ?? $cityLabel));
            if ($cityKey === '') {
                continue;
            }

            $zones = [];
            $zonesInput = is_array($row['zones'] ?? null) ? $row['zones'] : [];
            foreach ($zonesInput as $zoneKey => $votes) {
                $normalizedZoneKey = $this->normalizeZoneKey((string) $zoneKey);
                if ($normalizedZoneKey === '') {
                    continue;
                }

                $zones[$normalizedZoneKey] = max(0, (int) $votes);
            }

            $zoneFromRow = $this->normalizeZoneKey((string) ($row['zone'] ?? ''));
            if ($zoneFromRow !== '' && !isset($zones[$zoneFromRow])) {
                $zones[$zoneFromRow] = max(1, (int) ($row['votes'] ?? 1));
            }

            if (count($zones) === 0) {
                continue;
            }

            arsort($zones);
            $recommendedZone = (string) array_key_first($zones);
            $topVotes = (int) ($zones[$recommendedZone] ?? 0);
            $totalVotes = max(1, array_sum($zones));

            $normalizedCityZoneMap[$cityKey] = [
                'cityKey' => $cityKey,
                'city' => $cityLabel !== '' ? $cityLabel : $this->humanizeKey($cityKey),
                'zone' => $recommendedZone,
                'zones' => $zones,
                'isConflict' => count($zones) > 1,
                'recommendedConfidence' => round($topVotes / $totalVotes, 2),
            ];
        }

        return [
            'zoneMaster' => $zoneMaster,
            'categories' => array_values($normalizedCategories),
            'laneMatrix' => [
                'enabled' => (bool) ($laneInput['enabled'] ?? count($normalizedLanes) > 0),
                'rows' => array_values($normalizedLanes),
            ],
            'cityZoneMap' => array_values($normalizedCityZoneMap),
        ];
    }

    private function extractRowsFromFile(UploadedFile $file): array
    {
        $detectedFormat = $this->detectFormat($file);

        return match ($detectedFormat) {
            'csv' => $this->parseCsvFile($file, $detectedFormat),
            'xlsx', 'xls' => $this->parseSpreadsheetFile($file, $detectedFormat),
            'json' => $this->parseJsonFile($file, $detectedFormat),
            'pdf' => $this->parsePdfFile($file, $detectedFormat),
            default => [
                'detectedFormat' => $detectedFormat,
                'headers' => [],
                'rows' => [],
                'warnings' => ['Unsupported import format.'],
            ],
        };
    }

    private function parseCsvFile(UploadedFile $file, string $detectedFormat): array
    {
        $path = (string) $file->getRealPath();
        $rows = [];
        $warnings = [];

        $handle = fopen($path, 'rb');
        if (!$handle) {
            return [
                'detectedFormat' => $detectedFormat,
                'headers' => [],
                'rows' => [],
                'warnings' => ['Unable to read the selected file.'],
            ];
        }

        $firstLine = fgets($handle);
        rewind($handle);
        $delimiter = $this->detectCsvDelimiter((string) $firstLine);

        $firstRow = fgetcsv($handle, 0, $delimiter, '"', '\\');
        if ($firstRow === false) {
            fclose($handle);
            return [
                'detectedFormat' => $detectedFormat,
                'headers' => [],
                'rows' => [],
                'warnings' => ['The file is empty.'],
            ];
        }

        $hasHeader = $this->looksLikeHeaderRow($firstRow);
        $headers = $hasHeader
            ? $this->normalizeHeaderRow($firstRow)
            : $this->generateColumnHeaders(count($firstRow));

        if (!$hasHeader) {
            $rows[] = $this->associateRow($headers, $firstRow);
            $warnings[] = 'Header row was not detected confidently. Generated generic column names.';
        }

        while (($csvRow = fgetcsv($handle, 0, $delimiter, '"', '\\')) !== false) {
            if (!$this->rowHasValues($csvRow)) {
                continue;
            }

            $rows[] = $this->associateRow($headers, $csvRow);
        }

        fclose($handle);

        return [
            'detectedFormat' => $detectedFormat,
            'headers' => $headers,
            'rows' => $rows,
            'warnings' => $warnings,
        ];
    }

    private function parseSpreadsheetFile(UploadedFile $file, string $detectedFormat): array
    {
        $warnings = [];

        $spreadsheet = IOFactory::load((string) $file->getRealPath());
        $sheet = $spreadsheet->getSheet(0);
        $dataRows = $sheet->toArray(null, true, true, false);

        $firstNonEmpty = null;
        foreach ($dataRows as $index => $row) {
            if ($this->rowHasValues($row)) {
                $firstNonEmpty = $index;
                break;
            }
        }

        if ($firstNonEmpty === null) {
            return [
                'detectedFormat' => $detectedFormat,
                'headers' => [],
                'rows' => [],
                'warnings' => ['The spreadsheet does not contain importable rows.'],
            ];
        }

        $headerRow = $dataRows[$firstNonEmpty] ?? [];
        $hasHeader = $this->looksLikeHeaderRow($headerRow);
        $headers = $hasHeader
            ? $this->normalizeHeaderRow($headerRow)
            : $this->generateColumnHeaders(count($headerRow));

        if (!$hasHeader) {
            $warnings[] = 'Header row was not detected confidently. Generated generic column names.';
        }

        $rows = [];
        foreach ($dataRows as $index => $row) {
            if ($index < $firstNonEmpty) {
                continue;
            }

            if ($index === $firstNonEmpty && $hasHeader) {
                continue;
            }

            if (!$this->rowHasValues($row)) {
                continue;
            }

            $rows[] = $this->associateRow($headers, $row);
        }

        return [
            'detectedFormat' => $detectedFormat,
            'headers' => $headers,
            'rows' => $rows,
            'warnings' => $warnings,
        ];
    }

    private function parseJsonFile(UploadedFile $file, string $detectedFormat): array
    {
        $raw = file_get_contents((string) $file->getRealPath());
        $decoded = json_decode((string) $raw, true);

        if (!is_array($decoded)) {
            return [
                'detectedFormat' => $detectedFormat,
                'headers' => [],
                'rows' => [],
                'warnings' => ['JSON payload is invalid or unsupported.'],
            ];
        }

        $sourceRows = [];
        if (array_is_list($decoded)) {
            $sourceRows = $decoded;
        } elseif (is_array($decoded['rows'] ?? null)) {
            $sourceRows = $decoded['rows'];
        } elseif (is_array($decoded['data'] ?? null)) {
            $sourceRows = $decoded['data'];
        } else {
            $sourceRows = [$decoded];
        }

        $rows = [];
        $headerIndex = [];
        foreach ($sourceRows as $item) {
            if (!is_array($item)) {
                continue;
            }

            $normalizedRow = [];
            foreach ($item as $key => $value) {
                $header = $this->normalizeHeader((string) $key);
                if ($header === '') {
                    continue;
                }

                $headerIndex[$header] = true;
                $normalizedRow[$header] = is_scalar($value) || $value === null
                    ? $value
                    : json_encode($value);
            }

            if (!empty($normalizedRow)) {
                $rows[] = $normalizedRow;
            }
        }

        return [
            'detectedFormat' => $detectedFormat,
            'headers' => array_keys($headerIndex),
            'rows' => $rows,
            'warnings' => [],
        ];
    }

    private function parsePdfFile(UploadedFile $file, string $detectedFormat): array
    {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile((string) $file->getRealPath());
            $text = (string) $pdf->getText();
        } catch (\Throwable $exception) {
            return [
                'detectedFormat' => $detectedFormat,
                'headers' => ['city', 'zone', 'base_price', 'per_kg'],
                'rows' => [],
                'warnings' => [
                    'Unable to extract text from this PDF. Export to CSV or XLSX for accurate import.',
                ],
            ];
        }

        $rawLines = preg_split('/\R/u', $text) ?: [];
        $lines = $this->normalizePdfLines($rawLines);
        $zoneRows = $this->extractPdfZoneRows($lines);
        $rateRows = $this->extractPdfRateRows($lines);
        $rows = $this->dedupeImportRows(array_merge($zoneRows, $rateRows));

        $warnings = [
            'PDF extraction uses layout heuristics. Always verify preview rows before applying.',
            'Best accuracy: correct extracted rows in XLSX/CSV and re-import before final apply.',
        ];

        if (count($rows) === 0) {
            $warnings[] = 'No confident city-zone rows were detected from this PDF.';
        }

        if (count($rateRows) === 0) {
            $warnings[] = 'No numeric rate rows were detected in this PDF. Import will focus on city-zone mapping only.';
        }

        return [
            'detectedFormat' => $detectedFormat,
            'headers' => ['city', 'zone', 'base_price', 'per_kg'],
            'rows' => $rows,
            'warnings' => array_values(array_unique($warnings)),
        ];
    }

    private function normalizePdfLines(array $rawLines): array
    {
        $lines = [];

        foreach ($rawLines as $rawLine) {
            if (!is_string($rawLine)) {
                continue;
            }

            $parts = $this->splitPdfMultiColumnLine($rawLine);
            foreach ($parts as $part) {
                $line = trim((string) $part);
                if ($line === '') {
                    continue;
                }

                $line = preg_replace('/\s+/u', ' ', $line) ?? $line;
                if ($this->looksLikePdfNoiseLine($line)) {
                    continue;
                }

                $lines[] = $line;
            }
        }

        return $lines;
    }

    private function splitPdfMultiColumnLine(string $rawLine): array
    {
        $trimmed = trim($rawLine);
        if ($trimmed === '') {
            return [];
        }

        $parts = preg_split('/\t+|\s{3,}/u', $trimmed) ?: [];
        $parts = array_values(array_filter(array_map('trim', $parts), fn ($value) => $value !== ''));

        if (count($parts) <= 1) {
            return [$trimmed];
        }

        return $parts;
    }

    private function extractPdfZoneRows(array $lines): array
    {
        $rows = [];
        $currentZone = null;

        foreach ($lines as $line) {
            $normalized = trim((string) $line);
            if ($normalized === '') {
                continue;
            }

            if (preg_match('/^(?:zone\s*[:\-]?\s*)([a-z0-9][a-z0-9\-_ ]{0,15})$/i', $normalized, $match) === 1) {
                $currentZone = $this->normalizePdfZoneLabel($match[1]);
                continue;
            }

            if (preg_match('/^([a-z0-9][a-z0-9\-_ ]{0,15})\s+zone$/i', $normalized, $match) === 1) {
                $currentZone = $this->normalizePdfZoneLabel($match[1]);
                continue;
            }

            if (
                preg_match('/^(?:zone\s*[:\-]?\s*)([a-z0-9][a-z0-9\-_ ]{0,15})\s*[:\-]\s*(.+)$/i', $normalized, $match) === 1
                || preg_match('/^([a-z0-9][a-z0-9\-_ ]{0,15})\s*[:\-]\s*(.+)$/i', $normalized, $match) === 1
            ) {
                $zone = $this->normalizePdfZoneLabel($match[1]);
                foreach ($this->splitPdfCityCandidates((string) ($match[2] ?? '')) as $city) {
                    $cityLabel = $this->normalizePdfCityLabel($city);
                    if ($cityLabel === '' || $zone === '') {
                        continue;
                    }

                    $rows[] = [
                        'city' => $cityLabel,
                        'zone' => $zone,
                    ];
                }

                $currentZone = $zone;
                continue;
            }

            if (preg_match('/^(.+?)\s+(?:zone\s*[:\-]?\s*)?([a-z0-9]{1,6})$/i', $normalized, $match) === 1) {
                $city = $this->normalizePdfCityLabel((string) ($match[1] ?? ''));
                $zoneToken = trim((string) ($match[2] ?? ''));
                if ($city !== '' && $this->isLikelyZoneToken($zoneToken)) {
                    $rows[] = [
                        'city' => $city,
                        'zone' => $this->normalizePdfZoneLabel($zoneToken),
                    ];
                    continue;
                }
            }

            if ($currentZone !== null && $currentZone !== '' && !$this->lineContainsNumericValue($normalized)) {
                foreach ($this->splitPdfCityCandidates($normalized) as $city) {
                    $cityLabel = $this->normalizePdfCityLabel($city);
                    if ($cityLabel === '') {
                        continue;
                    }

                    $rows[] = [
                        'city' => $cityLabel,
                        'zone' => $currentZone,
                    ];
                }
            }
        }

        return $rows;
    }

    private function extractPdfRateRows(array $lines): array
    {
        $rows = [];

        foreach ($lines as $line) {
            $normalized = trim((string) $line);
            if ($normalized === '' || !$this->lineContainsNumericValue($normalized)) {
                continue;
            }

            $tokens = preg_split('/\s+/u', $normalized) ?: [];
            if (count($tokens) < 2) {
                continue;
            }

            $numericIndexes = [];
            foreach ($tokens as $tokenIndex => $tokenValue) {
                if ($this->toFloat($tokenValue) !== null) {
                    $numericIndexes[] = $tokenIndex;
                }
            }

            if (count($numericIndexes) === 0) {
                continue;
            }

            $firstNumeric = $numericIndexes[0];
            $prefixTokens = array_slice($tokens, 0, $firstNumeric);
            if (count($prefixTokens) === 0) {
                continue;
            }

            $zoneLabel = '';
            $cityTokens = $prefixTokens;
            $lowerPrefix = array_map(fn ($token) => strtolower((string) $token), $prefixTokens);
            $zoneWordIndex = array_search('zone', $lowerPrefix, true);

            if ($zoneWordIndex !== false && isset($prefixTokens[$zoneWordIndex + 1])) {
                $zoneLabel = $this->normalizePdfZoneLabel((string) $prefixTokens[$zoneWordIndex + 1]);
                $cityTokens = array_slice($prefixTokens, 0, $zoneWordIndex);
            } elseif (count($prefixTokens) >= 2) {
                $lastToken = (string) ($prefixTokens[count($prefixTokens) - 1] ?? '');
                if ($this->isLikelyZoneToken($lastToken)) {
                    $zoneLabel = $this->normalizePdfZoneLabel($lastToken);
                    $cityTokens = array_slice($prefixTokens, 0, -1);
                }
            }

            $city = $this->normalizePdfCityLabel(implode(' ', $cityTokens));
            if ($city === '') {
                continue;
            }

            $row = [
                'city' => $city,
                'base_price' => $tokens[$firstNumeric] ?? null,
            ];

            if ($zoneLabel !== '') {
                $row['zone'] = $zoneLabel;
            }

            if (isset($numericIndexes[1])) {
                $row['per_kg'] = $tokens[$numericIndexes[1]] ?? null;
            }

            $rows[] = $row;
        }

        return $rows;
    }

    private function splitPdfCityCandidates(string $value): array
    {
        $normalized = str_replace(['•', '|'], ',', $value);
        $parts = preg_split('/[,;\/]+/u', $normalized) ?: [];
        $parts = array_values(array_filter(array_map('trim', $parts), fn ($item) => $item !== ''));

        if (count($parts) <= 1) {
            return [trim($value)];
        }

        return $parts;
    }

    private function normalizePdfZoneLabel(string $value): string
    {
        $zone = trim($value);
        $zone = preg_replace('/^zone\s*/i', '', $zone) ?? $zone;
        $zone = preg_replace('/\s+/u', ' ', $zone) ?? $zone;

        return trim($zone);
    }

    private function normalizePdfCityLabel(string $value): string
    {
        $city = trim($value);
        $city = preg_replace('/^[\-\*\.:]+/u', '', $city) ?? $city;
        $city = preg_replace('/\s+/u', ' ', $city) ?? $city;
        $city = trim($city);

        if ($city === '' || preg_match('/^\d+$/', $city) === 1 || mb_strlen($city) < 2) {
            return '';
        }

        return $city;
    }

    private function isLikelyZoneToken(string $token): bool
    {
        $zone = trim($token);
        if ($zone === '') {
            return false;
        }

        $lower = strtolower($zone);
        if (in_array($lower, ['zone', 'city', 'cities', 'rate', 'price', 'card', 'list', 'domestic', 'international', 'lkr'], true)) {
            return false;
        }

        if (preg_match('/^[a-z]$/i', $zone) === 1) {
            return true;
        }

        if (preg_match('/^[a-z]{1,3}\d{0,2}$/i', $zone) === 1) {
            return true;
        }

        if (preg_match('/^\d{1,3}$/', $zone) === 1) {
            return true;
        }

        return false;
    }

    private function looksLikePdfNoiseLine(string $line): bool
    {
        if (mb_strlen($line) < 2) {
            return true;
        }

        if (preg_match('/^(page\s+\d+|domestic\s+zone|zone\s+list|rate\s*card|table\s+of\s+contents|sri\s*lanka)$/i', $line) === 1) {
            return true;
        }

        if (preg_match('/^\d+\s*\/\s*\d+$/', $line) === 1) {
            return true;
        }

        return false;
    }

    private function lineContainsNumericValue(string $line): bool
    {
        return preg_match('/\d/', $line) === 1;
    }

    private function dedupeImportRows(array $rows): array
    {
        $deduped = [];
        $seen = [];

        foreach ($rows as $item) {
            if (!is_array($item)) {
                continue;
            }

            $city = trim((string) ($item['city'] ?? ''));
            $zone = trim((string) ($item['zone'] ?? ''));
            $base = trim((string) ($item['base_price'] ?? ''));
            $perKg = trim((string) ($item['per_kg'] ?? ''));

            if ($city === '' && $zone === '') {
                continue;
            }

            $signature = strtolower($city) . '|' . strtolower($zone) . '|' . $base . '|' . $perKg;
            if (isset($seen[$signature])) {
                continue;
            }

            $seen[$signature] = true;
            $deduped[] = $item;
        }

        return $deduped;
    }

    private function detectFieldMap(array $headers): array
    {
        $headerSet = [];
        foreach ($headers as $header) {
            $normalizedHeader = $this->normalizeHeader((string) $header);
            if ($normalizedHeader !== '') {
                $headerSet[] = $normalizedHeader;
            }
        }

        $map = [];
        foreach (self::FIELD_ALIASES as $field => $aliases) {
            $selected = null;

            foreach ($aliases as $alias) {
                $normalizedAlias = $this->normalizeHeader($alias);
                if (in_array($normalizedAlias, $headerSet, true)) {
                    $selected = $normalizedAlias;
                    break;
                }
            }

            if ($selected === null) {
                foreach ($headerSet as $header) {
                    foreach ($aliases as $alias) {
                        $normalizedAlias = $this->normalizeHeader($alias);
                        if ($normalizedAlias !== '' && str_contains($header, $normalizedAlias)) {
                            $selected = $header;
                            break 2;
                        }
                    }
                }
            }

            $map[$field] = $selected;
        }

        if (!$map['destinationZone'] && $map['zone']) {
            $map['destinationZone'] = $map['zone'];
        }

        return $map;
    }

    private function buildPatchFromRows(array $rows, array $fieldMap, string $pricingCategory, array $serviceCatalog): array
    {
        $allowedServiceKeys = $this->allowedServiceKeys($serviceCatalog);
        $defaultServiceKey = $allowedServiceKeys[0] ?? 'economy';

        $zoneRowsByKey = [];
        $categoryRows = [];
        $laneRows = [];
        $sampleRows = [];
        $warnings = [];

        $cityZoneVotes = [];
        $rowsScanned = count($rows);
        $rowsParsed = 0;

        foreach ($rows as $index => $rowItem) {
            $row = is_array($rowItem) ? $rowItem : [];

            $city = trim((string) $this->mappedValue($row, $fieldMap, 'city'));
            $zoneLabel = trim((string) $this->mappedValue($row, $fieldMap, 'zone'));
            $originZoneLabel = trim((string) $this->mappedValue($row, $fieldMap, 'originZone'));
            $destinationZoneLabel = trim((string) $this->mappedValue($row, $fieldMap, 'destinationZone'));
            if ($destinationZoneLabel === '' && $zoneLabel !== '') {
                $destinationZoneLabel = $zoneLabel;
            }

            $rawServiceLevel = trim((string) $this->mappedValue($row, $fieldMap, 'serviceLevel'));
            $serviceLevelKey = $this->normalizeServiceLevelKey($rawServiceLevel);
            if ($serviceLevelKey === '') {
                $serviceLevelKey = $defaultServiceKey;
            }

            $basePrice = $this->toFloat($this->mappedValue($row, $fieldMap, 'basePrice'));
            $perKgPrice = $this->toFloat($this->mappedValue($row, $fieldMap, 'perKgPrice'));
            $minPrice = $this->toFloat($this->mappedValue($row, $fieldMap, 'minPrice'));
            $priorityMultiplier = $this->toFloat($this->mappedValue($row, $fieldMap, 'priorityMultiplier'));
            $slaDays = (int) round($this->toFloat($this->mappedValue($row, $fieldMap, 'slaDays')) ?? 1);

            $hasPriceData = $basePrice !== null || $perKgPrice !== null || $minPrice !== null;
            $hasZoneData = $zoneLabel !== '' || $originZoneLabel !== '' || $destinationZoneLabel !== '';

            if (!$hasPriceData && !$hasZoneData && $city === '') {
                continue;
            }

            $rowsParsed++;

            foreach ([$zoneLabel, $originZoneLabel, $destinationZoneLabel] as $zoneCandidate) {
                $zoneKey = $this->normalizeZoneKey($zoneCandidate);
                if ($zoneKey === '') {
                    continue;
                }

                $zoneRowsByKey[$zoneKey] = [
                    'key' => $zoneKey,
                    'label' => trim($zoneCandidate) !== '' ? trim($zoneCandidate) : $this->humanizeKey($zoneKey),
                    'isActive' => true,
                    'sortOrder' => count($zoneRowsByKey) + 1,
                ];
            }

            if ($city !== '' && $destinationZoneLabel !== '') {
                $cityKey = $this->normalizeCityKey($city);
                $zoneKey = $this->normalizeZoneKey($destinationZoneLabel);
                if ($cityKey !== '' && $zoneKey !== '') {
                    if (!isset($cityZoneVotes[$cityKey])) {
                        $cityZoneVotes[$cityKey] = [
                            'city' => $this->normalizeCityLabel($city),
                            'zones' => [],
                        ];
                    }
                    $cityZoneVotes[$cityKey]['zones'][$zoneKey] = (int) ($cityZoneVotes[$cityKey]['zones'][$zoneKey] ?? 0) + 1;
                }
            }

            if ($hasPriceData) {
                $categoryLabel = $city !== ''
                    ? ($city . ' ' . $this->humanizeKey($serviceLevelKey))
                    : (($destinationZoneLabel !== '' ? $destinationZoneLabel : ($zoneLabel !== '' ? $zoneLabel : 'Imported')) . ' ' . $this->humanizeKey($serviceLevelKey));

                $categoryRows[] = [
                    'id' => "{$pricingCategory}_import_tier_{$index}",
                    'label' => trim($categoryLabel),
                    'serviceLevelKey' => $serviceLevelKey,
                    'slaDays' => max(1, $slaDays),
                    'basePrice' => max(0, (float) ($basePrice ?? 0)),
                    'perKgPrice' => max(0, (float) ($perKgPrice ?? 0)),
                    'minPrice' => max(0, (float) ($minPrice ?? 0)),
                    'priorityMultiplier' => max(0.1, (float) ($priorityMultiplier ?? 1)),
                    'city' => $this->normalizeCityLabel($city),
                ];
            }

            if ($hasPriceData && ($originZoneLabel !== '' || $destinationZoneLabel !== '')) {
                $laneRows[] = [
                    'id' => "{$pricingCategory}_import_lane_{$index}",
                    'originZone' => $originZoneLabel !== '' ? $originZoneLabel : '*',
                    'destinationZone' => $destinationZoneLabel !== '' ? $destinationZoneLabel : ($zoneLabel !== '' ? $zoneLabel : '*'),
                    'serviceLevelKey' => $serviceLevelKey,
                    'distanceFromKm' => 0,
                    'distanceToKm' => null,
                    'distanceBaseKm' => 0,
                    'perKmPrice' => 0,
                    'distanceSurcharge' => 0,
                    'distanceMultiplier' => 1,
                    'basePrice' => max(0, (float) ($basePrice ?? 0)),
                    'perKgPrice' => max(0, (float) ($perKgPrice ?? 0)),
                    'minPrice' => max(0, (float) ($minPrice ?? 0)),
                    'priorityMultiplier' => max(0.1, (float) ($priorityMultiplier ?? 1)),
                    'isActive' => true,
                    'city' => $this->normalizeCityLabel($city),
                ];
            }

            if (count($sampleRows) < 6) {
                $sampleRows[] = [
                    'city' => $city,
                    'zone' => $destinationZoneLabel !== '' ? $destinationZoneLabel : $zoneLabel,
                    'serviceLevelKey' => $serviceLevelKey,
                    'basePrice' => $basePrice,
                    'perKgPrice' => $perKgPrice,
                ];
            }
        }

        $conflicts = [];
        $cityZoneMap = [];
        foreach ($cityZoneVotes as $cityKey => $entry) {
            $zoneVotes = is_array($entry['zones'] ?? null) ? $entry['zones'] : [];
            if (count($zoneVotes) === 0) {
                continue;
            }

            arsort($zoneVotes);
            $zoneKeys = array_keys($zoneVotes);
            $recommendedZone = (string) ($zoneKeys[0] ?? '');
            $topVotes = (int) ($zoneVotes[$recommendedZone] ?? 0);
            $totalVotes = max(1, array_sum($zoneVotes));
            $recommendedConfidence = round($topVotes / $totalVotes, 2);

            $cityZoneMap[] = [
                'cityKey' => $cityKey,
                'city' => (string) ($entry['city'] ?? $cityKey),
                'zone' => $recommendedZone,
                'zones' => $zoneVotes,
                'isConflict' => count($zoneVotes) > 1,
                'recommendedConfidence' => $recommendedConfidence,
            ];

            if (count($zoneVotes) > 1) {
                $conflicts[] = [
                    'type' => 'city_zone_conflict',
                    'cityKey' => $cityKey,
                    'city' => (string) ($entry['city'] ?? $cityKey),
                    'zones' => $zoneKeys,
                    'zoneVotes' => $zoneVotes,
                    'recommendedZone' => $recommendedZone,
                    'recommendedConfidence' => $recommendedConfidence,
                    'message' => 'City maps to multiple zone values.',
                ];
            }
        }

        if ($rowsParsed === 0) {
            $warnings[] = 'No importable pricing rows were detected in the selected file.';
        }

        if (empty($categoryRows)) {
            $warnings[] = 'No rate-card rows were detected. Only zone data may be imported.';
        }

        return [
            'rowsScanned' => $rowsScanned,
            'rowsParsed' => $rowsParsed,
            'warnings' => $warnings,
            'conflicts' => $conflicts,
            'sampleRows' => $sampleRows,
            'patch' => [
                'zoneMaster' => array_values($zoneRowsByKey),
                'categories' => $categoryRows,
                'laneMatrix' => [
                    'enabled' => count($laneRows) > 0,
                    'rows' => $laneRows,
                ],
                'cityZoneMap' => $cityZoneMap,
            ],
        ];
    }

    private function calculateConfidence(
        string $detectedFormat,
        int $rowsScanned,
        int $rowsParsed,
        array $fieldMap,
        array $patch,
        array $conflicts
    ): float {
        $score = 0.15;

        if (in_array($detectedFormat, ['csv', 'xlsx', 'xls', 'json', 'pdf'], true)) {
            $score += 0.2;
        }

        if ($rowsScanned > 0) {
            $score += 0.1;
        }

        if ($rowsParsed > 0) {
            $score += 0.2;
            $score += min(0.1, ($rowsParsed / max(1, $rowsScanned)) * 0.1);
        }

        $mappedFieldCount = count(array_filter($fieldMap, fn ($value) => is_string($value) && $value !== ''));
        if ($mappedFieldCount >= 2) {
            $score += 0.1;
        }
        if ($mappedFieldCount >= 4) {
            $score += 0.1;
        }

        if (count($patch['zoneMaster'] ?? []) > 0) {
            $score += 0.1;
        }

        if (count($patch['categories'] ?? []) > 0) {
            $score += 0.12;
        }

        if (count($patch['laneMatrix']['rows'] ?? []) > 0) {
            $score += 0.08;
        }

        if (count($conflicts) > 0) {
            $score -= min(0.25, count($conflicts) * 0.08);
        }

        if ($detectedFormat === 'pdf') {
            $score -= 0.08;
            $score = min($score, 0.82);
        }

        $score = max(0.05, min(0.99, $score));

        return round($score, 2);
    }

    private function detectFormat(UploadedFile $file): string
    {
        $extension = strtolower((string) $file->getClientOriginalExtension());
        if (in_array($extension, ['csv', 'txt'], true)) {
            return 'csv';
        }

        if (in_array($extension, ['xlsx', 'xls'], true)) {
            return $extension;
        }

        if (in_array($extension, ['json'], true)) {
            return 'json';
        }

        if (in_array($extension, ['pdf'], true)) {
            return 'pdf';
        }

        return $extension !== '' ? $extension : 'unknown';
    }

    private function normalizeHeaderRow(array $row): array
    {
        $headers = [];
        $seen = [];

        foreach ($row as $index => $cell) {
            $header = $this->normalizeHeader((string) $cell);
            if ($header === '') {
                $header = 'column_' . ($index + 1);
            }

            if (!isset($seen[$header])) {
                $seen[$header] = 1;
                $headers[] = $header;
                continue;
            }

            $seen[$header]++;
            $headers[] = $header . '_' . $seen[$header];
        }

        return $headers;
    }

    private function generateColumnHeaders(int $count): array
    {
        $headers = [];
        for ($i = 1; $i <= max(1, $count); $i++) {
            $headers[] = 'column_' . $i;
        }

        return $headers;
    }

    private function normalizeHeader(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';
        return trim($normalized, '_');
    }

    private function normalizeZoneKey(string $value): string
    {
        $trimmed = trim($value);
        if ($trimmed === '' || $trimmed === '*') {
            return '';
        }

        $normalized = strtolower($trimmed);
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';
        $normalized = trim($normalized, '_');

        return $normalized;
    }

    private function normalizeCityKey(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';

        return trim($normalized, '_');
    }

    private function normalizeCityLabel(string $value): string
    {
        $city = trim($value);
        $city = preg_replace('/\s+/u', ' ', $city) ?? $city;

        return trim($city);
    }

    private function normalizeServiceLevelKey(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';
        $normalized = trim($normalized, '_');

        return match ($normalized) {
            'priority_4h', 'priority4h', 'priority_4_hours', 'priority_4hour', '4h', 'rush_4h', 'rush4h' => 'priority_4h',
            'same_day', 'sameday' => 'same_day',
            'next_day', 'nextday', 'express', 'one_day', 'oneday' => 'next_day',
            '2_3_day', '2_3_days', 'two_three_day', 'standard', 'within_3_days' => 'two_three_day',
            default => $normalized,
        };
    }

    private function allowedServiceKeys(array $serviceCatalog): array
    {
        $keys = [];
        foreach ($serviceCatalog as $item) {
            if (!is_array($item)) {
                continue;
            }

            $normalized = $this->normalizeServiceLevelKey((string) ($item['key'] ?? ''));
            if ($normalized !== '') {
                $keys[] = $normalized;
            }
        }

        $keys = array_values(array_unique($keys));
        if (count($keys) === 0) {
            return ['economy'];
        }

        return $keys;
    }

    private function mappedValue(array $row, array $fieldMap, string $field)
    {
        $header = $fieldMap[$field] ?? null;
        if (!is_string($header) || $header === '') {
            return null;
        }

        return $row[$header] ?? null;
    }

    private function toFloat($value): ?float
    {
        if ($value === null) {
            return null;
        }

        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }

        $string = trim((string) $value);
        if ($string === '') {
            return null;
        }

        $string = str_replace(',', '', $string);
        $string = preg_replace('/[^0-9.\-]/', '', $string) ?? '';
        if ($string === '' || !is_numeric($string)) {
            return null;
        }

        return (float) $string;
    }

    private function detectCsvDelimiter(string $line): string
    {
        $delimiters = [',', ';', "\t", '|'];
        $bestDelimiter = ',';
        $maxCount = -1;

        foreach ($delimiters as $delimiter) {
            $count = substr_count($line, $delimiter);
            if ($count > $maxCount) {
                $maxCount = $count;
                $bestDelimiter = $delimiter;
            }
        }

        return $bestDelimiter;
    }

    private function rowHasValues(array $row): bool
    {
        foreach ($row as $cell) {
            if (trim((string) $cell) !== '') {
                return true;
            }
        }

        return false;
    }

    private function looksLikeHeaderRow(array $row): bool
    {
        $cells = array_values(array_filter(
            array_map(fn ($value) => trim((string) $value), $row),
            fn ($value) => $value !== ''
        ));

        if (count($cells) === 0) {
            return false;
        }

        $alphaCount = 0;
        $numericCount = 0;
        foreach ($cells as $cell) {
            if (preg_match('/[a-z]/i', $cell) === 1) {
                $alphaCount++;
            }

            if ($this->toFloat($cell) !== null) {
                $numericCount++;
            }
        }

        return $alphaCount >= max(1, (int) ceil(count($cells) * 0.5)) && $numericCount < count($cells);
    }

    private function associateRow(array $headers, array $row): array
    {
        $result = [];
        foreach ($headers as $index => $header) {
            $result[$header] = $row[$index] ?? null;
        }

        return $result;
    }

    private function humanizeKey(string $value): string
    {
        $clean = trim(str_replace('_', ' ', $value));
        if ($clean === '') {
            return 'Unknown';
        }

        return ucwords($clean);
    }
}


