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


      <Overview />
    </div>
  );
}
