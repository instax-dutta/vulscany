/**
 * Community Vulnerability Patterns
 * User-contributed security patterns for scanning
 */

export interface CommunityPattern {
    id: string;
    name: string;
    description: string;
    pattern: string; // Regex pattern as string
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'xss' | 'injection' | 'auth' | 'crypto' | 'config' | 'other';
    framework: 'react' | 'nextjs' | 'vue' | 'angular' | 'generic';
    recommendation: string;
    submittedBy: string;
    submittedAt: string;
    votes: number;
    verified: boolean;
    examples?: {
        vulnerable: string;
        secure: string;
    };
}

// Default community patterns
export const DEFAULT_PATTERNS: CommunityPattern[] = [
    {
        id: 'comm-001',
        name: 'Console.log with sensitive data',
        description: 'Detects console.log statements that might leak sensitive information',
        pattern: 'console\\.log\\s*\\([^)]*(?:password|token|secret|key|auth)[^)]*\\)',
        severity: 'medium',
        category: 'config',
        framework: 'generic',
        recommendation: 'Remove console.log statements containing sensitive data before deploying',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 42,
        verified: true
    },
    {
        id: 'comm-002',
        name: 'Hardcoded API Keys',
        description: 'Detects potential hardcoded API keys in source code',
        pattern: '(?:api[_-]?key|apikey)\\s*[=:]\\s*["\'][a-zA-Z0-9]{20,}["\']',
        severity: 'critical',
        category: 'auth',
        framework: 'generic',
        recommendation: 'Move API keys to environment variables. Never commit secrets to source control.',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 156,
        verified: true
    },
    {
        id: 'comm-003',
        name: 'localStorage with sensitive data',
        description: 'Detects storing potentially sensitive data in localStorage',
        pattern: 'localStorage\\.setItem\\s*\\([^)]*(?:password|token|secret|key|auth)[^)]*\\)',
        severity: 'high',
        category: 'auth',
        framework: 'generic',
        recommendation: 'Use httpOnly cookies for sensitive tokens. localStorage is accessible to XSS attacks.',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 89,
        verified: true
    },
    {
        id: 'comm-004',
        name: 'React ref with innerHTML',
        description: 'Using ref.current.innerHTML can bypass React XSS protections',
        pattern: 'ref\\.current\\.innerHTML\\s*=',
        severity: 'high',
        category: 'xss',
        framework: 'react',
        recommendation: 'Use React state and JSX instead of direct DOM manipulation',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 34,
        verified: true
    },
    {
        id: 'comm-005',
        name: 'Next.js getServerSideProps query injection',
        description: 'Using query params directly in database queries',
        pattern: 'getServerSideProps[^}]*context\\.query[^}]*(?:find|select|where)',
        severity: 'critical',
        category: 'injection',
        framework: 'nextjs',
        recommendation: 'Validate and sanitize all query parameters before using in database queries',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 67,
        verified: true
    },
    {
        id: 'comm-006',
        name: 'Insecure regex (ReDoS)',
        description: 'Detects potentially catastrophic backtracking regex patterns',
        pattern: '\\(\\[\\^[^\\]]+\\]\\+\\)[\\+\\*]',
        severity: 'medium',
        category: 'other',
        framework: 'generic',
        recommendation: 'Use atomic groups or possessive quantifiers. Test regex with long inputs.',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 23,
        verified: true
    },
    {
        id: 'comm-007',
        name: 'Weak crypto usage',
        description: 'Detects usage of weak cryptographic algorithms',
        pattern: '(?:md5|sha1)\\s*\\(',
        severity: 'high',
        category: 'crypto',
        framework: 'generic',
        recommendation: 'Use SHA-256 or stronger algorithms. MD5 and SHA1 are broken.',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 78,
        verified: true
    },
    {
        id: 'comm-008',
        name: 'Disabled TypeScript strict',
        description: 'TypeScript strict mode is disabled',
        pattern: '"strict"\\s*:\\s*false',
        severity: 'low',
        category: 'config',
        framework: 'generic',
        recommendation: 'Enable strict mode for better type safety and fewer runtime errors',
        submittedBy: 'VullScanny Team',
        submittedAt: '2024-01-01T00:00:00Z',
        votes: 45,
        verified: true
    }
];

/**
 * Load patterns from localStorage
 */
