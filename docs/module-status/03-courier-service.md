# Module 3 — Courier Service (Domestic & International)

**Launch Readiness:** 92 %  
**Status:** Most complete module. Domestic and international flows, COD settlement, label generation, team management, and security auditing are all substantially implemented.

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

### 1. Shipment Creation — Domestic
> Multi-step flow for sending a parcel within the country.

| Sub-Feature | Status | Notes |
|---|---|---|
| Sender information form | Done | Name, address, contact fields |
| Recipient information form | Done | Name, address, contact fields |
| City lookup (province → district → city chain) | Done | Cascading dropdowns from normalized location DB |
| Postal code lookup | Done | Auto-fills based on city selection |
| Package weight input | Done | Captured for pricing |
| Package dimensions input | Done | Length × width × height |
| Declared value input | Done | For insurance / customs purposes |
| Service type selection (standard / express / same-day) | Done | Options shown based on availability |
| Shipment review / summary step | Done | Preview all details before payment |
| Bill / invoice PDF generation | Done | Downloadable from dashboard after booking |
| Favourite recipient pre-fill | Done | Saved recipients auto-fill the recipient form |

---

### 2. Shipment Creation — International
> Multi-step flow for sending a parcel to another country.

| Sub-Feature | Status | Notes |
|---|---|---|
| International recipient form | Done | Country + address fields |
| Country lookup | Done | Normalized country list |
| Separate international pricing tier | Done | Different rate applied for international routes |
| Service type selection | Done | Standard / express options |
| Customs declaration form | Missing | No HS code lookup or customs value declaration |
| Commercial invoice generation | Missing | Not implemented |

---

### 3. Favourite Recipients
> Save and reuse recipient details for repeat shipments.

| Sub-Feature | Status | Notes |
|---|---|---|
| Save new recipient as favourite | Done | Stored per user account |
| Pre-fill recipient form from saved list | Done | One-click fill on the shipment form |
| Edit saved recipient | Done | Update name, address, contact |
| Delete saved recipient | Done | Remove from favourites list |

---

### 4. Payment
> Payment flow for courier shipments.

| Sub-Feature | Status | Notes |
|---|---|---|
| PayHere payment initiation | Done | Redirects to PayHere hosted page |
| Payment notification webhook (server-side) | Done | Handler exists in `CourierPaymentController` |
| PayHere MD5 signature validation | Partial | Webhook handler exists; signature verification must be confirmed |
| Return URL handling (success) | Done | Redirects client to success page |
| Cancel URL handling | Done | Handles PayHere payment abandonment |
| Retry failed payment | Done | Retry flow available from dashboard |
| Payment status tracking per shipment | Done | Status stored and displayed in dashboard |
| Duplicate payment prevention | Partial | No confirmed guard against rapid double-submit |

---

### 5. Client Dashboard
> Where clients monitor and manage their shipments, payments, and account.

| Sub-Feature | Status | Notes |
|---|---|---|
| **Shipments** | | |
| Shipment list with status badges | Done | All shipments shown with current status |
| Shipment detail view | Done | Full detail per shipment |
| Tracking event history per shipment | Done | Timeline of events on shipment detail |
| Live map tracking | Missing | Events stored but no map UI (Google Maps / Leaflet) |
| Bulk shipment upload (CSV/Excel) | Missing | No import tool |
| **Documents** | | |
| Bill / invoice download | Done | Download PDF from shipment detail |
| Shipping label download | Done | Label available after booking |
| **Wallet** | | |
| Wallet balance display | Missing | No wallet UI for client |
| Top up wallet | Missing | No top-up flow |
| Pay for shipment using wallet balance | Missing | Payment method not available |
| Wallet transaction history | Missing | No transaction list |
| Refund to wallet on cancellation | Missing | Refunds go back to original payment method only |
| Wallet statement download (PDF) | Missing | Not implemented |
| **Favourite Recipients** | | |
| Saved recipient list | Done | View all saved recipients |
| Edit saved recipient | Done | Update name, address, contact |
| Delete saved recipient | Done | Remove from list |
| **Notifications** | | |
| Shipment status change notification | Done | Shown on status updates |
| Email notification preference | Partial | Preference model exists; UI screen unconfirmed |

---

### 6. Vendor Dashboard
> Tools for courier operators to manage operations.

