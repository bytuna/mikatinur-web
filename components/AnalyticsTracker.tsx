'use client';

import { useEffect } from 'react';

export function AnalyticsTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const payload = {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      visitorId: localStorage.getItem('analytics_visitor_id') || undefined,
    };

    if (!payload.visitorId) {
      const generated = `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem('analytics_visitor_id', generated);
      payload.visitorId = generated;
    }

    const controller = new AbortController();

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => undefined);

    return () => controller.abort();
  }, []);

  return null;
}
