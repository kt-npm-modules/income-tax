# @ktarmyshov/income-tax

## 1.0.0

### Major Changes

- fbecc33: Introduce `deIncomeTax(income, parameters, options)` and update `deIncomeTaxV2021` to use the same argument order. Pass a supported year (2021–2026) or a complete versioned parameter object, with assessment options such as `split` kept separate.

  Migrate `deIncomeTaxV2021(2025, { taxable: 50000 }, options)` to `deIncomeTaxV2021({ taxable: 50000 }, 2025, options)`. Replace the removed `DETaxOptions` type with `DEIncomeTaxOptions` or `DEIncomeTaxOptionsV2021`. Custom tariffs now require a complete second-argument parameter object with `version: 'V2021'`, `income`, and `solidarity`; the `incomeTaxParams` and `solidaritySurchargeParams` option overrides are removed. No legacy overloads are provided.

  Replace the separate exported `deIncomeTaxSupportedYearsParamsV2021` and `deSolidaritySurchargeSupportedYearsParamsV2021` tables with `deSupportedTaxParametersV2021` and export the public input, output, options, and parameter types through both package entry points. Represent the annual tariff directly with `basicAllowance`, `firstProgression`, `secondProgression`, `firstLinear`, and `secondLinear`. Progressive formulas expose their published coefficients and constant; linear formulas expose their rate and positive subtrahend. This replaces the numbered zones and their generic offsets. Solidarity parameters use `exemption`, `rate`, and `mitigationRate` instead of a rounded crossover boundary.

  Correct the statutory income-tax offsets, solidarity cap and joint-assessment calculation. Built-in parameters are deeply frozen and use the final annual tariffs, including the revised 2022 and 2024 allowances. Reject non-finite or negative taxable incomes, incomes above `Number.MAX_SAFE_INTEGER`, and invalid custom parameter values.

  Rewrite the README for the 1.0 API with single/joint examples, complete custom parameters, supported-year sources, rounding rules, and migration guidance. Update the package description and keywords to identify annual German Einkommensteuer from taxable income, solidarity surcharge, and Ehegattensplitting.

- fbecc33: Match BMF's displayed total rate by adding the rounded income-tax and solidarity rates with Decimal arithmetic. This can differ by 0.01 percentage points from dividing total tax by taxable income and rounding once. This rate-presentation change does not alter tax amounts.

  Replace the legacy tests with shared offline-fixture and live BMF comparisons covering the final annual tariffs for 2021–2026. The reference is the official annual taxable-income HTML calculator, not the payroll XML API. Provide an explicit TypeScript command to refresh auditable official result fixtures.

  Keep normal tests and Node-matrix CI offline. Run live comparisons separately with `npm run test:bmf` and a weekly/manual GitHub workflow on Node 24, without making pull-request checks depend on BMF availability. Production calculations remain offline.

### Minor Changes

- fbecc33: Require Node.js 22.13 or later and modernize TypeScript, linting, and test tooling. Fix emitted type imports for NodeNext consumers and prevent compiled tests from being included in build output or run twice.

  Add `@mirasen/license-gate` as a development dependency and enforce an explicit dependency-license policy with `npm run lint:licenses`, included in normal lint and CI checks. Accept MPL-2.0 in the license allowlist and keep the package-specific `spdx-exceptions@*` exception visible in the report. The gate's Arborist dependency requires a current Node 22 (22.22.2+), Node 24 (24.15.0+), or Node 26+ development environment; the published library's runtime minimum is unchanged.

### Patch Changes

- 647b2a1: dependabot: dependency updates for PR #51

## 0.1.9

### Patch Changes

- e694793: dependabot: directory '/', update @eslint/compat
- e694793: dependabot: directory '/', update @ktarmyshov/assert
- e694793: dependabot: directory '/', update @types/node
- e694793: dependabot: directory '/', update type-fest
- e694793: dependabot: directory '/', update typescript-eslint

## 0.1.8

### Patch Changes

- 9dda938: dependabot: directory '/', update @ktarmyshov/assert
- 9dda938: dependabot: directory '/', update typescript-eslint
- 516f881: dependabot: directory '/', update @eslint/compat
- 516f881: dependabot: directory '/', update @types/node
- 516f881: dependabot: directory '/', update typescript-eslint
- 8f91b7b: dependabot: directory '/', update @types/node
- 8f91b7b: dependabot: directory '/', update @vitest/coverage-istanbul
- 8f91b7b: dependabot: directory '/', update prettier
- 8f91b7b: dependabot: directory '/', update type-fest
- 8f91b7b: dependabot: directory '/', update typescript-eslint
- 8f91b7b: dependabot: directory '/', update vitest
- 5bed61a: dependabot: directory '/', update @types/node
- 5bed61a: dependabot: directory '/', update @vitest/coverage-istanbul
- 5bed61a: dependabot: directory '/', update prettier
- 5bed61a: dependabot: directory '/', update publint
- 5bed61a: dependabot: directory '/', update typescript-eslint
- 5bed61a: dependabot: directory '/', update vitest

## 0.1.7

### Patch Changes

- 3d81f6d: dependabot: directory '/', update typescript-eslint

