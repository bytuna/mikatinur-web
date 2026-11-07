/** Teşhis amaçlı: sunucudan Diyanet kaynağına erişimi dener. GET /projects/namaz-vakti/api/v1/debug/ */
export async function GET() {
  const t0 = Date.now();
  const out: Record<string, unknown> = {};
  try {
    const res = await fetch("https://ezanvakti.emushaf.net/vakitler/9545", {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MkatNur-Web/1.0",
      },
    });
    out.status = res.status;
    const text = await res.text();
    out.bytes = text.length;
    out.head = text.slice(0, 160);
  } catch (e) {
    out.error = String((e as Error)?.message ?? e);
  }
  out.ms = Date.now() - t0;
  return new Response(JSON.stringify(out), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
