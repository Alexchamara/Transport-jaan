<?php

namespace App\Http\Controllers\CourierControllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courier\StoreCourierShipmentRequest;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierShipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClientCourierController extends Controller
{
    public function create(Request $request)
    {
        $serviceLevels = ['Same Day', 'Express', 'Standard'];
        $packageTypes = ['document', 'parcel', 'freight', 'temperature_controlled'];
        $countries = ['US', 'CA', 'GB', 'AU', 'LK', 'IN', 'SG'];

        return Inertia::render('Web/courier/Create', [
            'serviceLevels' => $serviceLevels,
            'packageTypes' => $packageTypes,
            'countries' => $countries,
            'recentReference' => $request->session()->pull('courier_reference'),
            'recentShipmentId' => $request->session()->pull('courier_bill_id'),
        ]);
    }

    public function review(Request $request)
    {
        $payload = $request->validate([
            'sender' => ['nullable', 'array'],
            'sender.address' => ['nullable', 'array'],
            'recipient' => ['nullable', 'array'],
            'recipient.address' => ['nullable', 'array'],
            'shipment' => ['nullable', 'array'],
            'packages' => ['required', 'array', 'min:1'],
            'packages.*.label' => ['nullable', 'string', 'max:120'],
            'packages.*.packageType' => ['nullable', 'string', 'max:50'],
            'packages.*.courierProvider' => ['required', 'string', 'max:80'],
            'packages.*.serviceLevel' => ['required', 'string', 'max:80'],
            'packages.*.quantity' => ['required', 'integer', 'min:1'],
            'packages.*.weightKg' => ['required', 'numeric', 'min:0.1'],
            'packages.*.lengthCm' => ['nullable', 'numeric', 'min:0'],
            'packages.*.widthCm' => ['nullable', 'numeric', 'min:0'],
            'packages.*.heightCm' => ['nullable', 'numeric', 'min:0'],
            'packages.*.declaredValue' => ['nullable', 'numeric', 'min:0'],
            'packages.*.description' => ['nullable', 'string', 'max:500'],
            'reviewContext' => ['required', 'array'],
            'reviewContext.displayCurrency' => ['nullable', 'string', 'max:4'],
            'reviewContext.totalPriceUSD' => ['nullable', 'numeric', 'min:0'],
            'reviewContext.selectedQuotes' => ['required', 'array', 'min:1'],
            'reviewContext.selectedQuotes.*.packageIndex' => ['required', 'integer', 'min:0'],
            'reviewContext.selectedQuotes.*.providerId' => ['required', 'string', 'max:80'],
            'reviewContext.selectedQuotes.*.providerName' => ['required', 'string', 'max:120'],
            'reviewContext.selectedQuotes.*.serviceLevel' => ['required', 'string', 'max:80'],
            'reviewContext.selectedQuotes.*.serviceLabel' => ['required', 'string', 'max:120'],
            'reviewContext.selectedQuotes.*.eta' => ['nullable', 'string', 'max:120'],
            'reviewContext.selectedQuotes.*.description' => ['nullable', 'string'],
            'reviewContext.selectedQuotes.*.priceUSD' => ['required', 'numeric', 'min:0'],
            'reviewContext.selectedQuotes.*.weight' => ['nullable', 'numeric', 'min:0'],
            'reviewContext.selectedQuotes.*.billableWeight' => ['nullable', 'numeric', 'min:0'],
        ]);

        $defaults = [
            'sender' => [
                'name' => null,
                'email' => null,
                'phone' => null,
                'company' => null,
                'address' => [
                    'line1' => null,
                    'line2' => null,
                    'city' => null,
                    'state' => null,
                    'postalCode' => null,
                    'country' => null,
                    'instructions' => null,
                ],
            ],
            'recipient' => [
                'name' => null,
                'email' => null,
                'phone' => null,
                'company' => null,
                'address' => [
                    'line1' => null,
                    'line2' => null,
                    'city' => null,
                    'state' => null,
                    'postalCode' => null,
                    'country' => null,
                    'instructions' => null,
                ],
            ],
            'shipment' => [
                'pickupDate' => null,
                'pickupWindowStart' => null,
                'pickupWindowEnd' => null,
                'serviceLevel' => null,
                'courierProvider' => null,
                'currency' => 'LKR',
                'insurance' => false,
                'deliveryNotes' => null,
                'estimatedValue' => null,
            ],
        ];

        $normalized = array_replace_recursive($defaults, $payload);

        $request->session()->put('courier_preview', $normalized);

        return redirect()->route('couriers.details');
    }

