# Income tax package revival plan

Research date: 2026-10-30. Status: checkpoints 1–2 complete; checkpoints 3–5 pending.

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
- There are 71 calculation cases plus two package import smoke cases (confirmed by executing the baseline). No existing BMF requests or recorded BMF response fixtures were found in the tests/scripts.
- At research time no local `node_modules` directory existed. Baseline installation and checks were subsequently completed in checkpoint 1; results are recorded below.
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

The user subsequently supplied the revealed BMF documentation. It specifies `/interface/2026Version1.xhtml` and `/interface/2025Version1.xhtml`, a required code `LSt2026ext` valid until 2027-01-15, PAP inputs such as `LZZ`, `RE4` in cents, and `STKL`, and XML outputs including `LSTLZZ` and `SOLZLZZ`. The supplied example is a **Lohnsteuer** calculation. This resolves the previously hidden example, but does not yet establish a direct annual zvE/Einkommensteuer comparison. Revisit that mapping when implementing calculation regressions and the final API checkpoint; no live request was made as part of checkpoint 1.

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

- [x] Install the existing locked dependencies and record baseline build/check/lint/test/coverage results, including any pre-existing failures. Build before package self-import tests.
- [x] Run the dependency checker preview, preserving the TypeScript 6.x constraint. Choose coherent dependency versions, then update the manifest and lockfile together.
- [x] Decide the supported Node range against the full dependency tree. References use Node 22/24/26, but plain `>=22` is insufficient for current ESLint tooling (Node 22.13 minimum). Treat the stricter one-off `ncu` requirement separately unless it becomes a project dependency.
- [x] Introduce shared NodeNext compiler settings, explicit build/test boundaries, non-emitting checks, and correct imports/exports. Type-check `vitest.config.ts` and package import tests with the necessary build prerequisite.
- [x] Migrate ESLint configuration and direct dependencies, review globals/ignore scope, and resolve diagnostics. Update Prettier and format changed files.
- [x] Migrate Vitest/coverage configuration and scripts. Review every remaining dependency as described above; retain packages already current and remove only demonstrated unused dependencies.
- [x] Validate clean installation, source/test type checks, lint, normal/release builds, tests, and coverage. Run publint, inspect `npm pack --dry-run`, and smoke-test the actual tarball's JavaScript and declarations for `.` and `./de` from an external temporary consumer.

Acceptance: modern tooling works locally; public imports and intended package contents remain intact; no calculator behavior changes are hidden in this checkpoint.

### 2. Modernize workflows and maintenance scripts

- [x] Inspect current `kt-workflows/actions` inputs and release behavior before adapting the reference workflows.
- [x] Adapt CI expressions, Node matrix, cache controls, contribution triggers/deduplication, matrix coverage artifacts, Sonar paths, and stable required checks.
- [x] Adapt release and contribution update/reset workflows with this repository's identity and existing squash-based contribution flow. Review manual release semantics explicitly.
- [x] Add/adapt CodeQL; review GitHub Actions dependencies as well as npm updates. Configure sensible Dependabot update groups and prevent automatic TypeScript 7 upgrades.
- [x] Apply fail-fast shell behavior, reconcile lockfile ignore rules, and preserve the Sonar symlink.
- [x] Validate workflow syntax, shell syntax, action contracts, permissions, and failure/skip propagation of aggregate checks. Record any repository variables, secrets, branch rules, or npm publishing settings needing remote verification.

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

### Checkpoint 1 results (2026-10-30)

