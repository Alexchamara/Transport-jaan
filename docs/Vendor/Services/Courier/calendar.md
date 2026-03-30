# Courier Operations Calendar (Vendor) - Clear Documentation

Last updated: 25 March 2026

## 1) Purpose

This document explains the vendor-side **Operations Calendar** module:
- what appears on `/courierService/calendar`
- how events are generated
- how daily agenda and exception queue work
- how filters/search/month navigation behave

Calendar is the planning surface for pickup, delivery, and exception timing.

---

## 2) Where Operations Calendar fits in courier flow

1. Shipments are assigned and progress through operational stages.
2. Calendar converts shipment state and timing into day-based event view.
3. Team plans workload by date and resolves exceptions early.

In short:
- **Shipments** = operational execution queue.
- **Tracking** = live state monitoring.
- **Calendar** = date-based planning and workload orchestration.

---

## 3) Access control and route

Calendar route:
- `GET /courierService/calendar`

Required:
- authenticated vendor/workspace user
- courier workspace access
- permission `courier.calendar.view`
- approved courier vendor registration scope

If checks fail, calendar page is blocked.

---

## 4) Backend payload shape (`courierCalendar`)

Calendar page receives:

### Summary
- `totalEvents`
- `pickups`
- `deliveries`
- `exceptions`
- `highPriority`
- `activeShipments`

### Calendar metadata
- `monthLabel`
- `monthStart`, `monthEnd`
- `selectedDate`
- `filters` (`month`, `eventType`, `q`, `selectedDate`)

### Event datasets
- `events` (all visible events after filter)
- `dayBuckets` (count map by date)
- `agenda` (selected date events)
- `exceptionQueue` (top exception items)
- `eventTypeOptions` (`all`, `pickup`, `delivery`, `exception`)

---

## 5) How events are generated

For each shipment, backend can create multiple calendar events:

1. **Pickup event**
   - built from shipment pickup date/time
   - labeled as pickup

2. **Delivery/ETA event**
   - built from delivered timestamp (if delivered) OR estimated delivery
   - labeled delivery/ETA

3. **Exception event**
   - created when shipment is in exception condition
   - high priority tone

Each event includes:
- event id
- type (`pickup`/`delivery`/`exception`)
- title/subtitle
- date/time
- priority
- tone (for UI color)
- shipment/booking/tracking context

---

## 6) Calendar filters and search behavior

Supported query inputs:
- `month` (`YYYY-MM`)
- `eventType` (`all`, `pickup`, `delivery`, `exception`)
- `q` (search text)
- `selectedDate`

Rules:
- invalid event type falls back to `all`
- only events inside active month range are rendered
- search matches booking/tracking/client/service event text
- selecting a date updates agenda panel for that date

Filtering is server-driven (Inertia reload), not local-only.

---

## 7) UI structure in vendor dashboard calendar

Main blocks:
1. Header + Today shortcut
2. Summary KPI cards
3. Search + event type + month navigation controls
4. Month grid (day cells with event chips)
5. Right panel:
   - Daily Agenda
   - Exception Queue
   - Legend

Day cell behavior:
- shows event count and top event chips
- highlights selected date
- shows exception badge count

---

## 8) Daily agenda and exception queue behavior

### Daily Agenda
- shows selected date events sorted by time
- each item contains title, time, subtitle, booking ref

### Exception Queue
- takes exception-type events from current month/filter context
- sorted by date and capped for quick triage
- used for dispatcher escalation

---

## 9) Practical operator SOP

### Start of day
1. Open `/courierService/calendar`.
2. Click **Today**.
3. Review daily agenda and exception queue.

### Mid-day planning
1. Filter `eventType=pickup` to prepare pickup runs.
2. Switch to `delivery` to align delivery windows.
3. Resolve exception queue continuously.

### End of day
1. Move to next day/month for forward capacity planning.
2. Confirm unresolved exceptions are handed over.
3. Validate high-priority events for next shift.

---

## 10) Common issues and fixes

### Issue: No events on month view
- check month selector and eventType filter
- verify vendor has assigned shipments in selected period

### Issue: Agenda empty after clicking date
- selected date may have no events after filters
- clear search text and try again

### Issue: Exception queue looks too small
- queue is intentionally condensed for quick triage
- review full exception data in Tracking page if needed

---

## 11) How the Vendor Dashboard Operations Calendar works (`/courierService/calendar`)

Runtime sequence:

1. Vendor opens Calendar page.
2. Backend fetches vendor-scoped shipments with policy constraints.
3. Backend converts shipments into pickup/delivery/exception events.
4. Month/eventType/search filters are applied.
5. Backend computes day buckets, selected-date agenda, and exception queue.
6. UI renders month grid and right-side operational panels.
7. Operator navigates month/date and plans actions from event timing.

This makes Operations Calendar the **time-based planning board** for courier operations.
