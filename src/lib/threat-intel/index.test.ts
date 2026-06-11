import { describe, it, expect } from 'vitest';
import { hashDependencies } from './index';

describe('hashDependencies', () => {
    it('is deterministic - same input produces same output', () => {
        const result1 = hashDependencies({ react: '18.0.0', next: '14.0.0' });
        const result2 = hashDependencies({ react: '18.0.0', next: '14.0.0' });
        expect(result1).toBe(result2);
    });

    it('produces different hashes for different inputs', () => {
        const result1 = hashDependencies({ react: '18.0.0' });
        const result2 = hashDependencies({ react: '19.0.0' });
        expect(result1).not.toBe(result2);
    });

    it('sorts keys alphabetically before hashing', () => {
        const result1 = hashDependencies({ b: '2', a: '1' });
        const result2 = hashDependencies({ a: '1', b: '2' });
        expect(result1).toBe(result2);
    });

    it('output is 12-character hex string', () => {
        const result = hashDependencies({ react: '18.0.0', next: '14.0.0' });
        expect(result).toMatch(/^[0-9a-f]{12}$/);
        expect(result).toHaveLength(12);
    });

    it('handles empty object', () => {
        const result = hashDependencies({});
        expect(result).toMatch(/^[0-9a-f]{12}$/);
        expect(result).toHaveLength(12);
    });
});
