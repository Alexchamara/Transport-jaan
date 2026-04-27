<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Show notifications page
     */
    public function page()
    {
        $user = Auth::user();
        $unreadNotifications = Notification::where('user_id', $user->id)->unread()->count();

        return Inertia::render('Web/home/vendors/Notifications', [
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Get all notifications for the authenticated vendor
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $limit = max(1, min(100, (int) $request->integer('limit', 30)));

        $notifications = Notification::where('user_id', $user->id)
            ->with('booking.client', 'booking.vehicle')
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($notification) {
                $booking = $notification->booking;
                $data = $notification->data ?? [];
                $classification = $this->classifyType((string) $notification->type);
                $actionUrl = $this->resolveActionUrl($notification);

                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'category' => $classification['category'],
                    'severity' => $classification['severity'],
                    'title' => $this->resolveTitle($notification),
                    'message' => $this->formatMessage($notification),
                    'booking_id' => $notification->booking_id,
                    'client_name' => $booking?->client?->name ?? 'Unknown Client',
                    'vehicle_name' => $booking ? ($booking->vehicle->make ?? '') . ' ' . ($booking->vehicle->model ?? '') : '',
                    'is_read' => !is_null($notification->read_at),
                    'read_at' => optional($notification->read_at)->toIso8601String(),
                    'created_at' => $notification->created_at->diffForHumans(),
                    'timestamp' => $notification->created_at->toDateTimeString(),
                    'created_at_iso' => optional($notification->created_at)->toIso8601String(),
                    'action_url' => $actionUrl,
                    'data' => is_array($data) ? $data : [],
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => Notification::where('user_id', $user->id)->unread()->count(),
        ]);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount()
    {
        $user = Auth::user();
        $count = Notification::where('user_id', $user->id)->unread()->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead($id)
    {
        $user = Auth::user();

        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Notification not found',
        ], 404);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Delete a specific notification
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Notification not found',
        ], 404);
    }

    /**
     * Format notification message based on type
     */
    private function formatMessage($notification)
    {
        $booking = $notification->booking;
        $data = $notification->data ?? [];

        switch ($notification->type) {
            case 'new_booking':
                $clientName = $booking?->client?->name ?? 'A client';
                $vehicleName = $booking ? trim(($booking->vehicle->make ?? '') . ' ' . ($booking->vehicle->model ?? '')) : 'a vehicle';
                return "{$clientName} made a new booking for {$vehicleName}";

            case 'booking_updated':
                return "Booking #{$notification->booking_id} has been updated";

            case 'booking_cancelled':
                return "Booking #{$notification->booking_id} has been cancelled";

            case 'payment_received':
                $amount = $data['amount'] ?? '0';
                return "Payment of \${$amount} received for booking #{$notification->booking_id}";

            case 'warehouse_new_booking':
                return (string) ($data['message'] ?? 'New warehouse booking request received.');

            case 'warehouse_status_update':
                return (string) ($data['message'] ?? 'Warehouse booking status has been updated.');

            case 'warehouse_approval':
            case 'warehouse_approved':
                return (string) ($data['message'] ?? 'Warehouse request approved.');

            case 'warehouse_rejection':
            case 'warehouse_rejected':
                return (string) ($data['message'] ?? 'Warehouse request was rejected.');

            case 'courier_event':
                return (string) ($data['message'] ?? 'Courier event update received.');

            default:
                return $data['message'] ?? 'You have a new notification';
        }
    }

    /**
     * @return array{category:string,severity:string}
     */
    private function classifyType(string $type): array
    {
        $type = strtolower(trim($type));

        if (str_contains($type, 'cancel') || str_contains($type, 'reject') || str_contains($type, 'failed')) {
            return ['category' => 'alert', 'severity' => 'high'];
        }

        if (str_contains($type, 'payment') || str_contains($type, 'approval') || str_contains($type, 'approved')) {
            return ['category' => 'finance', 'severity' => 'medium'];
        }

        if (str_contains($type, 'warehouse')) {
            return ['category' => 'warehouse', 'severity' => 'medium'];
        }

        if (str_contains($type, 'courier')) {
            return ['category' => 'courier', 'severity' => 'medium'];
        }

        if (str_contains($type, 'booking')) {
            return ['category' => 'booking', 'severity' => 'medium'];
        }

        return ['category' => 'general', 'severity' => 'low'];
    }

    private function resolveTitle($notification): string
    {
        $data = is_array($notification->data) ? $notification->data : [];
        $explicit = trim((string) ($data['title'] ?? ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $type = strtolower(trim((string) $notification->type));
        $courierEventType = strtolower(trim((string) ($data['event_type'] ?? $data['eventType'] ?? '')));

        return match (true) {
            $type === 'new_booking' => 'New Booking',
            $type === 'booking_updated' => 'Booking Updated',
            $type === 'booking_cancelled' => 'Booking Cancelled',
            $type === 'payment_received' => 'Payment Received',
            str_contains($type, 'warehouse') => 'Warehouse Update',
            $type === 'courier_event' => $this->resolveCourierEventTitle($courierEventType),
            default => 'Notification',
        };
    }

    private function resolveActionUrl($notification): ?string
    {
        $data = is_array($notification->data) ? $notification->data : [];
        $explicit = trim((string) ($data['action_url'] ?? ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $type = strtolower(trim((string) $notification->type));
        $courierEventType = strtolower(trim((string) ($data['event_type'] ?? $data['eventType'] ?? '')));

        if (str_contains($type, 'warehouse')) {
            return '/vendors/warehouse/bookings';
        }

        if ($type === 'courier_event') {
            return match ($courierEventType) {
                'payment_paid',
                'payment_failed',
                'payment_cancelled' => '/courierService/payment',
                'tracking_picked_up',
                'tracking_out_for_delivery',
                'tracking_delivered' => '/courierService/tracking',
                default => '/courierService/bookings',
            };
        }

        if ($notification->booking_id) {
            return '/vendors/bookings';
        }

        return '/vendors/notifications';
    }

    private function resolveCourierEventTitle(string $eventType): string
    {
        return match ($eventType) {
            'shipment_placed' => 'Shipment Placed',
            'booking_confirmed' => 'Booking Confirmed',
            'booking_cancelled' => 'Booking Cancelled',
            'tracking_picked_up' => 'Shipment Picked Up',
            'tracking_out_for_delivery' => 'Out For Delivery',
            'tracking_delivered' => 'Shipment Delivered',
            'payment_paid' => 'Payment Received',
            'payment_failed' => 'Payment Failed',
            'payment_cancelled' => 'Payment Cancelled',
            default => 'Courier Update',
        };
    }
}