| Sub-Feature | Status | Notes |
|---|---|---|
| Total shipments metric | Done | Count on dashboard home |
| Revenue metric | Done | Revenue total displayed |
| Pending / in-transit / delivered counts | Done | Status breakdown cards |
| Shipment list with search and filter | Done | Searchable, filterable table |
| Calendar view of shipment activity | Done | Activity calendar per vendor |
| Revenue by period chart | Done | Chart.js graphs for analytics |
| Payout summaries | Done | Financial summary view |
| COD settlement — batch creation | Done | Create a COD settlement batch |
| COD settlement — line items | Done | Per-shipment COD lines |
| COD settlement — reconciliation | Done | `CourierCodSettlementReconciliationService` (27 K) |
| COD settlement — export | Partial | Service class exists; UI trigger button unconfirmed |
| COD integrity monitoring alerts | Partial | Detection service exists; no dashboard widget for flagged incidents |
| Fraud detection alerts | Partial | `CourierCodIntegrityMonitoringService` runs checks; no real-time alert UI |

---

### 7. Shipping Labels
> Generation and management of parcel labels.

| Sub-Feature | Status | Notes |
|---|---|---|
| Label creation from shipment data | Done | Auto-generated on shipment confirmation |
| Label template management | Done | Create, select, and apply label templates |
| Label size configuration (standard / large / thermal) | Done | Multiple size options |
| Print-ready label output | Done | Print-formatted output |
| Barcode / QR scanning for delivery agents | Missing | Label has reference text; no integrated scanning workflow |

---

### 8. Admin Dashboard
> Superadmin-level oversight of all courier operations across all vendors and clients.

| Sub-Feature | Status | Notes |
|---|---|---|
| **Overview Metrics** | | |
| Total shipments across all vendors | Done | Aggregated count in superadmin reports |
| Total revenue across all vendors | Done | Revenue totals in reports controller |
| Active vendors count | Done | Shown in admin panel |
| Active clients count | Done | Shown in admin panel |
| Pending / flagged shipments count | Partial | Basic counts exist; dedicated alert panel missing |
| **Shipment Management** | | |
| View all shipments (all vendors) | Done | SuperAdmin reports controller covers courier shipments |
| Filter shipments by vendor | Done | Filter available in reports |
| Filter shipments by status | Done | Status filter available |
| Filter shipments by date range | Done | Date range filter available |
| Export shipment report (CSV/PDF) | Partial | Reports controller exists; export format confirmation needed |
| **Vendor Management** | | |
| Approve new courier vendor | Done | Vendor approval workflow in place |
| Suspend / deactivate vendor | Done | Status update available via admin panel |
| View vendor performance metrics | Done | Per-vendor stats in reports |
| Commission rate management per vendor | Partial | Commission model exists; UI for setting per-vendor rates unconfirmed |
| **COD & Financial** | | |
| View all COD settlement batches | Done | Superadmin COD operations (Phase 3 doc exists) |
| Approve COD settlement payouts | Done | Approval workflow in place |
| COD compliance export | Partial | Service exists; admin-facing trigger UI unconfirmed |
| Commission deduction overview | Partial | Calculation logic exists; dashboard widget unconfirmed |
| **Wallet (Admin)** | | |
| View all client wallet balances | Missing | No wallet system built |
| View all wallet transactions | Missing | No wallet system built |
| Manually adjust wallet balance | Missing | Not implemented |
| Flag suspicious wallet activity | Missing | Not implemented |
| **Pricing Governance** | | |
| Import / update pricing rules | Done | `CourierPricingImportService` (47 K) |
| View active pricing matrix | Partial | Service manages pricing; read-only UI unconfirmed |
| **Security & Audit** | | |
| View security audit log (all vendors) | Done | `CourierTeamSecurityAuditService` logs available |
| View COD integrity incidents | Done | `CourierVendorCodIntegrityIncident` records visible |
| Manage email suppression list | Partial | Model exists; admin UI screen missing |
| **Notifications** | | |
| Send broadcast notification to all clients | Missing | No broadcast tool |
| Send notification to specific vendor | Partial | Manual notification possible via dashboard |

---

### 9. Wallet
> Client-held balance used to pay for shipments without per-transaction payment processing.

