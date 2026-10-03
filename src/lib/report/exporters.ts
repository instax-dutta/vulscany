import type { ScanResult, Vulnerability } from '../scanner';

function sarifLevel(v: Vulnerability): string {
    switch (v.severity) {
        case 'critical':
        case 'high': return 'error';
        case 'medium': return 'warning';
        default: return 'note';
    }
}

export function toSarif(result: ScanResult): string {
    const rules = [...new Set(result.vulnerabilities.map(v => v.type))].map(t => ({
        id: t,
        name: t,
        shortDescription: { text: t },
    }));
    return JSON.stringify({
        $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/sarif-2.1/schema/sarif-schema-2.1.0.json',
        version: '2.1.0',
        runs: [{
            tool: { driver: { name: 'vulscany', rules } },
            results: result.vulnerabilities.map(v => ({
                ruleId: v.type,
                level: sarifLevel(v),
                message: { text: `${v.title}: ${v.description}` },
                locations: [{
                    physicalLocation: {
                        artifactLocation: { uri: v.file },
                        region: { startLine: v.line ?? 1 },
                    },
                }],
            })),
        }],
    }, null, 2);
}

export function toJunit(result: ScanResult): string {
    const cases = result.vulnerabilities.map(v =>
        `    <testcase classname="${v.type}" name="${escapeXml(v.title)}">\n      <failure message="${escapeXml(v.description)}">${escapeXml(v.recommendation)}</failure>\n    </testcase>`
    ).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="vulscany" tests="${result.vulnerabilities.length}" failures="${result.vulnerabilities.length}">\n${cases}\n</testsuite>\n`;
}

export function toMarkdown(result: ScanResult): string {
    const lines = [
        `# vulscany scan: ${result.owner}/${result.repoName}`,
        '',
        `Status: **${result.status}** — ${result.summary}`,
        '',
    ];
    for (const v of result.vulnerabilities) {
        lines.push(`## [${v.severity}] ${v.title}`);
        lines.push(`- File: \`${v.file}\`${v.line ? `:${v.line}` : ''}`);
        lines.push(`- Type: ${v.type}`);
        lines.push(`- ${v.description}`);
        lines.push(`- Fix: ${v.recommendation}`);
        lines.push('');
    }
    return lines.join('\n');
}

function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