    public function details(Request $request)
    {
        $formData = $request->session()->get('courier_preview');

        if (!$formData) {
            return redirect()->route('couriers.create');
        }

        $serviceLevels = ['Same Day', 'Express', 'Standard'];
        $packageTypes = ['document', 'parcel', 'freight', 'temperature_controlled'];
        $countries = ['US', 'CA', 'GB', 'AU', 'LK', 'IN', 'SG'];

        return Inertia::render('Web/courier/Details', [
            'formData' => $formData,
            'serviceLevels' => $serviceLevels,
            'packageTypes' => $packageTypes,
            'countries' => $countries,
        ]);
    }

    public function storeDetails(Request $request)
    {
        $existing = $request->session()->get('courier_preview');

        if (!$existing) {
            return redirect()->route('couriers.create');
        }

        $reviewContextInput = null;

        $validated = $request->validate(
            [
                'sender.name' => ['required', 'string', 'max:120'],
                'sender.email' => ['nullable', 'email', 'max:150'],
                'sender.phone' => ['nullable', 'string', 'max:40'],
                'sender.company' => ['nullable', 'string', 'max:120'],
                'sender.address.line1' => ['required', 'string', 'max:180'],
                'sender.address.line2' => ['nullable', 'string', 'max:180'],
                'sender.address.city' => ['required', 'string', 'max:120'],
                'sender.address.state' => ['nullable', 'string', 'max:120'],
                'sender.address.postalCode' => ['nullable', 'string', 'max:30'],
                'sender.address.country' => ['required', 'string', 'size:2'],
                'sender.address.instructions' => ['nullable', 'string', 'max:500'],

                'recipient.name' => ['required', 'string', 'max:120'],
                'recipient.email' => ['nullable', 'email', 'max:150'],
                'recipient.phone' => ['nullable', 'string', 'max:40'],
                'recipient.company' => ['nullable', 'string', 'max:120'],
                'recipient.address.line1' => ['required', 'string', 'max:180'],
                'recipient.address.line2' => ['nullable', 'string', 'max:180'],
                'recipient.address.city' => ['required', 'string', 'max:120'],
                'recipient.address.state' => ['nullable', 'string', 'max:120'],
                'recipient.address.postalCode' => ['nullable', 'string', 'max:30'],
                'recipient.address.country' => ['required', 'string', 'size:2'],
                'recipient.address.instructions' => ['nullable', 'string', 'max:500'],

                'shipment.pickupDate' => ['nullable', 'date', 'after_or_equal:today'],
                'shipment.pickupWindowStart' => ['nullable', 'date_format:H:i'],
                'shipment.pickupWindowEnd' => ['nullable', 'date_format:H:i'],
                'shipment.serviceLevel' => ['required', 'string', 'max:50'],
                'shipment.currency' => ['required', 'string', 'size:3'],
                'shipment.insurance' => ['nullable', 'boolean'],
                'shipment.deliveryNotes' => ['nullable', 'string', 'max:1000'],
                'shipment.estimatedValue' => ['nullable', 'numeric', 'min:0'],
                'packages' => ['required', 'array', 'min:1'],
                'packages.*.label' => ['nullable', 'string', 'max:120'],
                'packages.*.packageType' => ['nullable', 'string', 'max:50'],
                'packages.*.courierProvider' => ['required', 'string', 'max:80'],
                'packages.*.serviceLevel' => ['required', 'string', 'max:80'],
                'packages.*.quantity' => ['required', 'integer', 'min:1'],
                'packages.*.weightKg' => ['required', 'numeric', 'min:0.1'],
                'packages.*.lengthCm' => ['nullable', 'numeric', 'min:0'],
                'packages.*.widthCm' => ['nullable', 'numeric', 'min:0'],
                'packages.*.heightCm' => ['nullable', 'numeric', 'min:0'],
                'packages.*.declaredValue' => ['nullable', 'numeric', 'min:0'],
                'packages.*.description' => ['nullable', 'string', 'max:500'],
                'reviewContext' => ['nullable', 'array'],
                'reviewContext.displayCurrency' => ['nullable', 'string', 'max:4'],
                'reviewContext.totalPriceUSD' => ['nullable', 'numeric', 'min:0'],
                'reviewContext.selectedQuotes' => ['nullable', 'array'],
                'reviewContext.selectedQuotes.*.packageIndex' => ['required_with:reviewContext.selectedQuotes', 'integer', 'min:0'],
                'reviewContext.selectedQuotes.*.providerId' => ['required_with:reviewContext.selectedQuotes', 'string', 'max:80'],
                'reviewContext.selectedQuotes.*.providerName' => ['required_with:reviewContext.selectedQuotes', 'string', 'max:120'],
                'reviewContext.selectedQuotes.*.serviceLevel' => ['required_with:reviewContext.selectedQuotes', 'string', 'max:80'],
                'reviewContext.selectedQuotes.*.serviceLabel' => ['required_with:reviewContext.selectedQuotes', 'string', 'max:120'],
                'reviewContext.selectedQuotes.*.eta' => ['nullable', 'string', 'max:120'],
                'reviewContext.selectedQuotes.*.description' => ['nullable', 'string'],
                'reviewContext.selectedQuotes.*.priceUSD' => ['required_with:reviewContext.selectedQuotes', 'numeric', 'min:0'],
                'reviewContext.selectedQuotes.*.weight' => ['nullable', 'numeric', 'min:0'],
                'reviewContext.selectedQuotes.*.billableWeight' => ['nullable', 'numeric', 'min:0'],
            ],
            [],
            [
                'sender.address.line1' => 'sender address line 1',
                'recipient.address.line1' => 'recipient address line 1',
                'shipment.pickupDate' => 'pickup date',
            ]
        );

        $packagesInput = $validated['packages'] ?? [];
        $reviewContextInput = $validated['reviewContext'] ?? null;

        unset($validated['packages'], $validated['reviewContext']);

        $normalized = array_replace_recursive($existing, $validated);

        if (!empty($packagesInput)) {
            $normalized['packages'] = [];
            foreach ($packagesInput as $index => $package) {
                $existingPackage = $existing['packages'][$index] ?? [];
                $normalized['packages'][$index] = array_replace($existingPackage, $package);
            }
            $normalized['packages'] = array_values($normalized['packages']);
        }

        $normalized['sender']['address']['country'] = strtoupper($normalized['sender']['address']['country'] ?? '');
        $normalized['recipient']['address']['country'] = strtoupper($normalized['recipient']['address']['country'] ?? '');
        $normalized['shipment']['currency'] = strtoupper($normalized['shipment']['currency'] ?? 'LKR');
        $normalized['shipment']['insurance'] = (bool) ($normalized['shipment']['insurance'] ?? false);

        if ($reviewContextInput !== null) {
            $normalized['reviewContext'] = array_replace(
                $normalized['reviewContext'] ?? [],
                $reviewContextInput
            );
        } elseif (!isset($normalized['reviewContext'])) {
            $normalized['reviewContext'] = $existing['reviewContext'] ?? [];
        }

        $normalized['reviewContext'] = $normalized['reviewContext'] ?? [];

        $selectedQuotesInput = $normalized['reviewContext']['selectedQuotes'] ?? [];
        $normalizedSelectedQuotes = [];

        foreach ($selectedQuotesInput as $index => $quote) {
            $packageIndex = array_key_exists('packageIndex', $quote)
                ? (int) $quote['packageIndex']
                : $index;

            $normalizedSelectedQuotes[] = [
                'packageIndex' => $packageIndex,
                'label' => $quote['label'] ?? ('Package ' . ($packageIndex + 1)),
                'weight' => isset($quote['weight']) ? (float) $quote['weight'] : null,
                'billableWeight' => isset($quote['billableWeight']) ? (float) $quote['billableWeight'] : null,
                'providerId' => $quote['providerId'] ?? null,
                'providerName' => $quote['providerName'] ?? null,
                'serviceLevel' => $quote['serviceLevel'] ?? null,
                'serviceLabel' => $quote['serviceLabel'] ?? null,
                'eta' => $quote['eta'] ?? null,
                'description' => $quote['description'] ?? null,
                'priceUSD' => isset($quote['priceUSD']) ? (float) $quote['priceUSD'] : 0.0,
            ];
        }

        $normalized['reviewContext']['selectedQuotes'] = $normalizedSelectedQuotes;
        $normalized['reviewContext']['displayCurrency'] = $normalized['shipment']['currency'];
        $normalized['reviewContext']['totalPriceUSD'] = array_reduce(
            $normalizedSelectedQuotes,
            static fn ($carry, $quote) => $carry + ($quote['priceUSD'] ?? 0),
            0.0
        );

        $request->session()->put('courier_preview', $normalized);

        return redirect()->route('couriers.summary');
    }

