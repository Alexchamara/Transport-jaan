# Multi-Model Vehicle Rental Booking System

## Overview

The multi-model booking system allows users to plan complex journeys with multiple legs/stops, selecting different vehicles for each leg. Users can book one vehicle per leg or use the same vehicle across multiple legs (if available).

## System Architecture

### Database Structure

#### 1. **multi_model_journeys** Table
Stores the main journey/trip information:
- `reference`: Unique booking reference (e.g., MMJ-ABC123)
- `total_legs`: Number of stops/legs in the journey
- `total_amount`: Total cost for entire journey
- `payment_method`: Credit Card, PayPal, Bank Transfer
- `payment_option`: full or advance payment
- `customer_data`: JSON field storing traveler information

#### 2. **multi_model_legs** Table
Each leg represents one segment of the journey:
- `leg_order`: Sequential order (1, 2, 3...)
- `from_location` / `to_location`: Route information
- `start_datetime` / `end_datetime`: When this leg occurs
- `vehicle_type`: land, sea, or air
- `vehicle_id`: Selected vehicle for this leg
- `vehicle_snapshot`: Vehicle details at time of booking

#### 3. **multi_model_bookings** Table
Individual booking records for each leg:
- Links to both `multi_model_leg_id` and `multi_model_journey_id`
- Contains pricing breakdown for this specific leg
- `addons_snapshot`: Selected extras (GPS, child seat, etc.)
- `rental_days`: Duration for this leg

### Booking Flow

```
1. Plan Journey (PlanJourney.jsx)
   ↓
2. Search Available Vehicles (AvailableVehicles.jsx)
   ↓
3. View Vehicle Details (VehicleDetails.jsx)
   ↓
4. Select Vehicle for Leg/Journey (VehicleSearch.jsx)
   ↓
5. Review Journey (ReviewJourney.jsx)
   ↓
6. Enter Traveller Details (TravellerDetails.jsx)
   ↓
7. Payment (Payment.jsx)
   ↓
8. Confirmation & Summary
```

## Key Features

### 1. Journey Planning
Users define their complete journey with multiple legs:
```javascript
{
  legs: [
    {
      from_location: "Colombo",
      to_location: "Kandy",
      start_date: "2026-02-01",
      start_time: "09:00",
      end_date: "2026-02-02",
      end_time: "18:00",
      vehicle_type: "land"
    },
    {
      from_location: "Kandy",
      to_location: "Galle",
      start_date: "2026-02-02",
      start_time: "10:00",
      end_date: "2026-02-03",
      end_time: "17:00",
      vehicle_type: "land"
    }
  ]
}
```

### 2. Vehicle Selection Buttons

#### **SELECT FOR STOP** (Blue Button)
- Selects the vehicle **only for the current leg**
- User must select vehicles for remaining legs separately
- Use case: Different vehicles needed for different terrain/purposes

**Backend Logic:**
```php
POST /multiModel/leg/{legIndex}/select-vehicle
{
  "vehicle_id": 123,
  "selection_type": "single_leg",
  "addons": [...]
}
```

#### **SELECT FOR WHOLE JOURNEY** (White/Gray Button)
- Attempts to select this vehicle for **all remaining legs** from current point
- System checks availability for each leg
- Only confirms legs where vehicle is available
- Use case: Same vehicle for entire trip (if possible)

**Backend Logic:**
```php
// Loops through remaining legs
for ($i = currentLegIndex; $i < totalLegs; $i++) {
    if (vehicle_available_for_leg($i)) {
        select_vehicle_for_leg($i);
    }
}
```

### 3. Session-Based Cart System

The system uses Laravel sessions to store:

**Journey Plan** (`multimodel_journey`):
```php
$request->session()->put('multimodel_journey', [
    'legs' => [...] // Journey structure
]);
```

**Cart/Selections** (`multimodel_cart`):
```php
$request->session()->put('multimodel_cart', [
    'selections' => [
        0 => [...], // Leg 0 selection
        1 => [...], // Leg 1 selection
        2 => [...], // Leg 2 selection
    ]
]);
```

**Personal Info** (`multimodel_personal`):
```php
$request->session()->put('multimodel_personal', [
    'first_name' => 'John',
    'last_name' => 'Doe',
    // ...
]);
```

### 4. Availability Checking

For each leg, the system:
1. Parses date/time range
2. Queries vehicles by type (land/sea/air)
3. Filters by approval_status and status
4. Checks existing bookings for conflicts
5. Returns available vehicles with pricing

```php
$vehicles = Vehicle::where('type', $vehicleType)
    ->where('status', 'active')
    ->where('approval_status', 'approved')
    ->get()
    ->filter(function ($vehicle) use ($startDateTime, $endDateTime) {
        return $vehicle->isAvailable($startDateTime, $endDateTime);
    });
```

### 5. Pricing Calculation

Per leg calculation:
- Base: `price_per_day × number_of_days`
- Addons: Sum of selected extras
- Discounts: 10% for 3+ days, 15% for 7+ days
- Deposit: Refundable security deposit
- Advance: 20% advance payment option

