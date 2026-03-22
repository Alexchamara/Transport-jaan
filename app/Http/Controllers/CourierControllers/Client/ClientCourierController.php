<?php

namespace App\Http\Controllers\CourierControllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courier\StoreCourierShipmentRequest;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierSetting;
use App\Services\Courier\CourierVendorAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClientCourierController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('signin.signin');
        }

        // Fetch all shipments for the user with relationships
        $shipments = CourierShipment::with([
            'sender',
            'recipient',
            'senderAddress',
            'recipientAddress',
            'packages',
            'trackingEvents' => function ($query) {
                $query->orderBy('recorded_at', 'desc');
            }
        ])
            ->where('requested_by_user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate statistics
        $totalShipments = $shipments->count();
        
        // Count by package type
        $documentCount = 0;
        $parcelCount = 0;
        $freightCount = 0;
        
        foreach ($shipments as $shipment) {
            foreach ($shipment->packages as $package) {
                if (stripos($package->package_type, 'document') !== false) {
                    $documentCount++;
                } elseif (stripos($package->package_type, 'freight') !== false) {
                    $freightCount++;
                } else {
                    $parcelCount++;
                }
            }
        }

        // Count by status
        $confirmedCount = $shipments->where('status', 'confirmed')->count();
        $inTransitCount = $shipments->where('status', 'in_transit')->count();
        $deliveredCount = $shipments->where('status', 'delivered')->count();
        $pendingCount = $shipments->where('status', 'pending')->count();
        $cancelledCount = $shipments->where('status', 'cancelled')->count();

        // Monthly breakdown (last 12 months)
        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            
            $monthShipments = $shipments->filter(function ($shipment) use ($monthStart, $monthEnd) {
                return $shipment->created_at >= $monthStart && $shipment->created_at <= $monthEnd;
            });
            
            $docCount = 0;
            $parcCount = 0;
            $freightCount = 0;
            
            foreach ($monthShipments as $shipment) {
                foreach ($shipment->packages as $package) {
                    if (stripos($package->package_type, 'document') !== false) {
                        $docCount++;
                    } elseif (stripos($package->package_type, 'freight') !== false) {
                        $freightCount++;
                    } else {
                        $parcCount++;
                    }
                }
            }
            
            $monthlyData[] = [
                'month' => $month->format('M'),
                'document' => $docCount,
                'parcel' => $parcCount,
                'freight' => $freightCount,
            ];
        }

        // Format shipments for frontend
        $formattedShipments = $shipments->map(function ($shipment) {
            $totalCost = $shipment->packages->sum('quoted_price_usd');
            $packageTypes = $shipment->packages->pluck('package_type')->unique()->implode(', ');
            
            return [
                'id' => $shipment->id,
                'code' => $shipment->reference,
                'status' => $shipment->status,
                'serviceLevel' => $shipment->service_level,
                'pickupDate' => $shipment->pickup_date?->format('Y-m-d'),
                'pickupWindowStart' => $shipment->pickup_window_start?->format('H:i'),
                'pickupWindowEnd' => $shipment->pickup_window_end?->format('H:i'),
                'from' => $shipment->senderAddress ? [
                    'name' => $shipment->sender?->name,
                    'city' => $shipment->senderAddress->city,
                    'country' => $shipment->senderAddress->country,
                    'full' => implode(', ', array_filter([
                        $shipment->senderAddress->city,
                        $shipment->senderAddress->state,
                        $shipment->senderAddress->country,
                    ])),
                ] : null,
                'to' => $shipment->recipientAddress ? [
                    'name' => $shipment->recipient?->name,
                    'city' => $shipment->recipientAddress->city,
                    'country' => $shipment->recipientAddress->country,
                    'full' => implode(', ', array_filter([
                        $shipment->recipientAddress->city,
                        $shipment->recipientAddress->state,
                        $shipment->recipientAddress->country,
                    ])),
                ] : null,
                'packages' => $shipment->packages->map(function ($package) {
                    return [
                        'id' => $package->id,
                        'label' => $package->label,
                        'type' => $package->package_type,
                        'provider' => $package->courier_provider_name,
                        'service' => $package->service_tier_label,
                        'weight' => (float) $package->weight_kg,
                        'quantity' => (int) $package->quantity,
                        'price' => (float) $package->quoted_price_usd,
                        'eta' => $package->service_eta,
                    ];
                }),
                'packageTypes' => $packageTypes,
                'totalWeight' => (float) $shipment->packages->sum('weight_kg'),
                'totalCost' => (float) $totalCost,
                'estimatedCost' => $shipment->estimated_cost ? (float) $shipment->estimated_cost : null,
                'currencyCode' => $shipment->currency_code ?? 'USD',
                'insuranceRequired' => $shipment->insurance_required,
                'declaredValue' => $shipment->declared_value,
                'deliveryNotes' => $shipment->delivery_notes,
                'latestTracking' => $shipment->trackingEvents->first(),
                'createdAt' => $shipment->created_at->format('Y-m-d H:i:s'),
                'updatedAt' => $shipment->updated_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Web/home/client/CourierBookingDashboard', [
            'shipments' => $formattedShipments,
            'statistics' => [
                'total' => $totalShipments,
                'document' => $documentCount,
                'parcel' => $parcelCount,
                'freight' => $freightCount,
                'confirmed' => $confirmedCount,
                'inTransit' => $inTransitCount,
                'delivered' => $deliveredCount,
                'pending' => $pendingCount,
                'cancelled' => $cancelledCount,
            ],
            'monthlyData' => $monthlyData,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('signin.signin');
        }

        // Fetch shipment with all relationships
        $shipment = CourierShipment::with([
            'sender',
            'recipient',
            'senderAddress',
            'recipientAddress',
            'packages',
            'trackingEvents' => function ($query) {
                $query->orderBy('recorded_at', 'desc');
            }
        ])
            ->where('id', $id)
            ->where('requested_by_user_id', $user->id)
            ->firstOrFail();

        // Format shipment data
        $shipmentData = [
            'id' => $shipment->id,
            'code' => $shipment->reference,
            'status' => $shipment->status,
            'serviceLevel' => $shipment->service_level,
            'pickupDate' => $shipment->pickup_date?->format('Y-m-d'),
            'pickupWindowStart' => $shipment->pickup_window_start?->format('H:i'),
            'pickupWindowEnd' => $shipment->pickup_window_end?->format('H:i'),
            'sender' => [
                'name' => $shipment->sender?->name,
                'email' => $shipment->sender?->email,
                'phone' => $shipment->sender?->phone,
                'company' => $shipment->sender?->company_name,
                'address' => $shipment->senderAddress ? [
                    'line1' => $shipment->senderAddress->line1,
                    'line2' => $shipment->senderAddress->line2,
                    'city' => $shipment->senderAddress->city,
                    'state' => $shipment->senderAddress->state,
                    'postalCode' => $shipment->senderAddress->postal_code,
                    'country' => $shipment->senderAddress->country,
                    'instructions' => $shipment->senderAddress->delivery_instructions,
                ] : null,
            ],
            'recipient' => [
                'name' => $shipment->recipient?->name,
                'email' => $shipment->recipient?->email,
                'phone' => $shipment->recipient?->phone,
                'company' => $shipment->recipient?->company_name,
                'address' => $shipment->recipientAddress ? [
                    'line1' => $shipment->recipientAddress->line1,
                    'line2' => $shipment->recipientAddress->line2,
                    'city' => $shipment->recipientAddress->city,
                    'state' => $shipment->recipientAddress->state,
                    'postalCode' => $shipment->recipientAddress->postal_code,
                    'country' => $shipment->recipientAddress->country,
                    'instructions' => $shipment->recipientAddress->delivery_instructions,
                ] : null,
            ],
            'packages' => $shipment->packages->map(function ($package) {
                return [
                    'id' => $package->id,
                    'label' => $package->label,
                    'type' => $package->package_type,
                    'provider' => $package->courier_provider_name,
                    'providerKey' => $package->courier_provider_key,
                    'service' => $package->service_tier_label,
                    'serviceKey' => $package->service_tier_key,
                    'eta' => $package->service_eta,
                    'weight' => (float) $package->weight_kg,
                    'length' => $package->length_cm ? (float) $package->length_cm : null,
                    'width' => $package->width_cm ? (float) $package->width_cm : null,
                    'height' => $package->height_cm ? (float) $package->height_cm : null,
                    'quantity' => (int) $package->quantity,
                    'price' => (float) $package->quoted_price_usd,
                    'declaredValue' => $package->declared_value ? (float) $package->declared_value : null,
                    'description' => $package->description,
                ];
            }),
            'trackingEvents' => $shipment->trackingEvents->map(function ($event) {
                return [
                    'id' => $event->id,
                    'status' => $event->status,
                    'location' => $event->location,
                    'description' => $event->description,
                    'timestamp' => $event->recorded_at ? $event->recorded_at->format('Y-m-d H:i:s') : null,
                ];
            }),
            'insuranceRequired' => $shipment->insurance_required,
            'declaredValue' => $shipment->declared_value ? (float) $shipment->declared_value : null,
            'currencyCode' => $shipment->currency_code ?? 'USD',
            'estimatedCost' => $shipment->estimated_cost ? (float) $shipment->estimated_cost : null,
            'actualCost' => $shipment->actual_cost ? (float) $shipment->actual_cost : null,
            'deliveryNotes' => $shipment->delivery_notes,
            'internalNotes' => $shipment->internal_notes,
            'createdAt' => $shipment->created_at->format('Y-m-d H:i:s'),
            'updatedAt' => $shipment->updated_at->format('Y-m-d H:i:s'),
        ];

        return Inertia::render('Web/home/client/CourierShipmentDetail', [
            'shipment' => $shipmentData,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $shipment = CourierShipment::where('id', $id)
            ->where('requested_by_user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,in_transit,delivered,cancelled',
        ]);

        $shipment->update([
            'status' => $validated['status'],
        ]);

        // Optionally create a tracking event
        if ($request->has('create_tracking_event') && $request->create_tracking_event) {
            $shipment->trackingEvents()->create([
                'status' => $validated['status'],
                'location' => $request->input('location'),
                'description' => $request->input('description', 'Status updated to ' . $validated['status']),
                'recorded_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'shipment' => [
                'id' => $shipment->id,
                'status' => $shipment->status,
            ],
        ]);
    }

    public function cancelShipment(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('signin.signin');
        }

        $shipment = CourierShipment::where('id', $id)
            ->where('requested_by_user_id', $user->id)
            ->firstOrFail();

        // Only allow cancellation if not already delivered or cancelled
        if (in_array($shipment->status, ['delivered', 'cancelled'])) {
            return back()->with('error', 'Cannot cancel this shipment.');
        }

        $shipment->update([
            'status' => 'cancelled',
        ]);

        // Create tracking event
        $shipment->trackingEvents()->create([
            'status' => 'cancelled',
            'description' => 'Shipment cancelled by customer',
            'recorded_at' => now(),
        ]);

        return back()->with('success', 'Shipment cancelled successfully.');
    }

    public function create(Request $request)
    {
        $serviceLevels = $this->serviceLevelLabelsForCategory('domestic');
        $packageTypes = ['document', 'parcel', 'freight', 'temperature_controlled'];
        $countries = ['US', 'CA', 'GB', 'AU', 'LK', 'IN', 'SG'];

        return Inertia::render('Web/courier/Create', [
            'serviceLevels' => $serviceLevels,
            'packageTypes' => $packageTypes,
            'countries' => $countries,
            'recentReference' => $request->session()->pull('courier_reference'),
            'recentShipmentId' => $request->session()->pull('courier_bill_id'),
            'recentPricingExplanation' => $request->session()->pull('courier_pricing_explanation'),
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
                'distanceKm' => null,
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

        $category = $this->resolvePayloadCategory($formData);
        $serviceLevels = $this->serviceLevelLabelsForCategory($category);
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
        $category = $this->resolvePayloadCategory($existing);
        $allowedServiceLevels = $this->serviceLevelLabelsForCategory($category);

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
                'shipment.serviceLevel' => ['required', 'string', 'max:50', Rule::in($allowedServiceLevels)],
                'shipment.currency' => ['required', 'string', 'size:3'],
                'shipment.insurance' => ['nullable', 'boolean'],
                'shipment.deliveryNotes' => ['nullable', 'string', 'max:1000'],
                'shipment.estimatedValue' => ['nullable', 'numeric', 'min:0'],
                'shipment.distanceKm' => ['nullable', 'numeric', 'min:0.1'],
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

        $pricingPreview = $this->buildSummaryPricingPreview((array) $formData);

        return Inertia::render('Web/courier/Summary', [
            'formData' => $formData,
            'pricingPreview' => $pricingPreview,
        ]);
    }

    private function buildSummaryPricingPreview(array $formData): array
    {
        $selectedQuotes = collect($formData['reviewContext']['selectedQuotes'] ?? []);
        $fallbackEstimatedUsd = (float) ($formData['reviewContext']['totalPriceUSD'] ?? 0);
        if ($fallbackEstimatedUsd <= 0) {
            $fallbackEstimatedUsd = (float) $selectedQuotes->reduce(
                fn ($carry, $quote) => $carry + (float) ($quote['priceUSD'] ?? 0),
                0.0
            );
        }

        $shipment = new CourierShipment();
        $shipment->setRelation('senderAddress', (object) [
            'country' => strtoupper((string) ($formData['sender']['address']['country'] ?? '')),
        ]);
        $shipment->setRelation('recipientAddress', (object) [
            'country' => strtoupper((string) ($formData['recipient']['address']['country'] ?? '')),
        ]);

        $assignmentService = app(CourierVendorAssignmentService::class);
        $assignment = $assignmentService->determineAssignment($shipment);

        $shipment->assignment_category = (string) ($assignment['assignment_category'] ?? $this->resolvePayloadCategory($formData));
        $shipment->assignment_status = (string) ($assignment['assignment_status'] ?? 'unassigned');
        $shipment->assigned_vendor_user_id = $assignment['assigned_vendor_user_id'] ?? null;
        $shipment->assigned_vendor_registration_id = $assignment['assigned_vendor_registration_id'] ?? null;

        $pricingExplanation = null;
        try {
            $enforcedEstimatedUsd = $this->resolveEstimatedCostWithLaneMatrix($shipment, $formData, $fallbackEstimatedUsd, $pricingExplanation);
        } catch (ValidationException $exception) {
            $message = (string) collect($exception->errors())
                ->flatten()
                ->first();

            return [
                'mode' => 'lane_matrix_unmatched',
                'reason' => $message !== '' ? $message : 'No active lane pricing rule found for the selected shipment details.',
                'distanceKm' => $formData['shipment']['distanceKm'] ?? null,
                'matchedRule' => null,
                'totalEstimatedUsd' => round(max(0, $fallbackEstimatedUsd), 2),
                'assignment' => [
                    'category' => $shipment->assignment_category,
                    'status' => $shipment->assignment_status,
                    'vendorUserId' => $shipment->assigned_vendor_user_id,
                ],
            ];
        }

        $pricingExplanation = is_array($pricingExplanation) ? $pricingExplanation : [];
        $pricingExplanation['totalEstimatedUsd'] = round(max(0, (float) $enforcedEstimatedUsd), 2);
        $pricingExplanation['assignment'] = [
            'category' => $shipment->assignment_category,
            'status' => $shipment->assignment_status,
            'vendorUserId' => $shipment->assigned_vendor_user_id,
        ];

        return $pricingExplanation;
    }

    public function store(StoreCourierShipmentRequest $request)
    {
        $payload = $request->validated();
        $assignmentService = app(CourierVendorAssignmentService::class);
        $reviewContext = $request->input('reviewContext', []);
        $selectedQuotes = collect($reviewContext['selectedQuotes'] ?? [])->keyBy('packageIndex');
        $estimatedCostUsd = $selectedQuotes->reduce(function ($carry, $quote) {
            return $carry + (float) ($quote['priceUSD'] ?? 0);
        }, 0.0);

        $shipment = DB::transaction(function () use ($payload, $selectedQuotes, $assignmentService) {
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

            $assignmentService->assignShipment($shipment);
            $this->assertShipmentServiceCatalogPolicy($shipment, $payload);

            return $shipment;
        });

        $pricingExplanation = null;
        $enforcedEstimatedCostUsd = $this->resolveEstimatedCostWithLaneMatrix($shipment, $payload, $estimatedCostUsd, $pricingExplanation);

        $shipment->update([
            'estimated_cost' => $enforcedEstimatedCostUsd > 0 ? round($enforcedEstimatedCostUsd, 2) : null,
        ]);

        $request->session()->forget('courier_preview');
        $request->session()->flash('courier_pricing_explanation', $pricingExplanation);

        return redirect()
            ->route('couriers.create')
            ->with('success', 'Courier request submitted successfully.')
            ->with('courier_reference', $shipment->reference)
            ->with('courier_bill_id', $shipment->id);
    }

    private function defaultServiceCatalog(): array
    {
        return [
            'domestic' => [
                ['key' => 'same_day', 'label' => 'Same Day', 'promisedSlaDays' => 1, 'cutoffTime' => '10:30', 'isActive' => true],
                ['key' => 'next_day', 'label' => 'Next Day', 'promisedSlaDays' => 1, 'cutoffTime' => '15:00', 'isActive' => true],
                ['key' => 'two_three_day', 'label' => '2-3 Day', 'promisedSlaDays' => 3, 'cutoffTime' => '17:00', 'isActive' => true],
                ['key' => 'economy', 'label' => 'Economy', 'promisedSlaDays' => 5, 'cutoffTime' => '18:00', 'isActive' => true],
            ],
            'logistic' => [
                ['key' => 'next_day', 'label' => 'Next Day', 'promisedSlaDays' => 2, 'cutoffTime' => '13:00', 'isActive' => true],
                ['key' => 'two_three_day', 'label' => '2-3 Day', 'promisedSlaDays' => 3, 'cutoffTime' => '16:00', 'isActive' => true],
                ['key' => 'economy', 'label' => 'Economy', 'promisedSlaDays' => 6, 'cutoffTime' => '18:00', 'isActive' => true],
            ],
        ];
    }

    private function serviceLevelLabelsForCategory(string $category): array
    {
        $category = $category === 'logistic' ? 'logistic' : 'domestic';
        $catalog = $this->defaultServiceCatalog();

        return collect($catalog[$category] ?? [])
            ->filter(fn ($item) => (bool) ($item['isActive'] ?? false))
            ->map(fn ($item) => (string) ($item['label'] ?? ''))
            ->filter()
            ->values()
            ->all();
    }

    private function resolvePayloadCategory(array $payload): string
    {
        $senderCountry = strtoupper((string) ($payload['sender']['address']['country'] ?? ''));
        $recipientCountry = strtoupper((string) ($payload['recipient']['address']['country'] ?? ''));

        if ($senderCountry === 'LK' && $recipientCountry === 'LK') {
            return 'domestic';
        }

        return 'logistic';
    }

    private function normalizeServiceLevelKey(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';
        $normalized = trim($normalized, '_');

        return match ($normalized) {
            'same_day', 'sameday' => 'same_day',
            'next_day', 'nextday', 'express', 'one_day', 'oneday' => 'next_day',
            '2_3_day', '2_3_days', 'two_three_day', 'standard', 'within_3_days' => 'two_three_day',
            default => $normalized,
        };
    }

    private function resolveServiceCatalogForVendor(?int $vendorId, string $category): array
    {
        $category = $category === 'logistic' ? 'logistic' : 'domestic';
        $defaults = $this->defaultServiceCatalog();

        if (!$vendorId || $vendorId <= 0) {
            return $defaults[$category] ?? [];
        }

        $settings = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorId)
            ->value('settings');

        $serviceCatalog = is_array($settings['pricing']['serviceCatalog'][$category] ?? null)
            ? $settings['pricing']['serviceCatalog'][$category]
            : ($defaults[$category] ?? []);

        return collect($serviceCatalog)
            ->map(function ($item) {
                if (!is_array($item)) {
                    return null;
                }

                $key = $this->normalizeServiceLevelKey((string) ($item['key'] ?? ''));
                if ($key === '') {
                    return null;
                }

                return [
                    'key' => $key,
                    'label' => trim((string) ($item['label'] ?? '')) ?: 'Service Level',
                    'promisedSlaDays' => max(1, (int) ($item['promisedSlaDays'] ?? 1)),
                    'cutoffTime' => trim((string) ($item['cutoffTime'] ?? '18:00')) ?: '18:00',
                    'isActive' => (bool) ($item['isActive'] ?? true),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function resolveLaneMatrixForVendor(?int $vendorId, string $category): array
    {
        $category = $category === 'logistic' ? 'logistic' : 'domestic';

        if (!$vendorId || $vendorId <= 0) {
            return ['enabled' => false, 'rows' => []];
        }

        $settings = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorId)
            ->value('settings');

        $laneConfig = is_array($settings['pricing']['laneMatrix'] ?? null) ? $settings['pricing']['laneMatrix'] : [];
        $rows = is_array($laneConfig[$category] ?? null) ? $laneConfig[$category] : [];
        $enabledConfig = $laneConfig['enabled'] ?? false;
        $isEnabled = is_array($enabledConfig)
            ? (bool) ($enabledConfig[$category] ?? false)
            : (bool) $enabledConfig;

        $normalizedRows = collect($rows)
            ->map(function ($item) {
                if (!is_array($item)) {
                    return null;
                }

                $distanceFrom = max(0, (float) ($item['distanceFromKm'] ?? 0));
                $distanceTo = isset($item['distanceToKm']) && $item['distanceToKm'] !== ''
                    ? max($distanceFrom, (float) $item['distanceToKm'])
                    : null;

                return [
                    'originZone' => $this->normalizeZoneKey((string) ($item['originZone'] ?? '*')),
                    'destinationZone' => $this->normalizeZoneKey((string) ($item['destinationZone'] ?? '*')),
                    'serviceLevelKey' => $this->normalizeServiceLevelKey((string) ($item['serviceLevelKey'] ?? '')),
                    'distanceFromKm' => $distanceFrom,
                    'distanceToKm' => $distanceTo,
                    'distanceBaseKm' => max(0, (float) ($item['distanceBaseKm'] ?? 0)),
                    'perKmPrice' => max(0, (float) ($item['perKmPrice'] ?? 0)),
                    'distanceSurcharge' => max(0, (float) ($item['distanceSurcharge'] ?? 0)),
                    'distanceMultiplier' => max(0.1, (float) ($item['distanceMultiplier'] ?? 1)),
                    'basePrice' => max(0, (float) ($item['basePrice'] ?? 0)),
                    'perKgPrice' => max(0, (float) ($item['perKgPrice'] ?? 0)),
                    'minPrice' => max(0, (float) ($item['minPrice'] ?? 0)),
                    'priorityMultiplier' => max(0.1, (float) ($item['priorityMultiplier'] ?? 1)),
                    'isActive' => (bool) ($item['isActive'] ?? true),
                ];
            })
            ->filter(fn ($item) => is_array($item) && (bool) ($item['isActive'] ?? false))
            ->values()
            ->all();

        return [
            'enabled' => $isEnabled,
            'rows' => $normalizedRows,
        ];
    }

    private function normalizeZoneKey(string $value): string
    {
        $trimmed = trim($value);
        if ($trimmed === '' || $trimmed === '*') {
            return '*';
        }

        $normalized = strtolower($trimmed);
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';
        $normalized = trim($normalized, '_');

        return $normalized !== '' ? $normalized : '*';
    }

    private function resolveZoneFromPayloadAddress(array $address): string
    {
        $candidate = (string) ($address['state'] ?? '');
        if (trim($candidate) === '') {
            $candidate = (string) ($address['city'] ?? '');
        }

        return $this->normalizeZoneKey($candidate);
    }

    private function resolveDistanceKmFromPayload(array $payload): ?float
    {
        $distanceKm = $payload['shipment']['distanceKm'] ?? null;
        if ($distanceKm === null || $distanceKm === '') {
            return null;
        }

        return max(0, (float) $distanceKm);
    }

    private function laneRuleMatchesDistance(array $rule, ?float $distanceKm): bool
    {
        $distanceFrom = max(0, (float) ($rule['distanceFromKm'] ?? 0));
        $distanceTo = isset($rule['distanceToKm']) && $rule['distanceToKm'] !== ''
            ? max(0, (float) $rule['distanceToKm'])
            : null;

        if ($distanceKm === null) {
            return $distanceFrom <= 0 && $distanceTo === null;
        }

        if ($distanceKm < $distanceFrom) {
            return false;
        }

        if ($distanceTo !== null && $distanceKm > $distanceTo) {
            return false;
        }

        return true;
    }

    private function laneRuleSpecificityScore(array $rule): int
    {
        $score = 0;

        if ((string) ($rule['serviceLevelKey'] ?? '') !== '') {
            $score += 4;
        }

        if ((string) ($rule['originZone'] ?? '*') !== '*') {
            $score += 3;
        }

        if ((string) ($rule['destinationZone'] ?? '*') !== '*') {
            $score += 3;
        }

        $distanceFrom = max(0, (float) ($rule['distanceFromKm'] ?? 0));
        $distanceTo = isset($rule['distanceToKm']) && $rule['distanceToKm'] !== ''
            ? max(0, (float) $rule['distanceToKm'])
            : null;
        if ($distanceFrom > 0 || $distanceTo !== null) {
            $score += 2;
        }

        if ($distanceTo !== null) {
            $score += 1;
        }

        return $score;
    }

    private function resolveEstimatedCostWithLaneMatrix(CourierShipment $shipment, array $payload, float $fallbackEstimatedUsd, ?array &$pricingExplanation = null): float
    {
        $pricingExplanation = [
            'mode' => 'fallback_quotes',
            'reason' => null,
            'distanceKm' => null,
            'matchedRule' => null,
            'speedEtaTier' => null,
            'policyAdjustments' => [],
            'totalEstimatedUsd' => round(max(0, $fallbackEstimatedUsd), 2),
        ];

        $vendorId = (int) ($shipment->assigned_vendor_user_id ?? 0);
        if ($vendorId <= 0) {
            $pricingExplanation['reason'] = 'No assigned vendor for lane matrix enforcement.';
            return $fallbackEstimatedUsd;
        }

        $category = (string) ($shipment->assignment_category ?: $this->resolvePayloadCategory($payload));
        $selectedLevelKey = $this->normalizeServiceLevelKey((string) ($payload['shipment']['serviceLevel'] ?? ''));
        $pricingConfig = $this->resolveCategoryPricingConfigForVendor($vendorId, $category);
        $formula = $pricingConfig['formula'];
        $localization = $pricingConfig['localization'];
        $policyModules = $pricingConfig['policyModules'];
        $pricingExplanation['speedEtaTier'] = $this->resolveSpeedEtaTierProjection(
            $policyModules,
            $selectedLevelKey,
            $payload
        );
        $baseCurrency = strtoupper((string) ($localization['baseCurrency'] ?? 'USD'));
        $manualRates = is_array($localization['manualRates'] ?? null) ? $localization['manualRates'] : [];
        $usdRate = 1.0;
        if ($baseCurrency !== 'USD') {
            $usdRate = max(0.000001, (float) ($manualRates['USD'] ?? 1));
        }

        $laneMatrix = $this->resolveLaneMatrixForVendor($vendorId, $category);
        if (!(bool) ($laneMatrix['enabled'] ?? false)) {
            $pricingExplanation['reason'] = 'Lane matrix pricing is disabled for this category.';

            $policyBreakdown = [];
            $totalWithPolicy = $this->applyAdvancedPricingPolicies(
                max(0, $fallbackEstimatedUsd),
                $payload,
                $policyModules,
                $policyBreakdown,
                1,
                $usdRate
            );
            $pricingExplanation['policyAdjustments'] = $policyBreakdown;
            $pricingExplanation['totalEstimatedUsd'] = round(max(0, $totalWithPolicy), 2);

            return $totalWithPolicy;
        }

        $originZone = $this->resolveZoneFromPayloadAddress((array) ($payload['sender']['address'] ?? []));
        $destinationZone = $this->resolveZoneFromPayloadAddress((array) ($payload['recipient']['address'] ?? []));
        $distanceKm = $this->resolveDistanceKmFromPayload($payload);
        $pricingExplanation['distanceKm'] = $distanceKm;

        $matchedRule = collect($laneMatrix['rows'] ?? [])
            ->values()
            ->map(function ($rule, $index) use ($selectedLevelKey, $originZone, $destinationZone, $distanceKm) {
                if (!is_array($rule)) {
                    return null;
                }

            $ruleLevel = (string) ($rule['serviceLevelKey'] ?? '');
            if ($ruleLevel !== '' && $ruleLevel !== $selectedLevelKey) {
                    return null;
            }

            $ruleOrigin = (string) ($rule['originZone'] ?? '*');
            $ruleDestination = (string) ($rule['destinationZone'] ?? '*');

            $originMatches = $ruleOrigin === '*' || $ruleOrigin === $originZone;
            $destinationMatches = $ruleDestination === '*' || $ruleDestination === $destinationZone;
                if (!$originMatches || !$destinationMatches) {
                    return null;
                }

                if (!$this->laneRuleMatchesDistance($rule, $distanceKm)) {
                    return null;
                }

                return [
                    'rule' => $rule,
                    'index' => (int) $index,
                    'score' => $this->laneRuleSpecificityScore($rule),
                ];
            })
            ->filter()
            ->sort(function ($left, $right) {
                $scoreCompare = ($right['score'] ?? 0) <=> ($left['score'] ?? 0);
                if ($scoreCompare !== 0) {
                    return $scoreCompare;
                }

                return ($left['index'] ?? 0) <=> ($right['index'] ?? 0);
            })
            ->map(fn ($entry) => $entry['rule'])
            ->first();

        if (!$matchedRule) {
            throw ValidationException::withMessages([
                'shipment.serviceLevel' => 'No active lane pricing rule found for the selected route, service level, and distance band.',
            ]);
        }

        $pricingExplanation['mode'] = 'lane_matrix';
        $pricingExplanation['reason'] = 'Estimated cost enforced by active lane matrix tariff.';
        $pricingExplanation['matchedRule'] = [
            'originZone' => (string) ($matchedRule['originZone'] ?? '*'),
            'destinationZone' => (string) ($matchedRule['destinationZone'] ?? '*'),
            'serviceLevelKey' => (string) ($matchedRule['serviceLevelKey'] ?? ''),
            'distanceFromKm' => isset($matchedRule['distanceFromKm']) ? (float) $matchedRule['distanceFromKm'] : 0.0,
            'distanceToKm' => isset($matchedRule['distanceToKm']) && $matchedRule['distanceToKm'] !== null
                ? (float) $matchedRule['distanceToKm']
                : null,
            'distanceBaseKm' => isset($matchedRule['distanceBaseKm']) ? (float) $matchedRule['distanceBaseKm'] : 0.0,
            'perKmPrice' => isset($matchedRule['perKmPrice']) ? (float) $matchedRule['perKmPrice'] : 0.0,
            'distanceSurcharge' => isset($matchedRule['distanceSurcharge']) ? (float) $matchedRule['distanceSurcharge'] : 0.0,
            'distanceMultiplier' => isset($matchedRule['distanceMultiplier']) ? (float) $matchedRule['distanceMultiplier'] : 1.0,
            'basePrice' => isset($matchedRule['basePrice']) ? (float) $matchedRule['basePrice'] : 0.0,
            'perKgPrice' => isset($matchedRule['perKgPrice']) ? (float) $matchedRule['perKgPrice'] : 0.0,
            'minPrice' => isset($matchedRule['minPrice']) ? (float) $matchedRule['minPrice'] : 0.0,
            'priorityMultiplier' => isset($matchedRule['priorityMultiplier']) ? (float) $matchedRule['priorityMultiplier'] : 1.0,
        ];

        $divisor = max(1, (float) ($formula['volumetricDivisor'] ?? 5000));
        $useChargeableWeight = (bool) ($formula['useChargeableWeight'] ?? true);
        $fuelPercent = max(0, (float) ($formula['fuelSurchargePercent'] ?? 0));
        $handlingFee = max(0, (float) ($formula['handlingFee'] ?? 0));
        $taxPercent = max(0, (float) ($formula['taxPercent'] ?? 0));

        $subtotal = collect($payload['packages'] ?? [])->reduce(function ($carry, $package) use ($matchedRule, $divisor, $useChargeableWeight, $distanceKm) {
            $actualWeight = max(0.1, (float) ($package['weightKg'] ?? 0));
            $length = max(1, (float) ($package['lengthCm'] ?? 1));
            $width = max(1, (float) ($package['widthCm'] ?? 1));
            $height = max(1, (float) ($package['heightCm'] ?? 1));
            $qty = max(1, (int) ($package['quantity'] ?? 1));

            $volumetric = ($length * $width * $height) / $divisor;
            $chargeableWeight = $useChargeableWeight ? max($actualWeight, $volumetric) : $actualWeight;
            $base = (float) ($matchedRule['basePrice'] ?? 0);
            $perKg = (float) ($matchedRule['perKgPrice'] ?? 0);
            $minPrice = (float) ($matchedRule['minPrice'] ?? 0);
            $priorityMultiplier = max(0.1, (float) ($matchedRule['priorityMultiplier'] ?? 1));
            $distanceBaseKm = max(0, (float) ($matchedRule['distanceBaseKm'] ?? 0));
            $perKmPrice = max(0, (float) ($matchedRule['perKmPrice'] ?? 0));
            $distanceSurcharge = max(0, (float) ($matchedRule['distanceSurcharge'] ?? 0));
            $distanceMultiplier = max(0.1, (float) ($matchedRule['distanceMultiplier'] ?? 1));
            $effectiveDistanceKm = max(0, (float) ($distanceKm ?? 0));
            $billableDistanceKm = max($effectiveDistanceKm - $distanceBaseKm, 0);

            $raw = $base
                + (max($chargeableWeight - 1, 0) * $perKg)
                + ($billableDistanceKm * $perKmPrice)
                + $distanceSurcharge;
            $tierTotal = max($minPrice, $raw) * $priorityMultiplier * $distanceMultiplier;

            return $carry + ($tierTotal * $qty);
        }, 0.0);

        $fuelFee = $subtotal * ($fuelPercent / 100);
        $subtotalWithFees = $subtotal + $fuelFee + $handlingFee;
        $taxFee = $subtotalWithFees * ($taxPercent / 100);
        $totalBase = $subtotalWithFees + $taxFee;

        $policyBreakdown = [];
        $totalBase = $this->applyAdvancedPricingPolicies(
            $totalBase,
            $payload,
            $policyModules,
            $policyBreakdown,
            1,
            1
        );

        $totalEstimatedUsd = $totalBase * $usdRate;
        $pricingExplanation['policyAdjustments'] = $policyBreakdown;
        $pricingExplanation['totalEstimatedUsd'] = round(max(0, $totalEstimatedUsd), 2);

        return $totalEstimatedUsd;
    }

    private function resolveCategoryPricingConfigForVendor(int $vendorId, string $category): array
    {
        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendorId)->value('settings');
        $pricing = is_array($settings['pricing'] ?? null) ? $settings['pricing'] : [];

        $formulaConfig = is_array($pricing['formula'] ?? null) ? $pricing['formula'] : [];
        $formulaDefaults = [
            'volumetricDivisor' => 5000,
            'useChargeableWeight' => true,
            'fuelSurchargePercent' => 0,
            'handlingFee' => 0,
            'taxPercent' => 0,
            'roundTo' => 2,
        ];
        $formula = array_replace(
            $formulaDefaults,
            is_array($formulaConfig[$category] ?? null)
                ? $formulaConfig[$category]
                : (is_array($formulaConfig) ? $formulaConfig : [])
        );

        $localizationConfig = is_array($pricing['localization'] ?? null) ? $pricing['localization'] : [];
        $localizationDefaults = [
            'baseCurrency' => 'LKR',
            'displayCurrency' => 'LKR',
            'locale' => 'en-LK',
            'exchangeRateProvider' => 'frankfurter.app',
            'autoLiveRates' => true,
            'manualRates' => [
                'LKR' => 1,
                'USD' => 0.00308,
                'EUR' => 0.00284,
            ],
            'lastSyncedAt' => null,
        ];
        $localization = array_replace(
            $localizationDefaults,
            is_array($localizationConfig[$category] ?? null)
                ? $localizationConfig[$category]
                : (is_array($localizationConfig) ? $localizationConfig : [])
        );

        $policyModules = $this->resolvePolicyModulesForCategory($pricing, $category);

        return [
            'formula' => $formula,
            'localization' => $localization,
            'policyModules' => $policyModules,
        ];
    }

    private function resolvePolicyModulesForCategory(array $pricing, string $category): array
    {
        $defaults = [
            'remoteAreaSurcharge' => [
                'enabled' => false,
                'flatFee' => 0,
                'applyOnOrigin' => false,
                'applyOnDestination' => true,
                'postalCodePrefixes' => [],
                'cityKeywords' => [],
            ],
            'oversizeOverweightRules' => [
                'enabled' => false,
                'maxWeightKg' => 25,
                'overweightPerKgFee' => 0,
                'maxLengthCm' => 120,
                'maxWidthCm' => 80,
                'maxHeightCm' => 80,
                'oversizeFlatFee' => 0,
            ],
            'peakHolidaySurcharge' => [
                'enabled' => false,
                'peakStartTime' => '17:00',
                'peakEndTime' => '21:00',
                'daysOfWeek' => [1, 2, 3, 4, 5],
                'peakPercent' => 0,
                'peakFlatFee' => 0,
                'holidayDates' => [],
                'holidayPercent' => 0,
                'holidayFlatFee' => 0,
            ],
            'codFee' => [
                'enabled' => false,
                'flatFee' => 0,
                'percentOfDeclaredValue' => 0,
                'minFee' => 0,
                'maxFee' => null,
            ],
            'minimumShipmentCharge' => [
                'enabled' => true,
                'minimumTotal' => 0,
            ],
            'speedEtaTierEngine' => [
                'enabled' => false,
                'enforceFixedNamedTiers' => true,
                'enforceTierPricingMultiplier' => true,
                'tiers' => [
                    'same_day' => [
                        'enabled' => true,
                        'etaLabel' => 'Same Day',
                        'etaMinDays' => 0,
                        'etaMaxDays' => 1,
                        'priceMultiplier' => 1.25,
                        'maxDistanceKm' => 80,
                        'maxWeightKg' => 20,
                        'minLeadHours' => 1,
                        'maxLeadHours' => 12,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                    'next_day' => [
                        'enabled' => true,
                        'etaLabel' => 'Next Day',
                        'etaMinDays' => 1,
                        'etaMaxDays' => 2,
                        'priceMultiplier' => 1.12,
                        'maxDistanceKm' => 250,
                        'maxWeightKg' => 30,
                        'minLeadHours' => 2,
                        'maxLeadHours' => null,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                    'two_three_day' => [
                        'enabled' => true,
                        'etaLabel' => '2-3 Days',
                        'etaMinDays' => 2,
                        'etaMaxDays' => 3,
                        'priceMultiplier' => 1.0,
                        'maxDistanceKm' => null,
                        'maxWeightKg' => null,
                        'minLeadHours' => 0,
                        'maxLeadHours' => null,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                    'economy' => [
                        'enabled' => true,
                        'etaLabel' => 'Economy',
                        'etaMinDays' => 4,
                        'etaMaxDays' => 7,
                        'priceMultiplier' => 0.92,
                        'maxDistanceKm' => null,
                        'maxWeightKg' => null,
                        'minLeadHours' => 0,
                        'maxLeadHours' => null,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                ],
            ],
        ];

        $policyInput = is_array($pricing['policyModules'] ?? null) ? $pricing['policyModules'] : [];
        $categoryInput = is_array($policyInput[$category] ?? null)
            ? $policyInput[$category]
            : (is_array($policyInput) ? $policyInput : []);

        return array_replace_recursive($defaults, $categoryInput);
    }

    private function applyAdvancedPricingPolicies(
        float $currentTotal,
        array $payload,
        array $policyModules,
        array &$policyBreakdown,
        float $flatFeeFactor,
        float $percentBaseFactor
    ): float {
        $total = max(0, $currentTotal);
        $policyBreakdown = [];

        $senderAddress = (array) ($payload['sender']['address'] ?? []);
        $recipientAddress = (array) ($payload['recipient']['address'] ?? []);
        $packages = collect($payload['packages'] ?? [])->map(fn ($item) => is_array($item) ? $item : [])->values();
        $declaredValue = max(
            0,
            (float) (($payload['shipment']['estimatedValue'] ?? 0) ?: $packages->sum(fn ($pkg) => (float) ($pkg['declaredValue'] ?? 0)))
        );

        $tierPolicy = is_array($policyModules['speedEtaTierEngine'] ?? null) ? $policyModules['speedEtaTierEngine'] : [];
        $selectedTierKey = $this->normalizeServiceLevelKey((string) ($payload['shipment']['serviceLevel'] ?? ''));
        $selectedTier = is_array($tierPolicy['tiers'][$selectedTierKey] ?? null) ? $tierPolicy['tiers'][$selectedTierKey] : null;
        if ((bool) ($tierPolicy['enabled'] ?? false)
            && (bool) ($tierPolicy['enforceTierPricingMultiplier'] ?? true)
            && is_array($selectedTier)
            && (bool) ($selectedTier['enabled'] ?? true)
        ) {
            $multiplier = max(0.1, (float) ($selectedTier['priceMultiplier'] ?? 1));
            if (abs($multiplier - 1.0) > 0.0001) {
                $preMultiplier = $total;
                $total = $total * $multiplier;
                $delta = $total - $preMultiplier;
                if (abs($delta) > 0.0001) {
                    $policyBreakdown[] = [
                        'key' => 'speed_eta_tier_multiplier',
                        'amount' => round($delta, 2),
                    ];
                }
            }
        }

        $remotePolicy = is_array($policyModules['remoteAreaSurcharge'] ?? null) ? $policyModules['remoteAreaSurcharge'] : [];
        if ((bool) ($remotePolicy['enabled'] ?? false)) {
            $originRemote = (bool) ($remotePolicy['applyOnOrigin'] ?? false)
                && $this->addressMatchesRemotePolicy($senderAddress, $remotePolicy);
            $destinationRemote = (bool) ($remotePolicy['applyOnDestination'] ?? true)
                && $this->addressMatchesRemotePolicy($recipientAddress, $remotePolicy);

            if ($originRemote || $destinationRemote) {
                $fee = max(0, (float) ($remotePolicy['flatFee'] ?? 0)) * $flatFeeFactor;
                if ($fee > 0) {
                    $total += $fee;
                    $policyBreakdown[] = [
                        'key' => 'remote_area_surcharge',
                        'amount' => round($fee, 2),
                    ];
                }
            }
        }

        $oversizePolicy = is_array($policyModules['oversizeOverweightRules'] ?? null) ? $policyModules['oversizeOverweightRules'] : [];
        if ((bool) ($oversizePolicy['enabled'] ?? false)) {
            $maxWeight = max(0.1, (float) ($oversizePolicy['maxWeightKg'] ?? 25));
            $overweightPerKg = max(0, (float) ($oversizePolicy['overweightPerKgFee'] ?? 0)) * $flatFeeFactor;
            $maxLength = max(1, (float) ($oversizePolicy['maxLengthCm'] ?? 120));
            $maxWidth = max(1, (float) ($oversizePolicy['maxWidthCm'] ?? 80));
            $maxHeight = max(1, (float) ($oversizePolicy['maxHeightCm'] ?? 80));
            $oversizeFlatFee = max(0, (float) ($oversizePolicy['oversizeFlatFee'] ?? 0)) * $flatFeeFactor;

            $overweightTotal = 0.0;
            $oversizeTotal = 0.0;
            foreach ($packages as $package) {
                $qty = max(1, (int) ($package['quantity'] ?? 1));
                $weight = max(0, (float) ($package['weightKg'] ?? 0));
                $length = max(0, (float) ($package['lengthCm'] ?? 0));
                $width = max(0, (float) ($package['widthCm'] ?? 0));
                $height = max(0, (float) ($package['heightCm'] ?? 0));

                $overweightKg = max(0, $weight - $maxWeight);
                if ($overweightKg > 0 && $overweightPerKg > 0) {
                    $overweightTotal += $overweightKg * $overweightPerKg * $qty;
                }

                $isOversize = $length > $maxLength || $width > $maxWidth || $height > $maxHeight;
                if ($isOversize && $oversizeFlatFee > 0) {
                    $oversizeTotal += $oversizeFlatFee * $qty;
                }
            }

            if ($overweightTotal > 0) {
                $total += $overweightTotal;
                $policyBreakdown[] = [
                    'key' => 'overweight_surcharge',
                    'amount' => round($overweightTotal, 2),
                ];
            }

            if ($oversizeTotal > 0) {
                $total += $oversizeTotal;
                $policyBreakdown[] = [
                    'key' => 'oversize_surcharge',
                    'amount' => round($oversizeTotal, 2),
                ];
            }
        }

        $timePolicy = is_array($policyModules['peakHolidaySurcharge'] ?? null) ? $policyModules['peakHolidaySurcharge'] : [];
        if ((bool) ($timePolicy['enabled'] ?? false)) {
            $pickupDate = isset($payload['shipment']['pickupDate']) && $payload['shipment']['pickupDate']
                ? Carbon::parse((string) $payload['shipment']['pickupDate'])
                : null;
            $pickupTime = isset($payload['shipment']['pickupWindowStart']) && $payload['shipment']['pickupWindowStart']
                ? trim((string) $payload['shipment']['pickupWindowStart'])
                : '';

            if ($pickupDate) {
                $holidayDates = collect($timePolicy['holidayDates'] ?? [])
                    ->map(fn ($item) => trim((string) $item))
                    ->filter()
                    ->values()
                    ->all();

                if (in_array($pickupDate->format('Y-m-d'), $holidayDates, true)) {
                    $percentFee = $total * (max(0, (float) ($timePolicy['holidayPercent'] ?? 0)) / 100) * $percentBaseFactor;
                    $flatFee = max(0, (float) ($timePolicy['holidayFlatFee'] ?? 0)) * $flatFeeFactor;
                    $holidayFee = $percentFee + $flatFee;
                    if ($holidayFee > 0) {
                        $total += $holidayFee;
                        $policyBreakdown[] = [
                            'key' => 'holiday_surcharge',
                            'amount' => round($holidayFee, 2),
                        ];
                    }
                }

                $daysOfWeek = collect($timePolicy['daysOfWeek'] ?? [1, 2, 3, 4, 5])
                    ->map(fn ($item) => (int) $item)
                    ->filter(fn ($item) => $item >= 1 && $item <= 7)
                    ->values()
                    ->all();
                $start = trim((string) ($timePolicy['peakStartTime'] ?? '17:00'));
                $end = trim((string) ($timePolicy['peakEndTime'] ?? '21:00'));
                if ($pickupTime !== '' && in_array($pickupDate->dayOfWeekIso, $daysOfWeek, true) && $this->isWithinPeakWindow($pickupTime, $start, $end)) {
                    $percentFee = $total * (max(0, (float) ($timePolicy['peakPercent'] ?? 0)) / 100) * $percentBaseFactor;
                    $flatFee = max(0, (float) ($timePolicy['peakFlatFee'] ?? 0)) * $flatFeeFactor;
                    $peakFee = $percentFee + $flatFee;
                    if ($peakFee > 0) {
                        $total += $peakFee;
                        $policyBreakdown[] = [
                            'key' => 'peak_hour_surcharge',
                            'amount' => round($peakFee, 2),
                        ];
                    }
                }
            }
        }

        $codPolicy = is_array($policyModules['codFee'] ?? null) ? $policyModules['codFee'] : [];
        if ((bool) ($codPolicy['enabled'] ?? false) && $declaredValue > 0) {
            $flatFee = max(0, (float) ($codPolicy['flatFee'] ?? 0)) * $flatFeeFactor;
            $percentFee = $declaredValue * (max(0, (float) ($codPolicy['percentOfDeclaredValue'] ?? 0)) / 100) * $percentBaseFactor;
            $codFee = $flatFee + $percentFee;

            $minFee = max(0, (float) ($codPolicy['minFee'] ?? 0)) * $flatFeeFactor;
            if ($codFee < $minFee) {
                $codFee = $minFee;
            }

            if (isset($codPolicy['maxFee']) && $codPolicy['maxFee'] !== null && $codPolicy['maxFee'] !== '') {
                $maxFee = max(0, (float) $codPolicy['maxFee']) * $flatFeeFactor;
                if ($maxFee > 0) {
                    $codFee = min($codFee, $maxFee);
                }
            }

            if ($codFee > 0) {
                $total += $codFee;
                $policyBreakdown[] = [
                    'key' => 'cod_fee',
                    'amount' => round($codFee, 2),
                ];
            }
        }

        $minimumPolicy = is_array($policyModules['minimumShipmentCharge'] ?? null) ? $policyModules['minimumShipmentCharge'] : [];
        if ((bool) ($minimumPolicy['enabled'] ?? true)) {
            $minimumTotal = max(0, (float) ($minimumPolicy['minimumTotal'] ?? 0)) * $flatFeeFactor;
            if ($minimumTotal > 0 && $total < $minimumTotal) {
                $minimumAdjustment = $minimumTotal - $total;
                $total = $minimumTotal;
                $policyBreakdown[] = [
                    'key' => 'minimum_shipment_guardrail',
                    'amount' => round($minimumAdjustment, 2),
                ];
            }
        }

        return $total;
    }

    private function resolveSpeedEtaTierProjection(array $policyModules, string $selectedLevelKey, array $payload): ?array
    {
        $tierEngine = is_array($policyModules['speedEtaTierEngine'] ?? null) ? $policyModules['speedEtaTierEngine'] : [];
        if (!(bool) ($tierEngine['enabled'] ?? false)) {
            return null;
        }

        $tiers = is_array($tierEngine['tiers'] ?? null) ? $tierEngine['tiers'] : [];
        $tier = is_array($tiers[$selectedLevelKey] ?? null) ? $tiers[$selectedLevelKey] : null;
        if (!$tier) {
            return null;
        }

        $etaMinDays = max(0, (int) ($tier['etaMinDays'] ?? 0));
        $etaMaxDays = isset($tier['etaMaxDays']) && $tier['etaMaxDays'] !== null && $tier['etaMaxDays'] !== ''
            ? max($etaMinDays, (int) $tier['etaMaxDays'])
            : null;

        $pickupDate = isset($payload['shipment']['pickupDate']) && $payload['shipment']['pickupDate']
            ? Carbon::parse((string) $payload['shipment']['pickupDate'])
            : null;
        $etaStartDate = $pickupDate ? $pickupDate->copy()->addDays($etaMinDays)->format('Y-m-d') : null;
        $etaEndDate = $pickupDate
            ? ($etaMaxDays !== null ? $pickupDate->copy()->addDays($etaMaxDays)->format('Y-m-d') : null)
            : null;

        return [
            'tierKey' => $selectedLevelKey,
            'tierLabel' => ucwords(str_replace('_', ' ', $selectedLevelKey)),
            'etaLabel' => trim((string) ($tier['etaLabel'] ?? '')),
            'etaMinDays' => $etaMinDays,
            'etaMaxDays' => $etaMaxDays,
            'enforceTierPricingMultiplier' => (bool) ($tierEngine['enforceTierPricingMultiplier'] ?? true),
            'priceMultiplier' => max(0.1, (float) ($tier['priceMultiplier'] ?? 1)),
            'etaStartDate' => $etaStartDate,
            'etaEndDate' => $etaEndDate,
        ];
    }

    private function addressMatchesRemotePolicy(array $address, array $remotePolicy): bool
    {
        $postalPrefixes = collect($remotePolicy['postalCodePrefixes'] ?? [])
            ->map(fn ($item) => strtoupper(trim((string) $item)))
            ->filter()
            ->values();
        $cityKeywords = collect($remotePolicy['cityKeywords'] ?? [])
            ->map(fn ($item) => strtolower(trim((string) $item)))
            ->filter()
            ->values();

        $postal = strtoupper(trim((string) ($address['postalCode'] ?? '')));
        $cityState = strtolower(trim((string) (($address['city'] ?? '') . ' ' . ($address['state'] ?? ''))));

        if ($postalPrefixes->contains(fn ($prefix) => $prefix !== '' && str_starts_with($postal, $prefix))) {
            return true;
        }

        return $cityKeywords->contains(fn ($keyword) => $keyword !== '' && str_contains($cityState, $keyword));
    }

    private function isWithinPeakWindow(string $pickupTime, string $start, string $end): bool
    {
        if (preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $pickupTime) !== 1) {
            return false;
        }

        if (preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $start) !== 1 || preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $end) !== 1) {
            return false;
        }

        if ($start <= $end) {
            return $pickupTime >= $start && $pickupTime <= $end;
        }

        return $pickupTime >= $start || $pickupTime <= $end;
    }

    private function assertShipmentServiceCatalogPolicy(CourierShipment $shipment, array $payload): void
    {
        $category = (string) ($shipment->assignment_category ?: $this->resolvePayloadCategory($payload));
        $selectedLevelKey = $this->normalizeServiceLevelKey((string) ($payload['shipment']['serviceLevel'] ?? ''));
        $catalog = $this->resolveServiceCatalogForVendor((int) ($shipment->assigned_vendor_user_id ?? 0), $category);

        $selectedEntry = collect($catalog)
            ->first(fn ($item) => (bool) ($item['isActive'] ?? false) && (string) ($item['key'] ?? '') === $selectedLevelKey);

        if (!$selectedEntry) {
            throw ValidationException::withMessages([
                'shipment.serviceLevel' => 'Selected service level is not available for the assigned courier service catalog.',
            ]);
        }

        $cutoff = trim((string) ($selectedEntry['cutoffTime'] ?? ''));
        $pickupDate = isset($payload['shipment']['pickupDate']) && $payload['shipment']['pickupDate']
            ? Carbon::parse((string) $payload['shipment']['pickupDate'])
            : null;
        $pickupStart = isset($payload['shipment']['pickupWindowStart']) && $payload['shipment']['pickupWindowStart']
            ? (string) $payload['shipment']['pickupWindowStart']
            : null;

        if ($cutoff !== '' && $pickupDate && $pickupDate->isToday() && now()->format('H:i') > $cutoff) {
            throw ValidationException::withMessages([
                'shipment.serviceLevel' => "{$selectedEntry['label']} service is closed for today's cutoff ({$cutoff}).",
            ]);
        }

        if ($cutoff !== '' && $pickupStart && $pickupStart > $cutoff) {
            throw ValidationException::withMessages([
                'shipment.pickupWindowStart' => "Pickup start must be before service cutoff time ({$cutoff}) for {$selectedEntry['label']}.",
            ]);
        }

        $this->assertSpeedEtaTierPolicyConstraints($shipment, $payload, $category, $selectedLevelKey, $selectedEntry);
    }

    private function assertSpeedEtaTierPolicyConstraints(
        CourierShipment $shipment,
        array $payload,
        string $category,
        string $selectedLevelKey,
        array $selectedEntry
    ): void {
        $vendorId = (int) ($shipment->assigned_vendor_user_id ?? 0);
        if ($vendorId <= 0) {
            return;
        }

        $pricingConfig = $this->resolveCategoryPricingConfigForVendor($vendorId, $category);
        $policyModules = is_array($pricingConfig['policyModules'] ?? null) ? $pricingConfig['policyModules'] : [];
        $tierEngine = is_array($policyModules['speedEtaTierEngine'] ?? null) ? $policyModules['speedEtaTierEngine'] : [];

        if (!(bool) ($tierEngine['enabled'] ?? false)) {
            return;
        }

        $tiers = is_array($tierEngine['tiers'] ?? null) ? $tierEngine['tiers'] : [];
        $selectedTier = is_array($tiers[$selectedLevelKey] ?? null) ? $tiers[$selectedLevelKey] : null;
        $requiresFixedNamedTier = (bool) ($tierEngine['enforceFixedNamedTiers'] ?? true);
        if ($requiresFixedNamedTier && !$selectedTier) {
            throw ValidationException::withMessages([
                'shipment.serviceLevel' => 'Selected service level is not part of the fixed speed/ETA tier engine.',
            ]);
        }

        if (!$selectedTier) {
            return;
        }

        if (!(bool) ($selectedTier['enabled'] ?? true)) {
            throw ValidationException::withMessages([
                'shipment.serviceLevel' => 'Selected service tier is currently disabled by speed/ETA policy controls.',
            ]);
        }

        $pickupDate = isset($payload['shipment']['pickupDate']) && $payload['shipment']['pickupDate']
            ? Carbon::parse((string) $payload['shipment']['pickupDate'])
            : null;
        $pickupStart = isset($payload['shipment']['pickupWindowStart']) && $payload['shipment']['pickupWindowStart']
            ? trim((string) $payload['shipment']['pickupWindowStart'])
            : '00:00';

        if ($pickupDate) {
            $allowedPickupDays = collect($selectedTier['allowedPickupDays'] ?? [1, 2, 3, 4, 5, 6, 7])
                ->map(fn ($value) => (int) $value)
                ->filter(fn ($value) => $value >= 1 && $value <= 7)
                ->values()
                ->all();
            if (!empty($allowedPickupDays) && !in_array($pickupDate->dayOfWeekIso, $allowedPickupDays, true)) {
                throw ValidationException::withMessages([
                    'shipment.pickupDate' => 'Selected pickup date is not allowed for this service tier.',
                ]);
            }

            $blackoutDates = collect($selectedTier['blackoutDates'] ?? [])
                ->map(fn ($value) => trim((string) $value))
                ->filter()
                ->values()
                ->all();
            if (in_array($pickupDate->format('Y-m-d'), $blackoutDates, true)) {
                throw ValidationException::withMessages([
                    'shipment.pickupDate' => 'Selected pickup date is blocked by tier blackout policy.',
                ]);
            }

            $pickupDateTime = Carbon::parse($pickupDate->format('Y-m-d') . ' ' . (preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $pickupStart) === 1 ? $pickupStart : '00:00'));
            $leadHours = now()->diffInMinutes($pickupDateTime, false) / 60;
            $minLeadHours = max(0, (float) ($selectedTier['minLeadHours'] ?? 0));
            if ($leadHours < $minLeadHours) {
                throw ValidationException::withMessages([
                    'shipment.pickupWindowStart' => 'Pickup lead time is below the minimum allowed for this service tier.',
                ]);
            }

            if (isset($selectedTier['maxLeadHours']) && $selectedTier['maxLeadHours'] !== null && $selectedTier['maxLeadHours'] !== '') {
                $maxLeadHours = max($minLeadHours, (float) $selectedTier['maxLeadHours']);
                if ($leadHours > $maxLeadHours) {
                    throw ValidationException::withMessages([
                        'shipment.pickupWindowStart' => 'Pickup lead time exceeds the maximum window allowed for this service tier.',
                    ]);
                }
            }
        }

        if (isset($selectedTier['maxDistanceKm']) && $selectedTier['maxDistanceKm'] !== null && $selectedTier['maxDistanceKm'] !== '') {
            $distanceKm = $this->resolveDistanceKmFromPayload($payload);
            if ($distanceKm !== null && $distanceKm > (float) $selectedTier['maxDistanceKm']) {
                throw ValidationException::withMessages([
                    'shipment.distanceKm' => 'Route distance exceeds the maximum allowed for this service tier.',
                ]);
            }
        }

        if (isset($selectedTier['maxWeightKg']) && $selectedTier['maxWeightKg'] !== null && $selectedTier['maxWeightKg'] !== '') {
            $maxPackageWeight = collect($payload['packages'] ?? [])
                ->map(fn ($item) => max(0, (float) ((is_array($item) ? ($item['weightKg'] ?? 0) : 0))))
                ->max();
            if ($maxPackageWeight !== null && $maxPackageWeight > (float) $selectedTier['maxWeightKg']) {
                throw ValidationException::withMessages([
                    'packages' => 'At least one package exceeds the maximum weight allowed for this service tier.',
                ]);
            }
        }

        $promisedSlaDays = max(1, (int) ($selectedEntry['promisedSlaDays'] ?? 1));
        $etaMinDays = max(0, (int) ($selectedTier['etaMinDays'] ?? 0));
        $etaMaxDays = isset($selectedTier['etaMaxDays']) && $selectedTier['etaMaxDays'] !== null && $selectedTier['etaMaxDays'] !== ''
            ? max($etaMinDays, (int) $selectedTier['etaMaxDays'])
            : null;

        if ($promisedSlaDays < $etaMinDays || ($etaMaxDays !== null && $promisedSlaDays > $etaMaxDays)) {
            throw ValidationException::withMessages([
                'shipment.serviceLevel' => 'Selected service level SLA is outside the allowed speed/ETA tier range.',
            ]);
        }
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