    public function summary(Request $request)
    {
        $formData = $request->session()->get('courier_preview');

        if (!$formData) {
            return redirect()->route('couriers.create');
        }

        if (empty($formData['sender']['name'] ?? null) || empty($formData['recipient']['name'] ?? null)) {
            return redirect()->route('couriers.details');
        }

        return Inertia::render('Web/courier/Summary', [
            'formData' => $formData,
        ]);
    }

    public function store(StoreCourierShipmentRequest $request)
    {
        $payload = $request->validated();
        $reviewContext = $request->input('reviewContext', []);
        $selectedQuotes = collect($reviewContext['selectedQuotes'] ?? [])->keyBy('packageIndex');
        $estimatedCostUsd = $selectedQuotes->reduce(function ($carry, $quote) {
            return $carry + (float) ($quote['priceUSD'] ?? 0);
        }, 0.0);

        $shipment = DB::transaction(function () use ($payload, $selectedQuotes) {
            $sender = CourierContact::create([
                'user_id' => Auth::id(),
                'role' => CourierContact::ROLE_SENDER,
                'name' => $payload['sender']['name'],
                'email' => $payload['sender']['email'] ?? null,
                'phone' => $payload['sender']['phone'] ?? null,
                'company_name' => $payload['sender']['company'] ?? null,
            ]);

            $senderAddressData = $payload['sender']['address'];
            $senderAddress = $sender->addresses()->create([
                'label' => 'pickup',
                'line1' => $senderAddressData['line1'],
                'line2' => $senderAddressData['line2'] ?? null,
                'city' => $senderAddressData['city'],
                'state' => $senderAddressData['state'] ?? null,
                'postal_code' => $senderAddressData['postalCode'] ?? null,
                'country' => strtoupper($senderAddressData['country']),
                'instructions' => $senderAddressData['instructions'] ?? null,
                'is_primary' => true,
            ]);

            $recipient = CourierContact::create([
                'role' => CourierContact::ROLE_RECIPIENT,
                'name' => $payload['recipient']['name'],
                'email' => $payload['recipient']['email'] ?? null,
                'phone' => $payload['recipient']['phone'] ?? null,
                'company_name' => $payload['recipient']['company'] ?? null,
            ]);

            $recipientAddressData = $payload['recipient']['address'];
            $recipientAddress = $recipient->addresses()->create([
                'label' => 'dropoff',
                'line1' => $recipientAddressData['line1'],
                'line2' => $recipientAddressData['line2'] ?? null,
                'city' => $recipientAddressData['city'],
                'state' => $recipientAddressData['state'] ?? null,
                'postal_code' => $recipientAddressData['postalCode'] ?? null,
                'country' => strtoupper($recipientAddressData['country']),
                'instructions' => $recipientAddressData['instructions'] ?? null,
                'is_primary' => true,
            ]);

            $shipment = CourierShipment::create([
                'requested_by_user_id' => Auth::id(),
                'sender_contact_id' => $sender->id,
                'recipient_contact_id' => $recipient->id,
                'sender_address_id' => $senderAddress->id,
                'recipient_address_id' => $recipientAddress->id,
                'service_level' => $payload['shipment']['serviceLevel'],
                'status' => CourierShipment::STATUS_PENDING,
                'pickup_date' => $payload['shipment']['pickupDate'] ? $payload['shipment']['pickupDate'] : null,
                'pickup_window_start' => $payload['shipment']['pickupWindowStart'] ? $payload['shipment']['pickupWindowStart'] : null,
                'pickup_window_end' => $payload['shipment']['pickupWindowEnd'] ? $payload['shipment']['pickupWindowEnd'] : null,
                'insurance_required' => (bool) ($payload['shipment']['insurance'] ?? false),
                'declared_value' => isset($payload['shipment']['estimatedValue'])
                    ? (float) $payload['shipment']['estimatedValue']
                    : 0,
                'currency_code' => strtoupper($payload['shipment']['currency'] ?? 'LKR'),
                'delivery_notes' => $payload['shipment']['deliveryNotes'] ?? null,
            ]);

            foreach ($payload['packages'] as $index => $package) {
                $quote = $selectedQuotes->get($index);

                $shipment->packages()->create([
                    'label' => $package['label'] ?? 'Package ' . ($index + 1),
                    'package_type' => $package['packageType'] ?? null,
                    'courier_provider_key' => $package['courierProvider'] ?? ($quote['providerId'] ?? null),
                    'courier_provider_name' => $quote['providerName'] ?? null,
                    'service_tier_key' => $package['serviceLevel'] ?? ($quote['serviceLevel'] ?? null),
                    'service_tier_label' => $quote['serviceLabel'] ?? null,
                    'service_eta' => $quote['eta'] ?? null,
                    'quoted_price_usd' => $quote ? (float) ($quote['priceUSD'] ?? 0) : null,
                    'quantity' => $package['quantity'],
                    'weight_kg' => $package['weightKg'],
                    'length_cm' => $package['lengthCm'] ?? null,
                    'width_cm' => $package['widthCm'] ?? null,
                    'height_cm' => $package['heightCm'] ?? null,
                    'declared_value' => $package['declaredValue'] ?? null,
                    'description' => $package['description'] ?? null,
                ]);
            }

            return $shipment;
        });

        $shipment->update([
            'estimated_cost' => $estimatedCostUsd > 0 ? round($estimatedCostUsd, 2) : null,
        ]);

        $request->session()->forget('courier_preview');

        return redirect()
            ->route('couriers.create')
            ->with('success', 'Courier request submitted successfully.')
            ->with('courier_reference', $shipment->reference)
            ->with('courier_bill_id', $shipment->id);
    }

