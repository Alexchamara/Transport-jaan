# Courier Team Management (Vendor) - Complete Operations Documentation

Last updated: 25 March 2026

## 1) Purpose

This document is the full reference for vendor-side **Courier Team Management**.

It covers:
- team member lifecycle (create, update, suspend, revoke, deprovision)
- role/permission model and effective access preview
- onboarding bundles and data-scope defaults
- activity logs and immutable security audit
- session security, step-up verification, and trusted devices
- sensitive approvals, temporary elevation, break-glass
- access review certification
- API credential lifecycle (create, rotate, revoke)

Primary page:
- `GET /courierService/team`

---

## 2) Module scope in courier platform

Team Management is the governance/security plane for courier operations.

It controls **who can do what** across:
- bookings
- shipments
- tracking
- clients
- settings/profile
- finance-sensitive actions

In short:
- operational modules execute courier work
- Team Management governs operational authority and security posture

---

## 3) Access model and middleware stack

All team routes run behind:
- authenticated user (`auth`)
- courier workspace scope (`service.workspace:courier_service`)
- temporary access lifecycle middleware (`CourierTemporaryAccessLifecycle`)

Key permission gates:
- `courier.team.view`
- `courier.team.create_user`
- `courier.team.assign_role`
- `courier.team.assign_permissions`
- `courier.team.manage_status`
- `courier.team.sessions.view`
- `courier.team.sessions.revoke`
- `courier.team.transfer_ownership`
- `courier.team.access_review.view`
- `courier.team.access_review.certify`
- `courier.team.api_access.view`
- `courier.team.api_access.manage`

Important: route middleware and controller method middleware both enforce gates.

---

## 4) Route map (complete)

### Team page and user management
- `GET /courierService/team` → team dashboard payload
- `POST /courierService/team` → create team user
- `PATCH /courierService/team/{user}/access` → update member access
- `POST /courierService/team/bulk` → bulk suspend/activate/revoke sessions/assign role/deprovision

### Team access control defaults
- `PATCH /courierService/team/access-control-settings`
- `POST /courierService/team/effective-access-preview`

### Role model
- `GET /courierService/team/roles`
- `POST /courierService/team/roles`
- `POST /courierService/team/roles/template`
- `POST /courierService/team/roles/{roleName}/clone`
- `PATCH /courierService/team/roles/{roleName}`
- `GET /courierService/team/roles/{roleName}/versions`

### Sessions and ownership
- `GET /courierService/team/{user}/sessions`
- `DELETE /courierService/team/{user}/sessions/{sessionId}`
- `DELETE /courierService/team/{user}/sessions`
- `POST /courierService/team/ownership/{newOwner}`

### Sensitive approvals
- `POST /courierService/team/sensitive-approvals/{approval}/approve`
- `POST /courierService/team/sensitive-approvals/{approval}/reject`

### Temporary elevation + break-glass
- `POST /courierService/team/temporary-access/request`
- `POST /courierService/team/temporary-access/{grant}/approve`
- `POST /courierService/team/temporary-access/{grant}/reject`
- `POST /courierService/team/temporary-access/{grant}/revoke`
- `POST /courierService/team/temporary-access/break-glass`

### Session security runtime
- `GET /courierService/security/session-status`
- `POST /courierService/security/step-up/request`
- `POST /courierService/security/step-up/verify`
- `POST /courierService/security/device/trust`

### Access review control
- `GET /courierService/team/access-reviews`
- `POST /courierService/team/access-reviews/{review}/certify`

### API service access control
- `GET /courierService/team/api-access/credentials`
- `POST /courierService/team/api-access/credentials`
- `POST /courierService/team/api-access/credentials/{credential}/rotate`
- `POST /courierService/team/api-access/credentials/{credential}/revoke`

---

## 5) Main page payload (`courierTeam`)

From `GET /courierService/team`, backend sends:

### Members + summary
- member rows (`membershipId`, `userId`, `name`, `email`, `status`, `membershipRole`)
- role/direct permission lists per member
- blocked service keys
- KPI summary: total/active/suspended/owners

### Team governance catalogs
- `roleOptions`, `roleCatalog`, `rolePermissionMap`
- `permissionOptions` (all `courier.*` permissions)
- `teamAccessControl`:
	- `defaultDirectPermissionsByRole`
	- `defaultDataScopeByRole`
	- `onboardingBundles`
	- `scopeLevels` = `own_records | assigned_region | assigned_hub | all_workspace`
	- `scopeOptions` (available zones/hubs)

