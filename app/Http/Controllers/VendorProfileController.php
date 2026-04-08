<?php

namespace App\Http\Controllers;

use App\Http\Requests\VendorProfileRequest;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\VendorProfile;
use App\Models\VendorServiceRegistration;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Warehouse\WarehouseImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\VendorActivityLog;
use Inertia\Inertia;

class VendorProfileController extends Controller
{
    public function logButtonClick(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'button_name' => ['required', 'string', 'max:120'],
            'screen' => ['nullable', 'string', 'max:120'],
            'step' => ['nullable', 'integer', 'min:1', 'max:10'],
            'service_name' => ['nullable', 'string', 'max:180'],
            'target_type' => ['nullable', 'string', 'max:120'],
            'target_id' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:500'],
            'metadata' => ['nullable', 'array'],
        ]);

        $description = $data['description']
            ?? "Vendor clicked '{$data['button_name']}' button" . (!empty($data['screen']) ? " on {$data['screen']}" : '') . '.';

        VendorActivityLog::create([
            'vendor_id' => $user->id,
            'action' => 'vendor_button_click',
            'target_type' => $data['target_type'] ?? 'ui_button',
            'target_id' => $data['target_id'] ?? null,
            'description' => $description,
            'metadata' => array_merge(
                [
                    'button_name' => $data['button_name'],
                    'screen' => $data['screen'] ?? null,
                    'step' => $data['step'] ?? null,
                    'service_name' => $data['service_name'] ?? null,
                ],
                $data['metadata'] ?? []
            ),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Show the vendor registration page
     */
    public function index(Request $request)
    {
        return $this->renderProfilePage($request, null);
    }

    public function step1(Request $request)
    {
        return $this->renderProfilePage($request, 1);
    }

    public function step2(Request $request)
    {
        return $this->renderProfilePage($request, 2);
    }

    public function step3(Request $request)
    {
        return $this->renderProfilePage($request, 3);
    }

    private function renderProfilePage(Request $request, ?int $forcedStep = null)
    {
        $user = Auth::user();

        $vendorProfile = VendorProfile::where('user_id', $user->id)->first();

        $serviceCategories = ServiceCategory::active()
            ->ordered()
            ->with('activeSubCategories')
            ->get()
            ->map(function (ServiceCategory $category) {
                return $this->normalizeCourierCategoryPayload($category);
            });

        $vendorRegistrations = VendorServiceRegistration::where('user_id', $user->id)
            ->get()
            ->keyBy('service_sub_category_id');

        $requestedStep = (int) $request->query('step', 0);
        $initialStep = in_array($forcedStep, [1, 2, 3], true)
            ? $forcedStep
            : (in_array($requestedStep, [1, 2, 3], true) ? $requestedStep : 1);

        return Inertia::render('Web/home/vendors/allBookings/VendorProfile', [
            'vendorProfile' => $vendorProfile,
            'serviceCategories' => $serviceCategories,
            'vendorRegistrations' => $vendorRegistrations,
            'user' => $user,
            'initialStep' => $initialStep,
            'selectedServiceSlug' => (string) $request->query('service', ''),
            'canEdit' => !$vendorProfile || $vendorProfile->canEdit(),
            'isRevisionRequested' => $vendorProfile?->isRevisionRequested() ?? false,
            'isRejected' => $vendorProfile?->isRejected() ?? false,
            'canAddNewServices' => $vendorProfile && in_array($vendorProfile->submission_status, ['submitted', 'approved']),
        ]);
    }

    /**
     * Save or update vendor business profile (Step 1)
     */
    public function saveProfile(VendorProfileRequest $request)
    {
        $user = Auth::user();
        $data = $request->validated();

        $existingProfile = VendorProfile::where('user_id', $user->id)->first();

        // Allow editing for all statuses - no restriction
        // Profile updates won't change submission status

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logo = $request->file('logo');
            $logoPath = $logo->store('uploads/vendors/' . $user->id . '/logo', 'public');
            $data['logo'] = $logoPath;
        }

        // Handle empty/null values: numeric fields get NULL, string fields get empty string
        $numericFields = ['established_year', 'employee_count'];
        foreach ($data as $key => $value) {
            if ($value === null || $value === '') {
                if (in_array($key, $numericFields)) {
                    $data[$key] = null;
                } else {
                    $data[$key] = '';
                }
            }
        }

        // Preserve existing submission_status if profile exists, otherwise set to draft
        $submissionStatus = $existingProfile ? $existingProfile->submission_status : 'draft';

        $vendorProfile = VendorProfile::updateOrCreate(
            ['user_id' => $user->id],
            array_merge($data, ['submission_status' => $submissionStatus])
        );

        // Log activity
        VendorActivityLog::create([
            'vendor_id' => $user->id,
            'action' => 'profile_updated',
            'target_type' => 'vendor_profile',
            'target_id' => $vendorProfile->id,
            'description' => 'Vendor updated business profile information.',
            'metadata' => [
                'company_name' => $data['company_name'] ?? '',
                'business_type' => $data['business_type'] ?? '',
            ],
        ]);

        return redirect()->back()->with('success', 'Business profile saved successfully.');
    }

    /**
     * Save service registration for a specific sub-category (Step 2)
     */
    public function saveServiceRegistration(Request $request, ServiceSubCategory $subCategory)
    {
        $user = Auth::user();
        $requiredFields = $subCategory->required_fields;
        $serviceName = (string) $subCategory->name;

        // Build field values from request
        $fieldValues = [];

        foreach ($requiredFields as $field) {
            $key = $field['key'];
            $type = $field['type'];

            switch ($type) {
                case 'file':
                    if ($request->hasFile("fields.{$key}.file")) {
                        $file = $request->file("fields.{$key}.file");
                        $path = $file->store(
                            'uploads/vendors/' . $user->id . '/services/' . $subCategory->slug,
                            'public'
                        );
                        $fieldValues[$key] = ['file' => $path, 'original_name' => $file->getClientOriginalName()];
                    } elseif ($request->input("fields.{$key}.existing_file")) {
                        // Keep existing file
                        $fieldValues[$key] = [
                            'file' => $request->input("fields.{$key}.existing_file"),
                            'original_name' => $request->input("fields.{$key}.existing_name", ''),
                        ];
                    }
                    break;

                case 'file_with_dates':
                    $entry = [];
                    if ($request->hasFile("fields.{$key}.file")) {
                        $file = $request->file("fields.{$key}.file");
                        $path = $file->store(
                            'uploads/vendors/' . $user->id . '/services/' . $subCategory->slug,
                            'public'
                        );
                        $entry['file'] = $path;
                        $entry['original_name'] = $file->getClientOriginalName();
                    } elseif ($request->input("fields.{$key}.existing_file")) {
                        $entry['file'] = $request->input("fields.{$key}.existing_file");
                        $entry['original_name'] = $request->input("fields.{$key}.existing_name", '');
                    }
                    $entry['effective_date'] = $request->input("fields.{$key}.effective_date");
                    $entry['expiry_date'] = $request->input("fields.{$key}.expiry_date");
                    $fieldValues[$key] = $entry;
                    break;

                case 'checkbox':
                    $fieldValues[$key] = (bool) $request->input("fields.{$key}", false);
                    break;

                case 'file_optional':
                    if ($request->hasFile("fields.{$key}.file")) {
                        $file = $request->file("fields.{$key}.file");
                        $path = $file->store(
                            'uploads/vendors/' . $user->id . '/services/' . $subCategory->slug,
                            'public'
                        );
                        $entry = ['file' => $path, 'original_name' => $file->getClientOriginalName()];
                        if ($request->has("fields.{$key}.effective_date")) {
                            $entry['effective_date'] = $request->input("fields.{$key}.effective_date");
                            $entry['expiry_date'] = $request->input("fields.{$key}.expiry_date");
                        }
                        $fieldValues[$key] = $entry;
                    } elseif ($request->input("fields.{$key}.existing_file")) {
                        $fieldValues[$key] = [
                            'file' => $request->input("fields.{$key}.existing_file"),
                            'original_name' => $request->input("fields.{$key}.existing_name", ''),
                            'effective_date' => $request->input("fields.{$key}.effective_date"),
                            'expiry_date' => $request->input("fields.{$key}.expiry_date"),
                        ];
                    }
                    break;
            }
        }

        // Handle existing registrations
        // Check profile status and existing registration
        $profile = VendorProfile::where('user_id', $user->id)->first();
        $existingReg = VendorServiceRegistration::where('user_id', $user->id)
            ->where('service_sub_category_id', $subCategory->id)
            ->first();

        // Determine if we can edit the service
        $canEdit = !$existingReg || $existingReg->canEdit();
        
        if (!$canEdit) {
            return redirect()->back()->with('error', 'You cannot edit this service in its current status.');
        }

        // Validate editing during revision or submitted modes
        if ($profile && $profile->submission_status === 'revision_requested') {
            $allowedStatuses = ['revision_requested', 'rejected'];
            if (!$existingReg || !in_array($existingReg->status, $allowedStatuses)) {
                return redirect()->back()->with('error', 'You can only edit services that require revision or have been rejected.');
            }
        } elseif ($profile && in_array($profile->submission_status, ['submitted', 'approved'])) {
            // In submitted/approved mode, allow editing rejected services
            // Only block editing of other non-draft services
            if ($existingReg && $existingReg->status !== 'draft' && $existingReg->status !== 'rejected') {
                return redirect()->back()->with('error', 'You cannot edit already submitted or approved services. Only new services or rejected services can be edited.');
            }
        }

        // Determine new status based on existing status
        $newStatus = 'draft';
        if ($existingReg) {
            if ($existingReg->status === 'rejected') {
                // Resubmitting a rejected service
                $newStatus = 'submitted';
                $lastResubmittedAt = now();
                $resubmissionCount = ($existingReg->resubmission_count ?? 0) + 1;
            } elseif ($existingReg->status === 'revision_requested') {
                $newStatus = 'revision_requested';
            } else {
                $newStatus = $existingReg->status;
            }
        }

        $updateData = [
            'service_category_id' => $subCategory->service_category_id,
            'field_values' => $fieldValues,
            'status' => $newStatus,
        ];

        // Add resubmission tracking if regenerating from rejected
        if ($existingReg && $existingReg->status === 'rejected') {
            $updateData['last_resubmitted_at'] = now();
            $updateData['resubmission_count'] = ($existingReg->resubmission_count ?? 0) + 1;
        }

        $registration = VendorServiceRegistration::updateOrCreate(
            [
                'user_id' => $user->id,
                'service_sub_category_id' => $subCategory->id,
            ],
            $updateData
        );

        // Determine action type for logging
        if ($existingReg && $existingReg->status === 'rejected') {
            // Resubmitting a rejected service
            $action = 'service_resubmitted';
            $description = "Service '{$serviceName}' resubmitted after rejection.";
            $metadata = [
                'service_name' => $serviceName,
                'category_name' => $subCategory->serviceCategory?->name,
                'resubmission_count' => ($existingReg->resubmission_count ?? 0) + 1,
            ];
            $message = 'Service registration resubmitted successfully. It is now pending admin review.';
        } elseif ($existingReg) {
            // Updating existing service
            $action = 'service_updated';
            $description = "Vendor updated service registration for '{$serviceName}'.";
            $metadata = [
                'service_name' => $serviceName,
                'category_name' => $subCategory->serviceCategory?->name,
            ];
            $message = 'Service registration updated successfully.';
        } else {
            // Creating new service
            $action = 'service_created';
            $description = "Vendor created new service registration for '{$serviceName}'.";
            $metadata = [
                'service_name' => $serviceName,
                'category_name' => $subCategory->serviceCategory?->name,
            ];
            $message = 'Service registration saved successfully.';
        }

        // Log activity
        VendorActivityLog::create([
            'vendor_id' => $user->id,
            'action' => $action,
            'target_type' => 'vendor_service_registration',
            'target_id' => $registration->id,
            'description' => $description,
            'metadata' => $metadata,
        ]);

        return redirect()->back()->with('success', $message);
    }

    /**
     * Remove a service registration
     */
    public function removeServiceRegistration(ServiceSubCategory $subCategory)
    {
        $user = Auth::user();
        $serviceName = (string) $subCategory->name;

        // Block removal during revision mode
        $profile = VendorProfile::where('user_id', $user->id)->first();
        if ($profile && $profile->submission_status === 'revision_requested') {
            return redirect()->back()->with('error', 'You cannot remove services while revision is pending.');
        }

        $registration = VendorServiceRegistration::where('user_id', $user->id)
            ->where('service_sub_category_id', $subCategory->id)
            ->first();

        // Block removal if service has been rejected - vendor should resubmit instead
        if ($registration && $registration->status === 'rejected') {
            return redirect()->back()->with('error', 'You cannot remove a rejected service. Please edit and resubmit it instead.');
        }

        // For submitted/approved profiles, only allow removing draft (new) services
        if ($registration && $registration->status !== 'draft' && $profile && in_array($profile->submission_status, ['submitted', 'approved'])) {
            return redirect()->back()->with('error', 'You cannot remove already submitted or approved services.');
        }

        if ($registration) {
            // Log activity
            VendorActivityLog::create([
                'vendor_id' => $user->id,
                'action' => 'service_removed',
                'target_type' => 'vendor_service_registration',
                'target_id' => $registration->id,
                'description' => "Vendor removed service registration for '{$serviceName}'.",
                'metadata' => [
                    'service_name' => $serviceName,
                    'category_name' => $subCategory->serviceCategory?->name,
                ],
            ]);

            $registration->delete();
        }

        return redirect()->back()->with('success', 'Service registration removed.');
    }

    /**
     * Submit entire profile + services for review (Step 3)
     */
    public function submit()
    {
        $user = Auth::user();
        $vendorProfile = VendorProfile::where('user_id', $user->id)->first();

        if (!$vendorProfile) {
            return redirect()->back()->withErrors(['profile' => 'Please complete your business profile first.']);
        }

        // Check that at least one service registration exists
        $registrations = VendorServiceRegistration::where('user_id', $user->id)->get();

        if ($registrations->isEmpty()) {
            return redirect()->back()->withErrors(['services' => 'Please register for at least one service.']);
        }

        // Validate required fields for each service registration
        foreach ($registrations as $registration) {
            $subCategory = ServiceSubCategory::find($registration->service_sub_category_id);
            if (!$subCategory) continue;

            $serviceName = (string) $subCategory->name;

            $requiredFields = $subCategory->required_fields;
            $fieldValues = $registration->field_values ?? [];

            foreach ($requiredFields as $field) {
                if (!$field['required']) continue;

                $key = $field['key'];
                $type = $field['type'];

                switch ($type) {
                    case 'file':
                    case 'file_optional':
                        if (empty($fieldValues[$key]['file'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing required document: {$field['label']} for {$serviceName}"
                            ]);
                        }
                        break;

                    case 'file_with_dates':
                        if (empty($fieldValues[$key]['file'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing required document: {$field['label']} for {$serviceName}"
                            ]);
                        }
                        if (empty($fieldValues[$key]['effective_date']) || empty($fieldValues[$key]['expiry_date'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing dates for {$field['label']} in {$serviceName}"
                            ]);
                        }
                        break;

                    case 'checkbox':
                        break;
                }
            }
        }

        DB::transaction(function () use ($vendorProfile, $registrations, $user) {
            $isResubmission = $vendorProfile->isRevisionRequested() || $vendorProfile->isRejected();

            // Update profile status
            $vendorProfile->update([
                'submission_status' => 'submitted',
                'submitted_at' => now(),
            ]);

            // Update all editable service registrations
            foreach ($registrations as $registration) {
                if (in_array($registration->status, ['draft', 'revision_requested', 'rejected'])) {
                    $registration->update([
                        'status' => 'submitted',
                        'submitted_at' => now(),
                    ]);
                }
            }

            // Update user status to inreview
            $user->update(['status' => 'inreview']);

            // Log activity
            VendorActivityLog::create([
                'vendor_id' => $user->id,
                'action' => $isResubmission ? 'profile_resubmitted' : 'profile_submitted',
                'target_type' => 'vendor_profile',
                'target_id' => $vendorProfile->id,
                'description' => $isResubmission
                    ? 'Vendor resubmitted profile after rejection or revision request.'
                    : 'Vendor submitted profile for review.',
                'metadata' => ['services_count' => $registrations->count()],
            ]);
        });

        return redirect()->route('vendorAllBookings')->with('success', 'Your profile has been submitted for review.');
    }

    /**
     * Submit only new (draft) service registrations for review.
     * Profile status stays unchanged (submitted/approved).
     */
    public function submitNewServices()
    {
        $user = Auth::user();
        $vendorProfile = VendorProfile::where('user_id', $user->id)->first();

        if (!$vendorProfile || !in_array($vendorProfile->submission_status, ['submitted', 'approved'])) {
            return redirect()->back()->withErrors(['services' => 'You can only submit new services when your profile is submitted or approved.']);
        }

        $draftRegistrations = VendorServiceRegistration::where('user_id', $user->id)
            ->where('status', 'draft')
            ->get();

        if ($draftRegistrations->isEmpty()) {
            return redirect()->back()->withErrors(['services' => 'No new services to submit.']);
        }

        // Validate required fields for each draft service
        foreach ($draftRegistrations as $registration) {
            $subCategory = ServiceSubCategory::find($registration->service_sub_category_id);
            if (!$subCategory) continue;

            $serviceName = (string) $subCategory->name;

            $requiredFields = $subCategory->required_fields;
            $fieldValues = $registration->field_values ?? [];

            foreach ($requiredFields as $field) {
                if (!$field['required']) continue;
                $key = $field['key'];
                $type = $field['type'];

                switch ($type) {
                    case 'file':
                    case 'file_optional':
                        if (empty($fieldValues[$key]['file'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing required document: {$field['label']} for {$serviceName}"
                            ]);
                        }
                        break;
                    case 'file_with_dates':
                        if (empty($fieldValues[$key]['file'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing required document: {$field['label']} for {$serviceName}"
                            ]);
                        }
                        if (empty($fieldValues[$key]['effective_date']) || empty($fieldValues[$key]['expiry_date'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing dates for {$field['label']} in {$serviceName}"
                            ]);
                        }
                        break;
                    case 'checkbox':
                        // Checkboxes are treated as optional confirmations
                        break;
                }
            }
        }

        DB::transaction(function () use ($draftRegistrations, $user) {
            foreach ($draftRegistrations as $registration) {
                $registration->update([
                    'status' => 'submitted',
                    'submitted_at' => now(),
                ]);
            }

            VendorActivityLog::create([
                'vendor_id' => $user->id,
                'action' => 'new_services_submitted',
                'target_type' => 'vendor_service_registration',
                'target_id' => $draftRegistrations->first()->id,
                'description' => 'Vendor submitted ' . $draftRegistrations->count() . ' new service(s) for review.',
                'metadata' => ['services_count' => $draftRegistrations->count()],
            ]);
        });

        return redirect()->back()->with('success', 'New service(s) submitted for review successfully.');
    }

    /**
     * Remove vendor profile logo
     */
    public function removeLogo()
    {
        $user = Auth::user();
        $vendorProfile = VendorProfile::where('user_id', $user->id)->first();

        if ($vendorProfile && $vendorProfile->logo) {
            Storage::disk('public')->delete($vendorProfile->logo);
            $vendorProfile->update(['logo' => null]);

            // Log activity
            VendorActivityLog::create([
                'vendor_id' => $user->id,
                'action' => 'logo_removed',
                'target_type' => 'vendor_profile',
                'target_id' => $vendorProfile->id,
                'description' => 'Vendor removed profile logo.',
                'metadata' => [],
            ]);
        }

        return redirect()->back()->with('success', 'Logo removed successfully.');
    }

    /**
     * Display public vendor profile page
     */
    public function showPublicProfile($userId)
    {
        // Fetch the vendor user and their profile
        $vendor = \App\Models\User::with('vendorProfile')->find($userId);
        
        if (!$vendor) {
            abort(404, 'Vendor not found');
        }

        $vendorProfile = $vendor->vendorProfile;

        // Get approved services for this vendor and deduplicate by category name
        $serviceDisplayOrder = ['Vehicle Rental', 'Ticket Booking', 'Courier Services', 'Warehousing', 'Freight'];

        $registeredServices = VendorServiceRegistration::where('user_id', $userId)
            ->where('status', 'approved')
            ->with('serviceCategory')
            ->get()
            ->groupBy(function($service) {
                return $service->serviceCategory->name ?? 'Unknown';
            })
            ->map(function($group, $categoryName) {
                // Take first service from each category group
                $service = $group->first();
                return [
                    'id' => $service->id,
                    'category_name' => $categoryName,
                    'status' => $service->status,
                ];
            })
            ->values();

        $services = $registeredServices
            ->filter(function($service) use ($serviceDisplayOrder) {
                // Only allow specific service categories
                return in_array($service['category_name'], $serviceDisplayOrder);
            })
            ->values();

        $registeredCategoryNames = $registeredServices->pluck('category_name')->toArray();
        $shownCategoryNames = $services->pluck('category_name')->toArray();

        $hasTicketBookingRegistration = in_array('Ticket Booking', $registeredCategoryNames)
            || count(array_intersect($registeredCategoryNames, ['Aviation Service', 'Railway Service', 'Waterborne Transport'])) > 0;

        $hasFreightRegistration = in_array('Freight', $registeredCategoryNames)
            || count(array_intersect($registeredCategoryNames, ['Courier Services', 'Waterborne Transport'])) > 0;

        if ($hasTicketBookingRegistration && !in_array('Ticket Booking', $shownCategoryNames)) {
            $services->push([
                'id' => null,
                'category_name' => 'Ticket Booking',
                'status' => 'approved',
            ]);
        }

        if ($hasFreightRegistration && !in_array('Freight', $shownCategoryNames)) {
            $services->push([
                'id' => null,
                'category_name' => 'Freight',
                'status' => 'approved',
            ]);
        }

        $services = $services
            ->sortBy(function($service) use ($serviceDisplayOrder) {
                // Sort by predefined order (Vehicle Rental first)
                $index = array_search($service['category_name'], $serviceDisplayOrder);
                return $index !== false ? $index : 999;
            })
            ->values();

        // Get service names for conditional data fetching
        $serviceNames = $services->pluck('category_name')->toArray();

        // Initialize data arrays
        $landVehicles = collect();
        $seaVehicles = collect();
        $airVehicles = collect();
        $warehouseUnits = collect();
        $courierServices = collect();
        $flightSchedules = collect();
        $trainSchedules = collect();

        // Fetch data based on registered services
        if (in_array('Vehicle Rental', $serviceNames)) {
            // Get vehicles by type
            $landVehicles = \App\Models\Vehicle::where('provider_id', $userId)
                ->where('type', 'land')
                ->with('landSpec')
                ->get()
                ->map(function ($vehicle) {
                    return [
                        'id' => $vehicle->id,
                        'manufacturer' => $vehicle->manufacturer,
                        'model' => $vehicle->model,
                        'manufacture_year' => $vehicle->manufacture_year,
                        'passenger_capacity' => $vehicle->passenger_capacity,
                        'mileage_km' => $vehicle->mileage_km,
                        'transmission_type' => $vehicle->landSpec->transmission_type ?? null,
                        'fuel_type' => $vehicle->landSpec->fuel_type ?? null,
                        'rental_price_per_day' => $vehicle->rental_price_per_day,
                        'status' => $vehicle->status,
                        'primary_image_url' => $vehicle->primary_image_url,
                    ];
                });

            $seaVehicles = \App\Models\Vehicle::where('provider_id', $userId)
                ->where('type', 'sea')
                ->get()
                ->map(function ($vehicle) {
                    return [
                        'id' => $vehicle->id,
                        'manufacturer' => $vehicle->manufacturer,
                        'model' => $vehicle->model,
                        'manufacture_year' => $vehicle->manufacture_year,
                        'passenger_capacity' => $vehicle->passenger_capacity,
                        'mileage_km' => $vehicle->mileage_km,
                        'rental_price_per_day' => $vehicle->rental_price_per_day,
                        'status' => $vehicle->status,
                        'primary_image_url' => $vehicle->primary_image_url,
                    ];
                });

            $airVehicles = \App\Models\Vehicle::where('provider_id', $userId)
                ->where('type', 'air')
                ->get()
                ->map(function ($vehicle) {
                    return [
                        'id' => $vehicle->id,
                        'manufacturer' => $vehicle->manufacturer,
                        'model' => $vehicle->model,
                        'manufacture_year' => $vehicle->manufacture_year,
                        'passenger_capacity' => $vehicle->passenger_capacity,
                        'mileage_km' => $vehicle->mileage_km,
                        'rental_price_per_day' => $vehicle->rental_price_per_day,
                        'status' => $vehicle->status,
                        'primary_image_url' => $vehicle->primary_image_url,
                    ];
                });
        }

        if (in_array('Warehousing', $serviceNames)) {
            $warehouseUnits = WarehouseUnit::where('user_id', $userId)
                ->where('is_active', true)
                ->with('mainImage')
                ->get()
                ->map(function ($warehouse) {
                    $imagePath = $warehouse->mainImage?->file_path;
                    return [
                        'id' => $warehouse->id,
                        'name' => $warehouse->name,
                        'description' => $warehouse->description,
                        'address' => $warehouse->address,
                        'total_area' => $warehouse->total_area,
                        'capacity' => $warehouse->capacity,
                        'capacity_unit' => $warehouse->capacity_unit,
                        'type' => $warehouse->type,
                        'monthly_rate' => $warehouse->monthly_rate,
                        'setup_fee' => $warehouse->setup_fee,
                        'is_available' => $warehouse->is_available,
                        'contact_person' => $warehouse->contact_person,
                        'contact_phone' => $warehouse->contact_phone,
                        'primary_image_url' => $imagePath ? '/storage/' . $imagePath : null,
                    ];
                });
        }

        // Calculate stats
        $totalReviews = \App\Models\VehicleReview::whereHas('vehicle', function ($query) use ($userId) {
            $query->where('provider_id', $userId);
        })->count();

        $avgRating = \App\Models\VehicleReview::whereHas('vehicle', function ($query) use ($userId) {
            $query->where('provider_id', $userId);
        })->avg('rating') ?? 0;

        $createdAt = $vendor->created_at;
        $now = now();
        $monthsSinceJoined = $now->diffInMonths($createdAt);
        $daysSinceJoined = $now->diffInDays($createdAt);

        $stats = [
            'totalReviews' => $totalReviews,
            'avgRating' => round($avgRating, 1),
            'monthsSinceJoined' => $monthsSinceJoined,
            'daysSinceJoined' => $daysSinceJoined,
        ];

        $authUser = Auth::user();
        $likedVehicleIds = [];
        $likedWarehouseIds = [];

        if ($authUser instanceof \App\Models\User) {
            $likedVehicleIds = $authUser->vehicleLikes()->pluck('vehicle_id')->toArray();
            $likedWarehouseIds = \App\Models\Warehouse\WarehouseLike::where('user_id', $authUser->id)
                ->pluck('warehouse_unit_id')
                ->toArray();
        }

        return Inertia::render('Web/home/vendors/VendorProfle', [
            'vendor' => $vendor,
            'vendorProfile' => $vendorProfile,
            'services' => $services,
            'landVehicles' => $landVehicles,
            'seaVehicles' => $seaVehicles,
            'airVehicles' => $airVehicles,
            'warehouseUnits' => $warehouseUnits,
            'courierServices' => $courierServices,
            'flightSchedules' => $flightSchedules,
            'trainSchedules' => $trainSchedules,
            'stats' => $stats,
            'authUser' => $authUser,
            'likedVehicleIds' => $likedVehicleIds,
            'likedWarehouseIds' => $likedWarehouseIds,
        ]);
    }

    private function normalizeCourierCategoryPayload(ServiceCategory $category): ServiceCategory
    {
        if (strcasecmp((string) $category->name, 'Courier Services') !== 0) {
            return $category;
        }

        $normalizedSubCategories = $category->activeSubCategories->map(function ($subCategory) {
            $slug = strtolower(trim((string) $subCategory->slug));
            $name = strtolower(trim((string) $subCategory->name));

            if ($slug === 'logistic' || $name === 'logistic') {
                $subCategory->slug = 'international';
                $subCategory->name = 'International';
                $subCategory->description = 'International courier services';
            }

            if (is_array($subCategory->required_fields ?? null)) {
                $subCategory->required_fields = $this->normalizeCourierRequiredFields($subCategory->required_fields);
            }

            return $subCategory;
        });

        $category->setRelation('activeSubCategories', $normalizedSubCategories);

        return $category;
    }

    private function normalizeCourierRequiredFields(array $requiredFields): array
    {
        return collect($requiredFields)->map(function ($field) {
            if (!is_array($field)) {
                return $field;
            }

            if (isset($field['label']) && is_string($field['label'])) {
                $field['label'] = str_ireplace('Logistic', 'International', $field['label']);
            }

            return $field;
        })->values()->all();
    }

}