    public function downloadBill(Request $request, CourierShipment $shipment)
    {
        if (Auth::check() && $shipment->requested_by_user_id && Auth::id() !== $shipment->requested_by_user_id) {
            abort(403);
        }

        $shipment->loadMissing([
            'sender',
            'recipient',
            'senderAddress',
            'recipientAddress',
            'packages',
        ]);

        $escape = static function ($value) {
            return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES, 'UTF-8');
        };

        $formatAddress = static function ($address) use ($escape) {
            if (!$address) {
                return '—';
            }

            $street = array_filter([$address->line1, $address->line2]);
            $locality = array_filter([$address->city, $address->state, $address->postal_code]);

            $parts = array_filter([
                implode(', ', array_map($escape, $street)),
                implode(', ', array_map($escape, $locality)),
                $escape($address->country),
            ]);

            $filtered = array_filter($parts);

            return $filtered ? implode(' • ', $filtered) : '—';
        };

        $packagesRows = '';
        foreach ($shipment->packages as $index => $package) {
            $dimensions = ($package->length_cm && $package->width_cm && $package->height_cm)
                ? sprintf('%s × %s × %s', $escape($package->length_cm), $escape($package->width_cm), $escape($package->height_cm))
                : '—';

            $packagesRows .= '<tr>'
                . '<td>' . $escape($index + 1) . '</td>'
                . '<td>' . ($escape($package->label) ?: 'Package ' . ($index + 1)) . '</td>'
                . '<td>' . ($escape($package->package_type) ?: '—') . '</td>'
                . '<td>' . ($escape($package->quantity) ?: '—') . '</td>'
                . '<td>' . ($escape($package->weight_kg) ?: '—') . '</td>'
                . '<td>' . $dimensions . '</td>'
                . '<td>' . ($escape($package->declared_value) ?: '—') . '</td>'
                . '<td>' . ($escape($package->courier_provider_name) ?: '—') . '</td>'
                . '<td>' . ($escape($package->service_tier_label) ?: '—') . '</td>'
                . '<td>' . ($escape($package->service_eta) ?: '—') . '</td>'
                . '<td>' . ($escape($package->quoted_price_usd) ?: '—') . '</td>'
                . '<td>' . ($escape($package->description) ?: '—') . '</td>'
                . '</tr>';
        }

