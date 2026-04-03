# Courier Clients (Vendor) - Clear Operations Documentation

Last updated: 25 March 2026

## 1) Purpose

This document explains the vendor-side **Clients module** for courier service:
- how client data is built from shipments
- how risk/tier metrics are calculated
- how profile actions work (watchlist, priority, owner, notes, tier)
- how filters and exports behave

Clients page is the relationship-control layer for assigned courier accounts.

---

## 2) Where Clients fits in courier workflow

1. Shipments are assigned to vendor.
2. Client interactions accumulate through those shipments.
3. Clients page aggregates performance and risk by sender/contact.
4. Vendor team uses this page to manage account priority and interventions.

In short:
- **Bookings/Shipments** manage jobs.
- **Clients** manages account portfolio quality.

---

## 3) Access control and routes

Main route:
- `GET /courierService/clients`

Profile mutation route:
- `POST /courierService/clients/{contact}/profile`

Required:
- authenticated workspace actor
- permission `courier.clients.view` (for page)
- permission `courier.clients.manage` (for updates)
- approved courier registration scope

If checks fail, view or updates are blocked.

---

## 4) Backend payload (`courierClients`)

### Summary
- `totalActiveClients`
- `watchlistClients`
- `criticalRiskClients`
- `clientsWithOpenExceptions`
- `enterpriseClients`
- `avgSlaPerformance`

### Rows (per client/contact)
- identity: name/company/email/phone
- `clientTier`, `categoryMix`, `priorityTag`, `watchlist`, `accountOwner`
- shipment metrics: total, active, delivered %, exception %, SLA %, open exceptions
- distribution metrics: domestic count, international count
- activity: last shipment date
- notes: internal notes

### Filter options
- tier list
- risk list
- category list (vendor-approved scope)
- per-page options
- priority tag options

---

## 5) How client rows are built

Client rows are grouped from shipments by `sender_contact_id`.

For each group, backend derives:
- total shipments
- active shipments
- delivered rate
- exception rate
- SLA performance
- category mix (`Domestic`, `International`, or `Mixed`)

Then merges vendor-managed profile (`VendorCourierClientProfile`) if available:
- watchlist flag
- priority tag
- account owner
- internal notes
- manual client tier override

---

## 6) Risk and tier logic

### Risk calculation
- `critical` if exception rate >= 20% OR delivered rate < 65%
- `at_risk` if exception rate >= 10% OR delivered rate < 80%
- otherwise `stable`

### Tier calculation (derived baseline)
- `enterprise` if total shipments >= 50
- `sme` if total shipments >= 15
- otherwise `individual`

Manual tier updates (`set_tier`) can override derived tier.

---

## 7) Profile actions and behavior

Supported profile actions:
- `toggle_watchlist`
- `set_priority` (`vip`, `standard`, `watchlist`)
- `set_owner`
- `add_note`
- `set_tier` (`enterprise`, `sme`, `individual`)

Action behavior:
- update persists to `VendorCourierClientProfile`
- note appends with timestamp
- watchlist/priority can trigger escalation workflow in ops usage

Additional policy checks:
- ownership reassignment can be blocked by team access policy
- action permissions depend on role policy/resource scopes

---

## 8) Filters and pagination

Supported filters:
- `q` (name/company/email/phone)
- `category` (`domestic`/`international` scope)
- `tier`
- `risk`
- `watchlist` (`only`)
- `page`, `perPage`

Filtering is server-side via Inertia reload.

---

## 9) Sensitive data handling

Phone visibility can be masked if policy denies sensitive-field access (`customer_phone`).

This means user may see rows but not all contact-level fields.

---

## 10) CSV export behavior

Clients page supports CSV export when query has `export=csv`.

CSV columns include:
- client identity
- tier/risk/watchlist
- shipment and SLA metrics

Export respects current filters and permission/approval constraints.

---

## 11) UI structure in vendor dashboard clients page

