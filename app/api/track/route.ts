import { NextResponse } from 'next/server';
import { appendVisit } from '@/lib/analytics-store';

export const runtime = 'nodejs';

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  if (/android|iphone|ipod|ios|mobile/.test(ua)) device = 'mobile';
  else if (/ipad|tablet/.test(ua)) device = 'tablet';

  let browser = 'Other';
  if (/edg|edge/.test(ua)) browser = 'Edge';
  else if (/chrome/.test(ua) && !/opr\//.test(ua)) browser = 'Chrome';
  else if (/firefox/.test(ua)) browser = 'Firefox';
  else if (/safari/.test(ua)) browser = 'Safari';
  else if (/opr\//.test(ua)) browser = 'Opera';

  let os = 'Unknown';
  if (/windows/.test(ua)) os = 'Windows';
  else if (/android/.test(ua)) os = 'Android';
  else if (/iphone|ipad|ios/.test(ua)) os = 'iOS';
  else if (/mac os/.test(ua)) os = 'macOS';
  else if (/linux/.test(ua)) os = 'Linux';

  return { device, browser, os };
}

async function getGeoInfo(ip: string) {
  const fallback = { country: 'Unknown', city: 'Unknown' };

  try {
    const endpoint = ip && ip !== 'unknown' ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    const response = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!response.ok) return fallback;
    const data = await response.json();
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
    };
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ip = ipHeader.split(',')[0].trim();
    const geo = await getGeoInfo(ip);
    const ua = body.userAgent || request.headers.get('user-agent') || 'Unknown';
    const { device, browser, os } = parseUserAgent(ua);
    const url = body.url || 'https://www.mikatinur.com.tr';
    const path = body.path || new URL(url).pathname || '/';

    const visitorId = body.visitorId || `anon-${Date.now()}`;
    const referrer = body.referrer || 'direct';

    await appendVisit({
      id: `${visitorId}-${Date.now()}`,
      url,
      path,
      country: geo.country,
      city: geo.city,
      device,
      browser,
      os,
      referrer,
      visitorId,
      sessionDurationSec: 0,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('analytics_visitor_id', visitorId, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Analytics tracking failed' }, { status: 500 });
  }
}
