import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = new Map();

for (let index = 2; index < process.argv.length; index += 2) {
  const option = process.argv[index];
  const value = process.argv[index + 1];
  if (!['--api-dir', '--web-dir'].includes(option) || !value) {
    throw new Error(`Unknown or incomplete option: ${option}`);
  }
  options.set(option, value);
}

const webDir = path.resolve(options.get('--web-dir') ?? projectDir);
const apiDir = path.resolve(
  options.get('--api-dir') ?? path.resolve(webDir, process.env.API_DIR ?? '../eld-trip-planner-api'),
);
const openapiPath = path.join(apiDir, 'openapi.yaml');
const responseDir = path.join(apiDir, 'tests/fixtures/responses');
const fixtureNames = (await readdir(responseDir)).filter((name) => name.endsWith('.json'));

if (fixtureNames.length === 0) {
  throw new Error(`No API response fixtures found in ${responseDir}`);
}

const openapi = await readFile(openapiPath, 'utf8');
const fixtures = await Promise.all(
  fixtureNames.map(async (name) => {
    const contents = await readFile(path.join(responseDir, name), 'utf8');
    JSON.parse(contents);
    return { name, contents };
  }),
);
const schema = astToString(await openapiTS(pathToFileURL(openapiPath)));

const schemaDir = path.join(webDir, 'src/lib/api');
const fixtureDirs = [
  path.join(webDir, 'src/test/fixtures'),
  path.join(webDir, 'e2e/fixtures/responses'),
];
await Promise.all(
  [schemaDir, ...fixtureDirs].map((directory) => mkdir(directory, { recursive: true })),
);
await Promise.all([
  writeFile(path.join(schemaDir, 'openapi.yaml'), openapi),
  writeFile(path.join(schemaDir, 'schema.d.ts'), schema),
  ...fixtureDirs.flatMap((directory) =>
    fixtures.map(({ name, contents }) => writeFile(path.join(directory, name), contents)),
  ),
]);

process.stdout.write(`Synced OpenAPI types and ${fixtures.length} response fixture(s).\n`);
