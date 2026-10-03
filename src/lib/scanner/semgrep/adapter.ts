import type { Vulnerability } from '../index';

export interface SemgrepResultEntry {
    check_id?: string;
    path?: string;
    start?: { line?: number; col?: number };
    extra?: { severity?: string; message?: string; lines?: string };
}

export interface SemgrepReport {
    results?: SemgrepResultEntry[];
}

function mapSeverity(sev: string | undefined): Vulnerability['severity'] {
    switch ((sev || '').toUpperCase()) {
        case 'ERROR': return 'high';
        case 'WARNING': return 'medium';
        case 'INFO': return 'low';
        default: return 'medium';
    }
}

export function mapSemgrepResults(report: SemgrepReport): Vulnerability[] {
    if (!report || !Array.isArray(report.results)) return [];

    const out: Vulnerability[] = [];
    for (const r of report.results) {
        if (!r || typeof r.check_id !== 'string' || typeof r.path !== 'string') continue;
        const message = r.extra?.message ?? 'Semgrep finding';
        out.push({
            id: `semgrep-${r.check_id}-${r.path}-${r.start?.line ?? 0}`,
            type: 'code-execution-pattern',
            severity: mapSeverity(r.extra?.severity),
            title: `Semgrep: ${r.check_id}`,
            description: message,
            file: r.path,
            line: r.start?.line,
            snippet: r.extra?.lines,
            recommendation: message,
        });
    }
    return out;
}
