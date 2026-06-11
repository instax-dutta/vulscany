/**
 * Scan Results Cache (in-memory for self-hosted / local mode)
 */

const memoryCache = new Map<string, { data: any; expiry: number }>();

/**
 * Sanitize scan result for caching (remove code snippets)
 */
function sanitizeScanResult(result: any): any {
    return {
        repoName: result.repoName,
        owner: result.owner,
        scanTimestamp: result.scanTimestamp,
        stackInfo: {
            stack: result.stackInfo?.stack,
            version: result.stackInfo?.version,
            isNextJS: result.stackInfo?.isNextJS,
            hasTypeScript: result.stackInfo?.hasTypeScript,
        },
        vulnerabilities: result.vulnerabilities?.map((v: any) => ({
            id: v.id,
            type: v.type,
            severity: v.severity,
            title: v.title,
            description: v.description,
            file: v.file,
            line: v.line,
            // Include snippet for AI context and mission-critical fixes
            snippet: v.snippet,
            recommendation: v.recommendation,
        })) || [],
        status: result.status,
        summary: result.summary,
        threatIntelligence: result.threatIntelligence,
    };
}

/**
 * Generate cache key for scan result
 * Uses repository ID + commit SHA for uniqueness
 */
function generateScanCacheKey(owner: string, repo: string, commitSha?: string): string {
    const base = `scan:${owner}:${repo}`;
    return commitSha ? `${base}:${commitSha}` : base;
}

/**
 * Cache scan result (sanitized, no source code)
 */
export async function cacheScanResult(
    owner: string,
    repo: string,
    result: any,
    commitSha?: string
): Promise<void> {
    const key = generateScanCacheKey(owner, repo, commitSha);
    const sanitized = sanitizeScanResult(result);
    const ttl = 3600;

    memoryCache.set(key, {
        data: sanitized,
        expiry: Date.now() + ttl * 1000,
    });
}

/**
 * Retrieve cached scan result
 */
export async function getCachedScanResult(
    owner: string,
    repo: string,
    commitSha?: string
): Promise<any | null> {
    const key = generateScanCacheKey(owner, repo, commitSha);
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    return null;
}

/**
 * Invalidate cached scan result
 */
export async function invalidateScanCache(
    owner: string,
    repo: string,
    commitSha?: string
): Promise<void> {
    const key = generateScanCacheKey(owner, repo, commitSha);
    memoryCache.delete(key);
}

// Cleanup expired memory cache
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
        if (value.expiry <= now) {
            memoryCache.delete(key);
        }
    }
}, 3600000); // Every hour
