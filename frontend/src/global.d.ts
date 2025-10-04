declare module "dangerous-html/react" {
  import React from "react";
  interface ScriptProps {
    html: string;
  }
  const Script: React.FC<ScriptProps>;
  export default Script;
}