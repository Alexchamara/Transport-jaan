<?php

namespace App\Http\Controllers;

use App\Http\Requests\VendorProfileRequest;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\VendorProfile;
use App\Models\VendorServiceRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\VendorActivityLog;
use Inertia\Inertia;

class VendorProfileController extends Controller
{
    /**
     * Show the vendor registration page
     */
    public function index()
    {
        $user = Auth::user();

        $vendorProfile = VendorProfile::where('user_id', $user->id)->first();

        $serviceCategories = ServiceCategory::active()
            ->ordered()
            ->with('activeSubCategories')
            ->get();

        $vendorRegistrations = VendorServiceRegistration::where('user_id', $user->id)
            ->get()
            ->keyBy('service_sub_category_id');

        return Inertia::render('Web/home/vendors/allBookings/VendorProfile', [
            'vendorProfile' => $vendorProfile,
            'serviceCategories' => $serviceCategories,
            'vendorRegistrations' => $vendorRegistrations,
            'user' => $user,
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

        // Only allow edit if draft or revision_requested
        if ($existingProfile && !$existingProfile->canEdit()) {
            return redirect()->back()->withErrors(['profile' => 'Profile cannot be edited in its current status.']);
        }

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

        $vendorProfile = VendorProfile::updateOrCreate(
            ['user_id' => $user->id],
            array_merge($data, ['submission_status' => 'draft'])
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
            $description = "Service '{$subCategory->name}' resubmitted after rejection.";
            $metadata = [
                'service_name' => $subCategory->name,
                'category_name' => $subCategory->serviceCategory?->name,
                'resubmission_count' => ($existingReg->resubmission_count ?? 0) + 1,
            ];
            $message = 'Service registration resubmitted successfully. It is now pending admin review.';
        } elseif ($existingReg) {
            // Updating existing service
            $action = 'service_updated';
            $description = "Vendor updated service registration for '{$subCategory->name}'.";
            $metadata = [
                'service_name' => $subCategory->name,
                'category_name' => $subCategory->serviceCategory?->name,
            ];
            $message = 'Service registration updated successfully.';
        } else {
            // Creating new service
            $action = 'service_created';
            $description = "Vendor created new service registration for '{$subCategory->name}'.";
            $metadata = [
                'service_name' => $subCategory->name,
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
                'description' => "Vendor removed service registration for '{$subCategory->name}'.",
                'metadata' => [
                    'service_name' => $subCategory->name,
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
                                'services' => "Missing required document: {$field['label']} for {$subCategory->name}"
                            ]);
                        }
                        break;

                    case 'file_with_dates':
                        if (empty($fieldValues[$key]['file'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing required document: {$field['label']} for {$subCategory->name}"
                            ]);
                        }
                        if (empty($fieldValues[$key]['effective_date']) || empty($fieldValues[$key]['expiry_date'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing dates for {$field['label']} in {$subCategory->name}"
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
                                'services' => "Missing required document: {$field['label']} for {$subCategory->name}"
                            ]);
                        }
                        break;
                    case 'file_with_dates':
                        if (empty($fieldValues[$key]['file'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing required document: {$field['label']} for {$subCategory->name}"
                            ]);
                        }
                        if (empty($fieldValues[$key]['effective_date']) || empty($fieldValues[$key]['expiry_date'])) {
                            return redirect()->back()->withErrors([
                                'services' => "Missing dates for {$field['label']} in {$subCategory->name}"
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
}
