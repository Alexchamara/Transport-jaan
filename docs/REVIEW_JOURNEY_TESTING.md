# Review Journey Page - Testing Guide

## Quick Test Steps

### 1. **Access Review Journey Page**
Navigate to: `/multiModel/reviewJourney`

### 2. **Test Empty State**
- Clear session/cookies
- Visit review journey page
- ✅ Should see empty state with "Plan Your Journey" button

### 3. **Plan a Journey**
1. Go to `/multiModel/plan-journey`
2. Enter journey details:
   - Start: Colombo
   - End: Kandy
   - Add stop (optional): Galle
   - Date & time for each leg
3. Click "Search Available Vehicles"
4. Select vehicles using "SELECT FOR STOP" or "SELECT FOR WHOLE JOURNEY"
5. ✅ Should redirect to plan-journey page

### 4. **View Review Page**
1. Click "📋 Review Journey & Proceed to Checkout" button
2. ✅ Should see all selected vehicles
3. ✅ Each vehicle should show:
   - Vehicle type icon (car/bus/yacht)
   - Route (From → To)
   - Travel dates
   - Duration in days
   - Price
   - Time window
   - Vehicle name (Manufacturer + Model)
   - Addon count (if any)

### 5. **Test Remove Vehicle**
1. Click "🗑️ Remove" button on any vehicle
2. ✅ Should see confirmation dialog
3. Confirm removal
4. ✅ Should see success message
5. ✅ Cart should refresh automatically
6. ✅ Vehicle should disappear from list

### 6. **Check Trip Summary Sidebar**
1. Look at right sidebar
2. ✅ Should see "Total" amount with VAT
3. ✅ Should see itemized list of all legs:
   - Route (From → To)
   - Vehicle name and rental days
   - Amount per leg
   - Addons with prices (if any)

### 7. **Test Navigation**
1. **Back Button**: Click "← Back to Journey Planning"
   - ✅ Should return to plan-journey page
   - ✅ Can add more vehicles or modify journey
2. **Continue Button**: Click "Continue to Passenger Details →"
   - ✅ Should proceed to traveller details page
   - ✅ Button should be disabled if cart is incomplete

## API Endpoints to Test

### GET `/multiModel/cart`
```bash
curl -X GET http://localhost/multiModel/cart \
  -H "Cookie: your-session-cookie"
```

**Expected Response:**
```json
{
  "success": true,
  "cart": {
    "selections": [...]
  },
  "journey": {...},
  "total": 165.00,
  "ready_to_checkout": true
}
```

### DELETE `/multiModel/leg/{index}/remove-vehicle`
```bash
curl -X DELETE http://localhost/multiModel/leg/0/remove-vehicle \
  -H "Cookie: your-session-cookie" \
  -H "X-CSRF-TOKEN: your-csrf-token"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Vehicle removed successfully"
}
```

## Console Checks

Open browser console (F12) and verify:

1. **On Page Load:**
   ```
   Cart data received: {success: true, cart: {...}, ...}
   ```

2. **After Removing Vehicle:**
   ```
   Vehicle removed successfully!
   Cart data received: {success: true, cart: {...}, ...}
   ```

3. **No Errors:**
   - ✅ No "Cannot read properties of undefined"
   - ✅ No 404 errors
   - ✅ No network failures

## Visual Verification

### Desktop View (>1024px)
- ✅ 2-column layout (cards + sidebar)
- ✅ Timeline indicator visible on left
- ✅ Cards take 2/3 width
- ✅ Sidebar takes 1/3 width

### Tablet/Mobile View (<1024px)
- ✅ Single column layout
- ✅ Timeline indicator hidden
- ✅ Cards stack vertically
- ✅ Sidebar below cards
- ✅ Buttons full width

## Data Validation

### Prices
- ✅ All prices show 2 decimal places
- ✅ Total matches sum of all leg amounts
- ✅ Addon prices included in total

### Dates & Times
- ✅ Dates formatted as "Mon DD, YYYY"
- ✅ Times show as "HH:MM"
- ✅ Duration calculates correctly

