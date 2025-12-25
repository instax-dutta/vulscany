/**
 * Security Score System
 * Calculates and tracks security scores with gamification
 */

export interface SecurityScore {
    score: number;
    maxScore: number;
    breakdown: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    lastUpdated: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    emoji: string;
    earnedAt?: string;
    progress?: number;
    maxProgress?: number;
}

export interface UserStats {
    totalScans: number;
    totalFixes: number;
    reposScanned: number;
    vulnerabilitiesFound: number;
    vulnerabilitiesFixed: number;
    consecutiveSecureDays: number;
    firstScanDate?: string;
    lastScanDate?: string;
    scoreHistory: { date: string; score: number }[];
    achievements: Achievement[];
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-scan',
        name: 'First Steps',
        description: 'Complete your first security scan',
        emoji: '🎯'
    },
    {
        id: 'clean-slate',
        name: 'Clean Slate',
        description: 'Get a perfect 100 score on any repository',
        emoji: '✨'
    },
    {
        id: 'bug-hunter',
        name: 'Bug Hunter',
        description: 'Find 10 vulnerabilities across all scans',
        emoji: '🔍',
        maxProgress: 10
    },
    {
        id: 'security-champion',
        name: 'Security Champion',
        description: 'Fix 10 vulnerabilities',
        emoji: '🏆',
        maxProgress: 10
    },
    {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: '7 consecutive days with secure code',
        emoji: '📅',
        maxProgress: 7
    },
    {
        id: 'repo-explorer',
        name: 'Repo Explorer',
        description: 'Scan 5 different repositories',
        emoji: '🗺️',
        maxProgress: 5
    },
    {
        id: 'century-club',
        name: 'Century Club',
        description: 'Complete 100 scans',
        emoji: '💯',
        maxProgress: 100
    },
    {
        id: 'quick-fix',
        name: 'Quick Fix',
        description: 'Use Auto-Fix to create your first PR',
        emoji: '⚡'
    },
    {
        id: 'eagle-eye',
        name: 'Eagle Eye',
        description: 'Find a critical vulnerability',
        emoji: '🦅'
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 100 score 5 times',
        emoji: '💎',
        maxProgress: 5
    }
];

/**
 * Calculate security score from vulnerabilities
 */
export function calculateScore(vulnerabilities: { severity: string }[]): SecurityScore {
    const breakdown = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    // Count vulnerabilities by severity
    vulnerabilities.forEach(vuln => {
        const severity = vuln.severity.toLowerCase();
        if (severity === 'critical') breakdown.critical++;
        else if (severity === 'high') breakdown.high++;
        else if (severity === 'medium') breakdown.medium++;
        else breakdown.low++;
    });

    // Calculate score with weighted deductions
    let score = 100;
    score -= breakdown.critical * 25;
    score -= breakdown.high * 15;
    score -= breakdown.medium * 8;
    score -= breakdown.low * 3;

    // Clamp between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        maxScore: 100,
        breakdown,
        trend: 'stable',
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
    if (score >= 90) return '#00ff88'; // Green
    if (score >= 70) return '#88ff00'; // Yellow-green
    if (score >= 50) return '#ffaa00'; // Orange
    if (score >= 30) return '#ff6600'; // Dark orange
    return '#ff0055'; // Red
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
}

/**
 * Load user stats from localStorage
 */
export function loadUserStats(): UserStats {
    if (typeof window === 'undefined') {
        return getDefaultStats();
    }

    const stored = localStorage.getItem('vullscanny_user_stats');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return getDefaultStats();
        }
    }
    return getDefaultStats();
}

/**
 * Save user stats to localStorage
 */
export function saveUserStats(stats: UserStats): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('vullscanny_user_stats', JSON.stringify(stats));
}

/**
 * Get default stats for new users
 */
