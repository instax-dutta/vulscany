import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { scanTextForSecrets } from '../src/lib/scanner/secrets/prefilter';

describe('benchmark: fixture scan', () => {
    it('finds seeded vulnerabilities and writes a results table', () => {
        const src = readFileSync('benchmarks/fixtures/vulnerable-app.js', 'utf8');
        const secrets = scanTextForSecrets(src, 'vulnerable-app.js');
        expect(secrets.length).toBeGreaterThan(0);
        mkdirSync('docs', { recursive: true });
        const table = '| fixture | findings |\n|---|---|\n| vulnerable-app.js | ' + secrets.length + ' |\n';
        writeFileSync('docs/benchmark-results.md', '# Benchmark Results\n\n' + table);
    });
});