### Security and governance blocks
- access review policy + pending reviews
- temporary access policy + active/pending grants
- capability flags (`createUser`, `assignRole`, `assignPermissions`, etc.)
- activity timeline + action filters + pagination

---

## 6) Roles, permissions, and baseline RBAC

Guard: `web` (CourierRbac).

Predefined courier roles:
- `courier_owner`
- `courier_admin`
- `courier_dispatcher`
- `courier_tracking_officer`
- `courier_support`
- `courier_finance`
- `courier_viewer`

Important baseline behavior:
- role definitions are workspace-aware (`service_workspace_id`)
- role profiles and version history are maintained
- owner role cannot be edited through role update endpoint
- assignable roles exclude `courier_owner`

---

## 7) Create user flow (`POST /courierService/team`)

### Input highlights
- `name`, `email`, optional `password`
- `role` (if actor can assign role)
- `provisioningBundleKey`
- `directPermissions[]`
- `blockedServiceKeys[]`

### Enforcement sequence
1. Validate request and actor capabilities.
2. Resolve role defaults + bundle defaults.
3. Filter requested permissions to valid `courier.*` list.
4. Run effective-access preview (deny rules, scope constraints).
5. Enforce SoD policy (toxic combinations blocked).
6. Create/update `User` and `VendorUserMembership`.
7. Sync role + direct permissions in workspace scope.
8. Write vendor activity + immutable security audit log.

### Guardrails
- user cannot belong to another vendor
- create-only actors are forced to least-privilege default role
- if actor lacks permission assignment capability, direct permissions are discarded

---

## 8) Update access flow (`PATCH /courierService/team/{user}/access`)

Supports changing:
- role
- direct permissions
- status (`active | suspended | revoked`)
- blocked service keys

Critical protections:
- rank-based control (manage only below your membership level)
- cannot manage self with destructive actions
- owner cannot be suspended/revoked
- owner cannot be blocked from `courier_service`
- role/permission changes pass effective preview + SoD checks

Automatic side effects:
- suspending user revokes all active sessions
- all changes produce before/after snapshots in logs

---

## 9) Bulk operations (`POST /courierService/team/bulk`)

Actions:
- `suspend`
- `activate`
- `revoke_all_sessions`
- `assign_role`
- `deprovision`

Behavior notes:
- self and owner targets are skipped
- `assign_role` requires both role + permission assignment privileges
- `deprovision` sets `revoked`, blocks `courier_service`, clears roles/permissions, revokes sessions
- response includes updated/skipped counts

---

## 10) Team access control settings (defaults engine)

Endpoint:
- `PATCH /courierService/team/access-control-settings`

Config groups:
1. `defaultDirectPermissionsByRole`
2. `defaultDataScopeByRole` (scope + zone/hub constraints)
3. `onboardingBundles`

Validation + normalization:
- permissions must be valid `courier.*`
- roles must exist in workspace
- scope must be one of supported scope levels
- bundle keys normalized (slug)
- bundle permissions and service keys deduplicated

Every role/bundle configuration is tested through:
- effective access preview
- SoD validation

---

## 11) Effective access preview (`POST /courierService/team/effective-access-preview`)

Preview computes candidate permissions from:
- role permissions
- role default direct permissions
- explicit grants

Then evaluates policy constraints:
- resource-action denies
- region/hub constraints
- conditional deny rules (stage, amount, client tier, SLA class)

Output includes:
- `effectivePermissions`
- `rows` (allowed/denied + explanation)
- `denied[]` with reason codes
- summary counts

This preview is actively used by create/edit modals before submission.

---

## 12) Role model operations

Capabilities:
- list current workspace roles and templates
- create custom role
- create role from template
- clone existing role
- update role label/description/permissions
- inspect role version history

Versioning:
- each role update writes a `CourierRoleProfileVersion`
- supports auditability and rollback analysis

SoD policy is enforced on role create/update paths.

---

## 13) Session management

Per-user session controls:
- list sessions (IP, user agent, last activity)
- revoke single session
- revoke all sessions

Access constraints:
- target must be vendor team member
- management hierarchy checks apply

Suspension/deprovision paths also revoke sessions automatically.

---

## 14) Ownership transfer (sensitive action)

Endpoint:
- `POST /courierService/team/ownership/{newOwner}`

Rules:
- only current owner can initiate
- target must be active team member
- can’t transfer to current owner
- sensitive approval flow may require queued approval first

On successful transfer:
- workspace owner_user_id changes
- previous owner membership becomes `admin`
- target becomes membership `owner`
- roles synced (`courier_owner`/`courier_admin`)
- action logged and approval (if any) marked executed

