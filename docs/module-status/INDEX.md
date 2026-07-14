# Transport-Jaan — Module Status Index

**Audit Date:** 2026-06-15  
**Branch:** ujith_new_dev  
**Stack:** Laravel 10 + React 18 + Inertia.js + Tailwind CSS + PayHere

---

## Status Legend
| Symbol | Meaning |
|---|---|
| Done | Fully implemented and working |
| Partial | Partially implemented — logic or UI incomplete |
| Missing | Not implemented — needs to be built |

---

## Overall Readiness

| Module | Readiness | UI | Backend API | Database | Document |
|---|---|---|---|---|---|
| Vehicle Rental (Land · Air · Sea) | 90 % | Done | Done | Done | [01-vehicle-rental.md](./01-vehicle-rental.md) |
| Ticket Booking (Air · Train · Bus) | 80 % | Done | Partial Partial | Done | [02-ticket-booking.md](./02-ticket-booking.md) |
| Courier Service (Domestic & Intl) | 92 % | Done | Done | Done | [03-courier-service.md](./03-courier-service.md) |
| Warehouse Booking | 88 % | Done | Done | Done | [04-warehouse-booking.md](./04-warehouse-booking.md) |
| Multi-Module (Bus · Train · Yacht) | 55 % | Done | Partial Partial | Done | [05-multi-module.md](./05-multi-module.md) |
| Freight | 18 % | Partial Shell only | Missing Missing | Partial Minimal | [06-freight.md](./06-freight.md) |

---

## Feature Areas per Module (Quick Reference)

### Vehicle Rental — 8 Feature Areas
| # | Feature Area | Status |
|---|---|---|
| 1 | Browsing & Discovery | Done Core done / Missing Advanced filters missing |
| 2 | Booking Flow | Done Core done / Missing Availability calendar missing |
| 3 | Post-Booking Management | Partial Cancellation done / Missing Modification missing |
| 4 | Cancellation Policies | Done Done |
| 5 | Reviews & Ratings | Done Done |
| 6 | Vendor — Vehicle Management | Done Core done / Partial Driver assignment partial |
| 7 | Pricing | Done Static / Missing Dynamic / commission missing |
| 8 | Insurance | Missing Not built |

### Ticket Booking — 5 Feature Areas
| # | Feature Area | Status |
|---|---|---|
| 1 | Bus Ticket Booking | Done Core done / Missing Seat preference / QR missing |
| 2 | Train Ticket Booking | Done Core done / Partial Class selection partial |
| 3 | Flight / Air Ticket Booking | Missing Stub only — needs full build |
| 4 | Shared Booking Services | Done Validation / reference / PDF done |
| 5 | Operator / Vendor Portal | Partial Models exist / Missing No management UI |

### Courier Service — 15 Feature Areas
| # | Feature Area | Status |
|---|---|---|
| 1 | Shipment Creation — Domestic | Done Done |
| 2 | Shipment Creation — International | Done Core done / Missing Customs docs missing |
| 3 | Favourite Recipients | Done Done |
| 4 | Payment | Done Core done / Partial Webhook signature unconfirmed |
| 5 | Client Dashboard | Done Core done / Missing Wallet / live map missing |
| 6 | Vendor Dashboard | Done Core done / Partial COD export UI unconfirmed |
| 7 | Shipping Labels | Done Core done / Missing QR scanning missing |
| 8 | Admin Dashboard | Done Core done / Missing Wallet admin / broadcast missing |
| 9 | Wallet | Missing Full build required |
| 10 | Team Management | Done Core done / Missing Temp access UI missing |
| 11 | Security & Audit | Done Done |
| 12 | Email Notifications | Done Core done / Partial Suppression check unconfirmed |
| 13 | Pricing Governance | Done Service built / Partial Data seeding needed |
| 14 | Proof of Delivery & Field Ops | Missing Not built |
| 15 | Third-Party & API Integration | Partial Gateway partial / Missing Carriers not connected |

### Warehouse Booking — 7 Feature Areas
| # | Feature Area | Status |
|---|---|---|
| 1 | Discovery & Browsing | Done Core done / Partial Some filters unconfirmed |
| 2 | Booking Flow | Done Core done / Partial Payment unconfirmed |
| 3 | Post-Booking Management | Done Cancellation done / Missing Modification missing |
| 4 | Reviews & Ratings | Done Done |
| 5 | Vendor — Unit Management | Done Core done / Missing Partial-capacity missing |
| 6 | Vendor Dashboard | Done Core done / Missing Payout split missing |
| 7 | Security & Advanced Features | Missing IoT / access control / insurance all missing |

### Multi-Module — 8 Feature Areas
| # | Feature Area | Status |
|---|---|---|
| 1 | Journey Planning | Done Core done / Missing Connection validation missing |
| 2 | Vehicle / Service Search per Leg | Done Bus + Train / Partial Yacht unconfirmed |
| 3 | Selection & Cart | Done Cart done / Missing Seat selection / server total missing |
| 4 | Traveller Details | Done Core done / Missing Luggage missing |
| 5 | Payment | Partial Page exists / Missing PayHere call unconfirmed |
| 6 | Booking Confirmation | Done Pages done / Missing Unified PDF / vendor notify missing |
| 7 | Post-Booking Management | Partial Partial / Missing Leg cancel / modify missing |
| 8 | Transport-Type Integration | Partial Bus + Train partial / Partial Yacht unconfirmed |

### Freight — 9 Feature Areas
| # | Feature Area | Status |
|---|---|---|
| 1 | Marketing & Landing Pages | Done Done |
| 2 | Quote Submission (Lead Capture) | Done Form + email / Missing Pricing + vendor view missing |
| 3 | Freight Booking Flow | Missing Not built |
| 4 | Pricing Engine | Missing Not built |
| 5 | Shipment Tracking & Operations | Missing Not built |
| 6 | Vendor Backend | Missing UI shells only / no data |
| 7 | Client Dashboard | Missing UI shell only / no data |
| 8 | Documents & Compliance | Missing Not built |
| 9 | Superadmin Controls | Missing Not built |

---

## Recommended Launch Sequence

```
Phase 1 — Ready Now
  ├── Vehicle Rental (Land · Air · Sea)
  ├── Courier Service (Domestic & International)
  └── Warehouse Booking

Phase 2
  ├── Ticket Booking (Bus + Train only, hide Flight tab)
  └── Multi-Module (Bus + Train legs only, remove Yacht until backend confirmed)

Phase 3
  ├── Flight Ticket Booking (full build)
  └── Multi-Module Yacht leg

Phase 4
  └── Freight (Phase 1 MVP build required first)
```

---

*Each module document follows: Overview → Status Legend → Feature Breakdown (main feature → sub-features with Done / Partial / Missing status) → Critical Pre-Launch Fixes.*