| Sub-Feature | Status | Notes |
|---|---|---|
| **Balance Management** | | |
| Wallet creation on client registration | Missing | No wallet entity or table |
| Wallet balance display (client) | Missing | Not built |
| Wallet balance display (admin) | Missing | Not built |
| **Top Up** | | |
| Top up via PayHere | Missing | No top-up flow |
| Top up via bank transfer | Missing | Not implemented |
| Minimum top-up amount validation | Missing | Not implemented |
| Top-up confirmation email | Missing | Not implemented |
| **Payments** | | |
| Pay for shipment using wallet balance | Missing | Wallet not a selectable payment method |
| Insufficient balance error / fallback | Missing | No balance check at checkout |
| Split payment (wallet + card) | Missing | Not implemented |
| **Refunds** | | |
| Refund to wallet on shipment cancellation | Missing | Refunds currently return to original payment method |
| Refund amount credited instantly | Missing | Not implemented |
| **Transaction History** | | |
| Transaction list (top-ups, payments, refunds) | Missing | No transaction table or UI |
| Filter transactions by type / date | Missing | Not implemented |
| Wallet statement download (PDF) | Missing | Not implemented |
| **Admin Controls** | | |
| View any client wallet balance | Missing | Not implemented |
| Manually credit / debit a wallet | Missing | Not implemented |
| Freeze a wallet | Missing | Not implemented |
| Wallet transaction audit log | Missing | Not implemented |

---

### 10. Team Management
> Multi-user access for vendors with role-based permissions.

| Sub-Feature | Status | Notes |
|---|---|---|
| Add team member | Done | Vendor invites staff |
| Remove team member | Done | Revoke access |
| Role-based permission assignment | Done | Different access levels per member |
| Temporary access grant | Partial | Model and service built; no UI to issue a grant — programmatic only |
| Temporary access expiry | Done | Grants expire automatically |
| Sensitive-action approval workflow | Done | High-impact actions require second approval |
| Trusted-device registration | Done | Devices flagged as trusted per user |
| Temporary access grant UI | Missing | No screen for manually issuing temporary access |

---

### 11. Security & Audit
> Protection and logging of sensitive operations.

| Sub-Feature | Status | Notes |
|---|---|---|
| Security audit log (all sensitive actions) | Done | Actor, timestamp, IP logged via `CourierTeamSecurityAuditService` |
| Access review certifications | Done | Periodic re-confirmation of access rights |
| COD integrity incident log | Done | `CourierVendorCodIntegrityIncident` model records anomalies |
| Session security service | Done | `CourierSessionSecurityService` manages session state |

---

### 12. Email Notifications
> Automated emails sent to clients and vendors.

| Sub-Feature | Status | Notes |
|---|---|---|
| Shipment creation confirmation email | Done | Sent to client on creation |
| Status change notification email | Done | Sent on each status update |
| Email dispatch lifecycle management | Done | `CourierCustomerEmailDispatchService` (31 K) |
| Email delivery status webhook | Done | `CourierEmailDeliveryWebhookController` handles provider callbacks |
| Email suppression list (opt-out) | Partial | Model and logic exist; no admin/vendor UI to view or manage the list |
| Suppression check before every send | Partial | Must confirm service always checks suppression before dispatch |

---

### 13. Pricing Governance
> How courier rates are managed across zones and service types.

| Sub-Feature | Status | Notes |
|---|---|---|
| Pricing import / management | Done | `CourierPricingImportService` (47 K) supports zone + weight-band + service-type rules |
| Pricing data seeded in DB | Partial | Service exists; confirm pricing rules have been loaded before first shipment |
| Vendor rate management UI | Partial | Import service is backend; UI completeness unconfirmed |

---

### 14. Proof of Delivery & Field Operations
> Last-mile delivery capture.

| Sub-Feature | Status | Notes |
|---|---|---|
| Proof of delivery photo upload | Missing | Not implemented |
| Recipient signature capture | Missing | Not implemented |
| Driver / delivery agent portal | Missing | No mobile-optimized field interface |

---

### 15. Third-Party & API Integration
> External carrier and partner connections.

| Sub-Feature | Status | Notes |
|---|---|---|
| API gateway controller | Partial | `CourierServiceApiGatewayController` (146 lines) exists; API key issuance UI and documentation unconfirmed |
| Third-party carrier integration (DHL, FedEx, etc.) | Missing | No external carrier API connected |
| Insurance add-on | Missing | No shipment insurance option during checkout |

---

## Critical Pre-Launch Fixes

| # | Fix | Impact |
|---|---|---|
| 1 | **PayHere webhook signature** — Confirm MD5 hash validation in webhook handler to prevent spoofed payment notifications. | High — financial security |
| 2 | **Duplicate shipment guard** — Block rapid double-submits on the create-shipment form from creating two shipments and two charges. | High — financial |
| 3 | **Pricing data seeding** — Run the `CourierPricingImportService` import with real pricing data before the first shipment can be priced. | High — operations |
| 4 | **Email suppression check** — Confirm `CourierCustomerEmailDispatchService` always queries `CourierEmailSuppression` before sending. | Medium — compliance |
| 5 | **COD cycle test** — Run end-to-end COD batch creation → settlement → payout export before enabling COD for any vendor. | Medium — financial |