---

## 15) Sensitive action approval framework

Statuses:
- `pending`, `approved`, `rejected`, `expired`, `executed`

Actions supported by policy engine:
- high-value cancellation
- refund
- ownership transfer
- large client export

Core controls:
- maker-checker support (self-approval block)
- approval TTL
- multi-approver thresholds
- request signature to deduplicate workflow context

---

## 16) Temporary elevation and break-glass

### Temporary elevation (JIT)
Flow: request → approve/reject → active → revoke/expire.

Grant statuses:
- `pending`, `active`, `rejected`, `revoked`, `expired`

Controls:
- allowed elevated role list
- duration bounds
- maker-checker
- ticket/reason requirement by policy

### Break-glass
- immediate active emergency elevation
- short duration policy
- optional owner/requester/target email notifications
- optional webhook alert delivery

Lifecycle middleware auto-revokes expired active grants on request flow.

---

## 17) Session security and step-up

Security policy domains:
1. trusted device enforcement
2. concurrent session limits
3. anomaly detection (rapid IP prefix switch)
4. step-up requirement for sensitive/write routes
5. mandatory 2FA for configured roles/actions

Key runtime behavior:
- sensitive route without valid step-up returns 428 (`step_up_required`)
- step-up challenge uses 6-digit OTP + current password verification
- successful verification stamps session timestamps
- trusted device records include expiry + recent IP metadata

---

## 18) Access review controls

Policy supports:
- review frequency (monthly/quarterly)
- due days
- manager certification requirement
- auto-disable stale accounts
- dormant privileged-user alerting

Certification outcomes:
- keep access → `certified`
- revoke access → membership suspended + sessions revoked (`revoked`)

Auto-governance outputs include activity logs and review artifacts.

---

## 19) API service access credentials

Credential lifecycle:
- list
- create
- rotate (create replacement + revoke old)
- revoke

Security model:
- raw key only returned once at creation/rotation
- stored as hash + prefix
- role-constrained API scope mapping
- optional webhook scopes
- TTL/expiry policy and active-key limits per service account

Authentication checks include:
- key validity/status/expiry
- requested scope allowed by key
- requested scope still allowed by current role policy
- webhook scope (if required)

---

## 20) Immutable audit and alerts

Two telemetry planes are used:
1. `VendorActivityLog` (human-readable ops history)
2. `CourierTeamSecurityAudit` (immutable hash-chained security events)

Automatic alert patterns include:
- unusual permission grant volume
- privileged role escalation
- failed-access spike in 15-minute window

Audit recording is fail-safe (never blocks business flow).

---

## 21) How the Vendor Dashboard Operations Courier Team Management section works (`/courierService/team`)

This section describes exact runtime behavior of the vendor Team Management page.

### 21.1 Page-load pipeline

When operator opens `/courierService/team`:
1. Request hits `GET /courierService/team`.
2. Middleware checks auth + courier workspace + temporary-access lifecycle.
3. Backend validates `courier.team.view` permission.
4. Backend loads memberships with member filters/pagination.
5. Backend computes summary KPIs (`total`, `active`, `suspended`, `owners`).
6. Backend loads workspace roles, role-permission maps, and all `courier.*` permission options.
7. Backend resolves team governance policies:
	- team access control defaults
	- access review control + pending reviews
	- temporary access policy + active/pending grants
8. Backend loads team activity timeline (actions beginning with `courier_team_`).
9. UI receives single `courierTeam` payload and renders all operational blocks.

### 21.2 What operator sees first

Main runtime blocks on page:
1. Header + Add User action
2. KPI cards (total/active/suspended/owners)
3. Team Users table with member filters and bulk actions
4. Team Activity Timeline panel with action filter
5. Modals/drawers:
	- Add Team User
	- Manage Access
	- Active Sessions
	- Activity Detail

### 21.3 Members operations runtime

#### A) Add Team User
1. Operator opens create modal.
2. Selects role and optional onboarding bundle.
3. UI composes effective candidate permissions.
4. UI calls `POST /courierService/team/effective-access-preview`.
5. Preview returns allowed/denied with reasons.
6. On submit, UI posts to `POST /courierService/team`.
7. Backend re-runs validations (policy + SoD + capability checks).
8. User + membership + roles/permissions persist; action logged.

