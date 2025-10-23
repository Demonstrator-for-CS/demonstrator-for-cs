import React from "react";
import DemoSection from "../components/DemoSection.jsx";

export default function HomePage() {
  return (
    <div>
      <header>
        <h1>CS Demonstrator</h1>
        <nav>
          <a href="#demo-1">Demo 1</a> | <a href="#demo-2">Demo 2</a>
        </nav>
        <hr />
      </header>

      <main>
        <DemoSection title="Demo 1" demoId="demo1" anchorId="demo-1" />
        <hr />
        <DemoSection title="Demo 2" demoId="demo2" anchorId="demo-2" />
      </main>
    </div>
  );
}


