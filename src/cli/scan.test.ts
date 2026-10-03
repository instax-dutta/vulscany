import { describe, it, expect } from 'vitest';
import { runScanCommand } from './scan';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import type { ScanResult } from '../lib/scanner';

const fixture: ScanResult = {
    repoName: 'demo', owner: 'acme', scanTimestamp: '2026-10-04T00:00:00Z',
    stackInfo: { stack: 'react', isReact: true, isVue: false, isAngular: false, isSvelte: false, isNextJS: false, hasVite: false, hasTypeScript: true, dependencies: {}, projectRoot: '' },
    vulnerabilities: [{ id: 'v1', type: 'secret-exposure', severity: 'critical', title: 'key', description: 'd', file: 'a.js', line: 1, recommendation: 'r' }],
    status: 'high-risk', summary: '1 critical', scanDuration: 1,
};

describe('runScanCommand', () => {
    it('writes SARIF and exits 1 when high-severity findings exist', async () => {
        const dir = mkdtempSync(path.join(tmpdir(), 'vulscany-'));
        const inPath = path.join(dir, 'scan.json');
        const outPath = path.join(dir, 'out.sarif');
        writeFileSync(inPath, JSON.stringify(fixture));
        const code = await runScanCommand(['--in', inPath, '--out', outPath, '--format', 'sarif']);
        expect(code).toBe(1);
        const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
        expect(parsed.version).toBe('2.1.0');
    });

    it('exits 0 when no blocking findings', async () => {
        const dir = mkdtempSync(path.join(tmpdir(), 'vulscany-'));
        const inPath = path.join(dir, 'scan.json');
        writeFileSync(inPath, JSON.stringify({ ...fixture, vulnerabilities: [], status: 'safe' }));
        const code = await runScanCommand(['--in', inPath, '--out', path.join(dir, 'o.json'), '--format', 'json']);
        expect(code).toBe(0);
        expect(existsSync(path.join(dir, 'o.json'))).toBe(true);
    });
});
