import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/analytics-store';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

type BugReportItem = {
  id: string;
  createdAt: string;
  bookTitle: string;
  pageNumber: number;
  description: string;
  reporterEmail?: string;
  url?: string;
};

async function readBugReports(): Promise<BugReportItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'bug-reports.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 30).map((item) => ({
      id: String(item.id ?? ''),
      createdAt: String(item.createdAt ?? ''),
      bookTitle: String(item.bookTitle ?? ''),
      pageNumber: Number(item.pageNumber ?? 0),
      description: String(item.description ?? ''),
      reporterEmail: item.reporterEmail ? String(item.reporterEmail) : '',
      url: item.url ? String(item.url) : '',
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const formId = 'xkolwoep';
  const apiKey = process.env.FORMSPREE_API_KEY;

  const [analytics, bugReports] = await Promise.all([
    getAnalyticsSummary(30).catch(() => ({
      totalVisits: 0,
      uniqueVisitors: 0,
      mostVisitedPage: { path: '/', visits: 0 },
    })),
    readBugReports(),
  ]);

  let messages: Array<{ name?: string; email?: string; category?: string; message?: string; _date?: string }> = [];
  let formspreeConfigured = Boolean(apiKey);

  if (apiKey) {
    try {
      const res = await fetch(`https://formspree.io/api/0/forms/${formId}/submissions`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        messages = Array.isArray(data.submissions) ? data.submissions : [];
      }
    } catch {
      messages = [];
    }
  }

  return NextResponse.json({
    totalVisits: analytics.totalVisits ?? 0,
    uniqueVisitors: analytics.uniqueVisitors ?? 0,
    mostVisitedPage: analytics.mostVisitedPage ?? { path: '/', visits: 0 },
    messages,
    messageCount: messages.length,
    formspreeConfigured,
    bugReports,
    bugReportCount: bugReports.length,
  });
}