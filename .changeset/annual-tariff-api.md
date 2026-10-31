---
'@ktarmyshov/income-tax': major
---

Introduce `deIncomeTax(income, parameters, options)` and update `deIncomeTaxV2021` to use the same argument order. Pass a supported year (2021–2026) or a complete versioned parameter object, with assessment options such as `split` kept separate.

Migrate `deIncomeTaxV2021(2025, { taxable: 50000 }, options)` to `deIncomeTaxV2021({ taxable: 50000 }, 2025, options)`. Replace the removed `DETaxOptions` type with `DEIncomeTaxOptions` or `DEIncomeTaxOptionsV2021`. Custom tariffs now require a complete second-argument parameter object with `version: 'V2021'`, `income`, and `solidarity`; the `incomeTaxParams` and `solidaritySurchargeParams` option overrides are removed. No legacy overloads are provided.

Replace the separate exported `deIncomeTaxSupportedYearsParamsV2021` and `deSolidaritySurchargeSupportedYearsParamsV2021` tables with `deSupportedTaxParametersV2021` and export the public input, output, options, and parameter types through both package entry points. Represent the annual tariff directly with `basicAllowance`, `firstProgression`, `secondProgression`, `firstLinear`, and `secondLinear`. Progressive formulas expose their published coefficients and constant; linear formulas expose their rate and positive subtrahend. This replaces the numbered zones and their generic offsets. Solidarity parameters use `exemption`, `rate`, and `mitigationRate` instead of a rounded crossover boundary.

Correct the statutory income-tax offsets, solidarity cap and joint-assessment calculation. Built-in parameters are deeply frozen and use the final annual tariffs, including the revised 2022 and 2024 allowances. Reject non-finite or negative taxable incomes, incomes above `Number.MAX_SAFE_INTEGER`, and invalid custom parameter values.

Rewrite the README for the 1.0 API with single/joint examples, complete custom parameters, supported-year sources, rounding rules, and migration guidance. Update the package description and keywords to identify annual German Einkommensteuer from taxable income, solidarity surcharge, and Ehegattensplitting.
