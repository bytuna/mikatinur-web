import { findNearest } from "@/lib/prayer/places";

/** GET /projects/namaz-vakti/api/v1/nearest/?lat=40.87&lon=29.23 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const headers = { "Content-Type": "application/json; charset=utf-8" };
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return new Response(JSON.stringify({ error: "lat ve lon gerekli" }), {
      status: 400,
      headers: { ...headers, "Cache-Control": "no-store" },
    });
  }
  try {
    const r = await findNearest(lat, lon);
    if (!r) {
      return new Response(JSON.stringify({ error: "Yer bulunamadı" }), {
        status: 404,
        headers: { ...headers, "Cache-Control": "no-store" },
      });
    }
    return new Response(JSON.stringify(r), {
      status: 200,
      headers: { ...headers, "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Hesaplanamadı" }), {
      status: 502,
      headers: { ...headers, "Cache-Control": "no-store" },
    });
  }
}
