import type { Vulnerability } from '../index';

interface SecretPattern {
    name: string;
    pattern: RegExp;
}

const PATTERNS: SecretPattern[] = [
    { name: 'AWS Access Key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
    { name: 'GitHub Token', pattern: /\bghp_[A-Za-z0-9]{36}\b/ },
    { name: 'GitHub Fine-grained Token', pattern: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/ },
    { name: 'OpenAI API Key', pattern: /\bsk-[A-Za-z0-9]{32,}\b/ },
    { name: 'Slack Token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
    { name: 'Private Key Block', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
    { name: 'Generic Secret Assignment', pattern: /(?:secret|api[_-]?key|token|password)\s*[:=]\s*['"][^'"]{8,}['"]/i },
];

export function scanTextForSecrets(content: string, filePath: string): Vulnerability[] {
    const out: Vulnerability[] = [];
    const lines = content.split('\n');
    const seen = new Set<string>();

    for (const { name, pattern } of PATTERNS) {
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                const key = `${name}:${i}`;
                if (seen.has(key)) continue;
                seen.add(key);
                out.push({
                    id: `secret-${name.replace(/\s+/g, '-').toLowerCase()}-${filePath}-${i + 1}`,
                    type: 'secret-exposure',
                    severity: 'high',
                    title: `Possible ${name} exposed`,
                    description: `A hardcoded ${name} was detected in ${filePath}.`,
                    file: filePath,
                    line: i + 1,
                    snippet: lines[i].slice(0, 120),
                    recommendation: 'Move the secret to an environment variable and rotate the credential.',
                });
            }
        }
    }
    return out;
}
