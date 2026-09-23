/// <reference types="node" />

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const script = path.resolve('scripts/sync-contract.mjs');
const schema = `openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /api/health/:
    get:
      responses:
        '200':
          description: Healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
`;

function fixtureTree() {
  const root = mkdtempSync(path.join(tmpdir(), 'eld-contract-sync-'));
  const api = path.join(root, 'api');
  const web = path.join(root, 'web');
  mkdirSync(path.join(api, 'tests/fixtures/responses'), { recursive: true });
  mkdirSync(web);
  writeFileSync(path.join(api, 'openapi.yaml'), schema);
  writeFileSync(path.join(api, 'tests/fixtures/responses/sc2.json'), '{"id":"trip-2"}\n');
  return { root, api, web };
}

describe('sync-contract', () => {
  it('copies the schema and fixtures and generates API types', () => {
    const { root, api, web } = fixtureTree();
    try {
      execFileSync(process.execPath, [script, '--api-dir', api, '--web-dir', web]);

      expect(readFileSync(path.join(web, 'src/lib/api/openapi.yaml'), 'utf8')).toBe(schema);
      expect(readFileSync(path.join(web, 'src/lib/api/schema.d.ts'), 'utf8')).toContain(
        '"/api/health/"',
      );
      expect(readFileSync(path.join(web, 'src/test/fixtures/sc2.json'), 'utf8')).toContain(
        'trip-2',
      );
      expect(readFileSync(path.join(web, 'e2e/fixtures/responses/sc2.json'), 'utf8')).toContain(
        'trip-2',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('leaves the web tree unchanged when the API has not published fixtures', () => {
    const { root, api, web } = fixtureTree();
    try {
      rmSync(path.join(api, 'tests/fixtures/responses/sc2.json'));
      const result = spawnSync(process.execPath, [script, '--api-dir', api, '--web-dir', web], {
        encoding: 'utf8',
      });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('No API response fixtures found');
      expect(() => readFileSync(path.join(web, 'src/lib/api/openapi.yaml'))).toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
