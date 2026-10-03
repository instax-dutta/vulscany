import { describe, it, expect } from 'vitest';
import { runFixLadder } from './fix-ladder';

const okCode = 'export function add(a: number, b: number): number {\n    return a + b;\n}\n';

describe('runFixLadder', () => {
    it('passes a syntactically valid, rescan-clean fix', async () => {
        const r = await runFixLadder(okCode, { repoFiles: [], rescan: async () => [] });
        expect(r.valid).toBe(true);
        expect(r.errors).toEqual([]);
    });

    it('fails empty code', async () => {
        const r = await runFixLadder('', { repoFiles: [], rescan: async () => [] });
        expect(r.valid).toBe(false);
        expect(r.errors.join(' ')).toMatch(/empty/i);
    });

    it('fails when rescan still finds vulnerabilities in the fixed code', async () => {
        const r = await runFixLadder(okCode, {
            repoFiles: [],
            rescan: async () => [{ severity: 'high' } as never],
        });
        expect(r.valid).toBe(false);
    });

    it('fails on syntax error', async () => {
        const r = await runFixLadder('const x: = ;\n', { repoFiles: [], rescan: async () => [] });
        expect(r.valid).toBe(false);
    });
});