#### B) Manage existing user
1. Operator opens Manage modal from row action.
2. UI preloads current role/status/direct permissions/blocked service keys.
3. UI requests effective preview while editing.
4. On save, UI sends `PATCH /courierService/team/{user}/access`.
5. Backend applies guardrails (rank, owner protections, self-protection, policy checks).
6. Status/role/permissions are updated and session revocation runs when required.

#### C) Bulk operations
1. Operator selects users in table.
2. Runs one action: suspend/activate/revoke sessions/assign role/deprovision.
3. UI posts to `POST /courierService/team/bulk`.
4. Backend skips forbidden targets (self/owner/not-found).
5. Backend returns updated vs skipped counts for operator feedback.

### 21.4 Activity timeline runtime

Timeline source:
- `VendorActivityLog` filtered by `action LIKE courier_team_%`

Operator workflow:
1. Filter by action type.
2. Open item detail.
3. Review metadata (before/after snapshots where present).

This gives explainability for who changed what and when.

### 21.5 Session control runtime

From Team table, `Sessions` action runs:
1. `GET /courierService/team/{user}/sessions?json=1`
2. UI lists IP, user agent, and last activity.
3. Operator can revoke one or all sessions:
	- `DELETE /courierService/team/{user}/sessions/{sessionId}`
	- `DELETE /courierService/team/{user}/sessions`

All revocations are audit logged.

### 21.6 Ownership transfer runtime

1. Operator clicks `Transfer Owner` for eligible user.
2. UI calls `POST /courierService/team/ownership/{newOwner}`.
3. Backend enforces current-owner-only and target eligibility rules.
4. If sensitive approval policy requires, request may queue first.
5. On approval/success, ownership and membership roles are atomically switched.

### 21.7 Security runtime (step-up and trusted device)

For sensitive operations, runtime may return `step_up_required` (HTTP 428).

Recovery path:
1. Request OTP: `POST /courierService/security/step-up/request`
2. Verify with current password + code: `POST /courierService/security/step-up/verify`
3. Retry original action

Trusted device flow:
- operator can trust current device via `POST /courierService/security/device/trust`
- device trust/expiry affects sensitive route access based on policy

### 21.8 Temporary elevation and break-glass runtime

JIT elevation:
1. Request elevation (`temporary-access/request`).
2. Approver accepts/rejects/revokes grant.
3. Active grants auto-expire and are revoked by lifecycle middleware.

Break-glass:
1. Authorized operator activates emergency grant.
2. Elevated role is assigned immediately for short duration.
3. Alert delivery executes (email/webhook/policy-based recipients).

### 21.9 Access review and API access runtime

Access reviews:
- list pending review items
- certify keep/revoke decisions with recorded status transitions

API access:
- list/create/rotate/revoke credentials
- create/rotate returns plaintext key once
- runtime scope checks enforce role-policy consistency

### 21.10 Audit and control guarantees in this page

Every critical Team action is captured in:
1. `VendorActivityLog` (operator timeline)
2. `CourierTeamSecurityAudit` (immutable hash-chained audit)

Automated detections include:
- unusual permission grants
- privilege escalation signals
- failed-access spikes

Operationally, `/courierService/team` is the **governance + IAM command center** for courier vendor operations.

---

## 22) Field-level quick reference

### Membership statuses
- `active`
- `invited` (supported in filters/UI)
- `suspended`
- `revoked`

### Team scope levels
- `own_records`
- `assigned_region`
- `assigned_hub`
- `all_workspace`

### Bulk actions
- `suspend`
- `activate`
- `revoke_all_sessions`
- `assign_role`
- `deprovision`

---

## 23) Operational SOP (recommended)

### Daily
1. Review suspended/revoked users and unusual changes.
2. Check activity timeline for high-risk actions.
3. Revoke suspicious sessions.

### Weekly
1. Review role drift and direct-permission creep.
2. Validate onboarding bundles and scope defaults.
3. Review temporary grants (pending/active).

### Monthly
1. Execute access review certification cycle.
2. Rotate API credentials nearing expiry.
3. Audit privileged-role assignments and SoD violations.

---

## 24) Common issues and fixes

### “Cannot update this user”
- Actor rank may be <= target rank.
- Owner protections may be blocking action.

### “Permission denied by policy”
- Effective access preview denied row explains exact reason.
- Fix role policy constraints (region/hub/deny rules).

### “Step-up required” errors
- Request OTP challenge, verify with current password + code.
- Retry action after successful step-up.

### “Cannot assign role in bulk”
- Requires both `assign_role` and `assign_permissions` permissions.

### “API key scope denied”
- Requested scope may not be in key scopes or role-allowed scopes.
- Validate role permissions and credential scope list.

