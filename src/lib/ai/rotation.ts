/**
 * API Key Rotation Manager
 * Handles rotation and fallback logic for multiple API keys
 */

export interface APIKeyRotator {
  getNextKey(): string | null;
  markKeyFailed(key: string, error: string): void;
  resetKey(key: string): void;
}

class KeyRotator implements APIKeyRotator {
    private keys: string[];
    private currentIndex: number = 0;
    private failedKeys: Map<string, { count: number; lastFailed: number }> = new Map();
    private readonly cooldownPeriod = 60000; // 1 minute cooldown for failed keys
    private readonly maxFailures = 3;

    constructor(keys: string[]) {
        this.keys = keys.filter(k => k && k.trim().length > 0);
        if (this.keys.length === 0) {
            throw new Error('No valid API keys provided');
        }
    }

    getNextKey(): string | null {
        const now = Date.now();
        const availableKeys = this.keys.filter(key => {
            const failureInfo = this.failedKeys.get(key);
            if (!failureInfo) return true;
      
            // Reset if cooldown period has passed
            if (now - failureInfo.lastFailed > this.cooldownPeriod) {
                this.failedKeys.delete(key);
                return true;
            }
      
            return failureInfo.count < this.maxFailures;
        });

        if (availableKeys.length === 0) {
            return null; // All keys are exhausted
        }

        // Round-robin through available keys
        this.currentIndex = (this.currentIndex + 1) % availableKeys.length;
        return availableKeys[this.currentIndex];
    }

    markKeyFailed(key: string, error: string): void {
        const existing = this.failedKeys.get(key);
        this.failedKeys.set(key, {
            count: existing ? existing.count + 1 : 1,
            lastFailed: Date.now()
        });
    
        console.error(`API Key failed: ${key.substring(0, 8)}... | Error: ${error}`);
    }

    resetKey(key: string): void {
        this.failedKeys.delete(key);
    }
}

export function createKeyRotator(keysString: string): APIKeyRotator {
    const keys = keysString.split(',').map(k => k.trim()).filter(Boolean);
    return new KeyRotator(keys);
}
