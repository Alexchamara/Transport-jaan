# Client Courier Phase 2 DTO Contract

## Objective
Unify courier data mapping across:
- Client courier dashboard list
- Client courier shipment detail
- Client all-bookings aggregate view

using one shared transformer contract.

## Canonical Source
- Transformer class: `App\Support\Courier\ClientCourierShipmentTransformer`
- Methods:
  - `forDashboard(CourierShipment $shipment): array`
  - `forDetail(CourierShipment $shipment): array`
  - `forUnifiedBooking(CourierShipment $shipment): array`

## Contract Rules

### Address normalization
- Canonical courier address fields are:
  - `line1`
  - `line2`
  - `city`
  - `state`
  - `postal_code`
  - `country`
  - `instructions`
- Deprecated field names such as `address_line_1` and `address_line_2` are not used.

### Dashboard payload
- Includes card/table fields expected by UI:
  - `id`, `code`, `status`, `serviceLevel`, `pickupDate`
  - `from`, `to`, `packages`, `packageTypes`
  - `totalWeight`, `totalCost`, `estimatedCost`, `currencyCode`

### Detail payload
- Includes nested sender/recipient entities with normalized addresses.
- Includes package details and tracking events with stable keys.

### Unified all-bookings payload
- Preserves existing generic all-bookings keys for compatibility.
- Adds normalized courier-specific fields:
  - `pickup_address`, `delivery_address`
  - `sender_name`, `sender_email`, `sender_phone`
  - `recipient_name`, `recipient_email`, `recipient_phone`
  - `service_level`, `package_count`, `package_type`, `weight`
  - `tracking_reference`, `tracking_number`

## Acceptance Criteria
- Courier dashboard, detail, and all-bookings are all fed from the shared transformer.
- Courier all-bookings entries use valid courier address schema (`line1`/`line2`/`postal_code`).
- Unit tests validate transformer output and address composition.
