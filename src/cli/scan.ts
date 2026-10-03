import { readFileSync, writeFileSync } from 'fs';
import { toSarif, toJunit, toMarkdown } from '../lib/report/exporters';
import type { ScanResult } from '../lib/scanner';

export async function runScanCommand(args: string[]): Promise<number> {
    const get = (flag: string): string | undefined => {
        const i = args.indexOf(flag);
        return i >= 0 ? args[i + 1] : undefined;
    };
    const inPath = get('--in');
    const outPath = get('--out');
    const format = get('--format') ?? 'sarif';
    if (!inPath || !outPath) {
        console.error('usage: vulscany scan --in <scan.json> --out <out> --format sarif|junit|markdown|json');
        return 2;
    }
    const result: ScanResult = JSON.parse(readFileSync(inPath, 'utf8'));
    const payload = format === 'sarif' ? toSarif(result)
        : format === 'junit' ? toJunit(result)
        : format === 'markdown' ? toMarkdown(result)
        : JSON.stringify(result, null, 2);
    writeFileSync(outPath, payload);
    const blocking = result.vulnerabilities.some(v => v.severity === 'critical' || v.severity === 'high');
    return blocking ? 1 : 0;
}
