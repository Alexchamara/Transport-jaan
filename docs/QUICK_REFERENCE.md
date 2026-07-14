# Business Validation Quick Reference

## ✅ Implementation Complete - 100% Tests Passing

### Run Tests
```bash
php artisan test:business-validation
```

### Import Service
```php
use App\Services\BookingValidationService;
use Illuminate\Validation\ValidationException;
```

---

## 🚌 Bus Booking Validation

```php
try {
    $schedule = BusSchedule::find($scheduleId);
    
    $result = BookingValidationService::validateBusBooking($schedule, [
        'passenger_count' => 2,
        'seat_numbers' => [15, 16],
        'user_id' => auth()->id(),  // Optional
    ]);
    
    // ✅ Validation passed
    // Check for warnings: $result['warnings']
    // Available seats: $result['available_seats']
    
} catch (ValidationException $e) {
    // ❌ Validation failed
    $errors = $e->errors();
    // Return errors to user
}
```

### Bus Validation Rules (9)
1. ✅ Schedule must be 'active'
2. ✅ No past dates/times
3. ✅ Passenger count ≤ available seats
4. ✅ Seat numbers within valid range
5. ✅ No duplicate seat selections
6. ✅ Seats not already booked
7. ✅ Total bookings ≤ bus capacity
8. ✅ User booking limits enforced
9. ✅ Warnings for departures < 30 min

---

## 🚂 Train Booking Validation

```php
try {
    $schedule = TrainSchedule::find($scheduleId);
    
    $result = BookingValidationService::validateTrainBooking($schedule, [
        'adults' => 2,
        'children' => 1,
        'infants' => 1,
    ]);
    
    // ✅ Validation passed
    // Total passengers: $result['total_passengers']
    // Available seats: $result['available_seats']
    
} catch (ValidationException $e) {
    // ❌ Validation failed
    $errors = $e->errors();
}
```

### Train Validation Rules (9)
1. ✅ Schedule must be 'active'
2. ✅ No past dates/times
3. ✅ At least 1 adult required
4. ✅ Infants ≤ adults
5. ✅ Max 10 passengers per booking
6. ✅ Total passengers ≤ available seats
7. ✅ At least 1 passenger required
8. ✅ Total bookings ≤ train capacity
9. ✅ Warnings for departures < 60 min

---

## 📊 Check Capacity

```php
$capacity = BookingValidationService::getAvailableCapacity('bus', $scheduleId);
// or
$capacity = BookingValidationService::getAvailableCapacity('train', $scheduleId);

// Returns:
[
    'available' => 15,
    'total' => 50,
    'booked' => 35,
    'percentage_full' => 70.0,
]
```

---

## 📅 Check Date Bookability

```php
$bookable = BookingValidationService::isDateBookable('2025-01-15', '14:00:00');
// Returns: true if today/future, false if past
```

---

## ❌ Common Error Keys

| Key | Meaning |
|-----|---------|
| `schedule` | Schedule not active |
| `date` | Date/time in the past |
| `capacity` | Insufficient capacity |
| `seats` | Invalid/duplicate seat numbers |
| `seat_conflict` | Seats already booked |
| `passengers` | Invalid passenger combination |

---

## 💡 Integration Example

```php
public function store(Request $request)
{
    $schedule = BusSchedule::findOrFail($request->schedule_id);
    
    try {
        // Validate business rules
        BookingValidationService::validateBusBooking($schedule, [
            'passenger_count' => $request->passenger_count,
            'seat_numbers' => $request->seat_numbers,
            'user_id' => auth()->id(),
        ]);
        
        // Create booking in transaction
        DB::transaction(function () use ($schedule, $request) {
            $booking = BusBooking::create([
                'bus_schedule_id' => $schedule->id,
                'user_id' => auth()->id(),
                'passenger_count' => $request->passenger_count,
                'seat_numbers' => $request->seat_numbers,
                'booking_reference' => BookingReferenceGenerator::generate('BUS'),
                'status' => 'pending',
            ]);
            
            // Update available seats
            $schedule->decrement('available_seats', $request->passenger_count);
        });
        
        return redirect()->route('booking.success');
        
    } catch (ValidationException $e) {
        return back()->withErrors($e->errors())->withInput();
    }
}
```

---

## 📚 Documentation

- **Full Guide:** `docs/BUSINESS_VALIDATION.md`
- **Summary:** `docs/IMPLEMENTATION_SUMMARY.md`
- **Test Command:** `php artisan test:business-validation`

---

## ⚠️ Important Notes

1. **Status Enum:** Only 'active', 'cancelled', 'completed' are valid
2. **Datetime Handling:** Service handles both time strings and Carbon datetime objects
3. **Transactions:** Always update `available_seats` in same transaction as booking creation
4. **Test Data:** Use TEST- prefix for test schedules

---

## 📈 Test Coverage

✅ **15/15 Tests Passing (100%)**
- 3 Past date tests
- 3 Capacity tests
- 1 Overbooking test
- 2 Seat collision tests
- 2 Schedule status tests
- 4 Passenger limit tests (train)

---

**Created:** January 2025
**Status:** ✅ Production Ready
