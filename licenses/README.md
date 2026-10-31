# Dependency license policy

[`@mirasen/license-gate`](https://github.com/mirasen-io/license-gate) checks the physically installed npm graph, including development dependencies. It runs locally without a registry request or upload. This is a metadata policy check, not a replacement for license obligations or a security audit.

## Running the check

After `npm ci`, run:

```sh
npm run lint:licenses
```

`npm run lint` includes this command, so the existing CI check job also enforces the policy. A violation fails the command and CI. Build, package installation by consumers, and tax calculations do not invoke the gate.

The gate is a devDependency. Its Arborist dependency requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`; use a current Node 22, 24, or 26 release for development. This does not change the income-tax runtime minimum of Node 22.13.0.

## Policy

- `allowed-hard.txt` lists accepted permissive software licenses, MPL-2.0, and public-domain data. Unknown, missing, and unlisted licenses fail by default. SPDX expressions are evaluated by the gate; an OR expression can pass on an allowed alternative.
- MPL-2.0 is accepted for dependencies without individual package exceptions. It is a file-level copyleft license, not a permissive license. The income-tax package remains MIT; redistribution of MPL-covered files must respect their license and source-availability obligations. Lightning CSS currently belongs to development tooling, not the published library's runtime dependencies.
- `allowed-packages.txt` contains `spdx-exceptions@*`, approving all versions of this specific SPDX exception-name dataset, currently under CC-BY-3.0. This does not approve CC-BY-3.0 for other packages. Dataset upgrades do not require a policy edit, so review license changes during dependency updates.
- No namespace overrides are configured. The only all-version override is `spdx-exceptions@*`; every applied exception is visible in the gate report. The root project's MIT license is not evaluated as a dependency.

To inspect installed metadata without changing policy:

```sh
npm exec -- license-gate collect
npm run lint:licenses -- --json /tmp/income-tax-license-report.json
```

When a dependency changes, inspect its declared license and intended use before editing the allowlists. Keep any required copyright notices, attribution, or source-distribution obligations when redistributing third-party material. Development tools and these policy files are not included in the published package allowlist.
