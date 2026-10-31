import { describe } from 'vitest';
import { BmfClient } from './bmf/client.js';
import { discoverLiveYears } from './bmf/availability.js';
import { isV2021Year } from './bmf/cases.js';
import { registerTaxCases } from './bmf/shared.js';

const client = new BmfClient();
// Discovery failures are errors, not evidence that a year is unavailable.
for (const { year, available: supported, diagnostic } of (await discoverLiveYears(client)).filter(
	(entry) => !isV2021Year(entry.year)
)) {
	if (diagnostic) console.warn(diagnostic);
	describe.skipIf(!supported)(
		supported ? 'V2027 BMF live annual income tax' : `V2027 BMF year ${year} unavailable`,
		() => registerTaxCases(year, async (input) => (await client.calculate(input)).expected)
	);
}
