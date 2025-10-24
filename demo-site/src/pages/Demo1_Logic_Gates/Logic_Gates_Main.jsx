import React from "react";
import Demo from "@/components/Demo.jsx";

const SLIDE_DURATION_MS = 4000;

export default function LogicGates() {
  const slideModules = import.meta.glob("./Slides/*.jsx", { eager: true });

  const slides = Object.entries(slideModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .map(([path, module]) => ({
      id: path.split("/").pop()?.replace(".jsx", "") ?? path,
      component: module.default,
    }));

  return <Demo slides={slides} slideDuration={SLIDE_DURATION_MS} />;
}
