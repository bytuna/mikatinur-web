import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/analytics-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days') ?? '7');
    const analytics = await getAnalyticsSummary(Number.isFinite(days) && days > 0 ? days : 7);
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({
      totalVisits: 0,
      uniqueVisitors: 0,
      mostVisitedPage: { path: '/', visits: 0 },
      averagePagePerVisit: 0,
      timeSeries: [],
      countryStats: [],
      deviceStats: [],
      browserStats: [],
      recentVisits: [],
      rangeLabel: 'Son 7 Gün',
    });
  }
}
