/**
 * In-memory Cache for Threat Intelligence
 */

const memoryCache = new Map<string, { data: any; expiry: number }>();

export async function getCachedThreatData(key: string): Promise<any | null> {
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    return null;
}

export async function getMultipleCachedThreatData(keys: string[]): Promise<any[]> {
    return keys.map(key => {
        const cached = memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }
        return null;
    });
}

export async function setCachedThreatData(
    key: string,
    data: any,
    ttlSeconds: number = 86400
): Promise<void> {
    memoryCache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000,
    });
}

export async function deleteCachedThreatData(key: string): Promise<void> {
    memoryCache.delete(key);
}

export async function getCachedKeys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(memoryCache.keys()).filter(k => regex.test(k));
}

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
        if (value.expiry <= now) {
            memoryCache.delete(key);
        }
    }
}, 3600000);
