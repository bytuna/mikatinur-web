import { getMonth } from "@/lib/prayer/service";

/**
 * GET /projects/namaz-vakti/api/v1/times/?id=9545            (bu ay)
 * GET /projects/namaz-vakti/api/v1/times/?id=9545&month=2026-12
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const id = sp.get("id") ?? "";
  if (!/^\d{1,7}$/.test(id)) {
    return new Response(JSON.stringify({ error: "id gerekli" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  try {
    const data = await getMonth(id, sp.get("month"));
    if (!data) {
      return new Response(JSON.stringify({ error: "Yer bulunamadı" }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Hesaplanamadı" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
