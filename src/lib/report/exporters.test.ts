import { describe, it, expect } from 'vitest';
import { toSarif, toJunit, toMarkdown } from './exporters';
import type { ScanResult } from '../scanner';

const fixture: ScanResult = {
    repoName: 'demo',
    owner: 'acme',
    scanTimestamp: '2026-10-04T00:00:00Z',
    stackInfo: { stack: 'react', isReact: true, isVue: false, isAngular: false, isSvelte: false, isNextJS: false, hasVite: false, hasTypeScript: true, dependencies: {}, projectRoot: '' },
    vulnerabilities: [
        { id: 'v1', type: 'secret-exposure', severity: 'critical', title: 'Hardcoded AWS key', description: 'd', file: 'config.js', line: 3, recommendation: 'rotate' },
    ],
    status: 'high-risk',
    summary: '1 critical',
    scanDuration: 12,
};

describe('exporters', () => {
    it('produces valid SARIF 2.1.0', () => {
        const sarif = JSON.parse(toSarif(fixture));
        expect(sarif.version).toBe('2.1.0');
        expect(sarif.$schema).toContain('sarif-schema-2.1.0');
        expect(sarif.runs[0].results[0].ruleId).toBe('secret-exposure');
        expect(sarif.runs[0].results[0].level).toBe('error');
        expect(sarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe('config.js');
    });

    it('produces JUnit XML', () => {
        expect(toJunit(fixture)).toContain('<testsuite');
        expect(toJunit(fixture)).toContain('secret-exposure');
    });

    it('produces Markdown', () => {
        const md = toMarkdown(fixture);
        expect(md).toContain('# vulscany scan: acme/demo');
        expect(md).toContain('Hardcoded AWS key');
    });
});
