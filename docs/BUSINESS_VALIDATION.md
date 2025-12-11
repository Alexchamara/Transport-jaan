# Business Validation System

## Overview

The Business Validation System provides comprehensive validation rules for booking operations, ensuring data integrity, preventing overbooking, and enforcing business logic constraints.

## Components

### 1. BookingValidationService
**Location:** `app/Services/BookingValidationService.php`

A centralized service that validates all booking operations before they are saved to the database.

#### Methods

##### `validateBusBooking(BusSchedule $schedule, array $bookingData): array`

Validates bus booking requests with the following rules:

1. **Schedule Status** - Must be 'active' (not 'cancelled' or 'completed')
2. **Past Date Prevention** - Cannot book schedules in the past
3. **Capacity Validation** - Ensures requested seats don't exceed available capacity
4. **Seat Number Validation** - Validates seat numbers are within valid range (1 to bus capacity)
5. **Duplicate Seat Detection** - Prevents selecting the same seat multiple times
6. **Seat Collision Prevention** - Checks if seats are already booked by other customers
7. **Overbooking Prevention** - Ensures total bookings don't exceed bus capacity
8. **User Limit Enforcement** - Prevents single user from booking too many seats
9. **Time-based Warnings** - Warns when booking departs within 30 minutes

**Parameters:**
- `$schedule` - BusSchedule model instance
- `$bookingData` - Array with keys:
  - `passenger_count` (int) - Number of passengers
  - `seat_numbers` (array) - Array of seat numbers
  - `user_id` (int, optional) - User making the booking

**Returns:**
```php
[
    'valid' => true,
    'warnings' => ['time' => 'This bus departs in less than 30 minutes...'],
    'available_seats' => 15,
    'total_capacity' => 50,
    'departure_datetime' => Carbon instance,
]
```

**Throws:** `ValidationException` with detailed error messages

##### `validateTrainBooking(TrainSchedule $schedule, array $bookingData): array`

Validates train booking requests with the following rules:

1. **Schedule Status** - Must be 'active'
2. **Past Date Prevention** - Cannot book schedules in the past
3. **Adult Requirement** - At least 1 adult passenger required
4. **Infant Restrictions** - Infants cannot exceed number of adults
5. **Maximum Passengers** - Cannot exceed 10 passengers per booking
6. **Capacity Validation** - Total passengers must not exceed available seats
7. **Time-based Warnings** - Warns when booking departs within 1 hour

**Parameters:**
- `$schedule` - TrainSchedule model instance
- `$bookingData` - Array with keys:
  - `adults` (int) - Number of adult passengers
  - `children` (int) - Number of child passengers
  - `infants` (int) - Number of infant passengers

**Returns:**
```php
[
    'valid' => true,
    'warnings' => [],
    'available_seats' => 25,
    'total_capacity' => 100,
    'departure_datetime' => Carbon instance,
    'total_passengers' => 4,
]
```

**Throws:** `ValidationException` with detailed error messages

##### `isDateBookable(string $date, ?string $time = null): bool`

Checks if a date is valid for booking.

**Parameters:**
- `$date` - Date string (Y-m-d format)
- `$time` - Optional time string (H:i:s format)

**Returns:** `true` if date is today or in the future, `false` if past

##### `getAvailableCapacity(string $type, int $scheduleId): array`

Gets capacity information for a schedule.

**Parameters:**
- `$type` - Either 'bus' or 'train'
- `$scheduleId` - Schedule ID

**Returns:**
```php
[
    'available' => 15,
    'total' => 50,
    'booked' => 35,
    'percentage_full' => 70.0,
]
```

---

### 2. TestBusinessValidation Command
**Location:** `app/Console/Commands/TestBusinessValidation.php`

An automated test command that validates all business rules.

#### Running Tests

```bash
php artisan test:business-validation
```

#### Test Suites

##### TEST 1: Past Date Validation
- ✅ Rejects bookings for past dates
- ✅ Allows bookings for today (with future departure time)
- ✅ Allows bookings for future dates

##### TEST 2: Capacity Validation
- ✅ Rejects bookings exceeding available capacity
- ✅ Rejects bookings with zero passengers
- ✅ Allows bookings within capacity limits

##### TEST 3: Overbooking Prevention
- ✅ Prevents total bookings from exceeding bus/train capacity
- ✅ Accounts for existing confirmed and pending bookings

##### TEST 4: Seat Collision Detection
- ✅ Detects and rejects bookings with already-booked seats
- ✅ Rejects duplicate seat selections within same booking

##### TEST 5: Schedule Status Check
- ✅ Rejects bookings on 'completed' schedules
- ✅ Rejects bookings on 'cancelled' schedules
- ✅ Only allows bookings on 'active' schedules

