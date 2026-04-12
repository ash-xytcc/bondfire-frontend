async function hasColumn(db, tableName, columnName) {
  const rows = await db.prepare(`PRAGMA table_info(${tableName})`).all();
  const cols = Array.isArray(rows?.results) ? rows.results : [];
  return cols.some((c) => String(c.name) === String(columnName));
}

export const onRequestGet = async ({ env }) => {
  try {
    const tableInfo = await env.BF_DB.prepare("PRAGMA table_info(bulletin_posts)").all();
    const orgsInfo = await env.BF_DB.prepare("PRAGMA table_info(orgs)").all();

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
      const orgsHaveSlug = await hasColumn(env.BF_DB, "orgs", "slug");
      const orgsHaveName = await hasColumn(env.BF_DB, "orgs", "name");

      const q = `SELECT id, ${orgsHaveSlug ? "slug" : "NULL as slug"}, ${orgsHaveName ? "name" : "NULL as name"} FROM orgs LIMIT 10`;
      const orgs = await env.BF_DB.prepare(q).all();
      orgsResults = orgs?.results || [];
    } catch (err) {
      orgsError = String(err?.message || err);
    }

    return Response.json({
      ok: true,
      bindingPresent: !!env.BF_DB,
      tableInfo: tableInfo?.results || [],
      orgsInfo: orgsInfo?.results || [],
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
