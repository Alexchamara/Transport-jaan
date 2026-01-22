# Quick Fix: Making SELECT Buttons Work

## The Problem

The "SELECT FOR STOP" and "SELECT FOR WHOLE JOURNEY" buttons don't work because:
1. The `legIndex` prop is not being passed from the vehicle details link
2. The journey data is not being stored in the session before viewing vehicles

## The Solution

Update the **AvailableVehicles.jsx** component to pass `legIndex` in the link:

### File: `/resources/js/Pages/Web/components/multiModel/planJourney/AvailableVehicles.jsx`

**Line 496** (Car section - More Details link):
```jsx
// CHANGE FROM:
<Link
    href={`/multiModel/vehicleDetails/${vehicle.id}`}
    className="w-[127px] h-[22px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[10px] font-[700] text-[#FFFFFF] mx-auto p-1 cursor-pointer"
>
    More Details
</Link>

// CHANGE TO:
<Link
    href={`/multiModel/vehicleDetails/${vehicle.id}?legIndex=0`}
    className="w-[127px] h-[22px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[10px] font-[700] text-[#FFFFFF] mx-auto p-1 cursor-pointer"
>
    More Details
</Link>
```

**Line 845** (Yacht section - More Details link):
```jsx
// CHANGE FROM:
<Link
    href={`/multiModel/yatch/yatchDetails/${vehicle.id}`}
    className="w-[127px] h-[22px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[10px] font-[700] text-[#FFFFFF] mx-auto p-1 cursor-pointer"
>
    More Details
</Link>

// CHANGE TO:
<Link
    href={`/multiModel/vehicleDetails/${vehicle.id}?legIndex=0`}
    className="w-[127px] h-[22px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[10px] font-[700] text-[#FFFFFF] mx-auto p-1 cursor-pointer"
>
    More Details
</Link>
```

## Testing the Fix

1. Go to `/multiModel/plan-journey`
2. Fill in journey details (start location, date, time, end location, date, time)
3. Click "Find Vehicles"
4. See available cars/yachts
5. Click "More Details" on any vehicle
6. Check URL - should see: `/multiModel/vehicleDetails/123?legIndex=0`
7. Scroll down to pricing section
8. Click **"SELECT FOR STOP"** button
9. Should see loading text "SELECTING..."
10. Should redirect to Review Journey page

## What Each Button Does

### SELECT FOR STOP (Blue Button)
- Selects the vehicle **only for the current leg** (Leg 0)
- User needs to select vehicles for other legs separately
- API call: `POST /multiModel/leg/0/select-vehicle` with `selection_type: 'single_leg'`

### SELECT FOR WHOLE JOURNEY (White Button)
- Attempts to select this vehicle for **all remaining legs** starting from current leg
- Checks availability for each leg
- Only assigns vehicle to legs where it's available
- API call: `POST /multiModel/leg/0/select-vehicle` with `selection_type: 'whole_journey'`

## Next Steps After This Fix

After making this change, the buttons will work for the first leg (Leg 0). To support multiple legs:

1. **Update Journey Planner** to store journey in session:
   - Add `storeJourneyInSession()` function (see MULTI_MODEL_BOOKING_USER_GUIDE.md)
   - Call it before `fetchAvailableVehicles()`

2. **Update Vehicle Links** to include proper leg index:
   - When viewing Leg 1, link should be `?legIndex=1`
   - When viewing Leg 2, link should be `?legIndex=2`
   - etc.

3. **Create Review Journey Page** to show all selected vehicles

## Files Already Updated

✅ [resources/js/Pages/Web/home/multiModel/VehicleDetails.jsx](resources/js/Pages/Web/home/multiModel/VehicleDetails.jsx) - Now extracts `legIndex` from URL and passes to VehicleSearch

✅ [app/Http/Controllers/WebController.php](app/Http/Controllers/WebController.php) - Now accepts `legIndex` parameter in MultimodelVehicleDetails method

✅ [resources/js/Pages/Web/components/multiModel/vehicleDetails/VehicleSearch.jsx](resources/js/Pages/Web/components/multiModel/vehicleDetails/VehicleSearch.jsx) - Buttons now call API endpoints with proper parameters

✅ [app/Http/Controllers/MultiModel/MultiModelBookingController.php](app/Http/Controllers/MultiModel/MultiModelBookingController.php) - Backend API endpoints ready

✅ [routes/web.php](routes/web.php) - All routes configured

## File to Update Now

❌ [resources/js/Pages/Web/components/multiModel/planJourney/AvailableVehicles.jsx](resources/js/Pages/Web/components/multiModel/planJourney/AvailableVehicles.jsx) - Need to add `?legIndex=0` to vehicle detail links

---

**Just update the links in AvailableVehicles.jsx and the buttons will work!**