### Vehicle Names
- ✅ Shows "Manufacturer Name" format
- ✅ Falls back to just "Name" if no manufacturer
- ✅ Shows "Unknown Vehicle" if neither available

### Addons
- ✅ Count displays correctly
- ✅ Individual addon names show in sidebar
- ✅ Addon prices display separately
- ✅ Addon totals sum correctly

## Edge Cases to Test

### 1. Single Leg Journey
- ✅ Should display one vehicle card
- ✅ No timeline connector
- ✅ Dates show properly

### 2. Multi-Leg Journey (3+ legs)
- ✅ All vehicles display in order
- ✅ Timeline connects all legs
- ✅ Each leg shows correct dates/times

### 3. Whole Journey Selection
- ✅ Same vehicle appears for multiple legs
- ✅ Each leg priced separately
- ✅ Total calculates correctly

### 4. Vehicle with No Addons
- ✅ No addon count displayed
- ✅ Subtotal equals base price
- ✅ No addon section in sidebar

### 5. Vehicle with Multiple Addons
- ✅ Addon count shows (e.g., "+3 addons")
- ✅ All addons listed in sidebar
- ✅ Each addon price displays

### 6. Long Location Names
- ✅ Text doesn't overflow container
- ✅ Responsive wrapping on mobile

### 7. Large Price Values
- ✅ Formatting handles $1,000+ correctly
- ✅ Decimal places always show

## Session Storage Check

In browser console, check session:
```javascript
// Check if journey exists in session (backend)
// This is stored server-side, but verify by:
// 1. Selecting vehicles
// 2. Refreshing page
// 3. Cart should still be there
```

## Error Scenarios to Test

### 1. Network Failure
- Disconnect internet
- Refresh page
- ✅ Loading state should persist
- Reconnect
- ✅ Data should load

### 2. Empty Session
- Clear cookies
- Visit review page directly
- ✅ Should show empty state

### 3. Partial Cart
- Plan journey with 2 legs
- Select vehicle for only 1 leg
- Visit review page
- ✅ Should show 1 vehicle
- ✅ Continue button disabled

### 4. Remove Last Vehicle
- Have 1 vehicle in cart
- Remove it
- ✅ Should show empty state after removal

### 5. Backend Error
- Simulate 500 error from backend
- ✅ Should show error alert
- ✅ Cart should not crash

## Performance Checks

- ✅ Page loads in < 2 seconds
- ✅ Cart fetch completes in < 500ms
- ✅ Remove action completes in < 1 second
- ✅ No layout shifts during load
- ✅ Smooth transitions

## Accessibility Checks

- ✅ All buttons have clear labels
- ✅ Icons have alt text
- ✅ Colors have sufficient contrast
- ✅ Keyboard navigation works
- ✅ Screen reader compatible

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Common Issues & Fixes

### Issue: "Cannot read properties of undefined"
**Fix**: Check that `selection.vehicle_data` and `selection.leg_data` exist in backend response

### Issue: Remove button not working
**Fix**: Verify CSRF token is included in DELETE request, check session is valid

### Issue: Empty state shows even with vehicles
**Fix**: Check `cart.selections` array has items, verify API returns success: true

### Issue: Prices don't add up
**Fix**: Check addon totals are included, verify backend calculation logic

### Issue: Continue button always disabled
**Fix**: Check `ready_to_checkout` flag from backend, ensure all legs have vehicles

## Success Criteria

Page is fully functional when:
- ✅ All vehicles display with complete information
- ✅ Remove functionality works without errors
- ✅ Prices calculate correctly
- ✅ Navigation works properly
- ✅ Responsive design works on all devices
- ✅ No console errors
- ✅ Loading and empty states work
- ✅ Trip summary sidebar accurate
- ✅ Addons display correctly
- ✅ Continue button enables/disables appropriately

## Next Steps After Testing

Once review page is verified:
1. Test traveller details page
2. Test payment integration
3. Test booking confirmation
4. End-to-end booking flow
5. Email notifications