- Baseline: `npm ci` installed the original lockfile. `check`, `lint`, `test`, and `coverage` passed. `test`/`coverage` reported 144 tests because 71 compiled calculation tests ran again from `dist/tests`, in addition to the 73 source tests. The initial build's publint subprocess could not write the default npm cache in the sandbox; rerunning with `npm_config_cache=/tmp/income-tax-npm-cache` passed. Baseline install reported 19 vulnerabilities (1 low, 4 moderate, 12 high, 2 critical).
- Preview: ran `npm-check-updates@23.1.1` without mutation, excluding TypeScript from its default latest target. Queried available 6.x versions separately. Installed TypeScript 6.0.3 with `~6.0.3`, within the current typescript-eslint peer range. Vitest and V8 coverage are both pinned to 5.0.5 so their exact-version peer requirement stays aligned.
- Dependency resolution: the first in-place major upgrade hit a conflict against the previously installed ESLint 9 tree. Regenerated the lockfile from a clean dependency tree using the reviewed manifest; no peer/engine bypass flags or overrides were used. Removed unused `tsc-alias`; retained `rimraf` because the build scripts use it and `type-fest` because emitted public declarations reference it. `decimal.js` was already current. All other direct dependencies were reviewed and updated, with `@types/node` deliberately selected from the Node 22 line.
- Compiler/lint: introduced shared NodeNext configuration, explicit source `rootDir`, non-emitting source/test checks, and type checking for import smoke tests and Vitest configuration. Migrated ESLint to `defineConfig`, declared its direct imports, restricted Node globals to root configuration files, and enforced type-only imports. Source/test changes are import declarations only; named `Decimal` imports work with NodeNext and retain the same constructor behavior.
- Packaging: retained `.` and `./de`, added `CHANGELOG.md` to the package allowlist, and removed redundant negative entries for directories outside that allowlist. `test` and `coverage` build first so package self-import checks work after a clean checkout. Test discovery is limited to source test files. Added a minor changeset for the runtime minimum and tooling/package fixes.
- Node minimum: raised the declared minimum to 22.13.0 to match current ESLint requirements. Every installed package's declared Node engine accepts 22.13.0. Actual checks were run on Node 24.21.0/npm 11.19.0; other Node versions have not yet been executed. Existing CI still includes Node 20 and must be migrated in checkpoint 2 before treating this branch as ready for CI/release.
- Coverage directory: switched to V8 while retaining `coverage/` for this checkpoint, preserving the existing Sonar path. Move to `coverage-test` and matrix artifacts together with workflows, ignore patterns, and Sonar configuration in checkpoint 2.
- Validation passed: clean `npm ci --offline --cache /tmp/income-tax-npm-cache`, `npm run check`, `npm run check:test`, `npm run lint`, `npm test`, `npm run coverage`, `npm run build:release`, publint, and `changeset status`. Updated tests: **73/73**, two files, no duplicate execution. V8 coverage: **100%** statements, branches, functions, and lines for the existing suite; this does not demonstrate statutory correctness.
- Verified that both type-check commands leave the built files unchanged and that `dist/tests` does not exist. Compared **8,032** single/split calculations for 2021/2025, including fractional incomes, against the baseline build: exact equality for every output field.
- Inspected `npm pack --dry-run` and created the release-build tarball in `/tmp`: 20 files, including changelog/license/README and both entry points, with no tests or source maps. Installed that tarball with production dependencies in an independent temporary consumer and compiled its imports with TypeScript 6, NodeNext, strict mode, and `skipLibCheck: false`; both entry points, public parameter types, and single/split runtime smoke checks passed.
- `npm ls` has no invalid/missing dependencies; all installed TypeScript references resolve to 6.0.3. A fresh online `npm audit --json` reported **0 vulnerabilities**. No calculation formulas, parameter values, test expectations, README text, workflow files, or remote settings were changed.
- Changed files: `package.json`, `package-lock.json`, `tsconfig.base.json` (new), `tsconfig.json`, `tsconfig-test.json`, `eslint.config.js`, `vitest.config.ts`, `.changeset/fresh-tooling.md` (new), `src/de/types.ts`, the five files under `src/de/V2021` that import types/Decimal (`income-params.ts`, `income.ts`, `index.ts`, `solidarity-params.ts`, `solidarity.ts`), both existing test files, and this plan. The Sonar symlink is preserved. Temporary validation artifacts are outside the repository.

### Checkpoint 2 results (2026-10-30)

