// src/pages/SignIn.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isRedHarborMode } from "../lib/appMode";
import "../styles/redharbor.css";

function fireAuthChanged() {
	try {
		window.dispatchEvent(new Event("bf-auth-changed"));
	} catch {}
}

async function safeJson(res) {
	return res.json().catch(() => ({}));
}

function startDemo(navigate) {
	navigate("/demo");
}

export default function SignIn() {
	const navigate = useNavigate();
	const redHarborMode = isRedHarborMode();

	const [mode, setMode] = useState("login");

	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [inviteCode, setInviteCode] = useState("");

	const [mfaStep, setMfaStep] = useState(null);
	const [mfaCode, setMfaCode] = useState("");
	const [mfaRecovery, setMfaRecovery] = useState("");

	const [name, setName] = useState("");
	const [orgName, setOrgName] = useState(redHarborMode ? "IWW Red Harbor" : "Bondfire");

	const [err, setErr] = useState("");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (redHarborMode) document.body.classList.add("rh-body");
		return () => document.body.classList.remove("rh-body");
	}, [redHarborMode]);

	async function postJson(url, body) {
		const res = await fetch(url, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify(body || {}),
		});
		const data = await safeJson(res);
		return { res, data };
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setErr("");
		setBusy(true);
		try {
			const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
			const payload =
				mode === "register"
					? { email, password: pass, name, orgName }
					: { email, password: pass };

			const { res, data } = await postJson(url, payload);

			if (
				mode === "login" &&
				res.ok &&
				data?.ok &&
				data?.mfa_required &&
				data?.challenge_id
			) {
				setMfaStep({ challengeId: data.challenge_id, email });
				setBusy(false);
				return;
			}

			if (!res.ok || !data?.ok) {
				throw new Error(data?.error || (mode === "register" ? "Register failed" : "Login failed"));
			}

			const meRes = await fetch("/api/auth/me", { credentials: "include" });
			const meData = await safeJson(meRes);
			if (!meRes.ok || !meData?.ok) {
				throw new Error("SESSION_NOT_ESTABLISHED");
			}

			if (mode === "register" && data?.org?.id) {
				try {
					localStorage.setItem("bf_orgs", JSON.stringify([data.org]));
				} catch {}
				fireAuthChanged();
				navigate(`/org/${data.org.id}`, { replace: true });
				return;
			}

			const trimmedCode = String(inviteCode || "").trim().toUpperCase();
			if (trimmedCode) {
				const { res: jRes, data: jData } = await postJson("/api/invites/redeem", { code: trimmedCode });
				if (!jRes.ok || !jData?.ok) {
					throw new Error(jData?.error || "Invite code was not accepted");
				}
				if (jData?.org?.id) {
					fireAuthChanged();
					navigate(`/org/${jData.org.id}`, { replace: true });
					return;
				}
			}

			try {
				const orgsRes = await fetch("/api/orgs", { credentials: "include" });
				const orgsData = await safeJson(orgsRes);
				if (orgsRes.ok && orgsData?.ok && Array.isArray(orgsData.orgs)) {
					localStorage.setItem("bf_orgs", JSON.stringify(orgsData.orgs));
				}
			} catch {}

			fireAuthChanged();
			navigate("/orgs", { replace: true });
		} catch (e2) {
			setErr(typeof e2 === "string" ? e2 : e2?.message || "Auth failed");
		} finally {
			setBusy(false);
		}
	}

	async function handleMfaVerify(e) {
		e.preventDefault();
		setErr("");
		setBusy(true);
		try {
			const { res, data } = await postJson("/api/auth/login/mfa", {
				challenge_id: mfaStep?.challengeId,
				code: mfaCode,
				recovery_code: mfaRecovery,
			});
			if (!res.ok || !data?.ok) {
				throw new Error(data?.error || "MFA failed");
			}

			const meRes = await fetch("/api/auth/me", { credentials: "include" });
			const meData = await safeJson(meRes);
			if (!meRes.ok || !meData?.ok) {
				throw new Error("SESSION_NOT_ESTABLISHED");
			}

			try {
				const orgsRes = await fetch("/api/orgs", { credentials: "include" });
				const orgsData = await safeJson(orgsRes);
				if (orgsRes.ok && orgsData?.ok && Array.isArray(orgsData.orgs)) {
					localStorage.setItem("bf_orgs", JSON.stringify(orgsData.orgs));
				}
			} catch {}

			setMfaStep(null);
			setMfaCode("");
			setMfaRecovery("");
			fireAuthChanged();
			navigate("/orgs", { replace: true });
		} catch (e2) {
			setErr(typeof e2 === "string" ? e2 : e2?.message || "MFA failed");
		} finally {
			setBusy(false);
		}
	}

	if (!redHarborMode) {
		return (
			<div style={{ maxWidth: 520, margin: "8vh auto", padding: 16 }}>
				<h1 style={{ marginBottom: 6 }}>Welcome to Bondfire</h1>
				<p className="helper" style={{ marginTop: 0 }}>
					{mode === "login" ? "Sign in to continue." : "Create your account and your first org."}
				</p>

				<div style={{ display: "flex", gap: 8, marginTop: 12 }}>
					<button
						type="button"
						className={mode === "login" ? "btn-red" : "btn"}
						onClick={() => {
							setErr("");
							setMode("login");
						}}
						disabled={busy}
					>
						Sign in
					</button>
					<button
						type="button"
						className={mode === "register" ? "btn-red" : "btn"}
						onClick={() => {
							setErr("");
							setMode("register");
						}}
						disabled={busy}
					>
						Create account
					</button>
				</div>

				<div style={{ marginTop: 12 }}>
					<button type="button" className="btn" onClick={() => startDemo(navigate)} disabled={busy}>
						Try Demo (no account required)
					</button>
				</div>

				{err && (
					<div className="helper" style={{ color: "crimson", marginTop: 12 }}>
						{String(err)}
					</div>
				)}

				{mfaStep ? (
					<form onSubmit={handleMfaVerify} className="grid" style={{ gap: 10, marginTop: 12 }}>
						<div className="helper">
							MFA required for <b>{mfaStep.email}</b>. Enter your authenticator code or a recovery code.
						</div>

						<input
							className="input"
							type="text"
							placeholder="Authenticator code (6 digits)"
							value={mfaCode}
							onChange={(e) => setMfaCode(e.target.value)}
							autoFocus
						/>

						<input
							className="input"
							type="text"
							placeholder="Recovery code (optional)"
							value={mfaRecovery}
							onChange={(e) => setMfaRecovery(e.target.value)}
						/>

						<button className="btn-red" disabled={busy}>
							{busy ? "Verifying…" : "Verify"}
						</button>
						<button
							type="button"
							className="btn"
							disabled={busy}
							onClick={() => {
								setMfaStep(null);
								setMfaCode("");
								setMfaRecovery("");
							}}
						>
							Back
						</button>
					</form>
				) : (
					<form onSubmit={handleSubmit} className="grid" style={{ gap: 10, marginTop: 12 }}>
						{mode === "register" && (
							<>
								<input
									className="input"
									type="text"
									placeholder="Name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
								<input
									className="input"
									type="text"
									placeholder="Org name"
									value={orgName}
									onChange={(e) => setOrgName(e.target.value)}
								/>
							</>
						)}

						<input
							className="input"
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoFocus
						/>
						<input
							className="input"
							type="password"
							placeholder="Password"
							value={pass}
							onChange={(e) => setPass(e.target.value)}
						/>

						{mode === "login" && (
							<input
								className="input"
								type="text"
								placeholder="Invite code (optional)"
								value={inviteCode}
								onChange={(e) => setInviteCode(e.target.value)}
							/>
						)}

						<button className="btn-red" disabled={busy}>
							{busy ? "Working…" : mode === "register" ? "Create account" : "Sign in"}
						</button>
					</form>
				)}
			</div>
		);
	}

	return (
		<div className="rh-signin-wrap">
			<div className="rh-signin-shell">
				<div className="rh-signin-left">
					<div className="rh-signin-mark">red harbor members access</div>
					<div className="rh-signin-band">private branch workspace</div>

					<h1 className="rh-signin-title">
						Enter
						<br />
						the
						<br />
						backend
					</h1>

					<p className="rh-signin-copy">
						This is the internal side of Red Harbor. Meetings, records, documents, roles,
						and private branch operations live here. Public information belongs on the front
						door. Working information belongs behind it.
					</p>

					<div className="rh-rule" />

					<div className="rh-signin-grid">
						<div className="rh-signin-card">
							<h3>Internal Coordination</h3>
							<p>Branch operations, follow up, internal structure, and shared working context.</p>
						</div>

						<div className="rh-signin-card">
							<h3>Records and Notes</h3>
							<p>Meeting notes, documents, branch memory, and materials that should not be public.</p>
						</div>

						<div className="rh-signin-card">
							<h3>People and Roles</h3>
							<p>Members, responsibilities, permissions, and the unglamorous skeleton that keeps work moving.</p>
						</div>

						<div className="rh-signin-card">
							<h3>Private Operations</h3>
							<p>Not a public brochure, not a generic dashboard, and not something bosses need to browse.</p>
						</div>
					</div>

					<p className="rh-signin-note">
						If you just want to understand the branch, go back to the public front page. If
						you are here to work, this is the door.
					</p>

					<div className="rh-button-row">
						<a className="rh-btn" href="/?app=red-harbor#/red-harbor">
							Back to Front Door
						</a>
					</div>
				</div>

				<div className="rh-signin-right">
					<div className="rh-auth-wrap">
						<div className="rh-auth-head">
							<h1>{mfaStep ? "Verify Access" : mode === "register" ? "Create Access" : "Sign In"}</h1>
							<p>
								{mfaStep
									? "Complete multi factor verification to enter the Red Harbor backend."
									: mode === "register"
										? "Create your account and your first Red Harbor workspace."
										: "Use your account to enter the Red Harbor backend."}
							</p>
						</div>

						<div className="rh-auth-switches">
							<button
								type="button"
								className={`rh-btn ${mode === "login" ? "rh-btn-primary" : ""}`}
								onClick={() => {
									setErr("");
									setMode("login");
								}}
								disabled={busy || !!mfaStep}
							>
								Sign In
							</button>
							<button
								type="button"
								className={`rh-btn ${mode === "register" ? "rh-btn-primary" : ""}`}
								onClick={() => {
									setErr("");
									setMode("register");
								}}
								disabled={busy || !!mfaStep}
							>
								Create Account
							</button>
							<button
								type="button"
								className="rh-btn"
								onClick={() => startDemo(navigate)}
								disabled={busy}
							>
								Try Demo
							</button>
						</div>

						{err ? <div className="rh-error">{String(err)}</div> : null}

						{mfaStep ? (
							<form onSubmit={handleMfaVerify} className="rh-auth-form">
								<input
									className="rh-input"
									type="text"
									placeholder="Authenticator code"
									value={mfaCode}
									onChange={(e) => setMfaCode(e.target.value)}
									autoFocus
								/>

								<input
									className="rh-input"
									type="text"
									placeholder="Recovery code optional"
									value={mfaRecovery}
									onChange={(e) => setMfaRecovery(e.target.value)}
								/>

								<div className="rh-auth-actions">
									<button className="rh-btn rh-btn-primary" disabled={busy}>
										{busy ? "Verifying…" : "Verify Access"}
									</button>
									<button
										type="button"
										className="rh-btn"
										disabled={busy}
										onClick={() => {
											setMfaStep(null);
											setMfaCode("");
											setMfaRecovery("");
										}}
									>
										Back
									</button>
								</div>
							</form>
						) : (
							<form onSubmit={handleSubmit} className="rh-auth-form">
								{mode === "register" ? (
									<>
										<input
											className="rh-input"
											type="text"
											placeholder="Name"
											value={name}
											onChange={(e) => setName(e.target.value)}
										/>
										<input
											className="rh-input"
											type="text"
											placeholder="Org name"
											value={orgName}
											onChange={(e) => setOrgName(e.target.value)}
										/>
									</>
								) : null}

								<input
									className="rh-input"
									type="email"
									placeholder="Email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									autoFocus
								/>

								<input
									className="rh-input"
									type="password"
									placeholder="Password"
									value={pass}
									onChange={(e) => setPass(e.target.value)}
								/>

								{mode === "login" ? (
									<input
										className="rh-input"
										type="text"
										placeholder="Invite code optional"
										value={inviteCode}
										onChange={(e) => setInviteCode(e.target.value)}
									/>
								) : null}

								<button className="rh-btn rh-btn-primary" disabled={busy}>
									{busy ? "Working…" : mode === "register" ? "Create Account" : "Sign In"}
								</button>
							</form>
						)}

						<div className="rh-auth-footer">
							Public side for outreach. Private side for branch work. Two doors, on purpose.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
