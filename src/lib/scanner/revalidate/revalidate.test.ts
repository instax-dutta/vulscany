import { describe, it, expect } from 'vitest';
import { revalidateFindings, heuristicVerifier } from './revalidate';
import type { Vulnerability } from '../index';

const base: Vulnerability = {
    id: 'v1',
    type: 'dangerous-api',
    severity: 'high',
    title: 'Unsafe HTML Rendering',
    description: 'dangerouslySetInnerHTML usage',
    file: 'App.jsx',
    line: 3,
    snippet: 'dangerouslySetInnerHTML={{ __html: html }}',
    recommendation: 'sanitize',
};

describe('revalidateFindings', () => {
    it('keeps confirmed findings and their severity', async () => {
        const out = await revalidateFindings([base], async () => ({ verdict: 'confirmed', reason: 'evidence present' }));
        expect(out).toHaveLength(1);
        expect(out[0].severity).toBe('high');
    });

    it('drops rejected findings', async () => {
        const out = await revalidateFindings([base], async () => ({ verdict: 'rejected', reason: 'no evidence' }));
        expect(out).toHaveLength(0);
    });

    it('downgrades undecided findings to low severity', async () => {
        const out = await revalidateFindings([base], async () => ({ verdict: 'undecided', reason: 'unclear' }));
        expect(out[0].severity).toBe('low');
    });

    it('heuristicVerifier confirms when snippet contains trigger evidence and rejects clean snippets', async () => {
        expect((await heuristicVerifier(base)).verdict).toBe('confirmed');
        const clean = { ...base, snippet: 'const x = 1;' };
        expect((await heuristicVerifier(clean)).verdict).toBe('rejected');
    });
});
