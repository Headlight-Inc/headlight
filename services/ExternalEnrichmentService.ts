// ─── Helper: fetch with timeout ──────────────────────
async function fetchWithTimeout(url: string, options: any = {}, timeout: number = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ─── W3C Validator ───────────────────────────────────
export async function validateHtml(url: string): Promise<{errors: number, warnings: number, messages: any[]}> {
  try {
    const resp = await fetchWithTimeout(`https://validator.w3.org/nu/?doc=${encodeURIComponent(url)}&out=json`);
    if (!resp.ok) return { errors: 0, warnings: 0, messages: [] };
    const data = await resp.json();
    const errors = data.messages?.filter((m: any) => m.type === 'error').length || 0;
    const warnings = data.messages?.filter((m: any) => m.type === 'warning' || m.type === 'info').length || 0;
    return { errors, warnings, messages: data.messages || [] };
  } catch {
    return { errors: 0, warnings: 0, messages: [] };
  }
}

// ─── Mozilla Observatory ─────────────────────────────
export async function scanSecurityHeaders(hostname: string): Promise<{grade: string, score: number}> {
  try {
    // Start scan
    await fetchWithTimeout(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${hostname}`, {
      method: 'POST', body: 'hidden=true&rescan=false',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // Poll for results (scan takes a few seconds)
    await new Promise(r => setTimeout(r, 3000));
    
    const resp = await fetchWithTimeout(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${hostname}`);
    if (!resp.ok) return { grade: 'Unknown', score: 0 };
    const data = await resp.json();
    return { grade: data.grade || 'Unknown', score: data.score || 0 };
  } catch {
    return { grade: 'Unknown', score: 0 };
  }
}

// ─── Wayback Machine ────────────────────────────────
export async function getWaybackInfo(url: string): Promise<{
  snapshotCount: number, firstSeen: string | null, lastSeen: string | null
}> {
  try {
    const [firstResp, lastResp, countResp] = await Promise.all([
      fetchWithTimeout(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp&limit=1&sort=asc`),
      fetchWithTimeout(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp&limit=1&sort=desc`),
      fetchWithTimeout(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp&showNumPages=true`)
    ]);

    const first = firstResp.ok ? await firstResp.json() : null;
    const last = lastResp.ok ? await lastResp.json() : null;
    const count = countResp.ok ? await countResp.json() : 0;

    return {
      snapshotCount: typeof count === 'number' ? count : 0,
      firstSeen: first?.[1]?.[0] || null,
      lastSeen: last?.[1]?.[0] || null,
    };
  } catch {
    return { snapshotCount: 0, firstSeen: null, lastSeen: null };
  }
}

// ─── SSL Labs ───────────────────────────────────────
export async function getSSLGrade(hostname: string): Promise<{grade: string, protocol: string}> {
  try {
    const resp = await fetchWithTimeout(
      `https://api.ssllabs.com/api/v3/analyze?host=${hostname}&fromCache=on&maxAge=24`
    );
    if (!resp.ok) return { grade: 'Unknown', protocol: 'Unknown' };
    const data = await resp.json();
    const endpoint = data.endpoints?.[0];
    return {
      grade: endpoint?.grade || data.status || 'Unknown',
      protocol: endpoint?.details?.protocols?.[0]?.name || 'Unknown',
    };
  } catch {
    return { grade: 'Unknown', protocol: 'Unknown' };
  }
}
