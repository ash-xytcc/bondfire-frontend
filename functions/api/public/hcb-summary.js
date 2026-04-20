const HCB_BASE = "https://hcb.hackclub.com";
const ORG_SLUG = "dual-power-gathering";
const ORG_ID = "org_dku3Lx";

function json(data, init = {}) {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: init.status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
      ...(init.headers || {}),
    },
  });
}

function err(message, status = 500, extra = {}) {
  return new Response(JSON.stringify({ ok: false, error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function pickArray(v) {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.transactions)) return v.transactions;
  if (Array.isArray(v?.data)) return v.data;
  if (Array.isArray(v?.items)) return v.items;
  if (Array.isArray(v?.results)) return v.results;
  return [];
}

function parseMoneyToCents(text) {
  if (text == null) return null;
  const cleaned = String(text).replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function parseBalanceCents(v) {
  const candidates = [
    v?.balance_cents,
    v?.balanceCents,
    v?.organization?.balance_cents,
    v?.organization?.balanceCents,
    v?.data?.balance_cents,
    v?.data?.balanceCents,
    v?.balance?.amount_cents,
    v?.balance?.amountCents,
  ];

  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n)) return Math.round(n);
  }

  const textCandidates = [
    v?.balance,
    v?.organization?.balance,
    v?.data?.balance,
    v?.balance?.formatted,
    v?.balance?.display,
  ];

  for (const t of textCandidates) {
    const cents = parseMoneyToCents(t);
    if (cents !== null) return cents;
  }

  return null;
}

function normalizeTxn(tx = {}) {
  const amountCentsCandidates = [
    tx?.amount_cents,
    tx?.amountCents,
    tx?.net_amount_cents,
    tx?.netAmountCents,
    tx?.total_amount_cents,
    tx?.totalAmountCents,
  ];

  let amountCents = null;
  for (const c of amountCentsCandidates) {
    const n = Number(c);
    if (Number.isFinite(n)) {
      amountCents = Math.round(n);
      break;
    }
  }

  if (amountCents === null) {
    amountCents = parseMoneyToCents(tx?.amount || tx?.display_amount || tx?.formatted_amount);
  }

  return {
    id: String(tx?.id || tx?.uuid || tx?.hcb_code || ""),
    memo: String(
      tx?.memo ||
      tx?.description ||
      tx?.name ||
      tx?.merchant_name ||
      tx?.counterparty_name ||
      tx?.display_name ||
      "Transaction"
    ),
    date: String(
      tx?.date ||
      tx?.created_at ||
      tx?.createdAt ||
      tx?.posted_at ||
      tx?.postedAt ||
      ""
    ),
    amountCents,
    amountText: String(tx?.amount || tx?.display_amount || tx?.formatted_amount || ""),
  };
}

function stripTags(s) {
  return String(s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function scrapeBalanceFromHtml(html) {
  const m = html.match(/Account balance[\s\S]{0,400}?\$[0-9,]+(?:\.[0-9]{2})?/i);
  if (!m) return null;
  const money = m[0].match(/\$[0-9,]+(?:\.[0-9]{2})?/);
  return money ? parseMoneyToCents(money[0]) : null;
}

function scrapeTransactionsFromHtml(html) {
  const recentIdx = html.search(/Recent transactions/i);
  if (recentIdx === -1) return [];

  const slice = html.slice(recentIdx, recentIdx + 12000);
  const matches = [...slice.matchAll(/>([^<>]{2,200})<[^>]*>\s*([0-9]+\s+(?:day|days|month|months|year|years)\s+ago)<[\s\S]{0,200}?(\$-?[0-9,]+(?:\.[0-9]{2})?|-[\$]?[0-9,]+(?:\.[0-9]{2})?)/gi)];

  const out = [];
  for (const m of matches) {
    const memo = stripTags(m[1]);
    const date = stripTags(m[2]);
    const amountText = stripTags(m[3]).replace(/^-(\$)/, "-$");
    if (!memo || !amountText) continue;
    out.push({
      id: `${memo}-${date}-${amountText}`,
      memo,
      date,
      amountCents: parseMoneyToCents(amountText),
      amountText,
    });
  }

  // dedupe
  const seen = new Set();
  return out.filter((x) => {
    const key = `${x.memo}|${x.date}|${x.amountText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function onRequestGet() {
  try {
    let balanceCents = null;
    let transactions = [];
    let source = "none";

    // Try likely public API shapes first
    const apiAttempts = [
      `${HCB_BASE}/api/v4/organizations/${ORG_ID}`,
      `${HCB_BASE}/api/v4/organizations/${ORG_SLUG}`,
      `${HCB_BASE}/api/v4/organizations/${ORG_ID}/transactions`,
      `${HCB_BASE}/api/v4/organizations/${ORG_SLUG}/transactions`,
      `${HCB_BASE}/api/v4/${ORG_SLUG}`,
    ];

    const apiResults = [];
    for (const url of apiAttempts) {
      try {
        const result = await fetchJson(url);
        apiResults.push({ url, status: result.res.status, data: result.data });
      } catch {}
    }

    for (const r of apiResults) {
      if (balanceCents === null) {
        const maybe = parseBalanceCents(r.data);
        if (maybe !== null) {
          balanceCents = maybe;
          source = "api";
        }
      }
      if (!transactions.length) {
        const arr = pickArray(r.data).map(normalizeTxn).filter((x) => x.memo);
        if (arr.length) {
          transactions = arr.slice(0, 8);
          source = "api";
        }
      }
    }

    // Fallback to scraping the public transparency page, which is the visible source of truth
    if (balanceCents === null || !transactions.length) {
      const pageRes = await fetch(`${HCB_BASE}/${ORG_SLUG}`, {
        headers: { "Accept": "text/html,application/xhtml+xml" },
      });
      const html = await pageRes.text();

      if (balanceCents === null) {
        const scrapedBalance = scrapeBalanceFromHtml(html);
        if (scrapedBalance !== null) {
          balanceCents = scrapedBalance;
          source = source === "api" ? source : "html";
        }
      }

      if (!transactions.length) {
        const scrapedTx = scrapeTransactionsFromHtml(html);
        if (scrapedTx.length) {
          transactions = scrapedTx;
          source = source === "api" ? source : "html";
        }
      }
    }

    if (balanceCents === null && !transactions.length) {
      return err("HCB_FETCH_FAILED", 502, { source, orgId: ORG_ID, slug: ORG_SLUG });
    }

    return json({
      orgId: ORG_ID,
      slug: ORG_SLUG,
      source,
      balanceCents,
      transactions,
    });
  } catch (e) {
    return err("HCB_FETCH_FAILED", 502, { detail: String(e?.message || e) });
  }
}