        if ($packagesRows === '') {
            $packagesRows = '<tr><td colspan="12">No packages recorded.</td></tr>';
        }

        $totalUsd = $shipment->packages->reduce(
            static fn ($carry, $package) => $carry + (float) ($package->quoted_price_usd ?? 0),
            0.0
        );

        $html = '<!DOCTYPE html>'
            . '<html lang="en"><head><meta charset="UTF-8"><title>Courier Bill ' . $escape($shipment->reference) . '</title>'
            . '<style>body{font-family:Arial,Helvetica,sans-serif;color:#0B1739;padding:24px;}h1{font-size:22px;margin-bottom:8px;}h2{font-size:18px;margin:24px 0 12px;}table{width:100%;border-collapse:collapse;margin-top:12px;}th,td{border:1px solid #D6DEEB;padding:8px;text-align:left;font-size:13px;}th{background:#F4F7FB;}p{margin:4px 0;font-size:13px;}small{display:block;margin-top:32px;color:#6B7893;}</style>'
            . '</head><body>'
            . '<h1>Courier Service Bill</h1>'
            . '<p><strong>Reference:</strong> ' . $escape($shipment->reference) . '</p>'
            . '<p><strong>Generated:</strong> ' . $escape(now()->format('Y-m-d H:i')) . '</p>'
            . '<h2>Sender details</h2>'
            . '<p><strong>Name:</strong> ' . ($escape(optional($shipment->sender)->name) ?: '—') . '</p>'
            . '<p><strong>Email:</strong> ' . ($escape(optional($shipment->sender)->email) ?: '—') . '</p>'
            . '<p><strong>Phone:</strong> ' . ($escape(optional($shipment->sender)->phone) ?: '—') . '</p>'
            . '<p><strong>Company:</strong> ' . ($escape(optional($shipment->sender)->company_name) ?: '—') . '</p>'
            . '<p><strong>Address:</strong> ' . $formatAddress($shipment->senderAddress) . '</p>'
            . '<h2>Recipient details</h2>'
            . '<p><strong>Name:</strong> ' . ($escape(optional($shipment->recipient)->name) ?: '—') . '</p>'
            . '<p><strong>Email:</strong> ' . ($escape(optional($shipment->recipient)->email) ?: '—') . '</p>'
            . '<p><strong>Phone:</strong> ' . ($escape(optional($shipment->recipient)->phone) ?: '—') . '</p>'
            . '<p><strong>Company:</strong> ' . ($escape(optional($shipment->recipient)->company_name) ?: '—') . '</p>'
            . '<p><strong>Address:</strong> ' . $formatAddress($shipment->recipientAddress) . '</p>'
            . '<h2>Shipment preferences</h2>'
            . '<p><strong>Service level:</strong> ' . ($escape($shipment->service_level) ?: '—') . '</p>'
            . '<p><strong>Pickup date:</strong> ' . ($shipment->pickup_date ? $escape($shipment->pickup_date->format('Y-m-d')) : '—') . '</p>'
            . '<p><strong>Pickup window:</strong> ' . ($shipment->pickup_window_start && $shipment->pickup_window_end
                ? $escape($shipment->pickup_window_start . ' - ' . $shipment->pickup_window_end)
                : '—') . '</p>'
            . '<p><strong>Insurance required:</strong> ' . ($shipment->insurance_required ? 'Yes' : 'No') . '</p>'
            . '<p><strong>Declared value:</strong> ' . ($escape($shipment->declared_value) ?: '—') . ' ' . ($escape($shipment->currency_code) ?: 'USD') . '</p>'
            . '<p><strong>Delivery notes:</strong> ' . ($escape($shipment->delivery_notes) ?: '—') . '</p>'
            . '<h2>Package details</h2>'
            . '<table><thead><tr><th>#</th><th>Label</th><th>Type</th><th>Quantity</th><th>Weight (kg)</th><th>Dimensions (cm)</th><th>Declared value</th><th>Courier</th><th>Service</th><th>ETA</th><th>Quote (USD)</th><th>Description</th></tr></thead><tbody>'
            . $packagesRows
            . '</tbody></table>'
            . '<p><strong>Total quoted cost (USD):</strong> ' . number_format($totalUsd, 2) . '</p>'
            . '<p><strong>Stored estimated cost (USD):</strong> ' . ($shipment->estimated_cost !== null
                ? number_format((float) $shipment->estimated_cost, 2)
                : '—') . '</p>'
            . '<small>This bill is generated for reference based on the confirmed courier request.</small>'
            . '</body></html>';

        $filename = 'courier-bill-' . $shipment->reference . '.html';

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
