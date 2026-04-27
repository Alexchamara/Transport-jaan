<?php

namespace App\Services\Courier;

use Illuminate\Support\Arr;

class CourierNotificationPreferenceService
{
    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_IN_APP = 'in_app';

    public const AUDIENCE_CLIENT = 'client';
    public const AUDIENCE_INTERNAL = 'internal';

    private const CHANNEL_SETTINGS_EMAIL = 'email';
    private const CHANNEL_SETTINGS_IN_APP = 'inApp';

    /**
     * @return array<string, string>
     */
    public function legacyToggleMap(): array
    {
        return [
            'shipment_placed' => 'notifyClientShipmentPlaced',
            'booking_confirmed' => 'notifyClientBookingConfirmed',
            'booking_cancelled' => 'notifyClientBookingCancelled',
            'tracking_picked_up' => 'notifyClientPickup',
            'tracking_out_for_delivery' => 'notifyClientOutForDelivery',
            'tracking_delivered' => 'notifyClientDelivered',
            'payment_paid' => 'notifyClientPaymentPaid',
            'payment_failed' => 'notifyClientPaymentFailed',
            'payment_cancelled' => 'notifyClientPaymentCancelled',
            'internal_exception' => 'notifyInternalException',
            'internal_sla_risk' => 'notifyInternalSlaRisk',
        ];
    }

