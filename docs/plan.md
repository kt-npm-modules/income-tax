# Income tax package revival plan

Research date: 2026-10-30. Status: research complete; implementation pending.

## Scope and agreed constraints

- Modernize TypeScript, linting, tests, packaging, workflows, and related configuration using `../npm-typescript-template` and `../digraph-js` as references.
- Review every direct dependency, including runtime dependencies. Updating version ranges alone is insufficient: migrate affected configuration and code and run the relevant checks.
- Stay on the latest compatible **TypeScript 6.x**. Do not install TypeScript 7.
- Investigate calculation correctness independently of existing test expectations.
- Rewrite the English README for developers and AI discovery, informed by direct competitors.
- Implement BMF API verification last. Researching its feasibility now does not make the current calculation BMF-verified.
- Deliver reviewable checkpoints. This plan does not perform a release, commit, push, merge, or change remote repository settings.

## Research baseline

- Repository: `@ktarmyshov/income-tax` 0.1.9, branch `update/to-latest`, HEAD `5913095`; initially clean working tree.
- Reference snapshots: template `216a2cc`, digraph `34a2598`. These are local checkout references, not guarantees about their remote state.
- Included tax parameters cover **2021 and 2025 only**. `V2021` names the model/API, not the complete set of supported years.
- There are 72 calculation cases plus two package import smoke cases. No existing BMF requests or recorded BMF response fixtures were found in the tests/scripts.
- No local `node_modules` directory exists. Baseline build, lint, and tests have not been executed; no dependencies were installed during research.
- Local environment reports Node 24.21.0 and npm 11.19.0.

## Findings: tooling and automation

- The current compiler uses legacy `moduleResolution: node` with `module: esnext`. The references use a shared `tsconfig.base.json`, `NodeNext`, explicit source `rootDir`, and separate test/config checking with `noEmit`.
- `check` currently emits build output, and the test compiler inherits emitting options. Package import tests are excluded from type checking.
- `src/de/types.ts` has extensionless relative type imports. Audit all imports/exports and migrate them for NodeNext; preserve both public entry points (`.` and `./de`).
- ESLint imports `@eslint/js` and `globals` without declaring them directly. Its current `ts.config(...)` setup differs from the references' ESLint `defineConfig(...)` setup.
- `tsc-alias` is declared but no invocation or path aliases were found. Remove it if the implementation audit confirms it is unused.
- `type-fest` is used for `ReadonlyDeep` types. Use explicit type imports and evaluate moving it to devDependencies against the emitted public declarations. Consumers must still be able to resolve any types referenced by the published declarations.
- References use Vitest V8 coverage, `coverage-test`, matrix coverage artifacts, and Sonar consumption of those artifacts. Current package uses Istanbul and a single `coverage/lcov.info` path.
- Current CI passes literal `needs.config.outputs...` strings in some action inputs instead of `${{ ... }}` expressions. Fix these during migration.
- References add contribution branch CI, duplicate-run suppression, contribution update/reset workflows, CodeQL, and stable required checks. Adapt these to this repository; omit template-only subpackage jobs and digraph benchmarks.
- Current release has an extra lockfile-update job absent from the reference release workflow. Inspect the current shared action contract before removing it. `workflow_dispatch` is declared but the job condition requires `workflow_run` fields; explicitly decide and implement manual-run behavior.
- `scripts/push-update.sh` lacks the references' `set -euo pipefail`.
- `package-lock.json` is tracked but also listed in `.gitignore`. Keep it tracked and remove the contradictory ignore rule. Preserve `sonar-project.properties -> .sonarcloud.properties` as a symlink.

### Dependency snapshot

Versions below were read from the public npm registry on the research date. Recheck before implementation; peer requirements take precedence over a blanket upgrade.

