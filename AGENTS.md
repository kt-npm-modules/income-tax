# Repository Development Rules

## Keep tax tariff versions independent

A tariff version is a self-contained unit with its own statutory formula, supported tax years, annual parameters, validation, tests, and reference data. Do **not** mix tax years or tariff-version-specific logic across versions just to reuse test infrastructure.

- `V2021` owns tax years 2021–2026. `V2027` owns 2027–2028 and may gain later years **only if they use the V2027 tariff structure**. New statutory structures require an explicit version decision.
- Keep formula evaluators, version-specific parameters, and version-specific tests separate. Shared production code is appropriate only for genuinely version-independent operations.
- Adding a new version must not require rewriting an older version's working tests, fixtures, or year registration. Preserve existing behavior and historical reference records.
- Design for removal: when an obsolete tariff version is retired, its implementation, tests, case definitions, and reference fixtures should be removable together without disentangling them from other versions.

## Version-specific test suites

Each tariff version has exactly two version-specific test suites:

- `tests/de/<Version>-fixtures.spec.ts`: **offline** tests for that version's years. Include formula, boundary, rounding, splitting, solidarity, validation, and regression tests as appropriate, using independently derived expectations. When approved official BMF fixtures exist, validate those here as well.
- `tests/de/<Version>-live.spec.ts`: **live** comparisons for that version's years against the BMF calculator. Run only for years actually offered by BMF; skip genuinely unavailable years explicitly, but fail on network, parsing, or result mismatches.

For the current models, these are `V2021-fixtures.spec.ts`, `V2021-live.spec.ts`, `V2027-fixtures.spec.ts`, and `V2027-live.spec.ts`. Do not create an extra `V2027.spec.ts` or a combined cross-version suite.

- `V2021` offline comparisons use the existing 2021–2026 official BMF fixtures.
- Until official BMF data exists for 2027–2028, `V2027-fixtures.spec.ts` runs independently calculated, clearly labeled **draft-law** reference vectors. Never present them as official BMF fixtures or fabricate official responses. Add approved official fixture comparisons to that same suite when available.
- `V2027-live.spec.ts` contains only V2027 years and activates comparisons as each year becomes available in the BMF interface.
- A version's suite must register only that version's years. An occasional negative test that another version's year is rejected is fine; registering another version's cases is not.

## Verify generic and version-specific APIs against the same references

Preserve the established V2021 testing pattern from `tests/de/bmf/shared.ts`: **every registered tax case must exercise both `deIncomeTax()` (the public dispatcher) and the matching version-specific function** (`deIncomeTaxV2021()`, `deIncomeTaxV2027()`, etc.).

- Use exactly the same taxable income, assessment options, and independently obtained expected result for both calculation paths. Compare the **complete result** (tax, solidarity, total, and every reported rate) with strict equality; do not merely check that the two functions agree with each other, since both could share a defect.
- Exercise both supported parameter forms: a tax-year number and the corresponding complete versioned parameter object.
- Verify public imports through the package root (`.`) and `./de`, as well as direct source imports where the existing tests support them. The original V2021 helper checks three entry points × two APIs × two parameter forms for each case; retain equivalent coverage for each version.
- Apply this parity rule to both offline reference-vector/fixture comparisons and live BMF comparisons when the reference is available. Centralize reusable assertions if helpful, but **register only the owning version's years inside each version-specific suite**.
- Add coverage for a new tariff version by extending this same verification pattern, not by testing only the version-specific function or only the generic dispatcher.

## Shared infrastructure is not shared ownership

Reusable BMF transport, parsing, availability discovery, fixture loading, and assertion helpers may live under `tests/de/bmf/`. They must **not** turn into a central mixed-version test suite or force version-specific case tables and registrations into one global matrix. Keep ownership of year ranges, boundaries, draft/official reference status, and test registration clear and separable by version.

Favor straightforward duplication of small version-specific definitions over tightly coupling otherwise independent tariff lifecycles. Before refactoring working code or tests from another version, establish a concrete necessity and keep the change minimal. Do not overengineer generic registries or future compatibility layers.

Keep the ordinary test/coverage pipeline offline; live BMF verification remains a separate workflow.