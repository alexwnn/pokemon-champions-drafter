import { parseTopList } from "@/lib/pikalytics-parse";

export const revalidate = 3600;

const BASE = "https://www.pikalytics.com/ai/pokedex";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ format: string }> },
) {
  const { format } = await params;
  if (!/^[a-z0-9-]+$/.test(format)) {
    return Response.json({ error: "invalid format" }, { status: 400 });
  }
  try {
    const res = await fetch(`${BASE}/${format}`, {
      headers: { Accept: "text/markdown,text/plain" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return Response.json(
        { error: `upstream ${res.status}` },
        { status: 502 },
      );
    }
    const md = await res.text();
    const list = parseTopList(md, format);
    if (list.entries.length === 0) {
      return Response.json(
        { error: "empty parse", format, entries: [] },
        { status: 502 },
      );
    }
    return Response.json(list, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 502 });
  }
}
