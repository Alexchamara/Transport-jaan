# Cancellation Policy Implementation

## Overview
Comprehensive cancellation policy system with automated refund calculation based on time remaining before departure.

## Implementation Date
December 11, 2025

## Features Implemented

### 1. Time-Based Refund Calculation
Automated refund percentage based on hours before departure:

| Time Before Departure | Refund % | Cancellation Fee |
|----------------------|----------|------------------|
| 48+ hours            | 90%      | 10% (admin fee)  |
| 24-48 hours          | 75%      | 25%              |
| 12-24 hours          | 50%      | 50%              |
| 6-12 hours           | 25%      | 75%              |
| < 6 hours            | 0%       | 100%             |
| After departure      | 0%       | 100%             |

### 2. Database Schema

#### Migration Files Created
- `database/migrations/2025_12_11_194157_add_cancellation_fields_to_bus_bookings_table.php`
- `database/migrations/2025_12_11_194218_add_cancellation_fields_to_train_bookings_table.php`
- `database/migrations/2025_12_11_194218_add_cancellation_fields_to_flight_bookings_table.php`

#### Fields Added to Booking Tables
```php
$table->timestamp('cancelled_at')->nullable();
$table->text('cancellation_reason')->nullable();
$table->decimal('refund_amount', 10, 2)->nullable();
$table->decimal('cancellation_fee', 10, 2)->nullable();
$table->index('cancelled_at');
```

### 3. Service Layer

#### CancellationPolicyService.php
**Location:** `app/Services/CancellationPolicyService.php`

**Key Methods:**
- `calculateRefund(string $bookingType, $booking)` - Calculate refund details
- `cancelBooking(string $bookingType, string $reference, int $userId, ?string $reason)` - Process cancellation
- `getRefundPercentage(float $hours)` - Get refund tier
- `getPolicyMessage(float $hours, int $percentage)` - User-friendly messages
- `getDepartureTime(string $bookingType, $booking)` - Extract departure time
- `getBooking(string $bookingType, string $reference)` - Fetch booking with relationships
- `releaseSeats(string $bookingType, $booking)` - Return seats to pool
- `canCancel(string $bookingType, $booking)` - Validation checks

**Supported Booking Types:**
- Bus bookings
- Train bookings
- Flight bookings

### 4. Controller Integration

#### BusBookingController.php
**New Methods:**
```php
// Get cancellation policy details
public function getCancellationPolicy($reference)

// Cancel a booking
public function cancelBooking(Request $request, $reference)
```

**Features:**
- Authentication verification
- Ownership validation
- Transaction-based cancellation
- Seat release automation
- Comprehensive error handling
- JSON response support

### 5. Routes

**Added Routes:**
```php
// Get cancellation policy preview
Route::get('/bus-bookings/{reference}/cancellation-policy', 
    [BusBookingController::class, 'getCancellationPolicy'])
    ->name('bus.booking.cancellation.policy')
    ->middleware('auth');

// Cancel booking
Route::post('/bus-bookings/{reference}/cancel', 
    [BusBookingController::class, 'cancelBooking'])
    ->name('bus.booking.cancel')
    ->middleware('auth');
```

### 6. Model Updates

**Updated Models:**
- `app/Models/BusBooking.php`
- `app/Models/TrainBooking.php`
- `app/Models/FlightBooking.php`

**Changes:**
- Added cancellation fields to `$fillable` array
- Added proper casts for `cancelled_at`, `refund_amount`, `cancellation_fee`

### 7. Testing

#### Test Command: TestCancellationPolicy
**Location:** `app/Console/Commands/TestCancellationPolicy.php`

**Run Command:**
```bash
php artisan test:cancellation-policy
```

**Test Coverage:**
1. **Refund Percentage Calculations** (11 tests)
   - Tests all time-based refund tiers
   - Edge cases (exact boundaries, after departure)

2. **Refund Amount Calculations** (5 tests)
   - Verifies monetary calculations
   - Tests all refund scenarios with LKR 1,500 booking

3. **Booking Cancellation Process** (4 tests)
   - Status updates
   - Timestamp recording
   - Refund amount storage
   - Seat release verification

4. **Edge Cases** (1 test)
   - Cannot cancel already cancelled booking

**Test Results:**
```
Total Tests:  21
Passed: 21
Failed: 0
Pass Rate: 100.00%
```

## Usage Examples

### 1. Get Cancellation Policy Preview
```javascript
// Frontend API call
fetch(`/bus-bookings/${reference}/cancellation-policy`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken
    }
})
.then(response => response.json())
.then(data => {
    // data.can_cancel - boolean
    // data.refund_details.refund_amount - number
    // data.refund_details.refund_percentage - number
    // data.refund_details.cancellation_fee - number
    // data.refund_details.policy_message - string
});
```

### 2. Cancel a Booking
```javascript
// Frontend API call
fetch(`/bus-bookings/${reference}/cancel`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken
    },
    body: JSON.stringify({
        reason: 'Change of plans'
    })
})
.then(response => response.json())
.then(data => {
    // data.success - boolean
    // data.message - string
    // data.refund_details - object
});
```

### 3. Service Usage (Backend)
```php
use App\Services\CancellationPolicyService;

$cancellationService = app(CancellationPolicyService::class);

// Calculate refund
$refundDetails = $cancellationService->calculateRefund('bus', $booking);
// Returns: ['refund_amount', 'refund_percentage', 'cancellation_fee', 
//           'hours_before_departure', 'policy_message']

// Cancel booking
$result = $cancellationService->cancelBooking(
    'bus', 
    'BUS-ABC123', 
    $userId, 
    'Reason for cancellation'
);
// Returns: ['success', 'message', 'refund_details', 'booking']
```

