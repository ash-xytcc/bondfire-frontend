import { privateRequestGate } from './_lib/privateGate.js';
import { emergencyRequestGate } from './_lib/emergencyRequestGate.js';

function getOrigin(request) {
  const o = request.headers.get("origin");
  return o || "";
}

function corsHeaders(request) {
  const origin = getOrigin(request);
  // Cookie auth requires an explicit Origin (not '*') and Allow-Credentials.
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, content-type, x-csrf",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Vary": "Origin",
  };
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  // CSP tuned for this app (React inline styles are used heavily).
  // If you later remove inline styles, drop 'unsafe-inline'.
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; " +
    "script-src 'self'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; font-src 'self' data:; " +
    "connect-src 'self' https: wss:;",
  // Keep it boring.
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

export async function onRequest({ env, request, next }) {
  const CORS_HEADERS = corsHeaders(request);

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const blocked = await emergencyRequestGate({ env, request });
    const privateResponse = blocked ? null : await privateRequestGate({ env, request });
    const resp = blocked || privateResponse || await next();
    const headers = new Headers(resp.headers);
    if (/^\/api\/(?:orgs|public|p|auth)(?:\/|$)/.test(new URL(request.url).pathname)) headers.set('cache-control', 'no-store');
    for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      if (!headers.has(k)) headers.set(k, v);
    }

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers,
    });
  } catch (e) {
    // If a function throws, Cloudflare will otherwise serve HTML (1101).
    const headers = new Headers({
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    });
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);

    const detail = (e && (e.message || String(e))) || "Unknown error";
    if(detail.includes('PRIVATE_KEY_ROTATION_REQUIRED'))return new Response(JSON.stringify({ok:false,error:'PRIVATE_KEY_ROTATION_REQUIRED'}),{status:409,headers});
    return new Response(JSON.stringify({ ok: false, error: "INTERNAL", detail }), {
      status: 500,
      headers,
    });
  }
}
