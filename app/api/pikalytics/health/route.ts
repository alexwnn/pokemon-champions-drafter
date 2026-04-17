export const revalidate = 60;

export async function GET() {
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch("https://www.pikalytics.com/ai", {
      method: "HEAD",
      signal: ctrl.signal,
    });
    clearTimeout(to);
    const ms = Date.now() - started;
    if (res.ok) {
      return Response.json({ status: "ok", ms });
    }
    return Response.json({ status: "degraded", ms, code: res.status });
  } catch (e) {
    return Response.json({
      status: "down",
      ms: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
