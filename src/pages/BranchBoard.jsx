import React from "react";
import { useParams } from "react-router-dom";
import Overview from "./Overview";
import "../styles/branch-board.css";

export default function BranchBoard() {
  const { orgId } = useParams();

  return (
    <div className="bb-shell">
      <div style={{ padding: "16px 16px 4px" }}>
        <h1 style={{ margin: 0 }}>Branch Board</h1>
        <p className="helper" style={{ marginTop: 8 }}>
          Internal dashboard for branch work, records, meetings, requests, supplies, and newsletter management.
        </p>
      </div>

      <Overview key={orgId} />
    </div>
  );
}
