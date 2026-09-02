import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import DeNAPrep from "./DeNAPrep";
import "./jobstudy.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root が見つかりません");

createRoot(container).render(
  <StrictMode>
    <DeNAPrep />
  </StrictMode>,
);
