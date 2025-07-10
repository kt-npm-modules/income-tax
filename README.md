[![NPM Version](https://img.shields.io/npm/v/%40ktarmyshov%2Fincome-tax)](https://www.npmjs.com/package/@ktarmyshov/income-tax)
[![CI](https://github.com/kt-npm-modules/income-tax/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kt-npm-modules/income-tax/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kt-npm-modules_income-tax&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kt-npm-modules_income-tax)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=kt-npm-modules_income-tax&metric=bugs)](https://sonarcloud.io/summary/new_code?id=kt-npm-modules_income-tax)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=kt-npm-modules_income-tax&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=kt-npm-modules_income-tax)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=kt-npm-modules_income-tax&metric=coverage)](https://sonarcloud.io/summary/new_code?id=kt-npm-modules_income-tax)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=kt-npm-modules_income-tax&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=kt-npm-modules_income-tax)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@ktarmyshov/income-tax)](https://socket.dev/npm/package/@ktarmyshov/income-tax/overview)

# income-tax

Income tax calculator.
Supported countries:

- Germany
  - Model as of 2021 for income tax and solidarity surcharge
  - Included parameters for years
    - 2021
    - 2025

# Usage

## Germany/DE

```ts
import { DEIncome, deIncomeTaxV2021 } from '@ktarmyshov/income-tax';
// or
import { DEIncome, deIncomeTaxV2021 } from '@ktarmyshov/income-tax/de';

// Single
const tax = deIncomeTaxV2021(2025, { income: 50000 });
// Split
const tax = deIncomeTaxV2021(2025, { income: 50000 }, { split: true });
// Custom parameters for taxation if not included in the package
const tax = deIncomeTaxV2021(
	2023,
	{ income: 50000 },
	{
		split: true,
		incomeTaxParams: {
			0: {
				boundary: 10908
			},
			// Year 2023, zone 1
			// ESt = (979,18 * y + 1.400) * y
			// y = (zvE - 10.908) / 10.000
			1: {
				boundary: 15999,
				params: {
					subtractor: 10908,
					progression: 979.18,
					constant: 1400
				}
			},
			// year 2023, zone 2
			// ESt = (192,59 * z + 2.397) * z + 966,53
			// z = (zvE - 15.999) / 10.000
			2: {
				boundary: 62809,
				params: {
					subtractor: 15999,
					progression: 192.59,
					constant: 2397
				}
			},
			3: {
				boundary: 277825,
				params: {
					percentage: 0.42
				}
			},
			4: {
				params: {
					percentage: 0.45
				}
			}
		},
		solidaritySurchargeParams: {
			zeroBoundary: 17543,
			mitigationZoneBoundary: 32619,
			mitigationZoneRate: 0.119
		}
	}
);
```