##### TEST 6: Passenger Limits (Train)
- ✅ Requires at least 1 adult passenger
- ✅ Prevents infants from exceeding adults
- ✅ Enforces maximum 10 passengers per booking
- ✅ Allows valid passenger combinations

#### Test Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 BUSINESS VALIDATION TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEST 1: Past Date Validation
  ✅ Past Date - Should Reject
     Correctly rejected past date
  ✅ Today Date - Should Allow
     Correctly allowed today's date
  ✅ Future Date - Should Allow
     Correctly allowed future date

📊 TEST SUMMARY
Total Tests: 15
Passed: 15
Failed: 0
Success Rate: 100%
🎉 All tests passed!
```

---

## Usage Examples

### Bus Booking Validation

```php
use App\Services\BookingValidationService;
use Illuminate\Validation\ValidationException;

try {
    $schedule = BusSchedule::find($scheduleId);
    
    $result = BookingValidationService::validateBusBooking($schedule, [
        'passenger_count' => 2,
        'seat_numbers' => [15, 16],
        'user_id' => auth()->id(),
    ]);
    
    // Validation passed
    if (!empty($result['warnings'])) {
        // Show warnings to user
        foreach ($result['warnings'] as $warning) {
            session()->flash('warning', $warning);
        }
    }
    
    // Proceed with booking creation
    
} catch (ValidationException $e) {
    // Handle validation errors
    return back()->withErrors($e->errors())->withInput();
}
```

### Train Booking Validation

```php
use App\Services\BookingValidationService;

try {
    $schedule = TrainSchedule::find($scheduleId);
    
    $result = BookingValidationService::validateTrainBooking($schedule, [
        'adults' => 2,
        'children' => 1,
        'infants' => 1,
    ]);
    
    // Total passengers: 4
    $totalPassengers = $result['total_passengers'];
    
    // Proceed with booking
    
} catch (ValidationException $e) {
    // Validation failed
    $errors = $e->errors();
    // $errors might contain:
    // ['passengers' => 'At least 1 adult passenger is required.']
}
```

### Checking Available Capacity

```php
use App\Services\BookingValidationService;

// Get bus capacity info
$capacity = BookingValidationService::getAvailableCapacity('bus', $scheduleId);

echo "Available: {$capacity['available']}/{$capacity['total']} seats\n";
echo "Percentage Full: {$capacity['percentage_full']}%\n";

if ($capacity['percentage_full'] > 90) {
    echo "⚠️ Almost full! Book now!\n";
}
```

---

## Error Messages

### Common Validation Errors

| Error Key | Message | Cause |
|-----------|---------|-------|
| `schedule` | Schedule is [status] and not available | Schedule not active |
| `date` | Cannot book a schedule in the past | Schedule date/time has passed |
| `capacity` | Only X seat(s) available. You requested Y | Insufficient capacity |
| `seats` | Invalid seat number: X. Valid range: 1-Y | Seat number out of range |
| `seats` | Duplicate seat numbers selected | Same seat selected twice |
| `seat_conflict` | Seats already booked: X, Y, Z | Seats taken by other bookings |
| `passengers` | At least 1 adult passenger is required | No adults in train booking |
| `passengers` | Infants cannot exceed adults | Too many infants |
| `passengers` | Maximum 10 passengers per booking | Too many passengers |

---

## Integration Guide

### Step 1: Import the Service

```php
use App\Services\BookingValidationService;
use Illuminate\Validation\ValidationException;
```

### Step 2: Validate Before Creating Booking

```php
public function store(Request $request)
{
    // Get schedule
    $schedule = BusSchedule::findOrFail($request->schedule_id);
    
    try {
        // Validate business rules
        $validationResult = BookingValidationService::validateBusBooking($schedule, [
            'passenger_count' => $request->passenger_count,
            'seat_numbers' => $request->seat_numbers,
            'user_id' => auth()->id(),
        ]);
        
        // Validation passed - create booking
        DB::transaction(function () use ($schedule, $request, $validationResult) {
            $booking = BusBooking::create([
                'bus_schedule_id' => $schedule->id,
                'user_id' => auth()->id(),
                'passenger_count' => $request->passenger_count,
                'seat_numbers' => $request->seat_numbers,
                'status' => 'pending',
            ]);
            
            // Reduce available seats
            $schedule->decrement('available_seats', $request->passenger_count);
            
            return $booking;
        });
        
        return redirect()->route('booking.success');
        
    } catch (ValidationException $e) {
        return back()
            ->withErrors($e->errors())
            ->withInput();
    }
}
```

### Step 3: Display Warnings (Optional)

```php
// In your view
@if(session('warning'))
    <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i>
        {{ session('warning') }}
    </div>