| Dependency                  | Current manifest range     | Registry latest | Planned treatment                                                                                                         |
| --------------------------- | -------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `typescript`                | `^5.8.2`                   | `7.0.2`         | Use latest 6.x; `6.0.3` was verified available. Explicitly exclude 7.                                                     |
| `typescript-eslint`         | `^8.26.1`                  | `8.72.1`        | Upgrade with ESLint/config migration; current peer range is TypeScript `>=4.8.4 <6.1.0`.                                  |
| `eslint`                    | `^9.22.0`                  | `10.14.0`       | Migrate to compatible ESLint 10 flat config and fix resulting diagnostics.                                                |
| `@eslint/js`                | Missing direct declaration | `10.0.1`        | Add directly; match ESLint 10.                                                                                            |
| `globals`                   | Missing direct declaration | `17.13.0`       | Add directly; scope globals to actual files/runtime.                                                                      |
| `@eslint/compat`            | `^2.0.0`                   | `2.1.1`         | Update and verify ignore-file integration.                                                                                |
| `eslint-config-prettier`    | `^10.1.2`                  | `10.1.8`        | Update and preserve config ordering.                                                                                      |
| `prettier`                  | `^3.5.3`                   | `3.9.10`        | Update and apply formatting after migration.                                                                              |
| `vitest`                    | `^4.0.3`                   | `5.0.5`         | Update configuration, type checks, scripts, and CI together.                                                              |
| `@vitest/coverage-istanbul` | `^4.0.3`                   | `5.0.5`         | Replace with `@vitest/coverage-v8` at the exact compatible Vitest version, following the references.                      |
| `@types/node`               | `^25.0.2`                  | `26.6.6`        | Select types appropriate to the supported runtime; avoid accidentally using APIs unavailable on the minimum Node version. |
| `@changesets/cli`           | `^2.28.1`                  | `3.0.3`         | Review major-version migration and release-action compatibility.                                                          |
| `publint`                   | `^0.3.11`                  | `0.3.25`        | Update and validate built package entry points.                                                                           |
| `rimraf`                    | `^6.0.1`                   | `6.1.3`         | Update; review whether a dependency remains necessary.                                                                    |
| `tsc-alias`                 | `^1.8.15`                  | `1.9.9`         | Remove if unused, rather than upgrade unused tooling.                                                                     |
| `@ktarmyshov/assert`        | `^0.1.0`                   | `0.1.15`        | Review actual resolved version and API behavior, then update.                                                             |
| `decimal.js`                | `^10.6.0`                  | `10.6.0`        | Already current; retain decimal arithmetic and verify rounding semantics.                                                 |
| `type-fest`                 | `^5.0.1`                   | `5.10.0`        | Update and review declaration/runtime dependency placement.                                                               |

