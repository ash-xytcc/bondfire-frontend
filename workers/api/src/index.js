export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ ok: true, service: 'redharbor-api-skeleton' });
    }

    if (request.method === 'POST' && url.pathname === '/api/public/intake/contact') {
      const body = await request.json().catch(() => ({}));
      return json({ ok: true, received: body, next: 'Persist this into people_records' }, 201);
    }

    return json({ ok: false, error: 'Not found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
}
