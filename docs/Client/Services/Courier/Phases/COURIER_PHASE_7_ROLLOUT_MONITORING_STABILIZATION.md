# Courier Phase 7 - Rollout, Monitoring, and Stabilization

This phase operationalizes production rollout governance for client courier bookings.

## Scope Delivered

1. Release checklist with canary guardrails and explicit fallback criteria.
2. Automated monitoring command for conversion, error signals, and support-signal proxies.
3. Stabilization action guidance based on breached metrics.
4. Post-implementation summary publication workflow.

## Release Checklist

Use the checklist configured under `config/courier.php` before widening rollout:

1. Confirm release owner, canary window timings, and rollback approver.
2. Enable canary traffic for client courier bookings in a controlled window.
3. Run `courier:phase7-monitor` hourly during canary and review fallback signals.
4. Hold deployment if fallback criteria are breached and open stabilization patch ticket.
5. Publish final post-implementation summary after canary closes cleanly.

## Monitoring Command

Command:

`php artisan courier:phase7-monitor --hours=24`

Options:

- `--hours=24` lookback window.
- `--log=/custom/path/laravel.log` override log source.
- `--json` print full monitoring payload.
- `--publish-summary` append markdown snapshot to Phase 7 summary document.
- `--summary-path=docs/...` override summary target path.

Scheduled execution is configured in `routes/console.php`:

- Hourly run: `courier:phase7-monitor --hours=24`

## Metrics and Fallback Criteria

Thresholds are configurable in `config/courier.php` under `phase7.thresholds`.

Default fallback triggers:

- Minimum shipment sample `>= 5` before full rate-based checks apply.
- Conversion rate `< 85%`
- Error signal rate `> 8%`
- Support signal proxy rate `> 12%`
- Critical repeated-denial alerts `> 2`

If shipment volume is below minimum sample size, monitor output is marked as insufficient-data rather than fallback unless critical alerts breach threshold.

When any active trigger breaches threshold, fallback is advised and the monitor emits `COURIER PHASE7 FALLBACK ADVISED`.

## Telemetry and Edge-Case Stabilization Loop

Error and support-signal telemetry is derived from Phase 6 observability events:

- `COURIER CLIENT STORE FAILURE`
- `COURIER CLIENT PRICING EXCEPTION`
- `COURIER CLIENT OWNERSHIP FAILURE`
- `COURIER CLIENT AUTHORIZATION DENIED`
- `COURIER CLIENT REPEATED AUTHORIZATION DENIALS`

For breached windows:

1. Review breached metric codes and related log events.
2. Patch top offender edge cases in checkout/store/ownership flows.
3. Re-run monitor command to verify recovery before widening canary traffic.

## Post-Implementation Summary

Use:

`php artisan courier:phase7-monitor --hours=24 --publish-summary`

to append rollout snapshots to:

- `docs/Client/Services/Courier/Phases/COURIER_PHASE_7_POST_IMPLEMENTATION_SUMMARY.md`

This summary acts as the auditable completion record for Phase 7.