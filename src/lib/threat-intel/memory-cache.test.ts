import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getCachedThreatData,
    getMultipleCachedThreatData,
    setCachedThreatData,
    deleteCachedThreatData,
    getCachedKeys,
} from './memory-cache';

describe('Memory Cache', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('setCachedThreatData / getCachedThreatData', () => {
        it('should store and retrieve data', async () => {
            const data = { severity: 'HIGH', cve: 'CVE-2024-12345' };
            await setCachedThreatData('test:key1', data, 3600);
            const result = await getCachedThreatData('test:key1');
            expect(result).toEqual(data);
        });

        it('should return null for non-existent key', async () => {
            const result = await getCachedThreatData('nonexistent');
            expect(result).toBeNull();
        });

        it('should return null for expired entry', async () => {
            await setCachedThreatData('test:expire', { data: 'temp' }, 1);
            vi.advanceTimersByTime(2000);
            const result = await getCachedThreatData('test:expire');
            expect(result).toBeNull();
        });

        it('should use default TTL of 86400 seconds (24 hours)', async () => {
            await setCachedThreatData('test:default-ttl', { data: 'persistent' });
            // Still valid after 12 hours
            vi.advanceTimersByTime(43200000); // 12 hours
            let result = await getCachedThreatData('test:default-ttl');
            expect(result).toEqual({ data: 'persistent' });

            // Expired after 24 hours
            vi.advanceTimersByTime(43200000); // another 12 hours (total 24)
            result = await getCachedThreatData('test:default-ttl');
            expect(result).toBeNull();
        });
    });

    describe('deleteCachedThreatData', () => {
        it('should remove a stored entry', async () => {
            await setCachedThreatData('test:delete-me', { data: 'to-delete' }, 3600);
            await deleteCachedThreatData('test:delete-me');
            const result = await getCachedThreatData('test:delete-me');
            expect(result).toBeNull();
        });

        it('should not throw when deleting non-existent key', async () => {
            await expect(deleteCachedThreatData('does-not-exist')).resolves.toBeUndefined();
        });
    });

    describe('getMultipleCachedThreatData', () => {
        it('should return mixed array of data and nulls', async () => {
            await setCachedThreatData('multi:key1', { id: 1 }, 3600);
            await setCachedThreatData('multi:key2', { id: 2 }, 3600);
            const results = await getMultipleCachedThreatData(['multi:key1', 'multi:key2', 'multi:bad']);
            expect(results).toHaveLength(3);
            expect(results[0]).toEqual({ id: 1 });
            expect(results[1]).toEqual({ id: 2 });
            expect(results[2]).toBeNull();
        });

        it('should return null for expired keys in multi-get', async () => {
            await setCachedThreatData('multi:exp-key', { data: 'expires-soon' }, 1);
            vi.advanceTimersByTime(2000);
            const results = await getMultipleCachedThreatData(['multi:exp-key']);
            expect(results).toHaveLength(1);
            expect(results[0]).toBeNull();
        });
    });

    describe('getCachedKeys pattern matching', () => {
        it('should support wildcard (*) pattern matching', async () => {
            await setCachedThreatData('threats:latest:react', { cve: 'CVE-1' }, 3600);
            await setCachedThreatData('threats:repo:abc', { cve: 'CVE-2' }, 3600);
            await setCachedThreatData('users:123', { name: 'test' }, 3600);

            const threatsKeys = await getCachedKeys('threats:*');
            expect(threatsKeys).toHaveLength(2);
            expect(threatsKeys).toContain('threats:latest:react');
            expect(threatsKeys).toContain('threats:repo:abc');

            const latestKeys = await getCachedKeys('*:latest:*');
            expect(latestKeys).toHaveLength(1);
            expect(latestKeys).toContain('threats:latest:react');
        });

        it('should return empty array for non-matching pattern', async () => {
            await setCachedThreatData('threats:data', { cve: 'CVE-3' }, 3600);
            const result = await getCachedKeys('nomatch:*');
            expect(result).toEqual([]);
        });
    });
});
