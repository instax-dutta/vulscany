import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fs module to prevent real I/O
vi.mock('fs', () => ({
    promises: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn(),
    },
}));

import { promises as fsPromises } from 'fs';
import { getUser, upsertUser } from './local-store';

const mockFs = vi.mocked(fsPromises);

describe('local-store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(process, 'cwd').mockReturnValue('/tmp/vulscany-test');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('I/O layer (readData / writeData via exported functions)', () => {
        it('should fall back to default data when readFile throws', async () => {
            mockFs.readFile.mockRejectedValueOnce(new Error('ENOENT'));

            const user = await getUser(999);

            expect(user).toBeNull();
            expect(mockFs.readFile).toHaveBeenCalledTimes(1);
        });

        it('should parse and return valid JSON from readFile', async () => {
            const testUser = {
                githubId: 123,
                email: 'test@test.com',
                name: 'Test User',
                createdAt: 1000,
                updatedAt: 1000,
            };
            mockFs.readFile.mockResolvedValueOnce(
                JSON.stringify({ users: { 123: testUser }, scanHistory: [] })
            );

            const user = await getUser(123);

            expect(user).not.toBeNull();
            expect(user!.email).toBe('test@test.com');
            expect(user!.name).toBe('Test User');
            expect(user!.githubId).toBe(123);
        });

        it('should call mkdir + writeFile when writing data', async () => {
            mockFs.readFile.mockRejectedValueOnce(new Error('ENOENT'));
            mockFs.mkdir.mockResolvedValueOnce(undefined);
            mockFs.writeFile.mockResolvedValueOnce(undefined);

            const id = await upsertUser({
                githubId: 1,
                email: 'user@test.com',
                name: 'User',
            });

            expect(id).toBe(1);
            expect(mockFs.mkdir).toHaveBeenCalledWith(
                expect.stringContaining('/.vulscany'),
                { recursive: true }
            );
            expect(mockFs.writeFile).toHaveBeenCalledTimes(1);

            const [writePath, writeContent] = mockFs.writeFile.mock.calls[0] as [string, string];
            expect(writePath).toContain('data.json');
            const parsed = JSON.parse(writeContent);
            expect(parsed.users['1']).toBeDefined();
            expect(parsed.users['1'].email).toBe('user@test.com');
            expect(parsed.users['1'].createdAt).toEqual(expect.any(Number));
            expect(parsed.users['1'].updatedAt).toEqual(expect.any(Number));
        });
    });
});
