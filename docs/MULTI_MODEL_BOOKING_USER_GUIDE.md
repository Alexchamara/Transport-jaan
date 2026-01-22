# Multi-Model Booking System - User Guide

## How to Select Vehicles for Each Trip

### Current Issue
The SELECT FOR STOP and SELECT FOR WHOLE JOURNEY buttons need the journey data to be stored in session first, and need to know which leg/stop you're selecting a vehicle for.

### Step-by-Step Booking Flow

#### Step 1: Plan Your Journey
1. Go to `/multiModel/plan-journey`
2. Fill in:
   - **Start Location**: Where your journey begins
   - **Start Date & Time**: When you depart from start location
   - **Add Stops** (optional): Intermediate destinations
     - For each stop, add departure date/time and return date/time
   - **End Location**: Your final destination
   - **End Date & Time**: When you arrive at end location

3. Click **"Find Vehicles"** button
   - This will fetch available vehicles for your first leg

#### Step 2: View Available Vehicles
After clicking "Find Vehicles", you'll see available cars, yachts, planes, etc.

Click on any vehicle to see its details.

#### Step 3: Select Vehicle for a Leg

When viewing vehicle details, you have two options:

**Option A: SELECT FOR STOP (Blue Button)**
- Selects this vehicle **only for the current leg**
- Example: If you're on Leg 1 (Colombo → Kandy), this vehicle is selected for that leg only
- You'll need to select different vehicles for remaining legs

**Option B: SELECT FOR WHOLE JOURNEY (White Button)**  
- Tries to select this vehicle for **all remaining legs**
- Example: If you're on Leg 1, it tries to book for Legs 1, 2, 3, etc.
- Only works if the vehicle is available for all those dates
- Some legs may not be assigned if the vehicle is already booked

#### Step 4: Review Your Selections
After selecting vehicles, go to **Review Journey** page:
- You'll see all your legs/stops
- Each leg shows the selected vehicle
- You can edit or remove vehicle selections
- Total price is calculated

#### Step 5: Complete Booking
1. Click **Proceed to Checkout**
2. Enter **Traveler Details** (name, email, phone, etc.)
3. Review **Payment Summary**
4. Choose **Payment Method** (Credit Card, PayPal, Bank Transfer)
5. Choose **Payment Option**:
   - **Pay Full Amount**: Pay entire cost now
   - **Pay Advance (20%)**: Pay 20% now, rest later
6. Click **Confirm Booking**
7. View **Booking Summary** with confirmation number

---

## How the System Works

### Journey Structure
Your journey is broken into **legs** (segments):

```
Journey Example:
├─ Leg 0: Colombo → Kandy (Feb 1-2)
├─ Leg 1: Kandy → Galle (Feb 2-3)
└─ Leg 2: Galle → Colombo (Feb 3-4)
```

### Vehicle Selection

For each leg, you select one vehicle. You can:
- Use **different vehicles** for each leg (e.g., car for Leg 0, yacht for Leg 1)
- Use the **same vehicle** across multiple legs (if available)

### Session-Based Cart
Your selections are temporarily stored in your browser session:
- **Journey Plan**: All your legs with dates/locations
- **Cart**: Selected vehicles for each leg
- **Personal Info**: Your details

This allows you to:
- Build your journey gradually
- Go back and change selections
- Complete booking only when ready

---

## Important Notes

### ⚠️ Before Selecting Vehicles
1. **Plan your journey first** in the Journey Planner
2. **Save dates and locations** for all legs
3. **Click "Find Vehicles"** to see available options

### ⚠️ URL Parameters
When viewing a vehicle, the URL should include `?legIndex=0` (or 1, 2, etc.)

Example:
```
/multiModel/vehicleDetails/123?legIndex=0
```

This tells the system you're selecting a vehicle for Leg 0.

### ⚠️ Vehicle Availability
- Vehicles shown are only those available for your selected dates
- If you try "SELECT FOR WHOLE JOURNEY" but vehicle is booked for some legs, only available legs will be assigned
- You'll see a message showing which legs were successfully assigned

---

## Current Implementation Status

### ✅ Completed
- Backend API for journey storage
- Backend API for vehicle selection (single leg & whole journey)
- Cart management
- Checkout flow
- Database structure
- VehicleSearch component with working buttons

### 🔄 Needs Integration
1. **Journey Planner** needs to:
   - Store journey in session via `POST /multiModel/journey/store`
   - Pass `legIndex` when navigating to vehicle details

2. **Available Vehicles** page needs to:
   - Link to vehicle details with `?legIndex=X` parameter