Main blocks:
1. Header and purpose text
2. summary KPI cards
3. filter row
4. client table
5. pagination
6. right-side **Client 360** drawer (on row click)

Client 360 drawer includes:
- contact details
- tier/risk/priority
- shipment KPIs
- notes
- quick actions (owner/tier/priority/watchlist/note)

---

## 12) Operational SOP (recommended)

### Start of week
1. Open `/courierService/clients`.
2. Filter `risk=critical` and `watchlist=only`.
3. Assign account owner and add action notes.

### Daily
1. Monitor open exceptions by client.
2. Update priority for high-impact accounts.
3. Add internal notes for follow-up actions.

### End of week
1. Export filtered portfolio report.
2. Review SLA trend and exception trend by tier.
3. Adjust watchlist and ownership assignments.

---

## 13) Common issues and fixes

### Issue: No clients visible
- Check registration approval scope.
- Check filters (`category`, `risk`, `watchlist`, `q`).
- Verify assigned shipment data exists for this vendor.

### Issue: Cannot update owner
- Team policy may block reassignment.
- User may lack required permission/action scope.

### Issue: Phone/email missing
- Sensitive field visibility may be restricted by access policy.

### Issue: Tier seems unexpected
- Derived tier is shipment-volume based.
- Check if manual `set_tier` override exists.

---

## 14) How the Vendor Dashboard Operations Clients section works (`/courierService/clients`)

This section explains the exact runtime behavior for the Clients page in vendor dashboard.

### 14.1 Page load pipeline

When user opens `/courierService/clients`:
1. Request reaches `GET /courierService/clients`.
2. Backend validates auth/workspace access and `courier.clients.view` permission.
3. Backend loads vendor-assigned shipments only.
4. Policy scope + approved category constraints are applied.
5. Shipments are grouped by `sender_contact_id`.
6. Portfolio metrics are derived per client row.
7. Stored client profile overrides are merged.
8. Filtered + paginated payload is returned to UI.

### 14.2 What operator sees first

Top KPI layer guides triage:
- `criticalRiskClients`
- `watchlistClients`
- `clientsWithOpenExceptions`
- `avgSlaPerformance`

Recommended first actions:
- filter risk to `critical`
- filter watchlist to `only`
- open Client 360 drawer for high-risk rows

### 14.3 Filter behavior in dashboard

All filters are server-side (Inertia request), not local-only.

Active filter keys:
- `q`
- `category`
- `tier`
- `risk`
- `watchlist`
- `page`, `perPage`

Category options are restricted to vendor-approved courier categories.

### 14.4 Client 360 drawer behavior

Clicking a row opens the right panel (Client 360):
- identity and contact info
- tier/risk/priority
- shipment KPIs and open exceptions
- internal notes
- profile update action controls

This is the primary operator workspace for account-level decisions.

### 14.5 Profile action execution flow

From row buttons or Client 360 drawer:

1. UI posts to `POST /courierService/clients/{contact}/profile`.
2. Payload includes `action` and action-specific values.
3. Backend validates action and policy permissions.
4. `VendorCourierClientProfile` is created/updated.
5. UI refreshes with flash feedback.

Supported actions:
- `toggle_watchlist`
- `set_priority`
- `set_owner`
- `set_tier`
- `add_note`

### 14.6 Policy-sensitive behavior

- Ownership reassignment can be denied by Team Access policy.
- Sensitive fields (like phone) may be masked by field-access policy.
- Action availability depends on resource/action permission mapping.

### 14.7 Export behavior (operations reporting)

When `export=csv` is requested from Clients view:
- backend exports currently filtered rows
- includes identity + tier/risk + key performance metrics
- respects access policy constraints

### 14.8 Practical operations loop for `/courierService/clients`

1. Identify critical + watchlist accounts.
2. Assign owner for accountability.
3. Update tier/priority based on business impact.
4. Capture investigation notes in profile.
5. Export filtered portfolio for weekly review.

This makes Clients the **account-governance control panel** in courier vendor operations.

