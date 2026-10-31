---
'@ktarmyshov/income-tax': major
---

Match BMF's displayed total rate by adding the rounded income-tax and solidarity rates with Decimal arithmetic. This can differ by 0.01 percentage points from dividing total tax by taxable income and rounding once. This rate-presentation change does not alter tax amounts.

Replace the legacy tests with shared offline-fixture and live BMF comparisons covering the final annual tariffs for 2021–2026. The reference is the official annual taxable-income HTML calculator, not the payroll XML API. Provide an explicit TypeScript command to refresh auditable official result fixtures.

Keep normal tests and Node-matrix CI offline. Run live comparisons separately with `npm run test:bmf` and a weekly/manual GitHub workflow on Node 24, without making pull-request checks depend on BMF availability. Production calculations remain offline.
