const HCB_BASE = "https://hcb.hackclub.com";
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

  const balance = v?.balance || v?.organization?.balance || v?.data?.balance;
  if (typeof balance === "string") {
    const cleaned = balance.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n)) return Math.round(n * 100);
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

  if (amountCents === null && tx?.amount != null) {
    const n = Number(String(tx.amount).replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(n)) amountCents = Math.round(n * 100);
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

export async function onRequestGet() {
  try {
    const [orgRes, txRes] = await Promise.all([
      fetch(`${HCB_BASE}/api/v4/organizations/${ORG_ID}`, {
        headers: { "Accept": "application/json" },
      }),
      fetch(`${HCB_BASE}/api/v4/organizations/${ORG_ID}/transactions`, {
        headers: { "Accept": "application/json" },
      }),
    ]);

    const orgData = await orgRes.json().catch(() => ({}));
    const txData = await txRes.json().catch(() => ({}));

    if (!orgRes.ok && !txRes.ok) {
      return err("HCB_FETCH_FAILED", 502, {
        org_status: orgRes.status,
        tx_status: txRes.status,
      });
    }

    const balanceCents = parseBalanceCents(orgData);
    const transactions = pickArray(txData).map(normalizeTxn).slice(0, 8);

    return json({
      orgId: ORG_ID,
      balanceCents,
      transactions,
      rawStatus: {
        org: orgRes.status,
        transactions: txRes.status,
      },
    });
  } catch (e) {
    return err("HCB_FETCH_FAILED", 502, { detail: String(e?.message || e) });
  }
}
