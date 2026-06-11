import { UserStats } from '../security-score';

export async function getRedisUserStats(userId: string | number): Promise<UserStats | null> {
    return null;
}

export async function saveRedisUserStats(userId: string | number, stats: UserStats): Promise<void> {}

export async function incrementUserMetric(
    userId: string | number,
    metric: keyof Pick<UserStats, 'totalScans' | 'totalFixes' | 'vulnerabilitiesFound' | 'vulnerabilitiesFixed'>,
    amount: number = 1
): Promise<void> {}
