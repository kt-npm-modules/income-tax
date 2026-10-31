# BMF annual income-tax reference tests

Both suites use `cases.ts` and the assertions in `shared.ts`:

- `npm test`: runs `V2021-fixtures.spec.ts` against saved official results, without network access.
- `npm run coverage`: runs the offline suite with source coverage.
- `npm run test:bmf`: runs `V2021-live.spec.ts` against fresh BMF responses, without modifying fixtures.
- `npm run bmf:update-fixtures`: explicitly replaces fixtures with fresh BMF results. Review the resulting diff. Add `-- --year=2026` to update just one supported year, for example if BMF retires older years.

All helpers and commands are TypeScript. The updater runs with project-local `tsx`.

The common inputs cover 2021–2026, single and joint assessment, each tariff boundary from minus four through plus four euros, midpoints, fractional and odd joint incomes, the solidarity exemption/full-rate transitions, high incomes, and counterexamples to the former accumulation algorithm. Input selection uses an independent table of published tariff boundaries; expected results never come from our implementation.

Each case checks all returned amounts and rates through both package entry points (`.` and `./de`), both public functions, and both year/custom-parameter calls. Separate offline checks cover invalid inputs, immutable built-in parameters, and malformed/mismatched BMF responses.

## Source and provenance

The reference is the [official BMF Einkommensteuer form](https://www.bmf-steuerrechner.de/ekst/eingabeformekst.xhtml). It accepts annual taxable income (zvE), the assessment year, and single/joint assessment. The documented payroll XML endpoint takes wages and is not used as a direct annual-income oracle.

`fixtures/YYYY.json` contains the source URL, echoed request inputs, parsed expected results, and each response's UTC retrieval time. `fixtures/YYYY.html.json.gz` maps each case ID to the original HTML result section, including the echoed inputs and result table. Unrelated navigation and randomized JSF session state are omitted. Gzip keeps these auditable response excerpts small.

Offline tests check the complete case list and reparse every stored HTML section to verify the recorded expectations. Displayed BMF percentages are converted to fractional rates with `Decimal`, so JSON contains values such as `0.2399`, without binary division artifacts. Production results and BMF results are compared exactly.

## Live behavior

Requests run sequentially in the live suite with a short delay, a per-request timeout, and at most one retry of the whole form exchange. Cookies and JSF view state are handled for each request. Redirects must remain on the official origin. The parser requires the requested year, taxable income, assessment mode, all result fields, and a consistent total.

A missing historical year is explicitly reported and its live group skipped; its offline fixtures remain usable. Network failures, malformed pages, and numerical mismatches fail the live run. The updater fails rather than manufacturing responses for an unavailable year.

There are two Vitest configurations: `vitest.config.ts` for offline tests and `vitest.bmf.config.ts` for live tests. Local runs stay separate. GitHub CI runs only the offline coverage suite on its Node matrix. `.github/workflows/bmf-live.yml` runs `npm run test:bmf` separately on Node 24 every Monday at 05:23 UTC and on manual `workflow_dispatch`. Live BMF availability does not block pull-request checks.

BMF displays the total rate as the sum of its already rounded income-tax and solidarity rates. The library follows that display convention; it can differ by 0.01 percentage points from dividing the total tax by taxable income and rounding only once. Decimal arithmetic is used for this addition as well.