## Security Features

1. **Authentication Required** - All cancellation endpoints require authentication
2. **Ownership Verification** - Users can only cancel their own bookings
3. **Status Validation** - Cannot cancel already cancelled bookings
4. **Transaction Safety** - DB transactions ensure data consistency
5. **Audit Trail** - Comprehensive logging of all cancellations

## Business Rules

### Eligibility Criteria
- Booking must be confirmed or paid
- Booking must not be already cancelled
- User must be the booking owner
- System must be able to calculate departure time

### Refund Processing
- Refund calculated automatically based on current time
- Cancellation fee deducted from total price
- All amounts rounded to 2 decimal places
- Seat availability updated immediately

### Seat Management
- Cancelled seats returned to available pool
- Available seats incremented atomically
- Changes visible immediately for new bookings

## Error Handling

### Common Errors
1. **Booking Not Found** - Invalid reference number
2. **Unauthorized** - User doesn't own booking
3. **Already Cancelled** - Booking already cancelled
4. **Invalid Status** - Booking status doesn't allow cancellation

### Error Responses
```json
{
    "success": false,
    "message": "Error description"
}
```

## Logging

All cancellations logged with:
- Booking type
- Reference number
- User ID
- Refund amount
- Cancellation fee
- Timestamp
- Reason (if provided)

## Future Enhancements

### Planned Features
1. **Frontend Components**
   - Cancellation modal with refund preview
   - Policy information display
   - Confirmation dialog

2. **Email Notifications**
   - Cancellation confirmation email
   - Refund details
   - Policy information

3. **Refund Processing Integration**
   - Payment gateway integration
   - Automatic refund initiation
   - Refund status tracking

4. **Dashboard Views**
   - User dashboard - cancelled bookings section
   - Vendor dashboard - cancellation statistics
   - Admin analytics

5. **Extended Support**
   - Train bookings (already supported in service)
   - Flight bookings (already supported in service)
   - Sea vehicle bookings
   - Air vehicle bookings
   - Warehouse bookings

## API Reference

### GET /bus-bookings/{reference}/cancellation-policy

**Authentication:** Required

**Parameters:**
- `reference` (path) - Booking reference number

**Response:**
```json
{
    "success": true,
    "can_cancel": true,
    "refund_details": {
        "refund_amount": 1350.00,
        "refund_percentage": 90,
        "cancellation_fee": 150.00,
        "hours_before_departure": 72.5,
        "policy_message": "Cancelling 48+ hours before departure..."
    }
}
```

### POST /bus-bookings/{reference}/cancel

**Authentication:** Required

**Parameters:**
- `reference` (path) - Booking reference number
- `reason` (body, optional) - Cancellation reason (max 500 chars)

**Response:**
```json
{
    "success": true,
    "message": "Booking cancelled successfully",
    "refund_details": {
        "refund_amount": 1350.00,
        "refund_percentage": 90,
        "cancellation_fee": 150.00,
        "hours_before_departure": 72.5,
        "policy_message": "Cancelling 48+ hours before departure..."
    }
}
```

## Files Modified/Created

### Created Files
1. `app/Services/CancellationPolicyService.php` (305 lines)
2. `app/Console/Commands/TestCancellationPolicy.php` (366 lines)
3. `database/migrations/2025_12_11_194157_add_cancellation_fields_to_bus_bookings_table.php`
4. `database/migrations/2025_12_11_194218_add_cancellation_fields_to_train_bookings_table.php`
5. `database/migrations/2025_12_11_194218_add_cancellation_fields_to_flight_bookings_table.php`
6. `docs/CANCELLATION_POLICY_IMPLEMENTATION.md` (this file)

### Modified Files
1. `app/Http/Controllers/BusBookingController.php` (added 2 methods)
2. `app/Models/BusBooking.php` (added cancellation fields)
3. `app/Models/TrainBooking.php` (added cancellation fields)
4. `app/Models/FlightBooking.php` (added cancellation fields)
5. `routes/web.php` (added 2 routes)

## Verification Steps

1. **Run Migrations:**
   ```bash
   php artisan migrate
   ```

2. **Run Tests:**
   ```bash
   php artisan test:cancellation-policy
   ```

3. **Check Database:**
   ```sql
   SHOW COLUMNS FROM bus_bookings LIKE 'cancel%';
   SHOW COLUMNS FROM train_bookings LIKE 'cancel%';
   SHOW COLUMNS FROM flight_bookings LIKE 'cancel%';
   ```

4. **Test API Endpoints:**
   - Get policy: `GET /bus-bookings/{reference}/cancellation-policy`
   - Cancel booking: `POST /bus-bookings/{reference}/cancel`

## Maintenance Notes

### Database Backups
- Always backup before migration in production
- Test rollback procedures

### Performance Considerations
- Cancellation fields indexed for fast queries
- Transaction-based operations ensure consistency
- Seat updates are atomic

### Monitoring
- Monitor cancellation rates
- Track refund amounts
- Log analysis for patterns

## Support

For issues or questions:
1. Check error logs: `storage/logs/laravel.log`
2. Run test command: `php artisan test:cancellation-policy`
3. Verify database migrations: `php artisan migrate:status`

---

**Implementation Status:** ✅ Complete and Tested (100% pass rate)
**Last Updated:** December 11, 2025
**Version:** 1.0.0
