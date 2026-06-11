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
import { getUser, upsertUser, updateLastScan } from './local-store';

const mockFs = vi.mocked(fsPromises);

describe('local-store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(process, 'cwd').mockReturnValue('/tmp/vulscany-test');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('User operations', () => {
        it('should create a new user with upsertUser', async () => {
            mockFs.readFile.mockRejectedValueOnce(new Error('ENOENT'));
            mockFs.mkdir.mockResolvedValueOnce(undefined);
            mockFs.writeFile.mockResolvedValueOnce(undefined);

            const id = await upsertUser({
                githubId: 42,
                email: 'new@test.com',
                name: 'New User',
            });

            expect(id).toBe(42);
            const [, writeContent] = mockFs.writeFile.mock.calls[0] as [string, string];
            const data = JSON.parse(writeContent);
            expect(data.users['42']).toBeDefined();
            expect(data.users['42'].email).toBe('new@test.com');
            expect(data.users['42'].createdAt).toEqual(expect.any(Number));
            expect(data.users['42'].updatedAt).toEqual(expect.any(Number));
            expect(data.users['42'].createdAt).toBe(data.users['42'].updatedAt);
        });

        it('should merge existing user and preserve createdAt', async () => {
            const existingUser = {
                githubId: 1,
                email: 'old@test.com',
                name: 'Old User',
                createdAt: 1000,
                updatedAt: 1000,
            };
            mockFs.readFile.mockResolvedValueOnce(
                JSON.stringify({ users: { 1: existingUser }, scanHistory: [] })
            );
            mockFs.mkdir.mockResolvedValueOnce(undefined);
            mockFs.writeFile.mockResolvedValueOnce(undefined);

            await upsertUser({
                githubId: 1,
                email: 'updated@test.com',
                name: 'Updated User',
            });

            const [, writeContent] = mockFs.writeFile.mock.calls[0] as [string, string];
            const data = JSON.parse(writeContent);
            expect(data.users['1'].email).toBe('updated@test.com');
            expect(data.users['1'].name).toBe('Updated User');
            expect(data.users['1'].createdAt).toBe(1000);
            expect(data.users['1'].updatedAt).toBeGreaterThan(1000);
        });

        it('should return null for non-existent user', async () => {
            mockFs.readFile.mockResolvedValueOnce(
                JSON.stringify({ users: {}, scanHistory: [] })
            );

            const user = await getUser(999);

            expect(user).toBeNull();
        });

        it('should return full user object for existing user', async () => {
            const existingUser = {
                githubId: 1,
                email: 'existing@test.com',
                name: 'Existing User',
                createdAt: 1000,
                updatedAt: 1000,
            };
            mockFs.readFile.mockResolvedValueOnce(
                JSON.stringify({ users: { 1: existingUser }, scanHistory: [] })
            );

            const user = await getUser(1);

            expect(user).toEqual(existingUser);
        });

        it('should update lastScanAt and updatedAt for existing user', async () => {
            const existingUser = {
                githubId: 1,
                email: 'test@test.com',
                name: 'Test',
                createdAt: 1000,
                updatedAt: 1000,
            };
            mockFs.readFile.mockResolvedValueOnce(
                JSON.stringify({ users: { 1: existingUser }, scanHistory: [] })
            );
            mockFs.mkdir.mockResolvedValueOnce(undefined);
            mockFs.writeFile.mockResolvedValueOnce(undefined);

            await updateLastScan(1);

            const [, writeContent] = mockFs.writeFile.mock.calls[0] as [string, string];
            const data = JSON.parse(writeContent);
            expect(data.users['1'].lastScanAt).toEqual(expect.any(Number));
            expect(data.users['1'].updatedAt).toBeGreaterThan(1000);
        });

        it('should skip updateLastScan for non-existent user', async () => {
            mockFs.readFile.mockResolvedValueOnce(
                JSON.stringify({ users: {}, scanHistory: [] })
            );

            await updateLastScan(999);

            expect(mockFs.writeFile).not.toHaveBeenCalled();
            expect(mockFs.mkdir).not.toHaveBeenCalled();
        });
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