3. **Review Journey** page needs to:
   - Display selected vehicles per leg
   - Show cart totals
   - Allow removing/editing selections

---

## Quick Fix Required

To make the buttons work immediately, update the journey planner to send journey data to backend:

### In PlanJourney Hero Component

Add this function before `fetchAvailableVehicles`:

```javascript
const storeJourneyInSession = async () => {
    const currentTrip = trips[currentTripIndex];
    
    // Build legs array
    const legs = [];
    
    // First leg: start → first stop (or end if no stops)
    const firstLegEnd = currentTrip.stops.length > 0 
        ? currentTrip.stops[0] 
        : currentTrip.endJourney;
    
    legs.push({
        from_location: currentTrip.startJourney.location,
        to_location: currentTrip.stops.length > 0 
            ? currentTrip.stops[0].destination 
            : currentTrip.endJourney.location,
        start_date: currentTrip.startJourney.startDate,
        start_time: currentTrip.startJourney.startTime,
        end_date: currentTrip.stops.length > 0 
            ? currentTrip.stops[0].departureDate 
            : currentTrip.endJourney.returnDate,
        end_time: currentTrip.stops.length > 0 
            ? currentTrip.stops[0].departureTime 
            : currentTrip.endJourney.returnTime,
        vehicle_type: 'land' // or determine based on selection
    });
    
    // Middle legs: each stop → next stop
    for (let i = 0; i < currentTrip.stops.length - 1; i++) {
        legs.push({
            from_location: currentTrip.stops[i].destination,
            to_location: currentTrip.stops[i + 1].destination,
            start_date: currentTrip.stops[i].departureDate,
            start_time: currentTrip.stops[i].departureTime,
            end_date: currentTrip.stops[i + 1].departureDate,
            end_time: currentTrip.stops[i + 1].departureTime,
            vehicle_type: 'land'
        });
    }
    
    // Last leg: last stop → end (if stops exist)
    if (currentTrip.stops.length > 0) {
        const lastStop = currentTrip.stops[currentTrip.stops.length - 1];
        legs.push({
            from_location: lastStop.destination,
            to_location: currentTrip.endJourney.location,
            start_date: lastStop.departureDate,
            start_time: lastStop.departureTime,
            end_date: currentTrip.endJourney.returnDate,
            end_time: currentTrip.endJourney.returnTime,
            vehicle_type: 'land'
        });
    }
    
    try {
        const response = await fetch('/multiModel/journey/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ legs })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('Journey stored in session');
            return true;
        }
    } catch (error) {
        console.error('Error storing journey:', error);
    }
    return false;
};
```

### Update fetchAvailableVehicles

Add at the beginning of the function:

```javascript
const fetchAvailableVehicles = async () => {
    setIsLoadingVehicles(true);
    
    // FIRST: Store journey in session
    const stored = await storeJourneyInSession();
    if (!stored) {
        alert('Failed to store journey. Please try again.');
        setIsLoadingVehicles(false);
        return;
    }
    
    // Rest of existing code...
```

### Update AvailableVehicles Component

When navigating to vehicle details, pass legIndex:

```javascript
<Link href={`/multiModel/vehicleDetails/${vehicle.id}?legIndex=0`}>
    View Details
</Link>
```

---

## Testing the Flow

1. **Open Developer Console** (F12)
2. **Plan a journey** with at least 2 legs
3. **Click Find Vehicles**
4. **Select a vehicle** - click "View Details"
5. **Check URL** - should have `?legIndex=0`
6. **Click SELECT FOR STOP** - should work!
7. **Check Network tab** - should see POST to `/multiModel/leg/0/select-vehicle`
8. **Should redirect** to Review Journey page

---

## Troubleshooting

### "Vehicle not selected" error
- Ensure journey is stored in session first
- Check that legIndex is in URL
- Verify dates are filled in journey planner

### "No journey found" error  
- Journey wasn't stored in session
- Call `POST /multiModel/journey/store` first

### Buttons do nothing
- Check browser console for errors
- Verify `legIndex` prop is passed to VehicleSearch
- Ensure CSRF token exists in page

---

## Next Steps for Full Implementation

1. ✅ Create `storeJourneyInSession()` function
2. ✅ Update `fetchAvailableVehicles()` to store journey
3. ✅ Update vehicle links to include `?legIndex=X`
4. ✅ Create Review Journey page
5. ✅ Create Traveler Details page
6. ✅ Test entire flow end-to-end

---

**Last Updated**: January 21, 2026
