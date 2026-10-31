import { describe } from 'vitest';
import { BmfClient } from './bmf/client.js';
import { discoverLiveYears } from './bmf/availability.js';
import { registerTaxCases } from './bmf/shared.js';

const client = new BmfClient();
// Discovery errors fail the run; only successfully discovered unavailable years skip.
for (const { year, available: supported, diagnostic } of await discoverLiveYears(client)) {
	if (diagnostic) console.warn(diagnostic);
	describe.skipIf(!supported)(
		supported ? 'BMF live annual income tax' : `BMF year ${year} unavailable`,
		() => {
			registerTaxCases(year, async (input) => (await client.calculate(input)).expected);
		}
	);
}