function getDefaultStats(): UserStats {
    return {
        totalScans: 0,
        totalFixes: 0,
        reposScanned: 0,
        vulnerabilitiesFound: 0,
        vulnerabilitiesFixed: 0,
        consecutiveSecureDays: 0,
        scoreHistory: [],
        achievements: ACHIEVEMENTS.map(a => ({ ...a, progress: 0 }))
    };
}

/**
 * Update stats after a scan
 */
export function updateStatsAfterScan(
    stats: UserStats,
    repoName: string,
    score: SecurityScore,
    vulnerabilitiesCount: number
): UserStats {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Update counts
    const updatedStats: UserStats = {
        ...stats,
        totalScans: stats.totalScans + 1,
        vulnerabilitiesFound: stats.vulnerabilitiesFound + vulnerabilitiesCount,
        lastScanDate: now
    };

    // First scan date
    if (!updatedStats.firstScanDate) {
        updatedStats.firstScanDate = now;
    }

    // Track repos scanned (simple count, can enhance later)
    updatedStats.reposScanned = stats.reposScanned + 1;

    // Update score history
    const existingToday = stats.scoreHistory.find(h => h.date === today);
    if (existingToday) {
        existingToday.score = Math.max(existingToday.score, score.score);
    } else {
        updatedStats.scoreHistory = [
            ...stats.scoreHistory.slice(-29), // Keep last 30 days
            { date: today, score: score.score }
        ];
    }

    // Update consecutive secure days
    if (score.score >= 90) {
        updatedStats.consecutiveSecureDays = stats.consecutiveSecureDays + 1;
    } else {
        updatedStats.consecutiveSecureDays = 0;
    }

    // Update achievements
    updatedStats.achievements = checkAchievements(updatedStats, score);

    return updatedStats;
}

/**
 * Update stats after fixing vulnerabilities
 */
export function updateStatsAfterFix(stats: UserStats, fixCount: number): UserStats {
    const updatedStats: UserStats = {
        ...stats,
        totalFixes: stats.totalFixes + 1,
        vulnerabilitiesFixed: stats.vulnerabilitiesFixed + fixCount
    };

    updatedStats.achievements = checkAchievements(updatedStats);
    return updatedStats;
}

/**
 * Check and unlock achievements
 */
function checkAchievements(stats: UserStats, score?: SecurityScore): Achievement[] {
    return stats.achievements.map(achievement => {
        const updated = { ...achievement };

        switch (achievement.id) {
            case 'first-scan':
                if (stats.totalScans >= 1 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'clean-slate':
                if (score && score.score === 100 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'bug-hunter':
                updated.progress = Math.min(stats.vulnerabilitiesFound, 10);
                if (stats.vulnerabilitiesFound >= 10 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'security-champion':
                updated.progress = Math.min(stats.vulnerabilitiesFixed, 10);
                if (stats.vulnerabilitiesFixed >= 10 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'week-warrior':
                updated.progress = Math.min(stats.consecutiveSecureDays, 7);
                if (stats.consecutiveSecureDays >= 7 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'repo-explorer':
                updated.progress = Math.min(stats.reposScanned, 5);
                if (stats.reposScanned >= 5 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'century-club':
                updated.progress = Math.min(stats.totalScans, 100);
                if (stats.totalScans >= 100 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'quick-fix':
                if (stats.totalFixes >= 1 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;

            case 'eagle-eye':
                if (score && score.breakdown.critical > 0 && !achievement.earnedAt) {
                    updated.earnedAt = new Date().toISOString();
                }
                break;
        }

        return updated;
    });
}

/**
 * Get earned achievements
 */
export function getEarnedAchievements(stats: UserStats): Achievement[] {
    return stats.achievements.filter(a => a.earnedAt);
}

/**
 * Get in-progress achievements
 */
export function getInProgressAchievements(stats: UserStats): Achievement[] {
    return stats.achievements.filter(a => !a.earnedAt && a.progress && a.progress > 0);
}
