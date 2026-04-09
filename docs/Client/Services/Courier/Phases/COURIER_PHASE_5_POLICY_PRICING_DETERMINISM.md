# Client Courier Phase 5 Policy and Pricing Determinism

## Objective
Make pricing outcomes reproducible and conflict-safe by enforcing deterministic policy resolution, stable pricing explanation payload shape, and explicit guardrail coverage for threshold edge cases.

## Implemented
- Added deterministic normalization for pricing explanation policy adjustments in `ClientCourierController`.
  - output is now normalized to a stable list of `{ key, amount }`
  - policy adjustment ordering is fixed by a canonical policy order map
- Added deterministic tie-break logic for active customer contract resolution.
  - primary sort: `priority` (descending)
  - tie-breakers: latest `effectiveFrom`, latest `effectiveTo`, account-specific before `allAccounts`, then original declaration order
- Added deterministic tie-break logic for contract volume tier resolution.
  - primary sort: `minVolume` (descending)
  - tie-breakers: bounded `maxVolume` before unbounded, lower `maxVolume` first, then original declaration order
- Expanded feature-test guardrail coverage in `CourierAdvancedPricingPoliciesTest`:
  - COD minimum fee floor enforcement
  - contract tie-breaking with same priority
  - volume-tier tie-breaking with min/max overlap and specificity

## Added / Updated Tests
- `tests/Feature/Courier/CourierAdvancedPricingPoliciesTest.php`
  - `test_cod_fee_respects_minimum_floor`
  - `test_customer_contract_with_same_priority_prefers_latest_effective_from`
  - `test_customer_contract_volume_tier_prefers_most_specific_max_threshold_on_tie`

## Validation Evidence
- Syntax checks:
  - `php -l app/Http/Controllers/CourierControllers/Client/ClientCourierController.php`
  - `php -l tests/Feature/Courier/CourierAdvancedPricingPoliciesTest.php`
- Targeted feature execution command (with explicit MySQL env override to bypass `phpunit.xml` sqlite defaults):
  - `DB_CONNECTION=mysql DB_DATABASE=Transport DB_HOST=127.0.0.1 DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=*** php artisan test tests/Feature/Courier/CourierAdvancedPricingPoliciesTest.php --filter "cod_fee_respects_minimum_floor|same_priority_prefers_latest_effective_from|most_specific_max_threshold_on_tie" --colors=never`
- Broader pricing suite validation:
  - `DB_CONNECTION=mysql DB_DATABASE=Transport DB_HOST=127.0.0.1 DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=*** php artisan test tests/Feature/Courier/CourierAdvancedPricingPoliciesTest.php tests/Feature/Courier/CourierPricingGovernanceTest.php --colors=never`
  - result: `30 passed (225 assertions)`

## Result
Phase 5 determinism controls are implemented in pricing logic, backed by focused guardrail tests, and validated through targeted and broader MySQL-backed feature suites.
