import { parseUsageDetail, slugToPikaName } from "@/lib/pikalytics-parse";

export const revalidate = 3600;

const BASE = "https://www.pikalytics.com/ai/pokedex";

export async function GET(
  _req: Request,
  {
    params,
  }: { params: Promise<{ format: string; pokemon: string }> },
) {
  const { format, pokemon } = await params;
  if (!/^[a-z0-9-]+$/.test(format) || !/^[a-z0-9-]+$/.test(pokemon)) {
    return Response.json({ error: "invalid params" }, { status: 400 });
  }
  const pikaName = slugToPikaName(pokemon);
  try {
    const res = await fetch(`${BASE}/${format}/${encodeURIComponent(pikaName)}`, {
      headers: { Accept: "text/markdown,text/plain" },
      next: { revalidate: 3600 },
    });
    if (res.status === 404) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    if (!res.ok) {
      return Response.json(
        { error: `upstream ${res.status}` },
        { status: 502 },
      );
    }
    const md = await res.text();
    const data = parseUsageDetail(md, pokemon, format);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 502 });
  }
}
