# SuperAdmin Courier Operations (Phase 3)

## What was added

Phase 3 introduces a dedicated superadmin courier operations control surface with reason-enforced interventions and immutable audit logging.

### Core capabilities

- Reassign shipment vendor.
- Force status transition.
- Freeze and unfreeze shipment operations.
- Cancel shipment via superadmin override.
- View immutable per-shipment intervention audit history.

## Permissions

New permission keys (prefix: `superadmin.courier.`):

- `operations.view`
- `operations.reassign`
- `operations.force_transition`
- `operations.freeze`
- `operations.cancel_override`
- `operations.audit.view`

These are wired in `App\Support\SuperAdminCourierRbac` and mapped into superadmin courier role bundles.

## Routes

Under `superadmin/courier-operations`:

- `GET /` -> `index`
- `POST /shipments/{shipment}/reassign`
- `POST /shipments/{shipment}/force-transition`
- `POST /shipments/{shipment}/freeze`
- `POST /shipments/{shipment}/unfreeze`
- `POST /shipments/{shipment}/cancel-override`
- `GET /shipments/{shipment}/audit-history`

Legacy redirect compatibility is included for `/SuperAdmin/CourierOperations` and `/superadmin/CourierOperations`.

## Audit model

`superadmin_courier_action_audits` is append-only and hash-chained per shipment:

- `previous_hash`
- `record_hash`

Model: `App\Models\Courier\SuperAdminCourierActionAudit`

Immutability is enforced at the Eloquent model layer (update/delete blocked).

## Freeze enforcement

When a shipment is frozen by superadmin:

- Vendor booking and shipment action mutations are blocked.
- Client status updates and client cancellations are blocked.

The block message is: `Shipment operations are temporarily frozen by SuperAdmin.`

## UI entry point

New Inertia page:

- `Web/home/SuperAdmin/CourierOperations`

Sidebar entry:

- `Courier Management -> Operations Control`

Visibility is gated by `superadmin.courier.operations.view`.
