import React from "react";
import Controls from "./Controls.jsx";

export default function DemoSection({ title, demoId, anchorId }) {
  return (
    <section id={anchorId}>
      <h2>{title}</h2>

      <div>
        <h3>Stage</h3>
        <div style={{width: 960, height: 540, border: "1px solid #000", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <span>Nothing yhet</span>
        </div>
      </div>

      <div>
        <h3>Controls</h3>
        <Controls demoId={demoId} />
      </div>
    </section>
  );
}



