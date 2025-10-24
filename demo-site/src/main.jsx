import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "./pages/HomePage.jsx";
import DemoPage from "./pages/DemoPage.jsx";
import LogicGates from "./pages/Demo1_Logic_Gates/Logic_Gates_Main.jsx";
import "./index.css";

function AnimatedRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const hasAnimated = useRef(false);

  const direction = navigationType === "POP" ? -1 : 1;
  let entryMotion = { x: 40 * direction, opacity: 0 };
  let exitMotion = { x: -40 * direction, opacity: 0 };

  if (!hasAnimated.current) {
    hasAnimated.current = true;
    entryMotion = { x: 0, opacity: 1 };
    exitMotion = { x: 0, opacity: 0 };
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition initial={entryMotion} exit={exitMotion}>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/demos/:demoId"
          element={
            <PageTransition initial={entryMotion} exit={exitMotion}>
              <DemoPage />
            </PageTransition>
          }
        />
        <Route
          path="/logic-gates"
          element={
            <PageTransition initial={entryMotion} exit={exitMotion}>
              <LogicGates />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children, initial, exit }) {
  return (
    <motion.div
      initial={initial}
      animate={{ x: 0, opacity: 1 }}
      exit={exit}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AnimatedRoutes />
  </BrowserRouter>
);