    /**
     * @return array<string, bool>
     */
    public function defaultLegacyFlags(): array
    {
        return [
            'notifyClientShipmentPlaced' => true,
            'notifyClientBookingConfirmed' => true,
            'notifyClientBookingCancelled' => true,
            'notifyClientPickup' => true,
            'notifyClientOutForDelivery' => true,
            'notifyClientDelivered' => true,
            'notifyClientPaymentPaid' => true,
            'notifyClientPaymentFailed' => true,
            'notifyClientPaymentCancelled' => true,
            'notifyInternalException' => true,
            'notifyInternalSlaRisk' => true,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function defaultSettings(): array
    {
        $defaultFromAddress = mb_strtolower(trim((string) config('mail.from.address', 'no-reply@example.com')));
        $defaultFromName = trim((string) config('mail.from.name', 'Transport Jaan Courier')) ?: 'Transport Jaan Courier';

        $base = [
            'version' => 2,
            'channels' => [
                self::CHANNEL_SETTINGS_EMAIL => ['enabled' => true],
                self::CHANNEL_SETTINGS_IN_APP => ['enabled' => true],
            ],
            'clientRecipients' => [
                'requester' => true,
                'sender' => true,
                'recipient' => true,
                'extraEmails' => [],
            ],
            'internalRecipients' => [
                'roleNames' => ['ops_lead'],
                'userIds' => [],
                'extraEmails' => [],
            ],
            'eventMatrix' => [
                'shipment_placed' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => false],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => false, self::CHANNEL_SETTINGS_IN_APP => false],
                ],
                'booking_confirmed' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => false],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => false, self::CHANNEL_SETTINGS_IN_APP => false],
                ],
                'booking_cancelled' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                ],
                'tracking_picked_up' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => false, self::CHANNEL_SETTINGS_IN_APP => false],
                ],
                'tracking_out_for_delivery' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => false, self::CHANNEL_SETTINGS_IN_APP => false],
                ],
                'tracking_delivered' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => false, self::CHANNEL_SETTINGS_IN_APP => false],
                ],
                'payment_paid' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => false, self::CHANNEL_SETTINGS_IN_APP => false],
                ],
                'payment_failed' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                ],
                'payment_cancelled' => [
                    self::AUDIENCE_CLIENT => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                ],
                'internal_exception' => [
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                ],
                'internal_sla_risk' => [
                    self::AUDIENCE_INTERNAL => [self::CHANNEL_SETTINGS_EMAIL => true, self::CHANNEL_SETTINGS_IN_APP => true],
                ],
            ],
            'delivery' => [
                'quietHours' => [
                    'enabled' => false,
                    'start' => '22:00',
                    'end' => '06:00',
                    'timezone' => 'Asia/Colombo',
                ],
                'digest' => [
                    'enabled' => false,
                    'frequency' => 'daily',
                    'time' => '09:00',
                    'timezone' => 'Asia/Colombo',
                ],
            ],
            'deliverability' => [
                'fromName' => $defaultFromName,
                'fromEmail' => $defaultFromAddress,
                'replyTo' => $defaultFromAddress,
                'respectSuppression' => true,
            ],
        ];

        return array_merge($this->defaultLegacyFlags(), $base);
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    public function normalize(array $settings): array
    {
        $defaults = $this->defaultSettings();
        $legacy = $this->extractLegacyFlags($settings);

        $channelsInput = is_array($settings['channels'] ?? null) ? $settings['channels'] : [];
        $channels = [
            self::CHANNEL_SETTINGS_EMAIL => [
                'enabled' => (bool) Arr::get($channelsInput, self::CHANNEL_SETTINGS_EMAIL . '.enabled', Arr::get($defaults, 'channels.email.enabled', true)),
            ],
            self::CHANNEL_SETTINGS_IN_APP => [
                'enabled' => (bool) Arr::get($channelsInput, self::CHANNEL_SETTINGS_IN_APP . '.enabled', Arr::get($defaults, 'channels.inApp.enabled', true)),
            ],
        ];

        $clientRecipientsInput = is_array($settings['clientRecipients'] ?? null) ? $settings['clientRecipients'] : [];
        $clientRecipients = [
            'requester' => (bool) Arr::get($clientRecipientsInput, 'requester', Arr::get($defaults, 'clientRecipients.requester', true)),
            'sender' => (bool) Arr::get($clientRecipientsInput, 'sender', Arr::get($defaults, 'clientRecipients.sender', true)),
            'recipient' => (bool) Arr::get($clientRecipientsInput, 'recipient', Arr::get($defaults, 'clientRecipients.recipient', true)),
            'extraEmails' => $this->normalizeEmailList(Arr::get($clientRecipientsInput, 'extraEmails', [])),
        ];

        $internalRecipientsInput = is_array($settings['internalRecipients'] ?? null) ? $settings['internalRecipients'] : [];
        $internalRecipients = [
            'roleNames' => $this->normalizeRoleNames(Arr::get($internalRecipientsInput, 'roleNames', Arr::get($defaults, 'internalRecipients.roleNames', []))),
            'userIds' => $this->normalizeUserIds(Arr::get($internalRecipientsInput, 'userIds', [])),
            'extraEmails' => $this->normalizeEmailList(Arr::get($internalRecipientsInput, 'extraEmails', [])),
        ];

        $eventMatrixInput = is_array($settings['eventMatrix'] ?? null) ? $settings['eventMatrix'] : null;
        $eventMatrix = $this->normalizeEventMatrix($eventMatrixInput, $legacy);

        $quietInput = is_array(Arr::get($settings, 'delivery.quietHours')) ? Arr::get($settings, 'delivery.quietHours') : [];
        $digestInput = is_array(Arr::get($settings, 'delivery.digest')) ? Arr::get($settings, 'delivery.digest') : [];
        $delivery = [
            'quietHours' => [
                'enabled' => (bool) Arr::get($quietInput, 'enabled', Arr::get($defaults, 'delivery.quietHours.enabled', false)),
                'start' => $this->normalizeTimeValue((string) Arr::get($quietInput, 'start', Arr::get($defaults, 'delivery.quietHours.start', '22:00')), '22:00'),
                'end' => $this->normalizeTimeValue((string) Arr::get($quietInput, 'end', Arr::get($defaults, 'delivery.quietHours.end', '06:00')), '06:00'),
                'timezone' => trim((string) Arr::get($quietInput, 'timezone', Arr::get($defaults, 'delivery.quietHours.timezone', 'Asia/Colombo'))) ?: 'Asia/Colombo',
            ],
            'digest' => [
                'enabled' => (bool) Arr::get($digestInput, 'enabled', Arr::get($defaults, 'delivery.digest.enabled', false)),
                'frequency' => $this->normalizeDigestFrequency((string) Arr::get($digestInput, 'frequency', Arr::get($defaults, 'delivery.digest.frequency', 'daily'))),
                'time' => $this->normalizeTimeValue((string) Arr::get($digestInput, 'time', Arr::get($defaults, 'delivery.digest.time', '09:00')), '09:00'),
                'timezone' => trim((string) Arr::get($digestInput, 'timezone', Arr::get($defaults, 'delivery.digest.timezone', 'Asia/Colombo'))) ?: 'Asia/Colombo',
            ],
        ];

        $deliverabilityInput = is_array($settings['deliverability'] ?? null) ? $settings['deliverability'] : [];
        $defaultFromAddress = (string) config('mail.from.address', 'no-reply@example.com');
        $defaultFromName = (string) config('mail.from.name', 'Transport Jaan Courier');
        $fromEmail = $this->normalizeSingleEmail((string) Arr::get($deliverabilityInput, 'fromEmail', Arr::get($defaults, 'deliverability.fromEmail', $defaultFromAddress)));
        if ($fromEmail === '') {
            $fromEmail = $defaultFromAddress;
        }
        $replyTo = $this->normalizeSingleEmail((string) Arr::get($deliverabilityInput, 'replyTo', Arr::get($defaults, 'deliverability.replyTo', $fromEmail)));
        if ($replyTo === '') {
            $replyTo = $fromEmail;
        }
        $deliverability = [
            'fromName' => trim((string) Arr::get($deliverabilityInput, 'fromName', Arr::get($defaults, 'deliverability.fromName', $defaultFromName))) ?: $defaultFromName,
            'fromEmail' => $fromEmail,
            'replyTo' => $replyTo,
            'respectSuppression' => (bool) Arr::get($deliverabilityInput, 'respectSuppression', Arr::get($defaults, 'deliverability.respectSuppression', true)),
        ];

        $normalized = [
            'version' => 2,
            'channels' => $channels,
            'clientRecipients' => $clientRecipients,
            'internalRecipients' => $internalRecipients,
            'eventMatrix' => $eventMatrix,
            'delivery' => $delivery,
            'deliverability' => $deliverability,
        ];

        return array_merge($this->toLegacyFlags($normalized), $normalized);
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, bool>
     */
    public function toLegacyFlags(array $settings): array
    {
        $matrix = is_array($settings['eventMatrix'] ?? null) ? $settings['eventMatrix'] : [];
        $map = $this->legacyToggleMap();
        $legacy = $this->defaultLegacyFlags();

        foreach ($map as $eventType => $toggleKey) {
            $audience = str_starts_with($toggleKey, 'notifyInternal')
                ? self::AUDIENCE_INTERNAL
                : self::AUDIENCE_CLIENT;

            $legacy[$toggleKey] = (bool) Arr::get($matrix, $eventType . '.' . $audience . '.' . self::CHANNEL_SETTINGS_EMAIL, true);
        }

        return $legacy;
    }

    public function isV2EnabledForVendor(?int $vendorId): bool
    {
        if (!(bool) config('courier.notifications_v2.enabled', false)) {
            return false;
        }

        $mode = strtolower((string) config('courier.notifications_v2.rollout.mode', 'all'));
        if ($mode === 'all') {
            return true;
        }

        $vendorId = (int) ($vendorId ?? 0);
        if ($vendorId <= 0) {
            return false;
        }

        $canaryIds = $this->resolveCanaryVendorIds();
        $percentage = max(0, min(100, (int) config('courier.notifications_v2.rollout.percentage', 0)));
        $inCanary = in_array($vendorId, $canaryIds, true);
        $inPercentage = ($vendorId % 100) < $percentage;

        return match ($mode) {
            'canary' => $inCanary,
            'percentage' => $inPercentage,
            'canary_or_percentage' => $inCanary || $inPercentage,
            default => false,
        };
    }

    /**
     * @param array<string, mixed> $settings
     */
    public function isEventChannelEnabled(array $settings, string $eventType, string $audience, string $channel): bool
    {
        $settingsChannel = $channel === self::CHANNEL_IN_APP ? self::CHANNEL_SETTINGS_IN_APP : self::CHANNEL_SETTINGS_EMAIL;
        if (!(bool) Arr::get($settings, 'channels.' . $settingsChannel . '.enabled', true)) {
            return false;
        }

        return (bool) Arr::get($settings, 'eventMatrix.' . $eventType . '.' . $audience . '.' . $settingsChannel, false);
    }

    public function eventSupportsAudience(string $eventType, string $audience): bool
    {
        $defaults = $this->defaultSettings()['eventMatrix'] ?? [];
        return is_array($defaults[$eventType] ?? null) && array_key_exists($audience, $defaults[$eventType]);
    }

    /**
     * @return array<int, string>
     */
    public function eventTypes(): array
    {
        return array_keys($this->defaultSettings()['eventMatrix'] ?? []);
    }

    /**
     * @param array<string, mixed> $settings
     */
    public function legacyFlagEnabled(array $settings, string $eventType): bool
    {
        $key = $this->legacyToggleMap()[$eventType] ?? null;
        if (!$key) {
            return true;
        }

        $defaults = $this->defaultLegacyFlags();
        return (bool) ($settings[$key] ?? $defaults[$key] ?? true);
    }

    /**
     * @return array<int, int>
     */
    private function resolveCanaryVendorIds(): array
    {
        $configured = config('courier.notifications_v2.rollout.canary_vendor_ids', []);
        $values = [];

        if (is_string($configured)) {
            $values = array_map('trim', explode(',', $configured));
        } elseif (is_array($configured)) {
            $values = $configured;
        }

        return array_values(array_unique(array_filter(array_map(
            static fn ($value) => (int) $value,
            $values
        ), static fn ($value) => $value > 0)));
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, bool>
     */
    private function extractLegacyFlags(array $settings): array
    {
        $defaults = $this->defaultLegacyFlags();
        $flags = [];
        foreach (array_keys($defaults) as $key) {
            $flags[$key] = (bool) ($settings[$key] ?? $defaults[$key]);
        }

        return $flags;
    }

    /**
     * @param array<string, mixed>|null $eventMatrixInput
     * @param array<string, bool> $legacyFlags
     * @return array<string, mixed>
     */
    private function normalizeEventMatrix(?array $eventMatrixInput, array $legacyFlags): array
    {
        $defaults = $this->defaultSettings()['eventMatrix'] ?? [];
        $matrix = $defaults;

        if (is_array($eventMatrixInput)) {
            foreach ($defaults as $eventType => $audienceMap) {
                if (!is_array($audienceMap)) {
                    continue;
                }

                foreach ($audienceMap as $audience => $channelMap) {
                    if (!is_array($channelMap)) {
                        continue;
                    }

                    foreach ($channelMap as $channel => $defaultValue) {
                        $matrix[$eventType][$audience][$channel] = (bool) Arr::get(
                            $eventMatrixInput,
                            $eventType . '.' . $audience . '.' . $channel,
                            $defaultValue
                        );
                    }
                }
            }
        } else {
            foreach ($this->legacyToggleMap() as $eventType => $toggleKey) {
                $audience = str_starts_with($toggleKey, 'notifyInternal')
                    ? self::AUDIENCE_INTERNAL
                    : self::AUDIENCE_CLIENT;
                $matrix[$eventType][$audience][self::CHANNEL_SETTINGS_EMAIL] = (bool) ($legacyFlags[$toggleKey] ?? true);
            }
        }

        return $matrix;
    }

    /**
     * @param mixed $value
     * @return array<int, string>
     */
    private function normalizeEmailList(mixed $value): array
    {
        $items = is_array($value) ? $value : [];
        $emails = array_map(
            fn ($item) => $this->normalizeSingleEmail((string) $item),
            $items
        );
        $emails = array_values(array_unique(array_filter($emails, static fn ($email) => $email !== '')));

        return $emails;
    }

    private function normalizeSingleEmail(string $value): string
    {
        $email = mb_strtolower(trim($value));
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';
    }

    /**
     * @param mixed $value
     * @return array<int, string>
     */
    private function normalizeRoleNames(mixed $value): array
    {
        $items = is_array($value) ? $value : [];
        $roles = array_values(array_unique(array_filter(array_map(static function ($item) {
            $role = trim((string) $item);
            if ($role === '') {
                return '';
            }

            return preg_replace('/\s+/', '_', mb_strtolower($role)) ?: '';
        }, $items), static fn ($item) => $item !== '')));

        return $roles;
    }

    /**
     * @param mixed $value
     * @return array<int, int>
     */
    private function normalizeUserIds(mixed $value): array
    {
        $items = is_array($value) ? $value : [];
        return array_values(array_unique(array_filter(array_map(
            static fn ($item) => (int) $item,
            $items
        ), static fn ($item) => $item > 0)));
    }

    private function normalizeTimeValue(string $value, string $fallback): string
    {
        return preg_match('/^(2[0-3]|[01]\d):([0-5]\d)$/', $value) === 1
            ? $value
            : $fallback;
    }

    private function normalizeDigestFrequency(string $value): string
    {
        $value = mb_strtolower(trim($value));
        return in_array($value, ['daily', 'weekly'], true) ? $value : 'daily';
    }
}
