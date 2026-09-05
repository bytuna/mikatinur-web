import fs from 'fs/promises';
import path from 'path';
import { pool } from './db';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export type PageVisit = {
  id: string;
  timestamp: string;
  url: string;
  path: string;
  country: string;
  city: string;
  device: DeviceType;
  browser: string;
  os: string;
  referrer: string;
  visitorId: string;
  sessionDurationSec: number;
};

export type AnalyticsStore = {
  visits: PageVisit[];
};

const storePath = path.join(process.cwd(), 'data', 'analytics.json');

async function ensureStore() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify({ visits: [] }, null, 2), 'utf-8');
  }
}

async function readStore(): Promise<AnalyticsStore> {
  await ensureStore();

  try {
    const raw = await fs.readFile(storePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { visits: Array.isArray(parsed.visits) ? parsed.visits : [] };
  } catch {
    return { visits: [] };
  }
}

async function writeStore(store: AnalyticsStore) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf-8');
}

async function tryDbInsert(visit: PageVisit) {
  if (!pool) return false;

  try {
    await pool.query(`
      INSERT INTO analytics_visits (
        id, timestamp, url, path, country, city, device, browser, os, referrer, visitor_id, session_duration_sec
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING;
    `, [
      visit.id,
      visit.timestamp,
      visit.url,
      visit.path,
      visit.country,
      visit.city,
      visit.device,
      visit.browser,
      visit.os,
      visit.referrer,
      visit.visitorId,
      visit.sessionDurationSec,
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function appendVisit(entry: Omit<PageVisit, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
  const visit: PageVisit = {
    id: entry.id ?? crypto.randomUUID(),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    url: entry.url,
    path: entry.path,
    country: entry.country ?? 'Unknown',
    city: entry.city ?? 'Unknown',
    device: entry.device ?? 'desktop',
    browser: entry.browser ?? 'Unknown',
    os: entry.os ?? 'Unknown',
    referrer: entry.referrer ?? 'direct',
    visitorId: entry.visitorId ?? 'anonymous',
    sessionDurationSec: entry.sessionDurationSec ?? 0,
  };

  const dbSaved = await tryDbInsert(visit);

  if (!dbSaved) {
    const store = await readStore();
    store.visits.unshift(visit);
    await writeStore(store);
  }

  return visit;
}

function clampDate(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

async function getDbSummary(days = 30) {
  if (!pool) return null;

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_visits,
        COUNT(DISTINCT visitor_id)::int AS unique_visitors,
        COALESCE(ARRAY_AGG(DISTINCT path ORDER BY count DESC LIMIT 1)[1], '/') AS top_path,
        COALESCE(AVG(session_duration_sec), 0)::float AS avg_session,
        COALESCE(SUM(CASE WHEN timestamp >= $1 THEN 1 ELSE 0 END), 0)::int AS filtered_count
      FROM analytics_visits
      WHERE timestamp >= $1;
    `, [cutoff]);

    return result.rows[0];
  } catch {
    return null;
  }
}

export async function getAnalyticsSummary(days = 30) {
  const dbSummary = await getDbSummary(days);
  const store = await readStore();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const visits = store.visits.filter((visit) => new Date(visit.timestamp) >= cutoff);

  const rangeLabel = days === 1 ? 'Bugün' : days === 7 ? 'Son 7 Gün' : days === 30 ? 'Son 30 Gün' : `Son ${days} Gün`;

  if (dbSummary) {
    const dbVisits = Array.isArray((dbSummary as any).visits) ? (dbSummary as any).visits : [];
    const summaryFallback = {
      totalVisits: Number(dbSummary.total_visits ?? 0),
      uniqueVisitors: Number(dbSummary.unique_visitors ?? 0),
      mostVisitedPage: { path: String(dbSummary.top_path ?? '/'), visits: Number(dbSummary.filtered_count ?? 0) },
      averagePagePerVisit: Number(dbSummary.avg_session ?? 0),
      timeSeries: [],
      countryStats: [],
      deviceStats: [],
      browserStats: [],
      recentVisits: dbVisits,
      rangeLabel,
    };

    if (summaryFallback.totalVisits || summaryFallback.uniqueVisitors || summaryFallback.recentVisits.length) {
      return summaryFallback;
    }
  }

  const uniqueVisitors = new Set(visits.map((visit) => visit.visitorId)).size;
  const totalVisits = visits.length;

  const pageCounts = new Map<string, number>();
  for (const visit of visits) {
    pageCounts.set(visit.path, (pageCounts.get(visit.path) ?? 0) + 1);
  }

  const mostVisitedPage = [...pageCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const timeSeries = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    const count = visits.filter((visit) => visit.timestamp.slice(0, 10) === key).length;

    return {
      date: key,
      visits: count,
      label: date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
    };
  });

  const countryMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  const recent = [...visits].slice(0, 10);

  for (const visit of visits) {
    countryMap.set(visit.country, (countryMap.get(visit.country) ?? 0) + 1);
    deviceMap.set(visit.device, (deviceMap.get(visit.device) ?? 0) + 1);
    browserMap.set(visit.browser, (browserMap.get(visit.browser) ?? 0) + 1);
  }

  const countryStats = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percent: totalVisits ? Number(((count / totalVisits) * 100).toFixed(1)) : 0 }));

  const deviceStats = [...deviceMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percent: totalVisits ? Number(((count / totalVisits) * 100).toFixed(1)) : 0 }));

  const browserStats = [...browserMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percent: totalVisits ? Number(((count / totalVisits) * 100).toFixed(1)) : 0 }));

  return {
    totalVisits,
    uniqueVisitors,
    mostVisitedPage: mostVisitedPage ? { path: mostVisitedPage[0], visits: mostVisitedPage[1] } : { path: '/', visits: 0 },
    averagePagePerVisit: totalVisits ? Number((totalVisits / Math.max(uniqueVisitors, 1)).toFixed(2)) : 0,
    timeSeries,
    countryStats,
    deviceStats,
    browserStats,
    recentVisits: recent,
    rangeLabel,
  };
}

export async function getRecentVisits(limit = 10) {
  const store = await readStore();
  return [...store.visits].slice(0, limit);
}
