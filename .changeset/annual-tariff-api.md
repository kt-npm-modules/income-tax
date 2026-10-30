---
'@ktarmyshov/income-tax': minor
---

Introduce `deIncomeTax(income, parameters, options)` and update `deIncomeTaxV2021` to use the same argument order. Pass a supported year (2021–2026) or a complete versioned parameter object, with assessment options such as `split` kept separate.

Replace the separate exported year tables with `deSupportedTaxParametersV2021` and export the public input, output, options, and parameter types. Represent the annual tariff directly with `basicAllowance`, `firstProgression`, `secondProgression`, `firstLinear`, and `secondLinear`. Progressive formulas expose their published coefficients and constant; linear formulas expose their rate and positive subtrahend. This replaces the numbered zones and their generic offsets. Solidarity parameters use `exemption`, `rate`, and `mitigationRate` instead of a rounded crossover boundary.

Correct the statutory income-tax offsets, solidarity cap and joint-assessment calculation, and total-rate rounding. Built-in parameters are deeply frozen and use the final annual tariffs, including the revised 2022 and 2024 allowances. Reject non-finite taxable incomes and invalid custom parameter values.
