import React from "react";
import { ColophonWorkspace } from "colophon/workspace";
import ColophonNativeModule from "../modules/colophon/ColophonNativeModule.jsx";

export default function Colophon() {
  return <ColophonNativeModule Workspace={ColophonWorkspace} />;
}