export function loadCommunityPatterns(): CommunityPattern[] {
    if (typeof window === 'undefined') {
        return DEFAULT_PATTERNS;
    }

    const stored = localStorage.getItem('vullscanny_community_patterns');
    if (stored) {
        try {
            const custom = JSON.parse(stored) as CommunityPattern[];
            // Merge default and custom, preserving votes
            return [...DEFAULT_PATTERNS, ...custom.filter(c => !c.id.startsWith('comm-'))];
        } catch {
            return DEFAULT_PATTERNS;
        }
    }
    return DEFAULT_PATTERNS;
}

/**
 * Save custom patterns to localStorage
 */
export function saveCommunityPatterns(patterns: CommunityPattern[]): void {
    if (typeof window === 'undefined') return;
    // Only save user-submitted patterns
    const custom = patterns.filter(p => !p.id.startsWith('comm-'));
    localStorage.setItem('vullscanny_community_patterns', JSON.stringify(custom));
}

/**
 * Submit a new pattern
 */
export function submitPattern(
    name: string,
    description: string,
    pattern: string,
    severity: CommunityPattern['severity'],
    category: CommunityPattern['category'],
    framework: CommunityPattern['framework'],
    recommendation: string,
    userName: string
): CommunityPattern {
    const newPattern: CommunityPattern = {
        id: `user-${Date.now()}`,
        name,
        description,
        pattern,
        severity,
        category,
        framework,
        recommendation,
        submittedBy: userName || 'Anonymous',
        submittedAt: new Date().toISOString(),
        votes: 1,
        verified: false
    };

    const existing = loadCommunityPatterns();
    saveCommunityPatterns([...existing, newPattern]);

    return newPattern;
}

/**
 * Vote for a pattern
 */
export function voteForPattern(patternId: string): void {
    if (typeof window === 'undefined') return;

    // Track user votes
    const votedKey = 'vullscanny_voted_patterns';
    const voted = JSON.parse(localStorage.getItem(votedKey) || '[]');

    if (voted.includes(patternId)) {
        return; // Already voted
    }

    const patterns = loadCommunityPatterns();
    const pattern = patterns.find(p => p.id === patternId);

    if (pattern) {
        pattern.votes++;
        if (!pattern.id.startsWith('comm-')) {
            saveCommunityPatterns(patterns);
        }
        voted.push(patternId);
        localStorage.setItem(votedKey, JSON.stringify(voted));
    }
}

/**
 * Check if user voted for a pattern
 */
export function hasVotedFor(patternId: string): boolean {
    if (typeof window === 'undefined') return false;
    const voted = JSON.parse(localStorage.getItem('vullscanny_voted_patterns') || '[]');
    return voted.includes(patternId);
}

/**
 * Get patterns sorted by votes
 */
export function getTopPatterns(limit = 10): CommunityPattern[] {
    return loadCommunityPatterns()
        .sort((a, b) => b.votes - a.votes)
        .slice(0, limit);
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: CommunityPattern['category']): CommunityPattern[] {
    return loadCommunityPatterns().filter(p => p.category === category);
}

/**
 * Get patterns by framework
 */
export function getPatternsByFramework(framework: CommunityPattern['framework']): CommunityPattern[] {
    return loadCommunityPatterns().filter(p => p.framework === framework || p.framework === 'generic');
}

/**
 * Test a pattern against code
 */
export function testPattern(pattern: string, code: string): boolean {
    try {
        const regex = new RegExp(pattern, 'gi');
        return regex.test(code);
    } catch {
        return false;
    }
}

/**
 * Get all unique categories
 */
export function getCategories(): CommunityPattern['category'][] {
    return ['xss', 'injection', 'auth', 'crypto', 'config', 'other'];
}

/**
 * Get all frameworks
 */
export function getFrameworks(): CommunityPattern['framework'][] {
    return ['react', 'nextjs', 'vue', 'angular', 'generic'];
}

/**
 * Category labels
 */
export const CATEGORY_LABELS: Record<CommunityPattern['category'], string> = {
    xss: 'Cross-Site Scripting',
    injection: 'Injection Attacks',
    auth: 'Authentication',
    crypto: 'Cryptography',
    config: 'Configuration',
    other: 'Other'
};

/**
 * Severity colors
 */
export const SEVERITY_COLORS: Record<CommunityPattern['severity'], string> = {
    critical: '#ff0055',
    high: '#ff6600',
    medium: '#ffaa00',
    low: '#88ff00'
};
