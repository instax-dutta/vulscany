import { describe, it, expect } from 'vitest';
import { mapSemgrepResults } from './adapter';

describe('mapSemgrepResults', () => {
    it('maps a semgrep finding into a Vulnerability', () => {
        const findings = mapSemgrepResults({
            results: [
                {
                    check_id: 'javascript.express.security.sql-injection',
                    path: 'src/server.js',
                    start: { line: 42, col: 7 },
                    extra: {
                        severity: 'ERROR',
                        message: 'SQL injection via string concatenation',
                        lines: 'db.exec("SELECT * FROM users WHERE id=" + req.query.id)',
                    },
                },
            ],
        });

        expect(findings).toHaveLength(1);
        expect(findings[0]).toMatchObject({
            type: 'code-execution-pattern',
            severity: 'high',
            file: 'src/server.js',
            line: 42,
        });
        expect(findings[0].title).toContain('sql-injection');
        expect(findings[0].recommendation).toContain('SQL injection');
    });

    it('maps WARNING severity to medium', () => {
        const findings = mapSemgrepResults({
            results: [
                {
                    check_id: 'insecure-random',
                    path: 'a.js',
                    start: { line: 1, col: 1 },
                    extra: { severity: 'WARNING', message: 'weak randomness', lines: '' },
                },
            ],
        });
        expect(findings[0].severity).toBe('medium');
    });

    it('returns empty array for no results and ignores malformed entries', () => {
        expect(mapSemgrepResults({ results: [] })).toEqual([]);
        expect(mapSemgrepResults({ results: [{ bogus: true }] as never })).toEqual([]);
        expect(mapSemgrepResults({} as never)).toEqual([]);
    });
});
