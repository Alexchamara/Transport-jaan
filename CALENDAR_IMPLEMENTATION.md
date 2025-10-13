# Calendar Implementation with Real Booking Data

## Overview
This document describes the implementation of a dynamic calendar view for vendor bookings at `/vendors/calendar`. The calendar now displays actual booking data from the database with user filtering capabilities.

## Changes Made

### 1. Backend - Controller Method
**File**: `app/Http/Controllers/Vendor/BookingController.php`

Added a new `calendar()` method that:
- Fetches bookings for the authenticated vendor
- Filters bookings by month, year, and optionally by client/user
- Processes booking data including:
  - Client information
  - Vehicle details
  - Pickup/dropoff schedules
  - Booking status (done/cancelled)
  - Location information
- Returns processed events data to the frontend
- Provides list of all clients who have bookings with the vendor

**Key Features**:
- Month/Year navigation support via query parameters
- User/Client filtering via `user_id` parameter
- Safe handling of missing relationships (schedule, vehicle, client)
- Proper status mapping (completed/returned → "done", cancelled → "cancelled")

### 2. Routes
**File**: `routes/web.php`

Updated the calendar route from a simple view render to a controller method:
```php
// Before
Route::get('/calendar', fn() => Inertia::render('Web/home/vendors/Calendar'))->name('calendar');

// After
Route::get('/calendar', [VendorBookingController::class, 'calendar'])->name('calendar');
```

### 3. Frontend Components

#### a. Calendar.jsx
**File**: `resources/js/Pages/Web/home/vendors/Calendar.jsx`

Updated to receive and pass props to CalendarContent:
- `events` - Array of booking events
- `clients` - Array of clients for filtering
- `currentMonth` - Current month being displayed
- `currentYear` - Current year being displayed
- `selectedUserId` - Currently selected user filter

#### b. CalendarContent.jsx
**File**: `resources/js/Pages/Web/components/vendors/calendar/CalendarContent.jsx`

Major refactoring to handle real data:

**New Features**:
1. **User Selection Dropdown**: Filter bookings by specific client
2. **Month Navigation**: Navigate between months with automatic data reload
3. **Selected Booking Display**: Shows detailed information about the selected booking
   - Client information with profile picture
   - Vehicle details with image
   - Pickup/dropoff dates
   - Special notes/requests
4. **Dynamic Reminders**: Displays upcoming bookings as reminders
5. **Event Click Handler**: Clicking calendar events updates the selected booking details
6. **Today Button**: Quickly navigate to current month

**State Management**:
- `currentMonth` - Tracks displayed month
- `currentYear` - Tracks displayed year
- `selectedUser` - Tracks selected client filter
- `selectedBooking` - Tracks which booking is currently displayed

**Data Processing**:
- Converts backend event data to calendar grid format
- Maps pickup times to day-of-week positions
- Handles date formatting and display

#### c. CalendarGrid.jsx
**File**: `resources/js/Pages/Web/components/vendors/calendar/CalendarGrid.jsx`

Simplified to work with real data:

**Changes**:
- Removed add/edit/delete event handlers (now display-only for real bookings)
- Added `onEventClick` prop to handle event selection
- Displays client profile images if available
- Shows booking status via color coding (blue = done, red = cancelled)
- Uses actual pickup times from database

## Data Flow

```
1. User visits /vendors/calendar
   ↓
2. BookingController::calendar() fetches bookings
   ↓
3. Bookings filtered by vendor, month, and optional user
   ↓
4. Data processed and formatted
   ↓
5. Calendar.jsx receives props
   ↓
6. CalendarContent.jsx displays data
   ↓
7. User interactions trigger Inertia.js page reloads with new filters
```

## API Parameters

The calendar route accepts these query parameters:
- `month` (integer 1-12) - Month to display
- `year` (integer) - Year to display
- `user_id` (integer, optional) - Filter by specific client

Example: `/vendors/calendar?month=10&year=2025&user_id=5`

## Database Requirements

The calendar requires these relationships to be properly set up:
- `bookings` table with `client_id`, `vehicle_id`, `status`
- `booking_schedules` table with `pickup_at`, `dropoff_at`, `pickup_location`, `dropoff_location`
- `vehicles` table with proper ownership column (`provider_id`, `vendor_id`, etc.)
- `users` table for client information

## Color Coding

Events are color-coded based on status:
- **Blue (`#C5E6F9`)** - Done/Completed bookings
- **Red (`#FFDBDF`)** - Cancelled bookings

## Features

### Current Features
✅ Display real booking data from database
✅ Month/year navigation
✅ Client filtering dropdown
✅ Selected booking details display
✅ Client profile images
✅ Vehicle information display
✅ Pickup/dropoff times and locations
✅ Booking status visualization
✅ Responsive layout

### Potential Enhancements
- 📅 Add ability to create new bookings from calendar
- 📝 Edit existing bookings
- 🔔 Add real reminder/notification system
- 📊 Show booking statistics
- 🔍 Search functionality
- 📱 Mobile-responsive improvements
- 🎨 Custom color themes for different booking types
- 📄 Export calendar to PDF/iCal

## Testing

To test the calendar:

1. Ensure you have bookings in the database with schedules
2. Log in as a vendor user
3. Navigate to `/vendors/calendar`
4. You should see:
   - Bookings displayed on the calendar grid
   - Client dropdown for filtering
   - Selected booking details on the left
   - Month navigation controls

## Troubleshooting

**No bookings showing?**
- Check if bookings exist for the logged-in vendor
- Verify bookings have `booking_schedules` records
- Check if pickup dates are in the displayed month

**Calendar grid empty?**
- Ensure pickup times match the hardcoded time slots (8 AM - 4 PM)
- Check browser console for JavaScript errors

**User dropdown empty?**
- Verify bookings have valid `client_id` references
- Check if clients exist in the `users` table

## Technical Notes

- Uses Inertia.js for SPA-like navigation without page reloads
- Leverages React hooks (useState, useEffect) for state management
- Month calculations handle year boundaries correctly
- All dates use ISO 8601 format for consistency
- Images have fallback defaults if not available
