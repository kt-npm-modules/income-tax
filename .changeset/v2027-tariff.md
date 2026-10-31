---
'@ktarmyshov/income-tax': minor
---

Add the V2027 six-zone annual income-tax model for both 2027 and 2028, with
`deIncomeTaxV2027`, `deSupportedTaxParametersV2027`, public versioned types, and
additive dispatcher support. Preserve the V2021 model for 2021-2026 and shared
assessment/solidarity behavior.

The new annual parameters use provisional government-draft legislation
(BT-Drs. 21/8235), independently tested statutory draft vectors, and are not yet
BMF-verified. This Changeset prepares an eventual 1.1.0 release; stable publication
requires separate final legislative and reference-validation approval.