@endif
```

---

## Database Considerations

### Required Fields

#### Bus Schedules Table
- `id` - Primary key
- `date` - Date of schedule (date)
- `departure_time` - Time of departure (time, cast as datetime:H:i:s)
- `status` - enum('active', 'cancelled', 'completed')
- `available_seats` - Integer count of remaining seats
- `bus_id` - Foreign key to buses table

#### Train Schedules Table
- `id` - Primary key
- `date` - Date of schedule (date)
- `departure_time` - Time of departure (time, cast as datetime:H:i:s)
- `status` - enum('active', 'cancelled', 'completed')
- `available_seats` - Integer count of remaining seats
- `train_id` - Foreign key to trains table

### Important Notes

1. **Time Column Casting**: The `departure_time` column is cast as `datetime:H:i:s` in the model. The validation service handles this by extracting only the time portion.

2. **Status Enum**: Only 'active', 'cancelled', and 'completed' are valid status values. Do not use 'inactive' or other values.

3. **Seat Numbers**: Stored as JSON array in bookings table. Use `$casts = ['seat_numbers' => 'array']` in the model.

4. **Available Seats**: Must be kept in sync with actual bookings. Use database transactions when creating/canceling bookings.

---

## Performance Considerations

1. **Database Locking**: Use `lockForUpdate()` when checking and updating available_seats in transactions:
   ```php
   $schedule->lockForUpdate()->first();
   ```

2. **Eager Loading**: Load relationships when validating multiple schedules:
   ```php
   $schedules = BusSchedule::with('bus')->get();
   ```

3. **Caching**: Consider caching frequently accessed capacity data:
   ```php
   Cache::remember("bus_capacity_{$scheduleId}", 300, function() use ($scheduleId) {
       return BookingValidationService::getAvailableCapacity('bus', $scheduleId);
   });
   ```

---

## Testing & Maintenance

### Running Automated Tests

```bash
# Run all business validation tests
php artisan test:business-validation

# Expected output: 15 tests, 100% success rate
```

### Test Data Requirements

The test command requires:
- At least one bus schedule with `bus_number` LIKE 'TEST-%'
- At least one train schedule with `train_number` LIKE 'TEST-%'
- Bus and train must have capacity defined

### Creating Test Data

```php
// Create test bus schedule
$testBus = Bus::create([
    'bus_number' => 'TEST-BUS-001',
    'capacity' => 50,
    // ... other fields
]);

$testSchedule = BusSchedule::create([
    'bus_id' => $testBus->id,
    'date' => Carbon::tomorrow(),
    'departure_time' => '10:00:00',
    'available_seats' => 50,
    'status' => 'active',
    // ... other fields
]);
```

---

## Troubleshooting

### Issue: "Cannot book a schedule in the past" for future dates

**Cause**: The `departure_time` column contains a full datetime instead of just time.

**Solution**: The service now handles this automatically by extracting only the time portion from Carbon datetime objects.

### Issue: Negative available_seats

**Cause**: Bookings were created without updating the available_seats counter.

**Solution**: Always update available_seats in the same transaction as creating bookings:
```php
DB::transaction(function () use ($schedule, $passengerCount) {
    // Create booking
    $booking = BusBooking::create([...]);
    
    // Update seats
    $schedule->decrement('available_seats', $passengerCount);
});
```

### Issue: Seat collision not detected

**Cause**: Seat numbers not stored as array or query not checking all booking statuses.

**Solution**: Ensure you check both 'confirmed' and 'pending' bookings:
```php
$bookedSeats = BusBooking::where('bus_schedule_id', $scheduleId)
    ->whereIn('status', ['confirmed', 'pending'])
    ->get()
    ->pluck('seat_numbers')
    ->flatten()
    ->toArray();
```

---

## Future Enhancements

Potential improvements to consider:

1. **Dynamic Pricing**: Adjust prices based on available capacity
2. **Waitlist System**: Allow users to join waitlist when fully booked
3. **Seat Preferences**: Validate preferred seat locations (window, aisle)
4. **Group Booking**: Validate groups are seated together
5. **Real-time Updates**: WebSocket notifications for capacity changes
6. **Booking Locks**: Temporary seat locks during payment process
7. **Cancellation Validation**: Rules for refund eligibility
8. **Schedule Changes**: Automatic rebooking when schedules change

---

## Support & Contribution

For questions or issues with the Business Validation System:

1. Run the automated tests: `php artisan test:business-validation`
2. Check error logs for detailed validation failures
3. Review this documentation for common issues
4. Submit bug reports with test failure details

---

**Last Updated:** January 2025
**Version:** 1.0
**Status:** ✅ All 15 tests passing
