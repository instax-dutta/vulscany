import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.vulscany');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

interface StoredUser {
  githubId: number;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
  lastScanAt?: number;
}

interface ScanRecord {
  repoName: string;
  repoUrl: string;
  scanType: 'quick' | 'deep' | 'batch';
  vulnerabilitiesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  scanDurationMs: number;
  timestamp: number;
  githubId: number;
}

interface StorageData {
  users: Record<number, StoredUser>;
  scanHistory: ScanRecord[];
}

function defaultData(): StorageData {
  return { users: {}, scanHistory: [] };
}

async function readData(): Promise<StorageData> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultData();
  }
}

async function writeData(data: StorageData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function upsertUser(user: {
  githubId: number;
  email: string;
  name: string;
  avatarUrl?: string;
}): Promise<number> {
  const data = await readData();
  const now = Date.now();
  const existing = data.users[user.githubId];
  data.users[user.githubId] = {
    ...existing,
    ...user,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await writeData(data);
  return user.githubId;
}

export async function getUser(githubId: number): Promise<StoredUser | null> {
  const data = await readData();
  return data.users[githubId] ?? null;
}

export async function updateLastScan(githubId: number): Promise<void> {
  const data = await readData();
  if (data.users[githubId]) {
    data.users[githubId].lastScanAt = Date.now();
    data.users[githubId].updatedAt = Date.now();
    await writeData(data);
  }
}

export async function addScanRecord(record: Omit<ScanRecord, 'timestamp'>): Promise<void> {
  const data = await readData();
  data.scanHistory.push({ ...record, timestamp: Date.now() });
  await writeData(data);
}

export async function getScanHistory(githubId: number): Promise<ScanRecord[]> {
  const data = await readData();
  return data.scanHistory.filter(r => r.githubId === githubId).sort((a, b) => b.timestamp - a.timestamp);
}

export async function exportUserData(githubId: number): Promise<{
  user: StoredUser | null;
  scanHistory: ScanRecord[];
}> {
  const user = await getUser(githubId);
  const history = await getScanHistory(githubId);
  return { user, scanHistory };
}