## 0.1.6

### Patch Changes

- 080d534: dependabot: directory '/', update @changesets/cli
- 080d534: dependabot: directory '/', update @eslint/compat
- 080d534: dependabot: directory '/', update @ktarmyshov/assert
- 080d534: dependabot: directory '/', update @types/node
- 080d534: dependabot: directory '/', update @vitest/coverage-istanbul
- 080d534: dependabot: directory '/', update eslint
- 080d534: dependabot: directory '/', update prettier
- 080d534: dependabot: directory '/', update publint
- 080d534: dependabot: directory '/', update rimraf
- 080d534: dependabot: directory '/', update type-fest
- 080d534: dependabot: directory '/', update typescript-eslint
- 080d534: dependabot: directory '/', update vitest
- 32aa80d: dependabot: directory '/', update @types/node
- 32aa80d: dependabot: directory '/', update @vitest/coverage-istanbul
- 32aa80d: dependabot: directory '/', update typescript-eslint
- 32aa80d: dependabot: directory '/', update vitest
- e62e8d5: dependabot: directory '/', update @ktarmyshov/assert

## 0.1.5

### Patch Changes

- 4e2eeff: dependabot: directory '/', update @eslint/compat
- 4e2eeff: dependabot: directory '/', update @ktarmyshov/assert
- 4e2eeff: dependabot: directory '/', update @types/node
- 4e2eeff: dependabot: directory '/', update @vitest/coverage-istanbul
- 4e2eeff: dependabot: directory '/', update eslint
- 4e2eeff: dependabot: directory '/', update rimraf
- 4e2eeff: dependabot: directory '/', update vitest
- cf1111e: dependabot: directory '/', update @vitest/coverage-istanbul
- cf1111e: dependabot: directory '/', update eslint
- cf1111e: dependabot: directory '/', update type-fest
- cf1111e: dependabot: directory '/', update typescript-eslint
- cf1111e: dependabot: directory '/', update vitest

## 0.1.4

### Patch Changes

- f59063d: dependabot: directory '/', update @ktarmyshov/assert
- f59063d: dependabot: directory '/', update @types/node
- f59063d: dependabot: directory '/', update eslint
- f59063d: dependabot: directory '/', update typescript-eslint
- f59063d: dependabot: directory '/', update typescript
- 1873575: dependabot: directory '/', update @types/node
- 1873575: dependabot: directory '/', update publint
- 1873575: dependabot: directory '/', update typescript-eslint
- 4a1845e: dependabot: directory '/', update @types/node
- 4a1845e: dependabot: directory '/', update eslint
- 4a1845e: dependabot: directory '/', update type-fest
- 4a1845e: dependabot: directory '/', update typescript-eslint
- 5631c83: dependabot: directory '/', update @types/node
- 5631c83: dependabot: directory '/', update @vitest/coverage-istanbul
- 5631c83: dependabot: directory '/', update publint
- 5631c83: dependabot: directory '/', update typescript-eslint
- 5631c83: dependabot: directory '/', update vitest

## 0.1.3

### Patch Changes

- 0ec0dab: dependabot: directory '/', update @ktarmyshov/assert
- 0ec0dab: dependabot: directory '/', update @types/node
- 0ec0dab: dependabot: directory '/', update eslint
- 0ec0dab: dependabot: directory '/', update typescript-eslint
- 8caf801: dependabot: directory '/', update @changesets/cli
- 8caf801: dependabot: directory '/', update @types/node
- 8caf801: dependabot: directory '/', update eslint
- 8caf801: dependabot: directory '/', update publint
- 8caf801: dependabot: directory '/', update type-fest
- 8caf801: dependabot: directory '/', update typescript-eslint
- 4008c21: dependabot: directory '/', update @eslint/compat
- 4008c21: dependabot: directory '/', update typescript-eslint

## 0.1.2

### Patch Changes

- a33afd9: dependabot: directory '/', update @changesets/cli
- a33afd9: dependabot: directory '/', update @types/node
- a33afd9: dependabot: directory '/', update typescript-eslint
- 34ef4bb: dependabot: directory '/', update eslint
- 34ef4bb: dependabot: directory '/', update typescript-eslint
- 2f72182: dependabot: directory '/', update typescript-eslint
- 9025df3: dependabot: directory '/', update @eslint/compat
- 9025df3: dependabot: directory '/', update @ktarmyshov/assert
- 9025df3: dependabot: directory '/', update @types/node
- 9025df3: dependabot: directory '/', update eslint
- 9025df3: dependabot: directory '/', update typescript-eslint
- 9025df3: dependabot: directory '/', update typescript

## 0.1.1

### Patch Changes

- b5d5358: dependabot: directory '/', update @types/node
- b5d5358: dependabot: directory '/', update eslint-config-prettier
- b5d5358: dependabot: directory '/', update eslint
- b5d5358: dependabot: directory '/', update typescript-eslint
- c1fd9c9: dependabot: directory '/', update @types/node
- c1fd9c9: dependabot: directory '/', update eslint
- c1fd9c9: dependabot: directory '/', update typescript-eslint

## 0.1.0

### Minor Changes

- 0949ff4: First release