- Followed the user's instruction to use the supplied references without introducing a different workflow design. Copied the template CI, release, CodeQL, Dependabot auto-merge/auto-release, and contribution update/reset workflows. Parsed workflow objects match the template after replacing the repository identity and removing the template-only `ci-subpackage` job and its two `needs` entries. No changes were made to `../../kt-workflows/actions`.
- CI now follows the reference Node 22/24/26 matrix, contribution push/deduplication rules, cache-reset input, per-Node coverage artifacts, artifact-based Sonar scan, and stable `required-main`/`required-contribution` jobs. Correct expression syntax replaces the old literal action-input strings.
- Coverage now writes to `coverage-test`; the ignore pattern is `coverage*`, and Sonar uses the reference `coverage*/**/lcov.info` pattern. Preserved the existing Sonar symlink. The redundant build invocation in CI is retained exactly as in the reference, even though this package's coverage command also builds.
- Release now uses the reference main-branch `workflow_run` filter and shared release action without the extra lockfile-update job. The existing `changeset:version` command already runs `npm install`. Manual `workflow_dispatch` is retained exactly as in the reference; its job condition still requires successful push `workflow_run` fields, so a manual dispatch currently skips the release job.
- Renamed `update-contribution.yml` to the reference `contribution-update.yml`, added `contribution-reset.yml`, and copied the reference `scripts/contribution-reset.sh` and fail-fast `scripts/push-update.sh`. These scripts/workflows were inspected and syntax-checked, not executed against remote branches.
- Dependabot configuration matches the template, with one required addition: ignore TypeScript versions `>=7.0.0`. Added the reference approval-app inputs to auto-merge/auto-release. Kept the reference npm-only update ecosystem and action versions; no new update policy was invented.
- Inspected the shared action contracts at `../../kt-workflows/actions` (HEAD `e2a8f72`) and checked all supplied input names and required inputs mechanically. The current npm CI/release/approval contracts were also available from the connected GitHub source during investigation; local references were used for the final parity check.
- Validation: workflow YAML parsed successfully; semantic reference-parity assertions passed for all seven workflows and Dependabot; shared action input checks passed; both maintenance scripts passed `bash -n`. Official actionlint 1.7.12 was downloaded to `/tmp` with its release checksum verified. It reports one warning about inline `github.event.pull_request.head.ref` in contribution-reset logging; running it on the original template produces the same warning. With that exact inherited diagnostic filtered for checking the remaining files, actionlint reports no additional issues. ShellCheck is not installed, so actionlint's ShellCheck integration was disabled; Bash syntax was checked separately.
- Runtime/configuration validation: `npm run coverage` passed all 73 tests with 100% statements/branches/functions/lines and generated `coverage-test/lcov.info`; the Sonar glob resolves that file. `npm run lint` passed. Both maintenance scripts match the template content and executable modes, and the Sonar symlink remains intact.
- Reference behavior retained: the aggregate required jobs use the reference default dependency handling, so dependency failure/skipping can skip the aggregate jobs rather than explicitly failing them. This and the inactive manual-release path were identified during review and deliberately left unchanged after the user requested exact reference behavior.
- Remote follow-up after an authorized push: observe GitHub matrix runs, coverage artifacts and Sonar; verify `MATRIX_NODE_VERSION` does not override the default with Node 20, review `CACHE_RESET`, confirm `SONAR_TOKEN`, `WORKFLOW_APP_ID`/`WORKFLOW_APP_PRIVATE_KEY`, optional `APPROVE_APP_ID`/`APPROVE_APP_PRIVATE_KEY`, and publishing configuration. Branch rules must refer to the intended `required-*` check names. Remote secrets/rules and actual release behavior were not changed or verified by local checks.
- Changed boundaries: `.github/workflows` and `.github/dependabot.yml`, `.gitignore`, `.sonarcloud.properties`, `vitest.config.ts`, the two maintenance scripts, and this plan. No calculation code, tax parameters, package dependencies, or README content changed.