The remembered update-checker name is likely **npm-check-updates** (`ncu`). Its [official documentation](https://github.com/raineorshine/npm-check-updates) describes a read-only report followed by optional manifest updates. Registry latest was 23.1.1, requiring Node `^22.22.2 || ^24.15.0 || >=26` and npm >=10. Use an explicit package name/version for a one-off invocation; do not accidentally invoke the unrelated npm package named `ncu`.

Use a preview first, then apply reviewed groups. Constrain TypeScript to 6.x explicitly; a default `latest` update would currently select 7. Also inspect `npm outdated`, peer/engine requirements, lockfile changes, and audit results. Do not use `--force`, `--legacy-peer-deps`, or blanket `npm audit fix` to conceal incompatibilities.

## Findings: calculation correctness

### Confirmed formula discrepancies

The current recursive calculation accumulates the preceding zones' unrounded endpoint values. The statutory tariff instead specifies explicit decimal offsets for each zone. These are close but not identical, and flooring the final tax makes some differences observable in whole euros.

Examples below were independently reproduced with Python decimal arithmetic using the current source algorithm and the published statutory formulas. They are **not results from executing the installed package or querying the BMF API**.

| Year | Taxable annual income, single | Current algorithm ESt | Statutory ESt | Explanation                                                                  |
| ---- | ----------------------------- | --------------------- | ------------- | ---------------------------------------------------------------------------- |
| 2021 | EUR 14,899                    | EUR 985               | EUR 986       | Zone 2 offset is computed as 950.9589951201 instead of the specified 950.96. |
| 2025 | EUR 17,480                    | EUR 1,023             | EUR 1,024     | Zone 2 offset is computed as 1015.128383107 instead of 1015.13.              |
| 2025 | EUR 68,483                    | EUR 17,851            | EUR 17,850    | Linear zone inherits an approximately EUR 0.0925 offset error.               |
| 2025 | EUR 277,828                   | EUR 105,776           | EUR 105,775   | The inherited offset error continues into the top zone.                      |

The [official 2021 tariff](https://usth.bundesfinanzministerium.de/lsth/2021/A-Einkommensteuergesetz/IV-Tarif/Paragraf-32a/inhalt.html) and [official 2025 tariff](https://grsth.bundesfinanzministerium.de/esth/2025/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html) provide the applicable formulas, boundaries, and rounding rules. The existing coefficients/boundaries are broadly consistent with those tariffs; the demonstrated defect is the derivation of offsets. This explains why many manually checked values can match while some values fail.

There is also a concrete 2021 solidarity boundary defect: at ESt EUR 31,528, the current mitigation branch yields EUR 1,734.06, while the 5.5% cap yields EUR 1,734.04. The hardcoded mitigation boundary 31,528 lets the mitigation result exceed the cap. [SolzG section 4](https://www.gesetze-im-internet.de/solzg_1995/__4.html) defines the cap and cent truncation. Prefer an exact capped formula over an independently rounded crossover threshold.

### Additional issues to verify during implementation

- Verify splitting order: halve combined taxable income, apply statutory whole-euro rounding and tariff, double ESt; calculate solidarity using the doubled assessment basis/exemption and truncate cents at the correct stage.
- Check zero, fractions, odd combined incomes, all boundaries and neighboring euros/cents, high incomes, custom parameters, and unsupported years.
- Reject non-finite input: `Infinity` currently satisfies the non-negative check. Establish a sensible supported numeric range and handling of invalid custom parameters.
- `rates.total` combines the unrounded average income rate with an already rounded solidarity rate. Verify it against the declared definition, normally `total / taxable`, rounded once.
- Define `incomeMarginal` as the analytic marginal **income-tax** rate, with its rounding policy. It is not automatically a finite difference of the rounded tax or a combined ESt/Soli marginal rate.
- Keep taxable income (`zu versteuerndes Einkommen`, zvE) distinct from gross salary. No gross-to-net, payroll withholding, church tax, child allowance calculation, or progression-clause support is implemented.
- The README currently passes `{ income: 50000 }`, but the API requires `{ taxable: 50000 }`. Fix every example and compile the documented examples.
- Custom year parameters are public API. Adding explicit offsets must include a deliberate compatibility policy; do not silently reinterpret legacy objects or publish unsupported exactness claims for them.

## Findings: BMF verification feasibility

The [official developer interface](https://www.bmf-steuerrechner.de/interface/einganginterface.xhtml) exists and explicitly describes automated program testing with XML results. It is intended for program tests, not as a production calculation backend. The [official income-tax calculator](https://www.bmf-steuerrechner.de/ekst/eingabeformekst.xhtml) accepts annual zvE and single/joint assessment and currently lists historical years through 2026.

Research did **not** establish a working income-tax API request/response: the public developer page gates its examples behind an acknowledgement, and the attempted documentation form requests continued to show that notice. The browser host was unavailable. Therefore, endpoint, parameter names, supported historical years, amount units, output fields, and whether the relevant endpoint returns solidarity remain an explicit implementation spike. Do not substitute the Lohnsteuer PAP endpoint and compare wage withholding with annual income tax.

## Findings: competing packages and README positioning

These are discovery/documentation comparisons, not correctness endorsements or exhaustive market coverage.

| Package                                                                                | Relationship                                                                                                         | Useful documentation lesson                                                                                                                                                           |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`german-income-tax`](https://github.com/drinchev/german-income-tax), npm latest 1.0.2 | Direct comparator: annual German income tax, solidarity, couple option, TypeScript/JavaScript examples.              | Show a short single/joint quick start and named output fields. Its README demonstrates 2018; do not infer current-year support from package naming.                                   |
| [`taxjs`](https://github.com/taxcalcs/taxjs), npm latest 2023.1.0                      | Adjacent: TypeScript/JavaScript tax code generated from BMF pseudocode; showcased API is Lohnsteuer with PAP inputs. | Explain provenance and numeric precision, but distinguish this package's simpler annual zvE API from payroll tax inputs.                                                              |
| [`lohnsteuerrechner`](https://github.com/canida-software/lohnsteuer), npm latest 1.0.7 | Adjacent: BMF PAP wage-tax calculator; README advertises 2025/2026 and decimal arithmetic.                           | Clear feature/year list, units, output examples, and validation description make intended use easier to identify. Its validation claims are its own, not evidence about this package. |

Position this package around **German annual income tax / Einkommensteuer from taxable income (zvE), solidarity surcharge / Solidaritätszuschlag, and joint assessment / Ehegattensplitting, with TypeScript declarations and custom year parameters**. Claim local/offline computation only as verified from the implementation. Do not imply all-country coverage, all-year support, payroll features, or official BMF endorsement.

README deliverables:

- Descriptive title and opening paragraph with the actual npm name, English/German domain terms, supported runtime/module format, and purpose before the badges.
- Installation and copyable JavaScript/TypeScript quick starts using both supported entry points, `{ taxable }`, a supported year, and `import type` where appropriate.
- Small input/options/output tables: annual EUR units, joint combined income, rate fractions versus percentages, rounding, exceptions, and unsupported-year/custom-parameter behavior.
- Explicit supported-year table derived from parameter exports, with source links and verification status. Explain `V2021` independently from the requested tax year.
- Verified sample output for single and split assessment, including how to display rates as percentages.
- Concise scope/limitations and FAQ answering common queries: gross salary versus zvE, splitting, supported years, offline operation, and the relationship to the BMF calculator.
- A complete, validated custom-parameter example or a linked focused document if the resulting example would overwhelm the quick start.
- Development/validation instructions matching actual scripts; source references, license, and contribution links.
- Review package description/keywords for the same accurate terminology. Do not promise AI ranking or add speculative discoverability files/services; correct searchable documentation and executable examples are the initial deliverable.

## Ordered implementation checkpoints

### 1. Establish baseline and migrate tooling with dependencies

- [ ] Install the existing locked dependencies and record baseline build/check/lint/test/coverage results, including any pre-existing failures. Build before package self-import tests.
- [ ] Run the dependency checker preview, preserving the TypeScript 6.x constraint. Choose coherent dependency versions, then update the manifest and lockfile together.
- [ ] Decide the supported Node range against the full dependency tree. References use Node 22/24/26, but plain `>=22` is insufficient for current ESLint tooling (Node 22.13 minimum). Treat the stricter one-off `ncu` requirement separately unless it becomes a project dependency.
- [ ] Introduce shared NodeNext compiler settings, explicit build/test boundaries, non-emitting checks, and correct imports/exports. Type-check `vitest.config.ts` and package import tests with the necessary build prerequisite.
- [ ] Migrate ESLint configuration and direct dependencies, review globals/ignore scope, and resolve diagnostics. Update Prettier and format changed files.
- [ ] Migrate Vitest/coverage configuration and scripts. Review every remaining dependency as described above; retain packages already current and remove only demonstrated unused dependencies.
- [ ] Validate clean installation, source/test type checks, lint, normal/release builds, tests, and coverage. Run publint, inspect `npm pack --dry-run`, and smoke-test the actual tarball's JavaScript and declarations for `.` and `./de` from an external temporary consumer.

Acceptance: modern tooling works locally; public imports and intended package contents remain intact; no calculator behavior changes are hidden in this checkpoint.

### 2. Modernize workflows and maintenance scripts

- [ ] Inspect current `kt-workflows/actions` inputs and release behavior before adapting the reference workflows.
- [ ] Adapt CI expressions, Node matrix, cache controls, contribution triggers/deduplication, matrix coverage artifacts, Sonar paths, and stable required checks.
- [ ] Adapt release and contribution update/reset workflows with this repository's identity and existing squash-based contribution flow. Review manual release semantics explicitly.
- [ ] Add/adapt CodeQL; review GitHub Actions dependencies as well as npm updates. Configure sensible Dependabot update groups and prevent automatic TypeScript 7 upgrades.
- [ ] Apply fail-fast shell behavior, reconcile lockfile ignore rules, and preserve the Sonar symlink.
- [ ] Validate workflow syntax, shell syntax, action contracts, permissions, and failure/skip propagation of aggregate checks. Record any repository variables, secrets, branch rules, or npm publishing settings needing remote verification.

Acceptance: a reviewable workflow diff with no unrelated template features; local/static checks pass. GitHub execution, secrets, rulesets, and publishing remain unverified until actually observed remotely.

### 3. Correct tariff calculations and add offline regression coverage

- [ ] Add failing regressions for the demonstrated ESt and Soli discrepancies before changing calculation logic.
- [ ] Encode explicit statutory offsets for built-in years, preserve decimal arithmetic, and settle custom-parameter compatibility.
- [ ] Correct solidarity capping and verify splitting/rounding; address input validation and rate definitions with documented behavior.
- [ ] Compare an independent literal implementation of each year's official formulas against the package across a broad deterministic income range, in addition to focused boundaries and fraction cases. Do not generate expected values from the production helper.
- [ ] Review existing expected results instead of bulk-replacing them with the new implementation's output.
- [ ] Decide whether to add 2026 parameters as a separate visible extension. Fixing existing 2021/2025 correctness is required; adding missing years is not implicit in a tooling update.
- [ ] Add a changeset for user-visible numerical fixes and any runtime/API compatibility changes.

Acceptance: the demonstrated discrepancies are fixed, offline regressions pass, and supported-year results match an independent statutory reference across the chosen coverage range.

### 4. Rewrite README and package discovery metadata

- [ ] Implement the README deliverables above using the corrected API/results and competitor findings.
- [ ] Compile/type-check the published usage examples and execute numerical examples against the built package.
- [ ] Verify export names, links, units, supported years, runtime claims, package metadata, and packed README contents.
- [ ] Describe the validation already achieved; reserve API-comparison claims for checkpoint 5.

Acceptance: a developer or AI assistant can identify the package's scope and successfully use it without reading source code; every numerical or support claim is backed by observed behavior.

### 5. Add BMF API comparison last

- [ ] Resolve the income-tax endpoint spike with a small documented request and raw XML response. Confirm year selection, single/joint mapping, units, returned taxes/rates, rounding, and supported years.
- [ ] If the developer API does not expose the required annual ESt/Soli combination, document the concrete limitation and choose an explicit official-reference fallback; do not present a wage-tax comparison as equivalent.
- [ ] Build a separate test-only adapter with bounded requests, sequential/rate-limited access, timeouts, bounded retries for transient failures, and explicit XML/error handling.
- [ ] Record official response fixtures with source URL/request, year, assessment mode, retrieval date, and raw response. Use synthetic incomes only.
- [ ] Cover built-in years, both assessment modes, zone neighbors, odd/fractional inputs where supported, Soli exemption/crossover cases, and the demonstrated discrepancies. Compare only fields the endpoint actually supplies; retain independent rate tests where necessary.
- [ ] Keep ordinary tests deterministic/offline. Add a distinct manual/scheduled live comparison command/workflow so BMF outages do not block normal PR checks. Report unavailable live verification separately from numerical mismatches; never silently pass it.
- [ ] Run and record the first successful live comparison, then update README validation claims to the exact years, fields, and coverage observed.

Acceptance: reproducible official comparison evidence exists, offline fixtures run in normal CI, live failures are visible, and no production calculation depends on BMF availability.

## Completion evidence

Record commands/results and changed-file boundaries after each checkpoint. Final review must include the TypeScript 6.x restriction, clean-install reproducibility, package exports/declarations, corrected numerical examples, workflow limitations, and the distinction between statutory verification and observed BMF API verification.
