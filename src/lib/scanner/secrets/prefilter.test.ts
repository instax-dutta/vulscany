import { describe, it, expect } from 'vitest';
import { scanTextForSecrets } from './prefilter';

describe('scanTextForSecrets', () => {
    it('flags AWS-style access keys', () => {
        const v = scanTextForSecrets('const key = "AKIAIOSFODNN7EXAMPLE";', 'config.js');
        expect(v.length).toBeGreaterThan(0);
        expect(v[0].type).toBe('secret-exposure');
        expect(v[0].file).toBe('config.js');
    });

    it('flags GitHub tokens', () => {
        const v = scanTextForSecrets('token = "ghp_abcdefghijklmnopqrstuvwxyz0123456789"', '.env.example');
        expect(v.some(x => x.type === 'secret-exposure')).toBe(true);
        expect(v[0].line).toBe(1);
    });

    it('flags private key blocks', () => {
        const v = scanTextForSecrets('-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----', 'key.pem');
        expect(v.length).toBeGreaterThan(0);
    });

    it('produces no findings on clean code', () => {
        const clean = 'export function add(a: number, b: number) {\n    return a + b;\n}\n';
        expect(scanTextForSecrets(clean, 'math.ts')).toEqual([]);
    });
});
