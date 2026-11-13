import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Content Security Policy – sadece site içi kaynakları izin ver
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self';"
  );
  // Strict Transport Security – HTTPS zorunlu
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Cross‑Origin Opener / Embedder Policy – güvenli pencere etkileşimi
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  // MIME sniffing engelle
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export const config = {
  matcher: '/:path*', // tüm isteklerde çalıştır
};
