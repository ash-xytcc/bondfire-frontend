import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api.js";
import { encryptWithOrgKey, getCachedOrgKey } from "../lib/zk.js";
import { decryptRows } from "../utils/decryptRow.js";

function getOrgId() {
	try {
		const m = (window.location.hash || "").match(/#\/org\/([^/]+)/);
		return m && m[1] ? decodeURIComponent(m[1]) : null;
	} catch {
		return null;
	}
}

function safeStr(v) {
	return String(v ?? "");
}

export default function Needs() {
	const params = useParams();
	const orgId = params?.orgId || getOrgId();
	const [items, setItems] = useState([]);
	const [q, setQ] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");
	const [busyZk, setBusyZk] = useState(false);
	const [zkMsg, setZkMsg] = useState("");

	const [edit, setEdit] = useState(null);

	const [form, setForm] = useState({ title: "", description: "", urgency: "", priority: 0, is_public: false });

	async function refresh() {
		if (!orgId) return;
		setLoading(true);
		setErr("");
		try {
			const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/needs`);
			const raw = Array.isArray(data.needs) ? data.needs : [];
			const orgKey = getCachedOrgKey(orgId);
			const dec = orgKey ? await decryptRows(orgKey, raw) : raw;
			// If a row was encrypted but couldn't be decrypted on this device, keep it visible.
			const out = dec.map((n) => {
				if (n?.encrypted_blob && !n?.title) return { ...n, title: "(encrypted)", description: "", urgency: "" };
				return n;
			});
			setItems(out);
		} catch (e) {
			console.error(e);
			setErr(e?.message || String(e));
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		refresh().catch(console.error);
	}, [orgId]);

	const filtered = useMemo(() => {
		const needle = q.toLowerCase();
		return items.filter((n) =>
			[safeStr(n.title), safeStr(n.description), safeStr(n.urgency), safeStr(n.status)]
				.join(" ")
				.toLowerCase()
				.includes(needle)
		);
	}, [items, q]);

	async function onAdd(e) {
		e.preventDefault();
		if (!orgId) return;
		setErr("");
		const title = safeStr(form.title).trim();
		if (!title) return;
		const description = safeStr(form.description).trim();
		const urgency = safeStr(form.urgency).trim();
		const priority = Number(form.priority) || 0;
		const is_public = !!form.is_public;

		const orgKey = getCachedOrgKey(orgId);
		let payload = { title, description, urgency, priority, is_public };
		if (orgKey && !is_public) {
			const enc = await encryptWithOrgKey(orgKey, JSON.stringify({ title, description, urgency }));
			payload = { title: "__encrypted__", description: "", urgency: "", priority, is_public, encrypted_blob: enc };
		}

		await api(`/api/orgs/${encodeURIComponent(orgId)}/needs`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		setForm({ title: "", description: "", urgency: "", priority: 0, is_public: false });
		setTimeout(() => refresh().catch(console.error), 300);
	}

	