Total journey calculation:
- Sum all leg totals
- Aggregate deposits and advances
- Single payment covers entire journey

## API Endpoints

### Journey Management
```
POST   /multiModel/journey/store          - Save journey plan
GET    /multiModel/journey/get             - Retrieve journey plan
```

### Vehicle Selection
```
POST   /multiModel/leg/{index}/available-vehicles  - Get vehicles for leg
POST   /multiModel/leg/{index}/select-vehicle      - Select vehicle
DELETE /multiModel/leg/{index}/remove-vehicle      - Remove vehicle
```

### Cart & Checkout
```
GET    /multiModel/cart                    - Get current cart
GET    /multiModel/checkout                - Checkout page
POST   /multiModel/personal-info           - Store traveler info
GET    /multiModel/payment-page            - Payment page
POST   /multiModel/confirm                 - Confirm booking
GET    /multiModel/booking/{id}/summary    - View summary
```

## Frontend Components

### VehicleSearch.jsx Props
```javascript
{
  vehicle: {
    id: number,
    name: string,
    pricePerDay: number,
    days: number,
    // ... vehicle details
  },
  journey: {
    days: number,
    // ... journey info
  },
  legIndex: number,              // Which leg is this for
  onVehicleSelected: function    // Callback after selection
}
```

### State Management
Components use:
- `useState` for local state (extras selection, loading)
- `axios` for API calls
- `router.visit()` for navigation
- Session storage (backend) for persistence

## Real-World Use Cases

### Example 1: Multi-City Tour
```
Leg 1: Colombo → Kandy (Land vehicle)
Leg 2: Kandy → Galle (Same land vehicle - SELECT FOR WHOLE JOURNEY)
Leg 3: Galle → Marina (Sea vehicle - SELECT FOR STOP)
Leg 4: Marina → Airport (Air vehicle - SELECT FOR STOP)
```

### Example 2: Business Trip
```
Leg 1: Airport → Hotel (Luxury car - SELECT FOR STOP)
Leg 2: Hotel → Office → Hotel (Same car for whole journey)
Leg 3: Hotel → Airport (Same car continues)
```

### Example 3: Adventure Trip
```
Leg 1: City → Mountain Base (SUV - SELECT FOR STOP)
Leg 2: Mountain Base → Lake (Different SUV - SELECT FOR STOP)
Leg 3: Lake → Coast (Boat - SELECT FOR STOP)
```

## Implementation Guidelines

### When to Use "SELECT FOR WHOLE JOURNEY"
- Long trips with continuous vehicle need
- Same terrain/vehicle type across legs
- Customer wants pricing efficiency
- Vehicle has confirmed availability across all legs

### When to Use "SELECT FOR STOP"
- Different vehicle types needed (land → sea → air)
- Specific vehicle preferences per location
- Vehicle availability limited to certain dates
- Flexible planning with different budgets per leg

### Error Handling
```javascript
try {
    const response = await axios.post(url, data);
    // Success handling
} catch (error) {
    if (error.response?.status === 422) {
        // Validation error
    } else if (error.response?.status === 404) {
        // Not found
    } else {
        // General error
    }
}
```

## Testing Scenarios

1. **Happy Path**: Select vehicles for all legs, complete payment
2. **Partial Journey**: SELECT FOR WHOLE JOURNEY with some legs unavailable
3. **Mixed Selection**: Mix of single-leg and multi-leg selections
4. **Cart Abandonment**: User leaves before completing
5. **Conflict Resolution**: Vehicle becomes unavailable during selection
6. **Payment Failure**: Handle failed payment gracefully

## Database Queries for Reports

### Total Bookings by Vehicle Type
```sql
SELECT vehicle_type, COUNT(*) 
FROM multi_model_legs 
WHERE status = 'confirmed'
GROUP BY vehicle_type;
```

### Revenue by Journey
```sql
SELECT reference, total_amount, created_at
FROM multi_model_journeys
WHERE status = 'confirmed'
ORDER BY created_at DESC;
```

### Popular Routes
```sql
SELECT from_location, to_location, COUNT(*) as trips
FROM multi_model_legs
GROUP BY from_location, to_location
ORDER BY trips DESC
LIMIT 10;
```

## Future Enhancements

1. **Real-time Availability**: WebSocket updates for vehicle availability
2. **Dynamic Pricing**: Peak season, demand-based pricing
3. **Multi-Currency**: Support for international bookings
4. **Route Optimization**: AI-suggested vehicle combinations
5. **Loyalty Program**: Points for multi-leg bookings
6. **Insurance Options**: Per-leg or journey-wide insurance
7. **Driver Assignment**: Automatic driver matching per leg

## Maintenance & Monitoring

- **Session Cleanup**: Clear abandoned carts after 24 hours
- **Booking Expiry**: Auto-cancel unpaid bookings after 30 minutes
- **Availability Sync**: Real-time sync with vehicle calendar
- **Audit Logs**: Track all booking modifications
- **Performance**: Index on `multi_model_journey_id` and `leg_order`

---

**Last Updated**: January 21, 2026
**Version**: 1.0.0
**Maintained by**: Transport-Jaan Development Team
