import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import { getPlatform } from "./lib/platform";

// внутри телеги надо вызвать ready()/expand() сразу, не дожидаясь первого шера
void getPlatform();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
