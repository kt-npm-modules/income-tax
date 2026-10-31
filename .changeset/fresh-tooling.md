---
'@ktarmyshov/income-tax': minor
---

Require Node.js 22.13 or later and modernize TypeScript, linting, and test tooling. Fix emitted type imports for NodeNext consumers and prevent compiled tests from being included in build output or run twice.

Add `@mirasen/license-gate` as a development dependency and enforce an explicit dependency-license policy with `npm run lint:licenses`, included in normal lint and CI checks. Accept MPL-2.0 in the license allowlist and keep the package-specific `spdx-exceptions@*` exception visible in the report. The gate's Arborist dependency requires a current Node 22 (22.22.2+), Node 24 (24.15.0+), or Node 26+ development environment; the published library's runtime minimum is unchanged.
