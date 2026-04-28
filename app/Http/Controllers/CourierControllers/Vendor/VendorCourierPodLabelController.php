<?php

namespace App\Http\Controllers\CourierControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Jobs\CourierGeneratePodLabelJob;
use App\Models\Courier\CourierLabelPrintItem;
use App\Models\Courier\CourierLabelPrintJob;
use App\Models\Courier\CourierLabelSize;
use App\Models\Courier\CourierLabelTemplate;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierSetting;
use App\Models\VendorServiceRegistration;
use App\Services\Courier\CourierLabelComplianceService;
use App\Services\Courier\CourierLabelRenderService;
use App\Services\Courier\CourierLabelSchemaRegistry;
use App\Services\Courier\CourierPodLabelService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VendorCourierPodLabelController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('service.workspace:courier_service');
    }

    public function catalog(
        Request $request,
        CourierPodLabelService $service,
        CourierLabelSchemaRegistry $schemaRegistry,
        CourierLabelComplianceService $complianceService
    )
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);
        $this->ensureVendorLabelStudioBootstrap($vendorId, $actorId, $service);

        $sizes = CourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelSize $size) => $this->transformSize($size))
            ->values();

        $templates = CourierLabelTemplate::query()
            ->with('size:id,name,width_mm,height_mm,is_active,is_system')
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderByDesc('version')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelTemplate $template) => $this->transformTemplate($template))
            ->values();

        $settings = $this->resolveLabelSettings($vendorId);
        $schemaLabelTypes = $schemaRegistry->labelTypes();
        $knownTypeKeys = array_map(static fn (array $item) => (string) $item['key'], $schemaLabelTypes);
        $customTypeRows = CourierLabelTemplate::query()
            ->where('vendor_user_id', $vendorId)
            ->select('label_type')
            ->distinct()
            ->get()
            ->map(fn ($row) => strtolower((string) ($row->label_type ?? '')))
            ->filter(fn (string $type) => $type !== '' && !in_array($type, $knownTypeKeys, true))
            ->values();
        $customLabelTypes = $customTypeRows
            ->map(fn (string $type) => [
                'key' => $type,
                'label' => strtoupper(str_replace('_', ' ', $type)),
                'requiresCompliance' => false,
                'isCustom' => true,
            ])
            ->values()
            ->all();
        $labelTypes = array_values(array_merge(
            array_map(static function (array $item) {
                $item['isCustom'] = false;
                return $item;
            }, $schemaLabelTypes),
            $customLabelTypes
        ));

        return response()->json([
            'sizes' => $sizes,
            'templates' => $templates,
            'defaults' => $settings['defaults'],
            'policy' => $settings['policy'],
            'tokens' => $this->availableTokens(),
            'layoutPresets' => [
                CourierLabelRenderService::LAYOUT_TWO_UP,
                CourierLabelRenderService::LAYOUT_SINGLE_UP,
                CourierLabelRenderService::LAYOUT_THERMAL_CONTINUOUS,
                CourierLabelRenderService::LAYOUT_MANIFEST_BATCH,
            ],
            'templateSchemaDefaults' => $service->defaultTemplateSchemaForType('pod'),
            'labelTypes' => $labelTypes,
            'presets' => $schemaRegistry->defaultPresets(),
            'compliancePolicies' => $complianceService->policies(),
            'defaultTemplates' => $this->defaultTemplateMap($templates),
        ]);
    }

    public function listSizes(Request $request)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);
        $this->ensureVendorLabelStudioBootstrap($vendorId, (int) optional($request->user())->id);

        $sizes = CourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelSize $size) => $this->transformSize($size))
            ->values();

        return response()->json(['sizes' => $sizes]);
    }

    public function storeSize(Request $request)
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'widthMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'heightMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'unit' => ['nullable', 'string', Rule::in(['mm', 'cm', 'in'])],
            'presetCode' => ['nullable', 'string', 'max:80'],
            'paperClass' => ['nullable', 'string', 'max:40'],
            'dpiProfile' => ['nullable', 'string', 'max:40'],
        ]);

        $size = CourierLabelSize::create([
            'vendor_user_id' => $vendorId,
            'name' => (string) $validated['name'],
            'width_mm' => (float) $validated['widthMm'],
            'height_mm' => (float) $validated['heightMm'],
            'preset_code' => isset($validated['presetCode']) ? (string) $validated['presetCode'] : null,
            'paper_class' => isset($validated['paperClass']) ? (string) $validated['paperClass'] : null,
            'dpi_profile' => isset($validated['dpiProfile']) ? (string) $validated['dpiProfile'] : null,
            'is_active' => true,
            'is_system' => false,
            'created_by_user_id' => $actorId ?: null,
            'updated_by_user_id' => $actorId ?: null,
            'metadata' => ['unit' => (string) ($validated['unit'] ?? 'mm')],
        ]);

        return response()->json(['size' => $this->transformSize($size)], 201);
    }

    public function updateSize(Request $request, CourierLabelSize $size)
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);
        if ((int) $size->vendor_user_id !== $vendorId) {
            abort(404);
        }

        if ($size->is_system) {
            return response()->json(['message' => 'System sizes cannot be modified.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'widthMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'heightMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'unit' => ['nullable', 'string', Rule::in(['mm', 'cm', 'in'])],
            'presetCode' => ['nullable', 'string', 'max:80'],
            'paperClass' => ['nullable', 'string', 'max:40'],
            'dpiProfile' => ['nullable', 'string', 'max:40'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $metadata = is_array($size->metadata) ? $size->metadata : [];
        if (isset($validated['unit'])) {
            $metadata['unit'] = (string) $validated['unit'];
        }

        $size->update([
            'name' => (string) $validated['name'],
            'width_mm' => (float) $validated['widthMm'],
            'height_mm' => (float) $validated['heightMm'],
            'preset_code' => isset($validated['presetCode']) ? (string) $validated['presetCode'] : $size->preset_code,
            'paper_class' => isset($validated['paperClass']) ? (string) $validated['paperClass'] : $size->paper_class,
            'dpi_profile' => isset($validated['dpiProfile']) ? (string) $validated['dpiProfile'] : $size->dpi_profile,
            'is_active' => (bool) ($validated['isActive'] ?? $size->is_active),
            'updated_by_user_id' => $actorId ?: null,
            'metadata' => $metadata,
        ]);

        return response()->json(['size' => $this->transformSize($size->fresh())]);
    }

    public function deleteSize(Request $request, CourierLabelSize $size)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);
        if ((int) $size->vendor_user_id !== $vendorId) {
            abort(404);
        }

        if ($size->is_system) {
            return response()->json(['message' => 'System sizes cannot be removed.'], 403);
        }

        $size->delete();

        return response()->json(['ok' => true]);
    }

    public function listTemplates(Request $request)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);
        $this->ensureVendorLabelStudioBootstrap($vendorId, (int) optional($request->user())->id);

        $templates = CourierLabelTemplate::query()
            ->with('size:id,name,width_mm,height_mm,is_active,is_system,metadata')
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderByDesc('version')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelTemplate $template) => $this->transformTemplate($template))
            ->values();

        return response()->json(['templates' => $templates]);
    }

    public function typeSchema(Request $request, string $type, CourierLabelSchemaRegistry $schemaRegistry)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        $labelType = strtolower(trim($type));
        if (!$schemaRegistry->acceptsType($labelType)) {
            return response()->json(['message' => 'Unsupported label type.'], 422);
        }

        return response()->json([
            'labelType' => $labelType,
            'schema' => $schemaRegistry->schemaForType($labelType),
            'defaults' => $schemaRegistry->defaultSchemaForTemplate($labelType),
            'layoutPreset' => $schemaRegistry->defaultLayoutByType($labelType),
        ]);
    }

    public function complianceValidate(
        Request $request,
        CourierPodLabelService $payloadService,
        CourierLabelComplianceService $complianceService
    ) {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'labelType' => ['required', 'string', 'max:60'],
            'shipmentId' => ['nullable', 'integer'],
            'packageId' => ['nullable', 'integer'],
            'payload' => ['nullable', 'array'],
        ]);

        $labelType = strtolower((string) $validated['labelType']);
        $payload = is_array($validated['payload'] ?? null) ? $validated['payload'] : [];
        $shipment = null;

        if (!empty($validated['shipmentId'])) {
            $shipment = CourierShipment::query()
                ->with(['sender', 'recipient', 'senderAddress', 'recipientAddress', 'packages'])
                ->where('assigned_vendor_user_id', $vendorId)
                ->findOrFail((int) $validated['shipmentId']);

            $package = $shipment->packages->firstWhere('id', (int) ($validated['packageId'] ?? 0)) ?: $shipment->packages->first();
            if (!$package) {
                return response()->json(['message' => 'Shipment has no package available for compliance validation.'], 422);
            }

            $payload = $payloadService->buildPayload($shipment, $package, $vendorId, $labelType);
        }

        if (empty($payload)) {
            return response()->json(['message' => 'Payload or shipment context is required.'], 422);
        }

        return response()->json([
            'labelType' => $labelType,
            'result' => $complianceService->validate($labelType, $payload, $shipment),
        ]);
    }

    public function storeTemplate(
        Request $request,
        CourierPodLabelService $service,
        CourierLabelSchemaRegistry $schemaRegistry
    )
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sizeId' => ['nullable', 'integer'],
            'size_id' => ['nullable', 'integer'],
            'categoryScope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'category_scope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'labelType' => ['nullable', 'string', 'max:60'],
            'label_type' => ['nullable', 'string', 'max:60'],
            'layoutPreset' => ['nullable', 'string', Rule::in([
                CourierLabelRenderService::LAYOUT_TWO_UP,
                CourierLabelRenderService::LAYOUT_SINGLE_UP,
                CourierLabelRenderService::LAYOUT_THERMAL_CONTINUOUS,
                CourierLabelRenderService::LAYOUT_MANIFEST_BATCH,
            ])],
            'orientation' => ['nullable', 'string', Rule::in(['portrait', 'landscape'])],
            'schemaVersion' => ['nullable', 'string', 'max:30'],
            'schema_version' => ['nullable', 'string', 'max:30'],
            'versionChannel' => ['nullable', 'string', Rule::in(['stable', 'draft', 'archived'])],
            'version_channel' => ['nullable', 'string', Rule::in(['stable', 'draft', 'archived'])],
            'schema' => ['nullable', 'array'],
            'builderSchema' => ['nullable'],
            'builder_schema' => ['nullable'],
            'isActive' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'templateType' => ['nullable', 'string'],
            'template_type' => ['nullable', 'string'],
            'background' => ['nullable', 'file'],
        ]);

        $sizeId = isset($validated['sizeId']) ? (int) $validated['sizeId'] : (isset($validated['size_id']) ? (int) $validated['size_id'] : null);
        $size = $sizeId
            ? CourierLabelSize::query()->where('vendor_user_id', $vendorId)->findOrFail($sizeId)
            : null;

        $scope = (string) ($validated['categoryScope'] ?? $validated['category_scope'] ?? 'all');
        $labelType = strtolower((string) ($validated['labelType'] ?? $validated['label_type'] ?? 'pod'));
        if (!$schemaRegistry->acceptsType($labelType)) {
            return response()->json(['message' => 'Unsupported label type.'], 422);
        }

        $layout = (string) ($validated['layoutPreset'] ?? $schemaRegistry->defaultLayoutByType($labelType));
        $schemaVersion = (string) ($validated['schemaVersion'] ?? $validated['schema_version'] ?? CourierLabelSchemaRegistry::VERSION_V1);
        $versionChannel = (string) ($validated['versionChannel'] ?? $validated['version_channel'] ?? 'stable');
        $rawSchema = $validated['schema'] ?? $validated['builderSchema'] ?? $validated['builder_schema'] ?? [];
        if (is_string($rawSchema)) {
            $decoded = json_decode($rawSchema, true);
            $rawSchema = is_array($decoded) ? $decoded : [];
        }
        $schema = array_replace($schemaRegistry->defaultSchemaForTemplate($labelType), is_array($rawSchema) ? $rawSchema : []);

        $version = (int) (CourierLabelTemplate::query()
            ->where('vendor_user_id', $vendorId)
            ->where('name', (string) $validated['name'])
            ->where('label_type', $labelType)
            ->max('version') ?? 0) + 1;

        $template = CourierLabelTemplate::create([
            'vendor_user_id' => $vendorId,
            'size_id' => $size?->id,
            'name' => (string) $validated['name'],
            'label_type' => $labelType,
            'schema_version' => $schemaVersion,
            'version_channel' => $versionChannel,
            'category_scope' => $scope,
            'layout_preset' => $layout,
            'orientation' => (string) ($validated['orientation'] ?? 'portrait'),
            'version' => $version,
            'schema' => $schema,
            'is_active' => (bool) ($validated['isActive'] ?? $validated['is_active'] ?? true),
            'is_system' => false,
            'created_by_user_id' => $actorId ?: null,
            'updated_by_user_id' => $actorId ?: null,
            'published_at' => $versionChannel === 'stable' ? now() : null,
            'archived_at' => $versionChannel === 'archived' ? now() : null,
        ]);

        if ($template->is_active) {
            $this->deactivateSiblingTemplates($template);
        }

        return response()->json([
            'template' => $this->transformTemplate($template->load('size:id,name,width_mm,height_mm,is_active,is_system,metadata')),
        ], 201);
    }

    public function updateTemplate(
        Request $request,
        CourierLabelTemplate $template,
        CourierPodLabelService $service,
        CourierLabelSchemaRegistry $schemaRegistry
    )
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);
        $this->assertTemplateOwnership($template, $vendorId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sizeId' => ['nullable', 'integer'],
            'size_id' => ['nullable', 'integer'],
            'categoryScope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'category_scope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'labelType' => ['nullable', 'string', 'max:60'],
            'label_type' => ['nullable', 'string', 'max:60'],
            'layoutPreset' => ['nullable', 'string', Rule::in([
                CourierLabelRenderService::LAYOUT_TWO_UP,
                CourierLabelRenderService::LAYOUT_SINGLE_UP,
                CourierLabelRenderService::LAYOUT_THERMAL_CONTINUOUS,
                CourierLabelRenderService::LAYOUT_MANIFEST_BATCH,
            ])],
            'orientation' => ['nullable', 'string', Rule::in(['portrait', 'landscape'])],
            'schemaVersion' => ['nullable', 'string', 'max:30'],
            'schema_version' => ['nullable', 'string', 'max:30'],
            'versionChannel' => ['nullable', 'string', Rule::in(['stable', 'draft', 'archived'])],
            'version_channel' => ['nullable', 'string', Rule::in(['stable', 'draft', 'archived'])],
            'schema' => ['nullable', 'array'],
            'builderSchema' => ['nullable'],
            'builder_schema' => ['nullable'],
            'isActive' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'templateType' => ['nullable', 'string'],
            'template_type' => ['nullable', 'string'],
        ]);

        $sizeId = isset($validated['sizeId']) ? (int) $validated['sizeId'] : (isset($validated['size_id']) ? (int) $validated['size_id'] : null);
        if ($sizeId !== null) {
            CourierLabelSize::query()->where('vendor_user_id', $vendorId)->findOrFail($sizeId);
        }

        $rawSchema = $validated['schema'] ?? $validated['builderSchema'] ?? $validated['builder_schema'] ?? (is_array($template->schema) ? $template->schema : []);
        if (is_string($rawSchema)) {
            $decoded = json_decode($rawSchema, true);
            $rawSchema = is_array($decoded) ? $decoded : [];
        }

        $labelType = strtolower((string) ($validated['labelType'] ?? $validated['label_type'] ?? $template->label_type ?? 'pod'));
        if (!$schemaRegistry->acceptsType($labelType)) {
            return response()->json(['message' => 'Unsupported label type.'], 422);
        }
        $schemaVersion = (string) ($validated['schemaVersion'] ?? $validated['schema_version'] ?? $template->schema_version ?? CourierLabelSchemaRegistry::VERSION_V1);
        $versionChannel = (string) ($validated['versionChannel'] ?? $validated['version_channel'] ?? $template->version_channel ?? 'stable');

        $template->update([
            'name' => (string) $validated['name'],
            'size_id' => $sizeId,
            'label_type' => $labelType,
            'schema_version' => $schemaVersion,
            'version_channel' => $versionChannel,
            'category_scope' => (string) ($validated['categoryScope'] ?? $validated['category_scope'] ?? $template->category_scope),
            'layout_preset' => (string) ($validated['layoutPreset'] ?? $template->layout_preset ?? $schemaRegistry->defaultLayoutByType($labelType)),
            'orientation' => (string) ($validated['orientation'] ?? $template->orientation),
            'schema' => array_replace($schemaRegistry->defaultSchemaForTemplate($labelType), is_array($rawSchema) ? $rawSchema : []),
            'is_active' => (bool) ($validated['isActive'] ?? $validated['is_active'] ?? $template->is_active),
            'updated_by_user_id' => $actorId ?: null,
            'published_at' => $versionChannel === 'stable' ? now() : $template->published_at,
            'archived_at' => $versionChannel === 'archived' ? now() : null,
        ]);

        if ($template->is_active) {
            $this->deactivateSiblingTemplates($template);
        }

        return response()->json([
            'template' => $this->transformTemplate($template->fresh()->load('size:id,name,width_mm,height_mm,is_active,is_system,metadata')),
        ]);
    }

    public function deleteTemplate(Request $request, CourierLabelTemplate $template)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);
        $this->assertTemplateOwnership($template, $vendorId);

        if ($template->is_system) {
            return response()->json(['message' => 'System template cannot be deleted.'], 403);
        }

        $template->delete();

        return response()->json(['ok' => true]);
    }

    public function preview(
        Request $request,
        CourierPodLabelService $service,
        CourierLabelRenderService $renderService,
        CourierLabelComplianceService $complianceService
    )
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);
        $this->ensureVendorLabelStudioBootstrap($vendorId, (int) optional($request->user())->id, $service);

        $validated = $request->validate([
            'templateId' => ['required', 'integer'],
            'sizeId' => ['nullable', 'integer'],
            'shipmentId' => ['nullable', 'integer'],
            'packageId' => ['nullable', 'integer'],
            'labelType' => ['nullable', 'string', 'max:60'],
        ]);

        $template = CourierLabelTemplate::query()
            ->with('size')
            ->where('vendor_user_id', $vendorId)
            ->findOrFail((int) $validated['templateId']);

        $size = null;
        if (!empty($validated['sizeId'])) {
            $size = CourierLabelSize::query()->where('vendor_user_id', $vendorId)->findOrFail((int) $validated['sizeId']);
        }
        if (!$size) {
            $size = $template->size ?: $service->makeFallbackSize();
        }

        $labelType = strtolower((string) ($validated['labelType'] ?? $template->label_type ?? 'pod'));
        $payload = $this->samplePayload($vendorId, $service, $labelType);

        if (!empty($validated['shipmentId'])) {
            $shipment = CourierShipment::query()
                ->with(['sender', 'recipient', 'senderAddress', 'recipientAddress', 'packages'])
                ->where('assigned_vendor_user_id', $vendorId)
                ->findOrFail((int) $validated['shipmentId']);

            $package = $shipment->packages->firstWhere('id', (int) ($validated['packageId'] ?? 0)) ?: $shipment->packages->first();

            if (!$package) {
                return response()->json(['message' => 'Shipment has no package available for preview.'], 422);
            }

            $payload = $service->buildPayload($shipment, $package, $vendorId, $labelType);
        }

        $hasShipmentContext = !empty($validated['shipmentId']);
        $compliance = $complianceService->validate($labelType, $payload, $shipment ?? null);
        if ($hasShipmentContext && !$compliance['ok']) {
            return response()->json([
                'message' => 'Compliance validation failed for preview.',
                'result' => $compliance,
            ], 422);
        }

        $html = $renderService->renderLabelHtml($payload, $template, $size);
        $pdf = $renderService->renderLabelsPdf([$html], $size, (string) $template->orientation);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="pod-label-preview.pdf"',
        ]);
    }

    public function storeJob(
        Request $request,
        CourierPodLabelService $service,
        CourierLabelRenderService $renderService,
        CourierLabelSchemaRegistry $schemaRegistry,
        CourierLabelComplianceService $complianceService
    )
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);
        $this->ensureVendorLabelStudioBootstrap($vendorId, $actorId, $service);

        $validated = $request->validate([
            'shipmentIds' => ['nullable', 'array'],
            'shipmentIds.*' => ['integer', 'min:1'],
            'packageIds' => ['nullable', 'array'],
            'packageIds.*' => ['integer', 'min:1'],
            'templateId' => ['nullable', 'integer'],
            'sizeId' => ['nullable', 'integer'],
            'labelType' => ['nullable', 'string', 'max:60'],
            'requestContext' => ['nullable', 'array'],
            'outputFormat' => ['nullable', 'string', Rule::in([CourierPodLabelService::OUTPUT_FORMAT_PDF])],
        ]);

        $shipmentIds = collect($validated['shipmentIds'] ?? [])->map(fn ($id) => (int) $id)->filter()->values();
        $packageIds = collect($validated['packageIds'] ?? [])->map(fn ($id) => (int) $id)->filter()->values();

        if ($shipmentIds->isEmpty() && $packageIds->isEmpty()) {
            return response()->json(['message' => 'Select at least one shipment or package.'], 422);
        }

        $packages = $this->loadPackages($vendorId, $shipmentIds->all(), $packageIds->all());
        if ($packages->isEmpty()) {
            return response()->json(['message' => 'No matching packages found.'], 404);
        }

        $eligible = $this->filterEligiblePackages($packages);
        if ($eligible['blocked'] > 0) {
            return response()->json([
                'message' => 'Some packages are not eligible for label printing until bookings are confirmed.',
                'blockedCount' => $eligible['blocked'],
            ], 422);
        }

        $packages = $eligible['packages'];
        $count = $packages->count();

        $policy = $this->resolveLabelSettings($vendorId)['policy'];
        if ($count > (int) $policy['hardLimit']) {
            return response()->json([
                'message' => 'Print request exceeds hard limit of ' . $policy['hardLimit'] . ' labels.',
            ], 422);
        }

        $requestedLabelType = strtolower((string) ($validated['labelType'] ?? ''));
        if ($requestedLabelType !== '' && !$schemaRegistry->acceptsType($requestedLabelType)) {
            return response()->json(['message' => 'Unsupported label type.'], 422);
        }

        $template = $this->resolveTemplate($vendorId, $validated['templateId'] ?? null, $packages, $service, $requestedLabelType ?: null);
        if (!$template) {
            return response()->json(['message' => 'No active template found for this selection.'], 422);
        }

        $labelType = strtolower((string) ($requestedLabelType ?: $template->label_type ?: 'pod'));
        $typedPolicy = is_array($policy['byType'][$labelType] ?? null) ? $policy['byType'][$labelType] : [];
        $syncThreshold = max(1, (int) ($typedPolicy['syncThreshold'] ?? $policy['syncThreshold']));
        $hardLimit = max($syncThreshold, (int) ($typedPolicy['hardLimit'] ?? $policy['hardLimit']));

        if ($count > $hardLimit) {
            return response()->json([
                'message' => 'Print request exceeds hard limit of ' . $hardLimit . ' labels for ' . $labelType . '.',
            ], 422);
        }

        $size = $this->resolveSize($vendorId, $validated['sizeId'] ?? null, $template, $service);

        $mode = $count > $syncThreshold ? CourierPodLabelService::MODE_ASYNC : CourierPodLabelService::MODE_SYNC;

        $job = CourierLabelPrintJob::create([
            'vendor_user_id' => $vendorId,
            'template_id' => $template->id,
            'size_id' => $size->id ?? null,
            'label_type' => $labelType,
            'status' => 'queued',
            'mode' => $mode,
            'output_format' => CourierPodLabelService::OUTPUT_FORMAT_PDF,
            'total_items' => $count,
            'generated_items' => 0,
            'failed_items' => 0,
            'request_context' => $validated['requestContext'] ?? null,
            'compliance_state' => $complianceService->policies()['mode'] ?? 'not_required',
            'requested_by_user_id' => $actorId ?: null,
        ]);

        $items = [];
        foreach ($packages->values() as $index => $package) {
            $items[] = [
                'print_job_id' => $job->id,
                'vendor_user_id' => $vendorId,
                'shipment_id' => (int) $package->shipment_id,
                'package_id' => (int) $package->id,
                'item_index' => $index + 1,
                'page_number' => $index + 1,
                'status' => 'queued',
                'validation_state' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        CourierLabelPrintItem::query()->insert($items);

        if ($mode === CourierPodLabelService::MODE_ASYNC) {
            CourierGeneratePodLabelJob::dispatch($job->id, $vendorId);

            return response()->json([
                'status' => 'queued',
                'jobId' => $job->id,
                'message' => 'Labels queued for generation.',
            ], 202);
        }

        $job->load([
            'template.size',
            'size',
            'items.shipment.sender',
            'items.shipment.recipient',
            'items.shipment.senderAddress',
            'items.shipment.recipientAddress',
            'items.package',
        ]);

        $pages = [];
        $failed = 0;

        foreach ($job->items as $item) {
            $shipment = $item->shipment;
            $package = $item->package;
            if (!$shipment || !$package) {
                $item->update([
                    'status' => 'failed',
                    'error_code' => 'missing_context',
                    'error_message' => 'Shipment/package not found.',
                ]);
                $failed++;
                continue;
            }

            $payload = $service->buildPayload($shipment, $package, $vendorId, $labelType);
            $complianceResult = $complianceService->validate($labelType, $payload, $shipment);
            if (!$complianceResult['ok']) {
                $item->update([
                    'status' => 'failed',
                    'validation_state' => 'invalid',
                    'compliance_errors' => $complianceResult['errors'],
                    'render_warnings' => $complianceResult['warnings'],
                    'error_code' => 'compliance_validation_failed',
                    'error_message' => 'Compliance validation failed for this item.',
                ]);
                $failed++;
                continue;
            }

            if ($schemaRegistry->requiresCompliance($labelType)) {
                $complianceService->logExternalSync(
                    $vendorId,
                    $labelType,
                    $payload,
                    ['status' => 'accepted', 'reference' => 'CUST-' . strtoupper(substr(md5((string) $shipment->id . '-' . $package->id), 0, 10))],
                    $job,
                    $item
                );
            }
            $item->update([
                'status' => 'generated',
                'validation_state' => 'valid',
                'compliance_errors' => [],
                'render_warnings' => $complianceResult['warnings'],
                'payload_snapshot' => $payload,
                'generated_at' => now(),
                'printed_at' => now(),
            ]);
            $pages[] = $renderService->renderLabelHtml($payload, $template, $size);
        }

        if (count($pages) === 0) {
            $job->update(['status' => 'failed']);
            return response()->json(['message' => 'No printable items generated.'], 422);
        }

        $pdf = $renderService->renderLabelsPdf($pages, $size, (string) $template->orientation);
        $stored = $service->storePdf($pdf, $vendorId, 'pod_labels');
        $service->markJobGenerated($job, $stored, $count, $failed);

        return response()->json([
            'status' => 'ready',
            'jobId' => $job->id,
            'url' => $stored['url'],
            'failedItems' => $failed,
        ]);
    }

    public function print(
        Request $request,
        CourierPodLabelService $service,
        CourierLabelRenderService $renderService,
        CourierLabelSchemaRegistry $schemaRegistry,
        CourierLabelComplianceService $complianceService
    )
    {
        return $this->storeJob($request, $service, $renderService, $schemaRegistry, $complianceService);
    }

    public function showJob(Request $request, CourierLabelPrintJob $job, CourierPodLabelService $service)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        if ((int) $job->vendor_user_id !== $vendorId) {
            abort(404);
        }

        $job->load('items:id,print_job_id,shipment_id,package_id,status,validation_state,error_code,error_message,compliance_errors,render_warnings,item_index,page_number,generated_at,printed_at');

        return response()->json([
            'job' => [
                'id' => $job->id,
                'status' => $job->status,
                'labelType' => (string) ($job->label_type ?? 'pod'),
                'complianceState' => (string) ($job->compliance_state ?? 'not_required'),
                'mode' => $job->mode,
                'totalItems' => (int) $job->total_items,
                'generatedItems' => (int) $job->generated_items,
                'failedItems' => (int) $job->failed_items,
                'requestContext' => is_array($job->request_context) ? $job->request_context : null,
                'url' => $service->buildJobArtifactUrl($job),
                'generatedAt' => optional($job->generated_at)->toIso8601String(),
                'printedAt' => optional($job->printed_at)->toIso8601String(),
                'items' => $job->items,
            ],
        ]);
    }

    private function resolveTemplate(
        int $vendorId,
        ?int $templateId,
        $packages,
        CourierPodLabelService $service,
        ?string $preferredLabelType = null
    ): ?CourierLabelTemplate
    {
        if ($templateId) {
            $template = CourierLabelTemplate::query()
                ->with('size')
                ->where('vendor_user_id', $vendorId)
                ->where('is_active', true)
                ->findOrFail($templateId);

            if ($preferredLabelType && strtolower((string) $template->label_type) !== strtolower($preferredLabelType)) {
                abort(422, 'Selected template does not match requested label type.');
            }

            $this->assertTemplateScopeMatchesPackages($template, $packages, $service);

            return $template;
        }

        $categories = $packages
            ->map(fn (CourierPackage $package) => $service->resolveCategory($package->shipment))
            ->unique()
            ->values();

        $scope = $categories->count() > 1 ? 'all' : (string) $categories->first();
        $labelType = $preferredLabelType ?: 'pod';

        return CourierLabelTemplate::query()
            ->with('size')
            ->where('vendor_user_id', $vendorId)
            ->where('is_active', true)
            ->where('label_type', $labelType)
            ->where(function (Builder $query) use ($scope) {
                $query->where('category_scope', 'all')
                    ->orWhere('category_scope', $scope);
            })
            ->orderByDesc('version_channel')
            ->orderByDesc('version')
            ->first();
    }

    private function resolveSize(int $vendorId, ?int $sizeId, ?CourierLabelTemplate $template, CourierPodLabelService $service): CourierLabelSize
    {
        if ($sizeId) {
            return CourierLabelSize::query()
                ->where('vendor_user_id', $vendorId)
                ->where('is_active', true)
                ->findOrFail($sizeId);
        }

        if ($template?->size) {
            return $template->size;
        }

        return $service->makeFallbackSize();
    }

    private function loadPackages(int $vendorId, array $shipmentIds, array $packageIds)
    {
        $query = CourierPackage::query()
            ->with([
                'shipment.sender',
                'shipment.recipient',
                'shipment.senderAddress',
                'shipment.recipientAddress',
            ])
            ->whereHas('shipment', function (Builder $builder) use ($vendorId) {
                $builder->where('assigned_vendor_user_id', $vendorId);
            });

        if (!empty($packageIds)) {
            $query->whereIn('id', $packageIds);
        }

        if (!empty($shipmentIds)) {
            $query->whereIn('shipment_id', $shipmentIds);
        }

        $packages = $query->get();

        // Default behavior: when printing by shipment selection, print one label per shipment.
        if (empty($packageIds) && !empty($shipmentIds)) {
            return $packages
                ->sortBy('id')
                ->groupBy('shipment_id')
                ->map(fn ($group) => $group->first())
                ->values();
        }

        return $packages;
    }

    private function filterEligiblePackages($packages): array
    {
        $allowedStatuses = [
            CourierShipment::STATUS_CONFIRMED,
            CourierShipment::STATUS_IN_TRANSIT,
            CourierShipment::STATUS_DELIVERED,
        ];

        $blocked = 0;
        $eligible = $packages->filter(function (CourierPackage $package) use (&$blocked, $allowedStatuses) {
            $status = (string) ($package->shipment?->status ?? '');
            if (!in_array($status, $allowedStatuses, true)) {
                $blocked++;
                return false;
            }

            return true;
        });

        return ['packages' => $eligible->values(), 'blocked' => $blocked];
    }

    private function resolveLabelSettings(int $vendorId): array
    {
        $record = VendorCourierSetting::query()->where('vendor_user_id', $vendorId)->first();
        $settings = is_array($record?->settings) ? $record->settings : [];
        $labels = is_array($settings['labels'] ?? null) ? $settings['labels'] : [];

        $defaults = is_array($labels['defaults'] ?? null) ? $labels['defaults'] : [];
        $policy = is_array($labels['printPolicy'] ?? null) ? $labels['printPolicy'] : [];

        return [
            'defaults' => [
                'domestic' => [
                    'templateId' => isset($defaults['domestic']['templateId']) ? (int) $defaults['domestic']['templateId'] : null,
                    'sizeId' => isset($defaults['domestic']['sizeId']) ? (int) $defaults['domestic']['sizeId'] : null,
                ],
                'international' => [
                    'templateId' => isset($defaults['international']['templateId']) ? (int) $defaults['international']['templateId'] : null,
                    'sizeId' => isset($defaults['international']['sizeId']) ? (int) $defaults['international']['sizeId'] : null,
                ],
            ],
            'policy' => [
                'syncThreshold' => max(1, (int) ($policy['syncThreshold'] ?? $policy['bulkAsyncThreshold'] ?? 25)),
                'hardLimit' => max(25, (int) ($policy['hardLimit'] ?? $policy['bulkHardLimit'] ?? 500)),
                'byType' => is_array($policy['byType'] ?? null) ? $policy['byType'] : [],
            ],
        ];
    }

    private function assertApprovedRegistration(int $vendorId): void
    {
        $ok = VendorServiceRegistration::query()
            ->where('user_id', $vendorId)
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function (Builder $query) {
                $query->where('slug', 'courier-services');
            })
            ->exists();

        if (!$ok) {
            abort(403, 'Courier service registration approval is required to manage labels.');
        }
    }

    private function assertTemplateOwnership(CourierLabelTemplate $template, int $vendorId): void
    {
        if ((int) $template->vendor_user_id !== $vendorId) {
            abort(404);
        }
    }

    private function deactivateSiblingTemplates(CourierLabelTemplate $template): void
    {
        CourierLabelTemplate::query()
            ->where('vendor_user_id', $template->vendor_user_id)
            ->where('id', '!=', $template->id)
            ->where('label_type', $template->label_type)
            ->where('category_scope', $template->category_scope)
            ->where('size_id', $template->size_id)
            ->where('layout_preset', $template->layout_preset)
            ->where('version_channel', $template->version_channel)
            ->update(['is_active' => false]);
    }

    private function ensureVendorLabelStudioBootstrap(int $vendorId, int $actorId = 0, ?CourierPodLabelService $service = null): void
    {
        $service ??= app(CourierPodLabelService::class);
        $schemaRegistry = app(CourierLabelSchemaRegistry::class);

        $sizes = CourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->get()
            ->keyBy(fn (CourierLabelSize $size) => strtolower((string) $size->name));

        $halfA4 = $sizes->get('half a4');
        if (!$halfA4) {
            $halfA4 = CourierLabelSize::query()->create([
                'vendor_user_id' => $vendorId,
                'name' => 'Half A4',
                'width_mm' => 148.0,
                'height_mm' => 210.0,
                'preset_code' => 'half_a4',
                'paper_class' => 'a4',
                'dpi_profile' => '300dpi',
                'is_active' => true,
                'is_system' => true,
                'created_by_user_id' => $actorId ?: null,
                'updated_by_user_id' => $actorId ?: null,
                'metadata' => ['unit' => 'mm', 'preset' => 'half_a4'],
            ]);
        }

        $thermal = $sizes->get('thermal 4x6');
        if (!$thermal) {
            $thermal = CourierLabelSize::query()->create([
                'vendor_user_id' => $vendorId,
                'name' => 'Thermal 4x6',
                'width_mm' => 101.6,
                'height_mm' => 152.4,
                'preset_code' => 'thermal_4x6',
                'paper_class' => 'thermal',
                'dpi_profile' => '203dpi',
                'is_active' => true,
                'is_system' => true,
                'created_by_user_id' => $actorId ?: null,
                'updated_by_user_id' => $actorId ?: null,
                'metadata' => ['unit' => 'mm', 'preset' => 'thermal_4x6'],
            ]);
        }

        $ensureTemplate = function (string $labelType, CourierLabelSize $size, bool $active) use ($vendorId, $actorId, $service, $schemaRegistry): CourierLabelTemplate {
            $name = strtoupper(str_replace('_', ' ', $labelType)) . ' - ' . $size->name;
            $template = CourierLabelTemplate::query()
                ->where('vendor_user_id', $vendorId)
                ->where('label_type', $labelType)
                ->where('category_scope', 'all')
                ->where('size_id', $size->id)
                ->where('version_channel', 'stable')
                ->orderByDesc('version')
                ->first();

            if ($template) {
                if (!$template->is_active && $active) {
                    $template->update([
                        'is_active' => true,
                        'updated_by_user_id' => $actorId ?: null,
                    ]);
                    $this->deactivateSiblingTemplates($template->fresh());
                }

                return $template;
            }

            // Unique key is vendor + name + version, so version must be allocated
            // against all channels/rows sharing the same name.
            $nextVersion = (int) (CourierLabelTemplate::query()
                ->where('vendor_user_id', $vendorId)
                ->where('name', $name)
                ->max('version') ?? 0) + 1;

            $template = CourierLabelTemplate::query()->create([
                'vendor_user_id' => $vendorId,
                'size_id' => $size->id,
                'name' => $name,
                'label_type' => $labelType,
                'schema_version' => CourierLabelSchemaRegistry::VERSION_V1,
                'version_channel' => 'stable',
                'category_scope' => 'all',
                'layout_preset' => $schemaRegistry->defaultLayoutByType($labelType),
                'orientation' => 'portrait',
                'version' => $nextVersion,
                'schema' => $schemaRegistry->defaultSchemaForTemplate($labelType),
                'is_active' => $active,
                'is_system' => true,
                'created_by_user_id' => $actorId ?: null,
                'updated_by_user_id' => $actorId ?: null,
                'metadata' => ['preset' => 'system_recommended'],
                'published_at' => now(),
            ]);

            if ($template->is_active) {
                $this->deactivateSiblingTemplates($template);
            }

            return $template;
        };

        $defaultTemplateByType = [];
        foreach ($schemaRegistry->labelTypeKeys() as $labelType) {
            $template = $ensureTemplate($labelType, $halfA4, true);
            $defaultTemplateByType[$labelType] = (int) $template->id;
            $ensureTemplate($labelType, $thermal, false);
        }

        $setting = VendorCourierSetting::query()->firstOrNew(['vendor_user_id' => $vendorId]);
        $settings = is_array($setting->settings) ? $setting->settings : [];
        $labels = is_array($settings['labels'] ?? null) ? $settings['labels'] : [];
        $defaults = is_array($labels['defaults'] ?? null) ? $labels['defaults'] : [];
        $defaultTemplates = is_array($labels['defaultTemplates'] ?? null) ? $labels['defaultTemplates'] : [];
        $policy = is_array($labels['printPolicy'] ?? null) ? $labels['printPolicy'] : [];
        $basePolicy = $service->defaultPolicy();

        foreach (['domestic', 'international'] as $categoryKey) {
            $row = is_array($defaults[$categoryKey] ?? null) ? $defaults[$categoryKey] : [];
            if (!isset($row['templateId']) || !$row['templateId']) {
                $row['templateId'] = (int) ($defaultTemplateByType['pod'] ?? 0);
            }
            if (!isset($row['sizeId']) || !$row['sizeId']) {
                $row['sizeId'] = (int) $halfA4->id;
            }
            $defaults[$categoryKey] = $row;
        }

        foreach ($defaultTemplateByType as $labelType => $templateId) {
            $defaultTemplates[$labelType] = array_replace([
                'templateId' => null,
                'sizeId' => null,
            ], is_array($defaultTemplates[$labelType] ?? null) ? $defaultTemplates[$labelType] : []);
            if (!$defaultTemplates[$labelType]['templateId']) {
                $defaultTemplates[$labelType]['templateId'] = (int) $templateId;
            }
            if (!$defaultTemplates[$labelType]['sizeId']) {
                $defaultTemplates[$labelType]['sizeId'] = (int) $halfA4->id;
            }
        }

        $policy['syncThreshold'] = max(1, (int) ($policy['syncThreshold'] ?? $policy['bulkAsyncThreshold'] ?? $basePolicy['syncThreshold']));
        $policy['hardLimit'] = max($policy['syncThreshold'], (int) ($policy['hardLimit'] ?? $policy['bulkHardLimit'] ?? $basePolicy['hardLimit']));
        $policy['bulkAsyncThreshold'] = $policy['syncThreshold'];
        $policy['bulkHardLimit'] = $policy['hardLimit'];
        $policy['allowCustomSizes'] = (bool) ($policy['allowCustomSizes'] ?? true);
        $policy['allowTemplateUpload'] = (bool) ($policy['allowTemplateUpload'] ?? true);
        $policy['allowHtmlTemplates'] = false;
        $policy['allowPdfBackground'] = false;
        $policy['byType'] = is_array($policy['byType'] ?? null) ? $policy['byType'] : [];
        foreach ($schemaRegistry->labelTypeKeys() as $typeKey) {
            $existing = is_array($policy['byType'][$typeKey] ?? null) ? $policy['byType'][$typeKey] : [];
            $policy['byType'][$typeKey] = [
                'syncThreshold' => max(1, (int) ($existing['syncThreshold'] ?? $policy['syncThreshold'])),
                'hardLimit' => max(
                    max(1, (int) ($existing['syncThreshold'] ?? $policy['syncThreshold'])),
                    (int) ($existing['hardLimit'] ?? $policy['hardLimit'])
                ),
            ];
        }

        $labels['defaults'] = $defaults;
        $labels['defaultTemplates'] = $defaultTemplates;
        $labels['printPolicy'] = $policy;
        $settings['labels'] = $labels;

        $setting->settings = $settings;
        $setting->save();
    }

    private function availableTokens(): array
    {
        return [
            'labelType',
            'trackingNumber',
            'reference',
            'orderNumber',
            'serviceLevel',
            'issuedDate',
            'codAmount',
            'currencyCode',
            'weightKg',
            'district',
            'nearestCity',
            'description',
            'sender.name',
            'sender.phone',
            'sender.address',
            'recipient.name',
            'recipient.phonePrimary',
            'recipient.phoneSecondary',
            'recipient.address',
            'recipient.nic',
            'pod.receiverName',
            'pod.receiverNic',
            'routeCode',
            'destinationHub',
            'batchNumber',
            'bagCount',
            'pickupWindow',
            'returnReason',
            'handlingMarks',
            'invoice.number',
            'invoice.date',
            'invoice.value',
            'commodity.description',
            'commodity.weightKg',
            'commodity.value',
            'shipper.identity',
            'receiver.identity',
            'brand.name',
            'brand.address',
            'brand.contactLine',
        ];
    }

    private function samplePayload(int $vendorId, CourierPodLabelService $service, string $labelType = 'pod'): array
    {
        $shipment = new CourierShipment([
            'reference' => 'CR-SAMPLE01',
            'order_number' => 'ORD-1001',
            'service_level' => 'Express',
            'destination_district' => 'Colombo',
            'destination_nearest_city' => 'Pita Kotte',
            'recipient_alt_phone' => '+94 77 000 1111',
            'recipient_nic' => '901234567V',
            'pod_receiver_name' => '',
            'pod_receiver_nic' => '',
            'is_cod_enabled' => true,
            'cod_requested_amount' => 1250,
            'currency_code' => 'LKR',
        ]);

        $shipment->setRelation('sender', (object) ['name' => 'Sender Name', 'phone' => '+94 11 123 4567']);
        $shipment->setRelation('recipient', (object) ['name' => 'Recipient Name', 'phone' => '+94 77 888 9999']);
        $shipment->setRelation('senderAddress', (object) [
            'line1' => 'No. 25, Epitamulla Road',
            'line2' => '',
            'city' => 'Pita Kotte',
            'state' => '',
            'postal_code' => '10100',
            'country' => 'LK',
        ]);
        $shipment->setRelation('recipientAddress', (object) [
            'line1' => 'No. 10, Main Street',
            'line2' => '',
            'city' => 'Kandy',
            'state' => '',
            'postal_code' => '20000',
            'country' => 'LK',
        ]);

        $package = new CourierPackage([
            'weight_kg' => 2.3,
            'description' => 'Documents / small parcel',
        ]);

        return $service->buildPayload($shipment, $package, $vendorId, $labelType);
    }

    private function assertTemplateScopeMatchesPackages(CourierLabelTemplate $template, $packages, CourierPodLabelService $service): void
    {
        if ($template->category_scope === 'all') {
            return;
        }

        $categories = $packages
            ->map(fn (CourierPackage $package) => $service->resolveCategory($package->shipment))
            ->unique()
            ->values();

        if ($categories->count() > 1 || (string) $categories->first() !== (string) $template->category_scope) {
            abort(422, 'Selected template does not match shipment category.');
        }
    }

    private function resolveVendorId(Request $request): int
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        if ($vendorId > 0) {
            return $vendorId;
        }

        return (int) optional($request->user())->id;
    }

    private function defaultTemplateMap($templates): array
    {
        $rows = [];
        foreach (($templates ?? []) as $template) {
            $labelType = strtolower((string) ($template['label_type'] ?? 'pod'));
            if (!isset($rows[$labelType]) && ($template['is_active'] ?? false)) {
                $rows[$labelType] = [
                    'templateId' => (int) $template['id'],
                    'sizeId' => isset($template['size_id']) ? (int) $template['size_id'] : null,
                ];
            }
        }

        return $rows;
    }

    private function transformSize(CourierLabelSize $size): array
    {
        $metadata = is_array($size->metadata) ? $size->metadata : [];

        return [
            'id' => $size->id,
            'name' => $size->name,
            'width_mm' => (float) $size->width_mm,
            'height_mm' => (float) $size->height_mm,
            'widthMm' => (float) $size->width_mm,
            'heightMm' => (float) $size->height_mm,
            'unit' => (string) ($metadata['unit'] ?? 'mm'),
            'preset_code' => $size->preset_code,
            'presetCode' => $size->preset_code,
            'paper_class' => $size->paper_class,
            'paperClass' => $size->paper_class,
            'dpi_profile' => $size->dpi_profile,
            'dpiProfile' => $size->dpi_profile,
            'is_active' => (bool) $size->is_active,
            'isActive' => (bool) $size->is_active,
            'is_system' => (bool) $size->is_system,
            'isSystem' => (bool) $size->is_system,
            'metadata' => $metadata,
        ];
    }

    private function transformTemplate(CourierLabelTemplate $template): array
    {
        return [
            'id' => $template->id,
            'name' => $template->name,
            'label_type' => (string) ($template->label_type ?: 'pod'),
            'labelType' => (string) ($template->label_type ?: 'pod'),
            'schema_version' => (string) ($template->schema_version ?: CourierLabelSchemaRegistry::VERSION_V1),
            'schemaVersion' => (string) ($template->schema_version ?: CourierLabelSchemaRegistry::VERSION_V1),
            'version_channel' => (string) ($template->version_channel ?: 'stable'),
            'versionChannel' => (string) ($template->version_channel ?: 'stable'),
            'size_id' => $template->size_id,
            'sizeId' => $template->size_id,
            'category_scope' => $template->category_scope,
            'categoryScope' => $template->category_scope,
            'layout_preset' => $template->layout_preset,
            'layoutPreset' => $template->layout_preset,
            'orientation' => $template->orientation,
            'schema' => is_array($template->schema) ? $template->schema : [],
            'builder_schema' => is_array($template->schema) ? $template->schema : [],
            'template_type' => 'builder',
            'version' => (int) $template->version,
            'published_at' => optional($template->published_at)->toIso8601String(),
            'publishedAt' => optional($template->published_at)->toIso8601String(),
            'archived_at' => optional($template->archived_at)->toIso8601String(),
            'archivedAt' => optional($template->archived_at)->toIso8601String(),
            'is_active' => (bool) $template->is_active,
            'isActive' => (bool) $template->is_active,
            'is_system' => (bool) $template->is_system,
            'isSystem' => (bool) $template->is_system,
            'size' => $template->size ? $this->transformSize($template->size) : null,
        ];
    }
}
