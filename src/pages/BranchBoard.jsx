import React from "react";
import { Link, useParams } from "react-router-dom";
import Overview from "./Overview";
import "../styles/branch-board.css";

function BoardLink({ to, title, body }) {
  return (
    <Link className="bb-shortcut" to={to}>
      <strong>{title}</strong>
      <span>{body}</span>
    </Link>
  );
}

export default function BranchBoard() {
  const { orgId } = useParams();

  return (
    <div className="bb-shell">
      <section className="bb-hero">
        <div className="bb-hero-copy">
          <p className="bb-kicker">Member Area</p>
          <h1>Branch Board</h1>
          <p className="bb-lead">
            Internal updates, meetings, branch activity, documents, requests,
            and member coordination all live here.
          </p>
        </div>

        <div className="bb-actions">
          <BoardLink
            to={`/org/${orgId}/settings?tab=members`}
            title="Members"
            body="People, invites, roles, and branch access"
          />
          <BoardLink
            to={`/org/${orgId}/settings?tab=pledges`}
            title="Support and Pledges"
            body="Track offers, support, and contribution follow through"
          />
          <BoardLink
            to={`/org/${orgId}/settings?tab=newsletter`}
            title="Bulletin and Outreach"
            body="Newsletter, public updates, and outward communication"
          />
          <BoardLink
            to={`/org/${orgId}/settings`}
            title="Branch Settings"
            body="Public page settings, logo, and org configuration"
          />
        </div>
      </section>

      <section className="bb-note">
        <div className="bb-note-card">
          <strong>What this area is</strong>
          <p>
            This is the internal branch board. Use it for current branch activity,
            upcoming work, meeting awareness, and quick access to the tools people
            actually need.
          </p>
        </div>
      </section>

      <Overview />
    </div>
  );
}
