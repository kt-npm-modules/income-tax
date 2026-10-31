import { mkdir, writeFile, rename } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { BmfClient, BMF_URL } from './client.js';
import { taxCases } from './cases.js';
import { parseFixtureYear, selectFixtureYears } from './availability.js';

const selectedYear = parseFixtureYear(process.argv.slice(2));
const client = new BmfClient();
const years = await selectFixtureYears(client, selectedYear);
const formatting = await resolveConfig(fileURLToPath(import.meta.url));
const destination = new URL('./fixtures/', import.meta.url);
await mkdir(destination, { recursive: true });
for (const { year } of years) {
	const cases = taxCases.filter((input) => input.year === year);
	const records = [];
	const responses: Record<string, string> = {};
	for (const [index, input] of cases.entries()) {
		const { expected, html, retrievedAt } = await client.calculate(input);
		records.push({ input, expected, retrievedAt });
		responses[input.id] = html;
		if ((index + 1) % 20 === 0) console.log(`${year}: ${index + 1}/${cases.length}`);
	}
	// Finish a whole year before replacing either of its existing files.
	const json = new URL(`${year}.json`, destination);
	const raw = new URL(`${year}.html.json.gz`, destination);
	await writeFile(
		new URL(`${year}.json.tmp`, destination),
		await format(JSON.stringify({ source: BMF_URL, year, records }), {
			...formatting,
			parser: 'json'
		})
	);
	await writeFile(
		new URL(`${year}.html.json.gz.tmp`, destination),
		gzipSync(JSON.stringify(responses))
	);
	await rename(new URL(`${year}.html.json.gz.tmp`, destination), raw);
	await rename(new URL(`${year}.json.tmp`, destination), json);
	console.log(`${year}: saved ${records.length} official results and compressed raw responses`);
}
