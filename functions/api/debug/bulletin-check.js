export const onRequestGet = async ({ env }) => {
  try {
    const tableInfo = await env.BF_DB.prepare("PRAGMA table_info(bulletin_posts)").all();

    let sampleResults = [];
    let sampleError = null;

    try {
      const sample = await env.BF_DB.prepare(
        "SELECT id, org_id, title, slug, status FROM bulletin_posts LIMIT 5"
      ).all();
      sampleResults = sample?.results || [];
    } catch (err) {
      sampleError = String(err?.message || err);
    }

    let orgsResults = [];
    let orgsError = null;

    try {
      const orgs = await env.BF_DB.prepare(
        "SELECT id, slug, name FROM orgs LIMIT 10"
      ).all();
      orgsResults = orgs?.results || [];
    } catch (err) {
      orgsError = String(err?.message || err);
    }

    return Response.json({
      ok: true,
      bindingPresent: !!env.BF_DB,
      tableInfo: tableInfo?.results || [],
      sampleResults,
      sampleError,
      orgsResults,
      orgsError,
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: String(err?.message || err),
      },
      { status: 500 }
    );
  }
};
