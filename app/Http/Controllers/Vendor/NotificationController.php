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

        $notifications = Notification::where('user_id', $user->id)
            ->with('booking.client', 'booking.vehicle')
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($notification) {
                $booking = $notification->booking;
                $data = $notification->data ?? [];

                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'message' => $this->formatMessage($notification),
                    'booking_id' => $notification->booking_id,
                    'client_name' => $booking?->client?->name ?? 'Unknown Client',
                    'vehicle_name' => $booking ? ($booking->vehicle->make ?? '') . ' ' . ($booking->vehicle->model ?? '') : '',
                    'is_read' => !is_null($notification->read_at),
                    'created_at' => $notification->created_at->diffForHumans(),
                    'timestamp' => $notification->created_at->toDateTimeString(),
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

            default:
                return $data['message'] ?? 'You have a new notification';
        }
    }
}
