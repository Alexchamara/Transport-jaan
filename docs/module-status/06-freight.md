# Module 6 — Freight

**Launch Readiness:** 18 %  
**Status:** Landing page UI and lead-capture quote form only. The entire booking, pricing, tracking, and payment backend is missing. Full build required before launch.

---

## Status Legend
| Symbol | Meaning |
|---|---|
| Done | Fully implemented and working |
| Partial | Partially implemented — logic or UI incomplete |
| Missing | Not implemented — needs to be built |

---

## Feature Breakdown

---

### 1. Marketing & Landing Pages
> Public-facing pages to attract freight clients.

| Sub-Feature | Status | Notes |
|---|---|---|
| Freight homepage (Hero section) | Done | Designed and rendering |
| About us section | Done | Designed and rendering |
| FAQ section | Done | Designed and rendering |
| Reviews / testimonials section | Done | Designed and rendering |
| Brand logo section | Done | Designed and rendering |
| "Why us" section | Done | Designed and rendering |
| Cargo & freight page (Hero) | Done | Designed and rendering |
| Cargo & freight page (Content section) | Done | Designed and rendering |
| Cargo & freight page (Brand section) | Done | Designed and rendering |
| 70 + branded image / SVG assets | Done | All assets in place |

---

### 2. Quote Submission (Lead Capture)
> The only functional data entry in the current system.

| Sub-Feature | Status | Notes |
|---|---|---|
| Quote request form | Done | Saves data to `FreightQuote` table |
| Admin email on quote submission | Done | `FreightQuoteSubmitted` mail class fires on submission |
| Quote pricing / rate calculation | Missing | No logic; submitted data is stored as-is |
| Vendor view of submitted quotes | Missing | No UI or API for vendors to see or respond to quotes |
| Quote approval / rejection by vendor | Missing | Not implemented |
| Quote → booking conversion | Missing | No flow to convert an accepted quote into a booking |

---

### 3. Freight Booking Flow
> Core booking creation — entirely missing.

| Sub-Feature | Status | Notes |
|---|---|---|
| Freight type selection (FCL, LCL, air, road, rail) | Missing | Not started |
| Origin input | Missing | Not started |
| Destination input | Missing | Not started |
| Cargo type selection | Missing | Not started |
| Weight input | Missing | Not started |
| Dimensions input (L × W × H) | Missing | Not started |
| Number of pallets / containers input | Missing | Not started |
| Rate calculation based on inputs | Missing | No pricing engine |
| Carrier / vendor matching and selection | Missing | Not started |
| Booking creation and reference generation | Missing | Not started |
| Payment processing (PayHere or other) | Missing | Not started |
| Booking confirmation email | Missing | Not started |
| Booking success page | Missing | Not started |

---

### 4. Pricing Engine
> Rate calculation logic — entirely missing.

| Sub-Feature | Status | Notes |
|---|---|---|
| Rate matrix (route × weight × freight type × service level) | Missing | Not built |
| Fuel surcharge management | Missing | Not built |
| Ancillary fee management | Missing | Not built |
| Dynamic pricing adjustments | Missing | Not built |
| Quote approval workflow (vendor confirms rate) | Missing | Not built |

---

### 5. Shipment Tracking & Operations
> Post-booking operations — entirely missing.

| Sub-Feature | Status | Notes |
|---|---|---|
| Tracking event creation (pickup → in transit → customs → delivery) | Missing | Not started |
| Milestone-based tracking UI | Missing | Not started |
| Live GPS tracking map | Missing | Not started |
| Proof of delivery photo upload | Missing | Not started |
| Driver / carrier assignment | Missing | Not started |
| Dispatch management | Missing | Not started |

---

### 6. Vendor (Freight Operator) Backend
> Operator tools — UI shells exist but have no data source.

| Sub-Feature | Status | Notes |
|---|---|---|
| Vendor onboarding / freight service registration | Missing | Not built |
| Route and rate management | Missing | Not built |
| Booking acceptance / rejection | Missing | Not built |
| Booking list with status management | Missing | UI shell exists; no backend data |
| Invoice generation for clients | Missing | Not built |
| Driver and fleet management | Missing | Not built |
| Expense logging | Missing | UI shell exists; no backend data |
| Revenue and analytics charts | Missing | UI shell exists; no backend data |
| Calendar view | Missing | UI shell exists; no backend data |
| Clients list | Missing | UI shell exists; no backend data |
| Payment history | Partial | UI has TODO comments for edit/delete; no data source |

---

### 7. Client Dashboard
> Client-side freight management — UI shell exists, no data.

| Sub-Feature | Status | Notes |
|---|---|---|
| Booking history list | Missing | Page exists; no bookings to show |
| Shipment status display | Missing | No status data |
| Tracking view | Missing | No tracking data |
| Invoice download | Missing | Not implemented |

---

### 8. Documents & Compliance
> Freight-specific paperwork — entirely missing.

| Sub-Feature | Status | Notes |
|---|---|---|
| Bill of Lading generation | Missing | Not started |
| Commercial invoice template | Missing | Not started |
| Customs declaration form | Missing | Not started |
| HS code lookup | Missing | Not started |
| Insurance calculation and add-on | Missing | Not started |

---

### 9. Superadmin Controls
> Platform-level freight management.

| Sub-Feature | Status | Notes |
|---|---|---|
| Freight vendor approval | Missing | Not implemented |
| Commission management for freight bookings | Missing | Not implemented |
| Dispute resolution workflow | Missing | Not implemented |
| Compliance monitoring | Missing | Not implemented |

---

## Recommended Build Sequence

### Phase 1 — Minimum Viable Freight
| # | Task |
|---|---|
| 1 | Freight type selection UI |
| 2 | Shipment details form (origin, destination, cargo specs) |
| 3 | Simple flat-rate pricing matrix per route |
| 4 | Booking creation with reference generation |
| 5 | PayHere payment integration |
| 6 | Booking confirmation email |
| 7 | Basic vendor dashboard: view and accept/reject bookings |
| 8 | Basic client dashboard: view own bookings |

### Phase 2 — Operational
| # | Task |
|---|---|
| 1 | Milestone-based shipment tracking (manual status updates by vendor) |
| 2 | Bill of Lading / invoice PDF generation |
| 3 | Vendor rate management UI |
| 4 | Superadmin freight vendor approval and commission setup |
| 5 | Basic analytics charts in vendor dashboard |

### Phase 3 — Advanced
| # | Task |
|---|---|
| 1 | Dynamic pricing engine with real-time rate calculation |
| 2 | Live GPS tracking with map |
| 3 | Customs documentation and HS code integration |
| 4 | Insurance add-on |
| 5 | Third-party carrier API integration |
| 6 | Bulk shipment / container management |

---

## Critical Pre-Launch Gate

**Do not launch Freight** in the main navigation until Phase 1 is complete. The current state — a polished landing page leading to a broken booking route and an empty dashboard — will damage user trust.

**Recommended interim options:**

| Option | Description |
|---|---|
| **Hide from nav** | Remove Freight from the main navigation until Phase 1 is ready |
| **Quote-only CTA** | Replace the "Book Now" button with "Request a Quote" (the quote form already works) |
| **Soft-launch as managed service** | Market freight as a concierge service: quote submitted → team books manually → update client by email |
