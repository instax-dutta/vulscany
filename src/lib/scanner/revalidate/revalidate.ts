import type { Vulnerability } from '../index';

export type Verdict = 'confirmed' | 'rejected' | 'undecided';

export interface Verification {
    verdict: Verdict;
    reason: string;
}

export type FindingVerifier = (finding: Vulnerability) => Promise<Verification>;

const EVIDENCE_TOKENS = [
    'dangerouslySetInnerHTML',
    'v-html',
    'bypassSecurityTrustHtml',
    '{@html',
    'eval(',
    'new Function(',
    'innerHTML',
    'exec(',
    'child_process',
    'AKIA',
    'ghp_',
    'PRIVATE KEY',
    'password',
    'token',
    'secret',
];

export async function heuristicVerifier(finding: Vulnerability): Promise<Verification> {
    const haystack = finding.snippet ?? '';
    const hit = EVIDENCE_TOKENS.some(t => haystack.includes(t));
    if (hit) return { verdict: 'confirmed', reason: 'trigger evidence present in snippet' };
    return { verdict: 'rejected', reason: 'no trigger evidence in snippet' };
}

export async function revalidateFindings(
    findings: Vulnerability[],
    verifier: FindingVerifier
): Promise<Vulnerability[]> {
    const out: Vulnerability[] = [];
    for (const f of findings) {
        const v = await verifier(f);
        if (v.verdict === 'confirmed') {
            out.push(f);
        } else if (v.verdict === 'undecided') {
            out.push({ ...f, severity: 'low' });
        }
    }
    return out;
}
