# @ktarmyshov/income-tax - German Income Tax (Einkommensteuer)

Calculate annual German income tax (Einkommensteuer) and solidarity surcharge (Solidaritätszuschlag) in JavaScript and TypeScript. Supply annual taxable income (zu versteuerndes Einkommen, zvE) in euros, with single or joint assessment (Ehegattensplitting). Built-in final annual tariffs cover 2021-2026; calculations use decimal arithmetic and run offline.

ES modules with TypeScript declarations. For Node.js runtime requirements, see the `engines` field in [package.json](https://github.com/kt-npm-modules/income-tax/blob/main/package.json).

[![npm Version](https://img.shields.io/npm/v/%40ktarmyshov%2Fincome-tax)](https://www.npmjs.com/package/@ktarmyshov/income-tax)
[![CI](https://github.com/kt-npm-modules/income-tax/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kt-npm-modules/income-tax/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kt-npm-modules_income-tax&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kt-npm-modules_income-tax)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=kt-npm-modules_income-tax&metric=coverage)](https://sonarcloud.io/summary/new_code?id=kt-npm-modules_income-tax)
[![MIT License](https://img.shields.io/npm/l/%40ktarmyshov%2Fincome-tax)](https://github.com/kt-npm-modules/income-tax/blob/main/LICENSE)

**Taxable income is not gross salary.** This library calculates tariff tax from an already determined zvE, not payroll withholding or net salary.

## Installation

```sh
npm install @ktarmyshov/income-tax
```

The examples use the 1.0 API. See [Migration from 0.x](#migration-from-0x) before upgrading an existing application.

## Quick Start

### JavaScript

Calculate single assessment for EUR 50,000 of annual taxable income in 2026:

```js
import { deIncomeTax } from '@ktarmyshov/income-tax';

const single = deIncomeTax({ taxable: 50_000 }, 2026);
console.log(single);
```

The result contains amounts in euros and rates as fractions:

```json
{
	"income": 10548,
	"solidarity": 0,
	"total": 10548,
	"rates": {
		"incomeMarginal": 0.3511,
		"incomeAverage": 0.211,
		"solidarity": 0,
		"total": 0.211
	}
}
```

For joint assessment, pass the couple's **combined** annual taxable income:

```js
import { deIncomeTax } from '@ktarmyshov/income-tax';

const joint = deIncomeTax({ taxable: 100_000 }, 2026, { split: true });
console.log(joint.income, joint.solidarity, joint.total); // 21096 0 21096
console.log((joint.rates.incomeAverage * 100).toFixed(2)); // "21.10"
```

### TypeScript

Both `@ktarmyshov/income-tax` and `@ktarmyshov/income-tax/de` export the same German tax functions and types:

```ts
import { deIncomeTax } from '@ktarmyshov/income-tax/de';
import type { DEIncome, DEIncomeTax, DEIncomeTaxOptions } from '@ktarmyshov/income-tax/de';

const income: DEIncome = { taxable: 100_000 };
const options: DEIncomeTaxOptions = { split: true };
const tax: DEIncomeTax = deIncomeTax(income, 2026, options);
console.log(tax.total); // 21096
```

## API Reference

Call `deIncomeTax(income, yearOrParameters, options?)`. The model-specific `deIncomeTaxV2021` uses the same arguments and returns the same result.

### Inputs and Options

The arguments are:

| Argument           | Type                                                   | Meaning                                                                       |
| ------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `income`           | `DEIncome`                                             | `{ taxable: number }`: annual zvE in euros; combined zvE for joint assessment |
| `yearOrParameters` | `DEIncomeTaxSupportedYears` or `DEIncomeTaxParameters` | A built-in year or a complete versioned tariff object                         |
| `options`          | `DEIncomeTaxOptions`                                   | Optional `{ split?: boolean }`; `false` by default                            |

`taxable` must be finite, non-negative, and no greater than `Number.MAX_SAFE_INTEGER`. Fractional euros are accepted. An omitted or `undefined` `split` selects single assessment; JavaScript also treats `null` as the default.

Unsupported years or model versions, invalid taxable income, non-boolean non-nullish split values, and malformed custom parameters throw errors. TypeScript restricts `split` to a boolean and built-in years through `DEIncomeTaxSupportedYears`.

### Result

Rate display follows the German Federal Ministry of Finance (BMF) reference calculator. `DEIncomeTax` contains these fields:

| Field                  | Unit     | Meaning                                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `income`               | EUR      | Annual tariff income tax (Einkommensteuer)                                                  |
| `solidarity`           | EUR      | Solidarity surcharge (Solidaritätszuschlag)                                                 |
| `total`                | EUR      | `income + solidarity`                                                                       |
| `rates.incomeMarginal` | Fraction | Analytic marginal income-tax rate at the whole-euro tariff income                           |
| `rates.incomeAverage`  | Fraction | Income tax divided by the original taxable income, rounded to four decimal places           |
| `rates.solidarity`     | Fraction | Solidarity surcharge divided by the original taxable income, rounded to four decimal places |
| `rates.total`          | Fraction | Sum of the rounded income-average and solidarity rates, matching the BMF display            |

A rate of `0.211` means **21.1%**. `incomeMarginal` excludes solidarity and is not a finite difference of rounded tax amounts.

### Rounding

The calculation follows these rules:

1. For joint assessment, divide the combined taxable income by two before rounding.
2. Floor the tariff income to whole euros, apply the selected annual formula, and floor the income tax to whole euros.
3. For joint assessment, double that income tax.
4. Calculate solidarity on the full assessed income tax, doubling the exemption for joint assessment. Apply the lower of the standard surcharge and mitigation cap, then discard fractions of a cent.

`incomeMarginal` is truncated to four decimal places. The average income and solidarity rates use half-up rounding to four decimal places and the original, unrounded taxable income. At zero taxable income, all rates are zero.

`rates.total` adds the already rounded component rates with decimal arithmetic. It can differ by 0.01 percentage points from dividing `total` by taxable income and rounding only once.

## Supported Years and Sources

The built-in table contains final annual parameters, including the revised allowances for 2022 and 2024:

| Year | Basic Allowance (EUR) | Single Soli Exemption (EUR of Income Tax) | Income Tariff Source                                                                                                                                             |
| ---- | --------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2021 | 9,744                 | 16,956                                    | [BMF LStH 2021, section 32a](https://lsth.bundesfinanzministerium.de/lsth/2021/A-Einkommensteuergesetz/IV-Tarif/Paragraf-32a/inhalt.html)                        |
| 2022 | 10,347                | 16,956                                    | [BMF EStH 2022, section 32a](https://esth.bundesfinanzministerium.de/esth/2022/A-Einkommensteuergesetz/IV-Tarif/Paragraf-32a/inhalt.html)                        |
| 2023 | 10,908                | 17,543                                    | [BMF EStH 2023, section 32a](https://esth.bundesfinanzministerium.de/esth/2023/A-Einkommensteuergesetz/IV-Tarif/Paragraf-32a/inhalt.html)                        |
| 2024 | 11,784                | 18,130                                    | [BMF EStH 2024, section 32a](https://esth.bundesfinanzministerium.de/esth/2024/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html)                 |
| 2025 | 12,096                | 19,950                                    | [BMF EStH 2025, section 32a](https://esth.bundesfinanzministerium.de/esth/2025/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html)                 |
| 2026 | 12,348                | 20,350                                    | [BMF LStH 2026, section 32a](https://amtliche-handbuecher.bundesfinanzministerium.de/lsth/2026/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html) |

The solidarity exemption applies to **income tax**, not taxable income. Its assessment basis, joint exemption, mitigation cap, and cent rounding follow [SolzG sections 3-4](https://amtliche-handbuecher.bundesfinanzministerium.de/lsth/2026/B-Anhaenge/Anhang-27/I/inhalt.html).

All six years have saved BMF reference comparisons for both assessment modes. `V2021` names the tariff model, not a restriction to tax year 2021. No 2027 tariff is bundled.

## Custom Parameters

Use `deSupportedTaxParametersV2021` to inspect or reuse a built-in parameter set:

```ts
import { deIncomeTax, deSupportedTaxParametersV2021 } from '@ktarmyshov/income-tax';

const parameters = deSupportedTaxParametersV2021[2026];
const tax = deIncomeTax({ taxable: 50_000 }, parameters);
console.log(tax.total); // 10548
```

Built-in parameters are deeply readonly and frozen. For a custom tariff, pass a **complete** `DEIncomeTaxParameters` object as the second argument, not partial overrides in options. This example reproduces the built-in 2026 tariff:

```ts
import { deIncomeTax } from '@ktarmyshov/income-tax/de';
import type { DEIncomeTaxParameters } from '@ktarmyshov/income-tax/de';

const parameters: DEIncomeTaxParameters = {
	version: 'V2021',
	income: {
		basicAllowance: 12348,
		firstProgression: {
			upperBoundary: 17799,
			quadraticCoefficient: 914.51,
			linearCoefficient: 1400
		},
		secondProgression: {
			upperBoundary: 69878,
			quadraticCoefficient: 173.1,
			linearCoefficient: 2397,
			constant: 1034.87
		},
		firstLinear: { upperBoundary: 277825, rate: 0.42, subtrahend: 11135.63 },
		secondLinear: { rate: 0.45, subtrahend: 19470.38 }
	},
	solidarity: { exemption: 20350, rate: 0.055, mitigationRate: 0.119 }
};

const tax = deIncomeTax({ taxable: 100_000 }, parameters, { split: true });
console.log(tax.total); // 21096
```

Tariff boundaries must be increasing non-negative safe integers. Coefficients, constants, subtrahends, and the solidarity exemption must be finite and non-negative; rates must be fractions between zero and one. Validation checks the parameter structure and numeric ranges, not whether a custom tariff represents enacted law.

## Scope and Common Questions

### Can I Calculate Net Salary from Gross Wages?

No. Determine annual zvE separately before calling this library. It does not calculate wage withholding (Lohnsteuer), tax classes (Steuerklassen), social-insurance contributions, or gross-to-net salary.

### Does Splitting Determine Eligibility for Joint Assessment?

No. `split: true` applies the splitting tariff (Splittingtarif) to combined zvE. Your application must determine eligibility and the applicable taxable income.

### Does the Library Cover a Complete Tax Return?

No. It does not determine deductions, child allowances, church tax (Kirchensteuer), the progression clause (Progressionsvorbehalt), or tax credits. It does not file returns or integrate with ELSTER. Results are tariff calculations, not a complete assessment or tax advice.

### Does a Calculation Contact BMF?

No. Runtime calculations are local. Network access is limited to the separate live reference tests and fixture refresh command.

## Verification

The reference is the [BMF annual Einkommensteuer calculator](https://www.bmf-steuerrechner.de/ekst/eingabeformekst.xhtml), not its payroll XML interface.

On 2026-10-30, **902 live comparisons** matched the BMF form across 2021-2026, both assessment modes, all returned amounts, and displayed rates. The matrix covers tariff-boundary neighbors, midpoints, fractional and odd joint incomes, solidarity transitions, high incomes, and earlier numerical defects. This is reference testing, not official certification or proof of every possible input.

Normal tests and pull-request CI use saved, dated BMF results without network access. Offline checks also reparse the stored HTML result excerpts and validate inputs, public imports, and frozen parameters. A separate workflow compares fresh BMF results; service failures and mismatches fail that live run. Unavailable historical years are reported separately.

For provenance, case selection, and live-test behavior, see [BMF Annual Income-Tax Reference Tests](https://github.com/kt-npm-modules/income-tax/blob/main/tests/de/bmf/README.md). See [BMF Live Verification](https://github.com/kt-npm-modules/income-tax/actions/workflows/bmf-live.yml) for workflow runs.

## Migration from 0.x

Version 1.0 intentionally removes the old call and custom-parameter contracts:

| Before                                                           | Version 1.0                                                                                               |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `deIncomeTaxV2021(2025, { taxable: 50000 }, options)`            | `deIncomeTaxV2021({ taxable: 50000 }, 2025, options)` or `deIncomeTax({ taxable: 50000 }, 2025, options)` |
| `DETaxOptions`                                                   | `DEIncomeTaxOptions` or `DEIncomeTaxOptionsV2021`                                                         |
| `incomeTaxParams` / `solidaritySurchargeParams` option overrides | Complete `{ version: 'V2021', income, solidarity }` second argument                                       |
| Separate income/solidarity parameter tables                      | `deSupportedTaxParametersV2021`                                                                           |
| Numbered tariff zones                                            | Named statutory formulas shown in [Custom Parameters](#custom-parameters)                                 |

The old README incorrectly used `{ income: 50000 }` as input. Use `{ taxable: 50000 }`. There are no compatibility overloads. Corrected statutory offsets, solidarity capping, and displayed total rates can change results from 0.x.

## Development

For development, use the latest patch release of a Node.js version supported by the [CI configuration](https://github.com/kt-npm-modules/income-tax/blob/main/.github/workflows/ci.yml).

Install the locked dependencies and run the offline checks:

```sh
npm ci
npm run check
npm run lint
npm run coverage
npm run build:release
```

`coverage` builds the package, checks test types, and runs the offline suite. `lint` includes dependency-license validation. `build:release` emits JavaScript and declarations without source maps and checks package exports with publint.

To compare fresh official results or replace stored fixtures, run these optional network commands separately:

```sh
npm run test:bmf
npm run bmf:update-fixtures -- --year=2026
```

Live tests do not overwrite fixtures. Review fixture changes after an explicit refresh.

For contributions, open an [issue](https://github.com/kt-npm-modules/income-tax/issues) or [pull request](https://github.com/kt-npm-modules/income-tax/pulls) with the affected year, assessment mode, synthetic input, and an independent reference result.

## License

[MIT](https://github.com/kt-npm-modules/income-tax/blob/main/LICENSE).
