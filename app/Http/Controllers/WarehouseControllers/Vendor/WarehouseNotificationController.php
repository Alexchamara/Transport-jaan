<?php

namespace App\Http\Controllers\WarehouseControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WarehouseNotificationController extends Controller
{
    public function index()
    {
        $vendorId = Auth::id();

        $notifications = Notification::where('user_id', $vendorId)
            ->where(function($query) {
                $query->where('type', 'like', 'warehouse%')
                      ->orWhere('type', 'like', '%approval%')
                      ->orWhere('type', 'like', '%booking%')
                      ->orWhere('type', 'like', '%unit%');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Web/home/vendors/warehouse/Notifications', [
            'notifications' => $notifications,
            'unreadCount' => Notification::where('user_id', $vendorId)->unread()->count(),
        ]);
    }

    public function getData()
    {
        $vendorId = Auth::id();

        // Debug logging
        \Log::info('Fetching warehouse notifications', [
            'vendor_id' => $vendorId,
            'user' => Auth::user(),
        ]);

        // Get all notifications for this vendor (warehouse-related)
        $notifications = Notification::where('user_id', $vendorId)
            ->where(function($query) {
                $query->where('type', 'warehouse_approval')
                      ->orWhere('type', 'warehouse_rejection')
                      ->orWhere('type', 'warehouse_new_booking')
                      ->orWhere('type', 'warehouse_status_update')
                      ->orWhere('type', 'like', 'warehouse%');
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Debug logging
        \Log::info('Warehouse notifications fetched', [
            'count' => $notifications->count(),
            'notifications' => $notifications->toArray(),
        ]);

        // Count only warehouse-related unread notifications
        $unreadCount = Notification::where('user_id', $vendorId)
            ->where(function($query) {
                $query->where('type', 'warehouse_approval')
                      ->orWhere('type', 'warehouse_rejection')
                      ->orWhere('type', 'warehouse_new_booking')
                      ->orWhere('type', 'warehouse_status_update')
                      ->orWhere('type', 'like', 'warehouse%');
            })
            ->unread()
            ->count();

        \Log::info('Warehouse unread count', ['count' => $unreadCount]);

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function unreadCount()
    {
        $vendorId = Auth::id();

        $count = Notification::where('user_id', $vendorId)
            ->where(function($query) {
                $query->where('type', 'like', 'warehouse%')
                      ->orWhere('type', 'like', '%approval%')
                      ->orWhere('type', 'like', '%booking%')
                      ->orWhere('type', 'like', '%unit%');
            })
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $notification->markAsRead();

        return back();
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where(function($query) {
                $query->where('type', 'like', 'warehouse%')
                      ->orWhere('type', 'like', '%approval%')
                      ->orWhere('type', 'like', '%booking%')
                      ->orWhere('type', 'like', '%unit%');
            })
            ->unread()
            ->update(['read_at' => now()]);

        return back();
    }

    public function destroy($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $notification->delete();

        return back();
    }
}
