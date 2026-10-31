# BMF annual income-tax reference tests

Both suites use `cases.ts` and the assertions in `shared.ts`:

- `npm test`: runs `V2021-fixtures.spec.ts` against saved official results, without network access.
- `npm run coverage`: runs the offline suite with source coverage.
- `npm run test:bmf`: runs `V2021-live.spec.ts` against fresh BMF responses, without modifying fixtures.
- `npm run bmf:update-fixtures`: explicitly replaces fixtures with fresh BMF results. Review the resulting diff. Add `-- --year=2026` to update just one supported year, for example if BMF retires older years.

All helpers and commands are TypeScript. The updater runs with project-local `tsx`.

The common inputs cover 2021–2028, single and joint assessment, each tariff boundary from minus four through plus four euros, midpoints, fractional and odd joint incomes, the solidarity exemption/full-rate transitions, high incomes, and counterexamples to the former accumulation algorithm. Input selection uses an independent table of final historical and draft future tariff boundaries; expected results never come from our implementation.

Each case checks all returned amounts and rates through both package entry points (`.` and `./de`), both public functions, and both year/custom-parameter calls. Separate offline checks cover invalid inputs, immutable built-in parameters, and malformed/mismatched BMF responses.

## Reference policy

Three sets are deliberately separate:

- Implemented years: all entries in `cases.ts` (2021-2028), with one common case generator and version-aware assertion helper.
- Approved stored official fixtures: entries explicitly marked `hasOfficialFixtures: true` (2021-2026, 902 records). Missing or corrupt files in this set fail; file existence never determines whether to skip.
- Live availability: discovered afresh from a successfully parsed BMF form, independently of stored fixtures and draft status.

2027 and 2028 have `hasOfficialFixtures: false`. Their independent BigInt rational vectors live in `../draft/V2027-vectors.ts`, with draft source/revision metadata, and are checked by `../V2027.spec.ts`. They are not BMF-verified and must never be copied into `fixtures/` as official results.

When BMF offers a new year, capture it explicitly with `npm run bmf:update-fixtures -- --year=2027` or `--year=2028`. The command discovers availability first and fails clearly before writing if the year is unavailable. Review the complete JSON/raw-HTML pair and provenance, then mark that year's `hasOfficialFixtures` flag true; the existing fixed suite automatically registers it. Default updates select only the approved stored-year set, never unsupported draft years. A retired historical year still causes updater failure; select a currently available year explicitly.

Capture completes an entire year's requests before writing temporary files and atomically renaming each file, preserving the existing replacement behavior. The two renames are not a transactional pair. No capture was performed for this feature and historical fixture bytes remain unchanged.

## Source and provenance

The reference is the [official BMF Einkommensteuer form](https://www.bmf-steuerrechner.de/ekst/eingabeformekst.xhtml). It accepts annual taxable income (zvE), the assessment year, and single/joint assessment. The documented payroll XML endpoint takes wages and is not used as a direct annual-income oracle.

`fixtures/YYYY.json` contains the source URL, echoed request inputs, parsed expected results, and each response's UTC retrieval time. `fixtures/YYYY.html.json.gz` maps each case ID to the original HTML result section, including the echoed inputs and result table. Unrelated navigation and randomized JSF session state are omitted. Gzip keeps these auditable response excerpts small.

Offline tests check the complete case list and reparse every stored HTML section to verify the recorded expectations. Displayed BMF percentages are converted to fractional rates with `Decimal`, so JSON contains values such as `0.2399`, without binary division artifacts. Production results and BMF results are compared exactly.

## Live behavior

Requests run sequentially in the live suite with a short delay, a per-request timeout, and at most one retry of the whole form exchange. Cookies and JSF view state are handled for each request. Redirects must remain on the official origin. The parser requires the requested year, taxable income, assessment mode, all result fields, and a consistent total.

A missing historical year is explicitly reported and its live group skipped; its offline fixtures remain usable. A not-yet-offered draft year is separately reported and skipped. Every offered implemented year gets its entire case matrix, even without stored official fixtures. Network failures, malformed pages, and numerical mismatches fail the live run. If a year disappears after successful discovery, its active comparison fails rather than becoming a skip. The updater fails rather than manufacturing responses for an unavailable year. `client.spec.ts` checks discovery, skip diagnostics, transport/parser failures, session retry, disappearing years, and capture selection entirely with offline mocks.

There are two Vitest configurations: `vitest.config.ts` for offline tests and `vitest.bmf.config.ts` for live tests. Local runs stay separate. GitHub CI runs only the offline coverage suite on its Node matrix. `.github/workflows/bmf-live.yml` runs `npm run test:bmf` separately on Node 24 every Monday at 05:23 UTC and on manual `workflow_dispatch`. Live BMF availability does not block pull-request checks.

BMF displays the total rate as the sum of its already rounded income-tax and solidarity rates. The library follows that display convention; it can differ by 0.01 percentage points from dividing the total tax by taxable income and rounding only once. Decimal arithmetic is used for this addition as well.
