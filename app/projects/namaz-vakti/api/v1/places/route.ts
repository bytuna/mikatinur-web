import { getCountries, getDistricts, getRegions } from "@/lib/prayer/places";

const CACHE = "public, s-maxage=43200, stale-while-revalidate=86400";

function json(body: unknown, status = 200, cache = true) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache ? CACHE : "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/**
 * GET /projects/namaz-vakti/api/v1/places/?type=countries
 * GET /projects/namaz-vakti/api/v1/places/?type=regions&country=2
 * GET /projects/namaz-vakti/api/v1/places/?type=districts&region=539
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const type = sp.get("type");
  try {
    if (type === "countries") return json({ items: await getCountries() });
    if (type === "regions") {
      const id = sp.get("country") ?? "";
      if (!/^\d{1,6}$/.test(id)) return json({ error: "country gerekli" }, 400, false);
      return json({ items: await getRegions(id) });
    }
    if (type === "districts") {
      const id = sp.get("region") ?? "";
      if (!/^\d{1,6}$/.test(id)) return json({ error: "region gerekli" }, 400, false);
      return json({ items: await getDistricts(id) });
    }
    return json({ error: "type: countries | regions | districts" }, 400, false);
  } catch {
    return json({ error: "Kaynak şu an yanıt vermiyor" }, 502, false);
  }
}
